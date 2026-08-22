# Skill audit: tailrocks-graphql-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, WIRE 1
- Topology: SPLIT mutation from read-only review/audit

## Description

None.

## Router

### RTR-1 — Write and read-only judgment share one skill

- **Defect:** Write mutates; review/audit report findings. Review and whole-surface audit can remain one read-only owner because their output/oracle match.
- **Evidence:** skills/tailrocks-graphql-best-practices/SKILL.md:32-36.
- **Fix:** keep best-practices for GraphQL evolution; create tailrocks-graphql-review for diff and whole-surface scopes.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; write versus review/audit; public GraphQL; Select the mode.
- **Action:** refactor.
- **Acceptance:** no resulting router crosses mutation authority; public-versus-gRPC route stays exclusive.

## References

None.

## Evals

### EVAL-1 — Whole-surface audit lacks a case

- **Defect:** Existing cases do not exercise the audit scope as a complete public API surface.
- **Evidence:** skills/tailrocks-graphql-best-practices/evals/evals.json:4-29.
- **Fix:** add a seeded surface with known defects and a deliberate non-finding.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; scope boundary coverage; audit missing; GraphQL review; eval set.
- **Action:** update.
- **Acceptance:** fixture-backed audit reports planted defects and kills the trap.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetition, mutation, pin, or tool evidence exists.
- **Evidence:** skills/tailrocks-graphql-best-practices/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate resulting owners with the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; reliability evidence; absent result envelope; GraphQL practices; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate results exist with stable claims and exact pins.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits the write/review/audit invocation shape.
- **Evidence:** skills/tailrocks-graphql-best-practices/SKILL.md:1-11.
- **Fix:** add hints and enforce them during migration.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; GraphQL practices; frontmatter.
- **Action:** validator.
- **Acceptance:** generated client prompts and catalog wiring select one owner.

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

- GraphQL/gRPC overlap — killed: descriptions and refusal path distinguish public API from service-to-service communication.

