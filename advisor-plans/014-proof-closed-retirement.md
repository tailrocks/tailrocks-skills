# Plan 014: Retire into a proof-closed archive

> **Executor instructions**: Finish archive/confirm/reopen behavior in one
> session. Retirement is explicit and separate from PASS/APPLIED. Archive every
> referenced proof dependency and a reconstructible exact final tree.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 013 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 013
- **Covers**: G13
- **Guardrails**: N06, N08, N11, N13-N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-11, F4-12, F4-15, F4-20
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

A package and receipt alone cannot validate final proof after squash, feature-
ref deletion, or Git object pruning when referenced evidence and exact final
tree remain external. Retirement must close that graph explicitly while keeping
human-readable artifacts and never reusing old proof as current intent.

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
rtk git merge-base --is-ancestor <plan-013-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-core/src/retirement crates/tailrocks-cli/src schemas/completion.schema.json skills/tailrocks-reconcile skills/tailrocks-record-decision skills/tailrocks-idea/references/roadmap-item-format.md archives/plans examples/plan-package docs
rtk cargo test -p tailrocks-core apply
rtk mise run validate
```

Expected: exact integration/ancestry and scoped drift pass; safe apply and
repository gates are green.

## Spec contract

### Requirement G13: readable proof-closed retirement and clean reopen

Retirement SHALL transition PASS/APPLIED→RETIRING, construct a readable archive
with final receipt, every referenced sanitized evidence blob, and standalone Git
bundle reconstructing the exact final tree, then apply via plan 013. RETIRED
requires operator confirmation that protected default contains the exact archive
subtree/completion digest. Reopen SHALL create new SHAPING intent without making
old evidence current.

#### Scenario: squash merge and feature-ref deletion

- **WHEN** archive lands by squash and every feature ref/unreachable object is
  removed
- **THEN** fresh-clone inspection reconstructs the receipt tree from the bundle
  and validates the complete evidence closure.

#### Scenario: missing sensitive proof

- **WHEN** receipt directly depends on a sensitive/reusable blob that cannot be
  placed in durable sanitized closure
- **THEN** remain RETIRING; do not claim proof-closed retirement.

## Must NOT

- **N06**: secret/reusable protected-oracle bytes cannot enter Git archive.
- **N08/N13**: archive/history identity does not make old proof current.
- **N11**: no automatic retire/push/merge; PASS/APPLIED survive failure.
- **N14/N15**: no shared cache, feature-ref reachability, tar/zip/extraction, or
  duplicated spec authority.
- **N16**: archive/evidence ingestion has strict paths/count/byte caps.

## Inputs to provide

- Explicit operator retirement authorization after exact dry-run.
- Already-fetched protected repository/ref/commit for confirmation. Unknown
  protection/identity keeps RETIRING.

## Starting state

- Plan 013 supplies sanitized off-worktree commit/apply primitives.
- Receipt evidence currently lives in external SQLite/blob state and exact final
  tree can disappear after squash/GC; active package alone is insufficient.
- Archive target is `archives/plans/<slug>/<sha256(final-receipt-bytes)>/`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Closure | `rtk cargo test -p tailrocks-core retirement::closure` | exit 0 |
| Bundle | `rtk cargo test -p tailrocks-core retirement::bundle` | exit 0 |
| Lifecycle | `rtk cargo test -p tailrocks-core retirement` | exit 0 |
| Preview | `rtk cargo run -p tailrocks-cli -- plan retire goal-live-status --dry-run --json` | exact paths; eligible |
| Inspect | `rtk cargo run -p tailrocks-cli -- plan inspect-archive --example examples/plan-package --require-proof-closed` | exit 0 |

## Scope

**In scope**:

- `crates/tailrocks-core/src/retirement/**`
- CLI `plan retire/inspect-archive/confirm-retired/reopen`
- `schemas/completion.schema.json`
- `archives/plans/**`, relevant delivery skill handoffs, worked example/docs

**Out of scope**:

- Automatic push/merge, compressed extraction formats, source/research deletion.
- Reusing archived oracle/evidence as current, or a duplicate `specs/` tree.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(delivery): archive complete goal proof`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Build a bounded evidence closure

In controller disposable clone, validate exact regular package path/destination.
Copy each receipt-referenced sanitized evidence blob by digest/length into
`evidence/sha256/<digest>`; reject missing, extra, mutable, sensitive, reusable,
symlinked, or oversized inputs. Include immutable `final-receipt.json`.

**Verify**: Closure tests cover complete graph, missing/extra/wrong digest,
secret/reusable oracle, traversal/symlink, count/byte overflow.

### Step 2: Bundle a reconstructible exact final subject

Create an unsigned synthetic carrier commit whose tree equals receipt final tree
and whose author/committer/message/timestamp/timezone are canonical. Create
standalone `final-tree.bundle`; verify it into a fresh bare repo and compare tree.
Bundle is transport evidence, not receipt identity.

**Verify**: Bundle tests delete feature refs/unreachable objects, import only
bundle, and require exact tree; wrong metadata/tree/truncated bundle fails.

### Step 3: Move package and apply retirement commit safely

Move complete readable package into digest directory; add receipt, bundle,
evidence closure, and `completion.json` binding READY/contract/receipt/tree,
  bundle/evidence digests, archive subtree, verifier/trust versions. Reuse plan
  013's low-level sanitized Git/worktree/CAS primitive under retirement's own
  current-applied-parent and closure checks; do not reuse `goal apply` receipt-
  base semantics. Apply explicitly. Journal stays RETIRING.

**Verify**: crash/race injection leaves operator target unchanged or exactly
classifiable; PASS/APPLIED remain.

### Step 4: Confirm protected closure; inspect and reopen

Against already-fetched protected commit, verify exact subtree/completion,
receipt, evidence, and bundle tree before external journal becomes RETIRED.
Fresh-clone inspect uses protected bytes only and executes/extracts nothing.
Reopen preserves archive/completion, appends new decision, returns SHAPING, and
creates no current status from old receipt.

**Verify**: retire→squash→delete refs/objects→fresh clone→inspect→reopen→replan
fixture passes; altered/missing closure remains RETIRING.

## Test plan

- Complete/missing/extra/sensitive/oversized evidence closure.
- Exact-tree standalone bundle after squash/ref deletion/GC simulation.
- Sanitized archive move/apply with crash/race recovery.
- Protected confirmation, fresh-clone inspection, non-reactivating reopen.

## Done criteria

- [ ] Recut records plan-013 checkpoint, frozen base, and shared-head SHAs.
- [ ] Archive contains readable package, receipt, complete sanitized evidence,
  and standalone exact-tree bundle.
- [ ] Squash/ref deletion/object pruning cannot break fresh-clone inspection.
- [ ] RETIRED requires exact protected subtree confirmation; reopen starts new intent.
- [ ] Commands/diff/scope checks and one signed/co-authored commit pass.

## STOP conditions

Stop if any proof dependency is unavailable/sensitive/reusable, exact tree cannot
bundle, Git policy could execute, target/destination is ambiguous/symlinked,
protected identity unknown, closure depends on feature refs/cache, or completion
needs automatic push/merge/extraction.

## Maintenance notes

Plan 008 consumes proof-closed fixtures. Archive schema changes require fresh-
clone compatibility tests; never silently rewrite old generations.
