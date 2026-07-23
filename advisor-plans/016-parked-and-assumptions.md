# Plan 016: Give PARKED an exit and falsified assumptions a propagation path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**: confirm plan 001 is DONE in
> `advisor-plans/README.md` (it edits `tailrocks-reconcile/SKILL.md` and
> `goal-handoff.md` first; this plan layers on top). Then
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-idea/references/roadmap-item-format.md skills/tailrocks-record-decision/SKILL.md skills/tailrocks-reconcile/SKILL.md skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-plan/references/coverage-ledger.md`
> and re-locate excerpts by text in changed files; unexplained mismatch
> = STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: advisor-plans/001 (file overlap: reconcile SKILL.md,
  goal-handoff.md), advisor-plans/002 (coverage-ledger.md `A#` context)
- **Category**: tech-debt
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

Two one-way doors in the status machine. PARKED has an entry ("the user,
via any skill", "at any stage") and no defined exit — no skill's steps
mention it, so a parked item is a dead end the pipeline can't resume.
And the plan layer leans on ledger assumptions (`A#` rows appear in plan
STOP conditions: "the assumption <A#> turns out false"), but a falsified
assumption has no recording/propagation path — a reversed *decision*
reopens an item via record-decision; a dead assumption just stops one
plan and evaporates.

## Current state

Verified at `f2c4be5`:

- `skills/tailrocks-idea/references/roadmap-item-format.md:23`:
  `| PARKED (reason) | Deliberately paused at any stage | the user, via
  any skill |` — the transition rules (:25-34) never define resumption;
  `grep -rn "PARKED" skills/` → this single line (plus README/AGENTS
  summaries).
- Same file :34: "A skill never writes a status it does not own." —
  also violated today by reconcile setting IN EXECUTION/DONE
  (:21-22 assigns both to "the executor protocol"); reconcile
  SKILL.md:71-73 sets them. Plan 001 did not touch the ownership table
  — fixing it lands here.
- `A#` rows: `skills/tailrocks-plan/references/coverage-ledger.md`
  Assumptions table ("Why safe | Falsified by") and pipeline rule
  "every `A#` appears in the STOP conditions of the plans that lean on
  it"; `plan-template.md` STOP list includes "The assumption '<A#> from
  the ledger' turns out false."
- `skills/tailrocks-record-decision/SKILL.md` — decision lifecycle
  (validate → record dated → propagate → reconcile status); nothing
  covers assumption falsification (it is a *fact* event, not a user
  decision — but its propagation shape is the same).
- `skills/tailrocks-plan/references/goal-handoff.md` executor protocol —
  post-001 it has a STALE STOP branch; nothing tells an executor what to
  do beyond stopping when an `A#` dies.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |

## Scope

**In scope**:
- `skills/tailrocks-idea/references/roadmap-item-format.md`
  (status table + transition rules)
- `skills/tailrocks-record-decision/SKILL.md` (PARK/UNPARK + assumption
  handling)
- `skills/tailrocks-reconcile/SKILL.md` (assumption re-test in
  drift-check; ownership row alignment)
- `skills/tailrocks-plan/references/goal-handoff.md` (executor's
  falsified-assumption reporting line)
- `skills/tailrocks-plan/references/coverage-ledger.md` (A# row status
  values)

**Out of scope**:
- A new `record-assumption` skill — rejected: assumptions are created by
  tailrocks-plan and killed by facts; their lifecycle fits inside
  existing skills (this plan wires it). Revisit only if this wiring
  proves insufficient.
- AGENTS.md/README pipeline summaries (follow-on wording, one line each,
  allowed if the validator's catalog check requires nothing — keep to
  the minimum).

## Git workflow

- Branch: `advisor/016-parked-and-assumptions`.
- Conventional Commits, DCO (`git commit -s`). Main PR-only; no push/PR
  unless instructed.

## Steps

### Step 1: Define PARKED's exit in the format

In `roadmap-item-format.md` transition rules add:

> - Parking: any skill may set `PARKED (reason)` on the user's explicit
>   instruction, recording the status it left (`PARKED (reason; was:
>   SHAPING)`) in the header and Log.
> - Resuming: `tailrocks-record-decision` un-parks on the user's
>   explicit instruction — status returns to the recorded `was:` value
>   (a `READY`/`PLANNED` item whose intent changed while parked goes
>   back through the normal reopen rule instead), with a Log entry.

Update the status-table `Set by` cell for PARKED: "the user, via any
skill; un-parked by `tailrocks-record-decision`".

**Verify**: `grep -n "was:" skills/tailrocks-idea/references/roadmap-item-format.md`
→ ≥ 2 hits.

### Step 2: Align the ownership table with reconcile

In the same status table, add `tailrocks-reconcile` as co-owner
("truing-up") in the `Set by` cells for `IN EXECUTION` and `DONE`, so
:34's "never writes a status it does not own" holds.

**Verify**: `grep -n "tailrocks-reconcile" skills/tailrocks-idea/references/roadmap-item-format.md`
→ ≥ 2 hits.

### Step 3: Teach record-decision to un-park and to bury assumptions

In `record-decision/SKILL.md`:

- Step 4 gains: "An explicit user instruction to park or resume is a
  recordable decision: park per the format's parking rule; un-park to
  the recorded `was:` status (through the reopen rule when intent
  changed)."
- New boundary bullet: "A falsified planning assumption reported by an
  executor or reconcile is recorded like a decision reversal: date it,
  strike the assumption's premise wherever the item leaned on it,
  propagate (step 3), and when plans exist mark the plans that listed
  that `A#` STALE with the falsification as the reason."

**Verify**: `grep -n "falsified" skills/tailrocks-record-decision/SKILL.md`
→ ≥ 1 hit; `grep -n "un-park" skills/tailrocks-record-decision/SKILL.md`
→ ≥ 1 hit.

### Step 4: Close the loop from the execution side

- `goal-handoff.md` executor protocol, the assumption STOP: extend to
  "…report which `A#` failed and what was observed; the user routes it
  through tailrocks-record-decision, which marks the leaning plans
  STALE."
- `reconcile/SKILL.md` step 5 (drift-check TODO): add "Re-test each
  `A#` assumption the TODO plans lean on (their STOP conditions name
  them) against its 'Falsified by' signal; a dead assumption marks
  those plans `STALE` and is routed to `tailrocks-record-decision` for
  item propagation."
- `coverage-ledger.md` Assumptions table: add status values
  `holds | falsified (date, routed)` so the ledger reflects it.

**Verify**: `grep -n "A#" skills/tailrocks-reconcile/SKILL.md` → ≥ 1 hit;
`grep -n "falsified" skills/tailrocks-plan/references/coverage-ledger.md`
→ ≥ 1 hit.

### Step 5: Validate

**Verify**: `bun run scripts/validate-skills.ts` → exit 0,
`Validated 14 skills.`

## Test plan

Greps above; human walk-through of one narrative: plan 002's `A#`
("assume single-instance store") falsified mid-loop → executor STOPs
naming it → user runs record-decision → item propagated + plans STALE →
tailrocks-plan re-run path (post-001) accepts. Confirm no step of that
story lacks an owning sentence after this plan.

## Done criteria

- [ ] PARKED has park/resume rules with `was:` memory; format table
      names the un-parker
- [ ] Ownership table includes reconcile for IN EXECUTION/DONE
- [ ] record-decision handles un-park + falsified assumptions;
      reconcile re-tests A#s; executor reports the route; ledger has
      the falsified status
- [ ] The walk-through narrative has an owner for every step
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Plan 001 is not DONE (shared files; and the STALE mid-loop branch this
  plan extends does not exist yet).
- The `was:` convention conflicts with any existing status parser
  (search first: nothing parses statuses today outside prose — if
  something does by then, report).

## Maintenance notes

- Assumptions now have a full lifecycle: born in the ledger (plan),
  guarded in STOP conditions (template), re-tested (reconcile), buried
  with propagation (record-decision). Plan 012's walkthrough scene 9
  could gain one sentence on it — optional follow-up.
- Reviewer focus: step 3's boundary bullet must not let an *agent*
  invent a falsification — evidence standard applies (the falsifying
  signal named in the ledger row).
