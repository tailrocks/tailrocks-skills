# Skill audit: tailrocks-prove

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP one read-only verification round over shipped surfaces

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Cases cannot execute claimed applications/surfaces

- **Defect:** Main case demands CLI execution, desktop launch, and reruns while fixture contains only Markdown; one case names session-sync but stages loom-sync; another has no files.
- **Evidence:** skills/tailrocks-prove/evals/evals.json:5-12,47-58 and its fixture inventory.
- **Fix:** add runnable CLI/app/surface fixtures and capability-specific workflow runners; fix slug mismatch.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; executable fixture adequacy; ungrounded surface claims; prove; cases 1,6,7.
- **Action:** update.
- **Acceptance:** each claimed command/app exists and every verdict cites observed tool/surface evidence.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated rounds, runtime lock, full tool trace, or capture evidence exists.
- **Evidence:** skills/tailrocks-prove/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate under pinned Linux/macOS/browser workflow lanes as declared by surface.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; prove; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results include non-vacuous command units, entry-point receipts, and exact report artifact.

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

- Split verification lanes — killed: all lanes feed one round report and share read-only authority/oracle.
- Overlap with reconcile — killed: prove writes judgment; reconcile owns status and retirement truth-sync.

