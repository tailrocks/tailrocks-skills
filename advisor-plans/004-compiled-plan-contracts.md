# Plan 004: Compile plan packages with coverage, effect, and oracle contracts

> **Executor instructions**: Replace prose-only package authority with compiled
> machine artifacts while retaining concise Markdown explanations. Do not add
> execution/state ownership here; plan 005 owns that. Run all gates and stop on
> any contract ambiguity.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — changes `tailrocks-plan` output and GOAL handoff contract
- **Depends on**:
  `advisor-plans/002-rust-control-plane-foundation.md`,
  `advisor-plans/003-intent-provenance-and-ready-contract.md`
- **Category**: correctness / architecture
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Current planning quality is strong, but coverage, dependency order, scope,
assumptions, commands, and Must-NOT enforcement are agent-checked prose. No
executable oracle proves “not less” or “not more.” This plan turns a frozen
READY contract into a validated package DAG with exact requirement/gate links,
authorized effects, protected acceptance oracles, and reproducible tool
resolution.

## Current state

- `skills/tailrocks-plan/SKILL.md:48-55` creates a Markdown coverage ledger and
  relies on the agent to account for every statement.
- `skills/tailrocks-plan/SKILL.md:69-71` permits a named assumption when research
  cannot close a gap.
- `skills/tailrocks-plan/SKILL.md:83-99` already requires vertical tracer-bullet
  slices and an acyclic manifest, but writes that manifest into README.
- `skills/tailrocks-plan/SKILL.md:114-120` performs cold review and a prose
  traceability gate.
- `skills/tailrocks-plan/references/plan-template.md:141-149` declares file scope
  in prose; `:183-203` asks the executor to self-check scope and assumptions.
- `skills/tailrocks-plan/references/goal-handoff.md:111-134` defines completion
  as Markdown statuses plus at most two repository commands.
- `AGENTS.md:20-21` says “latest stable ... at execution time,” which is policy,
  not a frozen resolution reproducible across planning/execution dates.

## Research basis

- [Matt Pocock `to-tickets`](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)
  requires independently verifiable tracer-bullet slices.
- [OpenSpec reviewing changes](https://openspec.dev/docs/reviewing-changes)
  separates completeness, correctness, coherence, and explicit “nothing extra”
  review. This plan makes those links machine-checkable.
- [Spec Kit requirements checklist](https://github.com/github/spec-kit/blob/main/templates/commands/checklist.md)
  treats requirement completeness/clarity as a separate pre-implementation
  contract; plan 003 supplies that gate before this compiler runs.

## Target package shape

```text
plans/<slug>/
  goal.contract.json        # canonical execution envelope and artifact hashes
  README.md                 # generated human projection; never canonical state
  manifest.json             # plan DAG, scopes, dependencies, hashes
  coverage.json             # source/requirement/gate/plan graph
  resolution.lock.json      # exact tools/dependencies resolved at planning time
  oracles.lock.json         # protected pre-execution acceptance-oracle hashes
  spec/                     # readable requirements, generated IDs embedded
  NNN-*.md                  # zero-context execution explanation
  GOAL.md                   # thin generated native-/goal handoff; never authority
```

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full baseline | `mise run verify` | all gates pass |
| Compile package | `cargo run -p tailrocks-cli -- compile package goal-live-status --root examples/plan-package --json` | package hashes and `valid: true` |
| Check package | `cargo run -p tailrocks-cli -- check package examples/plan-package/plans/goal-live-status --json` | zero diagnostics |
| Check goal contract | `cargo run -p tailrocks-cli -- check goal-contract examples/plan-package/plans/goal-live-status/goal.contract.json --json` | valid envelope; every referenced digest current |
| Generated-file check | `cargo run -p tailrocks-cli -- generate package goal-live-status --root examples/plan-package --check` | exit 0; no generated drift |

## Scope

**In scope**:

- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**`
- `schemas/v1/**` package, goal-contract, coverage, effect, resolution, oracle,
  environment, and budget schemas
- `skills/tailrocks-plan/SKILL.md`
- all `skills/tailrocks-plan/references/*.md`
- `skills/tailrocks-plan/evals/**`
- `skills/tailrocks-record-decision/SKILL.md` stale-hash propagation only
- `examples/plan-package/plans/goal-live-status/**`
- `examples/plan-package/roadmap/goal-live-status/**` Plan link/hash metadata
- `docs/pipeline-walkthrough.md` planning/handoff sections only

**Out of scope**:

- Executor claims, leases, receipts, or DONE; plan 005.
- Provider-specific hooks/goal syntax; plan 006.
- Post-execution semantic review; plan 007.
- Deleting completed packages; plan 009.

## Git workflow

- Branch: `advisor/004-compiled-plan-contracts`
- Conventional commits, e.g. `feat(plan): compile bounded packages`; use
  `git commit -s` plus `Co-authored-by: Codex <codex@openai.com>`.
- Do not push/open PR without operator instruction.

## Steps

### Step 1: Define the bidirectional coverage graph

Compile `coverage.json` from `contract.lock.json`, specs, plans, and gates. It
must encode:

```text
source IDs -> requirement/Must-NOT IDs -> gate IDs -> plan IDs
```

Enforce:

- no normative source without a current requirement/Must-NOT/explicit deferral;
- no requirement without at least one verifier and implementing plan;
- no verifier without requirement/Must-NOT links;
- no plan without covered requirements, except a declared technical
  prerequisite whose downstream consumers and necessity are explicit;
- no dropped/rejected plan while its requirements remain uncovered;
- requirement IDs and source anchors stable across no-op replanning.

`coverage.md` becomes a generated optional view or is removed after the example
migration; it cannot remain independently editable.

**Verify**: contract tests fail on underdelivery, orphan gate, orphan plan,
silent deferral, duplicate/stale ID, and a required row marked rejected.

### Step 2: Compile a strict plan DAG

`manifest.json` owns plan identity, title, dependencies, priority, expected
session size, covered IDs, plan file hash, precondition gate IDs, effect budget,
and starting repository commit/subject-tree provenance. Validate acyclicity and
require vertical slices:
every feature plan must end in an observable gate at its agreed verification
seam. Layer-only work is allowed only as an explicit prerequisite consumed by a
named later slice.

Plan Markdown remains zero-context and inlines requirement/scenario/guardrail
text, but metadata and status tables are generated from the manifest rather
than hand-maintained.

**Verify**: tests reject cycles, missing dependency proof, unconsumed
prerequisites, slices without observable gates, and Markdown/hash mismatch.

### Step 3: Add separate effect budgets for “not more”

Every plan must declare applicable budgets:

- filesystem write paths;
- dependency/lockfile changes;
- public API additions/removals;
- database/schema/migration changes;
- network domains and external services;
- UI routes/navigation;
- configuration/feature flags;
- remote writes such as push/PR/deploy/issue;
- performance/resource limits.

Default-deny unspecified categories. Each allowed effect needs a requirement ID
or a `technical_prerequisite` justification and consumer. Path rules are
repository-relative and symlink-safe. Parallel eligibility requires no DAG edge,
no overlapping write set, and no overlapping external effect.

Every budget entry also declares `observation` and `enforcement`:

- `sandbox_prevented`: the runner prevents the effect;
- `deterministic_postcondition`: a trusted diff/analyzer/proxy proves it;
- `external_attestation`: a named external owner returns current evidence;
- `human_approval`: an operator must inspect/authorize it;
- `unobservable`: compilation fails for autonomous execution.

Filesystem diffs alone cannot prove absence of network, database, deployment,
or other remote effects. Remote/irreversible effects additionally require an
explicit operator boundary and an idempotency/rollback contract where the
system supports one. A declared but unenforced budget is documentation, not
containment, and cannot authorize autonomous work.

Compile exact `protected_paths` for contract/package files, acceptance oracles,
gate definitions and wrappers, provider hook definitions, controller source or
launcher files present in the target repository, and any fixture/state path
that can influence acceptance. Protected patterns are narrow, versioned,
symlink-safe, and cannot overlap allowed writes. Test changes are allowed only
when the frozen contract explicitly classifies them as implementation tests;
acceptance-oracle and gate-wrapper changes always require a new control
generation.

**Verify**: fixtures demonstrate rejected unlisted file, dependency, public API,
schema, network, route, config, and remote-write effects; an unobservable effect
disables autonomous execution; missing operator/idempotency policy rejects a
remote effect; overlap prevents parallel scheduling.

### Step 4: Freeze acceptance oracles before execution

Freeze an oracle specification for every gate before implementation: observable
seam, inputs/fixtures, expected result, failure signal, requirement links, and
oracle owner. Existing executable contract tests can be hashed immediately.
When the agreed seam/test harness does not yet exist, compile a separate
`oracle_materialization` prerequisite plan. It may create only the named seam
and acceptance test, must demonstrate the intended red/failing baseline or
equivalent mutation sensitivity, and must pass independent oracle review before
implementation plans become eligible.

`oracles.lock.json` records the specification and, once materialized, every
executable test/gate file hash. The control plane anchors the approved digest in
an operator/CI-owned trust store introduced by plan 005; a copy inside the
agent-writable worktree is only a projection. An executor may add implementation
tests but cannot edit protected acceptance oracles or update their anchor. Any
oracle correction is a STOP routed to Finalize/Plan, producing a new contract/
oracle generation and invalidating receipts.

Require bidirectional oracle alignment: every gate links requirements and every
deterministic requirement links gates. Add mutation-style contract fixtures
proving important forbidden behavior fails its oracle. Do not claim semantic or
human checks are protected deterministic tests; their rubric/approval artifact
hash is protected instead.

**Verify**: package check fails when an oracle changes after anchoring, when a
gate has no contract ID, when a deterministic requirement has no gate, when a
new oracle never demonstrated a failing baseline/mutation, or when an
implementation plan becomes eligible before oracle materialization is approved.

### Step 5: Freeze exact execution resolution

Separate latest-stable policy from execution resolution. During planning,
resolve and record exact versions/provenance for relevant compiler, runtime,
CLI, dependencies, lockfiles, templates, and container image. Hash the result in
`resolution.lock.json`. Execution uses it unchanged; re-resolution is an
explicit plan rerun that invalidates affected artifacts.

Record `resolved_at` and source. Do not let “latest” float during a goal loop.
At claim/execution start, query the authoritative latest-stable source again.
If any house-stack latest stable differs from the lock, mark the package stale
and rerun Plan/resolution before source mutation. Once that freshness preflight
passes, the exact resolution stays frozen for the bounded execution loop.

**Verify**: changing resolved version/provenance changes package hash and marks
dependent plans stale; an execution-start freshness mismatch fails closed; a
successful preflight does not allow versions to float inside the goal loop.

### Step 6: Build content-addressed selective invalidation

Record exact input hashes for every derived node:

```text
source/research fact/decision -> intent contract -> spec/coverage/manifest ->
plan/gate/oracle/resolution -> candidate/receipt
```

Implement reverse dependency lookup. A normative source, decision, research
fact, gate, oracle, resolved version, or relevant repository starting-state
change invalidates only descendants that consume it. Non-normative copy edits
must invalidate nothing. Record Decision and Research call this graph instead
of scanning prose for possibly affected rows. Reconcile reports the exact
changed input/hash path that made each descendant stale.

**Verify**: graph tests cover selective decision/fact/requirement/version/gate
changes, transitive invalidation, unrelated copy edits, and no-op regeneration.

### Step 7: Tighten assumption policy in package compilation

Remove product-level `A#` creation from Plan. Permit only
`implementation_discretion`/behavior-invariant technical assumptions already
classified under plan 003, each with falsifier and proof that either outcome
preserves contract and effect budgets. Anything else routes to Research,
Prototype, Record Decision, or Finalize before compilation.

**Verify**: planning evals reject a product decision or observable behavior as
an assumption and accept a falsifiable implementation-only assumption.

### Step 8: Compile `goal.contract.json` and a thin native-GOAL handoff

Compile one canonical, strict `goal.contract.json` as the runtime envelope. It
does not duplicate editable truth: every field is generated from the intent
lock, manifest, coverage, effects, oracle lock, and resolution lock, and every
referenced artifact has a JCS/SHA-256 digest. At minimum it contains:

- schema/control-protocol version, slug, control generation, planned base
  commit, and base subject-tree digest;
- exact artifact digests and the frozen protected-path/excluded-control-path
  sets;
- ordered plan IDs, dependencies, allowed writes/effects, preconditions, and
  plan verification gate IDs;
- package final-verification gate IDs and required convergence/human/external
  axes;
- structured gate commands as `argv` arrays plus cwd, allowlisted environment,
  expected exit, timeout, and output limit—never shell strings;
- durable bounds for slices, attempts per plan, verifier cycles, provider turns
  or tool events when observable, wall time, and output bytes;
- exact environment requirements: OS/architecture, toolchain and client ranges,
  lockfile hashes, container image digest where used, locale/timezone, random
  seeds, and network policy.

Reject a contract whose required budget cannot be observed by the selected
native-goal adapter; classify that package/provider combination unsupported
instead of pretending a prompt counter is durable. A contract modification
creates a new control generation and invalidates every candidate/receipt.

Implement `tailrocks generate package`. Generate README manifest/status view,
coverage view if retained, and GOAL.md from machine artifacts. Generated files
carry a “do not hand-edit” marker and `--check` detects drift.

GOAL.md is intentionally short. It names native `/goal` as the execution entry,
points at exactly one controller condition, and does not restate the full plan:

```text
tailrocks goal checkpoint <slug> --json
```

The command may return `CONTINUE`, an exact terminal failure, or current `PASS`;
it does not certify PASS until plan 005 adds state/receipts and plan 007 adds
final convergence. Transitional output says `verification capability pending`
and cannot mark an item DONE. Provider-specific rendering belongs to plan 006,
but every adapter consumes this same contract and command result.

**Verify**: generation is deterministic and idempotent; unknown fields, shell
commands, overlapping protected/allowed paths, unobservable bounds, stale
artifact digests, and hand edits fail; example package validates; GOAL stays
under every supported client's limit.

## Test plan

- Coverage graph: omission, orphan, deferral, rejection, prerequisite, stable ID.
- DAG: cycle, missing edge proof, vertical-slice invariant.
- Effect budgets: each category, enforceability class, remote-effect operator/
  idempotency rule, and parallel overlap.
- Oracle protection: changed test/rubric, missing backlink, mutation fixtures.
- Oracle staging: missing seam, materialization prerequisite, red baseline,
  independent approval, external anchor.
- Resolution: exact version/provenance and selective staleness.
- Dependency graph: transitive/selective invalidation and copy-edit no-op.
- Generation: deterministic bytes, no-op rerun, generated drift.
- Goal contract: strict envelope, artifact hash closure, argv-only commands,
  protected paths, environment/budget observability, and generation invalidation.
- Skill eval: full valid package, SHAPING refusal, no source implementation,
  stale replan, illegal assumption, unauthorized effect.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] Example package compiles and validates from its frozen intent lock.
- [ ] “No requirement without gate; no gate without requirement; no plan/effect
      without authorization” is executable, not prose-only.
- [ ] Exact resolution and oracle hashes are frozen before execution.
- [ ] `goal.contract.json` closes over every canonical artifact, protected path,
      plan/gate, environment requirement, and durable bound; no shell command or
      mutable duplicated authority remains.
- [ ] New executable oracles are independently materialized/anchored before
      dependent implementation becomes eligible.
- [ ] Every effect is enforceable/observable at its declared trust level, or
      autonomous execution is rejected.
- [ ] Every derived artifact records input hashes and stale descendants are
      computed selectively from the dependency graph.
- [ ] Product assumptions cannot enter a compiled package.
- [ ] README/coverage/GOAL projections are generated and drift-checked; GOAL is
      a thin native-`/goal` interface to `tailrocks goal checkpoint`.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- A scope/effect category cannot be verified mechanically: classify it as
  semantic/human/external with an explicit owner and disable autonomous
  execution where prevention/observation is absent; never pretend default-deny
  is enforced.
- Existing item lacks an approved `contract.lock.json`: route to plan 003
  migration; do not compile from mutable prose.
- A protected oracle is already implementation-coupled and rejects valid
  alternatives: stop and repair the contract/oracle before execution.
- An oracle hash has no trust anchor outside the executor-writable worktree.
- Latest-stable resolution cannot be pinned exactly from an authoritative
  source.
- A required bound or environment property cannot be observed/enforced by the
  selected provider adapter: mark that package/provider pairing unsupported;
  never move the bound into prose and call it enforced.

## Maintenance notes

Canonical package JSON is a public compatibility surface. Any schema change
needs migration and golden fixtures. Plan Markdown should explain work, not
duplicate mutable authority. Review scope budgets skeptically: broad globs erase
the “not more” property even when technically valid.
