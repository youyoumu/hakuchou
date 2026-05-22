import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";

export function Front() {
  const { $ankiFields } = useAnkiFieldContext();

  return (
    <>
      <div class="flex flex-col gap-2">{$ankiFields.Sentence}</div>
    </>
  );
}
