# Roadmap Item Format

One product-oriented document per idea, read and written by the whole
delivery family: `tailrocks-idea` creates it; `tailrocks-brainstorm`,
`tailrocks-record-decision`, and `tailrocks-research` shape it;
`tailrocks-finalize` finalizes it; `tailrocks-plan` consumes it. One item =
one folder `roadmap/<slug>/` with `README.md` as the item plus optional
sibling assets (mockup images, diagrams).

## Status machine

Exactly one status at all times, in the item header and mirrored in the
index. Statuses and owners:

| Status | Meaning | Set by |
|---|---|---|
| `DRAFT` | Raw capture; not yet shaped | `tailrocks-idea` |
| `SHAPING` | Being shaped; open questions remain | `tailrocks-brainstorm`, `tailrocks-record-decision`, `tailrocks-research` (first touch of a DRAFT item) |
| `READY` | Product-complete: no open decision-type questions; fit for planning | `tailrocks-finalize` only (or an explicit user override, recorded in the Log) |
| `PLANNED` | `plans/<slug>/` exists with a GOAL.md | `tailrocks-plan` |
| `IN EXECUTION` | An executor started working the plans | the executor protocol; `tailrocks-reconcile` when truing up |
| `DONE` | All plan rows DONE and the goal condition met | the executor protocol; `tailrocks-reconcile` when truing up |
| `PARKED (reason; was: STATUS)` | Deliberately paused at any stage | the user, via any skill; un-parked by `tailrocks-record-decision` |

Transition rules:

- Forward movement follows the table; skipping `READY` requires a user
  override, and the override is logged.
- A `tailrocks-record-decision` on a `READY`/`PLANNED`/`IN EXECUTION` item
  that changes product intent moves it back to `SHAPING` and marks affected
  plans stale — a reopened decision reopens the item; silence about it is a
  defect.
- Every status change appends a Log entry: date, skill, one-line reason.
- A skill never writes a status it does not own.
- Parking: any skill may set `PARKED (reason; was: SHAPING)` on the user's
  explicit instruction, recording the status it left in the header and Log.
- Resuming: `tailrocks-record-decision` un-parks on explicit user instruction
  to the recorded `was:` status. A READY/PLANNED item whose intent changed
  while parked follows the normal reopen rule instead. Record a Log entry.

## Item template — `roadmap/<slug>/README.md`

```markdown
# <Title>

- **Status**: DRAFT
- **Slug**: <slug>
- **Created**: <YYYY-MM-DD> · **Updated**: <YYYY-MM-DD>
- **Plan**: — (plans/<slug>/ once planned)

## Intent

What this is, for whom, and why — in the user's own words. Once shaped, ends
with the destination sentence: what is observably true when this ships.

## Vocabulary

Terms this item uses with exactly one meaning.
- **<Term>**: <what it IS, one–two sentences>. _Avoid_: <synonyms>.

## Decisions

Settled choices, newest last. Downstream skills treat these as fixed.
- <YYYY-MM-DD> — **<decision>**. Because <reason>.

## Capabilities

What the thing does; one concrete bullet each.

## Screens

One subsection per screen; mockups are schematic layout intent (ASCII,
image file in this folder, or Mermaid).

### <Screen name>
<mockup>
- **Purpose**: <one line>
- **States**: <default / empty / loading / error — what each shows>
- **Key interactions**: <element — behavior>

## Flows

Cross-screen journeys: numbered steps, screens touched, failure points.

## Data & integrations

Data owned, where it lives, external systems touched and what is settled
about each.

## References

Repositories, APIs, products, design sources — URL or path + one line on
what it contributes.

## Research

Linked research topics, one line each on what the topic informs here.
- [`research/<topic>/`](../../research/<topic>/README.md) — <what it informs>

## Must not

Hard non-goals and forbidden approaches, each with its reason.
- MUST NOT <statement> — <reason>.

## Quality bar

What "works" means to the user: acceptance feel, checks, behaviors.

## Open questions

Decision-type questions only — each blocks READY until resolved or moved to
Deferred by the user.

## Open research questions

Researchable facts an agent can answer without the user; `tailrocks-research`
and `tailrocks-plan`'s research pass own these.

## Deferred

Consciously postponed decisions: reason + revisit trigger.

## Log

- <YYYY-MM-DD> — tailrocks-idea — created (DRAFT).
```

Section rules:

- Empty sections stay present and empty — an absent section reads "never
  considered", an empty one "not yet known"; only the latter is honest.
- Decisions, Vocabulary, and Must not are settled once written; changes go
  through `tailrocks-record-decision` so they are dated, reasoned, and
  propagated.
- Open questions vs Open research questions is the decision/fact split: "do
  we sync at all?" is a decision; "which sync engine fits?" is researchable.
  Misfiling a decision as researchable is how agents end up guessing.

## Roadmap index — `roadmap/README.md`

```markdown
# Roadmap

| Slug | Title | Status | Plan | Updated |
|------|-------|--------|------|---------|
| <slug> | <title> | DRAFT | — | <date> |
```

Rows sorted by Updated, newest first. Every skill that changes an item's
status updates its row in the same edit. The index is a board, not a store —
one line per item; all content lives in the item.
