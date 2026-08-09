# Plan 008: Add isolated prototypes for empirical uncertainty

> **Executor instructions**: Add a narrowly scoped optional prototype stage.
> Prototype code answers one question and never becomes production code by
> default. Preserve research provenance, record observed results, and route any
> enabled decision back through the normal intent contract.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — adds a skill and a new research artifact subtype
- **Depends on**:
  `advisor-plans/003-intent-provenance-and-ready-contract.md`,
  `advisor-plans/007-independent-convergence-reconcile.md`
- **Category**: feature / research / correctness
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Some uncertainty cannot be resolved through questions or documents: UI feel,
library edge behavior, state-model viability, latency, or workload limits.
Current pipeline can misclassify these as research facts or planning
assumptions. Matt Pocock's prototype discipline supplies the missing move: one
disposable experiment answering one explicit question, with the learned result
preserved as evidence and production adoption requiring a separate decision.

## Current state

- `skills/tailrocks-research/SKILL.md:13-17` creates durable sourced research
  topics for facts.
- `skills/tailrocks-research/SKILL.md:30-45` is read-only outside research and
  forbids choosing product decisions.
- `skills/tailrocks-research/references/research-playbook.md:7-20` supports only
  summaries and Markdown chapters, not runnable experiments.
- `skills/tailrocks-finalize/references/readiness-and-grilling.md:48-60`
  classifies remainder only as resolved, deferred, or researchable.
- `skills/tailrocks-finalize/references/readiness-and-grilling.md:45-46`
  refuses pixel detail and uses schematic UI only; no runnable interaction test
  exists.
- Plan 003 introduces `empirical_uncertainty`; this plan gives that class an
  owner.

## Research basis

- [Matt Pocock prototype discipline](https://github.com/mattpocock/skills/blob/main/docs/engineering/prototype.md)
  uses disposable code to answer one question that prose cannot settle.

## Target artifact shape

```text
research/<topic>/
  README.md
  prototypes/
    P001-<question>/
      README.md
      experiment/        # minimal disposable code/assets
      observation.json   # command/environment/result hashes
```

Prototype README contains: Question, Hypothesis, Minimal Experiment, Success/
Failure Signal, Observed Result, Limitations, Decision Enabled, and Disposition
(`archive-reference`, `external-reference`, never `production`). Scratch build
outputs may be deleted; the smallest runnable source/inputs or a content-
addressed external primary-source pointer must remain with the observation.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all gates pass |
| Skill validation | `mise run validate` | prototype skill discovered and valid |
| Prototype artifact check | `tailrocks check prototype examples/.../prototypes/P001-* --json` | valid question/result/disposition and hashes |
| Skill eval | `bun scripts/run-evals.ts --skill tailrocks-prototype --case 1 --runs 1 --retain` | actual experiment artifacts graded |

## Scope

**In scope**:

- `skills/tailrocks-prototype/**` (create)
- `skills/tailrocks-research/SKILL.md` and research playbook routing/layout
- `skills/tailrocks-finalize/SKILL.md` and readiness reference classification
- `skills/tailrocks-brainstorm/SKILL.md` routing only
- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**` prototype schema/check
- `schemas/v1/prototype*.json`
- a small prototype fixture under `examples/plan-package/research/**`
- `README.md`, `AGENTS.md`, `CLAUDE.md`, `INSTALL.md`
- all plugin manifests/marketplace entry required for lockstep version/catalog
  policy
- `docs/pipeline-walkthrough.md`

**Out of scope**:

- Editing target project production source/config/dependencies.
- Treating prototype code as a plan starting point without explicit review and
  decision.
- Broad architecture spikes answering several questions at once.
- Choosing product direction; user remains owner through Record Decision.

## Git workflow

- Branch: `advisor/008-empirical-prototype`
- Conventional commits, e.g. `feat(delivery): add empirical prototypes`; use
  DCO signoff and `Co-authored-by: Codex <codex@openai.com>`.
- Reconcile current manifest version, then bump all versioned manifests in
  lockstep per new-skill policy. Do not release/push without operator.

## Steps

### Step 1: Define strict prototype contract

Add schema/types for one question, falsifiable hypothesis, minimal experiment,
predeclared success/failure signals, exact commands/environment, observations,
limitations, enabled decision, linked roadmap/source IDs, and disposition.
Question scope must be singular; reject broad “build the feature” experiments.

Observation is descriptive evidence, not a product verdict. Result hashes and
environment versions make later readers able to judge staleness.

**Verify**: schema tests reject missing signal, post-hoc success criteria,
multiple unrelated questions, unlinked item, missing disposition, and claimed
production status.

### Step 2: Add `tailrocks-prototype` skill

Create manual-only, source-neutral skill. Procedure:

1. Load one `empirical_uncertainty` from a roadmap item/research topic.
2. Agree with user on question and observable signal when preference is
   involved; facts may use evidence.
3. Create the smallest runnable experiment under `research/` only.
4. Run/observe it in an isolated sandbox/worktree with declared effects.
5. Record commands, environment, result, limitations, and disposition.
6. Link the result to the item and route the enabled product choice to
   `tailrocks-record-decision`; never decide or merge prototype into source.

No production abstractions, persistence, broad error framework, deployment,
remote writes, or cleanup of unrelated code.

**Verify**: typed evals cover valid experiment, request to turn it directly into
production, multi-question scope, unsupported environment, and source-edit
attempt.

### Step 3: Integrate routing into Brainstorm, Research, and Finalize

- Brainstorm classifies observed uncertainty as empirical and points to
  Prototype.
- Research may provide facts/hypotheses feeding an experiment but does not call
  document lookup an empirical result.
- Finalize accepts empirical uncertainty only when resolved by a vetted
  prototype, explicitly deferred by user, or removed from scope; otherwise it
  stays SHAPING.
- Record Decision remains the only way prototype evidence becomes normative
  product intent.

**Verify**: skill evals demonstrate all routes and refuse READY with unresolved
empirical uncertainty.

### Step 4: Add experiment isolation and evidence checks

Implement `tailrocks check prototype`. Validate all writes stayed inside the
prototype directory, commands/results are recorded, environment is pinned, and
no production path/dependency/remote effect occurred. For UI prototypes, retain
screenshots/recordings with scenario IDs and user feedback source IDs. For
performance prototypes, record method, sample size, machine limits, and raw
summary—not one unexplained number.

An after-the-fact directory diff proves only filesystem effects. The runner must
use sandbox/network/command observation for the declared experiment. If it
cannot prevent or observe a relevant remote/external effect, refuse the
experiment rather than recording “no effect” from missing evidence.

**Verify**: fixtures reject outside writes, missing command/environment, stale
unhashed result, remote effect, and UI/performance claims without evidence.

### Step 5: Retain reproducible primary evidence and clean only derivable output

Default disposition is `archive-reference`: retain the minimal runnable source,
inputs, commands, and observation in `research/`; remove caches, build output,
credentials, and other derivable scratch. When policy/size prevents committing
the runnable artifact, store it in an operator-owned content-addressed location
and retain its digest, media type, retrieval policy, and availability check.
Never discard the sole primary artifact while keeping only an agent summary.

Experiments remain research evidence and are never imported by production. A
plan may cite the observation, not copy prototype code without a new explicit
technical decision and production-quality implementation plan.

**Verify**: checker rejects missing sole evidence, unverifiable external pointer,
source imports/references to experiment code, and accepts a minimal retained
experiment or valid content-addressed external reference plus research citation.

### Step 6: Package and catalog

Add SKILL.md, reference, `agents/openai.yaml`, typed evals, catalogs, manifests,
and walkthrough loop. Keep token footprint small: skill routes to one concise
reference; artifacts hold evidence.

**Verify**: `mise run validate`, `mise run verify`, and all affected skill eval
preflights pass.

## Test plan

- Contract: singular question, predeclared signal, environment, disposition.
- Isolation: no writes/imports outside research prototype.
- Effect observation: filesystem plus command/network sandbox; unobservable
  external effects fail closed.
- Routing: research fact vs empirical uncertainty vs user decision.
- UI evidence and performance-method cases.
- Lifecycle: prototype result alone is non-normative; Record Decision source
  makes it normative; Finalize then compiles it.
- Eval safety: “prototype the full app” and “move this into production” refused.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] New prototype skill is manual-only, source-neutral, cataloged, and tested.
- [ ] One empirical uncertainty produces one isolated experiment and one
      observation artifact.
- [ ] Minimal runnable primary evidence remains locally or through a validated
      content-addressed operator-owned pointer; only derivable scratch is removed.
- [ ] Prototype code never becomes production automatically.
- [ ] Finalize cannot READY unresolved empirical uncertainty.
- [ ] Only Record Decision can convert result into normative intent.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Experiment needs production credentials, irreversible side effects, or remote
  writes not safely sandboxable.
- The runner cannot prevent or observe an effect required to support the
  experiment's claim.
- Success criteria are being chosen after observing result.
- Question is a user preference disguised as an experiment.
- Experiment must touch production source to be meaningful; route to a planned
  technical spike with explicit effect budget instead.

## Maintenance notes

Prototype value is uncertainty reduction, not reusable code volume. Review for
scope creep and post-hoc conclusions. Environment/version changes can stale an
observation without invalidating the historical fact that the experiment ran.
