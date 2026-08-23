# Skill audit: tailrocks-grpc-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 3, WIRE 1
- Topology: SPLIT mutation from read-only review/audit

## Description

None.

## Router

### RTR-1 — Write and read-only judgment share one skill

- **Defect:** Write mutates; review/audit produce findings under separate authority.
- **Evidence:** skills/tailrocks-grpc-best-practices/SKILL.md:23-27.
- **Fix:** keep best-practices for contract/service creation; create tailrocks-grpc-review for diff and whole-surface scopes.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; write versus review/audit; internal gRPC; Select the mode.
- **Action:** refactor.
- **Acceptance:** one authority and oracle per skill; public GraphQL boundary remains exclusive.

## References

None.

## Evals

### EVAL-1 — Write and whole-surface audit lack normal cases

- **Defect:** Existing cases do not cover successful contract creation or complete audit.
- **Evidence:** skills/tailrocks-grpc-best-practices/evals/evals.json:4-28.
- **Fix:** add fixture-backed cases per resulting owner.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch coverage; write and audit missing; gRPC practices; eval set.
- **Action:** update.
- **Acceptance:** generated/proto changes and read-only findings are each externally observable.

### EVAL-2 — Eval set is stale after router authority change

- **Defect:** Router behavior changed after the eval corpus without a full-set refresh.
- **Evidence:** skills/tailrocks-grpc-best-practices/SKILL.md changed at 47d7247 (2026-08-22), including lines 23-26; skills/tailrocks-grpc-best-practices/evals/evals.json last changed at 7e88a0c (2026-08-16).
- **Fix:** reassess every case during split migration.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; changed router requires full regression refresh; stale authority cases; gRPC practices; file history.
- **Action:** update.
- **Acceptance:** eval change is at least as new as the behavioral router change and asserts it.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetition, mutation, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-grpc-best-practices/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate resulting owners with the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent result envelope; gRPC practices; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound control and non-certifying 3/3 smoke candidate evidence exists.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits write/review/audit invocation shape.
- **Evidence:** skills/tailrocks-grpc-best-practices/SKILL.md:1-8.
- **Fix:** add hints and validator coverage.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; gRPC practices; frontmatter.
- **Action:** validator.
- **Acceptance:** each resulting skill is exposed exactly once with a clear default prompt.

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

- GraphQL overlap — killed: exclusive protocol roles are explicit.
