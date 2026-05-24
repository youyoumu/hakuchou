export function parseToDoc(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

export function isHtmlEffectivelyEmpty(html: string): boolean {
  if (!html || html.trim() === "") return true;
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Remove elements that never count as content
  doc.querySelectorAll("script, style, template").forEach((el) => {
    el.remove();
  });

  // Check for meaningful text
  const text = doc.body.textContent
    ?.replace(/\u00a0/g, "") // nbsp
    .trim();

  if (text && text.length > 0) return false;

  // Check for meaningful non-text content
  const meaningfulSelectors = ["img", "video", "audio", "svg", "iframe", "canvas"];

  return !meaningfulSelectors.some((sel) => doc.body.querySelector(sel));
}

export function censorTermsInHtml(html: string, terms: string[]) {
  const normalizedTerms = terms.filter((term) => term.trim().length > 0);
  if (!html || normalizedTerms.length === 0) return html;

  const doc = parseToDoc(html);
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.nodeValue;
    if (!text) continue;

    const parent = node.parentElement;
    if (parent?.closest("script,style,template")) continue;

    const matches = normalizedTerms
      .map((term) => ({ term, index: text.indexOf(term) }))
      .filter((match) => match.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (matches.length === 0) continue;

    const fragment = doc.createDocumentFragment();
    let cursor = 0;

    for (const { term, index } of matches) {
      if (index < cursor) continue;

      if (index > cursor) {
        fragment.append(text.slice(cursor, index));
      }

      const redactionGroup = doc.createElement("span");
      redactionGroup.setAttribute(
        "style",
        "display:inline-flex;gap:0.1em;vertical-align:baseline;user-select:none;",
      );

      for (const char of term) {
        const redaction = doc.createElement("span");
        redaction.setAttribute(
          "style",
          "display:inline-block;background:var(--color-neutral);color:var(--color-neutral);line-height:1;border-radius:0.2em;padding:0 0em;min-width:0.6em;text-align:center;",
        );
        redaction.textContent = char;
        redactionGroup.append(redaction);
      }

      fragment.append(redactionGroup);

      cursor = index + term.length;
    }

    if (cursor < text.length) {
      fragment.append(text.slice(cursor));
    }

    node.parentNode?.replaceChild(fragment, node);
  }

  return doc.body.innerHTML;
}
