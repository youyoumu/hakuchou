import { parseToDoc } from "#/lib/dom";
import { isServer } from "solid-js/web";

// Define dictionary rules outside the function for better performance
const DICTIONARY_RULES = {
  avifHeicOnly: new Set(["大辞泉 第二版"]),
  jpgOnly: new Set([
    "広辞苑 第七版",
    "[画像付き] 絵でわかる日本語",
    "明鏡国語辞典 第三版",
    "南山堂医学大辞典 第20版",
    "旺文社国語辞典 第十二版",
    "きっずジャポニカ 新版",
    "sukkiri.jp",
  ]),
  pngOnly: new Set([
    "大辞林 第四版",
    "ことわざ・慣用句の百科事典",
    "四字熟語の百科事典",
    "三省堂国語辞典 第八版",
    "新選国語辞典 第十版",
    "有斐閣現代心理学辞典",
    "Onomatoproject",
  ]),
};

const glossaryImagesFilter = (img: HTMLImageElement) => {
  const dictEntry = img.closest("[data-dictionary]");
  if (!dictEntry) {
    return false;
  }

  // Normalize dictionary name formatting
  const rawDictName = dictEntry.getAttribute("data-dictionary") || "";
  const dictName = rawDictName.replace(/　/g, " ").replace(/\s+/g, " ").trim();

  // Resolve original path from metadata if available
  const parentWithOriginalPath = img.closest("[data-sc-src], [data-path]");
  const originalPath = parentWithOriginalPath
    ? parentWithOriginalPath.getAttribute("data-sc-src") ||
      parentWithOriginalPath.getAttribute("data-path")
    : null;

  // Parse source URL
  const rawSrc = (originalPath || img.getAttribute("src") || "").toLowerCase();
  const cleanSrc = rawSrc.split("?")[0].split("#")[0];
  const ext = cleanSrc.includes(".") ? (cleanSrc.split(".").pop() ?? "") : "";
  const fileName = cleanSrc.split("/").pop() || "";

  // Apply dictionary-specific filtering rules
  if (dictName.startsWith("Jitendex.org")) {
    return ext === "avif";
  }

  if (DICTIONARY_RULES.avifHeicOnly.has(dictName)) {
    return ext === "avif" || ext === "heic";
  }

  if (DICTIONARY_RULES.jpgOnly.has(dictName)) {
    return ext === "jpg" || ext === "jpeg";
  }

  if (DICTIONARY_RULES.pngOnly.has(dictName)) {
    return ext === "png";
  }

  if (dictName === "語彙力・二字熟語の百科事典") {
    return ["png", "jpg", "jpeg"].includes(ext);
  }

  if (dictName === "角川新字源 改訂新版") {
    return ext === "png" && fileName.startsWith("s");
  }

  if (dictName === "小学館例解学習国語 第十二版") {
    const isStrokeOrderImg = img.naturalWidth === 142 && img.naturalHeight === 698;
    if (fileName.includes("stroke") || isStrokeOrderImg) {
      return false;
    }
    return ["png", "jpg", "jpeg", "svg"].includes(ext);
  }

  if (dictName === "旺文社 全訳古語辞典") {
    return ext === "png" && /^[\dc]/.test(fileName);
  }

  return false;
};

export function useCollectGlossaryImgs() {
  function collectGlossaryImgs(glossaryHtml: string) {
    if (isServer) return [];

    const doc = parseToDoc(glossaryHtml);

    return Array.from(doc.querySelectorAll("img"))
      .filter(glossaryImagesFilter)
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
