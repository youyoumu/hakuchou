import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Definition } from "./Definition";
import { Expression } from "./Expression";
import { VerticalSentence } from "./VerticalSentence";

export function Front() {
  const { $ankiFields } = useAnkiFieldContext<"front">();
  const { $cardType } = useCardContext();

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <div class="flex flex-col gap-2">
        <div class="flex justify-end text-base min-h-lh"></div>
        <Show when={$cardType() === "kakitori"}>
          <div class="flex flex-col items-end">
            <div class="min-h-lh text-sm mb-1"></div>
            <VerticalSentence />
          </div>
        </Show>

        <Show when={$cardType() === "kotowaza-yojijukugo"}>
          <Definition type={1} />
        </Show>

        <Show when={$cardType() === "taigigo-ruigigo"}>
          <div class="flex flex-col items-end">
            <div class="min-h-lh text-sm mb-1"></div>
            <Expression type={1} />
          </div>
        </Show>
      </div>
    </>
  );
}
