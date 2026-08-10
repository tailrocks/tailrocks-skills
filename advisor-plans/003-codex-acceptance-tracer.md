# Plan 003: Ship one provider-free exact-final-tree tracer

> **Executor instructions**: Finish this vertical slice in one session. Build
> one narrow scripted path from untrusted workspace bytes to exact-tree PASS.
> Do not add provider transport, multi-slice state, async work, or generalized
> schemas. Every candidate process runs inside plan 002's proven OCI verifier.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 002 has a current same-branch completion
  receipt with `verifier_backend=PROVEN`; then recut at that exact head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 002
- **Covers**: G07, G08, G12
- **Guardrails**: N01, N04-N08, N12-N14, N16, N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-04, F4-09,
  F4-10, F4-19, F4-21, F4-25
- **Planned at**: design baseline `1e809bd`; same-branch dependency recut required

## Why this matters

This is the first useful kernel slice: one contract, controller-built candidate,
confined gate, external journal, exact final receipt, and PASS. It falsifies the
acceptance design without any provider lifecycle. Progress is journal audit
state, never proof.

## Preconditions — run before anything else

After recutting from the same-branch plan-002 completion, run:

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
rtk git merge-base --is-ancestor <plan-002-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- Cargo.toml Cargo.lock rust-toolchain.toml rustfmt.toml clippy.toml deny.toml crates schemas integrations/verifier examples/deterministic-goal docs/deterministic-goal-trust.md mise.toml
rtk bun scripts/provider-conformance.ts validate-research research/native-goal-control --require verifier_backend=PROVEN
rtk bun test scripts/
rtk mise run validate
```

Expected after recut: shared PR head/base and plan-002 ancestry match recorded
commits; scoped diff is empty; the OCI axis is current/PROVEN; 7 script tests and
15 skills pass. Codex auth,
executor-profile, and Stop-control results may be FAILED/INCONCLUSIVE because
this plan does not depend on them.

## Spec contract

### Requirement G07/G08/G12: one external acceptance path

The executor SHALL request submission of its controller-registered workspace
only. The controller SHALL construct
the Git candidate, verify it in the proven OCI backend, update one external
transaction journal, and issue one final receipt bound to the exact candidate
tree. Executor status, refs/index/commits, candidate-authored expected values,
and transcript claims SHALL NOT mint PASS.

#### Scenario: forged completion

- **WHEN** the executor writes DONE/PASS text, edits a protected input, adds a
  gitlink, or changes an outside-scope path
- **THEN** no final receipt exists and checkpoint returns CONTINUE/BLOCKED.

#### Scenario: exact pass

- **WHEN** the controller-built candidate and controller-owned oracle pass in
  the pinned OCI verifier and every bound input is current
- **THEN** one `local_non_adversarial + isolated_candidate` final receipt exists.

## Must NOT

- **N01**: executor/model status must not create PASS.
- **N04/N05**: clean clone is not confinement; all candidate code stays in OCI.
- **N06/N07**: no secrets; branch-built verifier is not protected authority.
- **N08**: no slice receipt or historical progress discharges final acceptance.
- **N12**: no provider-specific canonical state.
- **N13**: hash Tailrocks-controlled payload only.
- **N14**: no cross-candidate writable build/result cache.
- **N16**: candidate paths/workspace/process/output/evidence are all bounded;
  overflow fails rather than passing truncated data.
- **N18**: a repeatable comparison result cannot be called hidden/confidential.

## Inputs to provide

- The recut records plan 002's exact same-branch completion checkpoint, frozen
  attempt base, and current shared head. No stale/nonancestor receipt is accepted.
- Current plan-002 verifier evidence and immutable local image ID. No provider
  credential is needed or copied.

## Starting state

- No Rust workspace or `tailrocks` binary exists at `1e809bd`.
- Plan 002 supplies the hostile-canary image/profile and terminal backend result.
- Existing prose lets executors author DONE; this tracer ignores it.
- Base commit plus candidate tree and complete delta are acceptance identity.
  Controller commit is an operational carrier recorded outside receipt equality.
- The fixed house stack is Rust 2024. Use the repository Rust setup/best-practice
  skills at execution time.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Format | `rtk cargo fmt --all --check` | exit 0 |
| Lint | `rtk cargo clippy --workspace --all-targets --all-features -- -D warnings` | exit 0 |
| Tests | `rtk cargo test --workspace --all-features` | exit 0 |
| Docs | `RUSTDOCFLAGS='-D warnings' rtk cargo doc --workspace --no-deps` | exit 0 |
| Tracer | `rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS` | exit 0; one final receipt |
| Skills | `rtk mise run validate` | exit 0; 15 skills |

## Suggested executor toolkit

Invoke `tailrocks-rust-project-setup` before workspace creation and
`tailrocks-rust-best-practices` before public APIs/error types. Resolve current
crate APIs from primary docs when repository policy requires it.

## Scope

**In scope**:

- Rust workspace/tooling: `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`,
  `rustfmt.toml`, `clippy.toml`, `deny.toml`, `mise.toml`
- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**` (new, tracer only)
- `schemas/goal-contract.schema.json`, `schemas/final-receipt.schema.json` (new)
- `integrations/verifier/**` (new productionized fixture profile)
- `examples/deterministic-goal/tracer/**` (new scripted fixture)
- `docs/deterministic-goal-trust.md` (new provider-free trust boundary)

**Out of scope**:

- Codex/provider integration; plan 011 owns it.
- Multi-slice planning/runtime; plan 012 owns it.
- Source provenance, semantic reviewers, apply, retirement, distribution.
- Async workers/daemons, shared writable cache, external effects, remote refs,
  credentials, or host execution of candidate gates.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): add provider-free acceptance tracer`
- One green commit with `rtk git commit -s` and
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Cross the complete provider-free path

Create the strict Rust workspace and a private `GoalContractV1` containing only:
schema/package/base IDs, controlled payload digests, allowed/protected paths,
one fixed gate argv/cwd/timeout, verifier image/profile digests, attempt budget,
and accepted verifier mode `isolated_candidate`.

Prepare a disposable full executor clone with no writable remote. Submit SHALL
enumerate tracked/untracked/deleted/symlink bytes, reject protected/out-of-scope
paths, gitlinks/submodules and unsupported file kinds, then use a sanitized
temporary Git index/object store plus `write-tree`/`commit-tree`. Git filters,
hooks, alternates, executor config/index/refs, and commit metadata are ignored.

Mount only controller candidate, immutable dependency sources, and fresh scratch
into plan 002's exact OCI profile. Fixed argv only; no shell. Keep protected
expected values in a trusted comparator outside the candidate namespace; it
executes no candidate code and receives only bounded outputs. This tracer's
repeatable black-box gate is explicitly `integrity_only`: expected bytes remain
unmounted, the contract fixes a strict cumulative query count, and neither the
receipt nor documentation claims confidentiality. Candidate-visible iteration
checks contain no protected expectation. One SQLite
transaction outside every clone records candidate, gate
evidence, budget transition, and CONTINUE/BLOCKED or the one final receipt.
`--state-dir` is explicit; no implicit global repository ID exists.

Create a committed Git-bundle fixture with one allowed implementation, public
behavior contract, candidate-visible iteration check, and independently owned
integrity-only comparator case. Normal scripted edit reaches PASS; forged
status, an over-budget adaptive query, oracle edit, gitlink, and outside-path
variants cannot. Evidence and trust labels state that bounded comparison may
leak information and proves no secrecy property.

**Verify**: `rtk cargo test -p tailrocks-core tracer` exits 0; normal PASS and
all negative variants pass. The Tracer command prints one receipt.

### Step 2: Harden crash and hostile-Git boundaries

Keep the tracer API fixed while extracting typed contract, journal, candidate,
verifier, and receipt modules. Legal journal events are exactly:

```text
RunPrepared, CandidateSubmitted, VerificationStarted, GateRecorded,
Continued, Blocked, Passed
```

One transaction writes event, derived state, budget, and evidence reference.
Startup replay must equal stored derived state. Orphan evidence from an
uncommitted transaction is ignored; duplicate checkpoint is idempotent.
Receipt bytes exclude wall-clock time, provider metadata, and operational commit
metadata; those remain journal audit fields. Receipt identity is the canonical
encoding of base commit, exact final tree, complete delta, contract/profile/
oracle/evidence digests, and terminal result, so identical frozen inputs repeat
byte-for-byte even when the carrier commit author/time differs.

Test hostile Git system/global/repository config, hooks, filters, alternates,
refs/index, gitlinks, untracked deletion, symlink escape, stable trees, crash at
every boundary, illegal transition, concurrent checkpoint, stale contract,
changed image/profile, gate timeout, oracle mutation, and OCI escape. Candidate
tests remain candidate evidence and cannot redefine the controller oracle.
Enforce contract caps on path length, file count, workspace bytes, stdout/stderr,
evidence count/bytes, and ingestion time. Stream/hash bounded output; overflow
kills the worker and fails without treating truncation as success.

**Verify**:

```sh
rtk cargo test -p tailrocks-core contract
rtk cargo test -p tailrocks-core journal
rtk cargo test -p tailrocks-core git_candidate
rtk cargo test -p tailrocks-core verifier
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS
```

Expected: all exit 0; final receipt bytes are stable.

## Test plan

- Contract/path/payload byte stability and stale-input rejection.
- Journal transaction/replay/crash/idempotency/budget tests.
- Hostile Git candidate construction including gitlinks and external filters.
- Workspace/output/evidence/time overflow fails closed with bounded diagnostics.
- Real OCI canaries plus gate pass/fail/timeout/oracle mutation.
- Integrity-only oracle query-cap and no-confidentiality-label tests.
- One final receipt; forged status/progress cannot PASS.

## Done criteria

- [ ] Recut names plan-002 completion checkpoint, frozen base, and shared head.
- [ ] Current `verifier_backend=PROVEN`; no Codex axis is assumed.
- [ ] Scripted tracer reaches PASS; every hostile variant fails closed.
- [ ] Every candidate process runs in the exact pinned OCI profile.
- [ ] One journal and one final receipt own live state/proof; no slice receipt.
- [ ] Format, lint, tests, docs, skills, and `rtk git diff --check` pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop on stale/nonancestor dependency receipt, failed verifier backend, host candidate
process, required network/secret, controller Git unable to ignore executor
metadata, unsupported gitlink/filter behavior, SQLite unable to atomically bind
PASS to its final receipt, or any query/visibility class represented more
strongly than the enforced policy.

## Maintenance notes

Plans 004/006 extend this provider-free API. Plan 011 adds Codex transport.
Contract/receipt field changes require explicit schema compatibility.
