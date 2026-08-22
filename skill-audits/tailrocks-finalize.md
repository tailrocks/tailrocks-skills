# Skill audit: tailrocks-finalize

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP close one shaping interview and grant READY

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — DRAFT/SHAPING prompts stage a READY item

- **Defect:** Multiple cases describe states that contradict the shared fixture.
- **Evidence:** skills/tailrocks-finalize/evals/evals.json:5-27 and skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md:3.
- **Fix:** dedicated DRAFT, SHAPING, and READY fixtures with machine preconditions.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; fixture state equals prompt; finalization state contradiction; finalize; cases 1-3.
- **Action:** update.
- **Acceptance:** only SHAPING can enter readiness work and only complete checklist can become READY.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated interviews, runtime lock, mutation manifest, or trace exists.
- **Evidence:** skills/tailrocks-finalize/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate live and batch frontiers under the pinned workflow suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/workflow evidence; absent results; finalize; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke cases never self-answer product questions or grant READY with an open item.

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

- Merge brainstorm/finalize — killed: shaping questions and the sole readiness oracle have exclusive state triggers.

