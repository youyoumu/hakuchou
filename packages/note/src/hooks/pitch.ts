import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { parseToDoc } from "#/lib/dom";
import { unique } from "#/lib/es";
import { hatsuon } from "#/lib/hatsuon";
import { pitchTypes, type PitchType } from "#/lib/types";
import { createMemo } from "solid-js";

function extractPitchNumbers(html: string) {
  if (!html) return [];
  const pitchPositionDoc = parseToDoc(html);
  let text = pitchPositionDoc.body.textContent || "";

  // Normalize full-width numbers to half-width
  text = text.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  const matches = text.match(/\d+/g);
  if (!matches) return [];

  const numbers = matches
    .map(Number)
    // Pitch accents are usually small (0-20).
    // This helps ignore things like years (2024) in the text.
    .filter((n) => n < 50);

  return unique(numbers);
}

export function usePitch(props: { type: 1 | 2 }) {
  const { $ankiFields } = useAnkiFieldContext<"back">();

  const $pitchPosition = createMemo(() =>
    props.type === 1 ? $ankiFields.PitchPosition : $ankiFields.PitchPosition2,
  );
  const $reading = createMemo(() =>
    props.type === 1 ? $ankiFields.Expression : $ankiFields.Expression2,
  );
  const $pitchNumbers = createMemo(() => extractPitchNumbers($pitchPosition()));

  const $pitchInfos = createMemo(() => {
    const numbers = $pitchNumbers();
    const reading = $reading();
    if (!numbers.length) return [];
    const pitchCategories = $ankiFields.PitchCategories.split(",").map((s) => {
      let pitchCategory: string | null = s.trim().toLowerCase();
      if (pitchCategory === "平板") pitchCategory = "heiban";
      if (pitchCategory === "頭高") pitchCategory = "atamadaka";
      if (pitchCategory === "中高") pitchCategory = "nakadaka";
      if (pitchCategory === "尾高") pitchCategory = "odaka";
      if (pitchCategory === "起伏") pitchCategory = "kifuku";
      if (!pitchTypes.includes(pitchCategory as PitchType)) pitchCategory = null;
      return pitchCategory;
    });
    return numbers.map((pitchNum, i) => {
      const result = hatsuon({ reading, pitchNum, locale: "EN" });
      if (pitchCategories.length === numbers.length && pitchCategories[i] === "kifuku") {
        result.patternName = pitchCategories[i] ?? result.patternName;
      }
      return result;
    });
  });

  const $pitchType = createMemo(() => {
    const info = $pitchInfos()[0];
    if (!info) return undefined;
    return info.patternName as PitchType;
  });

  return {
    $pitchInfos,
    $pitchType,
  };
}
