import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { createMemo, onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Sentence } from "./Sentence";
import { Definition } from "./Definition";
import { Expression } from "./Expression";
import { useCardContext } from "#/contexts/CardContext";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType, $relationType, $relationText } = useCardContext();

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <div class="flex flex-row-reverse gap-4">
        <div class="flex flex-col">
          <div class="min-h-lh text-sm mb-1"></div>
          <Expression type={1} />
        </div>
        <div class="flex-1">
          <Definition type={1} />
        </div>
      </div>
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

        <div class="flex flex-row-reverse gap-4">
          <div class="flex flex-col">
            <div class="min-h-lh text-sm mb-1"></div>
            <Expression type={2} />
          </div>
          <div class="flex-1">
            <Definition type={2} />
          </div>
        </div>
        <Sentence type={2} />
      </Show>
    </>
  );
}
