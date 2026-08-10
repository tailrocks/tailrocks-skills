# Plan 012: Execute one serial multi-slice native goal

> **Executor instructions**: Finish this sealed-package-to-final-receipt slice in
> one session. Reuse plans 003/006/011; do not change compiler or provider
> contracts, add parallel execution, or add a second receipt kind.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 006 and 011 have current same-branch
  completion receipts at one exact head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plans 006 and 011
- **Covers**: G06-G09, G12, G15
- **Guardrails**: N01-N09, N12-N14, N16-N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-04, F4-08-F4-10
- **Planned at**: design baseline `1e809bd`; fan-in recut required

## Why this matters

Plan 003 proves one candidate and plan 006 seals a complete package. This slice
connects them: serial NEXT checkpoints, audit-only progress, fresh final-tree
all-gate rerun, and one final receipt. A later slice cannot inherit historical
proof from an earlier commit.

## Preconditions — run before anything else

After recutting from the shared-branch fan-in checkpoint, run:

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
rtk git merge-base --is-ancestor <plan-006-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-011-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-core/src/runtime crates/tailrocks-cli/src examples/deterministic-goal/multi-slice docs/deterministic-goal-contract.md
rtk cargo run -p tailrocks-cli -- plan check examples/plan-package/plans/goal-live-status
rtk bun scripts/provider-conformance.ts validate-native-tracer examples/deterministic-goal/tracer/evidence/codex-current.json
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS
rtk cargo test --workspace --all-features
```

Expected: recorded dependency/integration commits match; package is SEALED;
native tracer evidence and provider-free PASS remain current; tests pass.

## Spec contract

### Requirement G06-G09/G12/G15: serial progress, current final proof

Each slice SHALL start from the current controller run tree, submit through the
narrow per-run broker, and append audit progress only after confined iteration
gates pass. At nominal completion, checkpoint SHALL rerun every
requirement-discharge gate/attestation prerequisite on the exact final tree and
atomically issue one final receipt. Historical progress SHALL NOT discharge any
final requirement.
The exact repository gate set and proven native-provider boundary SHALL remain
part of that final union; no slice may weaken or substitute them.

#### Scenario: later regression

- **WHEN** slice three breaks a gate mapped to slice one
- **THEN** final checkpoint fails despite valid progress ancestry.

#### Scenario: exact completion

- **WHEN** final scope/contract/oracle/tool checks and all requirement gates pass
  on one tree
- **THEN** one current receipt binds that tree and native status returns PASS.

## Must NOT

- **N01/N08**: progress, status, score, ancestry, or old evidence cannot PASS.
- **N02**: budget exhaustion yields BLOCKED and never discharges acceptance.
- **N03-N05**: fixed broker/verifier paths only; no host candidate process.
- **N06/N07**: no secrets and no protected-verifier claim.
- **N09**: GOAL/plan Markdown remains generated projection.
- **N12-N14**: provider state cannot fork journal; hashes remain controlled;
  no cross-candidate writable cache.
- **N16/N17**: all candidate/broker ingress is bounded, and autonomous native
  execution retains the proven dedicated host-read boundary.
- **N18**: repeatable native comparison is integrity-only with a fixed query
  budget; it cannot be represented as confidential.

## Inputs to provide

- Full completion checkpoints for plans 006/011, frozen base, and one current
  shared head descended from both.
- One sealed deterministic-only three-slice fixture. Any required semantic,
  human, or external verdict belongs to plan 007 and blocks this fixture.
- Current per-run broker and OCI image/profile evidence.

## Starting state

- Plan 006 emits one sealed contract plus generated package projections.
- Plan 011 transports provider-free decisions through three narrow per-run
  broker tools; the executor cannot access journal, Docker, or controller FS.
- Plan 003 receipt subject is base commit + exact candidate tree + complete
  delta. Operational controller commit metadata is audit/apply data, not proof.
- No multi-slice progress or final union runner exists.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Runtime | `rtk cargo test -p tailrocks-core multi_slice` | exit 0 |
| Example | `rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3` | exit 0; one exact-tree receipt |
| Format | `rtk cargo fmt --all --check` | exit 0 |
| Lint | `rtk cargo clippy --workspace --all-targets --all-features -- -D warnings` | exit 0 |
| Rust | `rtk cargo test --workspace --all-features` | exit 0 |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `crates/tailrocks-core/src/runtime/**` (new multi-slice extension)
- `crates/tailrocks-cli/src/**` submit/checkpoint/status integration only
- `examples/deterministic-goal/multi-slice/**` (new)
- `docs/deterministic-goal-contract.md` runtime section

**Out of scope**:

- Contract compiler/Plan skill changes, provider adapter changes.
- Semantic/human/external review and routing (plan 007).
- Apply/retirement, CI, distribution, other providers.
- Parallel candidates, async queue, shared cache, external effects.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): execute serial package contracts`
- One green `rtk git commit -s` commit with Codex co-author trailer.
- Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Generate current GOAL state and append audit progress

Generate `GOAL.md` from sealed contract plus journal. It contains current slice,
exact allowed instruction/path set, fixed gate names, remaining budgets, and the
capability-scoped request command. It never embeds privileged argv or becomes
runtime input. Executor edits to generated files are rejected.

For each slice, the broker reads its controller-registered clone (the request
contains no path), constructs the candidate, and runs confined iteration gates.
On pass, CAS-update only the unattached controller run ref and append a progress
event binding slice/base/tree/delta/contract/payload/oracle/resolution/profile,
dependency event IDs, and evidence. Return NEXT. Progress events are resume/audit
only and cannot be receipts.

**Verify**: `rtk cargo test -p tailrocks-core multi_slice::progress` exits 0 for
linear/diamond order, resume, stale base, CAS race, skipped dependency, generated
projection edit, replay, and idempotent duplicate request.

### Step 2: Rerun the complete final evidence union

At nominal completion, construct the final candidate tree and rerun the
deduplicated union of every gate mapped to a requirement plus scope, contract,
oracle, tool, profile, and broker checks in fresh OCI instances. Candidate
self-checks run with no oracle visibility. Protected black-box cases receive
inputs in the candidate sandbox; expected values remain in the trusted
comparator outside that sandbox, which executes no candidate code.

V1 native progression accepts only public/candidate-visible gates and
`integrity_only` comparator gates with a sealed cumulative `max_queries` and
explicit leakage labeling. A requirement needing confidential expected data is
an unsupported human/external gate; it blocks autonomous PASS rather than
creating a hidden provider channel.

The receipt binds sealed contract/READY digests, base commit, exact final tree,
complete delta, verifier/profile, all final evidence, and accepted trust modes.
The operational controller commit is recorded separately and must have the
receipt tree/expected parent before apply. Atomically write journal PASS plus one
logical receipt. Same tree/contract/evidence yields identical receipt bytes even
if operational commit metadata differs.

No shared writable cache exists. Immutable dependency sources may be shared
read-only; every candidate gets a fresh overlay. Nondeterministic identical-
subject results freeze the gate and route to Plan, never consume executor budget.

**Verify**: `rtk cargo test -p tailrocks-core multi_slice::final_proof` exits 0;
later regression, omitted early gate, oracle exposure, altered expected value,
unmapped delta, stale tool/profile, cache poison, flaky repeat, repeat-submit
receipt equivalence, and one-receipt cases pass.

### Step 3: Run the three-slice scripted and native fixture

Create a Git-bundle fixture with three small vertical repository-only slices and
a diamond dependency. Scripted mode is committed reproducible proof; native
Codex is operator-attested transport evidence. Exercise CONTINUE, NEXT, BLOCKED,
and PASS plus forged status, oracle change, path escape, stale resolution,
skipped dependency, and stale-base second candidate.

**Verify**: Example command exits 0; exactly three audit progress rows follow the
DAG; every mapped gate reruns on final tree; one receipt equals that tree. Native
evidence maps the same decisions and receipt bytes without embedding provider
metadata into the receipt.

## Test plan

- Serial linear/diamond progress, resume, budgets, stale/CAS races.
- Generated GOAL drift and broker capability boundary.
- Integrity-only comparator separation, query caps, and no false confidentiality.
- Confidential-oracle requirement blocks autonomous PASS.
- Final all-gate union, regression, scope/tool/profile/oracle tamper.
- Tree-subject deterministic receipt and operational commit compatibility.
- Scripted/native decision equivalence.

## Done criteria

- [ ] Recut records both dependencies and one shared-branch fan-in checkpoint.
- [ ] Three serial slices reach one exact-final-tree receipt.
- [ ] Progress is audit-only; all requirement gates rerun at final checkpoint.
- [ ] Candidate sees no protected expected value or privileged broker state.
- [ ] Repeatable native results are leakage-labeled; no confidential oracle mode
  exists in V1.
- [ ] Same frozen tree/evidence yields identical receipt bytes.
- [ ] No host gate, external effect, async queue, or shared writable cache exists.
- [ ] All Commands, `rtk git diff --check`, and scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop if fan-in lacks one current same-branch head, broker exposes controller
authority/path selection, candidate can read protected expectations, final union
omits a requirement gate, receipt identity depends on ambient commit metadata,
serial CAS cannot be enforced, a confidential result returns to a live executor,
or the slice cannot finish in one session.

## Maintenance notes

Plan 007 adds non-deterministic attestations and routing without changing this
final-tree predicate. Plans 013/014 apply and retire only after its PASS.
