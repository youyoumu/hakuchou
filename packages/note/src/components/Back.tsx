import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import type { DatasetProp } from "#/lib/config";
import { isHtmlEffectivelyEmpty, parseToDoc } from "#/lib/dom";
import { createMemo, createSignal, For, onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import Sentence from "./Sentence";
import { animateKanjivgStrokes, useKanjivg } from "#/hooks/kanjivg";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $svgs } = useKanjivg(() => $ankiFields.Expression);

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

  function handleKanjivgClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const svg = event.target.closest("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    animateKanjivgStrokes(svg);
  }

  const $definitionDataset = createMemo<DatasetProp>(() => ({
    "data-dictionary": $currentPage()?.name,
  }));

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <div class="flex justify-between gap-4">
        <div class="flex flex-col gap-2 items-center justify-center flex-1 p-4 bg-base-200 rounded-lg">
          <div
            class="text-7xl vertical-rl underline-offset-4 leading-12 tracking-widest"
            innerHTML={$ankiFields.Expression}
          ></div>
        </div>

        <div
          class="flex flex-col items-center justify-center gap-1 bg-base-200 p-4 rounded-lg w-40"
          on:click={handleKanjivgClick}
        >
          {$svgs()}
        </div>
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
