import { createMemo, createSignal, type Accessor } from "solid-js";

export function useSentences(
  $html: Accessor<string>,
  opts?: {
    initialIndex?: (length: number) => number;
  },
) {
  const $sentences = createMemo(() => {
    const html = $html();
    if (!html) return [];
    return $html()
      .split("|")
      .map((s, i) => ({ page: i + 1, html: s }));
  });

  const [$index, $setIndex] = createSignal(
    opts?.initialIndex ? opts.initialIndex($sentences().length) : 0,
  );
  const $currentPage = createMemo(() => $sentences()[$index()]);

  function changePage(direction: 1 | -1) {
    if ($sentences().length === 0) return;
    $setIndex((prev) => (prev + direction + $sentences().length) % $sentences().length);
  }

  return {
    $sentences,
    $index,
    $currentPage,
    changePage,
  };
}
