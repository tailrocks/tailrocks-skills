# Plan 008: Make artifact evals and deterministic CI trusted

> **Executor instructions**: Complete the offline proof foundation. Every
> checked-in eval must inspect retained artifacts. PR CI receives no provider
> credentials. Do not add distribution/live-provider work from plan 009.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- .github/workflows/validate.yml mise.toml scripts/ skills/*/evals/ crates/ tests/ examples/ docs/eval-runner-design.md`
> Rebase onto plans 005 and 007, refresh this baseline/current state, and rerun
> both dependency branches before editing.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: plans 005 and 007
- **Category**: tests, ci
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after dependencies

## Why this matters

The acceptance kernel cannot be trusted if its checker is untested or the skill
evals still grade summaries. This plan migrates every case, seeds independent
ground-truth attacks, and gives PRs one credential-free deterministic gate.
Statistical trials remain diagnostics; deterministic invariants live in
mutation/property tests.

## Current state

- `.github/workflows/validate.yml` runs skill validation, script tests, and a
  live version-freshness query, but no Rust/controller or artifact-eval suite.
- Plan 001 deliberately marks legacy cases UNTRUSTED until migration.
- Plans 003–007 add the trust boundaries that require hostile Git, oracle,
  receipt, reviewer, apply, and retirement fixtures.
- A same-repository PR controls its scripts/hooks just like a fork PR. It must
  never receive provider credentials or privileged tokens.

## Preconditions

```sh
rtk cargo test --workspace --all-features
rtk bun test scripts/
rtk mise run validate
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3
```

Expected: all pass; no active dependency receipt is stale.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| One gate | `mise run verify` | offline format/lint/test/docs/skills/examples all pass |
| Eval audit | `bun scripts/run-evals.ts --all --driver replay --results /tmp/tailrocks-evals-all` | exit 0; zero UNTRUSTED/INVESTIGATE/FAIL |
| Adversarial | `cargo test --workspace --all-features adversarial` | exit 0 |
| Mutation | `cargo test -p tailrocks-core oracle_mutations` | exit 0; every seeded defect detected |
| Workflow lint | `bun scripts/validate-workflows.ts` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/validate.yml`
- `mise.toml`
- `scripts/run-evals.ts`, `scripts/eval-*.ts`, tests/fixtures
- all `skills/*/evals/**`
- `scripts/validate-workflows.ts` and test (new)
- `crates/**` test/support hardening only
- `tests/adversarial/**` and `tests/mutations/**` (new)
- `examples/**` test fixtures only
- `docs/eval-runner-design.md`

**Out of scope**:

- Portable binaries, plugin hooks, live provider qualification, release docs or
  versions (plan 009).
- Grok/Claude (plan 010).
- Credentials in any PR job or repository file.
- Executing untrusted branch code through `pull_request_target`.
- Fixed `n=300`, majority acceptance, or suppressing failed trials.

## Git workflow

- Branch: `test/trusted-goal-evals`
- Commit subject: `test(goal): enforce artifact acceptance in CI`.
- DCO signoff and Codex co-author trailer required. No push/PR without
  instruction.

## Steps

### Step 1: Create one complete offline verification entry point

Add `mise run verify` in this stable order:

1. Rust format, strict Clippy, tests, and rustdoc warnings;
2. script tests and skill validator;
3. all replay artifact evals;
4. contract/schema/example checks;
5. adversarial and oracle-mutation suites;
6. workflow static checks.

Each stage has a stable name and nonzero failure status. No stage downloads
mutable expected values or requires provider/network credentials. Keep package
freshness as a separately named online job; do not let registry drift make the
offline acceptance kernel nondeterministic.

**Verify**: `mise run verify` → exit 0 from a clean checkout and names all six
stages.

### Step 2: Migrate every skill eval to artifact-grounded v2

Convert all cases left by plan 001. Interactive delivery cases use scripted
multi-turn replay for corrections, interruptions, resume, one-question behavior,
routing, write ownership, and terminal refusal. Static review/setup cases assert
exact workspace files/diff/commands. Safety cases assert refusal trace and
unchanged workspace.

Live provider trials are not added here. After the last migration, delete v1
compatibility; summary-only evidence cannot produce any terminal state.

**Verify**:

```sh
rm -rf /tmp/tailrocks-evals-all
bun scripts/run-evals.ts --all --driver replay --results /tmp/tailrocks-evals-all
```

Expected: exit 0; zero UNTRUSTED/INVESTIGATE/FAIL; every trial retains verdict,
workspace snapshots, trace, diff, and assertion evidence.

### Step 3: Seed independent-ground-truth adversarial fixtures

Cover every trust boundary:

- forged DONE/PASS/status/receipt and reordered journal event;
- changed contract/GOAL/plan/oracle/tool lock/effective-hook fixture;
- hostile Git config/hook/filter/alternate/ref/index, symlink and untracked path;
- stale base/CAS race, skipped dependency, invalidated earlier slice;
- reviewer score/majority/prior-verdict leakage and candidate mutation;
- external-effect/secret/environment-read request and branch-target escape;
- apply/retirement broad path, corrupt archive, and history-loss recovery.

For deterministic invariants, seed a known defect outside the checker path and
require detection. Keep checkpoint-bypass separate from
`false_acceptance = accepted AND independent_ground_truth_fail`. Ground truth is
not authored/read from candidate-controlled files.

**Verify**: adversarial and mutation commands exit 0 and report zero escaped
mutations/false acceptances. Any known escape blocks completion regardless of
aggregate rate.

### Step 4: Make PR CI complete and credential-free

Run `mise run verify` in `validate.yml` with pinned actions and least
permissions. PR jobs receive no provider secret, privileged token, writable
remote, deploy environment, or release permission. Caches may accelerate but a
clean no-cache fixture remains.

`scripts/validate-workflows.ts` rejects secret references in PR jobs, mutable
action refs where policy forbids them, `pull_request_target` execution of head
code, broad write permissions, and credentialed checkout of untrusted refs.

**Verify**: workflow validator exits 0; malicious same-repo-PR secret and
`pull_request_target` fixtures are rejected.

### Step 5: Report stochastic reliability without treating it as proof

Extend retained result aggregation with pass@1, pass^k, confidence interval,
task/client/model/config/version, budgets, route counts, and all failure classes.
Pre-register task strata and support sequential/adaptive sampling with a maximum
bound. Never use fixed 300 runs for every claim; zero observed failures gives an
interval, not an invariant.

Use paired baselines for utility claims. A known deterministic escape always
blocks; stochastic regression reports its evidence/interval for explicit product
decision. No majority hides a failed trial.

**Verify**: tests cover zero/some failures, early stop, maximum sample, missing
pair, stratum imbalance, pass@1/pass^k, interval output, and retained failures.

## Test plan

- Every skill eval v2; multi-turn correction/resume/routing/write-boundary cases.
- All controller trust-boundary mutations and independent-ground-truth failures.
- PR workflow credential/permission/ref adversarial fixtures.
- Offline one-command verification from clean/no-cache environments.
- Metric per-trial retention, pass@1/pass^k/interval/adaptive/paired cases.

## Done criteria

- [ ] `mise run verify` is one complete offline deterministic gate.
- [ ] Every checked-in eval is v2; legacy summary grading is removed.
- [ ] Mutation/adversarial suite has zero known escapes/false acceptances.
- [ ] PR CI has no provider credentials and rejects unsafe workflow shapes.
- [ ] Registry freshness is separate from offline proof.
- [ ] Metrics retain failures/report uncertainty; never vote them away.
- [ ] Tests, validator, workflow lint, examples, and diff checks pass.

## STOP conditions

Stop if any deterministic mutation escapes, independent ground truth is visible
to candidate-controlled code, a PR job needs provider credentials, offline proof
depends on a mutable network response, or a concrete failure would be hidden by
aggregation.

## Maintenance notes

Every verifier defect becomes a seeded regression before repair is considered
complete. Plan 009 may consume these gates but may not weaken them for packaging
or provider convenience.
