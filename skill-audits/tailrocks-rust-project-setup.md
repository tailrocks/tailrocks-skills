# Skill audit: tailrocks-rust-project-setup

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 1, EVAL 2, WIRE 1
- Topology: SPLIT into scaffold, audit, and approved remediation owners

## Description

None.

## Router

### RTR-1 — Scaffold, audit, and remediation cross authority boundaries

- **Defect:** The three modes have separate triggers, outputs, mutation authority, and failure paths.
- **Evidence:** skills/tailrocks-rust-project-setup/SKILL.md:28-34.
- **Fix:** keep tailrocks-rust-project-setup for scaffold; create tailrocks-rust-project-audit and tailrocks-rust-project-remediate; share ecosystem references without copying them.
- **Dimensions:** contract, predictability, topology, security.
- **Identity tuple:** router; one independently invokable responsibility; scaffold/audit/remediate umbrella; Rust workspace baseline; SKILL.md Modes.
- **Action:** refactor.
- **Acceptance:** each resulting description routes exclusively and no router branches between read-only and write authority.

## References

None.

## Evals

### EVAL-1 — Remediation has no successful normal case

- **Defect:** Cases cover audit, scaffold, and prerelease refusal but no approved remediation outcome.
- **Evidence:** skills/tailrocks-rust-project-setup/evals/evals.json:4-23.
- **Fix:** after the split, add normal, boundary, and refusal cases for each owner, including a deliberate non-finding audit trap.
- **Dimensions:** behavior, predictability.
- **Identity tuple:** evals; every public branch needs an oracle; remediation untested; Rust baseline remediation; eval case set.
- **Action:** update.
- **Acceptance:** an approved gap fixture is changed only at allowed paths and all declared gates are observed.

### EVAL-2 — Reliability is unmeasured

- **Defect:** Authored cases have no stored baseline, repeated run, mutation result, runtime lock, or tool trace.
- **Evidence:** skills/tailrocks-rust-project-setup/evals/evals.json; mise.toml:51-53; scripts/run-evals.ts:458-525.
- **Fix:** run the replacement pinned non-protected deterministic reliability
  suite directly through repository gates; no evaluation product route exists.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated discriminating evidence; no persisted results; Rust project setup; eval runner output path.
- **Action:** validator.
- **Acceptance:** source-hash-bound control and non-certifying 3/3 smoke candidate evidence exists with stable claims and state/tool assertions.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter exposes no invocation shape for its three public modes.
- **Evidence:** skills/tailrocks-rust-project-setup/SKILL.md:1-8.
- **Fix:** add a concise hint and extend validation to require one for public selectors.
- **Dimensions:** contract, portability, predictability.
- **Identity tuple:** wiring; mode target metadata; missing argument-hint; Rust project setup; frontmatter.
- **Action:** validator.
- **Acceptance:** generated client metadata shows the invocation shape and lint rejects recurrence.

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

- Split workspace layout from toolchain/lints — killed: they form one scaffold baseline transaction.
- Rust code-policy overlap — killed: rust-best-practices owns code semantics, not workspace mechanics.
