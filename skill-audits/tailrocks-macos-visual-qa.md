# Skill audit: tailrocks-macos-visual-qa

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, EVAL 2
- Topology: SPLIT judgment, baseline freeze, and regression; move harness mechanics to code

## Description

None.

## Router

### RTR-1 — Verify, harness installation, baseline, and regression have separate outputs

- **Defect:** Current modes mix read-only judgment, project mutation, baseline mutation, and comparison.
- **Evidence:** skills/tailrocks-macos-visual-qa/SKILL.md:33-47 and its freeze ownership statement.
- **Fix:** keep visual-qa for drive/judgment; create macos-visual-baseline and macos-visual-regression; make harness installation a typed script.
- **Dimensions:** contract, predictability, topology, security.
- **Identity tuple:** router; separate authority/output; verify-harness-freeze-regress; macOS visual evidence; Modes/Where this sits.
- **Action:** refactor.
- **Acceptance:** each resulting owner has one artifact/oracle and harness mutation is explicit.

### RTR-2 — Shipped harness fails open or targets ambiguously

- **Defect:** Multiple matched windows warn then select first; app-path regex can target unrelated processes; appearance state restoration is incomplete; accessibility audit scope is not enforced by the template.
- **Evidence:** skills/tailrocks-macos-visual-qa/templates/window-id.swift:88-106, skills/tailrocks-macos-visual-qa/templates/capture.sh:23-39, skills/tailrocks-macos-visual-qa/templates/state.sh:25-42, skills/tailrocks-macos-visual-qa/templates/AuditTests.swift:9, skills/tailrocks-macos-visual-qa/references/interaction.md:62.
- **Fix:** exact executable-PID matching, ambiguity failure, transactional appearance/Auto restore, and scoped audit filtering in scripts/macos-visual-qa.ts.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; fail-closed deterministic tooling; ambiguous capture/process/state; macOS QA harness; shipped templates.
- **Action:** update.
- **Acceptance:** decoy process survives; two windows yield no capture; all settings restore exactly; system-owned issues do not fail app scope.

## References

None.

## Evals

### EVAL-1 — GUI claims lack runnable app fixtures

- **Defect:** Cases expect launch, capture, accessibility, and restoration outcomes without an executable app/workflow harness.
- **Evidence:** skills/tailrocks-macos-visual-qa/evals/evals.json:5-38 and scripts/run-evals.ts:370-399.
- **Fix:** add a macOS workflow runner, decoy apps/windows, and state restoration assertions.
- **Dimensions:** behavior, predictability, security.
- **Identity tuple:** evals; fixture capability adequacy; GUI claims unexecutable; macOS visual QA; case set.
- **Action:** validator.
- **Acceptance:** every claimed capture/tool/state transition has a machine event and receipt.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted repeated runs, mutation results, runtime lock, or tool traces exist.
- **Evidence:** skills/tailrocks-macos-visual-qa/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each owner under the pinned macOS suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent result envelope; macOS visual QA; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound non-certifying 3/3 smoke results include capture digests and exact restore proof.

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

- Treat pixel regression as design judgment — killed: it detects change only; visual QA retains semantic judgment.
