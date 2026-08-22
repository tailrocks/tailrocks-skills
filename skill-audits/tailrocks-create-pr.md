# Skill audit: tailrocks-create-pr

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2
- Topology: KEEP one branch/commit/body/open transaction

## Description

None.

## Router

### RTR-1 — Declared pre-open checks are never run

- **Defect:** Repository conventions assign Checks commands to PR creation, but workflow commits/pushes/opens without an explicit gate.
- **Evidence:** skills/tailrocks-create-pr/references/repo-conventions.md:45 and SKILL.md:72-95.
- **Fix:** add a bounded pre-open gate with non-vacuous proof before push/create.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; required precondition; omitted local checks; PR creation; workflow steps.
- **Action:** update.
- **Acceptance:** failing check creates/pushes no PR; passing report states executed units.

## References

None.

## Evals

### EVAL-1 — PR transaction fixtures are inadequate

- **Defect:** Cases cannot establish repository history, remote, gate, push, and rendered PR outcomes under current runner.
- **Evidence:** skills/tailrocks-create-pr/evals/evals.json and scripts/run-evals.ts:370-399.
- **Fix:** add a mocked-remote workflow fixture and external-action receipts.
- **Dimensions:** contract, behavior, security.
- **Identity tuple:** evals; capability adequacy; unobservable PR transaction; create PR; eval set.
- **Action:** validator.
- **Acceptance:** exact commit/push/create events and body render are observed; failure case proves no external action.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, runtime lock, mutation manifest, or tool trace exists.
- **Evidence:** skills/tailrocks-create-pr/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate with the pinned mocked-external suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; create PR; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound non-certifying 3/3 smoke result records exact external receipts.

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

- Split branch, commit, body, and create — killed: shared rollback/idempotency makes one PR creation transaction.

