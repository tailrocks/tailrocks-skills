# Skill audit: tailrocks-research

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2
- Topology: KEEP and absorb former audit ask/next; sole owner of reusable research topics

## Description

None.

## Router

None.

## References

None after removing copied research procedure from tailrocks-plan.

## Evals

### EVAL-1 — Normal research claims lack complete source/workflow fixtures

- **Defect:** Several cases require parallel sourced investigation and durable topic reconciliation that the legacy runner cannot observe.
- **Evidence:** skills/tailrocks-research/evals/evals.json and scripts/run-evals.ts:370-399.
- **Fix:** add a workflow runner with controlled source corpus, chapter artifacts, citations, and overlap fixtures.
- **Dimensions:** contract, behavior, portability.
- **Identity tuple:** evals; capability/fixture adequacy; unobservable research workflow; research; eval set.
- **Action:** validator.
- **Acceptance:** every conclusion is tied to staged/recorded sources and only one topic owner writes.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated results, runtime lock, source/tool trace, or mutation manifest exists.
- **Evidence:** skills/tailrocks-research/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate question and roadmap-sweep scopes under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; research; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results preserve sourced evidence, no decision-making, and idempotent topic extension.

## Wiring

None.

## Overlap

None after absorbing audit ask/next and plan research-folder writes.

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

- Split question and roadmap topic modes — killed: both produce the same reusable topic folder and source-vetting oracle.

