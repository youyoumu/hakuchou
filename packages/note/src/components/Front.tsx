import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { useSentences } from "#/hooks/sentence";
import { constant } from "#/lib/constant";
import { parseToDoc } from "#/lib/dom";
import { hiraganaToKatakana } from "#/lib/kana";
import { createMemo, onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Definition } from "./Definition";

export function Front() {
  const { $ankiFields } = useAnkiFieldContext<"front">();
  const { $cardType } = useCardContext();

  const { $currentPage } = useSentences(() => $ankiFields.Sentence, {
    initialIndex: (length) => {
      const randomIndex = Math.floor(Math.random() * length);
      sessionStorage.setItem(constant.key["hakuchou-sentence-index"], randomIndex.toString());
      return randomIndex;
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

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <Show when={$cardType() === "kakitori"}>
        <div class="flex flex-col justify-center items-center max-h-[60vh] bg-base-200 p-4 rounded-lg">
          <div
            class="text-4xl vertical-rl underline-offset-4 leading-12 tracking-widest"
            innerHTML={$sentence()}
          ></div>
        </div>
      </Show>

      <Show when={$cardType() === "kotowaza-yojijukugo"}>
        <Definition />
      </Show>
    </>
  );
}
