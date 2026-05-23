import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useKanjivg, animateKanjivgStrokes } from "#/hooks/kanjivg";
import { createMemo } from "solid-js";

export function Expression(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $relationType } = useCardContext();
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
        }}
      >
        <div
          class="text-7xl vertical-rl underline-offset-4 leading-12 tracking-widest"
          innerHTML={$expression()}
        ></div>
      </div>

      <div
        class="flex flex-col items-center justify-center gap-1 bg-base-200 p-4 rounded-lg w-40"
        on:click={handleKanjivgClick}
      >
        {$svgs()}
      </div>
    </div>
  );
}
