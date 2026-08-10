# Plan 016: Seal one complete approved READY contract

> **Executor instructions**: Finish source-to-READY compilation and approval in
> one session. Screens, flows, states, mockups, and quality bars are typed or
> explicitly sourced N/A; prose cannot silently omit them.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 015 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 015
- **Covers**: G02, G04
- **Guardrails**: N06, N09, N10, N13
- **Research basis**: `advisor-plans/RESEARCH.md` F4-05, F4-07, F4-14
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

READY is the last intent authority before implementation. A digest cannot prove
that missing screens, recovery flows, or quality bars were considered. This
slice makes every readiness class typed, source-anchored, and explicitly
approved while retaining Finalize as the only READY-granting workflow.

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
rtk git merge-base --is-ancestor <plan-015-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- Cargo.toml Cargo.lock crates/tailrocks-core/src/ready_contract crates/tailrocks-cli/src schemas/ready-intent.schema.json skills/tailrocks-finalize skills/tailrocks-plan/references/coverage-ledger.md examples/plan-package docs/pipeline-walkthrough.md
rtk cargo run -p tailrocks-cli -- source check examples/plan-package/roadmap/goal-live-status
rtk bun test scripts/
rtk mise run validate
```

Expected: exact integration/ancestry and scoped-drift checks pass; source graph,
artifact tests, and 15-skill validation are green.

## Spec contract

### Requirement G02/G04: complete source-anchored READY authority

`ready.intent.json` SHALL be the sole READY authority. Every normative field
SHALL cite primary source/decision IDs. Every required flow/screen/state/mockup/
quality/verification class SHALL be populated or carry sourced `not_applicable`
or `deferred` status and reason. Approval SHALL bind exact bytes and remain
unavailable to the later executor capability.

#### Scenario: non-UI work

- **WHEN** no screen/mockup applies
- **THEN** explicit sourced N/A entries satisfy those fields; silent absence fails.

#### Scenario: UI error state omitted

- **WHEN** a UI contract lacks required error/recovery state or confirmed
  schematic reference
- **THEN** compile remains SHAPING and cannot request READY approval.

## Must NOT

- **N06**: sensitive mockup/input bytes stay external behind approved references.
- **N09**: compiler cannot parse README prose into authority.
- **N10**: absent-CLI Finalize cannot manually emit READY JSON.
- **N13**: digest proves identity; checklist plus explicit approval owns completeness.

## Inputs to provide

- Explicit declared user/operator approval of the exact compiled digest. Without
  it, retain SHAPING.
- Sourced N/A/deferral decisions for genuinely inapplicable readiness classes.

## Starting state

- Plan 015 makes sources, research adoption, and decisions durable before
  synthesis.
- Finalize alone grants READY; preserve that ownership.
- Plan skill already expects stable S/F/W/N/B and decision/research/assumption
  anchors, but no typed stage authority exists.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Schema | `rtk cargo test -p tailrocks-core ready_contract::schema` | exit 0 |
| Compile | `rtk cargo test -p tailrocks-core ready_contract::compile` | exit 0 |
| Approval | `rtk cargo test -p tailrocks-core ready_contract::approval` | exit 0 |
| Worked intent | `rtk cargo run -p tailrocks-cli -- ready verify examples/plan-package/roadmap/goal-live-status --require READY` | exit 0 |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `Cargo.toml`, `Cargo.lock` only for READY implementation dependencies
- `crates/tailrocks-core/src/ready_contract/**`
- `crates/tailrocks-cli/src/**` only `ready compile/approve/verify`
- `schemas/ready-intent.schema.json`
- `skills/tailrocks-finalize/**`
- `skills/tailrocks-plan/references/coverage-ledger.md`
- `examples/plan-package/**` READY fixture
- `docs/pipeline-walkthrough.md` READY boundary

**Out of scope**:

- Package/runtime compilation, prototype execution, provider behavior.
- A second READY/lock file, cryptographic user identity, or Markdown authority.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(delivery): seal approved READY intent`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Define the complete typed schema

Include item/source-set digest, requirements/exclusions, primary/alternate/error/
recovery flows; screens linked to flows; default/loading/empty/error/success and
domain states; confirmed schematic/mockup references; accessibility,
performance, security, usability, and domain quality bars; assumptions,
research, empirical uncertainties, verification seams, external-effect owners,
schema and approval state. Every class uses populated or sourced N/A/deferred.

**Verify**: Schema rejects missing class, source, flow/screen link, state,
mockup confirmation, quality bar, exclusion, seam, or unsourced N/A.

### Step 2: Compile deterministically from typed sources

Research stays informative unless a decision adopts it. Missing empirical route,
external owner, primary anchor, confirmed mockup, required state, or quality bar
blocks READY. Sensitive references remain external. Same input recompiles to
identical bytes.

**Verify**: Compile tests cover complete UI, non-UI sourced N/A, missing error/
recovery, unconfirmed mockup, unadopted fact, empirical route, and stable bytes.

### Step 3: Separate approval and invalidate on change

Only declared user/operator approval of exact compiled digest grants READY.
Executor/broker capability cannot approve. Any superseding normative source,
flow, screen, state, mockup, quality bar, exclusion, or seam makes approval stale.

**Verify**: Approval tests cover forged executor, wrong digest, correction,
screen/mockup drift, reapproval, and idempotency.

### Step 4: Integrate Finalize and the worked example

Finalize compiles, presents digest plus coverage summary, asks approval, then
verifies READY. Missing binary remains advisory SHAPING and emits no READY file.

**Verify**:

```sh
rtk cargo run -p tailrocks-cli -- ready compile examples/plan-package/roadmap/goal-live-status --check
rtk cargo run -p tailrocks-cli -- ready verify examples/plan-package/roadmap/goal-live-status --require READY
rtk cargo test --workspace --all-features
rtk bun test scripts/
rtk mise run validate
rtk git diff --check
```

Expected: all exit 0; clean recompilation changes no bytes.

## Test plan

- Complete UI and non-UI sourced-N/A contracts.
- Missing flow/state/mockup/quality class and unsafe sensitive mockup.
- Research adoption, empirical route, external owner, exact primary anchors.
- Forged/stale approval and deterministic compile/projection mutation.
- Absent-binary noncanonical fallback.

## Done criteria

- [ ] Recut records plan-015 checkpoint, frozen base, and shared-head SHAs.
- [ ] One `ready.intent.json` owns READY; every class populated or sourced N/A.
- [ ] Every normative field is anchored and exact-digest approved.
- [ ] Executor cannot approve; every relevant change stales READY.
- [ ] Commands/diff/scope checks and one signed/co-authored commit pass.

## STOP conditions

Stop on missing primary anchor, ambiguous screen/flow/state ownership, unsafe
mockup storage, unsourced N/A/deferral, unresolved empirical route, unowned
external effect, absent approval, Markdown authority, fallback writer, stale
dependency, or work exceeding one session.

## Maintenance notes

Plan 005 adds the empirical route. Plan 006 consumes only the verified READY
digest and stable IDs; it cannot copy competing normative text.
