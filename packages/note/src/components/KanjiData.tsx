import { createMemo, createResource, For, Show } from "solid-js";

export type MinimizedKanjiData = [
  string,
  number | string,
  number | string,
  string | null,
  string,
  string,
  string[],
  string[],
  string[],
  string[],
  number,
  number,
  number,
  [string, string] | null,
  [string, string] | null,
  [string, [string, string][]][],
  [string | null, string],
  string | null,
];

export type SupplementaryItem = {
  tag: string;
  content: string;
};

export type MeaningItem = {
  meaning: string;
  supplementary: SupplementaryItem[];
};

export type KanjiObject = {
  kanji: string;
  level: number | string;
  stroke: number | string;
  strokeImage: string | null;
  radical: string;
  radicalName: string;
  on: string[];
  onGai: string[];
  kun: string[];
  kunGai: string[];
  joyo: boolean;
  kyoiku: boolean;
  kokuji: boolean;
  kyujitai: { type: "TRUE" | "IS"; value: string } | null;
  itaiji: { type: "TRUE" | "IS"; value: string } | null;
  meaning: MeaningItem[];
  naritachi: { type: string | null; html: string };
  kadokawaNaritachi?: string;
};

export function inflateKanjiData(data: MinimizedKanjiData): KanjiObject {
  const obj: KanjiObject = {
    kanji: data[0],
    level: data[1],
    stroke: data[2],
    strokeImage: data[3],
    radical: data[4],
    radicalName: data[5],
    on: data[6],
    onGai: data[7],
    kun: data[8],
    kunGai: data[9],
    joyo: data[10] === 1,
    kyoiku: data[11] === 1,
    kokuji: data[12] === 1,
    kyujitai: data[13] ? { type: data[13][0] as "TRUE" | "IS", value: data[13][1] } : null,
    itaiji: data[14] ? { type: data[14][0] as "TRUE" | "IS", value: data[14][1] } : null,
    meaning: data[15].map(([meaning, supplementary]) => ({
      meaning,
      supplementary: supplementary.map(([tag, content]) => ({ tag, content })),
    })),
    naritachi: {
      type: data[16][0],
      html: data[16][1],
    },
  };

  if (data[17]) {
    obj.kadokawaNaritachi = data[17];
  }

  return obj;
}

const naritachiTypeBadge: Record<string, string> = {
  会意形声: "badge-kaii-keisei",
  象形: "badge-shokei",
  指事: "badge-shiji",
  会意: "badge-kaii",
  形声: "badge-keisei",
  転注: "badge-tenchu",
  仮借: "badge-kasha",
  象形指事: "badge-shokei-shiji",
};

const naritachiTypeBg: Record<string, string> = {
  会意形声: "bg-kaii-keisei-soft",
  象形: "bg-shokei-soft",
  指事: "bg-shiji-soft",
  会意: "bg-kaii-soft",
  形声: "bg-keisei-soft",
  転注: "bg-tenchu-soft",
  仮借: "bg-kasha-soft",
  象形指事: "bg-shokei-shiji-soft",
};

const meaningSupplementaryTagBadge: Record<string, string> = {
  参考: "badge-sanko",
  類: "badge-rui",
  対: "badge-tai",
};

const meaningSupplementaryTagBg: Record<string, string> = {
  参考: "bg-sanko-soft",
  類: "bg-rui-soft",
  対: "bg-tai-soft",
};

const kankenLevelBadge: Record<string, string> = {
  10: "badge-kanken-10",
  9: "badge-kanken-9",
  8: "badge-kanken-8",
  7: "badge-kanken-7",
  6: "badge-kanken-6",
  5: "badge-kanken-5",
  4: "badge-kanken-4",
  3: "badge-kanken-3",
  準2: "badge-kanken-j2",
  2: "badge-kanken-2",
  準1: "badge-kanken-j1",
  1: "badge-kanken-1",
};

const CIRCLED_NUMBERS = [
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
  "⑦",
  "⑧",
  "⑨",
  "⑩",
  "⑪",
  "⑫",
  "⑬",
  "⑭",
  "⑮",
  "⑯",
  "⑰",
  "⑱",
  "⑲",
  "⑳",
];

export type KanjiDataProps = {
  kanji: string;
};

let kanjiDataPromise: Promise<Record<string, MinimizedKanjiData>> | null = null;

async function fetchKanjiData() {
  if (kanjiDataPromise) return kanjiDataPromise;
  kanjiDataPromise = fetch("_kiku-plugin-kanji-data.json")
    .then((res) => res.json())
    .then((data: MinimizedKanjiData[]) => {
      const record: Record<string, MinimizedKanjiData> = {};
      for (const item of data) {
        record[item[0]] = item;
      }
      return record;
    });
  return kanjiDataPromise;
}

export function KanjiData(props: KanjiDataProps) {
  const [data] = createResource(
    () => props.kanji,
    async (kanji) => {
      const record = await fetchKanjiData();
      const item = record[kanji];
      return item ? inflateKanjiData(item) : null;
    },
  );
  const k = () => data() as KanjiObject;

  function MetadataSection() {
    return (
      <div class="metadata-section">
        {/* <Show */}
        {/*   when={k().strokeImage} */}
        {/*   fallback={ */}
        {/*     <div class="stroke-image"> */}
        {/*       <div class="empty-img flex border border-base-content-subtle-100">{k().kanji}</div> */}
        {/*     </div> */}
        {/*   } */}
        {/* > */}
        {/*   {(strokeImage) => <div class="stroke-image" innerHTML={strokeImage()} />} */}
        {/* </Show> */}
        <div class="flex flex-col gap-2 items-start">
          <ReadingsSection />
          <div class="flex flex-row gap-1 items-start">
            <div class="misc-badge text-base-content-calm">
              <span>部首: </span>
              <span>{`${k().radical} (${k().radicalName})`}</span>
            </div>
            <div class="misc-badge text-base-content-calm">
              <span>{k().stroke}</span>
              <span>画</span>
            </div>
          </div>
          <div class="flex flex-row gap-2 items-start">
            <div class={`badge-origin ${kankenLevelBadge[String(k().level)] ?? ""}`}>
              <span>漢検</span>
              <span>{k().level}</span>
            </div>
            <Show when={k().joyo}>
              <div class="badge-origin badge-joyo">常用</div>
            </Show>
            <Show when={k().kyoiku}>
              <div class="badge-origin badge-kyoiku">教育</div>
            </Show>
            <Show when={k().kokuji}>
              <div class="badge-origin badge-kokuji">国字</div>
            </Show>
          </div>
        </div>
      </div>
    );
  }

  function NaritachiSection() {
    const type = () => (k().naritachi.type ?? "会意形声") as keyof typeof naritachiTypeBadge;

    return (
      <Show when={k().naritachi.html}>
        <div class="info-section">
          <div class="info-header pb-1">
            <div class="flex gap-2 items-center">成り立ち</div>
          </div>
          <div class={`naritachi-content ${naritachiTypeBg[type()]}`}>
            <Show when={k().naritachi.type}>
              <div class={`badge-origin ${naritachiTypeBadge[type()]}`}>{k().naritachi.type}</div>
            </Show>
            <div class="origin-text" innerHTML={k().naritachi.html} />
          </div>
        </div>
      </Show>
    );
  }

  function MeaningsSection() {
    return (
      <div class="info-section">
        <div class="info-header">意味</div>
        <div class="flex flex-col gap-1">
          <For each={k().meaning}>
            {(meaning, index) => (
              <div class="flex flex-col gap-2">
                <div class="meaning-item">
                  <div style={{ "flex-shrink": "0" }}>{CIRCLED_NUMBERS[index()] || "•"}</div>
                  <div>{meaning.meaning}</div>
                </div>
                <For each={meaning.supplementary}>
                  {(supplementary) => (
                    <div
                      class={`ms-6 p-2 flex rounded-lg items-center gap-2 ${
                        meaningSupplementaryTagBg[supplementary.tag] ?? ""
                      }`}
                    >
                      <div
                        class={`badge-origin ${meaningSupplementaryTagBadge[supplementary.tag] ?? ""}`}
                      >
                        {supplementary.tag}
                      </div>
                      <span class="text-base">{supplementary.content}</span>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    );
  }

  function ReadingsSection() {
    return (
      <div class="info-section text-base">
        <div class="flex flex-col gap-2">
          <Show when={k().on.length > 0 || k().onGai.length > 0}>
            <div class="reading-row">
              <span class="font-bold">音</span>
              <div class="reading-container">
                <For each={k().on}>
                  {(reading) => (
                    <div class="px-0.5 border border-base-content-subtle-100">{reading}</div>
                  )}
                </For>
                <For each={k().onGai}>
                  {(reading) => (
                    <div class="px-0.5 text-base-content-faint border border-base-content-subtle-100">
                      {reading}
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
          <Show when={k().kun.length > 0 || k().kunGai.length > 0}>
            <div class="reading-row">
              <span class="font-bold">訓</span>
              <div class="reading-container">
                <For each={k().kun}>
                  {(reading) => (
                    <div class="px-0.5 border border-base-content-subtle-100">{reading}</div>
                  )}
                </For>
                <For each={k().kunGai}>
                  {(reading) => (
                    <div class="px-0.5 text-base-content-faint border border-base-content-subtle-100">
                      {reading}
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
    );
  }

  function BigKanji(props: { header: string; kanji: string }) {
    return (
      <div class="flex flex-col gap-1 items-center">
        <div>{props.header}</div>
        <div style={{ "font-size": "3.5rem", "line-height": "4rem" }}>{props.kanji}</div>
      </div>
    );
  }

  function KadokawaSection() {
    return (
      <Show when={k().kadokawaNaritachi}>
        <div class="info-section flex-1">
          <div class="info-header">古代文字</div>
          <div class="flex gap-2 justify-between">
            <div class="kadokawa-origin-text" innerHTML={k().kadokawaNaritachi} />
          </div>
        </div>
      </Show>
    );
  }

  function BigKanjiSection() {
    return (
      <Show when={k().kyujitai || k().itaiji}>
        <div class="info-section flex-1">
          <div class="info-header">別字体</div>
          <div class="flex gap-2">
            <div class="flex gap-2">
              <Show when={k().kyujitai}>
                {(variant) => <BigKanji header="旧字体" kanji={variant().value} />}
              </Show>
              <Show when={k().itaiji}>
                {(variant) => <BigKanji header="異体字" kanji={variant().value} />}
              </Show>
            </div>
          </div>
        </div>
      </Show>
    );
  }

  return (
    <Show when={k()}>
      <div class="kiku-plugin-kanji-data">
        <div class="extra-info-container">
          <MetadataSection />
          <MeaningsSection />
          <NaritachiSection />
          <div class="bottom-sections">
            <KadokawaSection />
            <BigKanjiSection />
          </div>
        </div>
      </div>
    </Show>
  );
}
