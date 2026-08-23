# Skill audit: tailrocks-tanstack-project-setup

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 3, WIRE 1, OVL 1
- Topology: SPLIT scaffold, audit, migration, and remediation

## Description

None.

## Router

### RTR-1 — Four project lifecycle jobs share one router

- **Defect:** Scaffold, audit, migration, and remediation have distinct triggers, mutation authority, outputs, and failure paths.
- **Evidence:** skills/tailrocks-tanstack-project-setup/SKILL.md:57-68.
- **Fix:** create focused project-setup, project-audit, project-migrate, and project-remediate skills.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; one responsibility; four-mode lifecycle umbrella; TanStack baseline; Modes.
- **Action:** refactor.
- **Acceptance:** each public invocation reaches one owner; audit cannot mutate.

## References

None.

## Evals

### EVAL-1 — Migration and remediation lack normal cases

- **Defect:** The suite does not prove either successful branch.
- **Evidence:** skills/tailrocks-tanstack-project-setup/evals/evals.json:4-23.
- **Fix:** add complete, precondition-checked fixtures for every resulting owner.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch coverage; migrate/remediate missing; TanStack baseline lifecycle; eval set.
- **Action:** update.
- **Acceptance:** never-broken migration and approved remediation are mechanically observable.

### EVAL-2 — Eval set is stale after thin-UI policy change

- **Defect:** Router architecture changed after evals without a full refresh.
- **Evidence:** skills/tailrocks-tanstack-project-setup/SKILL.md changed at 7e88a0c (2026-08-16), including lines 18-22; skills/tailrocks-tanstack-project-setup/evals/evals.json last changed at c3151ac (2026-07-24).
- **Fix:** refresh all branch cases during split.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; router change regression; stale thin-UI rule; TanStack setup; file history.
- **Action:** update.
- **Acceptance:** every resulting case asserts that product behavior stays in Rust.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, mutations, exact runtime, or trace exists.
- **Evidence:** skills/tailrocks-tanstack-project-setup/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate every resulting owner under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; TanStack setup; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound control and non-certifying 3/3 smoke candidate evidence exists.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits four-mode invocation syntax.
- **Evidence:** skills/tailrocks-tanstack-project-setup/SKILL.md:1-8.
- **Fix:** add focused hints and enforce them.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; TanStack setup; frontmatter.
- **Action:** validator.
- **Acceptance:** every new skill appears exactly once in all client/catalog surfaces.

## Overlap

### OVL-1 — TypeScript code policy duplicates project tooling policy

- **Defect:** Exact TypeScript/Oxc/Bun configuration and migration order exist in both this skill and TypeScript best practices.
- **Evidence:** skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md:14-41 and skills/tailrocks-typescript-best-practices/references/compiler-lint-testing.md:1-64.
- **Fix:** make TanStack setup the sole project-config/tooling owner; TypeScript best practices inspects local gates but owns only code semantics.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** overlap; one home per fact; duplicate TS/Oxc/Bun setup policy; frontend tooling; two references.
- **Action:** refactor.
- **Acceptance:** exact config and migration order occur once; trigger descriptions distinguish setup from code semantics.

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

- Split each framework integration into a skill — killed: they form one application baseline transaction.
