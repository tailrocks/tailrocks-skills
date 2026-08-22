# Skill audit: tailrocks-skill-update

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 2
- Topology: KEEP fixed-contract semantic updates; repair sibling ownership and eval authorship

## Description

None.

## Router

### RTR-1 — Scope broadening is checked only inside the target skill

- **Defect:** The topology predicate examines target plus requested delta but does not inventory sibling responsibility owners, so a rule already owned elsewhere can be duplicated silently.
- **Evidence:** skills/tailrocks-skill-update/SKILL.md:38-58.
- **Fix:** inventory sibling descriptions/responsibility records before mutation; route to existing owner or refactor/migration.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; exclusive responsibility; missing sibling-owner check; skill update; steps 2-3.
- **Action:** update.
- **Acceptance:** a two-skill overlap fixture leaves the target unchanged and names the unique owner/route.

## References

### REF-1 — Router paraphrases canonical doctrine

- **Defect:** Topology, context-layer, budget, signposting, and testing rules are restated in the router.
- **Evidence:** skills/tailrocks-skill-update/SKILL.md:43-65 and skills/tailrocks-skill-audit/references/house-wiring.md:39-46.
- **Fix:** move shared doctrine to repository-owned references and retain update-specific operations only.
- **Dimensions:** efficiency, predictability.
- **Identity tuple:** references; canonical doctrine; duplicated authoring rules; skill update; steps 2-4.
- **Action:** refactor.
- **Acceptance:** exact pointers load canonical doctrine and no paraphrase competes.

## Evals

### EVAL-1 — Update excludes required regression edits

- **Defect:** It preserves frozen evidence by leaving eval artifacts untouched, while router changes require full-set updates.
- **Evidence:** skills/tailrocks-skill-update/SKILL.md:60-65 and skills/tailrocks-skill-audit/references/house-wiring.md:83-97.
- **Fix:** author affected and full regression case changes before prose; skill-evaluate owns execution.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; behavioral edits require eval edits; explicit exclusion; skill update; step 4.
- **Action:** update.
- **Acceptance:** every semantic change includes discriminating case changes without running the local harness.

### EVAL-2 — Update outcome is not empirically measured

- **Defect:** Current cases lack target mutation fixtures and persisted baseline/repeated/tool evidence.
- **Evidence:** skills/tailrocks-skill-update/evals/evals.json; mise.toml:51-53.
- **Fix:** add behavior-delta and sibling-owner fixtures; evaluate under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; fixture/repeated evidence; absent update result; skill update; eval set.
- **Action:** validator.
- **Acceptance:** control fails for the claimed reason and non-certifying 3/3 smoke candidate runs change only allowed skill/eval/generated surfaces.

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

- Merge update and refactor — killed: semantic behavior change and behavior-preserving topology have different oracles.
