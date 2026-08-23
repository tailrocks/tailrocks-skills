# Context routing

## The three-layer economy

A skill spends context at three prices. The **description** loads on every
request in clients that list skills — it competes for a truncating listing
budget and is the most expensive prose in the tree. The **router**
(`SKILL.md` body) loads whole on invocation and stays for the session;
every behavior in it competes with every other for the executing agent's
attention, so adding a section taxes the sections already there. Content
under **`references/`** costs nothing until read.

Consequences, each binding:

- Depth defaults to `references/`. The router carries *when to read* a
  reference and at most one rule worth holding at router level — never a
  summary of the reference's contents. A router section that reads like a
  table of contents is dilution with no benefit.
- Assume the executing agent is smart. Challenge every sentence: does it
  say something the agent would not already do? Background explanations,
  definitions of common terms, and restated defaults are cut.
- A load-bearing requirement gets a structural cue — a named bullet, a
  heading, a labeled sentence. Buried as the third idea in a four-idea
  paragraph, it surfaces only sometimes, and that intermittency looks like
  a flaky check instead of the prose defect it is.
- A router has at most 200 body lines. At the limit, an addition replaces or
  extracts existing material. Two sections gesturing at one obligation are
  weaker than one that states it.

## Match the form to the failure

Classify the baseline failure before writing a word; the form that fixes
one failure type measurably backfires on another.

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Knows the rule, skips it under pressure | Prohibition + rationalization counters + red flags | Soft guidance ("prefer…", "consider…") |
| Complies, but the output has the wrong shape | Positive recipe: state what the output IS — parts, in order | Prohibition list ("don't restate", "never narrate") |
| Omits an element it already produces | Structural: a required slot in the template it fills | Prose reminders near the template |
| Behavior should depend on context | Conditional keyed to an observable predicate | Unconditional rule + exemption clauses |

Why prohibitions backfire on shaping problems: under a competing incentive
the agent negotiates with "don't X"; a recipe leaves nothing to negotiate
— the output matches the stated shape or it does not. Two wording rules
survive every test: **no nuance clauses** ("don't X unless it matters"
reopens the negotiation — express a real exception as its own conditional
on an observable predicate), and **exemption clauses don't scope** ("this
limit doesn't apply to code blocks" still suppresses code blocks —
restructure so the rule cannot reach the exempt part).

For discipline forms, close loopholes explicitly (forbid the specific
workarounds, not just the act), state that violating the letter is
violating the spirit, and keep a rationalization table built from real
baseline runs — every excuse an agent actually used, with its counter.

## Degrees of freedom

Match specificity to fragility. High freedom (goals and heuristics) when
multiple approaches are valid and context decides. Medium freedom (a
pattern with parameters) when a preferred shape exists but variation is
fine. Low freedom (exact commands, few or no parameters) when the
operation is fragile and consistency is the point. Over-specifying a
robust task wastes tokens and produces brittle compliance;
under-specifying a fragile one produces confident breakage.

## The description

The description is the trigger, nothing else.

- **Triggering conditions only — never a workflow summary.** A
  description that sketches the process becomes a shortcut: the agent
  follows the sketch and skips the body, silently dropping every rule
  that lives there. Symptoms, situations, and content types decide
  triggering; the body owns the how.
- Carry the words a routing agent would match on: the artifact names,
  symptoms, and task verbs the skill serves — and the do-not-use clause
  naming the neighboring skill's territory.
- Manual-only trees add their guard sentence verbatim and budget the rest
  (250 characters after the guard, here). Third person, no first-person
  offers.

## Naming and examples

Name by the action or the owned artifact, distinctively enough to pick
out of a listing — not a generic category label. One excellent,
runnable, real example beats several mediocre ones; the executing agent
ports well. Never: narrative war stories as examples ("in session X we
found…"), the same example in three languages, fill-in-the-blank
templates that teach nothing, or generic labels (`step1`, `helper2`).

## Anti-pattern checklist

Run every draft against these before validation:

- Description summarizes workflow, or lacks trigger words, or exceeds the
  tree's budget.
- Router summarizes a reference; reference content restates the router.
- Capitalized MUST/NEVER stacked where an explained *why* would bind
  better — all-caps without a reason is a yellow flag for a rule the
  author could not justify.
- A nuance clause or exemption clause instead of a predicate conditional.
- A rule enforceable by a validator or gate living in prose instead.
- Two skills sharing one responsibility, or one skill carrying two.
- Force-loading references (inline includes) instead of routing by
  when-to-read.
- A substantial deliverable dumped into the conversation, or a file
  written for output with no reader beyond the current session — the
  output-contract section owns the choice.
- Changelog prose or a reference to the skill's own previous version —
  "this replaces the earlier…", "formerly…", "we now…". A skill states
  current doctrine only; an agent loading it has no earlier version to
  compare against, so the contrast is pure noise. History lives in git.
- Any reference to an external project — a repository or gist URL, a
  named skill or plugin collection, an author credited as the source.
  Needing the reference means the information belongs here: extract it,
  rephrase it, make it part of this project. Provenance lives in git and
  pull-request history, never in shipped content. Official documentation
  and release pages of house-adopted tools, and placeholder URLs in
  templates, are the only URL classes a skill carries.
