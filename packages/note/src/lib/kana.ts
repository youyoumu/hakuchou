const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const HIRAGANA_ITERATION_START = 0x309d;
const HIRAGANA_ITERATION_END = 0x309f;
const KATAKANA_OFFSET = 0x60;

export function hiraganaToKatakana(value: string): string {
  return Array.from(value, (char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) return char;

    const isHiragana =
      (codePoint >= HIRAGANA_START && codePoint <= HIRAGANA_END) ||
      (codePoint >= HIRAGANA_ITERATION_START && codePoint <= HIRAGANA_ITERATION_END);

    if (!isHiragana) return char;

    return String.fromCodePoint(codePoint + KATAKANA_OFFSET);
  }).join("");
}

export function extractKanji(str: string): string[] {
  // Match all CJK Unified Ideographs (Kanji range)
  const matches = str.match(/\p{Script=Han}/gu);
  return matches ? Array.from(new Set(matches)) : [];
}
