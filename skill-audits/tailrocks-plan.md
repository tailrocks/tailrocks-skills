# Skill audit: tailrocks-plan

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, REF 2, EVAL 2, OVL 1
- Topology: KEEP one frozen READY-to-plan/goal transaction; move reusable research writing to research owner

## Description

None.

## Router

### RTR-1 — Gate proof contract contradicts deferred commands

- **Defect:** Final gate requires every command to have run, while plan template permits commands that cannot run until an earlier slice.
- **Evidence:** skills/tailrocks-plan/SKILL.md:192-198 and skills/tailrocks-plan/references/plan-template.md:377-384.
- **Fix:** require every currently runnable command; deferred commands name enabling slice plus executable precondition proof.
- **Dimensions:** contract, predictability.
- **Identity tuple:** router; explicit failure branch; all-run versus deferred contradiction; plan verification; final gate/template.
- **Action:** update.
- **Acceptance:** eval distinguishes runnable, invalid/unresolved, and legitimately dependency-blocked commands.

### RTR-2 — Generated goal template is client-specific

- **Defect:** Shared template names one client permission mode, CLI, and resume syntax.
- **Evidence:** skills/tailrocks-plan/templates/START.md:80-87.
- **Fix:** use host-class-neutral handoff; client launch syntax belongs in client documentation/wiring.
- **Dimensions:** contract, portability.
- **Identity tuple:** router; source-neutral shared skill; client-specific handoff; plan goal package; START template.
- **Action:** update.
- **Acceptance:** portability scan finds no client executable/permission-mode name in shared router/reference/template content.

## References

### REF-1 — Spec requires artifact changelog despite no-log invariant

- **Defect:** Spec format requires a historical change log while delivery contract says artifacts carry current state only and history lives in Git.
- **Evidence:** skills/tailrocks-plan/references/spec-format.md:176-198, skills/tailrocks-idea/references/roadmap-item-format.md:51-55, and delivery-git-contract.md:14-20.
- **Fix:** remove spec changelog and its eval expectations.
- **Dimensions:** contract, efficiency, predictability.
- **Identity tuple:** references; current-state artifact only; required spec changelog; delivery plan; spec history section.
- **Action:** update.
- **Acceptance:** no plan/spec artifact or eval expects a changelog.

### REF-2 — Research procedure is a manual copy

- **Defect:** Plan reference states it must be manually kept matched and plan writes the same durable research topic output as research skill.
- **Evidence:** skills/tailrocks-plan/references/research-shape.md:3-5, SKILL.md:71-83, and skills/tailrocks-research/SKILL.md:68-115.
- **Fix:** plan emits a research-gap manifest and waits/resumes; only research writes/vets/indexes research topics.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** references; one durable artifact owner; copied research procedure; reusable topics; research-shape.
- **Action:** refactor.
- **Acceptance:** no “keep copy matched” rule remains and only research owns topic folders.

## Evals

### EVAL-1 — Workflow/state cases cannot execute or contradict staged state

- **Defect:** Workflow cases intentionally never launch; a SHAPING prompt stages a READY item; planned tool/subagent outcomes exceed runner capabilities.
- **Evidence:** skills/tailrocks-plan/evals/evals.json:14-19, execution_mode workflow cases, shared fixture README.md:3, and scripts/run-evals.ts:446-472.
- **Fix:** implement workflow executor and dedicated state fixtures with exact capability declarations.
- **Dimensions:** contract, behavior, predictability.
- **Identity tuple:** evals; fixture/runner adequacy; dead workflow and state mismatch; plan; eval set.
- **Action:** validator.
- **Acceptance:** workflow cases launch and produce full evidence envelope; prompt and fixture states match.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repeated results, runtime lock, full package context, mutation manifest, or tool trace exists.
- **Evidence:** skills/tailrocks-plan/evals/evals.json; mise.toml:51-53; scripts/run-evals.ts:37-115.
- **Fix:** evaluate the atomic transaction under the pinned workflow suite with complete references/templates.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent/truncated results; plan; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke runs produce checker-valid frozen package/fingerprint with no unowned writes.

## Wiring

None.

## Overlap

### OVL-1 — Research topic ownership competes with tailrocks-research

- **Defect:** Both skills author, vet, and index research topic folders.
- **Evidence:** skills/tailrocks-plan/SKILL.md:71-83 and skills/tailrocks-research/SKILL.md:68-115.
- **Fix:** research is sole owner; plan consumes completed topics.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** overlap; one artifact owner; duplicate research folder writer; plan/research; research steps.
- **Action:** refactor.
- **Acceptance:** exclusive triggers and one writer for research/.

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

- Split spec, plans, and goal package — killed: frozen fingerprint makes partial artifacts invalid.
