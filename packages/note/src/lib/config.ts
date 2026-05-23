export type HakuchouConfig = {};
export const defaultConfig: HakuchouConfig = {};

const rootDatasetArray = [""] as const;
export type RootDatasetKey = (typeof rootDatasetArray)[number];
export type RootDataset = Partial<Record<RootDatasetKey, string>>;
export const rootDatasetConfigWhitelist = new Set<RootDatasetKey>(rootDatasetArray);

export function validateConfig(config: HakuchouConfig): HakuchouConfig {
  try {
    if (typeof config !== "object" || config === null) throw new Error();
    const valid: HakuchouConfig = {};
    return valid;
  } catch {
    return defaultConfig;
  }
}

export function getRootDatasetConfig(_config: HakuchouConfig): RootDataset {
  return {};
}

export type CssVar = Record<string, string>;

export function getCssVar(_config: HakuchouConfig) {
  const cssVar: CssVar = {};

  return cssVar;
}

export function updateConfigState(
  el: HTMLElement,
  config: HakuchouConfig,
  updateDocument: boolean,
) {
  const _dataset = getRootDatasetConfig(config);
  //TODO: configurable?
  el.dataset.theme = "dark";

  const cssVar = getCssVar(config);
  Object.entries(cssVar).forEach(([key, value]) => {
    if (updateDocument) {
      document.documentElement.style.setProperty(key, value);
    }
    el.style.setProperty(key, value);
  });
}

// prettier-ignore
export type Dataset = {
  "data-theme": string;
  "data-dictionary": string
};

export type DatasetProp = Partial<Dataset>;
