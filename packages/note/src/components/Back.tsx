import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { createMemo, onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Sentence } from "./Sentence";
import { Definition } from "./Definition";
import { Expression } from "./Expression";
import { useCardContext } from "#/contexts/CardContext";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $relationType } = useCardContext();

  const $relationText = createMemo(() => {
    if ($relationType() === "tai") return "対";
    if ($relationType() === "rui") return "類";
    return null;
  });

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <Expression type={1} />
      <Definition type={1} />
      <Sentence type={1} />
      <Show when={$cardType() === "taigigo-ruigigo"}>
        <div
          class="divider text-4xl"
          classList={{
            "text-success": $relationType() === "rui",
            "text-error": $relationType() === "tai",
            "divider-success": $relationType() === "rui",
            "divider-error": $relationType() === "tai",
          }}
        >
          {$relationText()}
        </div>
        <Expression type={2} />
        <Definition type={2} />
        <Sentence type={2} />
      </Show>
    </>
  );
}
