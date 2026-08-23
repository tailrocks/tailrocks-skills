# Skill audit: tailrocks-merge-pr

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, OVL 1
- Topology: KEEP authorization/merge transaction; move exact preflight checks to script

## Description

None.

## Router

### RTR-1 — Polling is unbounded and decidable gates remain prose-owned

- **Defect:** Pending CI polls until green without a fixed budget; delivery contradictions, trailer ordering, and metadata invariants are exact checks.
- **Evidence:** skills/tailrocks-merge-pr/SKILL.md:61-64,75-111.
- **Fix:** scripts/merge-preflight.ts owns normalized checks with a fixed poll budget; skill retains blast-radius judgment, fresh authorization, and merge orchestration.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; bounded retry/deterministic gate; unbounded polling and prose checks; merge PR; CI/delivery/docs gates.
- **Action:** validator.
- **Acceptance:** permanent pending stops at bound; exact contradictions return typed failures; no merge occurs without fresh authorization.

## References

None.

## Evals

### EVAL-1 — Several merge histories are absent from fixtures

- **Defect:** Delivery/docs cases claim repository and PR history that staged fixtures do not fully provide.
- **Evidence:** skills/tailrocks-merge-pr/evals/evals.json:68 and cases 8-11.
- **Fix:** add complete git/PR histories and mocked check/merge receipts.
- **Dimensions:** contract, behavior, security.
- **Identity tuple:** evals; fixture/capability adequacy; missing merge history; merge PR; eval cases.
- **Action:** validator.
- **Acceptance:** every gate decision is derived from staged state and external receipts.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetitions, runtime lock, or tool/external traces exist.
- **Evidence:** skills/tailrocks-merge-pr/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate preflight and merge orchestration under separate pinned paths.
- **Dimensions:** behavior, predictability, portability, security.
- **Identity tuple:** evals; repeated/tool evidence; absent results; merge PR; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke safety cases prove no merge; approved path records exact merge receipt.

## Wiring

None.

## Overlap

### OVL-1 — Documentation ordering predicate disagrees with document skill

- **Defect:** Merge allows later non-behavior docs commits while document says any later documentation commit leaves its gate red.
- **Evidence:** skills/tailrocks-merge-pr/SKILL.md:91-102 and skills/tailrocks-document/SKILL.md:101.
- **Fix:** one shared deterministic ordering predicate consumed by both.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** overlap; one shared predicate; contradictory docs ordering; merge/document; final content gate.
- **Action:** refactor.
- **Acceptance:** identical commit history yields identical verdict in both paths.

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

- Split merge stages — killed: all gates protect one irreversible merge transaction.

