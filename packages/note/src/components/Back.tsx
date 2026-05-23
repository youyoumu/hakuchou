import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import type { DatasetProp } from "#/lib/config";
import { isHtmlEffectivelyEmpty, parseToDoc } from "#/lib/dom";
import { createEffect, createMemo, createSignal, For, onCleanup, onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import Sentence from "./Sentence";

function extractUnicodePoints(expression: string) {
  const text = parseToDoc(expression).body.textContent?.replace(/\u00a0/g, "") ?? "";

  return Array.from(text)
    .map((char) => char.codePointAt(0))
    .filter((codePoint): codePoint is number => typeof codePoint === "number")
    .map((codePoint) => codePoint.toString(16).padStart(5, "0"));
}

function colorKanjiSvg(svg: SVGSVGElement) {
  const strokePaths = Array.from(
    svg.querySelectorAll<SVGPathElement>('g[id^="kvg:StrokePaths_"] path'),
  );
  const total = strokePaths.length;

  if (total > 0) {
    strokePaths.forEach((path, index) => {
      const progress = total === 1 ? 1 : index / (total - 1);
      const hue = 220 - progress * 160;
      const lightness = 38 + progress * 18;
      path.setAttribute("stroke", `hsl(${hue} 84% ${lightness}%)`);
    });
  }

  const strokeNumbers = Array.from(
    svg.querySelectorAll<SVGTextElement>('g[id^="kvg:StrokeNumbers_"] text'),
  );

  if (strokeNumbers.length > 0) {
    strokeNumbers.forEach((text, index) => {
      const progress = strokeNumbers.length === 1 ? 1 : index / (strokeNumbers.length - 1);
      const hue = 220 - progress * 160;
      const lightness = 32 + progress * 20;
      text.setAttribute("fill", `hsl(${hue} 84% ${lightness}%)`);
      text.setAttribute("font-weight", "700");
      text.style.pointerEvents = "none";
    });
  }

  svg.querySelectorAll<SVGGElement>('g[id^="kvg:StrokeNumbers_"]').forEach((group) => {
    group.style.pointerEvents = "none";
  });

  svg.setAttribute("style", "width: 100%; height: auto; display: block;");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return svg;
}

async function loadKanjiSvg(unicode: string, signal?: AbortSignal) {
  const res = await fetch(`/_kanjivg_${unicode}.svg`, { signal });
  if (!res.ok) return null;

  const svgText = await res.text();
  const doc = new DOMParser().parseFromString(svgText, "text/html");
  const svg = doc.querySelector("svg");
  if (!svg) return null;

  const host = document.createElement("div");
  host.innerHTML = svg.outerHTML;
  const renderedSvg = host.firstElementChild;
  if (!(renderedSvg instanceof SVGSVGElement)) return null;

  renderedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  renderedSvg.setAttribute("xmlns:kvg", "http://kanjivg.tagaini.net");

  return colorKanjiSvg(renderedSvg);
}

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const [$kanjivgRef, $setKanjivgRef] = createSignal<HTMLDivElement>();

  const $pages = createMemo(() => {
    const p: { name: string; html: string }[] = [];
    const userNotes = !isHtmlEffectivelyEmpty($ankiFields.UserNotes) ? $ankiFields.UserNotes : "";
    const glossary = !isHtmlEffectivelyEmpty($ankiFields.Glossary) ? $ankiFields.Glossary : "";

    if (userNotes) {
      p.push({ name: "Selection Text", html: userNotes });
    }

    if (glossary) {
      const doc = parseToDoc(glossary);
      const entries = doc.querySelectorAll("li[data-dictionary]");
      if (entries.length > 0) {
        const styles = Array.from(doc.querySelectorAll("style"))
          .map((s) => s.outerHTML)
          .join("");
        const dictGroups = new Map<string, string>();
        for (const li of entries) {
          const dictName = li.getAttribute("data-dictionary") || "Glossary";
          const prevHtml = dictGroups.get(dictName);
          const divider = prevHtml ? '<div class="divider"></div>' : "";
          dictGroups.set(dictName, (prevHtml || "") + divider + li.outerHTML);
        }
        for (const [name, html] of dictGroups) {
          p.push({
            name: name,
            html: `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
          });
        }
      } else {
        p.push({ name: "Glossary", html: glossary });
      }
    }
    return p;
  });

  const [$definitionIndex, $setDefinitionIndex] = createSignal(0);
  const $currentPage = createMemo(() => $pages()[$definitionIndex()]);
  const [$modalRef, $setModalRef] = createSignal<HTMLDialogElement>();
  const [$definitionRef, $setDefinitionRef] = createSignal<HTMLDivElement>();

  function changePage(direction: 1 | -1) {
    if ($pages().length === 0) return;
    $setDefinitionIndex((prev) => (prev + direction + $pages().length) % $pages().length);
  }

  const $definitionDataset = createMemo<DatasetProp>(() => ({
    "data-dictionary": $currentPage()?.name,
  }));

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  createEffect(() => {
    const container = $kanjivgRef();
    if (!container) return;

    const controller = new AbortController();
    onCleanup(() => controller.abort());

    (async () => {
      const unicodePoints = extractUnicodePoints($ankiFields.Expression);
      if (unicodePoints.length === 0) {
        container.replaceChildren();
        return;
      }

      const localCache = new Map<string, Promise<SVGSVGElement | null>>();
      const loadCached = (unicode: string) => {
        const cached = localCache.get(unicode);
        if (cached) return cached;

        const promise = loadKanjiSvg(unicode, controller.signal).catch((err) => {
          if (controller.signal.aborted) return null;
          throw err;
        });
        localCache.set(unicode, promise);
        return promise;
      };

      const svgs = await Promise.all(unicodePoints.map((unicode) => loadCached(unicode)));
      if (controller.signal.aborted) return;

      console.log("DEBUG[2084]: svgs=", svgs[0]?.innerHTML);

      container.replaceChildren(
        ...svgs
          .filter((svg): svg is SVGSVGElement => svg !== null)
          .map((svg) => svg.cloneNode(true)),
      );
    })().catch((err) => {
      if (!controller.signal.aborted) {
        console.error("❌ Failed to load KanjiVG:", err);
      }
    });
  });

  return (
    <>
      <div class="flex flex-col gap-2 items-center justify-center max-h-[60vh]">
        <div
          class="text-7xl vertical-rl underline-offset-4 leading-12"
          innerHTML={$ankiFields.Expression}
        ></div>
        <div
          class="flex flex-wrap items-center justify-center gap-2 max-w-full overflow-x-auto py-2"
          ref={$setKanjivgRef}
        ></div>
      </div>

      {$pages().length > 0 && (
        <div class="animate-fade-in" {...$definitionDataset()}>
          {$pages().length > 1 && (
            <div
              class="flex justify-between text-base-content-calm text-sm cursor-pointer hover:text-base-content transition-colors mb-1 tappable"
              on:click={() => $modalRef()?.showModal()}
              on:touchend={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  color: "var(--dictionary-color, var(--color-base-content-calm)",
                }}
              >
                {$currentPage()?.name}
              </div>
              <div class="text-base-content-soft">{`${$definitionIndex() + 1}/${$pages().length}`}</div>
            </div>
          )}
          <div
            class="relative bg-base-200 p-4 border-s-4 text-base sm:text-xl rounded-lg definition-field"
            style={{
              "border-color": "var(--dictionary-color, var(--color-primary)",
            }}
          >
            <div class="overflow-auto" ref={$setDefinitionRef}>
              {/* <DefinitionPictureSection */}
              {/*   onDefinitionPictureClick={props.onDefinitionPictureClick} */}
              {/*   currentHtml={currentPage()?.html} */}
              {/* /> */}
              <div class="contents" innerHTML={$currentPage()?.html}></div>
            </div>
            {$pages().length > 1 && (
              <div class="absolute inset-y-0 left-0 right-0 flex justify-between pointer-events-none">
                <button
                  type="button"
                  class="h-full w-6 hover:bg-base-content/10 cursor-pointer pointer-events-auto transition-colors rounded-l-lg"
                  on:click={() => changePage(-1)}
                  on:touchend={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  class="h-full w-6 hover:bg-base-content/10 cursor-pointer pointer-events-auto transition-colors rounded-r-lg"
                  on:click={() => changePage(1)}
                  on:touchend={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <div class="flex justify-end py-2 gap-2">{/* <ExternalLinks /> */}</div>
        </div>
      )}

      <Sentence />

      <dialog class="modal" ref={$setModalRef}>
        <div class="modal-box max-w-sm max-h-[80svh] flex flex-col p-4 gap-2">
          <h3 class="font-bold text-lg px-2 text-center">Select Page</h3>
          <div class="flex flex-col gap-1 overflow-auto p-2">
            <For each={$pages()}>
              {(page, i) => (
                <button
                  type="button"
                  class="btn btn-ghost btn-sm justify-start font-normal text-left"
                  classList={{ "btn-active": i() === $definitionIndex() }}
                  on:click={() => {
                    $setDefinitionIndex(i());
                    $modalRef()?.close();
                  }}
                  on:touchend={(e) => e.stopPropagation()}
                >
                  <span class="truncate">
                    {i() + 1}. {page.name}
                  </span>
                </button>
              )}
            </For>
          </div>
          <div class="modal-action mt-2">
            <form method="dialog">
              <button class="btn btn-sm" on:touchend={(e) => e.stopPropagation()}>
                Close
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button on:touchend={(e) => e.stopPropagation()}>Close</button>
        </form>
      </dialog>
    </>
  );
}
