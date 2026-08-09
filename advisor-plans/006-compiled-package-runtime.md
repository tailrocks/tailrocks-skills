# Plan 006: Compile and execute one authoritative package contract

> **Executor instructions**: Generalize the proven tracer without adding another
> authority. Preserve serial execution and repository-local effects. Every step
> must leave a runnable multi-slice path; stop on protocol ambiguity.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- crates/ schemas/ skills/tailrocks-plan/ examples/plan-package/ examples/deterministic-goal/multi-slice/ integrations/codex/ docs/deterministic-goal-contract.md`
> Rebase onto plan 004, refresh this baseline and excerpts, and rerun the tracer
> and READY preconditions. Plan 005 may land before or after this plan; resolve
> catalog-only overlap by rebase, not a fake dependency.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: plan 004
- **Category**: feature, migration
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 004

## Why this matters

The tracer proves one slice. Real delivery packages need complete traceability,
ordered slices, protected oracles, exact resolution, durable budgets, and
repeated native-goal checkpoints. The first draft expressed those facts in six
interdependent lock files. This plan compiles them once into
`goal.contract.json`, then executes serial candidates through the already proven
kernel.

## Current state

- Plan 003 provides one contract/journal/candidate/verifier/Codex path.
- Plan 004 provides immutable source records and `ready.intent.json` with stable
  requirement IDs.
- `skills/tailrocks-plan/SKILL.md:83-99` requires acyclic vertical slices sized
  to one fresh executor session.
- Existing plan packages contain readable `README.md`, `coverage.md`, `spec/`,
  numbered plans, and `GOAL.md`. Preserve useful readable inputs/projections;
  make only the compiled runtime contract authoritative during execution.
- V1 remains serial. Non-overlapping path sets do not prove semantic independence
  or safe parallel integration.

Target package:

```text
plans/<slug>/
  README.md                 # generated status/manifest projection
  coverage.md               # human-readable compiler input/projection
  spec/                     # approved product spec projection
  001-*.md ...              # executor-visible, every byte hashed
  GOAL.md                   # generated current-loop handoff, every byte hashed
  goal.contract.json        # sole runtime authority
```

## Preconditions

```sh
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --require PASS
rtk cargo run -p tailrocks-cli -- ready verify examples/plan-package/roadmap/goal-live-status --require READY
rtk cargo test --workspace --all-features
```

Expected: tracer PASS, worked intent READY, all Rust tests green.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Compiler tests | `cargo test -p tailrocks-core package_compiler` | exit 0 |
| Runtime tests | `cargo test -p tailrocks-core multi_slice` | exit 0 |
| Contract check | `cargo run -p tailrocks-cli -- plan check examples/plan-package/plans/goal-live-status` | exit 0, `READY` |
| Rust gates | `cargo fmt --all --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features` | exit 0 |
| Skills | `mise run validate` | exit 0 |

## Suggested executor toolkit

Invoke `tailrocks-rust-best-practices` for compiler/runtime APIs and
`tailrocks-code-health` for monotonic machine gates. Follow current Plan skill
vocabulary and its coverage/plan templates.

## Scope

**In scope**:

- `crates/tailrocks-core/src/package/**` (new)
- `crates/tailrocks-core/src/runtime/**` (extend tracer)
- `crates/tailrocks-cli/src/**` for `plan compile/check` and generalized `goal`
- `schemas/goal-contract.schema.json` (extend v1 compatibly or version explicitly)
- `schemas/receipt.schema.json`
- `skills/tailrocks-plan/**`
- `integrations/codex/**`
- `examples/plan-package/plans/goal-live-status/**`
- `examples/deterministic-goal/multi-slice/**` (new)
- `docs/deterministic-goal-contract.md` (new)

**Out of scope**:

- Semantic reviewer orchestration, upstream backtracking, retirement (plan 007).
- Full artifact-eval/CI migration (plan 008) and distribution/release (plan 009).
- Grok/Claude (plan 010).
- Parallel implementation or merge conflict automation.
- External effects, secrets, network, deploys, databases, devices, IPC.
- Separate canonical manifest, coverage, effect, resolution, or oracle lock JSON.

## Session structure

Larger than one session. Each step ends in a committed green state; session
seams are 006a (steps 1-3, compiler), 006b (steps 4-5, runtime), 006c (steps
6-7, example and skill). Track step progress in the README row note.

## Git workflow

- Branch: `feat/compiled-goal-contract`
- Commit subject: `feat(goal): compile executable package contracts`.
- Use DCO signoff and Codex co-author trailer. No push/PR without instruction.

## Steps

### Step 1: Compile bidirectional coverage and a serial plan DAG

Add `tailrocks plan compile <package> --intent <ready.intent.json>`. Parse the
existing readable spec/coverage/plan artifacts and emit one deterministic
`goal.contract.json` that references the exact READY digest.

Compile and reject unless:

- every READY requirement maps to at least one plan and required gate/attestation;
- every plan and gate maps back to requirement(s) or a declared technical
  prerequisite with an owning requirement;
- all dependencies exist and the DAG is acyclic;
- a stable topological order is unique or an explicit tie-break is stored;
- each plan is a vertical one-session slice with exact precondition and done
  commands;
- no `REJECTED` row can satisfy coverage;
- observable behavior assumptions route upstream instead of entering execution.

Status Markdown is generated from journal state and never compiler input.

**Verify**: `cargo test -p tailrocks-core package_compiler::coverage` → exit 0;
missing/extra mapping, cycle, ambiguous order, orphan prerequisite, rejected
coverage, and valid diamond cases pass.

### Step 2: Compile a default-deny repository-local effect profile

For every slice, require normalized allowed write paths and protected paths.
Compile the union and detect overlaps. V1's only autonomous effect class is
repository-file mutation inside its disposable clone. Explicitly reject network,
environment-secret reads, external filesystem roots, subprocesses other than
controller allowlisted Git/gates, IPC, database, deploy, device, and remote-ref
effects.

An unsupported effect becomes a named human/external gate, not an unenforced
budget. The contract records read-only reference roots/digests needed by gates
and the executor's minimal visible inputs. Never claim post-hoc diff scanning can
detect secret reads.

**Dependency provisioning must be solved here, not assumed away.** House-stack
gates (`cargo test`, `bun test`) fetch dependencies; a clean clone with general
egress disabled cannot run them, and cargo/bun registry access is arbitrary
egress (build scripts, postinstall). The contract therefore names a
controller-provisioned read-only dependency store: warmed caches or vendored
sources keyed to the exact lockfile digests, provisioned by the controller
outside the executor/verifier sessions and mounted read-only into gate runs.
Registry fetches during warming are a labeled controller-side effect, not
agent-usable egress. A gate whose dependencies cannot be provisioned this way
cannot compile into the contract. Plan 002 step 4 verifies the provider
tolerates this profile.

Compile the required provider capability profile from plan 003's measured
fields. Before start and resume, runtime must recheck sandbox, writable roots,
environment inheritance, web/search, MCP/apps/plugins/tools, additional
directories, approvals, and egress. Unknown or stronger capability fails closed.
Local same-user read confidentiality remains a trust limitation, not a passing
security claim.

**Verify**: `cargo test -p tailrocks-core package_compiler::effects` → exit 0;
path traversal/overlap, undeclared untracked/deletion, env/network/external
effect, provider-capability drift, protected-path, and supported repo-local
fixtures pass.

### Step 3: Freeze oracles, resolution, environment, and executor text

Materialize deterministic gate argv, cwd, timeout, expected exit state, and
protected reference files before execution. The planner may propose them; an
operator/trusted planning step anchors their exact digests. Two anchor-time
proofs are required per gate, both cost-bounded:

- **Sensitivity (negative control)**: one named seeded defect the gate must
  fail on — a stored perturb fixture, not mutation coverage. This is what
  catches the vacuous oracle (a test filter matching zero tests exits 0 and
  would otherwise become a frozen, digested nothing). Standard house gates use
  reusable perturb templates shipped with the kernel; only novel custom gates
  need a bespoke fixture.
- **Stability**: the gate runs `k` times on the frozen base and must agree with
  itself; an unstable gate is refused at anchor time instead of surfacing later
  as false CONTINUE noise.

Record exact digests of `Cargo.lock`, Bun lockfiles if present, toolchain/config,
relevant skill instructions, plan Markdown, generated GOAL, gate executables or
scripts, and any external/human attestation policy. Hash every byte visible to
the executor. There is no “non-normative copy edit” exemption.

Rust emits deterministic contract bytes. Do not require RFC 8785 or a Bun
reimplementation; schema tests document shape, while Rust remains authority.

**Verify**: `cargo test -p tailrocks-core package_compiler::freeze` → exit 0;
oracle mutation sensitivity, writable oracle, stale lock/toolchain, plan-copy
edit, instruction drift, stable bytes, and unknown version tests pass.

### Step 4: Generate a thin native GOAL handoff

Generate `GOAL.md` from contract plus journal state. It contains only the
package condition, current slice ID, exact instruction/allowed paths, fixed gate
names, remaining controller budgets, and checkpoint command. It points to
primary artifacts rather than copying the entire package.

On each Stop, checkpoint derives one result:

- `CONTINUE`: exact current failure and same-slice repair prompt (also the
  response while an enqueued verification is still running, with a
  "verification pending — `tailrocks goal status --wait`" prompt);
- `NEXT`: current slice verified; concise next-slice prompt in the same native
  goal;
- `BLOCKED`: deterministic reason and owning operator/upstream action;
- `PASS`: only when the deterministic-only package fixture has a current final
  receipt.

Native model confidence and transcript evaluator never set these states.

GOAL.md regeneration is a controller write: it lands as a controller-owned
commit on the run ref before the next `prepare`, its path is excluded from
every slice's `allowed_write_paths`, and a GOAL.md change appearing in an
executor delta is a rejection — the executor never authors or absorbs
controller bytes inside its candidate.

**Verify**: `cargo test -p tailrocks-core multi_slice::goal_projection` → exit 0;
generation is byte-stable and any contract/journal change invalidates stale
projection/receipt.

### Step 5: Generalize serial candidate integration and slice receipts

For slice N, prepare a fresh disposable executor clone at the controller's
current verified run commit. Submit builds a controller-owned candidate commit
as in plan 003. Clean-clone verification runs slice preconditions and gates.
After pass, update only the controller's run ref with compare-and-swap and issue
a slice receipt binding:

```text
slice_id, base_commit/tree, candidate_commit/tree, exact delta,
contract_digest, instruction/oracle/resolution digests,
dependency receipt IDs, gate evidence, trust mode
```

Later slices do not invalidate an earlier receipt merely because the final tree
changed; they must preserve its candidate commit in run-ref ancestry. There is
no per-contract "selective invalidation trigger" — that draft-2 phrase had no
defined grammar and a cold executor would have had to invent one. The division
of labor is fixed instead: slice receipts are durable audit evidence of what
was verified when; the only validity claims are (a) ancestry — every slice's
candidate commit is an ancestor of the final tree, and (b) the final receipt —
all package-final gates rerun on the exact final tree plus a full-delta
authorization scan (plan 007 step 1). A dropped slice commit fails (a); deleted
tests or unmapped changes fail (b). Before final PASS, rerun all package-final
gates on the exact final tree and issue one final receipt bound to that tree
and the complete receipt DAG.

Implementation is serial even when DAG paths are disjoint. Parallel reviewers
remain allowed later.

Two runtime rules join here:

- **Latency budget.** Verifier clones share objects with the controller store,
  and gate runs may reuse a controller-owned build cache keyed by toolchain and
  lockfile digests (never executor-clone state). Record per-checkpoint wall time
  against plan 003's measured baseline; a checkpoint that costs more than the
  slice it verifies is a defect to fix, not ambient overhead to accept. In
  `local_non_adversarial` mode a warm cache is an acceptable trust trade and must
  be labeled in the receipt; strong/CI mode reruns cold.
- **Determinism sentinel.** If the same candidate tree yields different gate
  results across runs, the gate has broken its determinism contract. Classify as
  a verifier/gate defect, freeze acceptance for that gate, and route to Plan —
  never burn executor attempt budget or emit CONTINUE blaming the candidate for
  a flaky oracle.

**Verify**: `cargo test -p tailrocks-core multi_slice::integration` → exit 0;
three-slice linear, diamond, stale-base, ref-CAS race, dependency tamper,
post-slice allowed change, dropped-ancestor rejection, unmapped-delta rejection,
and final-tree tests pass.

### Step 6: Execute a deterministic multi-slice native goal

Create `examples/deterministic-goal/multi-slice/` with three small vertical
slices and a diamond dependency, all deterministic/repo-local. As in the tracer,
the frozen base is a `git bundle` plus materialize script, and the committed
proof is the scripted mode rerun by every consumer; native Codex runs are
qualification evidence. Run through
native Codex `/goal`: each nominal completion triggers clean verification and
NEXT; final deterministic reconcile yields PASS.

Include negative variants for forged status, changed test/oracle, out-of-scope
file, stale tool resolution, skipped dependency, and second candidate from a
stale base. None may PASS.

**Verify**:

```sh
cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3
```

Expected: exit 0; three slice receipts form a valid dependency DAG, one final
receipt equals the exact final Git tree, and trust mode is explicit.

### Step 7: Update Tailrocks Plan to emit the contract

Update Plan's procedure, references, template, evals, and worked package. Plan
still creates readable coverage/spec/zero-context plan files and cold reviews
them. After review, it invokes the compiler, anchors protected inputs, and emits
GOAL. It must refuse packages whose required command/tool was not guaranteed by
an earlier slice.

The skill remains dual-path: with no `tailrocks` binary present (every plugin
channel until plan 009, and any never-qualified client), Plan emits the current
prose package and the plan 000 gate-first GOAL.md unchanged; the compiled
contract path activates only when the binary is detected. Removing the prose
path is a separate, explicitly recorded deprecation decision — not a side
effect of this plan.

Every dependent plan handoff includes an observable precondition and a scoped
drift command against the dependency tip. The package manifest must be acyclic
and contain no edit-conflict-only dependency.

**Verify**: `mise run validate && bun test scripts/ && cargo run -p tailrocks-cli -- plan check examples/plan-package/plans/goal-live-status` → all exit 0.

## Test plan

- Bidirectional coverage, plan DAG, deterministic order, prerequisites.
- Default-deny path/effect profile and unsupported external-effect routing.
- Oracle mutation sensitivity and immutable execution-resolution digests.
- Executor-visible text drift and deterministic contract/projection bytes.
- Linear/diamond receipts, later-slice validity, selective invalidation, stale
  base/CAS, exact final-tree receipt.
- Native multi-slice CONTINUE/NEXT/BLOCKED/PASS and adversarial variants.
- Artifact-grounded Plan skill package compilation.

## Done criteria

- [ ] Exactly one `goal.contract.json` is runtime authority.
- [ ] Coverage is bidirectional and plan DAG executable/serial.
- [ ] V1 rejects autonomous non-repository effects.
- [ ] All executor-visible/oracle/resolution bytes are frozen and mutation-tested.
- [ ] Slice receipts survive valid later slices; final receipt equals final tree.
- [ ] One native Codex goal completes three deterministic slices and PASS.
- [ ] No executor status, majority, stale receipt, or changed oracle can PASS.
- [ ] Rust, script, skill, example, and diff gates pass.

## STOP conditions

Stop if compiler truth must be duplicated across lock files, a package needs an
unenforceable external effect, plan text can change without invalidation, slice
receipts require equality with every later tree, serial integration cannot use a
CAS, or the native goal must be replaced by a standalone loop.

## Maintenance notes

Plan 007 adds semantic/human convergence and upstream routing. Until then only
packages whose required evidence is wholly deterministic may reach PASS.
