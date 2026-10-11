# Roadmap item format

One product-oriented document per idea. The whole delivery family
reads and writes it. `tailrocks-idea` creates it.
`tailrocks-brainstorm`, `tailrocks-record-decision`, and
`tailrocks-research` shape it. `tailrocks-finalize` finalizes it.
`tailrocks-plan` plans it. `tailrocks-record-feedback` and
`tailrocks-prove` judge the shipped work. `tailrocks-reconcile`
trues it up.

## One item, one folder

Everything about one item lives under `roadmap/<slug>/`. No
parallel tree stays in step with it. No artifact about the item
lives anywhere else.

```text
roadmap/<slug>/
  README.md              the item: intent, decisions, status        writable
  REPORT.md              verified-accomplishment ledger              writable
  plan/
    README.md            manifest: one row per plan, with status      writable
    001-<name>.md ...    zero-context plans                           FROZEN
    spec/                requirements, screen contracts, must-nots,
                         decisions.md (snapshot of the Decisions
                         of the item at planning time)              FROZEN
    coverage.md          the traceability ledger                      FROZEN
  verification/
    NN-feedback.md       the user report, verbatim                    writable
    NN-report.md         the proven execution result                   writable
  goal/
    START.md             the kickoff prompt handed to an executor     FROZEN
    RESUME.md            the resume prompt                            FROZEN
    check.sh             the machine gate                             FROZEN
  <assets>               mockups, diagrams, captures                  writable
```

**Frozen means fingerprinted.** `goal/check.sh` hashes every file
marked FROZEN and returns `BLOCKED plan-drift` when one file
changed. The contract handed to an executor cannot change to match
the shipped result. Everything that the loop must move stays
outside that hash by design: the item, the status rows of the
manifest, and each verification round. A re-plan is the only path
that changes a frozen file. An edit is not.

**The Decisions of the item are fingerprinted too, by proxy.**
Planning snapshots the section verbatim into
`plan/spec/decisions.md`. The gate script answers `BLOCKED
decisions-drift` when the live section no longer matches the
snapshot. A decision stays changeable at any time through
`tailrocks-record-decision`, which marks the affected plans
`STALE`. It is never silently changeable. The gate fires until
`tailrocks-plan` re-runs and re-stamps the snapshot.

**No artifact carries its own history.** The commits carry it, with
the `Tailrocks-Skill` trailer that names the skill that produced
each one. See
[`delivery-git-contract.md`](delivery-git-contract.md). The one
exception is `REPORT.md`. It records the verified truth, not the
events: current state, restated each pass, never a log.

## Delivered work leaves the tree

A folder under `roadmap/` is work that is **not finished**. When
the last verification round is clean, every plan row is terminal,
and Remaining is empty, `tailrocks-reconcile` sets `DONE`. Then
it deletes the whole folder and its index row. When the last item
goes, `roadmap/README.md` and `roadmap/` itself go with it. An
index of nothing is not a board. It is a leftover.

One file stays behind in the tree: the verified report of the
item. It moves to `delivery/<slug>.md` in the retiring commit. It
holds only the proven rounds: the final state of every fully
accomplished capability, each with its verifying evidence. It never
holds the attempts. It never holds the unverified claims.
`delivery/` starts with the first retirement and never leaves the
tree, even when `roadmap/` goes. It is the one place where a
reader answers "what did this pipeline ship, proven" without
archaeology. Everything else about the item stays in git,
addressable forever:

```sh
git log --format='%h %ad %s' --date=short -- roadmap/<slug>/  # history
git show <commit>^:roadmap/<slug>/README.md                   # the item
```

The folder goes for the same reason that removed the Log. An item
that stays after its work shipped is a document that nobody
updates and everybody half-trusts. That state once let one
delivery read `BLOCKED — only release remains` with four
capabilities still pending.

## Status machine

Exactly one status holds at all times, in the item header and
mirrored in the index. The table names the statuses and their
owners:

| Status | Meaning | Set by |
| --- | --- | --- |
| `DRAFT` | Raw capture, unshaped | idea |
| `SHAPING` | Shaping in progress | brainstorm, decision, research |
| `READY` | Product-complete | finalize only |
| `PLANNED` | Plan and goal exist | plan |
| `IN EXECUTION` | Executor works plans | executor, reconcile |
| `DONE` | Rows terminal, round clean | reconcile only |
| `PARKED` | Paused with reason | user, any skill |

Short names omit the `tailrocks-` prefix. `PARKED` carries
`(reason; was: STATUS)`. `DONE` needs every plan row DONE,
the goal condition met, and the last verification round
clean.

Transition rules:

- Forward movement obeys the table. A skip of `READY` needs a user
  override, and the override is logged.
- A `tailrocks-record-decision` on a `READY`, `PLANNED`, or
  `IN EXECUTION` item that changes product intent moves the item
  back to `SHAPING` and marks affected plans stale. A reopened
  decision reopens the item. Silence about it is a defect.
- Every status change is recorded by the commit that makes it. Its
  subject states the change and its `Tailrocks-Skill` trailer
  states the skill that changed it. The item carries no log of
  its own.
- A skill never writes a status that it does not own.
- `DONE` never rests on plan rows alone. A verification round that
  found blocking defects returns the item to `IN EXECUTION`, with
  those defects standing as the remaining work.
- **`DONE` is a transition, not a resting place.** The invocation
  that sets it retires the item in the next commit.
  `roadmap/<slug>/` leaves whole, with item, `plan/`,
  `verification/`, and `goal/`. Its index row goes with it.
  Two commits, one invocation, so a reviewer sees the item reach
  `DONE` and then retire in the same pull request.
- Parking: any skill sets `PARKED (reason; was: SHAPING)` on the
  explicit instruction of the user. It records the left status in
  the header.
- Resuming: `tailrocks-record-decision` un-parks on the explicit
  instruction of the user to the recorded `was:` status. A
  READY or PLANNED item whose intent changed during parking
  obeys the normal reopen rule instead.

## Item template — `roadmap/<slug>/README.md`

```markdown
# <Title>

- **Status**: DRAFT
- **Slug**: <slug>
- **Created**: <YYYY-MM-DD>
- **Plan**: — (`plan/` once planned) · **Verified**: — (`verification/` once run)

## Intent

What this is, for whom, and why — in the own words of the user.
Once shaped, it ends with the destination sentence: the observable
truth when this item ships.

## Vocabulary

Terms that this item uses with exactly one meaning.
- **<Term>**: <the definition, one or two sentences>. _Avoid_: <synonyms>.

## Decisions

Settled choices, newest last. Downstream skills treat these as fixed.
- <YYYY-MM-DD> — **<decision>**. Because <reason>.

## Capabilities

The behavior of the thing, one concrete bullet each.

## Screens

One subsection per screen. Mockups state schematic layout intent
(ASCII, an image file in this folder, or Mermaid).

### <Screen name>
<mockup>
- **Purpose**: <one line>
- **States**: <default / empty / loading / error — the content of each>
- **Key interactions**: <element — behavior>
- **Design**: <pointer to the blessed design reference, once a
  design-reference skill produced one; — until then>

## Flows

Cross-screen journeys: numbered steps, screens touched, failure points.

## Data & integrations

Data owned, the location of the data, external systems touched,
and the settled facts about each.

## References

Repositories, APIs, products, design sources — URL or path plus
one line on the contribution of each.

## Research

Linked research topics, one line each on the informed questions.
- [`research/<topic>/`](../../research/<topic>/README.md) — <the informed questions>

## Must not

Hard non-goals and forbidden approaches, each with its reason.
- MUST NOT <statement> — <reason>.

## Quality bar

The meaning of "works" to the user: acceptance feel, checks,
behaviors.

## Open questions

Decision-type questions only. Each blocks READY until resolved or
moved to Deferred by the user.

## Open research questions

Researchable facts that an agent answers without the user.

## Deferred

Consciously postponed decisions: reason plus revisit trigger.

## Remaining

The open work, as observable statements. Written by
`tailrocks-reconcile` from verification evidence, emptied as
rounds close.

## Run

— (`goal/` once planned)
```

Section rules:

- **No section records history.** There is no Log. The commit
  history shows the changes. A section that restates a commit is
  duplication that drifts and costs context on every read.
- Empty sections stay present and empty. An absent section reads
  "never considered". An empty one reads "not yet known". Only the
  second reading is honest.
- Decisions, Vocabulary, and Must not are settled once written.
  Changes go through `tailrocks-record-decision`, so they stay
  dated, reasoned, and propagated. Once a plan package exists, the
  Decisions section is also mechanically guarded.
  `plan/spec/decisions.md` snapshots it. `check.sh` answers
  `decisions-drift` on any mismatch. Only a `tailrocks-plan`
  re-run re-stamps the snapshot.
- `## Run` belongs to `tailrocks-plan`. The skill writes the
  pasteable execution blocks there when the package lands and
  refreshes them on every re-plan. Until then the section holds
  its placeholder. A `PLANNED` item with an empty `## Run` is a
  planning defect.
- Open questions and Open research questions split decisions from
  facts. "Do we sync at all" is a decision. "Which sync engine
  fits" is researchable. A decision misfiled as researchable is the
  path where an agent ends in a guess.

## Roadmap index — `roadmap/README.md`

```markdown
# Roadmap

| Slug | Title | Status | Remaining |
|------|-------|--------|-----------|
| <slug> | <title> | DRAFT | — |

Run an item: open `roadmap/<slug>/goal/START.md` — each item `## Run`
section carries its pasteable start and resume blocks once planned.
```

`Remaining` is the count of open statements in the Remaining
section of the item, or `—` before any verification. Every skill
that changes the status of an item updates its row in the same
edit. The index is a board, not a store: one line per item. All
content lives in the item, and `git log` shows the time of each
change.
