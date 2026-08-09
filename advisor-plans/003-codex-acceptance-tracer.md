# Plan 003: Ship one complete Codex acceptance tracer bullet

> **Executor instructions**: Deliver exactly one production-shaped path from a
> native Codex goal to a current PASS. Keep the schema deliberately narrow.
> Run every gate. Stop rather than generalizing around missing provider behavior.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- Cargo.toml Cargo.lock rust-toolchain.toml rustfmt.toml clippy.toml deny.toml crates/ schemas/ integrations/ examples/deterministic-goal/ docs/deterministic-goal-trust.md mise.toml`
> Rebase onto completed plan 002, refresh this baseline, and confirm plan
> 002's research verdict is `SUPPORTED` before changing code.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: plan 002
- **Category**: direction, security, feature
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 002

## Why this matters

This slice tests the whole architecture before generalization: one frozen
contract, one serial candidate, one controller-generated Git tree, one clean
verification clone, one transactional journal, one Codex Stop adapter, and one
final receipt. It breaks the first draft's schema→anchor→replay dependency cycle
and gives later plans a working API instead of imagined layers.

The local tracer is explicitly `local_non_adversarial`. A disposable clone and
trusted plumbing reduce accidental/self-certification failures; they do not
secure one unrestricted OS user against itself.

## Current state

- No Rust workspace or `tailrocks` executable exists.
- `mise.toml` pins only Bun.
- Plan 002 must have retained live evidence that native Codex `/goal` obeys
  CONTINUE, PASS, resume, and effective-hook preflight.
- `skills/tailrocks-plan/references/goal-handoff.md:60-79` currently lets the
  executor write DONE. The tracer must instead let the executor submit only a
  workspace candidate.
- Git plumbing provides canonical identity: `git write-tree` writes a tree from
  an index; `git commit-tree` creates a commit from that tree. Do not invent a
  separate subject-tree algorithm.

## Preconditions

Run after rebasing onto dependency tips:

```sh
rtk bun scripts/provider-conformance.ts validate-research research/native-goal-control
rtk bun test scripts/
rtk mise run validate
```

Expected: provider conclusion `SUPPORTED`; all script tests pass; 15 skills
validate. If not, stop.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Toolchain | `mise install` | pinned Bun/Rust tools installed |
| Format | `cargo fmt --all --check` | exit 0 |
| Lint | `cargo clippy --workspace --all-targets --all-features -- -D warnings` | exit 0 |
| Tests | `cargo test --workspace --all-features` | exit 0 |
| Docs | `RUSTDOCFLAGS='-D warnings' cargo doc --workspace --no-deps` | exit 0 |
| Skills | `mise run validate` | 15 skills valid |

## Suggested executor toolkit

Explicitly invoke `tailrocks-rust-project-setup` for workspace/tooling and
`tailrocks-rust-best-practices` for public APIs, failure types, tests, and docs.
Use current crate documentation before selecting APIs/versions. Follow their
templates rather than inventing a weaker workspace.

## Scope

**In scope**:

- `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `rustfmt.toml`,
  `clippy.toml`, `deny.toml`, `mise.toml`
- `crates/tailrocks-core/**` (new)
- `crates/tailrocks-cli/**` (new)
- `schemas/goal-contract.schema.json` (new, tracer subset)
- `schemas/receipt.schema.json` (new)
- `integrations/codex/**` (new; exact hook shape proven by plan 002)
- `examples/deterministic-goal/tracer/**` (new)
- `docs/deterministic-goal-trust.md` (new)

**Out of scope**:

- General roadmap/plan compilation, provenance, semantic reviewers, package
  retirement, Grok, Claude, publication, or plugin version bumps.
- Parallel implementation.
- Agent-usable network tools/egress, injected credentials, subprocesses other
  than allowlisted Git/gate commands, database/deploy/device/IPC effects, or
  writes outside the disposable clone. Provider inference transport remains.
- Claims of malicious-host isolation.

## Git workflow

- Branch: `feat/codex-acceptance-tracer`
- Use vertical commits that remain green. Final subject example:
  `feat(goal): add Codex acceptance tracer`.
- Every commit uses `git commit -s` plus
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not push/open a PR without operator instruction.

## Steps

### Step 1: Establish the strict Rust workspace and minimal contract

Use the repository's Rust project-setup templates. Create library
`tailrocks-core` and thin binary `tailrocks`. Add only current stable direct
dependencies needed for typed JSON, SHA-256, errors, temp directories, and
SQLite with bundled/reproducible support. Keep dependency features minimal and
exactly locked.

Define a versioned `GoalContractV1` containing only:

```text
package_id, base_commit, instruction_files[{path, sha256}],
allowed_write_paths, protected_paths, gate{program,args,cwd,timeout},
attempt_budget, trust_mode=local_non_adversarial
```

Serialize once in Rust with a fixed field order and hash the exact emitted
bytes. Validate paths as repository-relative, normalized, non-overlapping where
required, and default-deny. Do not add manifest/coverage/resolution/oracle lock
files or RFC-8785/cross-language validators.

**Verify**: `cargo test -p tailrocks-core contract` → exit 0; round-trip,
unknown-version, duplicate path, traversal, overlap, and byte-stability tests
pass.

### Step 2: Put all authoritative runtime state in one transaction journal

Implement a SQLite WAL database outside the executor clone. Migrations create
one event table and immutable evidence blob references. Typed events cover:

```text
RunPrepared, SliceClaimed, CandidateSubmitted, VerificationStarted,
GateRecorded, SliceVerified, FinalVerified, Continued, Blocked, Passed
```

One transaction writes the event, derived current state, budget decrement, and
receipt reference. Enforce legal transitions and one active serial claim. On
restart, replay/derived state must match; partial evidence blobs without a
committed event are ignored and can be garbage-collected.

Expose executor-safe commands `status`, `claim`, `submit`, and `checkpoint`.
Keep `anchor`, `integrate`, and final PASS internal/operator-only in API shape,
while documenting that same-user local mode is logical, not hostile isolation.

**Verify**: `cargo test -p tailrocks-core journal` → exit 0; crash-before-commit,
crash-after-blob, duplicate checkpoint, budget persistence, illegal transition,
and concurrent-claim tests pass.

### Step 3: Create candidate Git objects without trusting executor Git state

`tailrocks goal prepare` creates a disposable full clone with no writable remote
and records the frozen base. The executor may edit working files but its refs,
index, hooks, config, and commits are never authoritative.

At submit/checkpoint, the controller uses a sanitized Git environment, a
controller-owned object store and temporary index to:

1. read the frozen base tree;
2. enumerate tracked and untracked workspace paths including symlinks;
3. reject any delta outside `allowed_write_paths` or inside protected paths;
4. stage allowed bytes without user/system Git config, filters, or hooks;
5. call `git write-tree` and `git commit-tree -p <base>`;
6. record base, candidate commit/tree, and sorted delta digest.

Never exclude broad “control paths” from identity. Contract/instruction/oracle
digests are separate receipt fields.

**Verify**: `cargo test -p tailrocks-core git_candidate` → exit 0; allowed edit,
untracked file, deletion, symlink escape, outside-path edit, dirty index, hostile
config/hook/filter/alternate/ref, and stable-tree tests pass.

### Step 4: Verify the candidate in a second disposable clone

Import only the controller-generated candidate object into a new disposable full
clone. Use sanitized environment/config, checkout the exact candidate commit,
verify contract and protected-file digests, then run the fixed argv gate with
timeout and captured stdout/stderr. Do not use `sh -c` or executor-authored gate
commands. Gate processes receive no provider/repository credentials or writable
remote, run with repo/temp-only writes and no agent-usable egress, and cannot
write protected inputs.

The tracer has one deterministic gate over one expected file. A passing gate
writes a slice receipt bound to base+candidate+tree+delta+contract+gate evidence,
then a package-final receipt bound to exact candidate tree and all current
evidence. FAIL returns CONTINUE while budget remains; exhausted budget returns
BLOCKED. Only the journal may derive PASS.

**Verify**: `cargo test -p tailrocks-core verifier` → exit 0; clean pass,
wrong-content fail, oracle tamper, gate timeout, candidate mismatch, stale
contract, credential/environment absence, blocked egress, and replay idempotency
tests pass.

### Step 5: Connect the proven Codex Stop contract

Implement the exact Codex integration proven in plan 002. Preflight enumerates
the complete effective hook/config and execution-capability set: sandbox,
writable roots, environment policy, web/search, MCP/apps/plugins/tools,
additional directories, approvals, and egress. Record digests/client version;
reject conflicts, unknown precedence, external writes/tools, or secret-bearing
environment. Document that same-user filesystem read confidentiality is not
proven in local mode. The hook performs one bounded call to
`tailrocks goal checkpoint`; current PASS allows Stop, CONTINUE returns the
controller's concise repair prompt, and BLOCKED returns a terminal operator
message without claiming success.

Generated executor text contains only the current slice, allowed paths, fixed
gate name, budget remaining, and checkpoint command. Hash every byte the model
sees.

**Verify**: `cargo test --workspace codex` → exit 0; golden event fixtures from
plan 002, sibling conflict, hook mutation, timeout, malformed output, duplicate
Stop, resume, outside write, environment injection, external tool, and egress
tests pass.

### Step 6: Run the native end-to-end tracer

Create `examples/deterministic-goal/tracer/` with a frozen base, one goal
contract, one allowed target, one protected expected-value fixture, and exact
README commands. Use `tailrocks goal prepare` to produce the disposable clone,
then start native Codex `/goal` there. The model creates the target, nominally
finishes, and the Stop hook checkpoints it.

Run three adversarial variants: forged DONE text, protected-oracle edit, and
outside-path edit. None may produce PASS. The normal variant must produce both
slice and final receipts and PASS.

**Verify**:

```sh
cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --require PASS
```

Expected: exit 0; output names exact base/candidate/tree/contract/receipt digests,
one clean-clone gate, `local_non_adversarial`, and no external effects.

## Test plan

- Contract path/version/serialization property tests.
- SQLite transition, crash recovery, idempotency, budget, and serialization
  tests.
- Git hostile-config/ref/hook/filter/symlink/untracked/out-of-scope fixtures.
- Clean-clone oracle/candidate/gate/timeout/replay fixtures.
- Codex Stop/continue/pass/resume/effective-hook fixtures from plan 002.
- Native happy path plus forged status, oracle tamper, and scope mutation.

## Done criteria

- [ ] One native Codex `/goal` run reaches PASS only through the controller.
- [ ] One contract, one journal, Git identities, and one final receipt are the
  only authorities.
- [ ] Executor-authored status/refs/index/config cannot create PASS in fixtures.
- [ ] All verification occurs against a controller-generated candidate in a
  second disposable clone.
- [ ] Slice receipt binds delta; final receipt binds exact final tree.
- [ ] Runtime states `local_non_adversarial`; external effects/tools are rejected
  and same-user read-confidentiality limits are explicit.
- [ ] Format, Clippy, test, docs, skill validator, and diff checks pass.

## STOP conditions

Stop if plan 002 is not SUPPORTED, strong behavior requires trusting executor
Git metadata, verification cannot run in a disposable clone, a gate requires
network/secrets, provider capability preflight cannot reject external effects,
SQLite transitions cannot commit atomically, or the slice needs general
planning/provenance/provider abstractions to work.

## Maintenance notes

Plan 006 generalizes this working slice. Preserve its command/receipt API unless
a failing tracer demonstrates the shape is wrong. Portable binary installation
ships with plan 009; until then this example is development-only.
