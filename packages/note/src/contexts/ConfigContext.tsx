import { createContext, createEffect, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { type SetStoreFunction, type Store } from "solid-js/store";
import { type HakuchouConfig, updateConfigState } from "#/lib/config";
import { constant } from "#/lib/constant";
import { useGeneralContext } from "./GeneralContext";

type ConfigContextValue = {
  $config: Store<HakuchouConfig>;
  $setConfig: SetStoreFunction<HakuchouConfig>;
};

const ConfigContext = createContext<ConfigContextValue>();

export function ConfigContextProvider(props: { children: JSX.Element; value: ConfigContextValue }) {
  const { $config } = props.value;
  const { $general } = useGeneralContext();

  createEffect(() => {
    const config = { ...$config };
    if (!$general.root) throw new Error("Missing root");
    updateConfigState($general.root, $config, !$general.isAnkiWeb);
    sessionStorage.setItem(constant.key["hakuchou-config"], JSON.stringify(config));
  });

  return <ConfigContext.Provider value={props.value}>{props.children}</ConfigContext.Provider>;
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("Missing ConfigContext");
  return context;
}

export type UseConfigContext = typeof useConfigContext;
