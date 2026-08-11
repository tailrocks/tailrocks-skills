# Plan 000: Gate-first goal condition, budget exhaustion is BLOCKED

> **Executor instructions**: Follow this plan exactly. Run preconditions first.
> Change prose and eval expectations only. Do not add hooks, scripts, or any
> executable runtime. A STOP condition means stop and report; do not improvise.

## Status

- **Priority**: P0
- **Effort**: S; one session
- **Risk**: LOW
- **Depends on**: none
- **Covers**: O2, O6
- **Guardrails**: M2, M4, M5
- **Research basis**: `advisor-plans/RESEARCH.md` F4-13, F4-03, F5-06
- **Trust label of result**: `advisory_prose`

## Why this matters

The generated `/goal` condition currently ends with `Or stop after <N> turns.`
inside the success predicate, so an exhausted loop satisfies the goal while
gates are red. The executor also flips rows to DONE from its own narrative
before any independent check. This one-session change makes fresh gate output
primary, status rows secondary, and budget exhaustion explicitly BLOCKED. It is
prose-only: it works today on every client and is the floor that Plan 002's
deterministic check later stands on.

## Preconditions — run before anything else

```sh
test "$(rtk git branch --show-current)" != main
test -z "$(rtk git status --porcelain=v1)"
rtk bun test scripts/
rtk bun run scripts/validate-skills.ts
rtk rg -n 'Or stop after' skills/tailrocks-plan/references/goal-handoff.md
```

Expected: branch is not main; tree clean; tests pass; validator prints
`Validated 15 skills.`; the last command still finds the defect (at least two
matches). If the defect is already absent, this plan is done — verify the Done
criteria and stop.

## Spec contract

### Requirement O2: gate-first advisory completion

The generated goal condition SHALL call completion only when, in this order:
every named gate command has exited 0 after the last repository or status
change; a reconcile pass (tailrocks-reconcile, or its manual steps) changed no
row; and every status row is terminal (DONE/REJECTED) with none STALE, BLOCKED,
or IN PROGRESS. Reaching a turn or time budget SHALL mark the active row
`BLOCKED (budget exhausted)` and SHALL NOT satisfy the goal condition.

#### Scenario: exhausted budget

- **WHEN** the bound is reached before verified completion
- **THEN** the active row becomes `BLOCKED (budget exhausted)` and the loop
  stops without any completion claim.

### Requirement O6: no unproven native-control claim

Lifecycle documents SHALL NOT instruct invoking a native `/goal` on a client
whose current locally-inspected version does not provide one. For current
Grok 1.0 (official commands: `/plan`, `/loop`), the generated blocks remain
usable as manual prompts, labeled as such.

## Must NOT

- **M2**: budget exhaustion must not appear in any success predicate.
- **M4**: no document may claim native goal control for a client without
  current local-version evidence; re-verify client versions at execution time —
  provider CLIs are volatile and the Grok fact was observed 2026-08-10.
- **M5**: prose stays lean; no new reference file, no duplicated protocol text.

## Starting state

- `skills/tailrocks-plan/references/goal-handoff.md:109-115` ends the condition
  with `Or stop after <N> turns.`; the same alternative appears near `:132-134`;
  the "Always bounded" rule near `:187-189` mandates that shape.
- `goal-handoff.md:60-79` lets the executor set DONE from its own status
  narrative, then evaluate gates.
- `skills/tailrocks-reconcile/SKILL.md:29-50` already states executor claims
  are untrusted and DONE means criteria pass now. Reuse that sentence; do not
  fork a second wording.
- `goal-handoff.md:98-101`, root `README.md`, and `AGENTS.md` group Grok with
  Claude Code and Codex as `/goal` clients.
- `examples/plan-package/plans/goal-live-status/GOAL.md` renders the current
  defective condition.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Script tests | `rtk bun test scripts/` | exit 0 |
| Skill validation | `rtk bun run scripts/validate-skills.ts` | `Validated 15 skills.` |
| Success branch removed | `rtk rg -n 'Or stop after\|or stop after\|Always bounded' skills/tailrocks-plan/references/goal-handoff.md examples/plan-package` | exit 1, no output |
| BLOCKED rule present | `rtk rg -n 'BLOCKED \(budget exhausted\)' skills/tailrocks-plan/references/goal-handoff.md` | at least two matches |
| Grok grouping removed | `rtk rg -n 'Claude Code, Codex, or Grok\|Codex and Grok' README.md AGENTS.md skills/tailrocks-plan` | exit 1, no output |
| Manual Grok wording | `rtk rg -n 'Grok' skills/tailrocks-plan/references/goal-handoff.md` | matches describe manual prompting only |
| Whitespace | `rtk git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/evals/**` where the old condition is encoded
- `examples/plan-package/plans/goal-live-status/GOAL.md`
- `skills/tailrocks-plan/SKILL.md`, root `README.md`, `AGENTS.md` — only the
  lines that claim Grok-native `/goal`
- `skills/tailrocks-reconcile/SKILL.md` — only if one cross-reference is needed

**Out of scope**: hooks, scripts, schemas, receipts, provider config,
manifests, plugin versions, any trust claim stronger than `advisory_prose`.

## Git workflow

Ordinary repository flow per `AGENTS.md`: feature branch, one commit,
`rtk git commit -s`, subject `fix(plan): separate completion from loop bounds`,
PR when the change set is complete.

## Steps

### Step 1: Make the success predicate gate-first

In `goal-handoff.md`, rewrite the condition template and the "Writing the
condition" rules so success is exactly: gates exit 0 after the last change →
reconcile changes nothing → all rows terminal. A DONE flip must cite command
output from the current session. Keep the condition under 4000 characters and
machine-checkable.

**Verify**: Skill validation passes; `rtk rg -n 'exits 0' skills/tailrocks-plan/references/goal-handoff.md`
still matches (gate phrasing retained).

### Step 2: Move the bound into a failure rule

Delete `Or stop after <N> turns` from every success block and delete the
"Always bounded" condition rule. Keep the `<N>` sizing guidance under Bounds,
restated as: at the bound, mark the active row `BLOCKED (budget exhausted)`,
preserve evidence, stop without a completion claim.

**Verify**: "Success branch removed" exits 1; "BLOCKED rule present" shows at
least two matches.

### Step 3: Encode the regression in evals

Update the tailrocks-plan eval case that checks rendered GOAL.md so it asserts:
gate text precedes terminal-row text; no success predicate contains
`or stop after`; budget exhaustion maps to BLOCKED; no hook or shell snippet is
generated by this plan.

**Verify**: `rtk bun test scripts/` exits 0; reintroducing the old `OR`
sentence in the fixture makes the case fail.

### Step 4: Correct the Grok lifecycle claim

Remove instructions to invoke a native Grok `/goal`. State that for current
Grok 1.0 the generated blocks are manual prompts with no persisted goal or stop
enforcement. Update the example GOAL.md to the new condition shape.

**Verify**: "Grok grouping removed" exits 1; "Manual Grok wording" matches only
manual-prompt descriptions; Skill validation passes.

## Done criteria

- [ ] Every command in "Commands you will need" produces its expected result.
- [ ] No acceptance predicate contains a turn/time-budget alternative.
- [ ] Budget exhaustion is explicitly BLOCKED in condition, kickoff, and Bounds.
- [ ] No executable hook or script was added.
- [ ] `rtk git status --porcelain=v1` lists only in-scope paths before commit.

## STOP conditions

Stop if the change requires provider-specific hook syntax, an edit outside
Scope, or any claim stronger than `advisory_prose`. Stop if current client
inspection contradicts the recorded Grok fact — record the new evidence
instead of guessing.
