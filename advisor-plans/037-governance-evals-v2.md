# Plan 037: Migrate governance evals and remove v1

> **Executor instructions**: In one session, migrate code-health, contribute,
> and remediate evals, then delete v1 compatibility only after all 15 suites
> replay. Do not add metrics or CI.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 026 has a current same-branch completion receipt
- **Effort**: S; one session
- **Risk**: MEDIUM
- **Depends on**: plan 026
- **Covers**: G14, G15
- **Guardrails**: N01, N05, N06, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-16,
  F4-30
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

The final interactive governance suites share approval/refusal/write-boundary
evidence. Once they migrate, legacy summary input can be removed structurally
instead of remaining a permanent alternate truth path.

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
rtk git merge-base --is-ancestor <plan-026-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- skills/tailrocks-code-health/evals skills/tailrocks-contribute/evals skills/tailrocks-remediate/evals scripts/run-evals.ts scripts/run-evals.test.ts docs/eval-runner-design.md mise.toml
rtk mise run eval-delivery-replay
rtk mise run eval-stack-replay
```

Expected: exact clean plan-026 descendant; 12 migrated suites pass.

## Spec contract

### Requirement G14/G15: complete eval-v2 inventory with no legacy parser

Governance trials SHALL retain turn order, proposal/approval/refusal, external
effect boundary, exact writes/diffs, gates, and sanitized evidence. After all
15 suites validate, every v1 parser/schema/fixture SHALL be removed and any v1
input SHALL fail closed.

#### Scenario: approval claimed only in summary

- **WHEN** no retained user approval event binds an external mutation
- **THEN** the case fails even if generated prose says approved.

## Must NOT

- **N01/N13**: model summary/majority cannot override event/artifact failure.
- **N05/N06**: executable checks isolated; auth/value never retained.
- **N16**: turns, tools, external effects, files, output/evidence bounded.

## Inputs to provide

None. Replay only.

## Starting state

- Plans 025/026 migrated 12 suites.
- Exactly code-health/contribute/remediate remain allowlisted v1.
- Metrics belong to plan 038.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Governance | `rtk mise run eval-governance-replay` | exactly three suites pass |
| All replay | `rtk mise run eval-all-replay` | 15 suites; zero v1/untrusted cases |
| Schema | `rtk bun test scripts/run-evals.test.ts --test-name-pattern 'v2|legacy'` | v1 hard rejection |
| Kernel | `rtk mise run verify-kernel` | exit 0 |

## Scope

**In scope**: three named eval directories, final v2 schema/parser/fixtures,
removal of v1 compatibility, replay tasks/docs.

**Out of scope**: production skills, metrics/statistics, CI/workflows, live
providers/models, prior migrated behavior.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(evals): remove legacy evidence path`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Convert the three governance suites

Retain exact ordered interaction, proposal, explicit approval/refusal, bounded
tool/effect request, repository before/after, allowed/forbidden writes, gates,
and sanitized failures. Contribute cases distinguish prepare from submit;
remediate cases preserve root-cause/containment boundary; code-health cases bind
measured baseline/monotonic gate output.

**Verify**: Governance replay names exactly three suites. Mutations reorder or
omit approval, execute before approval, broaden target, retain credential,
mislabel containment complete, hide failed gate, or exceed bounds; each fails.

### Step 2: Delete the legacy truth path

Run all 15 v2 schemas first. Then delete v1 parser/types/schema/fixtures and the
legacy allowlist. Unknown version, summary-only, UNTRUSTED/INVESTIGATE, or
missing artifact is a hard schema error. All replay names exactly 15 unique
skills.

**Verify**: All replay/Schema/Kernel pass; mutation fixtures prove any v1 input,
duplicate/missing suite, hidden failure, or fallback parser fails.

## Test plan

- Three governance inventories and approval/refusal/effect boundaries.
- Root-remediation/containment and measured-gate evidence.
- Complete 15-suite v2 inventory; v1/fallback hard rejection.
- Prior delivery/stack replay unchanged.

## Done criteria

- [ ] Final three suites retain complete bounded interaction/artifact evidence.
- [ ] All 15 suites are v2 and unique.
- [ ] V1 parser/schema/fixtures/allowlist are absent and rejected.
- [ ] No metrics, CI, live provider, or production skill change.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on missing approval/artifact evidence, production behavior change, hidden
failure, incomplete 15-suite replay, legacy consumer outside scope, metrics/CI
work, or work beyond one session.

## Maintenance notes

Plan 038 adds non-authoritative metrics only after this structural closure.
