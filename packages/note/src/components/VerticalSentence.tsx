import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useSentences } from "#/hooks/sentence";
import { constant } from "#/lib/constant";
import { parseToDoc } from "#/lib/dom";
import { hiraganaToKatakana } from "#/lib/kana";
import { createMemo } from "solid-js";

export function VerticalSentence() {
  const { $ankiFields } = useAnkiFieldContext<"front">();
  const { $cardType, $card } = useCardContext();

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

  const $sentence = createMemo(() => {
    const currentPage = $currentPage();
    if (!currentPage) return "";
    const doc = parseToDoc(currentPage.html);
    if ($cardType() === "kakitori") {
      const els = doc.querySelectorAll("b");
      for (const el of els) {
        el.innerHTML = hiraganaToKatakana($ankiFields.ExpressionReading);
        el.classList.add("underline", "text-base-content-primary");
      }
    }
    return doc.body.innerHTML;
  });

  return (
    <div class="flex flex-col justify-center items-end max-h-[60vh] bg-base-200 p-4 rounded-lg">
      <div
        class="text-4xl vertical-rl underline-offset-4 leading-12 tracking-widest"
        innerHTML={$sentence()}
      ></div>
    </div>
  );
}
