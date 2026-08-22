# Skill audit: tailrocks-checkout-pr

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2
- Topology: MOVE deterministic operation to scripts/checkout-pr.ts; retire skill

## Description

None after migration.

## Router

### RTR-1 — Entire responsibility is a decidable command/state transform

- **Defect:** Resolve identifier, guard dirty state, query PR state, call gh pr checkout, and verify branch are exact branches with no semantic artifact.
- **Evidence:** skills/tailrocks-checkout-pr/SKILL.md:17-39.
- **Fix:** implement a typed deterministic script with validated arguments, exact failure codes, no auto-stash, and idempotent already-on-branch handling.
- **Dimensions:** contract, predictability, efficiency, security.
- **Identity tuple:** router; deterministic work belongs in software; exact checkout state machine; PR checkout; full router.
- **Action:** delete.
- **Acceptance:** script tests cover number/URL/branch, dirty tree, closed PR, ambiguous branch, already checked out, and successful switch.

## References

None.

## Evals

### EVAL-1 — Cases require live gh state without fixtures

- **Defect:** Empty workspaces cannot establish PR lookup/checkout outcomes.
- **Evidence:** skills/tailrocks-checkout-pr/evals/evals.json:5-20.
- **Fix:** replace skill evals with deterministic script tests and mocked gh contract tests.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture adequacy; live PR state absent; checkout PR; eval set.
- **Action:** validator.
- **Acceptance:** every legal/error branch runs in tests with exact exit/state assertions.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No external action traces or repeated skill evidence exists.
- **Evidence:** skills/tailrocks-checkout-pr/evals/evals.json; mise.toml:51-53.
- **Fix:** software tests replace probabilistic execution; migration activation cases only prove routing away from retired skill.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; deterministic replacement evidence; absent results; checkout PR; eval infrastructure.
- **Action:** validator.
- **Acceptance:** script behavior is deterministic and old invocation compatibility routes exactly once.

## Wiring

None until retirement; then remove all catalog/client/docs entries.

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

- Keep a skill wrapper around the script — killed unless interpretation is added; current outcome is entirely program-checkable.

