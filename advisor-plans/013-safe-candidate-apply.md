# Plan 013: Apply a PASS candidate without executing repository Git policy

> **Executor instructions**: Finish explicit local apply in one session. PASS
> survives every apply failure. Never push, touch default/protected refs, reset,
> or execute repository-selected Git hooks/filters/drivers.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 007 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 007
- **Covers**: G13
- **Guardrails**: N03, N06, N11, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-11, F4-12
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Updating a checked-out ref directly leaves its index/worktree stale. Ordinary
Git operations can also execute hooks, filters, fsmonitor, or merge drivers
selected by repository/config bytes. Apply must be an explicit operator action
with one sanitized Git primitive and cross-resource recovery.

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
rtk git merge-base --is-ancestor <plan-007-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-core/src/apply crates/tailrocks-cli/src schemas examples/plan-package docs/deterministic-goal-apply.md
rtk cargo run -p tailrocks-cli -- goal reconcile --example examples/plan-package --final --require PASS
rtk cargo test --workspace --all-features
```

Expected: exact integration/ancestry and scoped drift pass; current PASS and
tests are green.

## Spec contract

### Requirement G13: explicit consistent compare-and-swap apply

The operator-provided expected SHA SHALL equal `receipt.base_commit`. Receipt
tree SHALL equal a controller-owned operational commit tree whose sole parent
is that same SHA. Checked-out clean targets SHALL update
ref/index/worktree together using sanitized fast-forward. Unchecked refs SHALL
use compare-and-swap only. Any ambiguity/failure preserves PASS.

#### Scenario: checked-out target

- **WHEN** target is checked out exactly once, clean, and at expected SHA
- **THEN** guarded `merge --ff-only` leaves HEAD/index/worktree at candidate.

#### Scenario: unattached target race

- **WHEN** target moves between preflight and update
- **THEN** CAS fails; no overwrite/reset occurs and state records apply failure.

## Must NOT

- **N03/N16**: repository/config bytes cannot select executable Git policy;
  hostile paths/attributes/gitlinks are rejected before mutation.
- **N06**: Git environment has no credentials or prompts.
- **N11**: no automatic apply, protected/default target, push, merge remote,
  reset, force, or non-fast-forward.
- **N13**: matching tree/parent proves apply identity only.

## Inputs to provide

- Explicit operator apply request naming non-protected feature ref, exact
  expected SHA, run/receipt, and target repository. Expected SHA must equal the
  receipt base; absence preserves PASS.

## Starting state

- Plan 007 emits current PASS and one operational carrier commit separate from
  receipt identity.
- Existing draft used direct ref CAS after checking a worktree, which cannot
  update checked-out index/worktree safely.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Preflight | `rtk cargo test -p tailrocks-core apply::preflight` | exit 0 |
| Integration | `rtk cargo test -p tailrocks-core apply::integration` | exit 0 |
| Recovery | `rtk cargo test -p tailrocks-core apply::recovery` | exit 0 |
| Dry run | `rtk cargo run -p tailrocks-cli -- goal apply --example examples/plan-package --dry-run` | eligible exact plan |
| Full | `rtk cargo test --workspace --all-features` | exit 0 |

## Scope

**In scope**:

- `crates/tailrocks-core/src/apply/**`
- operator CLI `goal apply` and apply journal events
- apply schemas/fixtures/example/docs

**Out of scope**:

- Retirement, push/remote merge/release, protected/default refs, non-FF/reset.
- Submodule support or repository-selected Git policy execution.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): apply verified candidates safely`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Preflight exact subject, target, and worktrees

Validate receipt/run, `target_expected_sha == receipt.base_commit`, candidate
tree, carrier sole parent equal to that base, ref policy, fast-forward ancestry,
every linked worktree, cleanliness, and no ambiguity. Reject
gitlinks/submodules, symlink/path attacks, sparse checkout, malicious attributes,
filters, fsmonitor, executable diff/merge drivers, include directives, or moved
refs. Already-equal is idempotent success.

**Verify**: Preflight tests cover target/receipt-base mismatch, wrong tree/
parent/ref, protected target,
dirty/duplicate worktree, detached ambiguity, hostile config/attributes/gitlink.

### Step 2: Centralize one sanitized Git runner

Resolve trusted Git binary; clear environment; use controller empty HOME/XDG and
hooks directory; disable system/global config, prompts, credential helpers,
fsmonitor, external diff/textconv, submodule recursion, and file protocols.
Allow no executable filter/diff/merge driver. Hostile hook/filter/config fixtures
must not touch a sentinel or spawn an external program.

**Verify**: `apply::git_policy` hostile tests exit 0 with zero sentinel/process
events.

### Step 3: Apply with consistent mutation and recovery

Under repository lease, recheck all facts including target still equal to the
receipt base. Checked-out-once clean target uses
sanitized `merge --ff-only` then validates HEAD/index/worktree. Unchecked target
imports objects and `update-ref` CAS. Journal `ApplyPrepared`, perform Git, then
append `Applied`. Recovery sees expected→retry, candidate+consistent→finalize,
anything else→APPLY_INDETERMINATE; never reset to hide partial state.

**Verify**: Integration/Recovery tests inject races/crashes at every boundary
and show PASS unchanged.

## Test plan

- Checked-out/unattached/already-equal apply paths.
- Receipt-base mismatch, wrong parent/tree, moved ref, dirty/duplicate worktree,
  protected target.
- Hostile hooks/filters/fsmonitor/config/attributes/gitlinks.
- Crash/race recovery and idempotent retry; zero remote operations.

## Done criteria

- [ ] Recut records plan-007 checkpoint, frozen base, and shared-head SHAs.
- [ ] Apply is operator-only and preserves PASS on every failure.
- [ ] Target expected SHA, receipt base, and carrier sole parent are identical.
- [ ] Checked-out targets keep ref/index/worktree consistent; others use CAS.
- [ ] Repository Git policy cannot execute; no remote/destructive operation.
- [ ] Commands/diff/scope checks and one signed/co-authored commit pass.

## STOP conditions

Stop on protected/default target, dirty/duplicate worktree, parent/tree mismatch,
target/receipt-base mismatch, hook/filter/submodule requirement, concurrent
writer, indeterminate recovery, non-FF/reset/push requirement, or work beyond
one session. Applying onto a later base requires a new rebased generation and
complete final verification.

## Maintenance notes

Plan 014 must reuse this exact sanitized apply primitive for retirement commits.
