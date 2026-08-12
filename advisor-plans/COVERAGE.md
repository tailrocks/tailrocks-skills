# Coverage Ledger — Deterministic Goal Acceptance

Fifth-pass bidirectional coverage authority. Every outcome names its owners;
every plan owns at least one outcome and one unique capability. Outcomes are
derived from the user goal — predictable planning that yields a predictable AI
result — and from proven repository defects only. Speculative outcomes were
removed with their machinery; the record is in
[RESEARCH.md](RESEARCH.md#fifth-adversarial-pass).

## Outcome requirements

| ID | Required outcome | Source anchor | Owners | Observable acceptance evidence |
|---|---|---|---|---|
| O2 | Budget exhaustion or executor narrative can never satisfy a goal condition. | `goal-handoff.md:109-115` (defect) | 000, 002 | `Or stop after` absent from success blocks; BLOCKED rule present; script has no narrative input |
| O3 | Package acceptance is a deterministic function of the committed tree. | user goal; F5-03 | 002 | goal-check.sh scenario tests: PASS and every BLOCKED reason |
| O4 | Weakening gates, plans, or the checker after generation is visible and blocking. | F4-08 (oracle provenance), F5-03 | 002 | frozen-package fingerprint changes; tampered GOAL.md/checker fixtures yield `BLOCKED plan-drift` |
| O5 | Resume and truth-sync rerun the same deterministic check instead of trusting prior claims. | `tailrocks-reconcile/SKILL.md:29-50` | 003 | reconcile invokes goal-check.sh first; protocol runs it before DONE |
| O6 | Client capability claims match current, locally verified behavior; no unproven native control. | RESEARCH "Current provider evidence" | 000, 003 | Grok native claim removed; dated client table with trust labels |

## Guardrails

| ID | Must NOT | Owning plans |
|---|---|---|
| M1 | A majority, score, or average produces a pass over a concrete failure. | 002 |
| M2 | Budget exhaustion appears in any success predicate. | 000, 002, 003 |
| M3 | Any verdict source other than the script on a clean committed tree; the script never mutates the repository. | 002, 003 |
| M4 | A client capability claim without current local-version evidence and observation date. | 000, 003 |
| M5 | Artifacts nobody reads: prose stays lean, the template stays one small file, no new reference files. | 000, 002, 003 |
| M6 | Credentials or environment values enter fixtures, evidence, or script output. | 002 |

## Plan reverse mapping

| Plan | Covers | Depends on | Unique delivered capability |
|---|---|---|---|
| 000 | O2, O6 | — | gate-first prose condition; exhaustion = BLOCKED |
| 002 | O2, O3, O4 | 000 | deterministic per-package goal-check script and non-circular frozen-file fingerprint |
| 003 | O5, O6 | 002 | client wiring and reconcile integration, honestly labeled |

## Dependency edges

```text
002 <- 000
003 <- 002
```

3 plans, 2 hard edges, trivially acyclic and transitively reduced. Each plan is
one ordinary feature-branch PR per `AGENTS.md`; the set is small enough to land
as one PR if the maintainer prefers — sequencing, not delivery ceremony, is
the constraint.

## Completeness checks

- Active outcomes O2-O6 each anchor to the user goal or a cited repository defect; no outcome
  anchors to machinery removed by the fifth pass.
- M1-M6 ownership matches each plan's Must NOT section.
- Every plan owns at least one outcome and one unique capability; no orphans.
- Every plan step has an executable Verify with an expected result; every
  precondition is runnable verbatim — no placeholder values exist in any plan.
- Trust labels form the closed set `advisory_prose`, `deterministic_local`,
  `pr_reviewed` (human PR review plus CI on the merged tree); no plan claims a
  stronger label than its mechanism provides.
