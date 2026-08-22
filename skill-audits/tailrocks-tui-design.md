# Skill audit: tailrocks-tui-design

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 1
- Topology: SPLIT read-only audit; keep design/bless/golden freeze atomic

## Description

None.

## Router

### RTR-1 — Read-only audit is independent of design/freeze

- **Defect:** Audit produces findings under read-only authority; design produces the application-rendered golden artifact.
- **Evidence:** skills/tailrocks-tui-design/SKILL.md:31-42.
- **Fix:** keep TUI design/bless/freeze; create tailrocks-tui-design-audit.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; authority split; design/freeze versus audit; TUI golden design; Modes.
- **Action:** refactor.
- **Acceptance:** each description routes exclusively and audit never mutates frames.

## References

None.

## Evals

### EVAL-1 — Reliability is unmeasured

- **Defect:** Authored cases have no stored baseline, repeated result, runtime lock, or render/tool trace.
- **Evidence:** skills/tailrocks-tui-design/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate both owners with complete gallery fixtures and pinned tools.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated/tool evidence; absent result envelope; TUI design; eval infrastructure.
- **Action:** validator.
- **Acceptance:** non-certifying 3/3 smoke results prove app-rendered frames and byte-exact golden behavior.

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

- Split design from golden freeze — killed: same renderer, artifact, and byte-exact oracle.

