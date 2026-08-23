# Skill audit: tailrocks-idea

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 1
- Topology: KEEP capture one raw idea as one DRAFT item

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** Adequate authored cases have no persisted baseline, repeated results, runtime lock, mutation manifest, or tool trace.
- **Evidence:** skills/tailrocks-idea/evals/evals.json; mise.toml:51-53; scripts/run-evals.ts:458-525.
- **Fix:** evaluate the atomic capture transaction under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; idea capture; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate results prove exact folder/index/branch/PR mutation and collision refusal.

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

- Split branch/PR creation from capture — killed: repository contract makes them the atomic creation transaction for an item.

