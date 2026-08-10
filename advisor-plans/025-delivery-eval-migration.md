# Plan 025: Migrate the delivery-family evals to retained evidence

> **Executor instructions**: Migrate only the seven roadmap-delivery skills in
> one session. Use the eval-v2 runner and kernel gate unchanged. Do not migrate
> the remaining skills, add metrics, or edit CI.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 008 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: MEDIUM
- **Depends on**: plan 008
- **Covers**: G14, G15
- **Guardrails**: N01, N05, N06, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-14,
  F4-16, F4-30
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Interactive delivery skills need multi-turn artifact evidence, not summary
scores. Migrating this coherent family separately keeps one bounded commit and
lets correction, resume, routing, and write ownership share fixtures.

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
rtk git merge-base --is-ancestor <plan-008-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- skills/tailrocks-idea/evals skills/tailrocks-brainstorm/evals skills/tailrocks-research/evals skills/tailrocks-record-decision/evals skills/tailrocks-finalize/evals skills/tailrocks-plan/evals skills/tailrocks-reconcile/evals scripts/run-evals.ts scripts/run-evals.test.ts docs/eval-runner-design.md mise.toml 
rtk mise run verify-kernel
```

Expected: exact same-branch dependency/integration SHAs match, scoped diff is
empty, and kernel gate passes.

## Spec contract

### Requirement G14/G15: retained multi-turn delivery evidence

Every eval for idea, brainstorm, research, record-decision, finalize, plan, and
reconcile SHALL use eval-v2 retained artifacts. Each case SHALL assert ordered
turns, workspace before/after/diff, trace, routing, refusal or terminal state,
and exact write ownership. Scripted replay SHALL be labeled
`fixture_validated`, never live skill proof.

#### Scenario: correction after synthesis

- **WHEN** a later user turn reverses an earlier answer
- **THEN** retained evidence shows the correction, supersedence, regenerated
  artifact, and no stale normative value.

## Must NOT

- **N01**: a score or transcript claim cannot override an artifact failure.
- **N05/N06**: executable fixture assertions use pinned isolation and no secret.
- **N13**: scripted replay cannot be called live skill/provider proof.
- **N16**: turns, workspace files/bytes, traces, diffs, and evidence are capped.

## Inputs to provide

None. Use committed fixtures and the plan-001 eval-v2 schema.

## Starting state

- Plan 001 retains eval-v2 workspaces and labels legacy evidence untrusted.
- Plan 008 provides the offline kernel/adversarial gate.
- Seven delivery skills have related multi-turn semantics and can share replay
  helpers without changing skill behavior.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Delivery replay | `rtk mise run eval-delivery-replay` | exit 0; seven skills, zero legacy verdicts |
| Runner tests | `rtk bun test scripts/run-evals.test.ts` | exit 0 |
| Kernel | `rtk mise run verify-kernel` | exit 0 |

## Scope

**In scope**:

- `skills/tailrocks-{idea,brainstorm,research,record-decision,finalize,plan,reconcile}/evals/**`
- `scripts/run-evals.ts`, `scripts/run-evals.test.ts` only for shared scripted
  multi-turn replay support
- `mise.toml` for `eval-delivery-replay`
- `docs/eval-runner-design.md` delivery-family evidence section

**Out of scope**:

- `SKILL.md`, references, templates, or production skill behavior.
- House-stack evals (plan 026), governance evals/v1 removal (plan 037), and
  retained-trial metrics (plan 038).
- CI/workflow edits (plan 027), live provider trials, release work.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(evals): migrate delivery skill evidence`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Add shared multi-turn retained-artifact fixtures

Use scripted turns for corrections, interruptions, resume, one-question
behavior, batched questions, decision/research routing, write boundaries,
read-only planning, terminal refusal, and status transitions. Every assertion
names retained workspace/trace/diff evidence; summary text alone is invalid.

**Verify**: runner tests reject missing turn order, missing artifact, unbounded
trace, wrong write owner, summary-only verdict, and mislabeled live proof.

### Step 2: Convert exactly seven delivery eval sets

Convert each case to eval-v2. Preserve its original behavioral intent; add only
missing boundary/safety cases needed by the current skill contract. Run the
family command after each skill. Do not remove global v1 parsing because the
remaining eight skills still depend on it.

**Verify**: Delivery replay prints seven exact skill names, retains every trial
artifact, and reports zero UNTRUSTED/INVESTIGATE/FAIL.

## Test plan

- Correction, interruption, resume, routing, one-question, write ownership.
- Read-only plan/research boundaries and terminal refusal.
- Artifact/trace/diff caps and summary-only rejection.
- Exact seven-skill inventory; no other eval files change.

## Done criteria

- [ ] Recut records plan-008 and shared-branch final-head SHAs.
- [ ] All seven delivery-family eval sets use retained eval-v2 evidence.
- [ ] Family replay has zero legacy/untrusted/failing cases.
- [ ] No skill behavior, non-delivery eval, CI, or release file changed.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on stale dependency, required skill behavior change, missing bounded
artifact evidence, any family failure, change outside Scope, or work beyond one
session.

## Maintenance notes

Plans 026/037 migrate the remaining skills and remove v1 only after all suites
pass; plan 038 adds retained-trial metrics.
