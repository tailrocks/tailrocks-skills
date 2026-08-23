# Skill audit: tailrocks-rethink

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 1, OVL 1
- Topology: MERGE into root-cause and remediate; retire this name

## Description

None after merge.

## Router

### RTR-1 — Audit and rebuild cross authority boundaries

- **Defect:** Audit is read-only conceptual design; rebuild implements breaking changes and may require irreversible approval.
- **Evidence:** skills/tailrocks-rethink/SKILL.md:37-46,101-106.
- **Fix:** route audit to root-cause and rebuild to remediate under explicit compatibility/irreversibility contract fields.
- **Dimensions:** contract, predictability, topology, security.
- **Identity tuple:** router; separate authority; audit versus rebuild; structural redesign; Modes/step 8.
- **Action:** refactor.
- **Acceptance:** old invocations map exactly once and destructive approval remains explicit.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** Adequate authored cases have no stored baseline, repetitions, mutation evidence, runtime lock, or traces.
- **Evidence:** skills/tailrocks-rethink/evals/evals.json; mise.toml:51-53.
- **Fix:** port discriminating cases into root-cause/remediate and evaluate them.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; repeated evidence; absent results; rethink migration; eval infrastructure.
- **Action:** validator.
- **Acceptance:** migrated trigger matrix and non-certifying 3/3 smoke behavior evidence prove no lost journey.

## Wiring

None until migration; then remove all catalog/client/docs entries after compatibility window.

## Overlap

### OVL-1 — Remediate already owns the responsibility

- **Defect:** Reported symptom → failed guarantee → causal design → authorized structural correction duplicates remediate.
- **Evidence:** skills/tailrocks-rethink/SKILL.md:4-5,37-46 and skills/tailrocks-remediate/SKILL.md:4-5,28-33.
- **Fix:** merge as described; do not preserve rival names permanently.
- **Dimensions:** contract, efficiency, topology.
- **Identity tuple:** overlap; one owner; duplicate redesign flow; rethink/remediate; descriptions.
- **Action:** delete.
- **Acceptance:** activation evals choose one owner for all prior near-miss prompts.

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

- Keep rethink for breaking changes — killed: breaking posture belongs in the approved correction contract and migration path.

