# Skill audit: tailrocks-contribute

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2
- Topology: SPLIT five lifecycle responsibilities with durable contrib-folder handoff

## Description

None.

## Router

### RTR-1 — Five independently invokable lifecycle jobs share one skill

- **Defect:** Recon, proposal, local preparation, externally visible submission, and response have different artifacts, authority, side effects, and terminal states. Durable contrib files already carry handoff state, so they need not share one invocation owner.
- **Evidence:** skills/tailrocks-contribute/SKILL.md:37-74.
- **Fix:** create contribute-recon, contribute-propose, contribute-prepare, contribute-submit, and contribute-respond; only submit can push/post a new contribution.
- **Dimensions:** contract, predictability, topology, security.
- **Identity tuple:** router; separate trigger/output/authority; five-mode external lifecycle; contribution; Modes.
- **Action:** refactor.
- **Acceptance:** each stage has one artifact/oracle, explicit preconditions, and exclusive external authority.

## References

None.

## Evals

### EVAL-1 — Execution-heavy cases lack sufficient repository/external fixtures

- **Defect:** Recon and preparation claim live project/gate behavior that the current fixture/runner cannot establish.
- **Evidence:** skills/tailrocks-contribute/evals/evals.json:5-8,35-38 and scripts/run-evals.ts:370-399.
- **Fix:** add mocked external receipts and complete fork/repository workflow fixtures per resulting owner.
- **Dimensions:** contract, behavior, security.
- **Identity tuple:** evals; capability/fixture adequacy; unobservable contribution lifecycle; contribute; eval cases.
- **Action:** validator.
- **Acceptance:** local-only stages prove no external action; submit/respond require exact approved receipts.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated runs, runtime lock, tool traces, or external-action receipts exist.
- **Evidence:** skills/tailrocks-contribute/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each stage under pinned local/mocked-external runners.
- **Dimensions:** behavior, predictability, portability, security.
- **Identity tuple:** evals; repeated/tool evidence; absent results; contribution family; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke stage results include exact mutation/receipt proofs and no unauthorized publication.

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

- Keep whole because all stages use one log — killed: durable state enables safe handoff; shared storage does not make independent permissions one responsibility.

