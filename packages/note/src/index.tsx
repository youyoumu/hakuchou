/* @refresh reload */
import { createStore } from "solid-js/store";
import { hydrate, render } from "solid-js/web";
import {
  ankiFieldsSkeleton,
  type AnkiDroidAPI,
  type AnkiFields,
  type CacheStore,
} from "./lib/types";
import {
  defaultConfig,
  updateConfigState,
  validateConfig,
  type HakuchouConfig,
  type RootDataset,
} from "./lib/config";
import { constant } from "./lib/constant";
import { exampleFields } from "./lib/examples";
import "./styles/main.css";
import { BreakpointContextProvider } from "./contexts/BreakpointContext";
import { CacheContextProvider } from "./contexts/CacheContext";
import { GeneralContextProvider } from "./contexts/GeneralContext";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { AnkiFieldContextProvider } from "./contexts/AnkiFieldsContext";
import { CardStoreContextProvider } from "./contexts/CardContext";
import { Layout } from "./components/Layout";
import { Front } from "./components/Front";
import { Back } from "./components/Back";

export async function init({
  root,
  side,
  ankiFields,
  ssr,
  config = defaultConfig,
  aborter = new AbortController(),
  ankiDroidAPI,
  cacheStore = {},
  assetsPath = window.location.origin,
  isAnkiWeb = false,
  isAnkiDesktop = typeof pycmd !== "undefined",
  rootDataset,
}: {
  root: HTMLElement;
  side: "front" | "back";
  ankiFields: AnkiFields;
  ssr?: boolean;
  config?: HakuchouConfig | ((defaultConfig: HakuchouConfig) => HakuchouConfig);
  aborter?: AbortController;
  ankiDroidAPI?: AnkiDroidAPI;
  cacheStore?: CacheStore;
  assetsPath?: string;
  isAnkiWeb?: boolean;
  isAnkiDesktop?: boolean;
  rootDataset?: RootDataset;
}) {
  root.part.add("root-part");

  config = typeof config === "function" ? config(defaultConfig) : config;
  updateConfigState(root, config, !isAnkiWeb);
  const [$config, $setConfig] = createStore(config);

  const App = () => (
    <BreakpointContextProvider>
      <CacheContextProvider cacheStore={cacheStore}>
        <GeneralContextProvider
          aborter={aborter}
          isAnkiWeb={isAnkiWeb}
          isAnkiDesktop={isAnkiDesktop}
          templateDataset={rootDataset ?? {}}
          ankiDroidAPI={ankiDroidAPI}
          assetsPath={assetsPath}
          root={root}
        >
          <ConfigContextProvider value={{ $config, $setConfig }}>
            <AnkiFieldContextProvider initialAnkiFields={ankiFields}>
              <CardStoreContextProvider side={side}>
                <Layout>{side === "front" ? <Front /> : <Back />}</Layout>
              </CardStoreContextProvider>
            </AnkiFieldContextProvider>
          </ConfigContextProvider>
        </GeneralContextProvider>
      </CacheContextProvider>
    </BreakpointContextProvider>
  );

  const dispose = ssr ? hydrate(App, root) : render(App, root);
  return { dispose };
}

export async function initAnki({ side, ssr }: { side: "front" | "back"; ssr?: boolean }) {
  if (globalThis.HAKUCHOU?.aborter) globalThis.HAKUCHOU.aborter.abort();
  if (globalThis.HAKUCHOU?.dispose) globalThis.HAKUCHOU.dispose();

  const aborter = new AbortController();

  globalThis.HAKUCHOU ??= {};
  globalThis.HAKUCHOU.aborter = aborter;
  globalThis.HAKUCHOU.relax = false;

  if (!globalThis.HAKUCHOU.unload && !import.meta.env.DEV) {
    globalThis.HAKUCHOU.unload = () => {
      if (typeof pycmd !== "undefined") sessionStorage.clear();
    };
    window.addEventListener("unload", globalThis.HAKUCHOU.unload);
  }

  if (!globalThis.HAKUCHOU.ankiDroidAPI && typeof AnkiDroidJS !== "undefined") {
    globalThis.HAKUCHOU.ankiDroidAPI = new AnkiDroidJS({
      version: "0.0.3",
      developer: "youyoumu",
    });
  }

  let assetsPath = window.location.origin;
  const isAnkiWeb = window.location.origin.includes("ankiuser.net");
  if (isAnkiWeb) {
    assetsPath = `${window.location.origin}/study/media`;
    const hakuchouCss = document.getElementById("hakuchou-css");
    hakuchouCss?.remove();
  }

  try {
    let root = document.getElementById("hakuchou-root");
    if (!root) {
      const shadowParent = document.querySelector("#hakuchou-shadow-parent");
      if (shadowParent) {
        const existingRoot = shadowParent.shadowRoot?.querySelector("#hakuchou-root") as
          | HTMLElement
          | undefined
          | null;
        if (existingRoot && existingRoot.innerHTML.trim() === "") {
          root = existingRoot;
        } else {
          return;
        }
      } else {
        throw new Error("root not found");
      }
    }
    const rootDataset = {} satisfies RootDataset;

    const qa = document.querySelector("#qa");
    if (!qa) throw new Error("qa not found");
    const shadowParent = document.createElement("div");
    shadowParent.setAttribute("id", "hakuchou-shadow-parent");
    qa.appendChild(shadowParent);
    const shadow = shadowParent.attachShadow({ mode: "open" });

    const style = qa.querySelector("style");
    if (style) shadow.appendChild(style.cloneNode(true));
    if (isAnkiWeb) style?.remove();

    if (import.meta.env.DEV) {
      const mainCss = document.querySelector(
        'style[type="text/css"][data-vite-dev-id$="main.css"]',
      );
      if (!mainCss) throw new Error("tailwind not found");
      shadow.appendChild(mainCss.cloneNode(true));
    } else {
      const mainCss = document.createElement("link");
      mainCss.rel = "stylesheet";
      mainCss.href = "./_hakuchou.css";
      shadow.prepend(mainCss);
    }

    shadow.appendChild(root);

    let config: HakuchouConfig | undefined;
    try {
      const cache = sessionStorage.getItem(constant.key["hakuchou-config"]);
      if (cache) {
        config = validateConfig(JSON.parse(cache));
      } else {
        const res = await fetch(constant.assets["_hakuchou_config.json"], {
          cache: "no-store",
        });
        const json = await res.json();
        config = validateConfig(json);
        if (aborter.signal.aborted) return;
        sessionStorage.setItem(constant.key["hakuchou-config"], JSON.stringify(config));
      }
    } catch {}

    let divs: NodeListOf<Element> | Element[] | undefined =
      document.querySelectorAll("#anki-fields > div");
    if (import.meta.env.DEV) {
      divs = Object.entries(exampleFields).map(([key, value]) => {
        const div = document.createElement("div");
        div.dataset.field = key;
        div.innerHTML = value.toString();
        return div;
      });
    }
    const ankiFields = divs
      ? Object.fromEntries(
          Array.from(divs).map((el) => [(el as HTMLDivElement).dataset.field, el.innerHTML.trim()]),
        )
      : ankiFieldsSkeleton;

    const res = await init({
      root,
      side,
      ankiFields,
      ssr,
      config,
      aborter,
      ankiDroidAPI: globalThis.HAKUCHOU.ankiDroidAPI,
      cacheStore: globalThis.HAKUCHOU,
      assetsPath,
      isAnkiWeb,
      rootDataset,
    });

    Object.assign(globalThis.HAKUCHOU, res);
    if (import.meta.env.DEV) root.dataset.side = side;
  } catch (e) {
    sessionStorage.clear();
    Object.assign(document.body.style, {
      margin: 0,
      padding: 0,
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "oklch(21.15% .012 254.09)",
      color: "oklch(71% .194 13.428)",
      textAlign: "center",
    });
    const isError = e instanceof Error;
    document.body.innerHTML = isError
      ? `
        <span>Failed to render card.</span>
        <span><b>Error Name:</b> ${e.name}</span>
        <span><b>Error Message:</b> ${e.message}</span>
        <span><b>Error Cause:</b> ${e.cause ?? "N/A"}</span>
        <span><b>Error Stack:</b><br>
          <pre style="white-space: pre-wrap; background: oklch(82% .189 84.429); color: oklch(41% .112 45.904); padding: 8px;">
            ${e.stack}
          </pre>
        </span><br>
      `
      : `<span>Something went wrong.</span>`;
  }
}
