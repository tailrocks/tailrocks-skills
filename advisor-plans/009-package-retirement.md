# Plan 009: Retire verified active packages without losing durable truth

> **Executor instructions**: Implement retirement as one guarded transaction.
> Delete only an active package proven `trusted_done`, after durable spec and
> attestation are written and recoverability is verified. Never delete a package
> that is stale, uncommitted, blocked, or incompletely attested.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: HIGH — intentionally deletes completed `plans/<slug>/` directories
- **Depends on**:
  `advisor-plans/007-independent-convergence-reconcile.md`,
  `advisor-plans/008-empirical-prototype-skill.md`
- **Category**: correctness / lifecycle / docs
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

User wants completed plan items removed after Reconcile proves completion.
Current spec and GOAL live inside `plans/<slug>/`, while roadmap `Plan` links
there permanently. Raw deletion would erase the durable product contract and
create dangling links. This plan distinguishes disposable active execution
state from durable shipped truth: preserve finalized spec and completion
attestation, then delete the active package in the same commit.

## Current state

- `skills/tailrocks-plan/SKILL.md:19-20` owns one persistent plan folder per
  item.
- `skills/tailrocks-plan/SKILL.md:135-138` refreshes stale rows in place and
  never retires completed packages.
- `skills/tailrocks-plan/references/spec-format.md:14-19` stores the only spec
  under `plans/<slug>/spec/`.
- `skills/tailrocks-idea/references/roadmap-item-format.md:49` points `Plan`
  permanently at `plans/<slug>/`.
- `skills/tailrocks-reconcile/SKILL.md:75-90` sets DONE but preserves the hub,
  specs, GOAL, and plan files.
- Git history is present and repository workflow commits completed changes, so
  deleted active artifacts can remain recoverable after a guarded commit.

## Research basis

- [OpenSpec reviewing changes](https://openspec.dev/docs/reviewing-changes)
  validates completion before archiving. Tailrocks instead removes the active
  package after syncing durable spec and attestation, matching the requested
  lifecycle while retaining recoverable truth.

## Target durable shape

```text
roadmap/<slug>/
  README.md
  contract.lock.json
  completion.json          # current shipped attestation projection

specs/<slug>/
  README.md
  <capability>.md          # final durable product contract

plans/<slug>/              # absent after successful retirement
```

Authoritative receipts remain in the control-plane trust store from plan 005;
`completion.json` records their digests and all final hashes without copying
large logs or secrets.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all gates pass |
| Retirement preview | `tailrocks retire goal-live-status --dry-run --json` | exact durable writes/deletions; `eligible: true` |
| Retirement | `tailrocks retire goal-live-status --json` | durable spec/attestation written; active package removed |
| Post-check | `tailrocks check roadmap goal-live-status --json` | DONE, no dangling links, valid attestation |

## Scope

**In scope**:

- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**` retirement transaction
- `schemas/v1/completion*.json` and durable-spec metadata
- `skills/tailrocks-reconcile/SKILL.md` verified retirement step
- `skills/tailrocks-reconcile/evals/**`
- `skills/tailrocks-plan/SKILL.md` new-generation behavior after reopen
- `skills/tailrocks-plan/references/spec-format.md` durable sync rules
- `skills/tailrocks-idea/references/roadmap-item-format.md`
- `skills/tailrocks-record-decision/SKILL.md` reopening retired items
- `specs/**` example durable specs
- `examples/plan-package/**` retired and pre-retirement fixtures as tests require
- `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/pipeline-walkthrough.md`

**Out of scope**:

- Deleting research, source records, intent lock, durable spec, completion
  attestation, or external authoritative receipts.
- Rewriting Git history or garbage-collecting old commits.
- Retiring without the full plan 007 convergence pass.
- Automatic remote push/merge/release.

## Git workflow

- Branch: `advisor/009-package-retirement`
- Conventional commits, e.g. `feat(delivery): retire verified packages`; use
  DCO signoff and `Co-authored-by: Codex <codex@openai.com>`.
- Retirement itself must be one commit containing durable writes, roadmap/index
  update, and active-package deletion. Do not push without operator instruction.

## Steps

### Step 1: Define completion attestation

Add strict `completion.json` containing:

- roadmap slug and completion timestamp;
- verified implementation provenance commit/tree and repository
  `subject_tree_hash`;
- pre-retirement HEAD and active-package tree/hash that last contained the
  package;
- contract, package, coverage, oracle, and resolution hashes;
- each required plan ID and current PASS receipt digest;
- package-level gate/review-axis result digests;
- durable spec tree hash;
- verifier version/trust mode;
- retired plan path and control-generation/exclusion-policy hash.

Do not put the retirement commit SHA inside `completion.json`: a file cannot
content-address the commit that contains itself. After commit, derive and show
the retirement commit from Git history/ref state; it is provenance, not an
input to the attestation hash. Likewise, retirement must not invalidate PASS
receipts: plan 005 binds implementation validity to the subject tree while
hashing control artifacts separately.

No secret values or full logs. A changed durable spec or roadmap contract makes
the attestation stale and reopens the item.

**Verify**: schema/hash tests reject missing receipt, stale hash, missing review
axis, changed spec, and unknown trust mode.

### Step 2: Sync final spec before deletion

Copy/generate final capability specs from active package to `specs/<slug>/`.
Validate requirement IDs/text/scenarios/Must-NOT entries exactly match approved
contract and final coverage. Record provenance and final hash. Durable spec is
human-readable product truth; active execution metadata is not copied.

On existing durable spec, apply explicit OpenSpec-style deltas and validate the
full replacement. Never silently overwrite a different shipped contract.

**Verify**: tests cover initial sync, no-op sync, changed shipped contract with
delta, and mismatch refusal.

### Step 3: Implement guarded retirement transaction

`tailrocks retire <slug>` must preflight:

- package `trusted_done` under current subject/control-generation hashes;
- all convergence axes PASS and required human/external approvals current;
- no active lease/candidate/blocker/stale row;
- active package committed and recoverable from Git;
- durable spec and completion attestation validate;
- roadmap/index link update is known;
- deletion target resolves exactly to `plans/<slug>/`, never a broad path.

Require a clean attached non-main feature branch and expected-HEAD
compare-and-swap. Build the retirement snapshot in a temporary Git worktree/
branch at that exact HEAD: write durable artifacts, update roadmap/index to DONE
with Completion link/hash, remove only active `plans/<slug>/`, run every
post-retirement gate, and create one signed Conventional Commit with the required
Codex co-author trailer. The operator worktree remains untouched until the
snapshot is valid. Integrate only by local fast-forward/CAS from the expected
HEAD; never push. On any pre-integration failure, discard only the exact
temporary worktree/branch. Do not use destructive reset on the user's worktree.

The completion attestation binds the verified subject and pre-retirement
package generation. The resulting Git commit itself proves which commit retired
the package; no post-commit rewrite is needed.

**Verify**: integration tests inject failure at each staging/validation/commit/
CAS phase and prove the operator branch/worktree is unchanged before successful
fast-forward; concurrent HEAD movement fails CAS; path-safety tests prevent
broad/wrong deletion.

### Step 4: Make Reconcile retire only after proof

Reconcile's final step calls retirement after deterministic and independent
convergence pass. Since user explicitly selected this lifecycle, no second
confirmation is required for a clean eligible package; dry-run details are
retained in result. Any failed preflight leaves package active and returns exact
reason/route.

Update evals: clean package retires; incomplete/stale/tampered/uncommitted
package remains; durable spec/attestation always survive.

**Verify**: artifact-grounded reconcile evals inspect both durable output and
absence/presence of exact active directory.

### Step 5: Define reopen behavior

Record Decision on a DONE retired item changes intent, invalidates completion,
returns item to SHAPING, and preserves old durable spec/attestation as history.
After READY, Plan creates a fresh active package with a new generation ID and
monotonic requirement identity; it must not depend on deleted status tables.

The new package starts from current roadmap contract plus durable spec, not from
memory or old GOAL. Git history remains available for forensic comparison only.

**Verify**: end-to-end test completes, retires, records a changed decision,
re-finalizes/replans, and creates a valid new generation without resurrecting
stale receipts.

### Step 6: Update example and documentation

Keep both pre-retirement fixture input and expected retired state under test
fixtures if needed; public example should explain active vs durable artifacts.
Replace dangling Plan links with Completion/Spec links. Document recovery:
derive the retirement commit with a scoped Git log, then use `git show
<retirement-commit>^:plans/<slug>/...` or equivalent read-only history lookup,
never history rewrite.

**Verify**: link checker and package/roadmap checks report no dangling plan link;
`mise run verify` passes.

## Test plan

- Attestation completeness/current subject/control hashes, no self-referential
  commit field, and tampering.
- Spec sync/delta/no-op/mismatch.
- Retirement preflight: not done, stale, blocked, lease, candidate, missing
  human approval, uncommitted package, no Git history.
- Temporary-worktree transaction failure injection, expected-HEAD CAS, exact
  deletion target, and no user-worktree reset.
- Reconcile artifact effects.
- Reopen after retirement with new generation and no stale receipt reuse.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] Eligible trusted_done packages produce durable spec and completion
      attestation tied to verified subject/control generation and receipts.
- [ ] Active `plans/<slug>/` is deleted only in same guarded commit.
- [ ] Ineligible packages remain intact with structured reason.
- [ ] Roadmap/index contain no dangling Plan link.
- [ ] Reopen creates a fresh generation and invalidates prior completion.
- [ ] Deletion is exact, atomic, and recoverable through Git history.
- [ ] Retirement does not invalidate implementation receipts merely because
      control-only paths/HEAD changed, and no attestation self-references its
      containing commit.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Active package is uncommitted or cannot be recovered from Git.
- Durable spec/attestation does not validate against current contract/receipts.
- Deletion target cannot be resolved to one exact `plans/<slug>/` directory.
- Worktree contains unrelated user changes overlapping transaction paths.
- Expected branch HEAD changes before fast-forward/CAS.
- Retirement would erase sole copy of evidence or normative contract.

## Maintenance notes

Retirement is lifecycle cleanup, not evidence destruction. Keep exact path and
atomicity tests permanent. Future storage changes must preserve the distinction:
active execution packages are disposable; intent sources, shipped spec, and
completion attestation are durable.
