# Hakuchou (白蝶)

## Anki Fields

- QuestionType
- Expression
- ExpressionReading
- ExpressionAudio
- SelectionText
- MainDefinition
- Glossary
- Sentence
- SentenceAudio
- Picture
- PitchPosition
- PitchCategories
- Frequency
- FreqSort
- Expression2
- ExpressionReading2
- ExpressionAudio2
- SelectionText2
- MainDefinition2
- Glossary2
- Sentence2
- SentenceAudio2
- Picture2
- PitchPosition2
- PitchCategories2
- Frequency2
- FreqSort2

## Notes

- QuestionType possible values: 書き取り, 四字熟語・諺, 四字熟語, 諺, 対義語, 類義語, kakitori, yojijukugo, kotowaza, taigigo, ruigigo
- Kanji stroke-order from https://github.com/KanjiVG/kanjivg, loaded into DOM with javascript, could be colorized and animated dynamically
- Hakuchou, not 白鳥(Swan) but 白蝶(White Butterfly), named after 白蝶草(White Gaura)

## QuestionType

### 書き取り

Front: Display `Sentence` with `Expression` swapped in katakana. optional: `SentenceAudio` and `ExpressionAudio`
Back: Display everything with kanji stroke-order

### 四字熟語・諺

Front: Display definition with Expression in question hidden away
Back: Display everything with kanji stroke-order

### 対義語 and 類義語

Front: Display `Expression` and `QuestionType` (対義語 or 類義語)
Back: Display everything with kanji stroke-order for both `Expression` and `Expression2`

Another option for 対義語 and 類義語, instead of `<FieldName>2` variant, we could just add `RelatedExpression` fields.
So for example, we could have both `和御魂` and `荒御魂` cards.
`和御魂` card would have `荒御魂` as `RelatedExpression`.
`荒御魂` card would have `和御魂` as `RelatedExpression`.
We will then use AnkiConnect to display the 2nd `Glossary`, but I worry relying on AnkiConnect might lag your Anki.
