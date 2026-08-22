# Skill audit: tailrocks-web-visual-qa

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, EVAL 1
- Topology: SPLIT baseline freeze and regression; move harness installation to code

## Description

None.

## Router

### RTR-1 — Harness, freeze, and regression cross authority/output boundaries

- **Defect:** Harness and freeze mutate different artifacts; regression is read-only on sources/baselines.
- **Evidence:** skills/tailrocks-web-visual-qa/SKILL.md:32-47.
- **Fix:** create web-visual-baseline and web-visual-regression; move deterministic setup/capture mechanics to scripts/web-visual-qa.ts.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; separate authority/output; harness-freeze-regress; web visual baseline; Modes.
- **Action:** refactor.
- **Acceptance:** baseline writes and drift reports have exclusive owners; no implicit mutation.

### RTR-2 — Server reuse can capture the wrong application

- **Defect:** reuseExistingServer may attach to stale/unprotected port 3000 despite required design-route environment.
- **Evidence:** skills/tailrocks-web-visual-qa/templates/playwright.config.ts:22-33.
- **Fix:** disable reuse or require an owned revision/guard endpoint before capture.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; deterministic precondition; reused unknown server; web capture; Playwright webServer.
- **Action:** update.
- **Acceptance:** an unrelated server causes deterministic failure and never produces a baseline.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** No persisted baseline/control result, repeated trials, browser trace, runtime lock, or mutation evidence exists.
- **Evidence:** skills/tailrocks-web-visual-qa/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate both owners under a pinned browser workflow suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; web visual QA; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results record owned server revision, screenshot digest, and allowed baseline mutation.

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

- Merge design and visual baseline — killed: user blessing and screenshot freeze have different triggers/authority and existing exclusive descriptions.

