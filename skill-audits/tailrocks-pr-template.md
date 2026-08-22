# Skill audit: tailrocks-pr-template

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2
- Topology: KEEP one repository PR-template derivation/reconciliation

## Description

None.

## Router

### RTR-1 — Existing alternate template path conflicts with sole write target

- **Defect:** Write boundary promises only .github/PULL_REQUEST_TEMPLATE.md while later rule says an alternate existing template is updated.
- **Evidence:** skills/tailrocks-pr-template/SKILL.md:68,75.
- **Fix:** resolve and update the existing canonical path, or require explicit migration choice before creating the house path.
- **Dimensions:** contract, predictability.
- **Identity tuple:** router; one write target; alternate path contradiction; PR template; write/existing-template rules.
- **Action:** update.
- **Acceptance:** fixture with only docs/PULL_REQUEST_TEMPLATE.md never silently creates a duplicate.

## References

None.

## Evals

### EVAL-1 — Alternate/update case lacks an existing template fixture

- **Defect:** The case cannot prove which existing path is reconciled.
- **Evidence:** skills/tailrocks-pr-template/evals/evals.json:14 and staged files.
- **Fix:** add alternate-path, existing-standard, and no-template fixtures.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture adequacy; missing existing template; PR template; case 2.
- **Action:** update.
- **Acceptance:** each path decision and resulting single file is mechanically asserted.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetitions, mutation manifest, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-pr-template/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; PR template; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate results prove one earned template and no placeholder commands.

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

- Merge with create PR — killed: repository template authoring and opening a specific PR have separate outputs/oracles.

