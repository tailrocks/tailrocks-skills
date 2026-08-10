# Plan 008: Build the offline kernel and adversarial gate

> **Executor instructions**: Finish one offline verification seam in one
> session. Add the stable kernel entry point and adversarial/mutation fixtures.
> Do not migrate every skill eval or edit CI; plans 025-027 own those slices.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 005 and 014 have current same-branch
  completion receipts at one exact head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plans 005 and 014
- **Covers**: G14, G15
- **Guardrails**: N01, N05, N06, N08, N13, N14, N16, N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-14,
  F4-16, F4-19, F4-30
- **Planned at**: design baseline `1e809bd`; fan-in recut required

## Why this matters

The kernel needs one deterministic local gate before repository-wide eval
migration or CI can consume it. Its hostile fixtures must test each trust
boundary against independently declared ground truth, including adaptive
comparison leakage. This slice creates that foundation only.

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
rtk git merge-base --is-ancestor <plan-005-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-014-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- mise.toml scripts tests crates examples docs/eval-runner-design.md
rtk cargo test --workspace --all-features
rtk bun test scripts/
rtk mise run validate
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3
rtk cargo run -p tailrocks-cli -- plan inspect-archive --example examples/plan-package --require-proof-closed
```

Expected: one same-branch fan-in contains both full dependency SHAs, scoped diff
is empty, and all existing gates/examples pass.

## Spec contract

### Requirement G14/G15: deterministic offline kernel gate

One `verify-kernel` task SHALL run every acceptance-kernel invariant offline in
a stable order. Adversarial fixtures SHALL retain candidate, independent ground
truth, observed verdict, bounded evidence, and failure class. Any escaped seeded
defect or concrete failing trial SHALL fail the command; aggregation cannot vote
it away.

#### Scenario: seeded verifier defect

- **WHEN** a mutation disables one check outside the subject path
- **THEN** independent ground truth detects false acceptance and the gate exits
  nonzero.

#### Scenario: adaptive comparator probe

- **WHEN** a candidate exceeds an `integrity_only` query cap or a repeatable
  result is labeled confidential
- **THEN** the gate rejects the run and records the policy failure.

## Must NOT

- **N01/N08**: status, majority, old evidence, or prior PASS cannot override a
  current failure.
- **N05/N06**: candidate assertions run only in the pinned OCI verifier without
  credentials.
- **N13**: a sample or fixture proves only its declared invariant.
- **N14**: no writable build/result cache crosses candidate subjects.
- **N16**: every workspace/process/output/evidence boundary is capped; overflow
  fails rather than passing truncated evidence.
- **N18**: namespace separation or bounded black-box access cannot be called
  confidentiality.

## Inputs to provide

None. Provider credentials, CI authority, and mutable online registries are not
inputs to this offline slice.

## Starting state

- Plans 003-014 provide candidate, broker, final receipt, apply, and proof-closed
  archive boundaries.
- Plan 001 retains bounded eval-v2 artifacts but deliberately leaves legacy
  cases untrusted.
- No single command currently exercises all kernel trust-boundary mutations.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Kernel gate | `rtk mise run verify-kernel` | exit 0; every named stage passes |
| Adversarial | `rtk cargo test --workspace --all-features adversarial` | exit 0; zero false acceptances |
| Mutation | `rtk cargo test -p tailrocks-core oracle_mutations` | exit 0; every seed detected |
| Skills | `rtk mise run validate` | exit 0; 16 skills |

## Scope

**In scope**:

- `mise.toml` for `verify-kernel`
- `tests/adversarial/**`, `tests/mutations/**` (new)
- `crates/**` test/support hardening only
- `scripts/**` only for bounded mutation/result helpers and tests
- `examples/**` fixture additions only
- `docs/eval-runner-design.md` kernel/adversarial contract

**Out of scope**:

- `skills/*/evals/**` migration and stochastic reporting (plans 025/026).
- `.github/workflows/**` and PR trust labels (plan 027).
- Packaging, credentials, live providers, release/policy/protected workflows.
- Fixed `n=300`, majority acceptance, or candidate-authored ground truth.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(goal): add adversarial kernel gate`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Add one stable offline kernel entry point

Add `verify-kernel` in this fixed order: Rust format, strict Clippy, tests,
rustdoc warnings, script tests, skill validator, schema/example checks,
adversarial suite, and mutation suite. Each stage has a stable name and
propagates nonzero status. It neither downloads mutable expected values nor
requires network/provider credentials.

Every `sandboxed_command` assertion invokes the plan-003 pinned OCI
image/profile with a fresh per-candidate overlay. Direct Bun/Rust execution of
candidate-selected commands on the host is rejected. Immutable dependency
sources may be shared read-only; writable output may not.

**Verify**: `rtk mise run verify-kernel` exits 0 from a clean checkout and lists
every stage exactly once.

### Step 2: Seed independent-ground-truth hostile fixtures

Cover forged status/receipt and journal reorder; contract/plan/tool/profile/
oracle drift; hostile Git config/hook/filter/alternate/ref/index/symlink;
stale-base/CAS and skipped dependency; reviewer leakage/majority; secret,
network, branch-target and broker probing; apply/retirement path and proof
closure attacks; path/workspace/output/evidence exhaustion.

Add comparator cases for expected-byte mount, over-budget adaptive queries,
per-generation query-budget reset, reused low-entropy expectation, and any
hidden/confidential/secret oracle declaration. V1 must reject the declaration,
not emulate confidentiality.
Each seed mutates outside the checker-under-test path and has a separate expected
failure record. Keep checkpoint bypass distinct from
`false_acceptance = accepted AND independent_ground_truth_fail`.

**Verify**: Adversarial and Mutation commands exit 0, report every seed killed,
and report zero known false acceptances.

## Test plan

- One-command stable order, nonzero propagation, offline/no-credential run.
- Every controller trust boundary has one independently owned mutation seed.
- Integrity-only cumulative leakage/query-cap and confidential-oracle rejection.
- Cache, process, output, evidence, path, and workspace resource caps.
- Known deterministic escape always blocks regardless of aggregate counts.

## Done criteria

- [ ] Recut records both dependency SHAs and one shared-branch final-head SHA.
- [ ] `verify-kernel` is complete for kernel invariants and offline.
- [ ] Every named mutation is detected; zero known false acceptances remain.
- [ ] No host candidate command, credential, or shared writable cache exists.
- [ ] Comparator evidence uses truthful visibility/leakage labels.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on incomplete fan-in, host candidate execution, mutable-network dependency,
visible expected bytes, false confidentiality claim, escaped deterministic
mutation, unbounded hostile input/output, or work beyond one session.

## Maintenance notes

Every verifier defect gains an independent seed before repair is complete. Plan
025 consumes this gate for the first bounded eval migration batch.
