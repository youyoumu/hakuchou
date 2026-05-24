import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useKanjiTooltipContext } from "#/contexts/KanjiTooltipContext";
import { animateKanjivgStrokes, useKanjivg } from "#/hooks/kanjivg";
import { useSentences } from "#/hooks/sentence";
import { constant } from "#/lib/constant";
import { parseToDoc } from "#/lib/dom";
import { hiraganaToKatakana } from "#/lib/kana";
import { createEffect, createMemo, onCleanup } from "solid-js";

export function VerticalSentence() {
  const { $ankiFields } = useAnkiFieldContext<"front">();
  const { $cardType, $card } = useCardContext();
  const { onInactive, onActive } = useKanjiTooltipContext();
  let sentenceRef: HTMLDivElement | undefined;

  const { $currentPage } = useSentences(() => $ankiFields.Sentence, {
    initialIndex: (length) => {
      if ($card.side === "front") {
        const randomIndex = Math.floor(Math.random() * length);
        sessionStorage.setItem(constant.key["hakuchou-sentence-index"], randomIndex.toString());
        return randomIndex;
      } else {
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
      }
    },
  });

  const $kanjiText = createMemo(() => {
    if ($card.side !== "back") return "";

    const currentPage = $currentPage();
    if (!currentPage) return "";

    const doc = parseToDoc(currentPage.html);
    return Array.from(doc.querySelectorAll("b"))
      .map((el) => el.textContent ?? "")
      .join("");
  });

  const { $svgs } = useKanjivg($kanjiText);

  const $sentence = createMemo(() => {
    const currentPage = $currentPage();
    if (!currentPage) return "";
    const doc = parseToDoc(currentPage.html);
    if ($cardType() === "kakitori") {
      const els = doc.querySelectorAll("b");
      if ($card.side === "front") {
        for (const el of els) {
          el.innerHTML = hiraganaToKatakana($ankiFields.ExpressionReading);
          el.classList.add("underline", "text-base-content-primary");
        }
      } else {
        const svgs = $svgs();

        for (const el of els) {
          const text = el.textContent ?? "";
          const fragment = doc.createDocumentFragment();

          for (const char of Array.from(text)) {
            const entry = svgs.find((svgEntry) => svgEntry.char === char);
            if (entry) {
              const clonedSvg = entry.svg.cloneNode(true);
              if (clonedSvg instanceof SVGSVGElement) {
                clonedSvg.setAttribute("data-kanjivg-svg", "");
                clonedSvg.setAttribute("data-kanji", char);
              }
              fragment.append(clonedSvg);
            } else {
              fragment.append(char);
            }
          }

          el.replaceWith(fragment);
        }
      }
    }
    return doc.body.innerHTML;
  });

  createEffect(() => {
    $sentence();

    const root = sentenceRef;
    if (!root) return;

    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>("[data-kanjivg-svg]"));
    const cleanups: Array<() => void> = [];

    for (const svg of svgs) {
      const kanji = svg.getAttribute("data-kanji") ?? svg.textContent ?? "";
      svg.setAttribute("tabindex", "0");

      const handleClick = (event: MouseEvent) => {
        animateKanjivgStrokes(event.currentTarget as SVGSVGElement);
      };

      const handleActive = (event: MouseEvent | TouchEvent | FocusEvent) => {
        onActive(event, kanji);
      };

      svg.addEventListener("click", handleClick);
      svg.addEventListener("mouseenter", handleActive);
      svg.addEventListener("mouseleave", onInactive);
      svg.addEventListener("focus", handleActive);
      svg.addEventListener("blur", onInactive);
      svg.addEventListener("touchstart", handleActive);

      cleanups.push(() => {
        svg.removeEventListener("click", handleClick);
        svg.removeEventListener("mouseenter", handleActive);
        svg.removeEventListener("mouseleave", onInactive);
        svg.removeEventListener("focus", handleActive);
        svg.removeEventListener("blur", onInactive);
        svg.removeEventListener("touchstart", handleActive);
      });
    }

    onCleanup(() => {
      cleanups.forEach((cleanup) => cleanup());
    });
  });

  return (
    <div
      class="flex flex-col justify-start items-end max-h-[80vh] bg-base-200 p-4 rounded-lg flex-1"
      classList={{
        "pe-6": $card.side === "front",
      }}
    >
      <div
        ref={(el) => {
          sentenceRef = el;
        }}
        class="text-5xl vertical-rl underline-offset-4 leading-12 tracking-widest"
        innerHTML={$sentence()}
      ></div>
    </div>
  );
}
