import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useKanjivg, animateKanjivgStrokes } from "#/hooks/kanjivg";
import { createMemo } from "solid-js";

export function Expression(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $relationType, $card } = useCardContext();
  const $expression = createMemo(() =>
    props.type === 1 ? $ankiFields.Expression : $ankiFields.Expression2,
  );
  const { $svgs } = useKanjivg(() => $expression());

  function handleKanjivgClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const svg = event.target.closest("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    animateKanjivgStrokes(svg);
  }

  return (
    <div class="flex justify-between gap-4">
      <div
        class="flex flex-col gap-2 items-center justify-center flex-1 p-4 bg-base-200 rounded-lg"
        classList={{
          "border-s-4": $cardType() === "taigigo-ruigigo",
          "border-success": $relationType() === "rui",
          "border-error": $relationType() === "tai",
          hidden: $card.side === "back",
        }}
      >
        <div
          class="vertical-rl underline-offset-4 leading-22 tracking-[0.2em] text-7xl"
          innerHTML={$expression()}
        ></div>
      </div>

      <div
        class="flex-1 bg-base-200 p-4 rounded-lg justify-center flex"
        classList={{
          "border-s-4": $cardType() === "taigigo-ruigigo",
          "border-success": $relationType() === "rui",
          "border-error": $relationType() === "tai",
          hidden: $card.side === "front",
        }}
      >
        <div class="flex flex-col items-center justify-center w-24" on:click={handleKanjivgClick}>
          {$svgs()}
        </div>
      </div>
    </div>
  );
}
