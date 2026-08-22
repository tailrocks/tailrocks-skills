# Skill audit: tailrocks-skill-create

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 2
- Topology: KEEP one atomic creation transaction; repair ordering and eval authorship

## Description

None.

## Router

### RTR-1 — Rejected placement can leave durable partial evidence

- **Defect:** Evidence is written before placement decides the request belongs to a gate, instruction, or existing skill; creation doctrine says evidence through wiring is invalid partial output.
- **Evidence:** skills/tailrocks-skill-create/SKILL.md:32-52 and skills/tailrocks-skill-audit/references/design-doctrine.md:101-104.
- **Fix:** decide placement before durable write, or stage evidence privately and publish it atomically only after skill placement accepts.
- **Dimensions:** contract, predictability.
- **Identity tuple:** router; atomic transaction; rejected placement leaves evidence file; skill creation; steps 1-2.
- **Action:** update.
- **Acceptance:** gate/instruction/existing-owner rejection leaves git diff empty and no skill-evidence file.

## References

### REF-1 — Router paraphrases canonical authoring doctrine

- **Defect:** The router repeats context-layer, testing, description, and wiring doctrine rather than carrying task-specific operations plus when-to-read pointers.
- **Evidence:** skills/tailrocks-skill-create/SKILL.md:54-105 and skills/tailrocks-skill-audit/references/house-wiring.md:39-46.
- **Fix:** move shared doctrine to repository-owned skill-authoring/references and trim this router to create-specific sequencing.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** references; canonical authoring doctrine; paraphrased shared rules; skill create; steps 3-5.
- **Action:** refactor.
- **Acceptance:** no doctrine summary remains; eval loader and validator resolve only allowlisted canonical references.

## Evals

### EVAL-1 — Create forbids the eval artifacts it must author

- **Defect:** It freezes case intent but explicitly leaves eval files untouched, conflicting with house wiring’s complete created skill surface.
- **Evidence:** skills/tailrocks-skill-create/SKILL.md:71-96 and skills/tailrocks-skill-audit/references/house-wiring.md:83-97.
- **Fix:** create non-placeholder normal, boundary, refusal, activation, and mutation cases; only execution belongs to skill-evaluate/CI.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; create must author cases; eval artifact exclusion; skill creation; step 4.
- **Action:** update.
- **Acceptance:** a created skill includes complete case files before validation and no harness execution is inferred.

### EVAL-2 — Creation cases cannot prove created artifacts

- **Defect:** Current cases provide no target repository fixture and assert no produced skill surface; no persisted repeated evidence exists.
- **Evidence:** skills/tailrocks-skill-create/evals/evals.json:4-20; mise.toml:51-53.
- **Fix:** add target-policy fixtures and evaluate the full transaction under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; fixture/output adequacy; no created artifact oracle; skill create; eval set.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke cases prove exact allowed files, collision refusal, complete wiring, and no partial output.

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

- Split evidence/scaffold/wiring — killed: after placement acceptance they form one invalid-to-partialize create transaction.
