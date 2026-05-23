import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";

export default function Sentence() {
  const { $ankiFields } = useAnkiFieldContext<"back">();

  //TODO: pitch color
  // const expressionPitchDataset = () => ({
  //   "data-pitch-type": $card.pitch.type,
  // });
  //
  return <div class={`text-2xl sm:text-4xl sentence-field`} innerHTML={$ankiFields.Sentence}></div>;
}
