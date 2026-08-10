# Plan 015: Capture every interaction before synthesis

> **Executor instructions**: Migrate the five interactive skills in one session.
> Use the plan-004 CLI as the sole canonical writer. Preserve each skill's
> one-question and write-ownership rules.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 001 and 004 have current same-branch
  completion receipts at one exact head
- **Effort**: M; one session
- **Risk**: MED
- **Depends on**: plans 001 and 004
- **Covers**: G01, G02
- **Guardrails**: N06, N10, N13
- **Research basis**: `advisor-plans/RESEARCH.md` F4-05, F4-07, F4-14
- **Planned at**: design baseline `1e809bd`; fan-in recut required

## Why this matters

The source store matters only if answers are appended before a model rewrites
them. This slice changes Idea, Brainstorm, Research, Record Decision, and
Finalize together because their shared invariant is event ordering, while
leaving READY authority for the next one-session slice.

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
rtk git merge-base --is-ancestor <plan-001-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-004-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- skills/tailrocks-idea skills/tailrocks-brainstorm skills/tailrocks-research skills/tailrocks-record-decision skills/tailrocks-finalize examples/plan-package docs/pipeline-walkthrough.md
rtk cargo test -p tailrocks-core source_store
rtk bun test scripts/
rtk mise run validate
```

Expected: full SHAs replaced at recut; one current shared head contains
both dependencies; scoped diff empty; source/eval/15-skill gates pass.

## Spec contract

### Requirement G01/G02: append before synthesis; facts stay informative

Each user answer, correction, attachment, or decision SHALL be sensitivity-
classified and durably appended before synthesis. Research facts SHALL remain
informative until Record Decision adopts them. Without a verified CLI, skills
SHALL keep functional `advisory_prose` flow but create no canonical artifact.

#### Scenario: interrupted answer

- **WHEN** the session ends after append and before synthesis
- **THEN** resume reads the durable source and does not ask the user to recreate it.

#### Scenario: absent binary

- **WHEN** verified `tailrocks source` is unavailable
- **THEN** use current mutable prose behavior, label it advisory, and emit zero
  records/blobs/index/READY files.

## Must NOT

- **N06**: never pass secret values through CLI args, evidence, or fixtures.
- **N10**: skills cannot emulate canonical JSON/source writers.
- **N13**: source identity does not prove correct synthesis or completeness.

## Inputs to provide

None. Existing interactive answers drive fixtures; no live user interview is
required to implement this protocol.

## Starting state

- Plan 004 supplies `source append/rebuild/check`.
- Plan 001 supplies artifact-grounded replay with staged workspaces/evidence.
- The five skills have distinct write scopes and Brainstorm asks one question at
  a time; preserve both.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Capture replay | `rtk bun scripts/run-evals.ts --case capture-initial-source --runs 1 --driver replay --results /tmp/tailrocks-capture` | exit 0 |
| Resume replay | `rtk bun scripts/run-evals.ts --case capture-correction-resume --runs 1 --driver replay --results /tmp/tailrocks-capture-resume` | exit 0 |
| Scripts | `rtk bun test scripts/` | exit 0 |
| Skills | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `skills/tailrocks-idea/**`, `skills/tailrocks-brainstorm/**`
- `skills/tailrocks-research/**`, `skills/tailrocks-record-decision/**`
- `skills/tailrocks-finalize/**` capture behavior only
- `examples/plan-package/**` source/projection fixtures
- `docs/pipeline-walkthrough.md` capture boundary only

**Out of scope**:

- Rust/schema changes, READY compilation/approval, prototype/runtime/provider.
- Changing one-question interviews or any skill's artifact ownership.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(delivery): capture interactions before synthesis`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Preflight one canonical writer

With verified CLI, classify then append every input before analysis. With absent
or unverified CLI, retain existing prose behavior labeled `advisory_prose` and
emit no canonical source/index/READY file.

**Verify**: initial-source and no-binary replay cases prove event order and zero
fallback canonical artifacts.

### Step 2: Preserve fidelity, corrections, and interruption recovery

Capture each Brainstorm answer before reasoning; corrections supersede rather
than edit; reference-only attachments remain references. Resume from committed
sources. Keep original voice bytes distinct from model projection.

**Verify**: Resume replay proves append precedes synthesis, old bytes remain,
projection changes, and interruption loses no accepted answer.

### Step 3: Separate research facts from decisions

Research appends URL/path, retrieval time, freshness, and quoted/derived
boundary as `informative`. Record Decision alone creates anchored adoption,
reversal, or deferral. Finalize may summarize but cannot silently adopt.

**Verify**: artifact cases `research-remains-informative` and
`decision-supersedence` exit 0.

### Step 4: Migrate the worked interaction

Include voice text, correction, attachment reference, research fact, adoption,
interruption, and absent-binary branches; rebuild and check projections.

**Verify**:

```sh
rtk cargo run -p tailrocks-cli -- source rebuild examples/plan-package/roadmap/goal-live-status
rtk cargo run -p tailrocks-cli -- source check examples/plan-package/roadmap/goal-live-status
rtk bun test scripts/
rtk mise run validate
rtk git diff --check
```

Expected: all exit 0 and the rebuilt projection is clean.

## Test plan

- One-question order, correction/reversal, interruption/resume.
- Text, image/blob, voice wording, and reference-only attachment.
- Informative research before/after explicit adoption.
- Secret refusal with no value/digest; absent binary with zero canonical files.

## Done criteria

- [ ] Recut records both dependency SHAs and one shared-branch fan-in SHA.
- [ ] Every interaction appends before synthesis and survives interruption.
- [ ] Every derived normative line cites a source/decision.
- [ ] Research remains informative until explicit adoption.
- [ ] No fallback canonical writer exists; all commands/scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop if capture exposes secrets, synthesis must precede append, fidelity cannot
be represented honestly, Research becomes normative, fallback needs JSON
emulation, write ownership changes, fan-in is incomplete, or work exceeds one
session.

## Maintenance notes

Plan 016 consumes these records and is the sole READY compiler/approval owner.
