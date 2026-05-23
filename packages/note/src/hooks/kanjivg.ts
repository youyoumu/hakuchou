import { parseToDoc } from "#/lib/dom";
import { createEffect, createSignal, onCleanup } from "solid-js";
import type { Accessor } from "solid-js/types/server/reactive.js";

function extractUnicodePoints(expression: string) {
  const text = parseToDoc(expression).body.textContent?.replace(/\u00a0/g, "") ?? "";

  return Array.from(text)
    .map((char) => char.codePointAt(0))
    .filter((codePoint): codePoint is number => typeof codePoint === "number")
    .map((codePoint) => codePoint.toString(16).padStart(5, "0"));
}

function colorizeKanjivg(svg: SVGSVGElement) {
  const strokePaths = Array.from(
    svg.querySelectorAll<SVGPathElement>('g[id^="kvg:StrokePaths_"] path'),
  );
  const total = strokePaths.length;

  if (total > 0) {
    strokePaths.forEach((path, index) => {
      const progress = total === 1 ? 1 : index / (total - 1);
      const hue = 220 - progress * 160;
      const lightness = 38 + progress * 18;
      path.setAttribute("stroke", `hsl(${hue} 84% ${lightness}%)`);
    });
  }

  const strokeNumbers = Array.from(
    svg.querySelectorAll<SVGTextElement>('g[id^="kvg:StrokeNumbers_"] text'),
  );

  if (strokeNumbers.length > 0) {
    strokeNumbers.forEach((text, index) => {
      const progress = strokeNumbers.length === 1 ? 1 : index / (strokeNumbers.length - 1);
      const hue = 220 - progress * 160;
      const lightness = 32 + progress * 20;
      text.setAttribute("fill", `hsl(${hue} 84% ${lightness}%)`);
      text.setAttribute("font-weight", "700");
      text.style.pointerEvents = "none";
    });
  }

  svg.querySelectorAll<SVGGElement>('g[id^="kvg:StrokeNumbers_"]').forEach((group) => {
    group.style.pointerEvents = "none";
  });

  svg.setAttribute("style", "width: 100%; height: auto; display: block;");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return svg;
}

async function loadKanjivg(unicode: string, signal?: AbortSignal) {
  const res = await fetch(`/_kanjivg_${unicode}.svg`, { signal });
  if (!res.ok) return null;

  const svgText = await res.text();
  const doc = new DOMParser().parseFromString(svgText, "text/html");
  const svg = doc.querySelector("svg");
  if (!svg) return null;

  if (!(svg instanceof SVGSVGElement)) return null;

  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("xmlns:kvg", "http://kanjivg.tagaini.net");

  return colorizeKanjivg(svg);
}

export function useKanjivg(kanji: Accessor<string>) {
  const [$svgs, $setSvgs] = createSignal<Node[]>([]);

  createEffect(() => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());

    (async () => {
      const unicodePoints = extractUnicodePoints(kanji());
      if (unicodePoints.length === 0) return;

      const localCache = new Map<string, Promise<SVGSVGElement | null>>();
      const loadCached = (unicode: string) => {
        const cached = localCache.get(unicode);
        if (cached) return cached;

        const promise = loadKanjivg(unicode, controller.signal).catch((err) => {
          if (controller.signal.aborted) return null;
          throw err;
        });
        localCache.set(unicode, promise);
        return promise;
      };

      const svgs = await Promise.all(unicodePoints.map((unicode) => loadCached(unicode)));
      if (controller.signal.aborted) return;

      $setSvgs(
        svgs.filter((svg): svg is SVGSVGElement => svg !== null).map((svg) => svg.cloneNode(true)),
      );
    })().catch((err) => {
      if (!controller.signal.aborted) {
        console.error("❌ Failed to load KanjiVG:", err);
      }
    });
  });

  return {
    $svgs,
  };
}
