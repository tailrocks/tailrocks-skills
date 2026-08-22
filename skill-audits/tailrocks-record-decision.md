# Skill audit: tailrocks-record-decision

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP record and propagate one user decision

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Planned-state case lacks planned artifacts

- **Defect:** Case claims PLANNED with stale plan rows but stages only a READY item and no plan hub.
- **Evidence:** skills/tailrocks-record-decision/evals/evals.json:13-18 and skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md:3.
- **Fix:** add dedicated READY and PLANNED fixtures with actual manifest rows and preconditions.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture state truth; absent planned rows; record decision; case 2.
- **Action:** update.
- **Acceptance:** asserted status/STALE mutations have real target artifacts and exact before state.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetitions, runtime lock, mutation manifest, or tool trace exists.
- **Evidence:** skills/tailrocks-record-decision/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each state branch under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; record decision; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke cases update only declared artifacts and route reopening/staleness exactly.

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

- Split validation from propagation — killed: a decision cannot be safely recorded without applying its state implications in the same transaction.

