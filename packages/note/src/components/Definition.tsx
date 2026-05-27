import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import type { DatasetProp } from "#/lib/config";
import { censorTermsInHtml, isHtmlEffectivelyEmpty, parseToDoc } from "#/lib/dom";
import { extractKanji } from "#/lib/kana";
import { createMemo, createSignal, For, Show } from "solid-js";
import { KanjivgText } from "./KanjivgText";
import { Picture } from "./Picture";
import { useBreakpointContext } from "#/contexts/BreakpointContext";

export function Definition(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $card } = useCardContext();
  const bp = useBreakpointContext();
  const $variant = createMemo(() => props.type);
  const $shouldCensor = createMemo(
    () => $card.side === "front" && $cardType() === "kotowaza-yojijukugo",
  );
  const $expression = createMemo(() =>
    $variant() === 1 ? $ankiFields.Expression : $ankiFields.Expression2,
  );
  const $userNotes = createMemo(() =>
    $variant() === 1 ? $ankiFields.UserNotes : $ankiFields.UserNotes2,
  );
  const $glossary = createMemo(() =>
    $variant() === 1 ? $ankiFields.Glossary : $ankiFields.Glossary2,
  );
  const $bekkai = createMemo(() =>
    $ankiFields.Bekkai ? $ankiFields.Bekkai.split("|").map((line) => line.trim()) : [],
  );
  const $isVerticalBekkai = createMemo(() => $bekkai().length > 3 || !bp.isAtLeast("sm"));

  const $pages = createMemo(() => {
    const p: { name: string; html: string }[] = [];
    const userNotesHtml = $userNotes();
    const glossaryHtml = $glossary();
    const userNotes = !isHtmlEffectivelyEmpty(userNotesHtml) ? userNotesHtml : "";
    const glossary = !isHtmlEffectivelyEmpty(glossaryHtml) ? glossaryHtml : "";
    const censoredTerms = [$expression(), ...extractKanji($expression())];

    if (userNotes) {
      p.push({
        name: "User Notes",
        html: $shouldCensor() ? censorTermsInHtml(userNotes, censoredTerms) : userNotes,
      });
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

          const iTag = li.querySelector("i");
          if (iTag && iTag.innerText.includes(dictName)) {
            iTag.style.display = "none";
          }

          const prevHtml = dictGroups.get(dictName);
          const divider = prevHtml ? '<div class="divider"></div>' : "";
          dictGroups.set(dictName, (prevHtml || "") + divider + li.outerHTML);
        }
        for (const [name, html] of dictGroups) {
          p.push({
            name: name,
            html: $shouldCensor()
              ? censorTermsInHtml(
                  `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
                  censoredTerms,
                )
              : `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
          });
        }
      } else {
        p.push({
          name: "Glossary",
          html: $shouldCensor() ? censorTermsInHtml(glossary, censoredTerms) : glossary,
        });
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

  return (
    <Show when={$pages().length > 0}>
      <div class="flex flex-col h-full" {...$definitionDataset()}>
        <div
          class="relative bg-base-200 p-4 border-s-4 text-base sm:text-xl rounded-lg definition-field"
          style={{
            "border-color": "var(--dictionary-color, var(--color-primary)",
          }}
        >
          <div class="overflow-auto" ref={$setDefinitionRef}>
            <span
              class="cursor-pointer tappable"
              style={{
                color: "var(--dictionary-color, var(--color-base-content-calm)",
              }}
              on:click={() => $modalRef()?.showModal()}
              on:touchend={(e) => e.stopPropagation()}
            >
              {$currentPage()?.name} ({`${$definitionIndex() + 1}/${$pages().length}`})
            </span>
            <Picture type={props.type} currentHtml={$currentPage()?.html} />
            <div class="contents" innerHTML={$currentPage()?.html}></div>
            <Show when={$bekkai().length > 0 && props.type === 1}>
              <div class="collapse collapse-arrow bg-base-100 mt-2">
                <input type="checkbox" />
                <div class="collapse-title text-base-content-soft p-2 text-center">別解</div>
                <div class="collapse-content">
                  <div
                    class="flex gap-1 flex-wrap text-5xl"
                    classList={{
                      "items-center": !$isVerticalBekkai(),
                      "items-start": $isVerticalBekkai(),
                      "flex-col": $isVerticalBekkai(),
                    }}
                  >
                    <For each={$bekkai()}>
                      {(item, i) => (
                        <>
                          <KanjivgText text={item} />
                          <Show when={!$isVerticalBekkai() && i() !== $bekkai().length - 1}>
                            <div class="text-2xl text-base-content-soft">・</div>
                          </Show>
                        </>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </Show>
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
        {/* <div class="flex justify-end py-2 gap-2"> */}
        {/*   <ExternalLinks /> */}
        {/* </div> */}
      </div>
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
    </Show>
  );
}
