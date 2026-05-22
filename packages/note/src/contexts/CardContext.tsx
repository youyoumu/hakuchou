import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

type CardStore = {
  side: "front" | "back";
};

type CardContextValue = {
  $card: Store<CardStore>;
  $setCard: SetStoreFunction<CardStore>;
};

const CardStoreContext = createContext<CardContextValue>();

export function CardStoreContextProvider(props: { children: JSX.Element; side: "front" | "back" }) {
  const [$card, $setCard] = createStore<CardStore>({
    side: props.side,
  });

  return (
    <CardStoreContext.Provider value={{ $card, $setCard }}>
      {props.children}
    </CardStoreContext.Provider>
  );
}

export function useCardContext() {
  const context = useContext(CardStoreContext);
  if (!context) throw new Error("Missing CardContext");
  return context;
}

export type UseCardContext = typeof useCardContext;
