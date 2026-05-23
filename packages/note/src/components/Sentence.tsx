import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { createMemo, createSignal } from "solid-js";

export default function Sentence() {
  const { $ankiFields } = useAnkiFieldContext<"back">();

  const $pages = createMemo(() => {
    return $ankiFields.Sentence.split("|").map((s, i) => ({ page: i + 1, html: s }));
  });

  const [$definitionIndex, $setDefinitionIndex] = createSignal(0);
  const $currentPage = createMemo(() => $pages()[$definitionIndex()]);

  function changePage(direction: 1 | -1) {
    if ($pages().length === 0) return;
    $setDefinitionIndex((prev) => (prev + direction + $pages().length) % $pages().length);
  }

  return (
    <div>
      {$pages().length > 1 && (
        <div class="flex justify-end text-base-content-calm text-sm cursor-pointer hover:text-base-content transition-colors mb-1 tappable">
          <div class="text-base-content-soft">{`${$definitionIndex() + 1}/${$pages().length}`}</div>
        </div>
      )}
      <div class="relative bg-base-200 p-4 border-s-4 text-base sm:text-xl rounded-lg">
        <div class="text-2xl sm:text-4xl sentence-field" innerHTML={$currentPage()?.html}></div>
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
    </div>
  );
}
