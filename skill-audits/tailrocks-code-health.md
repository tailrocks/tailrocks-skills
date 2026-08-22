# Skill audit: tailrocks-code-health

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 2, WIRE 1
- Topology: SPLIT read-only audit from ratchet establishment/tightening

## Description

None.

## Router

### RTR-1 — Audit and ratchet mutation share one skill

- **Defect:** Audit measures read-only; establish/tighten create or lower executable bounds.
- **Evidence:** skills/tailrocks-code-health/SKILL.md:31-35.
- **Fix:** keep code-health for one selected ratchet mutation; create code-health-audit for measurement.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; audit versus establish/tighten; code health ratchet; Select the mode.
- **Action:** refactor.
- **Acceptance:** audit cannot mutate and ratchet changes require explicit scope.

## References

### REF-1 — Release-age policy contradicts the house frontend contract

- **Defect:** Code health recommends minimum release age while TanStack setup forbids it.
- **Evidence:** skills/tailrocks-code-health/references/versions-and-dependencies.md:27-29 and skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md:5-10.
- **Fix:** canonicalize the house no-minimum-age rule; vulnerability fixes remain immediate highest-fixed updates.
- **Dimensions:** contract, predictability, security.
- **Identity tuple:** references; one canonical dependency rule; contradictory release age; dependency policy; Versions and Dependencies/Freshness.
- **Action:** update.
- **Acceptance:** no shipped reference recommends a minimum release age for house frontend dependencies.

## Evals

### EVAL-1 — Tighten lacks a normal case

- **Defect:** Existing cases do not prove lowering an established bound.
- **Evidence:** skills/tailrocks-code-health/evals/evals.json:4-25.
- **Fix:** add a ratchet fixture with measurable before/after bounds.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; branch coverage; tighten missing; code health ratchet; eval set.
- **Action:** update.
- **Acceptance:** bound decreases, old/new debt is counted, and no unlisted debt appears.

### EVAL-2 — Reliability is unmeasured

- **Defect:** Fixtures are adequate but no persisted control, repeated trial, mutation result, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-code-health/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate both resulting owners with the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent result envelope; code health; eval infrastructure.
- **Action:** validator.
- **Acceptance:** source-hash-bound control and non-certifying 3/3 smoke candidate evidence exists.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits audit/establish/tighten syntax.
- **Evidence:** skills/tailrocks-code-health/SKILL.md:1-8.
- **Fix:** add hints and enforce them during split.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; code health; frontmatter.
- **Action:** validator.
- **Acceptance:** clients show exclusive read/write owners.

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

- Split each debt class into a skill — killed: provider lanes create the same one-ratchet artifact/oracle and are branch-loaded.

