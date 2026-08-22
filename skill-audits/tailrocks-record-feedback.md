# Skill audit: tailrocks-record-feedback

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP capture one user feedback round without judgment

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Near-miss case records a complaint the user excluded

- **Defect:** Prompt says sidebar emptiness is expected and asks to record the rest; oracle records both statements as defects.
- **Evidence:** skills/tailrocks-record-feedback/evals/evals.json:29-38.
- **Fix:** record only the CLI defect; retain the sidebar explanation as context only if necessary.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; verbatim capture respects exclusions; retracted complaint recorded; feedback capture; case 4.
- **Action:** update.
- **Acceptance:** explicitly excluded/retracted statements never receive U identifiers.

### EVAL-2 — Reliability is unmeasured

- **Defect:** Fixture is adequate but no persisted baseline, repeated result, runtime lock, mutation manifest, or trace exists.
- **Evidence:** skills/tailrocks-record-feedback/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate capture/refusal cases under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; record feedback; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results preserve user wording, exclusions, ID allocation, and write-only round boundary.

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

- Merge feedback and prove — killed: capture accepts user statements without judgment; prove has an evidence oracle.

