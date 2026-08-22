# Skill audit: tailrocks-simplify

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 1
- Topology: SPLIT read-only simplification audit from approved removal

## Description

None.

## Router

### RTR-1 — Audit and apply cross mutation authority

- **Defect:** Audit produces preservation findings; apply writes tests/code and runs gates under separate approval.
- **Evidence:** skills/tailrocks-simplify/SKILL.md:36-41,88-98.
- **Fix:** create tailrocks-simplify-audit for findings; keep simplify for approved removals only.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; audit versus apply; behavior-preserving removal; Modes/steps 7-8.
- **Action:** refactor.
- **Acceptance:** accepting a finding cannot grant write authority; each owner has one outcome.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated results, mutation manifests, runtime lock, or tool traces exist.
- **Evidence:** skills/tailrocks-simplify/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate both owners with characterization and no-change traps.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; simplify; eval infrastructure.
- **Action:** validator.
- **Acceptance:** audit proves zero mutation; apply proves smaller measures and identical behavior in non-certifying 3/3 smoke runs.

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

- Merge with general refactor — killed: simplify requires a counted removal; general refactor does not.

