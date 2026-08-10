# Plan 007: Converge exact-tree evidence and route every failure

> **Executor instructions**: Finish convergence/review/routing in one session.
> Reuse plan 012 final proof. Do not implement apply or retirement; plans 013/014
> own those explicit operator transitions.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 012 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 012
- **Covers**: G09-G12
- **Guardrails**: N01, N06-N09, N11-N14, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-04, F4-11, F4-12, F4-15
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Some contract seams require semantic, visual, human, or external judgment.
Votes and reviewer repetition cannot replace deterministic truth, and one failed
axis must never hide another. This slice binds current attestations to the exact
final subject, reruns deterministic truth, retains the complete failure set, and
routes causal roots without giving reviewers or executors kernel authority.

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
rtk git merge-base --is-ancestor <plan-012-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-core/src/convergence crates/tailrocks-cli/src schemas/final-receipt.schema.json skills/tailrocks-reconcile examples/plan-package docs/deterministic-goal-trust.md
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3
rtk cargo test --workspace --all-features
rtk mise run validate
```

Expected: exact integration/ancestry and scoped drift pass; deterministic
multi-slice fixture has one current final-tree receipt; all gates are green.

## Spec contract

### Requirement G09-G12: current conjunctive truth and causal routing

PASS SHALL require plan-012 deterministic final proof plus every contract-
declared current attestation over identical READY/contract/final-tree/evidence
digests. All failures SHALL remain recorded. The active route SHALL be the
earliest causal owner, or BLOCKED with all incomparable roots. Only an operator
capability may import attestations.

#### Scenario: stale semantic approval

- **WHEN** a passing review names an older final tree or expired evidence
- **THEN** state is AWAITING_ATTESTATION; no historical verdict can PASS.

#### Scenario: compound failure

- **WHEN** intent and implementation checks both fail
- **THEN** retain both; route intent first and suspend downstream repair until
  the intent generation changes.

## Must NOT

- **N01/N08**: scores, votes, transcripts, ancestry, or progress cannot PASS.
- **N06/N07**: reviewer credentials/home/tools stay outside candidate/PR control.
- **N09**: reviewer prose cannot become contract authority.
- **N11**: PASS does not apply, push, merge, release, or retire.
- **N12-N14**: reviewers do not own state/oracle; hash claims stay narrow; no
  shared writable cache.
- **N16**: reviewer payload/response/evidence counts and bytes are bounded.

## Inputs to provide

- Contract-declared attestation criteria, issuers, accepted exact trust modes,
  freshness/expiry, and subject digests. Missing evidence remains awaiting.
- Operator-controlled reviewer outputs; no model credential may enter the run.

## Starting state

- Plan 012 reruns the complete deterministic union on exact final tree and owns
  broker submit/checkpoint/status.
- Protected expected values remain in the trusted comparator; reviewers cannot
  author or read reusable deterministic ground truth.
- Reconcile currently distrusts DONE claims but needs typed current attestations
  and complete causal routing.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Attestation | `rtk cargo test -p tailrocks-core convergence::attestation` | exit 0 |
| Review | `rtk cargo test -p tailrocks-core convergence::review` | exit 0 |
| Deterministic union | `rtk cargo test -p tailrocks-core convergence::deterministic` | exit 0 |
| Routing | `rtk cargo test -p tailrocks-core convergence::routing` | exit 0 |
| Example | `rtk cargo run -p tailrocks-cli -- goal reconcile --example examples/plan-package --final` | fixture-declared exact state |

## Scope

**In scope**:

- `crates/tailrocks-core/src/convergence/**`
- CLI `goal reconcile`, reviewer payload export, operator-only `attest`
- final-receipt review/freshness fields
- `skills/tailrocks-reconcile/**`, worked example, trust docs

**Out of scope**:

- Apply/retirement, provider calls, oracle authoring, external-effect execution.
- Reviewer votes/scores or reviewer-authored deterministic expected values.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): converge current acceptance evidence`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Close attestation identity and freshness

Schema includes criterion/result, issuer and exact trust mode, READY/contract/
final-tree/evidence digests, issued/expiry/freshness rule, and signature/policy
where external. Allowed modes are explicit sets: `declared_human`,
`local_model_attested`, or `external_issuer`. Unknown mode/field fails.

**Verify**: Attestation tests reject stale/wrong subject, unknown issuer/mode,
missing criterion, prior-verdict reuse, and executor/model self-approval.

### Step 2: Keep reviewer transport outside the executor

Export minimal sensitivity-cleared payloads. Import only through operator CLI;
the three-method broker gains no endpoint. Local model review runs in a fresh
no-shell/no-home/no-tools session and is labeled local. External evidence must
verify its declared issuer policy. Review never sees protected expectations or
mutates candidate/contract/journal.

**Verify**: Review tests reject broker submission, credential/tool leakage,
forged executor evidence, stale subject, and prior-verdict leakage.

### Step 3: Conjoin with fresh deterministic proof

Rerun plan 012's complete final union, then require every current declared
attestation on the same subject. Atomically write the generation result and one
final receipt. Changed tree/policy/expired evidence creates a new generation;
old receipt is historical.

**Verify**: Deterministic tests cover stale slice evidence, changed attestation,
failing axis, receipt replay, and one-receipt atomicity.

### Step 4: Retain and route the complete causal set

Map implementation→slice; intent/flow→Brainstorm/Finalize; decision→Record
Decision; documentary fact→Research; empirical fact→Prototype; plan/oracle/DAG
→Plan; verifier/flaky gate→freeze plus Remediate; human/external→issuer. Preserve
incomparable roots and BLOCK. Update Reconcile and absent-CLI advisory fallback.

**Verify**: Routing and Example commands cover compound/incomparable causes,
backtracking, renewed generation, and no-binary advisory behavior.

## Test plan

- Exact-subject/freshness/signature/trust-set attestations.
- Reviewer capability isolation and secret/oracle redaction.
- Deterministic union plus conjunctive failing axes and generation rollover.
- Complete routing table, compound/incomparable roots, advisory fallback.

## Done criteria

- [ ] Recut records plan-012 checkpoint, frozen base, and shared-head SHAs.
- [ ] PASS names one exact current deterministic+attestation conjunction.
- [ ] Broker cannot attest; reviewers cannot own oracle or kernel state.
- [ ] Every failure remains visible and routes to earliest causal owner.
- [ ] No apply/retirement behavior exists; commands/scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop if reviewer transport exposes credentials/home/tools, executor can attest,
evidence cannot bind one exact subject, deterministic truth needs reviewer
authorship, failures need another state authority, or work exceeds one session.

## Maintenance notes

Plan 013 applies a PASS candidate explicitly; Plan 014 later retires it. Neither
may modify this acceptance predicate.
