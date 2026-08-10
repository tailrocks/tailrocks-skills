# Plan 006: Compile one authoritative package contract

> **Executor instructions**: Finish this READY-to-sealed-package slice in one
> session. Extend the proven kernel without adding another authority. Generate
> every readable plan artifact from one typed draft; do not execute multi-slice
> goals here.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 000 and 016 have current same-branch
  completion receipts at one exact head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plans 000 and 016
- **Covers**: G05, G15
- **Guardrails**: N01, N03-N10, N12-N14, N16, N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-07-F4-10,
  F4-14-F4-16, F4-19, F4-25
- **Planned at**: design baseline `1e809bd`; dependency fan-in must be recut

## Why this matters

The tracer accepts one fixed contract. Real planning needs complete
traceability, one-session vertical slices, protected oracle ownership, exact
tool/effect resolution, and readable zero-context handoffs. Rust can validate
structure, not semantic truth. This slice authors one typed draft, requires a
subject-bound semantic attestation, seals `goal.contract.json`, and generates
all Markdown projections.

## Preconditions — run before anything else

After recutting at one shared-branch head descended from both dependency
checkpoints, run:

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
rtk git merge-base --is-ancestor <plan-000-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-016-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- Cargo.toml Cargo.lock crates/tailrocks-core/src/package crates/tailrocks-cli/src schemas/goal-contract.schema.json skills/tailrocks-plan examples/plan-package docs/deterministic-goal-contract.md
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS
rtk cargo run -p tailrocks-cli -- ready verify examples/plan-package/roadmap/goal-live-status --require READY
rtk cargo test --workspace --all-features
rtk mise run validate
```

Expected: recorded integration/dependency commits match; tracer PASS; worked
intent READY; Rust tests and 15-skill validation pass. Any stale dependency
tip or unexplained in-scope drift blocks recut.

## Spec contract

### Requirement G05/G15: typed, complete, one-session package

The planner SHALL author one versioned typed draft. A semantic reviewer SHALL
attest the exact draft digest. `seal` SHALL verify structure, oracle/tool/effect
ownership, and the attestation before emitting one `goal.contract.json` plus
generated README/coverage/spec/plan/GOAL projections. Runtime SHALL never parse
free-form Markdown into authority.

#### Scenario: structural validity without semantic proof

- **WHEN** coverage/DAG fields are valid but semantic attestation is missing or
  fails verticality/completeness
- **THEN** draft remains `AWAITING_ATTESTATION`; no executable contract exists.

#### Scenario: projection edit

- **WHEN** any generated Markdown differs from contract-derived bytes
- **THEN** `plan check` returns `PROJECTION_DRIFT`.

## Must NOT

- **N01**: generated status/model confidence cannot seal the contract.
- **N03-N05**: mutable prose cannot select privileged argv; candidate gates bind
  the proven OCI profile and never run on controller host.
- **N06/N07**: no secrets; branch-built verifier remains non-protected.
- **N08**: historical progress is not contract evidence.
- **N09**: Markdown is output only, never canonical parser input.
- **N10**: absent-CLI skills cannot emulate typed writers.
- **N12-N14**: provider state cannot fork authority; hash claims stay narrow;
  no shared writable candidate cache.
- **N16**: contract caps bound every candidate path/input/output/evidence and
  overflow fails closed.
- **N18**: no repeatable pass/fail channel may be called confidential oracle
  isolation.

## Inputs to provide

- **Full fan-in record** — completion checkpoints for plans 000/016, the frozen
  attempt base, and one current shared head descended from both.
- **Semantic plan attestation** — one closed result over product, scope, and
  engineering axes for the canonical draft digest with concrete requirement/
  plan IDs. The contract declares issuer/trust policy; no universal reviewer
  count is implied.
- **Protected oracle adoption** — operator or independent planner adopts exact
  deterministic expected bytes/behavior before executor work. Executor-created
  tests remain candidate evidence until independently adopted.

## Starting state

- Plans 004/015/016 provide sensitivity-cleared source records, interactive
  capture, and `ready.intent.json`. Their transitive plan-003 dependency provides
  contract/journal/candidate/OCI primitives.
- Plan 000 defines the only allowed absent-binary legacy behavior.
- Existing Plan skill requires acyclic vertical one-session plans but has no
  typed compiler.
- V1 is serial and repository-only. Non-overlapping paths do not prove semantic
  independence.

Target generated package:

```text
plans/{slug}/
  README.md
  coverage.md
  spec/
  001-*.md
  GOAL.md
  goal.contract.json
```

The braces denote a schema field resolved by the author command, not an
executor choice. The typed draft exists only in a controller temp directory;
after sealing, a checked-in draft or hand-edited projection is invalid.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Compiler | `rtk cargo test -p tailrocks-core package_compiler` | exit 0 |
| Contract | `rtk cargo run -p tailrocks-cli -- plan check examples/plan-package/plans/goal-live-status` | exit 0, `SEALED` |
| Format | `rtk cargo fmt --all --check` | exit 0 |
| Lint | `rtk cargo clippy --workspace --all-targets --all-features -- -D warnings` | exit 0 |
| Rust | `rtk cargo test --workspace --all-features` | exit 0 |
| Scripts | `rtk bun test scripts/` | exit 0 |
| Skills | `rtk mise run validate` | exit 0 |

## Suggested executor toolkit

Invoke `tailrocks-rust-best-practices` for compiler APIs and
`tailrocks-code-health` for monotonic gates. Follow current Plan skill coverage
and plan templates.

## Scope

**In scope**:

- `crates/tailrocks-core/src/package/**` (new)
- `crates/tailrocks-cli/src/**` for `plan author/seal/check`
- `schemas/goal-contract.schema.json` compatible extension or explicit version
- `skills/tailrocks-plan/**`
- `examples/plan-package/plans/goal-live-status/**`
- `docs/deterministic-goal-contract.md` (new compiler/authority section)

**Out of scope**:

- Multi-slice execution and native progression (plan 012).
- Semantic reviewer orchestration/backtracking (plan 007).
- Apply/retirement (plans 013/014), CI/distribution/providers.
- External effects, secrets, network, deployments, parallel integration.
- Separate canonical manifest/coverage/effect/resolution/oracle lock files.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): compile executable package contracts`
- One green `rtk git commit -s` commit with Codex co-author trailer.
- Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Author, attest, and seal one typed draft

Add `tailrocks plan author --intent` with typed JSON from stdin. It writes a
canonical `GoalDraftV1` only to controller temp and prints its digest. Fields
include READY requirement IDs, slices, dependencies, full executor instructions,
allowed paths, fixed precondition/done argv arrays,
evidence seams, technical prerequisites, budgets, and accepted trust modes.
Normative requirement text, anchors, exclusions, flows, and screen contracts are
copied only into generated projections directly from digest-verified
`ready.intent.json`; the draft cannot supply a second version. Same-ID/different-
text input is rejected.

Reject missing/extra requirement mappings, orphan machinery, unknown
dependencies, cycles, ambiguous ordering without stored tie-break, rejected
coverage, missing observable outcome/session bound, or unstated assumption
route. Rust validates declarations and graph shape only. A fresh semantic
attestation over the exact draft digest owns verticality, completeness, and
zero-context quality.

`tailrocks plan seal` verifies that attestation, produces deterministic
`goal.contract.json` binding READY/draft/attestation digests, generates every
readable projection, and deletes the temp draft. Generated status comes from
journal state and is never compiler input.

**Verify**: `rtk cargo test -p tailrocks-core package_compiler::coverage` exits
0 for valid linear/diamond cases and rejects missing/extra mapping, cycle,
ambiguous order, orphan prerequisite, invalid session bound, projection edit,
and missing/failing semantic attestation.

### Step 2: Bind gates, effects, dependencies, and oracles

Normalize allowed/protected paths and reject traversal/overlap. V1's executor
effect is repository mutation in its disposable clone. Every candidate gate
stores fixed argv/cwd/timeout/expected exit, exact plan-002/003 verifier
image/profile, read-only dependency mounts, and fresh per-candidate overlay.
Protected expected values remain in an outside trusted comparator; candidate
workers receive only inputs and return bounded outputs. Reject network,
secret/environment reads, external roots, side-effecting tools, arbitrary
IPC/database/deploy/device/remote-ref effects. The run broker is transport, not a
candidate-gate effect. Unsupported effects become named human/external gates,
never unenforced budgets.

The controller provisions immutable dependency sources keyed to exact lockfile
digests before executor/verifier sessions. Registry warming is a labeled
controller effect. Candidate build output is disposable; no writable byte is
reused across candidates.

Protected oracle adoption records issuer/trust/input/digest. Require a seeded
negative perturbation the gate must reject and repeated frozen-base agreement,
recorded only as `observed_stable`. Vacuous/unstable/executor-owned expectations
cannot seal. Every V1 black-box comparator is `integrity_only`: expected bytes
remain unmounted, a cumulative contract `max_queries` bounds pass/fail leakage,
and no confidentiality claim is allowed. A requirement needing confidential
expected data becomes a named unsupported human/external gate and prevents
autonomous PASS.

Reject any hidden/confidential/secret oracle class, unbounded or per-generation-
reset query channel, or stronger trust label. Only evaluators deterministic by construction may use the
`deterministic` class; empirical gates declare a final trial policy and any
failed trial blocks. Bind lockfiles,
toolchain/config, controlled skill/prompt/plan bytes, gate scripts, oracle,
verifier profile, and attestation policy. Ambient provider/system/tool context
remains explicitly unbound. Contract caps bound path length, file count,
workspace bytes, stdout/stderr bytes, evidence count/bytes, and ingestion time;
overflow kills/fails the worker and never becomes a passing truncation.

**Verify**: `rtk cargo test -p tailrocks-core package_compiler::freeze` exits 0;
path/effect escape, missing dependency, outside-OCI gate, cache poison, vacuous
oracle, unstable gate, confidential-oracle claim, missing/cumulative query cap,
wrong deterministic classification, failed empirical
trial, output/ingestion overflow, forged owner, lock/tool/payload drift, and
overbroad hash claims fail.

### Step 3: Make Tailrocks Plan emit the sealed package end to end

Update procedure, references, template, evals, and worked package. Plan authors
the typed draft, cold-reviews generated projections, changes the draft rather
than projections, obtains oracle adoption and semantic attestation, then seals.
Every dependent handoff declares observable preconditions and semantic edges.

Without a verified binary, preserve plan-000 `advisory_prose` behavior but emit
no source record, READY/runtime contract, or journal state. Do not add a manual
typed-format writer.

**Verify**:

```sh
rtk mise run validate
rtk bun test scripts/
rtk cargo run -p tailrocks-cli -- plan check examples/plan-package/plans/goal-live-status
```

Expected: all exit 0 and direct generated-plan edit returns
`PROJECTION_DRIFT`.

## Test plan

- Bidirectional coverage, acyclic order, one-session bounds, prerequisites.
- Structural vs semantic attestation separation.
- Default-deny effects and immutable dependency resolution.
- Independent oracle ownership, sensitivity, stability, controlled-byte digest.
- Integrity-only cumulative query budgets and confidential-oracle rejection.
- Absent-binary flow emits no canonical artifact.
- Worked package generation and projection drift.

## Done criteria

- [ ] Recut records both completion checkpoints, frozen base, and shared head.
- [ ] Exactly one `goal.contract.json` is runtime authority.
- [ ] Coverage is bidirectional; every plan is vertical and one-session-attested.
- [ ] Candidate gates bind proven OCI and V1 rejects autonomous external effects.
- [ ] Oracle/dependency/tool/payload bytes are frozen; ambient context is unbound.
- [ ] No adaptive channel claims confidentiality; confidential-oracle
  requirements remain unsupported external gates.
- [ ] Plan skill generates the checked worked package; no fallback writer exists.
- [ ] All Commands, `rtk git diff --check`, and scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop if fan-in has no single same-branch integration head, compiler truth needs
duplicate lock files, Markdown must be parsed, semantic or oracle ownership is
missing, a candidate gate must run outside OCI, dependencies need agent egress,
generated projection can drift silently, or work cannot finish as one vertical
session.

## Maintenance notes

Plan 012 is the only consumer allowed to generalize this contract into serial
multi-slice runtime. Schema changes require compatibility tests and recut.
