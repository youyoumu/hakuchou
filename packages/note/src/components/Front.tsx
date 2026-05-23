import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useSentences } from "#/hooks/sentence";
import { constant } from "#/lib/constant";
import { parseToDoc } from "#/lib/dom";
import { hiraganaToKatakana } from "#/lib/kana";
import { createMemo, onMount } from "solid-js";
import { unwrap } from "solid-js/store";

export function Front() {
  const { $ankiFields } = useAnkiFieldContext<"front">();

  const { $currentPage } = useSentences(() => $ankiFields.Sentence, {
    initialIndex: (length) => {
      const randomIndex = Math.floor(Math.random() * length);
      sessionStorage.setItem(constant.key["hakuchou-sentence-index"], randomIndex.toString());
      return randomIndex;
    },
  });

  const $sentence = createMemo(() => {
    const doc = parseToDoc($currentPage().html);
    const els = doc.querySelectorAll("b");
    for (const el of els) {
      el.innerHTML = hiraganaToKatakana($ankiFields.ExpressionReading);
      el.classList.add("underline", "text-base-content-primary");
    }
    return doc.body.innerHTML;
  });

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <div class="flex flex-col justify-center items-center max-h-[60vh] bg-base-200 p-4 rounded-lg">
        <div
          class="text-4xl vertical-rl underline-offset-4 leading-12 tracking-widest"
          innerHTML={$sentence()}
        ></div>
      </div>
    </>
  );
}
