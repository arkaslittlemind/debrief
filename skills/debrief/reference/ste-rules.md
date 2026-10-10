# STE writing rules for a debrief

This file is a working summary of the writing rules of ASD-STE100 Simplified
Technical English, applied to software design documents. It is not the
specification, and it does not contain the STE dictionary. The specification is
available at no cost, on request, from ASD (asd-ste100.org).

STE was made for aerospace maintenance manuals. Its purpose is that a reader
with limited English, or limited time, gets one meaning from each sentence. That
purpose is the test for every sentence in a debrief.

## Words

- **One word, one meaning.** Use a word with the same meaning each time. Use the
  same word for the same thing each time. If section 3 says "verifier", section
  6 does not say "checker" or "validator".
- **Choose the common word.** Prefer the short, common word when two words have
  the same meaning: "use", "start", "stop", "show", "do", "make sure".
- **Technical names are permitted.** A technical name is a word the subject
  needs that general English does not have: a code identifier, a file path, a
  library, a protocol, a pattern, a unit. Put code identifiers and paths in
  backticks. Give each technical name one sentence of definition at its first
  use, then use it unchanged.
- **Noun clusters have three words at most.** Write "the limit for tool calls in
  the agent", not "the agent tool call limit middleware".
- **Use an article or a demonstrative before a noun**: "the", "a", "an", "this",
  "these".
- **No contractions.** Write "does not", "it is", "cannot".

## Verbs

- **Use the active voice.** Write who or what does the action: "The verifier
  removes the claim", not "The claim is removed". The passive voice is permitted
  in a description only when the doer is not known or does not matter.
- **Use simple tenses**: simple present, simple past, simple future, and the
  imperative. Write "The agent called the tool", not "The agent has called the
  tool".
- **Do not use the -ing form of a verb**, unless it is part of a technical name
  ("rate limiting", "streaming"). Write "When the API gets a request", not "When
  receiving a request".
- **Use a verb for an action.** Write "The script checks the schema", not "The
  script does a check of the schema", unless the noun is the more common form.

## Sentences

- **One topic in each sentence.**
- **A sentence that describes has 25 words at most.**
- **A sentence that instructs has 20 words at most**, has one instruction, and
  starts with the verb in the imperative: "Open `agent.py`."
- **Put the condition first**: "If the query has no `LIMIT`, the tool adds one."
- **Use a vertical list** for three or more parallel items.
- **Use connecting words** to show how sentences relate: "thus", "but", "then",
  "as a result", "because".
- **Do not use semicolons.** Make two sentences.

## Paragraphs

- **One topic in each paragraph.** The first sentence states the topic.
- **A paragraph has six sentences at most.**
- **Go from what the reader knows to what is new.**

## Word counts

- A number, a unit, a code span, or a hyphenated word counts as one word.
- Text in a heading or a table header is not a sentence.
- Each item of a vertical list counts as its own sentence.

## Word choices this skill enforces

These choices come from the purpose of STE. Where the STE dictionary says
something different for your edition, the dictionary wins.

| Do not write | Write |
|---|---|
| utilize, leverage | use |
| perform, carry out | do |
| ensure | make sure |
| in order to | to |
| prior to | before |
| via | through, with |
| e.g. | for example |
| i.e. | that is |
| etc. | the full list, or "and other" plus the noun |
| since (for a reason) | because |
| should, may, might | "must" for a rule, "can" for an ability, or a plain statement of fact |
| simply, just, easily, obviously, basically | nothing; remove the word |

## What the checker measures

`scripts/ste-check.mjs` measures the rules that a program can measure.

| Level | Rule |
|---|---|
| Error | A sentence longer than 25 words, or longer than 20 words in a numbered step |
| Error | A paragraph longer than six sentences |
| Error | A contraction |
| Warning | A likely passive verb |
| Warning | A likely perfect tense ("has", "have", "had" plus a participle) |
| Warning | An -ing form |
| Warning | A word from the table above |
| Warning | A semicolon |

The checker counts each item of a numbered list as an instruction. Thus the
steps of a workflow also stay under 20 words, which keeps a trace easy to
follow.

A warning is a question, not a verdict. Keep the flagged text when it is a
technical name or a permitted passive. The checker does not measure word
meaning, noun clusters, or topic. You check those when you read the debrief.
