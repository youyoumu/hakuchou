import { parseToDoc } from "./dom";

function normalizeDelimitedField(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "")
    .replace(/[\r\n]+/g, "")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/｜/g, "|");
}

export function splitDelimitedField(value: string) {
  const normalized = normalizeDelimitedField(value);
  const text = parseToDoc(normalized).body.textContent?.replace(/\u00a0/g, " ") ?? "";

  return text
    .split("|")
    .map((item) =>
      item
        .replace(/\u00a0/g, " ")
        .replace(/[ \t\f\v]+/g, " ")
        .trim(),
    )
    .filter((item) => item.length > 0);
}
