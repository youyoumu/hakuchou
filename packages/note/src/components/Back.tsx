import { useAnkiFieldContext } from "#/contexts/AnkiFieldsContext";
import { onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import Sentence from "./Sentence";
import { animateKanjivgStrokes, useKanjivg } from "#/hooks/kanjivg";
import { Definition } from "./Definition";

export function Back() {
  const { $ankiFields } = useAnkiFieldContext<"back">();
  const { $svgs } = useKanjivg(() => $ankiFields.Expression);

  function handleKanjivgClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const svg = event.target.closest("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    animateKanjivgStrokes(svg);
  }

  onMount(() => {
    if (globalThis.HAKUCHOU) {
      globalThis.HAKUCHOU.ankiFields = unwrap($ankiFields);
    }
  });

  return (
    <>
      <div class="flex justify-between gap-4">
        <div class="flex flex-col gap-2 items-center justify-center flex-1 p-4 bg-base-200 rounded-lg">
          <div
            class="text-7xl vertical-rl underline-offset-4 leading-12 tracking-widest"
            innerHTML={$ankiFields.Expression}
          ></div>
        </div>

        <div
          class="flex flex-col items-center justify-center gap-1 bg-base-200 p-4 rounded-lg w-40"
          on:click={handleKanjivgClick}
        >
          {$svgs()}
        </div>
      </div>
      <Definition />
      <Sentence />
    </>
  );
}
