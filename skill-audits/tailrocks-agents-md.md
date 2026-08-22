# Skill audit: tailrocks-agents-md

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 1
- Topology: SPLIT add, audit, and approved sync; move symlink mechanics to code

## Description

None.

## Router

### RTR-1 — Read-only audit and two mutation contracts share one skill

- **Defect:** Audit is read-only; add mutates content and topology; sync repairs topology/removes rules. Add already performs substantial sync behavior.
- **Evidence:** skills/tailrocks-agents-md/SKILL.md:38-46,83-103.
- **Fix:** agents-md adds one rule; agents-md-audit reports; agents-md-sync applies approved topology repair; a script owns symlink resolution/repair.
- **Dimensions:** contract, predictability, topology, portability.
- **Identity tuple:** router; separate authority/output; add-audit-sync; agent instruction topology; Modes/steps 6-9.
- **Action:** refactor.
- **Acceptance:** audit cannot mutate; exactly one owner repairs topology; script prints validated mutation set.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** No stored baseline, repeated results, filesystem/symlink traces, runtime lock, or mutation evidence exists.
- **Evidence:** skills/tailrocks-agents-md/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each resulting owner with cross-platform symlink fixtures.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; agents-md; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke records prove allowed files/symlinks and zero audit mutation.

## Wiring

None.

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

- Split placement from rule writing — killed: placement determines the single rule’s valid destination in one mutation transaction.

