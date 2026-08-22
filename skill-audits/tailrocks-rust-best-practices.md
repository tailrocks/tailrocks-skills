# Skill audit: tailrocks-rust-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, WIRE 1
- Topology: SPLIT write, review, and behavior-preserving refactor

## Description

None.

## Router

### RTR-1 — Write, review, and refactor are independent jobs

- **Defect:** Review is read-only while write/refactor mutate, and refactor has a preservation oracle distinct from new behavior.
- **Evidence:** skills/tailrocks-rust-best-practices/SKILL.md:22-26.
- **Fix:** keep best-practices for writing; create tailrocks-rust-review and tailrocks-rust-refactor.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; independent authority/oracle; write-review-refactor selector; Rust code policy; Select the mode.
- **Action:** refactor.
- **Acceptance:** one trigger and one oracle per resulting skill; shared Rust references remain canonical.

## References

None.

## Evals

### EVAL-1 — Write behavior has no normal case

- **Defect:** The suite exercises review/refactor but not approved code creation.
- **Evidence:** skills/tailrocks-rust-best-practices/evals/evals.json:4-35.
- **Fix:** add a write fixture and branch-specific cases after topology migration.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; exposed branch coverage; write missing; Rust code authoring; eval case set.
- **Action:** update.
- **Acceptance:** a write case proves allowed changes and surrounding-contract preservation.

### EVAL-2 — Reliability is unmeasured

- **Defect:** One recorded non-certifying 3/3 smoke case is not a complete pinned portfolio result; no baseline, mutation set, runtime lock, or tool trace exists for the full skill.
- **Evidence:** docs/design/eval-runner-design.md:69; skills/tailrocks-rust-best-practices/evals/evals.json; mise.toml:51-53.
- **Fix:** run the replacement pinned non-protected deterministic reliability
  suite directly through repository gates; no evaluation product route exists.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated discriminating evidence; partial historical sample only; Rust best practices; eval evidence.
- **Action:** validator.
- **Acceptance:** every resulting owner has control and non-certifying 3/3 smoke candidate evidence with exact runtime/tool/checker pins.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter does not expose review/write/refactor invocation shape.
- **Evidence:** skills/tailrocks-rust-best-practices/SKILL.md:1-8.
- **Fix:** add the hint and validator rule during split wiring.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; mode target metadata; missing argument-hint; Rust best practices; frontmatter.
- **Action:** validator.
- **Acceptance:** lint proves each resulting skill’s invocation metadata.

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

- Split each Rust topic into a skill — killed: topics are branch-loaded references under one language contract, not independent user outcomes.
