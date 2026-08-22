# Skill audit: tailrocks-reconcile

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP truth-sync and terminal retirement as one fail-closed closer

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Gate and retirement claims lack complete goal packages

- **Defect:** Cases require goal/check.sh or a current passing gate, but several fixtures omit goal entirely.
- **Evidence:** skills/tailrocks-reconcile/evals/evals.json:5-12,96-105,152-159 and corresponding clean-retirement fixture tree.
- **Fix:** provide complete frozen goal packages and precondition checks for every retirement/status branch.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; fixture adequacy; missing goal/gate; reconcile; cases 1,11,17.
- **Action:** update.
- **Acceptance:** every status/retirement decision runs a real non-vacuous check and stages exact before state.

### EVAL-2 — Reliability is unmeasured

- **Defect:** Eighteen authored cases have no persisted baseline, repeated results, runtime lock, mutation manifests, or tool traces.
- **Evidence:** skills/tailrocks-reconcile/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate all closer branches under the pinned workflow suite.
- **Dimensions:** behavior, predictability, portability, security.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; reconcile; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke branch results prove exact status/artifact mutations, two-commit retirement, and rollback/resume evidence.

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

- Split retirement into another skill — killed: retirement is the terminal branch of one fail-closed truth-sync transaction.
- Treat git-backed deletion as unsupported destruction — killed: explicit invocation, guarded criteria, and two-commit recovery are defined.

