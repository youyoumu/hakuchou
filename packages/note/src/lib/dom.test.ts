import { beforeAll, afterAll, describe, expect, test } from "vitest";
import { JSDOM } from "jsdom";
import { censorTermsInHtml } from "./dom";

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
    const html = "<div>keep<script>secret</script><style>hidden</style><template>nope</template></div>";

    expect(censorTermsInHtml(html, ["secret", "hidden", "nope"])).toBe(html);
  });

  test("censors the first match in a text node and keeps the rest intact", () => {
    const html = "<p>abc abc</p>";

    expect(censorTermsInHtml(html, ["abc"])).toBe(
      '<p><span data-censor-term-group=""><span data-censor-term-char="">a</span><span data-censor-term-char="">b</span><span data-censor-term-char="">c</span></span> abc</p>',
    );
  });
});
