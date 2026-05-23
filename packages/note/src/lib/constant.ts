const VERSION: string =
  // @ts-expect-error: injected by vite
  typeof __VERSION__ !== "undefined" ? __VERSION__ : "unknown";
const COMMIT_SHA: string =
  // @ts-expect-error: injected by vite
  typeof __COMMIT_SHA__ !== "undefined" ? __COMMIT_SHA__ : "unknown";

const assets = {
  "_hakuchou_config.json": "_hakuchou_config.json",
};

export const constant = {
  VERSION: VERSION,
  COMMIT_SHA: COMMIT_SHA,
  assets,
  key: {
    "hakuchou-config": "hakuchou-config",
    "hakuchou-sentence-index": "hakuchou-sentence-index",
  },
};
