# Roadmap Item Format

One product-oriented document per idea, read and written by the whole
delivery family: `tailrocks-idea` creates it; `tailrocks-brainstorm`,
`tailrocks-record-decision`, and `tailrocks-research` shape it;
`tailrocks-finalize` finalizes it; `tailrocks-plan` plans it;
`tailrocks-record-feedback` and `tailrocks-prove` judge what shipped;
`tailrocks-reconcile` trues it up.

## One item, one folder

Everything about an item lives under `roadmap/<slug>/`. There is no parallel
tree to keep in step, and no artifact about the item lives anywhere else.

```
roadmap/<slug>/
  README.md              the item — intent, decisions, status        writable
  plan/
    README.md            manifest: one row per plan, with status      writable
    001-<name>.md ...    zero-context plans                           FROZEN
    spec/                requirements, screen contracts, must-nots    FROZEN
    coverage.md          the traceability ledger                      FROZEN
  verification/
    NN-feedback.md       what the user reported, verbatim             writable
    NN-report.md         what execution proved                        writable
  goal/
    START.md             the kickoff prompt an executor is handed     FROZEN
    RESUME.md            the resume prompt                            FROZEN
    check.sh             the machine gate                             FROZEN
  <assets>               mockups, diagrams, captures                  writable
```

**Frozen means fingerprinted.** `goal/check.sh` hashes every file marked
FROZEN and returns `BLOCKED plan-drift` when one changes, so the contract an
executor was handed cannot be edited to match what shipped. Everything the
loop must move — the item, the manifest's status rows, each verification
round — sits outside that hash by design. Re-planning is how a frozen file
changes; editing it is not.

**No artifact carries its own history.** The commits carry it, with the
`Tailrocks-Skill` trailer naming the skill that produced each one. See
[`delivery-git-contract.md`](delivery-git-contract.md).

## Status machine

Exactly one status at all times, in the item header and mirrored in the
index. Statuses and owners:

| Status | Meaning | Set by |
|---|---|---|
| `DRAFT` | Raw capture; not yet shaped | `tailrocks-idea` |
| `SHAPING` | Being shaped; open questions remain | `tailrocks-brainstorm`, `tailrocks-record-decision`, `tailrocks-research` (first touch of a DRAFT item) |
| `READY` | Product-complete: no open decision-type questions; fit for planning | `tailrocks-finalize` only (or an explicit user override, stated in that commit) |
| `PLANNED` | `roadmap/<slug>/plan/` and `goal/` exist | `tailrocks-plan` |
| `IN EXECUTION` | An executor started working the plans | the executor protocol; `tailrocks-reconcile` when truing up |
| `DONE` | Every plan row DONE, the goal condition met, **and the last verification round found no blocking defect** | `tailrocks-reconcile` only |
| `PARKED (reason; was: STATUS)` | Deliberately paused at any stage | the user, via any skill; un-parked by `tailrocks-record-decision` |

Transition rules:

- Forward movement follows the table; skipping `READY` requires a user
  override, and the override is logged.
- A `tailrocks-record-decision` on a `READY`/`PLANNED`/`IN EXECUTION` item
  that changes product intent moves it back to `SHAPING` and marks affected
  plans stale — a reopened decision reopens the item; silence about it is a
  defect.
- Every status change is recorded by the commit that makes it — its subject
  says what changed and its `Tailrocks-Skill` trailer says who changed it. The
  item carries no log of its own.
- A skill never writes a status it does not own.
- `DONE` is never claimed from plan rows alone. A verification round that
  found blocking defects returns the item to `IN EXECUTION` with those defects
  standing as the remaining work.
- Parking: any skill may set `PARKED (reason; was: SHAPING)` on the user's
  explicit instruction, recording in the header the status it left.
- Resuming: `tailrocks-record-decision` un-parks on explicit user instruction
  to the recorded `was:` status. A READY/PLANNED item whose intent changed
  while parked follows the normal reopen rule instead.

## Item template — `roadmap/<slug>/README.md`

```markdown
# <Title>

- **Status**: DRAFT
- **Slug**: <slug>
- **Created**: <YYYY-MM-DD>
- **Plan**: — (`plan/` once planned) · **Verified**: — (`verification/` once run)

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
- **Design**: <pointer to the blessed design reference — a gallery
  manifest section, visual-test manifest section, or prototype sign-off —
  once a design-reference skill produced one; — until then. A screen with a
  visual surface needs one before `tailrocks-plan` will write its contract:
  the design stage runs between READY and planning, in the medium's own
  skill.>

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

## Remaining

What is not done yet, as observable statements. Written by
`tailrocks-reconcile` from verification evidence, emptied as rounds close.
An empty Remaining on a `DONE` item is the claim that nothing is left; on any
other status it means nobody has verified yet.
```

Section rules:

- **No section records history.** There is no Log: what happened is the commit
  series, read with the `Tailrocks-Skill` trailer. A section that would restate
  a commit is duplication that drifts and costs context on every read.
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

| Slug | Title | Status | Remaining |
|------|-------|--------|-----------|
| <slug> | <title> | DRAFT | — |
```

`Remaining` is the count of open statements in the item's Remaining section,
or `—` before anything was verified. Every skill that changes an item's status
updates its row in the same edit. The index is a board, not a store — one line
per item; all content lives in the item, and when it changed is `git log`.
