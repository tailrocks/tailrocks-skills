# Skill audit: tailrocks-remediate

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 1, OVL 1
- Topology: SPLIT read-only root cause from implementation; absorb rethink

## Description

None.

## Router

### RTR-1 — Analyze and fix cross authority/oracle boundaries

- **Defect:** Analyze proves wrongness and derives design read-only; fix executes a structural correction and regression proof.
- **Evidence:** skills/tailrocks-remediate/SKILL.md:28-33,95-109.
- **Fix:** create tailrocks-root-cause for diagnosis/design; keep remediate for approved correction.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority/output split; analyze versus fix; proven defect remediation; Modes/workflow 9-10.
- **Action:** refactor.
- **Acceptance:** diagnosis cannot mutate; correction requires an approved causal design.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** Adequate authored fixtures have no persisted baseline, repetition, mutation, runtime lock, or trace.
- **Evidence:** skills/tailrocks-remediate/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate root-cause and remediate separately.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; remediation; eval infrastructure.
- **Action:** validator.
- **Acceptance:** diagnosis non-certifying 3/3 smoke yields zero mutation; fix non-certifying 3/3 smoke proves instance and defect-class prevention.

## Wiring

None.

## Overlap

### OVL-1 — Rethink owns the same failed-guarantee redesign path

- **Defect:** Both skills accept a bug/failed guarantee, derive structural redesign, and may implement it; the current trigger distinction is not exclusive.
- **Evidence:** skills/tailrocks-remediate/SKILL.md:4-5,28-33 and skills/tailrocks-rethink/SKILL.md:4-5,37-46.
- **Fix:** merge rethink analysis into root-cause and rebuild into remediate; compatibility/breaking posture is a contract field, not a second owner.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** overlap; exclusive trigger; duplicate causal redesign; remediate/rethink; descriptions and modes.
- **Action:** refactor.
- **Acceptance:** proven bug, friction, compatible correction, and approved breaking correction each route exactly once.

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

- Keep separate by “cost excluded” wording — killed: decision doctrine is shared; it does not create a distinct observable outcome.

