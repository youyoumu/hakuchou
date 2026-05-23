import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import type { DatasetProp } from "#/lib/config";
import { isHtmlEffectivelyEmpty, parseToDoc } from "#/lib/dom";
import { createMemo, createSignal, For, Show, type Component } from "solid-js";

function censorTermsInHtml(html: string, terms: string[]) {
  const normalizedTerms = terms.filter((term) => term.trim().length > 0);
  if (!html || normalizedTerms.length === 0) return html;

  const doc = parseToDoc(html);
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.nodeValue;
    if (!text) continue;

    const parent = node.parentElement;
    if (parent?.closest("script,style,template")) continue;

    const matches = normalizedTerms
      .map((term) => ({ term, index: text.indexOf(term) }))
      .filter((match) => match.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (matches.length === 0) continue;

    const fragment = doc.createDocumentFragment();
    let cursor = 0;

    for (const { term, index } of matches) {
      if (index < cursor) continue;

      if (index > cursor) {
        fragment.append(text.slice(cursor, index));
      }

      const redactionGroup = doc.createElement("span");
      redactionGroup.setAttribute(
        "style",
        "display:inline-flex;gap:0.1em;vertical-align:baseline;user-select:none;",
      );

      for (const char of term) {
        const redaction = doc.createElement("span");
        redaction.setAttribute(
          "style",
          "display:inline-block;background:var(--color-neutral);color:var(--color-neutral);line-height:1;border-radius:0.2em;padding:0 0em;min-width:0.6em;text-align:center;",
        );
        redaction.textContent = char;
        redactionGroup.append(redaction);
      }

      fragment.append(redactionGroup);

      cursor = index + term.length;
    }

    if (cursor < text.length) {
      fragment.append(text.slice(cursor));
    }

    node.parentNode?.replaceChild(fragment, node);
  }

  return doc.body.innerHTML;
}

export function Definition(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType } = useCardContext();
  const $variant = createMemo(() => props.type);
  const $isKotowazaYojijukugo = createMemo(() => $cardType() === "kotowaza-yojijukugo");
  const $expression = createMemo(() =>
    $variant() === 1 ? $ankiFields.Expression : $ankiFields.Expression2,
  );
  const $expressionReading = createMemo(() =>
    $variant() === 1 ? $ankiFields.ExpressionReading : $ankiFields.ExpressionReading2,
  );
  const $userNotes = createMemo(() =>
    $variant() === 1 ? $ankiFields.UserNotes : $ankiFields.UserNotes2,
  );
  const $glossary = createMemo(() =>
    $variant() === 1 ? $ankiFields.Glossary : $ankiFields.Glossary2,
  );

  const $pages = createMemo(() => {
    const p: { name: string; html: string }[] = [];
    const userNotesHtml = $userNotes();
    const glossaryHtml = $glossary();
    const userNotes = !isHtmlEffectivelyEmpty(userNotesHtml) ? userNotesHtml : "";
    const glossary = !isHtmlEffectivelyEmpty(glossaryHtml) ? glossaryHtml : "";

    if (userNotes) {
      p.push({
        name: "Selection Text",
        html: $isKotowazaYojijukugo()
          ? censorTermsInHtml(userNotes, [$expression(), $expressionReading()])
          : userNotes,
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
          const prevHtml = dictGroups.get(dictName);
          const divider = prevHtml ? '<div class="divider"></div>' : "";
          dictGroups.set(dictName, (prevHtml || "") + divider + li.outerHTML);
        }
        for (const [name, html] of dictGroups) {
          p.push({
            name: name,
            html: $isKotowazaYojijukugo()
              ? censorTermsInHtml(
                  `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
                  [$expression(), $expressionReading()],
                )
              : `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
          });
        }
      } else {
        p.push({
          name: "Glossary",
          html: $isKotowazaYojijukugo()
            ? censorTermsInHtml(glossary, [$expression(), $expressionReading()])
            : glossary,
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
      <div {...$definitionDataset()}>
        <Show when={$pages().length > 1}>
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
        </Show>
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
