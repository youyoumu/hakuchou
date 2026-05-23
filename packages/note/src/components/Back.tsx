import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import Sentence from "./Sentence";
import { Definition } from "./Definition";
import { Expression } from "./Expression";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <Expression />
      <Definition />
      <Sentence />
    </>
  );
}
