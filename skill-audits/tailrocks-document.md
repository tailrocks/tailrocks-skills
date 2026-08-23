# Skill audit: tailrocks-document

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: EVAL 2, OVL 1
- Topology: KEEP one final documentation truth pass; --check is dry-run of same oracle

## Description

None.

## Router

None.

## References

None.

## Evals

### EVAL-1 — Every case lacks repository/PR documentation fixtures

- **Defect:** Expected outputs depend on docs surfaces, diffs, commits, and PR history while files arrays are empty.
- **Evidence:** skills/tailrocks-document/evals/evals.json:4-32.
- **Fix:** add complete repositories with owned docs rules, behavior diffs, stale prose, and non-doc-worthy traps.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture adequacy; empty documentation cases; document; all cases.
- **Action:** update.
- **Acceptance:** every asserted rewrite/no-op derives from staged repo evidence and exact merge base.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No stored baseline, repetitions, runtime lock, mutation manifests, or tool traces exist.
- **Evidence:** skills/tailrocks-document/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate mutation and --check paths with the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; document; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke candidate results prove exact docs changes/no-op and final commit ordering.

## Wiring

None.

## Overlap

### OVL-1 — Final-order predicate conflicts with merge

- **Defect:** This skill and merge assign different truth to the same later-docs history.
- **Evidence:** skills/tailrocks-document/SKILL.md:101 and skills/tailrocks-merge-pr/SKILL.md:91-102.
- **Fix:** consume one deterministic shared ordering predicate.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** overlap; shared predicate; documentation ordering contradiction; document/merge; final gate.
- **Action:** refactor.
- **Acceptance:** same history yields same gate result in both skills.

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

- Split --check — killed: it is a non-mutating projection of the same documentation oracle.

