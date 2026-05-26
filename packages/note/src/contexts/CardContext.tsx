import { createContext, createMemo, useContext, type Accessor } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { useAnkiFieldContext } from "./AnkiFieldsContext";

type CardStore = {
  side: "front" | "back";
  expressionAudioRef?: HTMLDivElement;
  expressionAudio2Ref?: HTMLDivElement;
};

type CardType = "kakitori" | "kotowaza-yojijukugo" | "taigigo-ruigigo";
type RelationType = "tai" | "rui" | "unknown";

type CardContextValue = {
  $card: Store<CardStore>;
  $setCard: SetStoreFunction<CardStore>;
  $cardType: Accessor<CardType>;
  $relationType: Accessor<RelationType>;
  $relationText: Accessor<string | null>;
};

const CardStoreContext = createContext<CardContextValue>();

export function CardStoreContextProvider(props: { children: JSX.Element; side: "front" | "back" }) {
  const { $ankiFields } = useAnkiFieldContext<"front" | "back">();
  const [$card, $setCard] = createStore<CardStore>({
    side: props.side,
    expressionAudioRef: undefined,
    expressionAudio2Ref: undefined,
  });

  const $cardType = createMemo<CardType>(() => {
    if ($ankiFields.Kakitori) return "kakitori";
    if ($ankiFields.KotowazaYojijukugo) return "kotowaza-yojijukugo";
    if ($ankiFields.TaigigoRuigigo) return "taigigo-ruigigo";
    if (!$ankiFields.Sentence) return "kotowaza-yojijukugo";
    return "kakitori";
  });

  const $relationType = createMemo<RelationType>(() => {
    if (
      $ankiFields.TaigigoRuigigo.includes("対") ||
      $ankiFields.TaigigoRuigigo.includes("たい") ||
      $ankiFields.TaigigoRuigigo.includes("タイ") ||
      $ankiFields.TaigigoRuigigo.toLowerCase().includes("tai")
    )
      return "tai";
    if (
      $ankiFields.TaigigoRuigigo.includes("類") ||
      $ankiFields.TaigigoRuigigo.includes("るい") ||
      $ankiFields.TaigigoRuigigo.includes("ルイ") ||
      $ankiFields.TaigigoRuigigo.toLowerCase().includes("rui")
    )
      return "rui";
    return "unknown";
  });

  const $relationText = createMemo(() => {
    if ($relationType() === "tai") return "対";
    if ($relationType() === "rui") return "類";
    return null;
  });

  return (
    <CardStoreContext.Provider value={{ $card, $setCard, $cardType, $relationType, $relationText }}>
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
