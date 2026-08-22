# Skill audit: tailrocks-review-pr

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 1
- Topology: KEEP verified read-only review; extract posting to deterministic separately authorized script

## Description

None after removing comment side effect.

## Router

### RTR-1 — Optional posting crosses external-action authority

- **Defect:** Review is read-only by default but --comment posts externally; accepted findings do not themselves authorize that side effect.
- **Evidence:** skills/tailrocks-review-pr/SKILL.md:23,39,53,137-162.
- **Fix:** make review always read-only; scripts/post-pr-review.ts validates stable findings, deduplicates, and posts only under fresh explicit authorization.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** router; external side effect separate; report versus comment posting; PR review; comment mode.
- **Action:** refactor.
- **Acceptance:** review can never post; script requires report schema, PR target, fresh approval, and returns receipts.

## References

### REF-1 — Test-lane predicate conflicts with global finding bar

- **Defect:** Finding bar excludes general/speculative coverage, while specialist lane treats every new business rule without a test as unfinished and reports rated gaps.
- **Evidence:** skills/tailrocks-review-pr/references/finding-bar.md:43 and skills/tailrocks-review-pr/references/specialist-lanes.md:17.
- **Fix:** define one evidence predicate and explicit exemption cases.
- **Dimensions:** contract, predictability.
- **Identity tuple:** references; one finding predicate; conflicting test gap bar; PR review; finding-bar/specialist lane.
- **Action:** update.
- **Acceptance:** a concrete untested boundary reports; percentage/speculative trap is killed.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** Adequate authored cases have no persisted baseline, repetitions, reviewer variance, runtime lock, or tool traces.
- **Evidence:** skills/tailrocks-review-pr/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate report production and posting script separately.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/judgment evidence; absent results; PR review; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke report cases retain only adversarially verified findings; posting tests prove exact deduped receipts.

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

- Split specialist lanes into skills — killed: content-triggered lanes feed one read-only report and share the same finding oracle.
