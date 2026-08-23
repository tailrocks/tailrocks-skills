# Skill audit: tailrocks-improve

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, REF 1, EVAL 2, OVL 1
- Topology: SPLIT into improve, improve-deep, improve-security, improve-plan, improve-execution, improve-reconcile; add seed-roadmap and retire tailrocks-audit

## Description

None.

## Router

### RTR-1 — Audit, direct planning, and backlog reconciliation are independent jobs

- **Defect:** Default/quick/deep/focus audit, plan-without-audit, and reconcile-existing-plans have distinct triggers and outputs; current audit family additionally owns execution and roadmap seeding.
- **Evidence:** skills/tailrocks-improve/SKILL.md:23-34,88-142 and skills/tailrocks-audit/SKILL.md:28-53,145-178.
- **Fix:** apply the exact improve family in portfolio-responsibility-map.md; route delivery seeding separately.
- **Dimensions:** contract, predictability, efficiency, topology.
- **Identity tuple:** router; one responsibility; audit/plan/reconcile umbrella; repository improvement; Modes.
- **Action:** refactor.
- **Acceptance:** each requested improve command has one output/oracle and all old modes map exactly once.

## References

### REF-1 — Ranking rules conflict

- **Defect:** Router prioritizes correctness/consistency/goal fit independent of effort, while audit-playbook ranks impact divided by effort.
- **Evidence:** skills/tailrocks-improve/SKILL.md:70-75 and skills/tailrocks-improve/references/audit-playbook.md:61-72.
- **Fix:** make one canonical correctness-first rubric; effort remains metadata, never a reason to accept known wrongness.
- **Dimensions:** contract, predictability.
- **Identity tuple:** references; one decision rule; conflicting rank formula; improve findings; ranking sections.
- **Action:** update.
- **Acceptance:** a known correctness defect outranks a cheaper cosmetic item regardless of effort.

## Evals

### EVAL-1 — Main case cannot execute its claimed workflow

- **Defect:** It requires npm gates and subagent fanout; staged files omit the declared test target and the runner permits neither npm nor subagents.
- **Evidence:** skills/tailrocks-improve/evals/evals.json:5-13, skills/tailrocks-improve/evals/fixtures/1/package.json:5-8, scripts/run-evals.ts:370-399.
- **Fix:** provide valid workflow fixtures/capabilities or narrow the oracle; use the workflow runner for multi-agent cases.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; fixture/tool adequacy; impossible audit workflow; improve; case 1.
- **Action:** validator.
- **Acceptance:** both declared gates execute non-vacuously and fanout/tool events are observed.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated result, runtime lock, mutation evidence, or tool trace exists.
- **Evidence:** skills/tailrocks-improve/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each new improve owner under the pinned suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent result envelope; improve family; eval infrastructure.
- **Action:** validator.
- **Acceptance:** each owner has control and non-certifying 3/3 smoke candidate evidence with exact pins.

## Wiring

None.

## Overlap

### OVL-1 — tailrocks-audit duplicates repository improvement ownership

- **Defect:** Both perform recon, parallel lanes, evidence vetting, ranking, and planning.
- **Evidence:** skills/tailrocks-improve/SKILL.md:38-98 and skills/tailrocks-audit/SKILL.md:59-143.
- **Fix:** improve owns audit; seed-roadmap owns delivery destination; retire audit after route migration.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** overlap; exclusive audit owner; duplicate repository audit; improve/audit; workflows.
- **Action:** refactor.
- **Acceptance:** one authored audit rubric and no competing trigger remains.

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

- Keep quick as a public skill — killed: it is the bounded default policy, not a different outcome.
