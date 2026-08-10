# Plan 026: Migrate house-stack evals to retained evidence

> **Executor instructions**: In one session, migrate only the five house-stack
> skill eval sets to eval-v2 retained evidence. Keep v1 compatibility for the
> remaining governance skills; do not add metrics or CI.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 025 has a current same-branch completion receipt
- **Effort**: S; one session
- **Risk**: MEDIUM
- **Depends on**: plan 025
- **Covers**: G14, G15
- **Guardrails**: N01, N05, N06, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-16,
  F4-30
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Static project/setup/best-practice skills share one artifact-evidence shape.
Migrating that coherent family separately keeps the session bounded and leaves
interactive governance plus schema contraction to plan 037.

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
rtk git merge-base --is-ancestor <plan-025-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- skills/tailrocks-axum-best-practices/evals skills/tailrocks-rust-best-practices/evals skills/tailrocks-rust-project-setup/evals skills/tailrocks-tanstack-project-setup/evals skills/tailrocks-typescript-best-practices/evals scripts/run-evals.ts scripts/run-evals.test.ts docs/eval-runner-design.md mise.toml
rtk mise run eval-delivery-replay
rtk mise run verify-kernel
```

Expected: exact clean plan-025 descendant; delivery replay/kernel green.

## Spec contract

### Requirement G14/G15: artifact-grounded house-stack evals

Each Axum, Rust best-practices/setup, TanStack setup, and TypeScript
best-practices case SHALL assert exact retained files/diffs/commands/diagnostics/
safety outcomes. Concrete failure SHALL remain failing; no summary/majority may
erase it.

#### Scenario: static answer claims success without files

- **WHEN** required configuration/code/diagnostic evidence is absent
- **THEN** deterministic assertions fail before semantic grading.

## Must NOT

- **N01/N13**: score/summary cannot mint an invariant or PASS.
- **N05/N06**: executable assertions use proven isolation and no secret.
- **N16**: workspaces/files/diffs/commands/output/evidence bounded.

## Inputs to provide

None. Replay only; no live provider/model sampling.

## Starting state

- Plan 025 migrated seven delivery-family suites.
- These five static house-stack suites remain legacy/mixed.
- Three governance suites and v1 removal belong to plan 037.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Stack replay | `rtk mise run eval-stack-replay` | exactly five named suites pass |
| Delivery | `rtk mise run eval-delivery-replay` | unchanged seven suites pass |
| Kernel | `rtk mise run verify-kernel` | exit 0 |

## Scope

**In scope**: the five named eval directories, shared runner schema/fixtures only
as required for their static artifact shape, `eval-stack-replay`, design docs.

**Out of scope**: production skills, code-health/contribute/remediate evals, v1
deletion, metrics, CI, live sampling.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(evals): migrate house stack evidence`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Convert exactly five static/setup suites

For each case retain before/after snapshots, exact changed/unchanged paths,
diff, command argv/exit/diagnostics, assertion results, bounded trace, and closed
verdict. Setup cases assert manifest/config/toolchain/lint/test artifacts;
best-practice cases assert exact code/API/error/safety behavior.

**Verify**: Stack replay prints exactly five names and all evidence paths.
Mutations remove/change required files, add out-of-scope diffs, fake command
success, exceed bounds, or provide summary-only output; each fails.

### Step 2: Preserve mixed-migration compatibility narrowly

Keep v1 reader only for the three explicitly allowlisted governance suites.
Every migrated suite rejects v1. Delivery and stack replay manifests are closed,
disjoint, and together name exactly twelve skills.

**Verify**: fixtures reject v1 for any migrated suite, a fourth legacy suite,
duplicate/missing skill, changed delivery evidence, and production skill edit.

## Test plan

- Five exact suite inventory and 12-skill combined inventory.
- File/diff/command/diagnostic/unchanged-workspace assertions.
- Summary-only/v1/out-of-scope/bounds mutations.
- Delivery and kernel regression gates.

## Done criteria

- [ ] Exactly five house-stack suites use complete eval-v2 evidence.
- [ ] Twelve migrated skills are closed/disjoint; only three legacy remain.
- [ ] Every concrete failed assertion fails the suite.
- [ ] No production skill, metrics, CI, or live provider behavior changed.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on stale dependency, required production behavior change, missing artifact
evidence, hidden failure, unbounded data, governance/metrics/CI scope, or work
beyond one session.

## Maintenance notes

Plan 037 migrates the final three suites and removes v1. Plan 038 adds metrics.
