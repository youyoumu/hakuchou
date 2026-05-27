import { useKanjiTooltipContext } from "#/contexts/KanjiTooltipContext";
import { animateKanjivgStrokes, useKanjivg } from "#/hooks/kanjivg";
import { createEffect, createMemo, onCleanup } from "solid-js";

export function KanjivgText(props: { text: string }) {
  const { onInactive, onActive } = useKanjiTooltipContext();
  const $text = createMemo(() => props.text);
  const { $svgs } = useKanjivg($text);

  let rootRef: HTMLSpanElement | undefined;

  createEffect(() => {
    $text();
    $svgs();

    const root = rootRef;
    if (!root) return;

    root.textContent = "";

    const svgs = $svgs();
    const cleanups: Array<() => void> = [];

    for (const char of Array.from($text())) {
      const entry = svgs.find((svgEntry) => svgEntry.char === char);

      if (!entry) {
        root.append(char);
        continue;
      }

      const clonedSvg = entry.svg.cloneNode(true);
      if (!(clonedSvg instanceof SVGSVGElement)) {
        root.append(char);
        continue;
      }

      clonedSvg.setAttribute("data-kanji", char);
      clonedSvg.setAttribute("tabindex", "0");
      clonedSvg.setAttribute(
        "style",
        [
          "display:inline-block",
          "width:1em",
          "height:1em",
          "cursor:pointer",
          "touch-action:manipulation",
          "flex:none",
        ].join(";"),
      );

      const handleClick = (event: MouseEvent) => {
        animateKanjivgStrokes(event.currentTarget as SVGSVGElement);
      };
      const handleActive = (event: MouseEvent | TouchEvent | FocusEvent) => {
        onActive(event, char);
      };

      clonedSvg.addEventListener("click", handleClick);
      clonedSvg.addEventListener("mouseenter", handleActive);
      clonedSvg.addEventListener("mouseleave", onInactive);
      clonedSvg.addEventListener("focus", handleActive);
      clonedSvg.addEventListener("blur", onInactive);
      clonedSvg.addEventListener("touchstart", handleActive);

      cleanups.push(() => {
        clonedSvg.removeEventListener("click", handleClick);
        clonedSvg.removeEventListener("mouseenter", handleActive);
        clonedSvg.removeEventListener("mouseleave", onInactive);
        clonedSvg.removeEventListener("focus", handleActive);
        clonedSvg.removeEventListener("blur", onInactive);
        clonedSvg.removeEventListener("touchstart", handleActive);
      });

      root.append(clonedSvg);
    }

    onCleanup(() => {
      cleanups.forEach((cleanup) => cleanup());
    });
  });

  return (
    <span
      ref={(el) => {
        rootRef = el;
      }}
      class="flex flex-wrap items-baseline gap-1 align-baseline"
    ></span>
  );
}
