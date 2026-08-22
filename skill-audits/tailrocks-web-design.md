# Skill audit: tailrocks-web-design

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, WIRE 1
- Topology: SPLIT design/blessing from read-only audit

## Description

None.

## Router

### RTR-1 — Design and audit cross mutation authority

- **Defect:** Design creates production view artifacts; audit is independently invokable and read-only.
- **Evidence:** skills/tailrocks-web-design/SKILL.md:39-43.
- **Fix:** keep web-design for routes/blessing; create tailrocks-web-design-audit.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; design versus audit; web design routes; Modes.
- **Action:** refactor.
- **Acceptance:** audit cannot edit and design has one live blessing outcome.

## References

None.

## Evals

### EVAL-1 — Boundary oracle asks for forbidden loader/data writes

- **Defect:** A case expects application logic that the router excludes from design mode.
- **Evidence:** skills/tailrocks-web-design/evals/evals.json:45 and SKILL.md:21-24.
- **Fix:** make the expected output stop at typed fixtures/view artifacts and route loader work elsewhere.
- **Dimensions:** contract, behavior.
- **Identity tuple:** evals; oracle must match authority; loader mutation expected; web design boundary; case 7.
- **Action:** update.
- **Acceptance:** no design case expects loaders, server functions, or screenshot baseline writes.

### EVAL-2 — Reliability is unmeasured

- **Defect:** No persisted baseline, repetition, mutation evidence, runtime lock, or browser trace exists.
- **Evidence:** skills/tailrocks-web-design/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate design and audit owners with the pinned browser-capable suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent results; web design; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke candidate results include route render and zero forbidden mutations.

## Wiring

### WIRE-1 — OpenAI prompt assigns screenshot freezing to web design

- **Defect:** Client metadata instructs the skill to freeze Playwright baselines, owned by visual QA and forbidden by the router.
- **Evidence:** skills/tailrocks-web-design/agents/openai.yaml:2-4 and SKILL.md:21-24.
- **Fix:** end the prompt at blessing and hand off to web-visual-baseline.
- **Dimensions:** contract, portability, predictability.
- **Identity tuple:** wiring; client prompt matches router; screenshot ownership drift; web design; openai default prompt.
- **Action:** update.
- **Acceptance:** all client prompts preserve the same design-only boundary.

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

- Split route creation from blessing — killed: blessing is the terminal oracle for the same live component artifact.

