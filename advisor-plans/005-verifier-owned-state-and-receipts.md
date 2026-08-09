# Plan 005: Make execution state and DONE verifier-owned

> **Executor instructions**: Implement state transitions as control-plane
> operations. Models may request transitions and submit candidates; they must
> never edit canonical state or receipts directly. Preserve the stated trust
> boundary and stop if evidence cannot be tied to current content hashes.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — breaking change to status protocol and completion semantics
- **Depends on**: `advisor-plans/004-compiled-plan-contracts.md`
- **Category**: correctness / architecture / security
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Current executor protocol lets the executor write `DONE`, then Reconcile later
calls executor claims untrusted. It also lets `REJECTED` satisfy the goal even
though Reconcile requires all rows DONE. This creates false terminal states.
This plan makes status a typed state machine and defines DONE only as a computed
view of a current passing verification receipt.

## Current state

- `skills/tailrocks-plan/references/goal-handoff.md:46-80` lets executors edit
  status rows, mark DONE/BLOCKED, and set the roadmap item DONE.
- `skills/tailrocks-plan/references/goal-handoff.md:111-134` treats DONE or
  REJECTED as terminal success.
- `skills/tailrocks-reconcile/SKILL.md:29-31` says executor claims are
  untrusted.
- `skills/tailrocks-reconcile/SKILL.md:75-77` grants item DONE only when all
  rows are DONE and gates pass.
- `skills/tailrocks-idea/references/roadmap-item-format.md:21-23` says executor
  protocol may set IN EXECUTION and DONE.
- Current state has no lease, candidate, receipt, environment hash, or
  authoritative transition log.

## Target state model

Use one closed controller-owned run state machine:

```text
CREATED -> PREFLIGHT -> READY(plan-id) -> EXECUTING(plan-id)
        -> VERIFYING(plan-id) -> VERIFIED(plan-id) -> READY(next-plan)
        -> FINAL_VERIFYING -> PASS
```

Exact terminal failure states are `BLOCKED`, `STALE`, `BUDGET_EXHAUSTED`,
`ENVIRONMENT_DRIFT`, `VERIFIER_ERROR`, and `TAMPERED`. Recovery starts an
explicit new transition after its prerequisite changes; unknown/ad-hoc states
are invalid.

The executor may emit only append-only claims—`CLAIMED_DONE`,
`CLAIMED_BLOCKED`, or `CLAIMED_STALE`—plus a candidate description. Claims are
inputs to the controller, never control states:

```text
CLAIMED_DONE != VERIFIED
native /goal says complete != PASS
```

`VERIFIED` and `PASS` are not writable states. A plan's deterministic
verification is derived:

```text
deterministic_verified = latest receipt PASS
  and receipt.contract_hash == current contract hash
  and receipt.package_hash == current package hash
  and receipt.oracle_hash == current oracle hash
  and receipt.resolution_hash == current resolution hash
  and receipt.environment_hash == current frozen environment hash
  and receipt.subject_tree_hash == current repository subject-tree hash
  and receipt.control_generation_hash == current control-generation hash
  and receipt chain is complete and valid
  and no terminal budget/tamper state is active
```

The subject tree is the complete repository tree except one exact, versioned
set of control-only paths for this slug (active package projections, status/
receipt projections, and retirement metadata). Application source, tests,
toolchains, dependencies, configuration, and any undeclared path remain in the
subject. The excluded path set is frozen in the package and cannot use broad
globs. Candidate commit/tree SHAs remain provenance, but literal HEAD is not the
validity predicate: otherwise a verifier-authored status or retirement commit
would invalidate the implementation it just certified.

Compute the subject hash from a canonical sorted manifest of repository-relative
path, Git mode/type, and SHA-256 content for tracked files plus non-ignored
untracked candidate files, after applying only that exact exclusion list.
Include submodule commit IDs and symlink targets; reject path/case collisions.
Ignored/runtime data can influence gates only through the frozen environment/
fixture contract and is never silently treated as source.

`control_generation_hash` is a logical JCS hash of slug, generation ID, and the
canonical contract/package/coverage/oracle/resolution digests. It is independent
of Markdown/status/receipt file locations and remains identical when an active
package is projected into a completion attestation during retirement. A
normative/control-generation change alters it; a projection-only commit does
not.

`CANCELLED` may exist only after an explicit contract change removes/reassigns
its requirements. `REJECTED` cannot be emitted by an executor or satisfy
completion; it requires an immutable planning-time or user-approved decision
receipt plus restored requirement coverage.

Package `PASS`/roadmap `trusted_done` is reserved for the full policy
conjunction:

```text
trusted_done = every required plan deterministic_verified
  and every package deterministic gate current PASS
  and every required convergence/review/human/external axis current PASS
```

Plan 007 implements the final axes. Until then, the convergence component is
`pending` and roadmap DONE must remain false; deterministic receipts alone must
not expose a temporary false terminal state.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all gates pass |
| Claim | `tailrocks goal claim goal-live-status 001 --json` | valid lease and `EXECUTING(001)` |
| Submit | `tailrocks goal submit goal-live-status 001 --json` | immutable candidate claim; no VERIFIED transition |
| Verify | `tailrocks goal verify goal-live-status 001 --json` | PASS receipt or exact controller failure state |
| Status | `tailrocks goal status goal-live-status --json` | computed state, durable budgets, receipt chain; no editable DONE field |

## Scope

**In scope**:

- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**`
- `schemas/v1/**` state, lease, candidate, event-log, durable-budget, and
  receipt-chain schemas
- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/references/plan-template.md`
- `skills/tailrocks-reconcile/SKILL.md` only status/receipt semantics
- `skills/tailrocks-idea/references/roadmap-item-format.md`
- affected plan/reconcile/finalize/record-decision evals
- `examples/plan-package/**` state/evidence projection
- `docs/pipeline-walkthrough.md` execution/reconcile status wording

**Out of scope**:

- Invoking coding providers or installing hooks; plan 006.
- Independent semantic/standards review; plan 007.
- Package retirement/deletion; plan 009.
- Defending against an attacker who controls the verifier binary and its trust
  root. This design removes model authority, not host compromise.

## Git workflow

- Branch: `advisor/005-verifier-owned-state`
- Conventional commits, e.g. `feat(core): derive DONE from receipts`; use DCO
  signoff and `Co-authored-by: Codex <codex@openai.com>`.
- Do not push/open PR without operator instruction.

## Steps

### Step 1: Define canonical state outside generated Markdown

Add an append-only control-plane event log and typed derived state. State writes
occur only through CLI commands. README status tables are generated projections;
`tailrocks generate package --check` rejects direct edits.

Authoritative runtime state lives in the platform-appropriate user state
directory or an explicit operator-owned trust root, never under the executor
worktree. `tailrocks goal state-path --json` reports the resolved repo ID, run
ID, state/log/receipt paths, ownership, and trust mode without leaking secrets.
An executor-visible run pointer is non-authoritative and validated against the
trusted record.

Events include monotonic sequence, actor/provider/session, timestamp, prior
event hash, transition, contract/package hashes, subject/control-generation
hashes, budget deltas, and reason. Unknown/illegal transitions fail. A changed
contract/package/oracle/resolution, subject tree, or relevant control generation
automatically derives `STALE`, `ENVIRONMENT_DRIFT`, or `TAMPERED` without a
model edit.

**Verify**: transition tests cover every legal edge and reject skipped,
backward, unknown, concurrent, replayed, truncated, and hand-edited transitions;
an agent-writable in-worktree state file cannot affect derived state.

### Step 2: Add expiring claims, overlap safety, and durable budgets

`tailrocks goal claim <slug> <plan-id>` checks the controller selected this
exact plan, every dependency has a current VERIFIED receipt, and no active lease
overlaps its write/effect set. It writes an expiring lease with
executor/provider/session identity. Lease expiry returns the run to
`READY(plan-id)` after reconciliation; a dead claim never remains EXECUTING.

Persist every contract bound across client restart/resume: slices, attempts per
plan, verification cycles, provider turns/tool events when exposed, wall time,
and output bytes. Claude's native counters resetting after `--resume` must not
reset these totals. Budget updates use compare-and-swap against the event-chain
head. Crossing a hard bound produces `BUDGET_EXHAUSTED`; only an explicit new
operator-approved contract generation can raise it. When an adapter cannot
observe a required counter, preflight rejects that provider/package pairing.

Support explicit release and deterministic expiration. Clock source must be
injectable in tests. Never infer a live executor or budget from prose.

**Verify**: tests cover claim, conflict, expired lease, release, dependency
failure, disjoint safe parallel claims, crash/resume, counter replay, concurrent
increments, hard-bound stop, and forbidden prompt-only budget substitution.

### Step 3: Submit immutable candidates instead of DONE claims

`tailrocks goal submit` accepts an executor claim and captures base/candidate
HEAD/tree provenance, the computed repository subject-tree hash,
control-generation hash, binary-safe patch hash, plan hash, tracked/untracked/
ignored-path inventory, changed Git modes/submodules/symlinks, and declared
effects. It moves EXECUTING to VERIFYING; `CLAIMED_DONE` itself changes no
verified state. Submission performs cheap prechecks but does not certify
success. A candidate changing any protected path, excluded-control-path policy,
gate wrapper, hook/controller input, or effect budget produces `TAMPERED` before
expensive gates.

**Verify**: tests reject submit without lease, moved provenance HEAD, oracle
change, changed exclusion policy, out-of-budget effect, and stale contract;
valid submit records exact subject/control/provenance hashes.

### Step 4: Execute gates safely and write receipts

`tailrocks goal verify` consumes a clean verifier replay produced by plan 006
and runs frozen gates using structured argv/cwd/env fields, not
shell-interpolated strings. Capture exit code, bounded stdout/stderr hashes and
redacted excerpts, duration, tool/client versions, sandbox/container digest,
environment hash, base/candidate commit/tree, all contract/package/oracle/
resolution hashes, and verdict.

Receipts include candidate commit/tree provenance but bind validity to the
subject tree and control generation. Receipts are append-only and
content-addressed. Every receipt contains a monotonic sequence and
`previous_receipt_sha256`; verify the full chain so deletion, insertion,
reordering, or replacement is detectable. Store authoritative local receipts in
the external control-plane state directory; commit only a generated projection/
digest. Make trust root/path explicit. Support optional operator/CI signatures
without treating an unsigned local chain as adversary-resistant. If host
permissions cannot separate the agent and verifier, label the receipt
`local_non_adversarial`; never claim it resists a malicious host-level actor.

Also store approved contract/oracle/human-attestation anchors here; worktree
copies cannot replace a trusted anchor.

**Verify**: receipt tests cover pass, failing command, timeout, output
redaction/truncation, subject change during run, control-only projection change,
stale hash, missing/reordered/replaced chain member, wrong prior hash, optional
signature, forged worktree anchor, and tampered projection.

### Step 5: Derive VERIFIED and reserve PASS for full convergence

A plan becomes VERIFIED only from a current PASS receipt. Derive package
`deterministic_verified` from every required manifest plan VERIFIED, every
package-level deterministic gate PASS, and no stale/uncovered requirement.
Define the final `PASS`/`trusted_done` schema/predicate as the conjunction above,
with required convergence axes unresolved until plan 007 supplies their current
receipts. The roadmap item's displayed DONE state is generated only from final
`PASS`; skills/models cannot set it. Nominal model completion enters
`FINAL_VERIFYING`, never PASS. `PASS` is legal only after the latest repository
change, final clean-room gates, and plan 007's deterministic final reconcile
produce a current receipt for the same subject/control generation.

Remove `REJECTED` as a terminal success. To remove work, Record Decision must
change the approved contract, coverage must be restored, and Package must be
recompiled. Preserve rejection/cancellation rationale in history, not as
coverage bypass.

**Verify**: regression tests prove a REJECTED/CANCELLED required plan cannot
finish, a stale/tampered receipt removes deterministic verification, unchanged
current receipts derive it consistently, and missing convergence-axis receipts
keep PASS/roadmap DONE false. Tests also prove a model/native `/goal` success
claim, previous-subject PASS, or schema-valid claim cannot create PASS.

### Step 6: Rewrite delivery protocols and evals

Update Plan, roadmap format, and Reconcile wording:

- executor may request a claim, edit implementation, emit a candidate claim,
  and read failures;
- only verifier writes receipt/derived state;
- no skill or agent edits DONE/status tables, budgets, event logs, or receipts
  directly;
- Reconcile re-derives state and reruns checks, never “trusts an unchanged
  status” without a hash-valid receipt.
- status/receipt/retirement projection changes do not preserve validity by
  accident; only the exact frozen control-path exclusion set does.

Migrate example projections and typed evals. Add deterministic regressions for
the former contradiction: all rows DONE/REJECTED must no longer pass GOAL while
Reconcile refuses DONE; a native evaluator's “complete” output and a forged
in-worktree state/receipt must likewise remain non-authoritative.

**Verify**: `mise run verify`, affected skill eval preflights, and example
package status command all pass.

## Test plan

- State machine: full legal/illegal transition table.
- Claims/budgets: dependency, overlap, expiry, release, clock determinism,
  crash/resume, CAS races, replay, and every hard bound.
- Candidate: provenance commit/tree, subject/control-generation, diff/effect/
  oracle hashes, exclusion policy, and stale input rejection.
- Gate runner: argv safety, cwd, environment allowlist, timeout, redaction.
- Receipt: hash-chain continuity, append-only behavior, tampering,
  current/stale hashes, optional signature, and host trust label.
- Completion: all deterministically verified but convergence pending, all axes
  verified, one failed, one stale, rejected required work, changed subject tree,
  control-only retirement projection, changed oracle, changed contract.
- Skill evals: executor cannot write DONE; Reconcile cannot promote claims.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] No canonical status is stored in hand-edited Markdown.
- [ ] Executor can only emit candidate/blocker/stale claims, never certify
      VERIFIED, PASS, DONE, or REJECTED.
- [ ] Runtime state, budgets, anchors, and receipts live outside the executor
      worktree and every mutation is append-only/CAS-checked.
- [ ] Every PASS receipt is tied to current contract/package/oracle/resolution,
      environment, subject-tree, control-generation, and provenance hashes.
- [ ] Receipts form a verified hash chain; missing, reordered, replayed, or
      replaced records fail closed.
- [ ] Control-only status/retirement commits preserve a receipt; any source,
      test, toolchain, dependency, config, or other subject change invalidates it.
- [ ] Package PASS/DONE is a computed full-convergence predicate; deterministic
      receipts alone cannot set it, and stale/tampered evidence removes it.
- [ ] Resume cannot reset controller-owned slice/attempt/tool/time budgets.
- [ ] Required REJECTED/CANCELLED work cannot satisfy completion.
- [ ] Local trust limitation is explicit and tested.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Authoritative receipt storage remains writable by the same unrestricted agent
  but documentation would call it adversary-resistant. Label trust accurately
  or stop for an operator-owned/CI trust root.
- A verification command requires shell interpolation of plan/user input.
- A state transition cannot be derived from immutable events and current hashes.
- A required provider counter cannot be observed durably: reject that
  provider/package pairing instead of accepting a prompt-only bound.
- The proposed control-path exclusion can hide application/test/config changes
  or contains a broad/unversioned glob.
- Backward compatibility would preserve executor-written DONE as authoritative.

## Maintenance notes

Treat transition/event/receipt schemas as security-sensitive public API. Keep
gate execution minimal and capability-bounded. Review any new terminal state for
coverage bypass. `trusted_done` should remain one pure, heavily tested function
over current hashes and receipts.
