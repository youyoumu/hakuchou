import { PlayIcon } from "./Icons";
import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { useCardContext } from "#/contexts/CardContext";
import { createMemo } from "solid-js";

export function NotePlayIcon(props: { "on:click"?: () => void; color: "primary" | "secondary" }) {
  return (
    <button on:click={props["on:click"]} on:touchend={(e) => e.stopPropagation()}>
      <PlayIcon
        class="bg-primary rounded-full text-primary-content p-1 w-6 h-6 cursor-pointer"
        classList={{
          "bg-primary text-primary-content": props.color === "primary",
          "bg-secondary text-secondary-content": props.color === "secondary",
        }}
      />
    </button>
  );
}

export function AudioButtons(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $card, $setCard } = useCardContext();
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  const $expressionAudio = createMemo(() =>
    props.type === 1 ? $ankiFields.ExpressionAudio : $ankiFields.ExpressionAudio2,
  );

  const NotePlayIcons = () => {
    return (
      <>
        {$ankiFields.ExpressionAudio && (
          <NotePlayIcon
            color="primary"
            on:click={() => {
              if (props.type === 1) {
                $card.expressionAudioRef?.querySelector("a")?.click();
                $card.expressionAudioRef?.querySelector("audio")?.play();
              } else {
                $card.expressionAudio2Ref?.querySelector("a")?.click();
                $card.expressionAudio2Ref?.querySelector("audio")?.play();
              }
            }}
          ></NotePlayIcon>
        )}
      </>
    );
  };

  return (
    <>
      <div
        style={hiddenStyle}
        ref={(ref) => {
          if (props.type === 1) $setCard("expressionAudioRef", ref);
          else $setCard("expressionAudio2Ref", ref);
        }}
        innerHTML={$expressionAudio()}
      ></div>
      <NotePlayIcons />
    </>
  );
}
