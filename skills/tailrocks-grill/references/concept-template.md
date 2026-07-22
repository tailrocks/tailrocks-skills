# Concept Document Template

The document the `tailrocks-grill` skill writes and `tailrocks-blueprint`
ingests. Its sections map one-to-one onto blueprint's coverage-ledger ID types,
so a finished concept passes blueprint intake without a single new question to
the user. `.md` or `.mdx`; default path `docs/concepts/<slug>.md`, mockup
assets in `docs/concepts/<slug>/`.

Every section is required to be present, populated or explicitly marked
`None — <reason>`. An absent section reads as "never discussed", which is
exactly the ambiguity grilling exists to kill.

```markdown
# <Concept name>

> Shaped with tailrocks-grill on <YYYY-MM-DD>. Decisions herein are settled
> user intent; open items are explicitly classified at the bottom.

## Intent

What this is, for whom, and why now — 3–6 sentences. Ends with the destination
sentence: what is observably true when this ships.

## Vocabulary

Terms this document uses with exactly one meaning. Opinionated: one word per
concept, synonyms listed to avoid.

- **<Term>**: <one–two sentence definition of what it IS>. _Avoid_: <synonyms>.

## Decisions

Settled choices with their reasons — blueprint treats these as fixed
constraints, not findings to relitigate. Include the platform/stack decision
here; it closes that question for all downstream research.

- **<Decision>** — <choice>. Because <reason, one–two sentences>.

## Capabilities

What the thing does. One bullet per capability, imperative, concrete enough to
specify. (Blueprint assigns each an F# ledger ID.)

- <capability>

## Screens

One subsection per screen. Mockups are layout intent, not pixel truth —
ASCII schematics, embedded images, or Mermaid all work. (Blueprint: S#.)

### <Screen name>

<mockup>

- **Purpose**: <one line>
- **States**: <which of default / empty / loading / error exist, and what each shows>
- **Key interactions**: <element — what it does>

## Flows

Cross-screen journeys, one per subsection: numbered steps, screens touched,
where each can fail. (Blueprint: W#.)

## Data & integrations

The data this owns, where it lives, and every external system it talks to —
each integration with what is settled about it and a pointer when one exists.

## References

Repositories, APIs, products, and design sources the idea builds on or
imitates — each with a URL or path and one line on what it contributes.
(Blueprint: R#.)

## Must not

Hard non-goals and forbidden approaches, each with its reason. These become
blueprint's must-not registry and get inlined into every plan they could
tempt. (Blueprint: N#.)

- MUST NOT <statement> — <reason>.

## Quality bar

What "works" means to the user: the checks, behaviors, or feel that would make
them accept or reject the result. As concrete as they could be made.

## Open items

The only two kinds allowed:

### Open research questions
Facts an agent can find without the user — blueprint's research fan-out owns
these. One bullet each, phrased as an answerable question.

### Deferred
Consciously postponed decisions: each with its reason and the trigger for
revisiting. (Blueprint records these as deferrals, not gaps.)
```

## Rules

- **Decisions are load-bearing.** Anything in Decisions, Must not, or
  Vocabulary is settled; downstream skills do not reopen it. A user changing
  their mind edits the document (or re-runs grilling), which is what flips
  blueprint into its re-run reconcile path.
- **Facts carry sources.** Looked-up context inlined anywhere in the document
  keeps its URL / `file:line` / method, so blueprint's vetting can re-verify
  instead of re-researching.
- **No disguised decisions in Open items.** "Which sync engine?" is
  researchable; "do we sync at all?" is a decision and must not appear there.
  The classification step exists to enforce this line.
- **Mockups stay schematic.** Structure, regions, states, navigation — enough
  for blueprint's screen contracts. Pixel-perfect design is an execution
  concern.
- **The user owns the voice.** The document states their intent in their
  terms; grilling contributes structure and precision, not invented scope.
