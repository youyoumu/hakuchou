import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useSentences } from "#/hooks/sentence";
import { constant } from "#/lib/constant";
import { Show } from "solid-js";

export default function Sentence() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $sentences, $currentPage, $index, changePage } = useSentences(
    () => $ankiFields.Sentence,
    {
      initialIndex: (length) => {
        let randomIndex: string | number | null = sessionStorage.getItem(
          constant.key["hakuchou-sentence-index"],
        );
        if (randomIndex) {
          randomIndex = parseInt(randomIndex);
        }
        if (typeof randomIndex === "number" && randomIndex >= 0 && length > randomIndex) {
          return randomIndex;
        }
        return Math.floor(Math.random() * length);
      },
    },
  );

  return (
    <Show when={$sentences().length > 0}>
      <div>
        {$sentences().length > 1 && (
          <div class="flex justify-end text-base-content-calm text-sm cursor-pointer hover:text-base-content transition-colors mb-1 tappable">
            <div class="text-base-content-soft">{`${$index() + 1}/${$sentences().length}`}</div>
          </div>
        )}
        <div class="relative bg-base-200 p-4 border-s-4 text-base sm:text-xl rounded-lg">
          <div class="text-2xl sm:text-4xl sentence-field" innerHTML={$currentPage()?.html}></div>
          {$sentences().length > 1 && (
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
    </Show>
  );
}
