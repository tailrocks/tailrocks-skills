# Skill audit: tailrocks-refresh-pr

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2
- Topology: KEEP one existing-PR metadata reconciliation

## Description

None.

## Router

### RTR-1 — Mutation commands omit required values and recovery

- **Defect:** gh pr edit title/body invocations omit the new title or body file, and no bounded retry/cleanup contract is stated.
- **Evidence:** skills/tailrocks-refresh-pr/SKILL.md:71,77.
- **Fix:** specify exact arguments, temporary-file lifecycle, prior-outcome check, and bounded recovery.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; complete typed mutation call; omitted arguments; refresh PR; edit steps.
- **Action:** update.
- **Acceptance:** command-trace case proves exact invocation and render verification; uncertain mutation is not blindly retried.

## References

None.

## Evals

### EVAL-1 — Existing-PR fixtures are inadequate

- **Defect:** Cases cannot establish live PR metadata/diff/edit results with the current runner.
- **Evidence:** skills/tailrocks-refresh-pr/evals/evals.json and scripts/run-evals.ts:370-399.
- **Fix:** add mocked PR state, diff, template, and edit receipts.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; capability adequacy; unobservable PR edit; refresh PR; eval set.
- **Action:** validator.
- **Acceptance:** before/after title/body and no-op idempotency are mechanically checked.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, runtime lock, or external tool trace exists.
- **Evidence:** skills/tailrocks-refresh-pr/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate under pinned mocked-external workflow.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; refresh PR; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results include exact receipts and state restoration/cleanup.

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

- Merge with create PR — killed: new-PR transaction and existing-PR reconciliation have exclusive triggers.

