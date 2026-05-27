import { beforeAll, afterAll, describe, expect, test } from "vitest";
import { JSDOM } from "jsdom";
import { censorTermsInHtml } from "./dom";
import { extractKanji } from "./kana";

const originalGlobals = {
  DOMParser: globalThis.DOMParser,
  NodeFilter: globalThis.NodeFilter,
  document: globalThis.document,
  window: globalThis.window,
  Text: globalThis.Text,
};

beforeAll(() => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  const { window } = dom;

  globalThis.DOMParser = window.DOMParser;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.document = window.document;
  globalThis.window = window as unknown as typeof globalThis.window;
  globalThis.Text = window.Text;
});

afterAll(() => {
  globalThis.DOMParser = originalGlobals.DOMParser;
  globalThis.NodeFilter = originalGlobals.NodeFilter;
  globalThis.document = originalGlobals.document;
  globalThis.window = originalGlobals.window;
  globalThis.Text = originalGlobals.Text;
});

describe("censorTermsInHtml", () => {
  test("wraps matched terms with data attributes and masks each character", () => {
    const html = "<p>abc def</p>";

    expect(censorTermsInHtml(html, ["bc"])).toBe(
      '<p>a<span data-censor-term-group=""><span data-censor-term-char="">b</span><span data-censor-term-char="">c</span></span> def</p>',
    );
  });

  test("leaves html unchanged when there are no usable terms", () => {
    const html = "<p>abc</p>";

    expect(censorTermsInHtml(html, [" ", ""])).toBe(html);
  });

  test("skips script, style, and template contents", () => {
    const html =
      "<div>keep<script>secret</script><style>hidden</style><template>nope</template></div>";

    expect(censorTermsInHtml(html, ["secret", "hidden", "nope"])).toBe(html);
  });

  test("censors repeated matches in a text node", () => {
    const html = "<p>abc abc</p>";

    expect(censorTermsInHtml(html, ["abc"])).toBe(
      '<p><span data-censor-term-group=""><span data-censor-term-char="">a</span><span data-censor-term-char="">b</span><span data-censor-term-char="">c</span></span> <span data-censor-term-group=""><span data-censor-term-char="">a</span><span data-censor-term-char="">b</span><span data-censor-term-char="">c</span></span></p>',
    );
  });

  test("censors kanji extracted from the term in other text", () => {
    const html =
      "<p>可愛い子には旅をさせよという言葉のように、早くから、子供のやることには口を出さず自分で決めてもらっている。</p>";

    const term = "可愛い子には旅をさせよ";

    expect(censorTermsInHtml(html, [term, ...extractKanji(term)])).toBe(
      '<p><span data-censor-term-group=""><span data-censor-term-char="">可</span><span data-censor-term-char="">愛</span><span data-censor-term-char="">い</span><span data-censor-term-char="">子</span><span data-censor-term-char="">に</span><span data-censor-term-char="">は</span><span data-censor-term-char="">旅</span><span data-censor-term-char="">を</span><span data-censor-term-char="">さ</span><span data-censor-term-char="">せ</span><span data-censor-term-char="">よ</span></span>という言葉のように、早くから、<span data-censor-term-group=""><span data-censor-term-char="">子</span></span>供のやることには口を出さず自分で決めてもらっている。</p>',
    );
  });
});
