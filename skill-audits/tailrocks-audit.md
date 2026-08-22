# Skill audit: tailrocks-audit

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, OVL 1
- Topology: RETIRE after distributing modes to improve, research, review, planning, execution, reconcile, and seed-roadmap owners

## Description

None after migration.

## Router

### RTR-1 — Audit, direction, research answer, planning, execution, and sweep share one skill

- **Defect:** Modes have distinct triggers, durable outputs, authority, side effects, and terminal oracles. Execute writes source in a worktree; sweep mutates/retire delivery artifacts; audit is source-read-only.
- **Evidence:** skills/tailrocks-audit/SKILL.md:28-53,145-178.
- **Fix:** audit moves to the requested improve family; ask/next to research; branch to review-pr; plan/execution/reconcile to focused owners; roadmap conversion to seed-roadmap.
- **Dimensions:** contract, predictability, efficiency, topology, security.
- **Identity tuple:** router; independent responsibility; multi-lifecycle umbrella; delivery audit; Modes and steps 6-7.
- **Action:** refactor.
- **Acceptance:** every old mode maps to exactly one new invocation and no target crosses authority/output boundaries.

## References

None after canonical repository-audit-lanes extraction.

## Evals

### EVAL-1 — Execution-heavy cases exceed current runner/fixture capabilities

- **Defect:** Fourteen cases claim multi-agent, planning, worktree, external, and reconciliation outcomes the legacy runner cannot uniformly observe.
- **Evidence:** skills/tailrocks-audit/evals/evals.json and scripts/run-evals.ts:370-399,446-472.
- **Fix:** migrate each case to its resulting owner and declared workflow capability; add complete fixtures/preconditions.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; capability/fixture adequacy; unobservable umbrella cases; delivery audit; eval set.
- **Action:** validator.
- **Acceptance:** each target case runs in a supported mode with state/tool assertions.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted control, repeated results, mutation evidence, runtime lock, or tool traces exist.
- **Evidence:** skills/tailrocks-audit/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate every resulting owner under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; audit migration; eval infrastructure.
- **Action:** validator.
- **Acceptance:** each migrated journey has source-hash-bound non-certifying 3/3 smoke evidence and old-route compatibility proof.

## Wiring

None until retirement; then remove catalog/client/docs entries after compatibility window.

## Overlap

### OVL-1 — Repository audit duplicates tailrocks-improve

- **Defect:** Both own recon, parallel audit lanes, vetting, ranking, planning, and backlog reconciliation.
- **Evidence:** skills/tailrocks-audit/SKILL.md:59-143 and skills/tailrocks-improve/SKILL.md:38-98.
- **Fix:** improve family is sole audit owner; seed-roadmap chooses delivery destination after audit.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** overlap; one audit owner; duplicate repository audit; audit/improve; workflows.
- **Action:** refactor.
- **Acceptance:** one canonical audit lane reference and exclusive activation.

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

- Split quick/deep/batch solely as modifiers — killed generally; user’s requested improve-deep is retained as an explicit public product contract.

