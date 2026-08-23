# Skill audit: tailrocks-brainstorm

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP one live shaping interview

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Shared fixture contradicts the prompt state

- **Defect:** Case calls the item DRAFT while the staged shared item says READY, a state the router refuses to shape.
- **Evidence:** skills/tailrocks-brainstorm/evals/evals.json:5-10, skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md:3, and brainstorm/SKILL.md:61-66.
- **Fix:** create dedicated DRAFT and SHAPING fixtures with exact precondition checks.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; fixture state equals prompt; DRAFT/READY contradiction; brainstorm; case 1 fixture.
- **Action:** update.
- **Acceptance:** fixture preflight reads the exact allowed state before subject launch.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated interview results, runtime lock, mutation manifest, or trace exists.
- **Evidence:** skills/tailrocks-brainstorm/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate interactive and batch paths under the pinned workflow suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/workflow evidence; absent results; brainstorm; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results preserve one-question sequencing, write each answer immediately, and never grant READY.

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

- Split --batch — killed: same shaping artifact/oracle; interaction batching only changes presentation.

