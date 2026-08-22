# Skill audit: tailrocks-typescript-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 3, WIRE 1, OVL 1
- Topology: SPLIT write, review, refactor, and migration

## Description

None.

## Router

### RTR-1 — Four code lifecycle jobs share one router

- **Defect:** Review is read-only, write changes behavior, refactor preserves it, and migration has compatibility state.
- **Evidence:** skills/tailrocks-typescript-best-practices/SKILL.md:36-39.
- **Fix:** keep best-practices for writing; create typescript-review, typescript-refactor, and typescript-migrate.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; separate authority/oracle; four-mode code lifecycle; TypeScript code policy; Select the mode.
- **Action:** refactor.
- **Acceptance:** each resulting router has one output/oracle and exclusive routing.

## References

None.

## Evals

### EVAL-1 — Write and migration lack normal cases

- **Defect:** The suite does not exercise approved creation or compatibility migration.
- **Evidence:** skills/tailrocks-typescript-best-practices/evals/evals.json:4-27.
- **Fix:** add per-owner normal/boundary/refusal fixtures.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch coverage; write/migrate missing; TypeScript lifecycle; eval set.
- **Action:** update.
- **Acceptance:** each owner has an observable mutation or read-only oracle.

### EVAL-2 — Eval set is stale after Rust-owned behavior rule

- **Defect:** Router policy changed after the eval set.
- **Evidence:** skills/tailrocks-typescript-best-practices/SKILL.md changed at 7e88a0c (2026-08-16), including lines 24-29; skills/tailrocks-typescript-best-practices/evals/evals.json last changed at c3151ac (2026-07-24).
- **Fix:** refresh the complete set during migration.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; router change regression; stale Rust ownership rule; TypeScript practices; file history.
- **Action:** update.
- **Acceptance:** cases reject domain behavior duplicated into TypeScript.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, mutation evidence, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-typescript-best-practices/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate every resulting owner under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; TypeScript practices; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound control and non-certifying 3/3 smoke candidate evidence exists.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits its public selectors.
- **Evidence:** skills/tailrocks-typescript-best-practices/SKILL.md:1-8.
- **Fix:** add hints and enforce during split wiring.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; TypeScript practices; frontmatter.
- **Action:** validator.
- **Acceptance:** clients display one clear invocation per owner.

## Overlap

### OVL-1 — Code policy duplicates TanStack project configuration

- **Defect:** compiler/lint/test configuration and migration order compete with TanStack setup’s templates/reference.
- **Evidence:** skills/tailrocks-typescript-best-practices/references/compiler-lint-testing.md:1-64 and skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md:14-41.
- **Fix:** move exact tooling/config/migration policy to TanStack setup; retain language semantics only here.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** overlap; canonical source; duplicated tooling policy; frontend config; compiler-lint-testing.
- **Action:** refactor.
- **Acceptance:** no exact project config remains in TypeScript code-policy references.

## Evidence states

| Dimension | State | Evidence / missing proof |
|---|---|---|
| Contract coherence | MEASURED | Router, references, outputs, and failure branches inspected statically. |
| Repeated-output variance | NOT MEASURED | No persisted repeated behavioral results. |
| Loaded context | NOT MEASURED | No runtime context-load trace; file sizes alone do not prove loaded context. |
| Tool use | NOT MEASURED | No persisted machine-readable tool-event trace. |
| Security | MEASURED | Authority, mutation, retry, recovery, trust, and secret rules inspected statically; this does not claim behavioral compliance. |
| Portability | MEASURED | Shared content and client metadata inspected across repository wiring. |
| Eval freshness | MEASURED | Current router contract was compared with the current case set and fixtures; behavioral execution remains absent. |
| Split/merge topology | MEASURED | Triggers, outputs/oracles, authority, side effects, and independent failures were compared. |

## Killed findings

- Split React from TypeScript — killed: React purity/effect rules are code-level UI semantics under the same output/oracle.
