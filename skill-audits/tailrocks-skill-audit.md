# Skill audit: tailrocks-skill-audit

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: REF 1, EVAL 3
- Topology: KEEP one read-only report responsibility at one/all scale

## Description

None.

## Router

None.

## References

### REF-1 — Finding identity reconciliation is a manual decidable transform

- **Defect:** Tuple normalization, structural comparison, monotonic allocation, and retired-ID protection are exact rules left to the model.
- **Evidence:** skills/tailrocks-skill-audit/references/report-format.md:47-63.
- **Fix:** add a deterministic report identity/ID reconciler; semantic audit supplies tuple fields only.
- **Dimensions:** contract, predictability, efficiency.
- **Identity tuple:** references; deterministic work in software; manual stable-ID transform; audit reports; report-format identity rules.
- **Action:** validator.
- **Acceptance:** tests preserve IDs across whitespace/line movement, allocate above historical maximum, and reject duplicates/reuse.

## Evals

### EVAL-1 — Routing oracle predates current authoring boundaries

- **Defect:** Case 3 routes every finding to refactor, while current router distinguishes semantic update, behavior-preserving refactor, and contract-breaking migration.
- **Evidence:** skills/tailrocks-skill-audit/evals/evals.json:23-27 and SKILL.md:84-94.
- **Fix:** add action-discriminating cases.
- **Dimensions:** contract, behavior, topology.
- **Identity tuple:** evals; oracle matches route; blanket refactor handoff; skill audit; case 3.
- **Action:** update.
- **Acceptance:** semantic→update, preserved topology→refactor, contract delta→migration plan/no execution.

### EVAL-2 — Seeded fixtures contain unasserted dangling references

- **Defect:** Audit fixtures link absent references, but expected findings omit those defects while requiring complete layer reporting.
- **Evidence:** skills/tailrocks-skill-audit/evals/fixtures/1/skills/acme-deploy/SKILL.md:17-22 and fixtures/2/skills/beta/SKILL.md:14-18.
- **Fix:** add intended files or assert dangling-reference findings; add fixture preflight validation.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; fixture truth; omitted broken references; skill audit; planted fixtures.
- **Action:** update.
- **Acceptance:** unresolved local references fail preflight or appear in expected findings.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated results, runtime lock, or report mutation/tool trace exists.
- **Evidence:** skills/tailrocks-skill-audit/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate one/all audit paths under the pinned suite with deterministic ID checks.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; skill audit; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke reports contain exact planted findings, killed traps, stable IDs, and no audited-surface mutation.

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

- Split one versus all — killed: same report authority/schema/oracle; only scale changes.

