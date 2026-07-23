# Plan 001: Make the /goal executor contract self-consistent and finishable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do
> not improvise. When done, update the status row for this plan in
> `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-plan/references/plan-template.md skills/tailrocks-plan/SKILL.md skills/tailrocks-reconcile/SKILL.md`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live files before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

The tailrocks-plan skill produces a package that an autonomous `/goal` loop
executes. As written, that loop cannot finish: the completion condition
("every row is DONE") is unsatisfiable once any row is legitimately
REJECTED or STALE; every plan's own done criteria forbid the very hub-file
status flip the protocol mandates; the executor is told to mutate the
roadmap item without authorization or the index-row instruction; a STALE
row has no defined mid-loop behavior; the resume prompt contradicts the
reconcile skill on dead-session recovery; the package itself is never
committed, so the "persistent memory" the loop relies on evaporates on any
clean checkout. Eight defects, one file family, all text fixes.

## Current state

All excerpts verified at commit `f2c4be5`.

- `skills/tailrocks-plan/references/goal-handoff.md` — the hub + GOAL.md
  reference.
  - Lines 25–27 (status enum): `TODO | IN PROGRESS | DONE | BLOCKED
    (one-line reason) | REJECTED (one-line rationale) | STALE (decision
    reopened it; re-plan pending)`
  - Line ~50 (protocol step 1): "Set the roadmap item's status to IN
    EXECUTION on the first plan you start." — no path to the item in the
    protocol itself, no `roadmap/README.md` index instruction, and plans'
    scope forbids the write.
  - Line ~53 (step 2): "Pick the first TODO plan whose dependencies are
    all DONE." — STALE never mentioned anywhere in the protocol.
  - Line ~63 (step 7): "When every row is DONE: run the goal condition's
    commands yourself, set the roadmap item's status to DONE with a Log
    entry, and stop."
  - Lines ~70–72: "If a loop died, stalled, or the repository moved on
    since planning, run the tailrocks-reconcile skill on this slug before
    resuming — statuses in this file are only trustworthy after
    reconciliation."
  - Lines ~90–94 (block 1): "Every row in the Status column of
    plans/<slug>/README.md is DONE, and <primary gate command> exits 0,
    and <secondary gate command> exits 0. Or stop after <N> turns."
  - Line ~109 (block 2 last line): "Done means: every status row DONE and
    <primary gate command> exits 0." — secondary gate and turn bound
    missing, though lines ~80–81 claim block 2 restates block 1's
    condition for Codex/Grok.
  - Lines ~114–122 (block 3): resume verifies "the cheapest done criterion
    of the most recent DONE row" and continues IN PROGRESS rows — which
    contradicts the reconcile-first rule at ~70–72 and the reconcile
    skill's reset semantics.
  - Lines ~124–129 (Bounds): "Turn budget <N> assumes ~<plans × per-plan
    estimate>" — no per-plan estimate is defined anywhere.
- `skills/tailrocks-plan/references/plan-template.md`
  - Line ~143 (Scope): "**In scope** (the only files to create or
    modify): <explicit list>"
  - Lines ~186–188 (Done criteria): both "- [ ] No files outside the
    in-scope list modified (`git status`)" and "- [ ] `plans/<slug>/README.md`
    status row updated" — mutually exclusive as written.
- `skills/tailrocks-plan/SKILL.md`
  - Line ~27 (Boundaries): "Keep source, configuration, dependencies, and
    Git state unchanged." — so the finished package is never committed;
    goal-handoff.md ~156–158 nevertheless claims "any fresh session
    reconstructs exact progress by reading one file", and ~131–135
    documents headless `claude -p` runs.
- `skills/tailrocks-reconcile/SKILL.md`
  - Steps 2–3 (lines ~45–54): re-run done criteria for **every** DONE row;
    reset IN PROGRESS rows to TODO/BLOCKED ("A dead session's claim never
    stands").
- Repo conventions: prose reference files, ~72-char wrapping, imperative
  bullet style — match `goal-handoff.md`'s existing voice.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate skills | `bun run scripts/validate-skills.ts` | exit 0, `Validated 14 skills.` |
| Grep assertions | `grep -n "<pattern>" <file>` | per step below |

Bun is installed via mise. If `bun` is not on PATH, use the newest
`~/.local/share/mise/installs/bun/*/bin/bun`.

## Scope

**In scope** (the only files you should modify):
- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/references/plan-template.md`
- `skills/tailrocks-plan/SKILL.md`
- `skills/tailrocks-reconcile/SKILL.md` (one clause, step 6 of this plan)

**Out of scope** (do NOT touch, even though they look related):
- `skills/tailrocks-plan/references/coverage-ledger.md` and
  `spec-format.md` — owned by plan 002.
- `skills/tailrocks-record-decision/SKILL.md` — its STALE-marking behavior
  is correct; only the consumer side changes here.
- `skills/tailrocks-idea/references/roadmap-item-format.md` — status
  ownership wording is handled in plan 016.
- Any wording changes beyond the eight defects (canonicalization is plan 009).

## Git workflow

- Branch: `advisor/001-executor-contract-fixes` (repo convention: short
  `feat/...`-style branches also acceptable).
- Conventional Commits with DCO signoff: `git commit -s -m "fix(skills): ..."`.
  Main is PR-only; do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the completion predicate everywhere it appears

In `goal-handoff.md`, replace the three "every row … DONE" predicates:

- Block 1 (~line 91): "Every row in the Status column of
  plans/<slug>/README.md is DONE or REJECTED, no row is STALE, BLOCKED, or
  IN PROGRESS, and <primary gate command> exits 0, and <secondary gate
  command> exits 0. Or stop after <N> turns."
- Protocol step 7 (~line 63): same predicate ("When every row is DONE or
  REJECTED and none is STALE, BLOCKED, or IN PROGRESS: …").
- Block 2 last line (~109): mirror block 1 in full — both gates AND the
  turn bound (fixes the Codex/Grok weaker-gate drift; the reference's own
  claim at ~80–81 is that block 2 restates block 1).

**Verify**: `grep -c "DONE or REJECTED" skills/tailrocks-plan/references/goal-handoff.md`
→ `3` (block 1, step 7, block 2).

### Step 2: Authorize and specify the protocol's non-source writes

In `goal-handoff.md`'s "Executor protocol" section, add one paragraph
before step 1 (wording may be tightened, content must include all four
items):

> Protocol writes: this file's Status column, and the roadmap item at
> `roadmap/<slug>/README.md` (status + Log) with its row in
> `roadmap/README.md` updated in the same edit. These writes are part of
> the protocol, sit outside every plan's Scope section, and are always
> permitted. Commit each status flip (hub, and item when it changes)
> together with the work it records.

Then in step 1 and step 7, name the paths explicitly ("set
`roadmap/<slug>/README.md` to IN EXECUTION … update its `roadmap/README.md`
row in the same edit").

**Verify**: `grep -n "roadmap/README.md" skills/tailrocks-plan/references/goal-handoff.md`
→ at least 2 hits inside the protocol section.

### Step 3: Reconcile the plan template's done criteria with protocol writes

In `plan-template.md`:

- Change the done criterion "No files outside the in-scope list modified
  (`git status`)" to "No files outside the in-scope list modified
  (`git status`) — excluding the protocol writes: `plans/<slug>/README.md`
  status rows and the roadmap item + index".
- In the Scope section's template text, add one sentence: "The hub
  `plans/<slug>/README.md` and the roadmap item are protocol-writable and
  never listed in scope."

**Verify**: `grep -n "protocol" skills/tailrocks-plan/references/plan-template.md`
→ hits in both Scope and Done criteria sections.

### Step 4: Define STALE (and BLOCKED-dependency) behavior mid-loop

In `goal-handoff.md` protocol, add to step 2: "If the first eligible plan,
or any dependency of a TODO plan, is STALE: stop the loop and report
'package reopened — run tailrocks-plan <slug> to refresh, then resume'.
Never build on top of a STALE or BLOCKED row." Add the same one-liner to
the kickoff prompt (block 2) and resume prompt (block 3).

**Verify**: `grep -c "STALE" skills/tailrocks-plan/references/goal-handoff.md`
→ ≥ 4 (enum + protocol + two prompts).

### Step 5: Make block 3 defer to reconcile

Replace block 3's body so recovery has one contract: the resume prompt
instructs — "If this session is resuming after a dead or stalled loop, or
the repository changed since planning, first run the tailrocks-reconcile
skill on this slug and trust only its refreshed statuses. Then proceed by
the Executor protocol." Remove the "verify the cheapest done criterion of
the most recent DONE row" and "continue IN PROGRESS" instructions (reconcile
owns both: it re-verifies all DONE rows and resets abandoned IN PROGRESS).

**Verify**: `grep -n "cheapest done criterion" skills/tailrocks-plan/references/goal-handoff.md`
→ exactly 1 hit remaining (protocol step 2's dependency spot-check), none in
block 3.

### Step 6: Commit the package; keep reconcile consistent

- In `skills/tailrocks-plan/SKILL.md` Boundaries, change "Keep source,
  configuration, dependencies, and Git state unchanged." to "Keep source,
  configuration, and dependencies unchanged. The only Git change is one
  commit adding the finished `plans/<slug>/` package (and the item's
  status flip) at hand-off; never commit anything else."
  Add to step 7: "Commit the package as the final action before reporting."
- In `skills/tailrocks-reconcile/SKILL.md` Boundaries, the clause "No
  installs, no formatters, no commits, nothing that mutates the working
  tree" gains: "— except committing the hub/item status corrections this
  skill itself made."
- In `goal-handoff.md` Bounds section, add the per-plan estimate the turn
  budget formula needs: "Default estimate: 10 turns per S plan, 20 per M,
  35 per L; N = sum × 1.5, rounded up."

**Verify**: `grep -n "one commit adding" skills/tailrocks-plan/SKILL.md` → 1 hit;
`grep -n "10 turns per S" skills/tailrocks-plan/references/goal-handoff.md` → 1 hit.

### Step 7: Validate

**Verify**: `bun run scripts/validate-skills.ts` → exit 0,
`Validated 14 skills.`

## Test plan

This repo's automated gate is the validator (no eval runner exists —
plan 013). Beyond it, run the grep assertions of steps 1–6 as the
regression suite; each is listed in Done criteria.

## Done criteria

- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] All six step Verify greps return the stated counts
- [ ] `grep -n "every row" skills/tailrocks-plan/references/goal-handoff.md`
      shows no bare "every row … is DONE" predicate without the
      REJECTED/STALE qualification
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any excerpt in "Current state" no longer matches the live file (drift
  since `f2c4be5`).
- A fix appears to require changing `coverage-ledger.md`, `spec-format.md`,
  or `roadmap-item-format.md` (owned by plans 002/016).
- You find an additional contradiction in the executor protocol not listed
  here — report it; do not fix ad hoc.

## Maintenance notes

- Plan 011 (example package) must demonstrate the corrected contract —
  its GOAL.md must use the new predicate and protocol-writes paragraph.
- Plan 016 touches `tailrocks-reconcile/SKILL.md` too; execute 001 first.
- Reviewer focus: the new completion predicate must stay grep-simple — a
  small model evaluates it against a transcript each turn.
