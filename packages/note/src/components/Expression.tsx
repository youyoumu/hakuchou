import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useKanjivg, animateKanjivgStrokes } from "#/hooks/kanjivg";
import { createMemo, Show } from "solid-js";

export function Expression(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $relationType, $card, $relationText } = useCardContext();
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

  function RelationIndicator() {
    return (
      <Show when={$relationType() === "rui" || $relationType() === "tai"}>
        <div
          class="absolute top-4 left-4 flex justify-center items-center"
          classList={{
            "text-success": $relationType() === "rui",
            "text-error": $relationType() === "tai",
          }}
        >
          {$relationText()}
        </div>
      </Show>
    );
  }

  return (
    <div class="flex justify-between gap-4">
      <div
        class="flex flex-col gap-2 items-center justify-center flex-1 p-4 bg-base-200 rounded-lg relative"
        classList={{
          "border-s-4": $cardType() === "taigigo-ruigigo",
          "border-success": $relationType() === "rui",
          "border-error": $relationType() === "tai",
          hidden: $card.side === "back",
        }}
      >
        <RelationIndicator />
        <div
          class="vertical-rl underline-offset-4 leading-22 tracking-[0.2em] text-7xl"
          innerHTML={$expression()}
        ></div>
      </div>

      <div
        class="flex-1 bg-base-200 p-4 rounded-lg justify-center flex relative"
        classList={{
          "border-s-4": $cardType() === "taigigo-ruigigo",
          "border-success": $relationType() === "rui",
          "border-error": $relationType() === "tai",
          hidden: $card.side === "front",
        }}
      >
        <RelationIndicator />
        <div class="flex flex-col items-center justify-center w-24" on:click={handleKanjivgClick}>
          {$svgs()}
        </div>
      </div>
    </div>
  );
}
