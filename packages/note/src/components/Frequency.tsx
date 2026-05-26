import { createMemo } from "solid-js";
import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { CircleChevronDownIcon } from "./Icons";

export function Frequency(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const $freqSort = createMemo(() =>
    props.type === 1 ? $ankiFields.FreqSort : $ankiFields.FreqSort2,
  );
  const $frequency = createMemo(() =>
    props.type === 1 ? $ankiFields.Frequency : $ankiFields.Frequency2,
  );

  return (
    <div class="flex gap-1 items-center relative hover:[&_#frequency]:block z-20">
      <div
        class="text-base-content-soft text-sm sm:text-base"
        innerHTML={$freqSort()}
        classList={{
          hidden: $freqSort() === "9999999",
        }}
      ></div>
      {$frequency() && (
        <>
          <CircleChevronDownIcon class="size-5 text-base-content-soft" />
          <div
            id="frequency"
            class="absolute top-0 translate-y-7 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-200/95 text-sm sm:text-base p-2 sm:p-4 rounded-lg border border-base-300 shadow-lg hidden text-base-content-calm"
            innerHTML={$frequency()}
          ></div>
        </>
      )}
    </div>
  );
}
