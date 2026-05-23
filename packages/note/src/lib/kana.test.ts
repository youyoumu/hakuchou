import { describe, expect, test } from "vitest";
import { hiraganaToKatakana } from "./kana";

describe("hiraganaToKatakana", () => {
  test("converts basic hiragana to katakana", () => {
    expect(hiraganaToKatakana("あいうえお")).toBe("アイウエオ");
  });

  test("converts mixed text and leaves non-hiragana unchanged", () => {
    expect(hiraganaToKatakana("かな123abcー!")).toBe("カナ123abcー!");
  });

  test("converts voiced, small, and iteration characters", () => {
    expect(hiraganaToKatakana("がぎぐげごゕゖゝゞ")).toBe("ガギグゲゴヵヶヽヾ");
  });

  test("leaves existing katakana unchanged", () => {
    expect(hiraganaToKatakana("アイウエオカタカナ")).toBe("アイウエオカタカナ");
  });

  test("preserves surrogate pairs and emoji", () => {
    expect(hiraganaToKatakana("こんにちは🙂")).toBe("コンニチハ🙂");
  });
});
