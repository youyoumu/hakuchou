const version: string =
  // @ts-expect-error: injected by vite
  typeof __VERSION__ !== "undefined" ? __VERSION__ : "unknown";

const assets = {
  "_hakuchou_config.json": "_hakuchou_config.json",
};

export const constant = {
  VERSION: version,
  assets,
  key: {
    "hakuchou-config": "hakuchou-config",
  },
};
