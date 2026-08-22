# Skill audit: tailrocks-macos-design

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, REF 1, EVAL 2
- Topology: SPLIT independent review and systematization; keep design/prototype/blessing atomic

## Description

None.

## Router

### RTR-1 — Review and systematize are independent responsibilities

- **Defect:** Design/prototype produces and blesses a live target; review is read-only independent judgment; systematize mutates different owning artifacts.
- **Evidence:** skills/tailrocks-macos-design/SKILL.md:30-43.
- **Fix:** keep design + prototype + blessing; create tailrocks-macos-design-review and tailrocks-macos-design-systematize.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; separate output/authority/oracle; design-prototype-review-systematize; macOS design; Modes.
- **Action:** refactor.
- **Acceptance:** creator cannot issue the independent review verdict and system mutation has its own explicit scope.

### RTR-2 — Design path scores its own output

- **Defect:** The design workflow scores its own candidate although the rubric requires a different reviewer.
- **Evidence:** skills/tailrocks-macos-design/SKILL.md:86-96 and skills/tailrocks-macos-design/references/rubric.md:25,94.
- **Fix:** route scoring to the new fresh-context review owner and record reviewer identity.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** router; independent oracle; self-review conflict; macOS design acceptance; Design step 4.
- **Action:** refactor.
- **Acceptance:** the authoring subject cannot author the acceptance verdict.

## References

### REF-1 — Reference corpus carries stale screenshot timing

- **Defect:** Design doctrine forbids capture before finalization, while the corpus requires saved screenshots during approval decisions.
- **Evidence:** skills/tailrocks-macos-design/references/reference-corpus.md:107,138 and SKILL.md design/blessing boundary.
- **Fix:** require live-rendered inspection during design; saved baseline captures belong only to visual-baseline after blessing.
- **Dimensions:** contract, predictability.
- **Identity tuple:** references; canonical design pipeline; contradictory capture timing; macOS blessing; reference corpus approval sections.
- **Action:** update.
- **Acceptance:** no design-stage instruction demands a screenshot baseline.

## Evals

### EVAL-1 — Systematize lacks an adequate normal fixture

- **Defect:** Cases do not provide approved-screen/review inputs sufficient to prove repository-owned promotion.
- **Evidence:** skills/tailrocks-macos-design/evals/evals.json:29 and its staged files.
- **Fix:** add a complete approved package and separate review/systematize cases.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch fixture adequacy; systematize ungrounded; macOS design system; eval case.
- **Action:** update.
- **Acceptance:** only accepted decisions move to exact owning artifacts.

### EVAL-2 — Reliability is unmeasured

- **Defect:** Twenty-one authored cases have no persisted baseline, repeated results, runtime lock, or tool/capture evidence.
- **Evidence:** skills/tailrocks-macos-design/evals/evals.json; mise.toml:51-53; scripts/run-evals.ts:37-115.
- **Fix:** evaluate resulting owners with the pinned macOS workflow runner and complete package loading.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results and truncated context; macOS design; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound non-certifying 3/3 smoke evidence includes reviewer separation and live-render receipts.

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

- Split design from prototype/blessing — killed: Liquid Glass’s authoritative material exists only in the running runtime transaction.
