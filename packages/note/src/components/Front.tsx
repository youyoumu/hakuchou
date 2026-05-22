import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { parseToDoc } from "#/lib/dom";
import { createMemo } from "solid-js";
import { unwrap } from "solid-js/store";

export function Front() {
  const { $ankiFields } = useAnkiFieldContext<"front">();

  const $sentence = createMemo(() => {
    const doc = parseToDoc($ankiFields.Sentence);
    const els = doc.querySelectorAll("b");
    for (const el of els) {
      el.innerHTML = $ankiFields.ExpressionReading;
      el.classList.add("underline", "text-base-content-primary");
    }
    return doc.body.innerHTML;
  });

  return (
    <>
      <div class="flex flex-col justify-center items-center max-h-[60vh]">
        <div
          class="text-4xl vertical-rl underline-offset-4 leading-12"
          innerHTML={$sentence()}
        ></div>
      </div>
      <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
        {JSON.stringify(unwrap($ankiFields), null, 2)}
      </pre>
    </>
  );
}
