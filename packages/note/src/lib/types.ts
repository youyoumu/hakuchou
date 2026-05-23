export type AnkiFields = {
  Expression: string;
  ExpressionReading: string;
  ExpressionAudio: string;
  UserNotes: string;
  Glossary: string;
  Sentence: string;
  Picture: string;
  PitchPosition: string;
  PitchCategories: string;
  Frequency: string;
  FreqSort: string;

  Expression2: string;
  ExpressionReading2: string;
  ExpressionAudio2: string;
  UserNotes2: string;
  Glossary2: string;
  Sentence2: string;
  Picture2: string;
  PitchPosition2: string;
  PitchCategories2: string;
  Frequency2: string;
  FreqSort2: string;

  Kakitori: string;
  KotowazaYojijukugo: string;
  TaigigoRuigigo: string;

  Tags: string;
};

const frontKeys = [
  "Expression",
  "ExpressionReading",
  "ExpressionAudio",
  "Sentence",

  "Kakitori",
  "KotowazaYojijukugo",
  "TaigigoRuigigo",

  "Tags",
] satisfies readonly (keyof AnkiFields)[];

type ExtractUsedFields<T, U extends readonly (keyof T)[]> = Pick<T, U[number]>;

export type AnkiFrontFields = ExtractUsedFields<AnkiFields, typeof frontKeys> & {
  __IS_ROOT__?: boolean;
};
export type AnkiBackFields = AnkiFields;

// prettier-ignore
export const ankiFieldsSkeleton: AnkiFields = {
  Expression: "",
  ExpressionReading: "",
  ExpressionAudio: "",
  UserNotes: "",
  Glossary: "",
  Sentence: "",
  Picture: "",
  PitchPosition: "",
  PitchCategories: "",
  Frequency: "",
  FreqSort: "",

  Expression2: "",
  ExpressionReading2: "",
  ExpressionAudio2: "",
  UserNotes2: "",
  Glossary2: "",
  Sentence2: "",
  Picture2: "",
  PitchPosition2: "",
  PitchCategories2: "",
  Frequency2: "",
  FreqSort2: "",

  Kakitori: "",
  KotowazaYojijukugo: "",
  TaigigoRuigigo: "",

  Tags: ""
};

export type PitchType = "heiban" | "atamadaka" | "nakadaka" | "odaka" | "kifuku";
export const pitchTypes: PitchType[] = ["heiban", "atamadaka", "nakadaka", "odaka", "kifuku"];

type AnkiResponse<T = unknown> = {
  success: boolean;
  value?: T;
  error?: string;
};

export type AnkiDroidAPI = {
  ankiGetNewCardCount(): Promise<AnkiResponse>;
  ankiGetLrnCardCount(): Promise<AnkiResponse>;
  ankiGetRevCardCount(): Promise<AnkiResponse>;
  ankiGetETA(): Promise<AnkiResponse>;
  ankiGetCardMark(): Promise<AnkiResponse>;
  ankiGetCardFlag(): Promise<AnkiResponse>;
  ankiGetNextTime1(): Promise<AnkiResponse>;
  ankiGetNextTime2(): Promise<AnkiResponse>;
  ankiGetNextTime3(): Promise<AnkiResponse>;
  ankiGetNextTime4(): Promise<AnkiResponse>;
  ankiGetCardReps(): Promise<AnkiResponse>;
  ankiGetCardInterval(): Promise<AnkiResponse>;
  ankiGetCardFactor(): Promise<AnkiResponse>;
  ankiGetCardMod(): Promise<AnkiResponse>;
  ankiGetCardId(): Promise<AnkiResponse>;
  ankiGetCardNid(): Promise<AnkiResponse>;
  ankiGetCardType(): Promise<AnkiResponse>;
  ankiGetCardDid(): Promise<AnkiResponse>;
  ankiGetCardLeft(): Promise<AnkiResponse>;
  ankiGetCardODid(): Promise<AnkiResponse>;
  ankiGetCardODue(): Promise<AnkiResponse>;
  ankiGetCardQueue(): Promise<AnkiResponse>;
  ankiGetCardLapses(): Promise<AnkiResponse>;
  ankiGetCardDue(): Promise<AnkiResponse>;
  ankiIsInFullscreen(): Promise<AnkiResponse>;
  ankiIsTopbarShown(): Promise<AnkiResponse>;
  ankiIsInNightMode(): Promise<AnkiResponse>;
  ankiIsDisplayingAnswer(): Promise<AnkiResponse>;
  ankiGetDeckName(): Promise<AnkiResponse>;
  ankiIsActiveNetworkMetered(): Promise<AnkiResponse>;
  ankiTtsFieldModifierIsAvailable(): Promise<AnkiResponse>;
  ankiTtsIsSpeaking(): Promise<AnkiResponse>;
  ankiTtsStop(): Promise<AnkiResponse>;
  ankiBuryCard(): Promise<AnkiResponse>;
  ankiBuryNote(): Promise<AnkiResponse>;
  ankiSuspendCard(): Promise<AnkiResponse>;
  ankiSuspendNote(): Promise<AnkiResponse>;
  ankiAddTagToCard(): Promise<AnkiResponse>;
  ankiResetProgress(): Promise<AnkiResponse>;
  ankiMarkCard(): Promise<AnkiResponse>;
  ankiToggleFlag(): Promise<AnkiResponse>;
  ankiSearchCard(query: string): Promise<AnkiResponse>;
  ankiSearchCardWithCallback(): Promise<AnkiResponse>;
  ankiTtsSpeak(): Promise<AnkiResponse>;
  ankiTtsSetLanguage(): Promise<AnkiResponse>;
  ankiTtsSetPitch(): Promise<AnkiResponse>;
  ankiTtsSetSpeechRate(): Promise<AnkiResponse>;
  ankiEnableHorizontalScrollbar(): Promise<AnkiResponse>;
  ankiEnableVerticalScrollbar(): Promise<AnkiResponse>;
  ankiSetCardDue(): Promise<AnkiResponse>;
  ankiShowNavigationDrawer(): Promise<AnkiResponse>;
  ankiShowOptionsMenu(): Promise<AnkiResponse>;
  ankiShowToast(): Promise<AnkiResponse>;
  ankiShowAnswer(): Promise<AnkiResponse>;
  ankiAnswerEase1(): Promise<AnkiResponse>;
  ankiAnswerEase2(): Promise<AnkiResponse>;
  ankiAnswerEase3(): Promise<AnkiResponse>;
  ankiAnswerEase4(): Promise<AnkiResponse>;
  ankiSttSetLanguage(): Promise<AnkiResponse>;
  ankiSttStart(): Promise<AnkiResponse>;
  ankiSttStop(): Promise<AnkiResponse>;
  ankiAddTagToNote(): Promise<AnkiResponse>;
  ankiSetNoteTags(): Promise<AnkiResponse>;
  ankiGetNoteTags(): Promise<AnkiResponse>;
};

declare global {
  var pycmd: () => void;
  var AnkiDroidJS: {
    new (contract: { version: string; developer?: string }): AnkiDroidAPI;
    prototype: AnkiDroidAPI;
  };

  var HAKUCHOU:
    | ({
        aborter?: AbortController;
        dispose?: () => void;
        unload?: () => void;
        ankiDroidAPI?: AnkiDroidAPI;
        ankiFields?: AnkiBackFields | AnkiFrontFields;
      } & CacheStore)
    | undefined;
}

export type CacheStore = {
  relax?: boolean;
};
