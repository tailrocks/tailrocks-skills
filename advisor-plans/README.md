# Active advisor plans

Completed plans are deleted after their work lands. This directory contains
only active plans and the research/coverage needed to execute them.

## Execution order

| Plan | Title | Depends on | Status |
|---|---|---|---|
| [000](000-goal-condition-hardening.md) | Gate-first goal condition; exhaustion is BLOCKED | — | DONE |
| [002](002-package-goal-check.md) | Deterministic per-package goal check | 000 | DONE |
| [003](003-client-wiring-and-reconcile.md) | Client wiring and reconcile integration | 002 | DONE |

Start a plan only after every dependency is DONE. Read the complete plan first,
run its preconditions and every Verify command, and honor STOP conditions
literally. Use a feature branch, `rtk` where available, Conventional Commits,
and `git commit -s`. Never record credentials or environment values in plan
artifacts.

Status values: TODO | IN PROGRESS | DONE | BLOCKED (reason) | REJECTED (reason).

Supporting evidence:

- [COVERAGE.md](COVERAGE.md) — active requirements and ownership.
- [RESEARCH.md](RESEARCH.md) — fifth-pass architecture and falsification record.
