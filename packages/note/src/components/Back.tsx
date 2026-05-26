import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { onMount, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Sentence } from "./Sentence";
import { Definition } from "./Definition";
import { Expression } from "./Expression";
import { useCardContext } from "#/contexts/CardContext";
import { VerticalSentence } from "./VerticalSentence";
import { Frequency } from "./Frequency";
import { AudioButtons } from "./AudioButtons";
import Pitches from "./Pitches";
import { KanKenLevel } from "./KanKenLevel";
import PictureModal from "./PictureModal";

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
      <div class="flex flex-col gap-2">
        <div class="flex justify-between gap-2">
          <div class="flex gap-2 sm:gap-4 items-center">
            <Show when={$ankiFields.ExpressionAudio}>
              <div class="flex gap-2">
                <AudioButtons type={1} />
              </div>
            </Show>
            <div class="text-xl sm:text-2xl flex gap-2 flex-wrap">
              <Pitches type={1} />
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <KanKenLevel />
            <Frequency type={1} />
          </div>
        </div>
        <div class="flex flex-row-reverse gap-2 sm:gap-4">
          <Show when={$cardType() !== "kakitori"}>
            <Expression type={1} />
          </Show>
          <Show when={$cardType() === "kakitori"}>
            <VerticalSentence />
          </Show>
          <div class="flex-1 min-w-0">
            <Definition type={1} />
          </div>
        </div>
      </div>
      <Show when={$cardType() !== "kakitori"}>
        <Sentence type={1} />
      </Show>
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

        <div class="flex flex-col gap-2">
          <div class="flex justify-between gap-2">
            <div class="flex gap-2 sm:gap-4 items-center">
              <Show when={$ankiFields.ExpressionAudio2}>
                <div class="flex gap-2">
                  <AudioButtons type={2} />
                </div>
              </Show>
              <div class="text-xl sm:text-2xl flex gap-2 flex-wrap">
                <Pitches type={2} />
              </div>
            </div>
            <div class="flex gap-2 items-center">
              {/* <KanKenLevel /> */}
              <Frequency type={2} />
            </div>
          </div>
          <div class="flex flex-row-reverse gap-2 sm:gap-4">
            <div class="flex flex-col">
              <Expression type={2} />
            </div>
            <div class="flex-1">
              <Definition type={2} />
            </div>
          </div>
        </div>
        <Sentence type={2} />
      </Show>
      <PictureModal />
    </>
  );
}
