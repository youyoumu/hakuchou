import { usePitch } from "#/hooks/pitch";
import type { DatasetProp } from "#/lib/config";
import type { PitchInfo } from "#/lib/hatsuon";
import type { PitchType } from "#/lib/types";
import { createMemo, For } from "solid-js";

export default function Pitches(props: { type: 1 | 2 }) {
  const { $pitchInfos } = usePitch({ type: props.type });
  return (
    <For each={$pitchInfos()}>
      {(pitchInfo, index) => {
        return <Pitch pitchInfo={pitchInfo} index={index()} />;
      }}
    </For>
  );
}

export function Pitch(props: { pitchInfo: PitchInfo; index: number }) {
  const $pitchDataset = createMemo<DatasetProp>(() => ({
    "data-pitch-type": props.pitchInfo.patternName as PitchType,
  }));

  const $pitchTypeJA = createMemo(() => {
    switch (props.pitchInfo.patternName) {
      case "heiban":
        return "平板";
      case "atamadaka":
        return "頭高";
      case "nakadaka":
        return "中高";
      case "odaka":
        return "尾高";
      case "kifuku":
        return "起伏";
    }
  });

  return (
    <div class="tooltip" data-tip={$pitchTypeJA()} {...$pitchDataset()}>
      <div class="flex items-start gap-1">
        <div>
          <For each={props.pitchInfo.morae}>
            {(mora, i) => {
              return (
                <span
                  style={{
                    "border-color": "var(--pitch-color)",
                    color: "var(--pitch-color)",
                  }}
                  classList={{
                    "border-t-2": props.pitchInfo.pattern[i()] === 1,
                    "pitch-segment":
                      props.pitchInfo.pattern[i()] === 1 && props.pitchInfo.pattern[i() + 1] === 0,
                  }}
                >
                  {mora}
                </span>
              );
            }}
          </For>
        </div>
        <div
          class="text-sm px-0.5 rounded-sm leading-tight"
          style={{
            "background-color": "var(--pitch-color)",
            color: "var(--pitch-content-color)",
          }}
        >
          {props.pitchInfo.pitchNum}
        </div>
      </div>
    </div>
  );
}
