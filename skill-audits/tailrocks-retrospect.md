# Skill audit: tailrocks-retrospect

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: REF 1, EVAL 2
- Topology: KEEP one delivered-item field record and patch proposal

## Description

None.

## Router

None.

## References

### REF-1 — Patch-shape enum disagrees across artifacts

- **Defect:** Reference says four legal shapes but enumerates six; template permits only four and omits template-slot and eval-case.
- **Evidence:** skills/tailrocks-retrospect/references/patch-shape.md:8-27 and skills/tailrocks-retrospect/templates/retrospective.md:74-80.
- **Fix:** define one closed six-value enum and generate/validate all consumers.
- **Dimensions:** contract, predictability.
- **Identity tuple:** references; one closed enum; four-versus-six patch shapes; retrospective proposals; patch-shape and template.
- **Action:** update.
- **Acceptance:** router/reference/template/evals expose identical values and invalid values fail.

## Evals

### EVAL-1 — Fixture set cannot establish all normal-path history claims

- **Defect:** Several cases depend on repository/PR history beyond the staged evidence.
- **Evidence:** skills/tailrocks-retrospect/evals/evals.json and its fixture inventory.
- **Fix:** add complete history manifests and preconditions for each binding route.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture adequacy; incomplete delivery history; retrospect; eval fixtures.
- **Action:** update.
- **Acceptance:** every inferred marker and artifact is present or the case fails preflight.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated results, runtime lock, mutation result, or trace exists.
- **Evidence:** skills/tailrocks-retrospect/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate under the pinned history-capable suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; retrospect; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate records bind source/history/runtime hashes.

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

- Split history reconstruction from patch proposal — killed: proposals are the sole output of the same evidence-bound retrospective transaction.
