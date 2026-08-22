# Skill audit: tailrocks-axum-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, WIRE 1
- Topology: SPLIT build, review, and behavior-preserving refactor

## Description

None.

## Router

### RTR-1 — Build, review, and refactor cross authority/oracle boundaries

- **Defect:** Review is read-only; build creates behavior; refactor must preserve behavior.
- **Evidence:** skills/tailrocks-axum-best-practices/SKILL.md:24-26.
- **Fix:** keep best-practices for build; create tailrocks-axum-review and tailrocks-axum-refactor.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; one responsibility; build-review-refactor selector; Axum adapter policy; Select the mode.
- **Action:** refactor.
- **Acceptance:** each resulting skill has one authority and one observable outcome.

## References

None.

## Evals

### EVAL-1 — Build has no normal case

- **Defect:** Cases prove review/refactor behavior but not approved adapter construction.
- **Evidence:** skills/tailrocks-axum-best-practices/evals/evals.json:4-35.
- **Fix:** add fixture-backed normal/boundary/refusal cases to each resulting owner.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; public branch coverage; build missing; Axum build; eval case set.
- **Action:** update.
- **Acceptance:** build case proves typed boundary, allowed mutation, and transport contract tests.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No stored baseline, repeated run, mutation evidence, runtime lock, or tool trace exists.
- **Evidence:** skills/tailrocks-axum-best-practices/evals/evals.json; mise.toml:51-53; scripts/run-evals.ts:458-525.
- **Fix:** evaluate each new owner with the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; Axum practices; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate records are source-hash bound and externally checked.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits its invocation selector.
- **Evidence:** skills/tailrocks-axum-best-practices/SKILL.md:1-8.
- **Fix:** add hints and enforce them in validation.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; Axum practices; frontmatter.
- **Action:** validator.
- **Acceptance:** each new skill has complete client metadata and lint passes.

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

- Axum/GraphQL overlap — killed: GraphQL consumes the HTTP adapter while retaining an exclusive public API contract.

