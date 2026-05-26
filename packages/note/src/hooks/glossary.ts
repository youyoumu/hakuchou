import { parseToDoc } from "#/lib/dom";
import { isServer } from "solid-js/web";

function isSvg(src: string | null) {
  if (!src) return false;
  const s = src.toLowerCase();
  return s.endsWith(".svg") || s.startsWith("data:image/svg+xml");
}

const defaultFilter = (img: HTMLImageElement) => {
  const src = img.getAttribute("src");
  return (
    !!src &&
    !isSvg(src) &&
    (img.height === 0 || img.height > 100) &&
    (img.width === 0 || img.width > 100) &&
    !img.closest('span[data-sc-pixiv="read-more-link"] a')
  );
};

export function useCollectGlossaryImgs() {
  function collectGlossaryImgs(glossaryHtml: string) {
    if (isServer) return [];

    const doc = parseToDoc(glossaryHtml);

    return Array.from(doc.querySelectorAll("img"))
      .filter(defaultFilter)
      .map((img) => {
        const src = img.getAttribute("src") ?? "";
        const newImg = document.createElement("img");
        newImg.setAttribute("src", src);
        return {
          src,
          html: newImg.outerHTML,
        };
      });
  }

  return collectGlossaryImgs;
}
