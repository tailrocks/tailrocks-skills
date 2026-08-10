# Plan 038: Add honest retained-trial metrics

> **Executor instructions**: In one session, add bounded descriptive metrics
> over complete eval-v2 trials. Never let an estimate, interval, majority, or
> stopping rule change a concrete trial verdict.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 037 has a current same-branch completion receipt
- **Effort**: S; one session
- **Risk**: MEDIUM
- **Depends on**: plan 037
- **Covers**: G14, G15
- **Guardrails**: N01, N06, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-30
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Metrics can describe stochastic reliability only after all trials remain
inspectable. Keeping this separate from migration prevents statistics from
becoming an alternate acceptance path.

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
rtk git merge-base --is-ancestor <plan-037-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- scripts/run-evals.ts scripts/run-evals.test.ts scripts/fixtures/eval-metrics docs/eval-runner-design.md mise.toml
rtk mise run eval-all-replay
rtk mise run verify-kernel
```

Expected: exact clean plan-037 descendant; 15 v2 suites and kernel pass.

## Spec contract

### Requirement G14/G15: descriptive bounded metrics, conjunctive failures

Aggregation SHALL report pass@1, pass^k, uncertainty interval, task/client/
model/config/version strata, budgets/routes, paired baselines, sample/stopping
metadata, and every failure class. Any concrete failed trial SHALL keep command
acceptance nonzero regardless of aggregate.

#### Scenario: high estimate with one failure

- **WHEN** pass^k is high but one retained grounded trial failed
- **THEN** report both and exit nonzero; never call the suite accepted.

## Must NOT

- **N01**: estimate/majority/interval/stopping rule cannot create PASS.
- **N06**: metrics contain no raw secret or unbounded transcript.
- **N13**: zero observed failure is an interval, not invariant/complete proof.
- **N16**: samples/strata/memory/output/time have explicit maxima.

## Inputs to provide

None. Checked-in replay fixtures only; no live sampling.

## Starting state

- Plan 037 provides complete retained eval-v2 trials and no legacy parser.
- Existing aggregation does not expose complete honest uncertainty/strata.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Metrics | `rtk bun test scripts/run-evals.test.ts --test-name-pattern metrics` | all statistical/failure fixtures pass |
| Replay | `rtk mise run eval-all-replay -- --metrics` | 15 suites; metrics plus concrete verdicts |
| Kernel | `rtk mise run verify-kernel` | exit 0 |

## Scope

**In scope**: runner aggregation/types/tests/fixtures, bounded metrics CLI output,
design docs/task wiring.

**Out of scope**: eval case migration/content, production skills, CI/workflows,
live sampling, universal sample counts, acceptance semantics.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(evals): report retained trial metrics`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Compute metrics only from retained canonical trials

Implement exact pass@1/pass^k and documented uncertainty interval over validated
trial records. Pre-register bounded strata; require task/client/model/config/
version, budgets, routes, paired-baseline keys, failure class, sample maximum,
and stopping reason. Reject missing pairs, mixed identity, duplicate trial,
post-hoc stratum, overflow, NaN, or unknown verdict.

**Verify**: Metrics command covers zero/some/all failure, `k` boundaries, exact
formula fixtures, missing/duplicate pair, stratum imbalance, sequential early/
max stop, memory/output caps, and deterministic formatting.

### Step 2: Preserve conjunctive command acceptance

Metric generation occurs after deterministic trial verdicts and cannot mutate
them. Report every failure class/trial pointer. Any failed trial keeps process
exit nonzero; early stopping never erases retained trials; zero failures reports
uncertainty and sample size without invariant language.

**Verify**: Replay/Kernel pass; mutations force high aggregate plus one failure,
zero-failure overclaim, hidden failure, aggregate-only record, and changed exit
status. Every mutation fails.

## Test plan

- Formula/interval boundary and deterministic serialization.
- Paired strata, bounded sequential stopping, sample/memory/output caps.
- Concrete failure propagation despite high metrics.
- No legacy/summary input and no acceptance state mutation.

## Done criteria

- [ ] Metrics bind complete retained trial identities/strata/budgets/routes.
- [ ] Every failure remains visible and keeps acceptance nonzero.
- [ ] Uncertainty/sample/stopping metadata are explicit and bounded.
- [ ] No eval migration, CI, live sampling, or acceptance semantic changed.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on incomplete retained data, formula ambiguity, unbounded sampling/memory,
aggregate masking, acceptance coupling, eval/CI scope, or work beyond one
session.

## Maintenance notes

Plan 027 may put replay plus descriptive metrics in credential-free PR CI.
