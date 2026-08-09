# Plan 007: Make final reconciliation automatic and convergence independent

> **Executor instructions**: Reconcile must inspect repository truth, not repeat
> executor assertions. Add deterministic convergence first, then independent
> semantic reviewer axes. Reviewer output may block acceptance but cannot
> override deterministic failure or write DONE.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — expands final acceptance and routing behavior
- **Depends on**:
  `advisor-plans/005-verifier-owned-state-and-receipts.md`,
  `advisor-plans/006-execution-skill-and-provider-adapters.md`
- **Category**: correctness / tests / architecture
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Current Reconcile reruns plan commands and drift checks, but it has no independent
whole-change check for omitted behavior, unrequested behavior, project standards,
cross-plan integration, or UI truth. Re-running executor-authored done criteria
can reproduce the same blind spot. This plan makes Reconcile a mandatory
convergence gate with independent Product Contract, Scope, and Engineering
Integrity axes plus integration/visual checks where applicable. Native `/goal`
invokes deterministic final reconciliation automatically before it may stop;
the manual Reconcile skill remains a recovery/diagnostic interface. The control
plane derives the next valid stage from current artifacts and feeds it into the
active native goal instead of making the user switch to a second router
workflow.

## Current state

- `skills/tailrocks-reconcile/SKILL.md:41-73` verifies rows, abandoned sessions,
  blockers, drift, and assumptions.
- `skills/tailrocks-reconcile/SKILL.md:75-83` sets item status from row/gate
  results but does not inspect the full implementation diff against intent.
- `skills/tailrocks-reconcile/SKILL.md:21-35` keeps Reconcile verification-only
  and routes plan/product defects to owning earlier skills; preserve that rule.
- `skills/tailrocks-plan/SKILL.md:114-120` cold-reviews plan text before
  execution, not resulting code.
- `skills/tailrocks-plan/references/plan-template.md:190-193` asks the executor
  itself to assert no out-of-scope files changed.
- User requirement: independent agents should verify each completed item,
  parallel when dependencies allow, and reopen incomplete work.

## Research basis

- [Matt Pocock code review](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)
  keeps specification compliance and engineering standards as independent axes.
  Tailrocks adds a separate scope/overreach axis and verifier-owned state.
- [Matt Pocock `ask-matt`](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)
  provides a low-cognitive-load workflow router and explicit phase boundaries.
  Tailrocks makes routing state-derived rather than model-selected.
- [Spec Kit `converge`](https://github.com/github/spec-kit/blob/main/templates/commands/converge.md)
  classifies missing, partial, contradicting, and unrequested work and appends
  traceable convergence tasks without rewriting prior history.
- [shadcn/improve closing the loop](https://github.com/shadcn/improve/blob/main/skills/improve/references/closing-the-loop.md)
  reruns done criteria in a fresh context and restores stale execution truth.

## Acceptance conjunction

```text
accepted = DeterministicContractPass
       AND ProductContractReviewPass
       AND ScopeReviewPass
       AND EngineeringIntegrityReviewPass
       AND RequiredIntegrationVisualHumanPass
```

No axis may compensate for another. Reviewer disagreement is visible and blocks
until resolved or explicitly assigned to human review.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all gates pass |
| Deterministic reconcile | `tailrocks goal reconcile goal-live-status --deterministic --json` | current hashes/receipts/effects checked |
| Full convergence | `tailrocks goal reconcile goal-live-status --final --json` | all required axes PASS or structured routing failures |
| Next route | `tailrocks goal next goal-live-status --json` | current stage, blocking evidence, one required next transition, and any safe parallel routes |
| Reconcile eval | `bun scripts/run-evals.ts --skill tailrocks-reconcile --case 1 --runs 1 --retain` | artifact-grounded verdict |

## Scope

**In scope**:

- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**` reconcile/review models
- `schemas/v1/**` review request/result/convergence schemas
- `skills/tailrocks-reconcile/SKILL.md`
- `skills/tailrocks-reconcile/references/convergence-review.md` (create)
- `skills/tailrocks-reconcile/evals/**`
- `skills/tailrocks-plan/SKILL.md` final package review requirements only
- `skills/tailrocks-plan/references/goal-handoff.md` resume routing only
- `hooks/**`, `adapters/**` only for final-reconcile/route result mapping
- relevant house best-practice skill references used as reviewer inputs
- `examples/plan-package/**` convergence evidence
- `docs/pipeline-walkthrough.md` reconcile/backtracking sections
- `README.md`, `AGENTS.md`, `CLAUDE.md`, `INSTALL.md` lifecycle documentation

**Out of scope**:

- Implementing fixes found by review. Route implementation defects back into
  the active native `/goal`; route contract defects to Plan/Finalize.
- Letting reviewers edit source, plans, contracts, state, or receipts.
- Treating model reviewer output as deterministic proof.
- Deleting completed package; plan 009.

## Git workflow

- Branch: `advisor/007-convergence-reconcile`
- Conventional commits, e.g. `feat(reconcile): add independent review axes`;
  use DCO signoff and `Co-authored-by: Codex <codex@openai.com>`.
- Do not push/open PR without operator instruction.

## Steps

### Step 1: Re-derive deterministic truth first

Implement `tailrocks goal reconcile <slug> --deterministic`. It must:

- validate current contract/package/oracle/resolution hashes;
- expire dead leases and reject abandoned claims;
- recompute candidates/effects from repository diff;
- rerun current required gates and verify receipts against the current
  repository subject tree and control generation;
- detect stale dependencies and overlapping/unauthorized effects;
- produce no model call and no implementation edit.

If this stage fails, stop before semantic reviewers and route structured errors.

**Verify**: tests cover stale receipt, moved HEAD, expired lease, changed oracle,
unauthorized path/effect, missing gate, and clean current package.

### Step 2: Make deterministic final reconcile unavoidable

Wire every provider Stop adapter from plan 006 so a nominally complete package
enters `FINAL_VERIFYING` and runs `tailrocks goal reconcile <slug> --final
--json` after the latest controller commit. Neither the agent nor the native
goal evaluator chooses whether this runs. The command first performs Step 1,
then the required review/integration axes below, and only it can create the
current PASS receipt.

Result mapping is exact:

- current full conjunction PASS: permit native `/goal` to stop;
- implementation gap with an existing plan: invalidate that plan receipt,
  return `CONTINUE` with the same plan ID, and keep native `/goal` active;
- contract/plan/research/human/external gap: return its typed terminal route and
  allow `/goal` to stop for operator action;
- verifier/tamper/environment/budget failure: return the exact terminal state;
- crash/interruption: leave FINAL_VERIFYING incomplete so resume reruns it
  idempotently.

The manual `tailrocks-reconcile` skill calls the same commands for diagnosis and
recovery. It is never required as a separate success step after a native goal.

**Verify**: hook integration tests prove premature native completion enters
FINAL_VERIFYING, a failed final gate reopens the exact plan, terminal upstream
routes stop, crash/resume reruns safely, and PASS cannot exist without this
latest-subject invocation.

### Step 3: Define independent reviewer contracts

Create strict read-only review schemas. For each completed plan and the whole
package, run independent fresh-context reviewers:

1. **Product Contract**: find missing/incorrect scenarios and integration gaps;
   judge “not less.”
2. **Scope**: map every changed file/hunk, dependency, API/schema/network/route/
   remote effect to a requirement or approved technical prerequisite; judge
   “not more.”
3. **Engineering Integrity**: apply relevant house Rust/Axum or
   TypeScript/React/TanStack/code-health contracts; correctness of architecture
   cannot be hidden by feature success.

Each reviewer receives frozen contract/spec, machine manifest/budgets, actual
diff and relevant files, deterministic gate results, and nothing from executor
self-summary. Output contains verdict, requirement/hunk references, finding IDs,
confidence, and route. Reviewers are read-only.

**Verify**: schema/unit tests reject findings without concrete contract/hunk
evidence and reject attempts to blend scores into one average.

### Step 4: Guarantee context independence

While the native `/goal` run remains the outer execution loop, dispatch at least
one fresh read-only reviewer context per axis per plan. Use provider-native
subagents when available. Otherwise the adapter may create a fresh reviewer
session as one bounded review action; it may not become a replacement execution
loop. Parallelize only when plans/effects do not overlap. Never reuse the
executor context as a reviewer. If neither isolation method exists, mark
semantic review BLOCKED; do not self-certify.

For high-risk or semantic-heavy work, allow multiple trials per axis and expose
disagreement. A majority cannot override a concrete failing finding; resolve the
finding or route to human.

Fresh sessions reduce shared context bias but do not prove statistical or model
independence: same-provider/model reviewers remain correlated. Record provider,
model, session, trial, and prompt/evidence hashes. A reviewer PASS is semantic
evidence at its declared trust level, never deterministic proof and never a
substitute for a required human approval.

**Verify**: mock adapters prove distinct session IDs/context payloads, parallel
eligibility, disagreement output, and blocked behavior without fresh context.

### Step 5: Add integration, UI, semantic, and human gates

Read verification kinds from the frozen contract:

- deterministic integration/e2e commands run through verifier;
- semantic rubrics run as separate read-only review with retained evidence;
- UI contracts require browser/screenshots or declared visual artifacts tied to
  scenario IDs;
- human criteria require explicit approval artifact and cannot be auto-passed;
- external criteria require current external evidence and owner.

Package-level review checks interactions across individually verified plans.

**Verify**: fixtures cover cross-plan failure, UI state omission, semantic
rubric disagreement, missing human approval, stale external evidence, and clean
integration.

### Step 6: Route each failure to its owning earlier stage

Use deterministic route codes:

- source/intent ambiguity or missing decision: Brainstorm/Record Decision/
  Finalize;
- missing/outdated fact: Research;
- empirical unknown: Prototype;
- contract/coverage/oracle defect: Finalize then Plan;
- plan scope/dependency defect: Plan;
- implementation defect covered by an existing plan:
  `CONTINUE(plan-id)` in the active native `/goal`;
- external blocker: BLOCKED with recheck trigger.

Reconcile writes no fixes. It derives TODO/STALE/BLOCKED projections through
the control plane. Existing-plan implementation gaps are fed directly back to
the active native goal. Upstream/human/external routes stop it and give the user
the exact next skill or action.

**Verify**: route table tests cover every diagnostic class and reject ambiguous
fallback such as “fix manually.”

### Step 7: Add append-only convergence evidence and state-derived routing

Store accepted reviewer/deterministic findings as append-only, stable-ID
convergence records. Each record contains gap type (`missing`, `partial`,
`contradicts`, `unrequested`), severity, requirement/effect/hunk evidence,
owner route, provider/trust metadata, and disposition (`open`, `fixed`,
`contract_changed`, `false_positive` with human reason, or `external_blocked`).
Never delete or rewrite earlier findings. A clean no-op Reconcile leaves the
ledger and generated GOAL byte-for-byte unchanged.

Implement pure `tailrocks goal next <slug> --json` over validated artifact
state. It returns:

- current lifecycle state and exact evidence causing it;
- one required next stage/skill and command under a versioned priority table;
- separately labeled independent routes that may run in parallel;
- `await_user` when a product decision/human approval is the only valid edge;
- no route when the item is cleanly retired.

The native `/goal` Stop adapter consumes this result automatically. The
manual-only Reconcile skill may render the same result for recovery, but no
second router skill or user-facing loop is added. Existing-plan implementation
findings invalidate the receipt and regenerate GOAL with that plan eligible. A
missing-plan or contract gap stops native execution and routes to Plan/Finalize;
Reconcile never tells the executor to improvise absent work.

**Verify**: route-table/property tests cover every lifecycle state, parallel
independent research, stale contract/package, open finding, human wait,
retirement, unknown state, and idempotent no-op. Eval cases prove the router
does not choose a convenient later stage over the control-plane result.

### Step 8: Rewrite skill and evals around convergence

Update Reconcile steps/final gate so current receipts and all required axes are
mandatory. Add cases where plan commands pass but omitted requirement, scope
creep, standards violation, or integration failure must reopen work. Preserve
verification-only boundaries.

Update Plan cold review to ensure every package declares which post-execution
axes and human/semantic checks Reconcile must run.

**Verify**: typed deterministic evals and retained model smoke prove passing
commands alone cannot produce trusted_done when another axis fails.

## Test plan

- Deterministic truth sync: all stale/tampered/dead-session states.
- Reviewer isolation: separate contexts, read-only, actual diff not summary.
- Product axis: omitted and wrong behavior.
- Scope axis: authorized/unmapped hunks and non-file effects.
- Engineering axis: correct feature with house-rule violation.
- Integration/visual/human/external gates.
- Disagreement: surfaced, no averaging/override.
- Convergence ledger: append-only IDs/dispositions and byte-identical clean run.
- Routing: every finding class to exact earlier stage.
- Goal router/native continuation: deterministic lifecycle table,
  primary-source pointers, automatic existing-plan continuation, parallel
  labels, human wait, and retired terminal result.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] Reconcile starts with deterministic current-state verification.
- [ ] Every nominal native `/goal` completion automatically runs final
      reconciliation after the latest controller commit; only its current PASS
      receipt permits the goal to stop successfully.
- [ ] Every completed plan/package receives independent Product, Scope, and
      Engineering review from fresh contexts.
- [ ] Required integration/semantic/visual/human/external checks are enforced.
- [ ] No axis can compensate for another; disagreement remains visible.
- [ ] Reconcile never implements fixes or writes DONE directly.
- [ ] Every failure has an owned backward route and structured evidence.
- [ ] `tailrocks goal next` derives the authoritative next transition from
      current artifacts; provider adapters and the manual Reconcile view cannot
      override it.
- [ ] Convergence findings are append-only, explicitly disposed, and a clean
      rerun changes no artifact/GOAL bytes.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Fresh independent reviewer contexts cannot be created for a required semantic
  axis: mark BLOCKED; never reuse executor context.
- Reviewer would need credentials or sensitive data not safely exposable.
- A semantic criterion has no stable rubric/evidence owner in the frozen
  contract: route to Finalize, not reviewer improvisation.
- Deterministic verifier fails; do not run model reviewers to seek a pass.
- A lifecycle state has multiple conflicting required routes under the priority
  table: fix the state model/table; do not let a model choose.

## Maintenance notes

Review axes should remain separate reports, not one score. Track recurring
findings and convert them into deterministic gates where possible. Reconcile is
the learning boundary: each verified defect should strengthen contract, oracle,
effect budget, or house rule so the same class becomes mechanically visible.
