# Skill audit: tailrocks-swift-project-setup

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, EVAL 3, WIRE 1
- Topology: SPLIT scaffold/audit/remediate; extract agent integration and Rust bridge setup

## Description

None.

## Router

### RTR-1 — Scaffold, audit, and remediation cross authority boundaries

- **Defect:** Read-only audit and mutating baseline creation/remediation are independent public jobs.
- **Evidence:** skills/tailrocks-swift-project-setup/SKILL.md:31-37.
- **Fix:** retain setup for scaffold; add swift-project-audit and swift-project-remediate.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; scaffold/audit/remediate; Swift project baseline; Modes.
- **Action:** refactor.
- **Acceptance:** audit cannot edit; each owner has one output/oracle.

### RTR-2 — Baseline, agent ecosystem, and Rust bridge are separate responsibilities

- **Defect:** Agent integration and Rust/FFI packaging have separate triggers, dependencies, side effects, and gates from native project scaffolding; dated pins are duplicated in the router.
- **Evidence:** skills/tailrocks-swift-project-setup/SKILL.md:16-25,119-146; skills/tailrocks-swift-project-setup/references/agent-integration.md:17-120; skills/tailrocks-swift-project-setup/references/rust-core.md:1-120.
- **Fix:** keep native baseline here; create focused agent-integration and Rust-bridge setup owners; exact pins live only in ecosystem references.
- **Dimensions:** contract, efficiency, portability, topology.
- **Identity tuple:** router; separate trigger/dependency; agent integration and Rust bridge lanes; Swift setup; Connect the agent/Rust-core lane.
- **Action:** refactor.
- **Acceptance:** each owner has one output and exact versions have one canonical source.

## References

None.

## Evals

### EVAL-1 — Approved remediation lacks a successful case

- **Defect:** Cases do not establish normal remediation.
- **Evidence:** skills/tailrocks-swift-project-setup/evals/evals.json:4-48.
- **Fix:** add precondition-checked fixtures for each resulting owner.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch coverage; remediation missing; Swift project lifecycle; eval set.
- **Action:** update.
- **Acceptance:** approved gap closure proves allowed mutation and all relevant build/test gates.

### EVAL-2 — Eval set is stale after router changes

- **Defect:** Behavioral router edits postdate the eval corpus.
- **Evidence:** skills/tailrocks-swift-project-setup/SKILL.md changed at 50d0b87 (2026-08-22); skills/tailrocks-swift-project-setup/evals/evals.json last changed at a8f7707 (2026-08-16); changed rule at SKILL.md:43.
- **Fix:** refresh full cases during migration.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; router change regression; stale baseline cases; Swift setup; file history.
- **Action:** update.
- **Acceptance:** every changed responsibility has current cases.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, mutation result, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-swift-project-setup/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each new owner under the pinned macOS workflow suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; Swift project setup; eval infrastructure.
- **Action:** validator.
- **Acceptance:** exact SDK/tool/model pins and non-certifying 3/3 smoke candidate evidence exist.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits selector syntax.
- **Evidence:** skills/tailrocks-swift-project-setup/SKILL.md:1-8.
- **Fix:** add focused hints and enforce them.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; Swift project setup; frontmatter.
- **Action:** validator.
- **Acceptance:** each new skill appears once across clients/catalogs.

## Overlap

None.

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

- Split project generation from lint/test baseline — killed: one reproducible baseline transaction.
