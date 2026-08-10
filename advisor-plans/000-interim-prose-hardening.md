# Plan 000: Separate prose acceptance from loop exhaustion

> **Executor instructions**: Follow this plan exactly. Run preconditions first.
> Change prose/eval expectations only. Do not add a hook or executable runtime.
> A STOP condition means stop and report; do not improvise.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until the one implementation branch/draft PR and frozen
  base are initialized; then recut exact dispatch/last-reviewed SHAs
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Covers**: G06, G07
- **Guardrails**: N01, N02, N03
- **Research basis**: `advisor-plans/RESEARCH.md` F4-03, F4-13, F4-26
- **Planned at**: design baseline `1e809bd`; root recut required

## Why this matters

The current GOAL condition makes “stop after N turns” an `OR` branch of success.
An exhausted loop can therefore satisfy the goal while gates are red. Status is
also executor-authored. This one-session mitigation makes fresh gates primary,
status secondary, and budget exhaustion explicitly BLOCKED. It remains
`advisory_prose`; it does not close the later kernel trust gap.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = "<integration-sha>"
test "$(rtk git rev-parse origin/main)" = "<frozen-base-sha>"
test "$(rtk git merge-base HEAD "<frozen-base-sha>")" = "<frozen-base-sha>"
rtk git diff --stat <last-reviewed-sha>..HEAD -- README.md AGENTS.md skills/tailrocks-plan/SKILL.md skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-plan/evals skills/tailrocks-reconcile/SKILL.md examples/plan-package/plans/goal-live-status/GOAL.md
rtk bun test scripts/
rtk bun run scripts/validate-skills.ts
```

Expected: first command has no output; tests pass; validator prints
`Validated 15 skills.` Any in-scope drift or failed gate is a STOP.

## Spec contract

### Requirement G06/G07: gate-first advisory completion

The generated prose goal SHALL call completion only when every named final gate
has just passed after the last repository/status change, reconcile made no
change, and every status is terminal. Reaching a turn/time budget SHALL produce
BLOCKED and SHALL NOT satisfy the goal condition.

#### Scenario: verified completion

- **WHEN** final gates pass, reconciliation changes nothing, and rows are
  DONE/REJECTED with no nonterminal row
- **THEN** the prose loop may report completion with trust label
  `advisory_prose`.

#### Scenario: exhausted budget

- **WHEN** the bound is reached before verified completion
- **THEN** the active row becomes `BLOCKED (budget exhausted)` and the loop
  stops without a completion claim.

## Must NOT

- **N01**: executor/model status or transcript confidence must not be the primary
  completion proof.
- **N02**: budget exhaustion must not satisfy acceptance.
- **N03**: mutable GOAL Markdown must not select commands for a privileged hook.
  Therefore this plan adds no hook snippet.

## Inputs to provide

None — fully self-contained.

## Starting state

- `skills/tailrocks-plan/references/goal-handoff.md:109-115` currently ends the
  condition with `Or stop after <N> turns.`
- The same success alternative appears at `:132-134`; `:187-189` requires every
  condition to be bounded this way.
- `:69-79` lets an executor set DONE, then evaluates rows/gates.
- `skills/tailrocks-reconcile/SKILL.md:29-50` already says executor claims are
  untrusted and reruns DONE criteria. Reuse that rule.
- No executable hook currently belongs to this protocol. Preserve that fact.
- Current `goal-handoff.md:98-101`, root README, and Tailrocks Plan skill imply
  Grok has native `/goal`. Official/current Grok 1.0 docs/local inspection expose
  `/plan` and `/loop`, no durable built-in goal; Stop is not blocking control.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Script tests | `rtk bun test scripts/` | exit 0 |
| Skill validation | `rtk bun run scripts/validate-skills.ts` | `Validated 15 skills.` |
| Removed success branch | `rtk rg -n 'Or stop after|or stop after|Always bounded' skills/tailrocks-plan/references/goal-handoff.md` | exit 1, no output |
| New BLOCKED rule | `rtk rg -n 'BLOCKED \(budget exhausted\)' skills/tailrocks-plan/references/goal-handoff.md` | at least two matches |
| Removed Grok grouping | `rtk rg -n 'Claude Code, Codex, or Grok|Codex and Grok' README.md AGENTS.md skills/tailrocks-plan` | exit 1, no output |
| Manual Grok wording | `rtk rg -n 'Grok.*manual|manual.*Grok' README.md AGENTS.md skills/tailrocks-plan` | at least one match in each changed lifecycle document |
| Diff | `rtk git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/evals/**` only where the old condition is encoded
- `skills/tailrocks-reconcile/SKILL.md` only if one cross-reference is required
- `skills/tailrocks-plan/SKILL.md`, root `README.md`, and
  root `AGENTS.md`, and `examples/plan-package/plans/goal-live-status/GOAL.md`
  only to remove the known-wrong Grok-native claim and document manual prompt
  iteration

**Out of scope**:

- Hooks, Rust, SQLite, schemas, receipts, provider config, manifests, versions.
- Any trust label stronger than `advisory_prose`.
- Changes to Reconcile behavior beyond pointing at the final gate-first pass.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `fix(plan): separate completion from loop bounds`
- Use `rtk git commit -s` and `Co-authored-by: Codex <codex@openai.com>`.
- Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Make the success predicate gate-first

Edit the GOAL template condition and kickoff text. Order it as:

1. every named final gate exits 0 after the last repository/status edit;
2. `tailrocks-reconcile` (or the explicit manual Reconcile skill invocation)
   changes no row/evidence;
3. all rows are DONE/REJECTED and none is STALE/BLOCKED/IN PROGRESS.

A DONE flip must cite same-session command output. If reconcile changes any row,
restart the final pass. Keep the `advisory_prose` limitation explicit.

**Verify**: run Skill validation, then New BLOCKED rule. Expected: validator
passes and the new final-pass wording is present.

### Step 2: Move the bound into a failure rule

Delete `Or stop after <N> turns` from both success blocks and delete the
“Always bounded” condition rule. Keep the `<N>` calculation under Bounds, but
state: at the bound, mark the active row `BLOCKED (budget exhausted)`, preserve
evidence, and stop without claiming the item DONE.

**Verify**: run Removed success branch. Expected: exit 1 with no matches. Run
New BLOCKED rule. Expected: at least two matches (protocol plus Bounds).

### Step 3: Encode the regression

Update the Tailrocks Plan eval fixture/assertions that render GOAL.md. Assert:

- gate text precedes terminal-row text;
- no success predicate contains `or stop after`;
- budget exhaustion maps to BLOCKED;
- no hook or shell snippet is generated.

Add the Reconcile cross-reference only if the fixture shows it is absent.

**Verify**: `rtk bun test scripts/` exits 0; the changed eval case fails when
the old `OR` sentence is reintroduced.

### Step 4: Correct the known Grok lifecycle claim

For current Grok 1.0, remove instructions to invoke a native `/goal`. State that
the generated condition/kickoff/resume blocks remain usable as manual prompts,
but no persisted native-goal or Stop enforcement is claimed. Do not substitute
`/loop` or a plugin/skill named `/goal`. Plan 010 may qualify a later exact
version only from new lifecycle evidence.

**Verify**: run Removed Grok grouping (exit 1/no output) and Manual Grok wording
(matches in each changed lifecycle document). Script tests and Skill validation
pass, and mutation fixtures fail when either stale grouping is restored or the
manual limitation is removed.

## Test plan

- Rendered happy-path GOAL contains gates → reconcile → terminal rows.
- Exhausted-budget fixture ends BLOCKED, never DONE.
- Old `Or stop after` mutation fails.
- Generated handoff contains no Stop-hook executable snippet.
- Current Grok handoff is manual and never claims native `/goal`.

**Verify**: Script tests, Skill validation, Removed success branch, New BLOCKED
rule, and Diff all produce their expected results.

## Done criteria

- [ ] All commands in the final Test plan verification pass as specified.
- [ ] No acceptance predicate contains a turn/time-budget alternative.
- [ ] Budget exhaustion is explicitly BLOCKED in condition and kickoff guidance.
- [ ] Final gates are fresh and primary; status rows are secondary.
- [ ] No executable hook was added.
- [ ] Known-wrong Grok native-goal claims are removed for current 1.0 behavior.
- [ ] `rtk git status --short` lists only in-scope paths plus the protocol status row.

## STOP conditions

Stop if the change requires provider-specific hook syntax, a runtime command not
already available, an edit outside Scope, or a claim stronger than
`advisory_prose`.

## Maintenance notes

Plans 003/006 replace prose authority with the kernel. Plan 006 depends on this
plan because absent-CLI clients retain this exact legacy behavior.
