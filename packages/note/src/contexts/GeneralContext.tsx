import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { RootDataset } from "#/lib/config";
import type { AnkiDroidAPI } from "#/lib/types";

type GeneralStore = {
  root: HTMLElement | undefined;
  templateDataset: RootDataset;
  isAnkiWeb: boolean;
  isAnkiDesktop: boolean;
  ankiDroidAPI: AnkiDroidAPI | undefined;
  assetsPath: string;
  aborter: AbortController;
  isAnkiConnectAvailable: boolean;
  layoutRef: HTMLDivElement | undefined;
};

type GeneralContextValue = {
  $general: Store<GeneralStore>;
  $setGeneral: SetStoreFunction<GeneralStore>;
};

const GeneralContext = createContext<GeneralContextValue>();

export function GeneralContextProvider(props: {
  children: JSX.Element;
  isAnkiWeb: boolean;
  isAnkiDesktop: boolean;
  templateDataset: RootDataset;
  ankiDroidAPI: AnkiDroidAPI | undefined;
  assetsPath: string;
  aborter: AbortController;
  root: HTMLElement | undefined;
}) {
  const [$general, $setGeneral] = createStore<GeneralStore>({
    root: props.root,
    templateDataset: props.templateDataset,
    isAnkiWeb: props.isAnkiWeb,
    isAnkiDesktop: props.isAnkiDesktop,
    ankiDroidAPI: props.ankiDroidAPI,
    assetsPath: props.assetsPath,
    aborter: props.aborter,
    isAnkiConnectAvailable: false,
    layoutRef: undefined,
  });

  return (
    <GeneralContext.Provider value={{ $general, $setGeneral }}>
      {props.children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) throw new Error("Missing GeneralContext");
  return context;
}

export type UseGeneralContext = typeof useGeneralContext;
