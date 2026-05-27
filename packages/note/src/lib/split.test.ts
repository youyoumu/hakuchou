import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { JSDOM } from "jsdom";
import { splitDelimitedField } from "./split";

const originalGlobals = {
  DOMParser: globalThis.DOMParser,
};

beforeAll(() => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  globalThis.DOMParser = dom.window.DOMParser;
});

afterAll(() => {
  globalThis.DOMParser = originalGlobals.DOMParser;
});

describe("splitDelimitedField", () => {
  test("splits on ascii and full-width pipes", () => {
    expect(splitDelimitedField("a|b｜c")).toEqual(["a", "b", "c"]);
  });

  test("ignores br tags and line breaks", () => {
    expect(splitDelimitedField("a<br>b\nc")).toEqual(["abc"]);
  });

  test("drops empty entries and whitespace-only parts", () => {
    expect(splitDelimitedField("a| |&nbsp;|b|")).toEqual(["a", "b"]);
  });

  test("normalizes nbsp to plain whitespace", () => {
    expect(splitDelimitedField("a&nbsp; b")).toEqual(["a b"]);
  });
});
