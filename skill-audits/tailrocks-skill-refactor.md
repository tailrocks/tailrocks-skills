# Skill audit: tailrocks-skill-refactor

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 2
- Topology: behavior-preserving refactor only; contract deltas stop for direct
  branch/PR migration authority

## Description

None after migration-plan extraction.

## Router

### RTR-1 — Contract-breaking migration handoff is a second responsibility

- **Defect:** Description excludes migration, but a contract delta writes a different durable migration artifact and schema.
- **Evidence:** skills/tailrocks-skill-refactor/SKILL.md:34-50 and skills/tailrocks-skill-refactor/templates/migration-contract.md:1-25.
- **Fix:** refactor only preserves public contracts; a contract delta leaves the
  tree unchanged and names the separately scoped direct migration authority.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; separate output/contract; migration plan inside refactor; skill topology; step 3.
- **Action:** refactor.
- **Acceptance:** contract-delta refactor leaves the tree unchanged and creates
  no artifact, product owner, alias, or route.

## References

### REF-1 — Router paraphrases topology/testing doctrine

- **Defect:** Shared split predicates and composition proof are repeated instead of loaded from canonical repository-owned doctrine.
- **Evidence:** skills/tailrocks-skill-refactor/SKILL.md:34-61 and current authoring doctrine paths.
- **Fix:** retain refactor-specific transaction steps; link canonical topology/testing references.
- **Dimensions:** efficiency, predictability.
- **Identity tuple:** references; canonical doctrine; paraphrased topology/testing; skill refactor; steps 2-4.
- **Action:** refactor.
- **Acceptance:** one authored doctrine source and complete eval-loader support.

## Evals

### EVAL-1 — Entire corpus tests semantic update behavior, not topology

- **Defect:** Cases apply DESC/RTR prose findings that current router routes to update; no split/merge/extract case exists.
- **Evidence:** skills/tailrocks-skill-refactor/evals/evals.json:4-27 and SKILL.md:13-16,77-79.
- **Fix:** replace with realistic split, keep-together, and contract-delta refusal/handoff cases.
- **Dimensions:** contract, behavior, topology.
- **Identity tuple:** evals; cases match responsibility; semantic-update corpus; skill refactor; all cases.
- **Action:** update.
- **Acceptance:** direct targets, composed old journeys, exclusive routing, context reduction, and no orphan/duplicate owner are asserted.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, mutation evidence, runtime lock, or traces exist.
- **Evidence:** skills/tailrocks-skill-refactor/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate refactor and migration owners separately.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/mutation evidence; absent results; skill refactor; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke refactor proves unchanged public contract; migration cases prove approved mapping/rollback.

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

- Merge update/refactor — killed: semantic and topology transformations have different acceptance oracles.
