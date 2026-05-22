import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { unwrap } from "solid-js/store";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();

  return (
    <>
      <div class="flex flex-col gap-2"></div>

      <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
        {JSON.stringify(unwrap($ankiFields), null, 2)}
      </pre>
    </>
  );
}
