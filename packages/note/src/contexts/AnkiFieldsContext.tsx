import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { AnkiFields, AnkiFrontFields } from "#/lib/types";

const AnkiFieldsContext = createContext<{
  $ankiFields: Store<AnkiFields>;
  $setAnkiFields: SetStoreFunction<AnkiFields>;
}>();

export function AnkiFieldContextProvider(props: {
  children: JSX.Element;
  initialAnkiFields: AnkiFields;
}) {
  const [$ankiFields, $setAnkiFields] = createStore<AnkiFields>({
    ...props.initialAnkiFields,
  });

  return (
    <AnkiFieldsContext.Provider
      value={{
        $ankiFields,
        $setAnkiFields,
      }}
    >
      {props.children}
    </AnkiFieldsContext.Provider>
  );
}

type UseAnkiFieldSide = {
  front: {
    $ankiFields: Store<AnkiFrontFields>;
    $setAnkiFields: SetStoreFunction<AnkiFrontFields>;
  };
  back: {
    $ankiFields: Store<AnkiFields>;
    $setAnkiFields: SetStoreFunction<AnkiFields>;
  };
};

export function useAnkiFieldContext<T extends "front" | "back">() {
  const ankiField = useContext(AnkiFieldsContext);
  if (!ankiField) throw new Error("Missing AnkiFieldContext");
  return ankiField as UseAnkiFieldSide[T];
}

export type UseAnkiFieldContext = typeof useAnkiFieldContext;
