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
  REPORT.md              verified-accomplishment ledger              writable
  plan/
    README.md            manifest: one row per plan, with status      writable
    001-<name>.md ...    zero-context plans                           FROZEN
    spec/                requirements, screen contracts, must-nots,
                         decisions.md (snapshot of the item's
                         Decisions at planning time)                  FROZEN
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

**The item's Decisions are fingerprinted too, by proxy.** Planning snapshots
the section verbatim into `plan/spec/decisions.md`, and `check.sh` answers
`BLOCKED decisions-drift` when the live section no longer matches the
snapshot. A decision is still changeable at any time — through
`tailrocks-record-decision`, which marks the affected plans `STALE` — but it
is never *silently* changeable: the gate fires until `tailrocks-plan`
re-runs and re-stamps the snapshot.

**No artifact carries its own history.** The commits carry it, with the
`Tailrocks-Skill` trailer naming the skill that produced each one. See
[`delivery-git-contract.md`](delivery-git-contract.md). The one exception is
`REPORT.md`: it records *what is verified true*, not what happened — current
state, restated each pass, never a log.

## Delivered work leaves the tree

A folder under `roadmap/` is work that is **not finished**. When the last
verification round is clean, every plan row is terminal, and Remaining is
empty, `tailrocks-reconcile` sets `DONE` and then deletes the whole folder and
its index row. When the last item goes, `roadmap/README.md` and `roadmap/`
itself go with it — an index of nothing is not a board, it is a leftover.

One thing stays behind in the tree: the item's verified report, moved to
`delivery/<slug>.md` in the retiring commit. It holds only what the rounds
*proved* — the final state of every fully accomplished capability, each with
its verifying evidence — never the attempts, never the unverified. `delivery/`
is created by the first retirement and never deleted, even when `roadmap/`
goes: it is the one place a reader can answer "what did this pipeline actually
ship, proven" without archaeology. Everything else about the item is in git,
addressable forever:

```sh
git log --format='%h %ad %s' --date=short -- roadmap/<slug>/   # what happened
git show <commit>^:roadmap/<slug>/README.md                    # the item as it stood
```

The reason the folder goes is the same one that deleted the Log. An item that
stays after its work shipped is a document nobody updates and everybody
half-trusts — the state that let one delivery read `BLOCKED — only release
remains` while four capabilities were pending. `tailrocks-merge-pr` refuses to
merge a pull request whose item says `DONE` while the folder is still there.

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
| `DONE` | Every plan row DONE, the goal condition met, **and the last verification round found no blocking defect**. Terminal and short-lived: the item is retired in the same invocation that sets it | `tailrocks-reconcile` only |
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
- **`DONE` is a transition, not a resting place.** The invocation that sets it
  retires the item in the next commit: `roadmap/<slug>/` is deleted whole —
  item, `plan/`, `verification/`, `goal/` — and its index row goes with it.
  Two commits, one invocation, so a reviewer sees the item reach `DONE` and
  then be retired in the same pull request.
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

## Run

— (`goal/` once planned)
```

Section rules:

- **No section records history.** There is no Log: what happened is the commit
  series, read with the `Tailrocks-Skill` trailer. A section that would restate
  a commit is duplication that drifts and costs context on every read.
- Empty sections stay present and empty — an absent section reads "never
  considered", an empty one "not yet known"; only the latter is honest.
- Decisions, Vocabulary, and Must not are settled once written; changes go
  through `tailrocks-record-decision` so they are dated, reasoned, and
  propagated. Once a plan package exists, the Decisions section is also
  mechanically guarded: `plan/spec/decisions.md` snapshots it, `check.sh`
  answers `decisions-drift` on any mismatch, and only a `tailrocks-plan`
  re-run re-stamps the snapshot.
- `## Run` belongs to `tailrocks-plan`: it writes the pasteable execution
  blocks there when the package lands and refreshes them on every re-plan.
  Until then the section holds its placeholder — a `PLANNED` item with an
  empty `## Run` is a planning defect.
- Open questions vs Open research questions is the decision/fact split: "do
  we sync at all?" is a decision; "which sync engine fits?" is researchable.
  Misfiling a decision as researchable is how agents end up guessing.

## Roadmap index — `roadmap/README.md`

```markdown
# Roadmap

| Slug | Title | Status | Remaining |
|------|-------|--------|-----------|
| <slug> | <title> | DRAFT | — |

Run an item: follow `roadmap/<slug>/goal/START.md` — each item's `## Run`
section carries its pasteable start and resume blocks once planned.
```

`Remaining` is the count of open statements in the item's Remaining section,
or `—` before anything was verified. Every skill that changes an item's status
updates its row in the same edit. The index is a board, not a store — one line
per item; all content lives in the item, and when it changed is `git log`.
