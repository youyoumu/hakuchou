import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import type { DatasetProp } from "#/lib/config";
import { createMemo, Show } from "solid-js";

export function KanKenLevel() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const $dataset = createMemo<DatasetProp>(() => ({
    "data-kanken-level": $ankiFields.KanKenLevel.trim(),
  }));

  return (
    <Show when={$ankiFields.KanKenLevel}>
      <div class="badge badge-sm sm:badge-md" {...$dataset()}>
        {$ankiFields.KanKenLevel.trim()}
      </div>
    </Show>
  );
}
