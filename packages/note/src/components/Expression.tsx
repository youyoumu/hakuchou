import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useKanjiTooltipContext } from "#/contexts/KanjiTooltipContext";
import { useKanjivg, animateKanjivgStrokes } from "#/hooks/kanjivg";
import { createMemo, For, Show } from "solid-js";

export function Expression(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { onInactive, onActive } = useKanjiTooltipContext();
  const { $cardType, $relationType, $card, $relationText } = useCardContext();
  const $expression = createMemo(() =>
    props.type === 1 ? $ankiFields.Expression : $ankiFields.Expression2,
  );
  const { $svgs } = useKanjivg(() => $expression());
  const $isLong = createMemo(() => $expression().length > 8);

  function handleKanjivgClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const svg = event.target.closest("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    animateKanjivgStrokes(svg);
  }

  function RelationIndicator() {
    return (
      <Show
        when={$card.side === "front" && ($relationType() === "rui" || $relationType() === "tai")}
      >
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
    <div
      class="flex gap-4 flex-1 p-4 bg-base-200 rounded-lg relative justify-center"
      classList={{
        "border-s-4": $cardType() === "taigigo-ruigigo",
        "border-success": $relationType() === "rui",
        "border-error": $relationType() === "tai",
      }}
    >
      <RelationIndicator />
      <div
        class="vertical-rl underline-offset-4 leading-22 tracking-[0.2em] text-7xl py-2 text-nowrap"
        classList={{
          hidden: $card.side === "back",
          "text-7xl": !$isLong(),
          "text-6xl": $isLong(),
        }}
        innerHTML={$expression()}
      ></div>

      <div
        class="flex flex-col justify-start"
        classList={{
          hidden: $card.side === "front",
          "w-24": !$isLong(),
          "w-20": $isLong(),
        }}
      >
        <For each={$svgs()}>
          {(entry) => {
            return (
              <span
                on:click={handleKanjivgClick}
                on:mouseenter={(e) => onActive(e, entry.char)}
                on:mouseleave={onInactive}
                on:focus={(e) => onActive(e, entry.char)}
                on:blur={onInactive}
                on:touchstart={(e) => onActive(e, entry.char)}
              >
                {entry.svg}
              </span>
            );
          }}
        </For>
      </div>
    </div>
  );
}
