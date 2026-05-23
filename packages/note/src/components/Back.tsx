import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Sentence } from "./Sentence";
import { Definition } from "./Definition";
import { Expression } from "./Expression";
import { useCardContext } from "#/contexts/CardContext";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $cardType } = useCardContext();

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
        <div class="divider"></div>
        <Expression type={2} />
        <Definition type={2} />
        <Sentence type={2} />
      </Show>
    </>
  );
}
