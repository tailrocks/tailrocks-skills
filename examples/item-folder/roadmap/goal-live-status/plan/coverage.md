# Coverage Ledger — goal-live-status

Item: `roadmap/goal-live-status/README.md`, ingested 2026-07-23.

## Screens

| ID | Screen | Item anchor | Spec | Plans | Status |
|---|---|---|---|---|---|
| S1 | Run list | §Screens/Run list | spec/status-board.md | 002,003 | covered |
| S2 | Run detail | §Screens/Run detail | spec/status-board.md | 003 | covered |

## Capabilities

| ID | Capability | Spec | Plans | Status |
|---|---|---|---|---|
| F1 | List runs | status-board.md | 002,003 | covered |
| F2 | Show current slice/state | status-board.md | 002,003 | covered |
| F3 | Refresh snapshot | status-board.md | 002,003 | covered |
| F4 | Explain stale/corrupt data | status-board.md | 002,003 | covered |

## Flows

| ID | Flow | Spec | Plans | Status |
|---|---|---|---|---|
| W1 | List → detail → return | status-board.md | 003 | covered |

## Must-not anchors

| ID | Statement | Registry |
|---|---|---|
| N1 | Never mutate executor state | spec/README.md |
| N2 | Never infer progress from liveness | spec/README.md |

## Quality bar

| ID | Statement anchor | Spec scenario(s) | Status |
|---|---|---|---|
| B1 | Valid snapshot ≤250 ms | Valid snapshot loads | covered |
| B2 | Corruption preserves last valid view | Corrupt refresh | covered |
| B3 | Keyboard reachable | Keyboard navigation | covered |

## Decisions

| ID | Decision | Constrains |
|---|---|---|
| D1 | Rust CLI/TUI | all plans |
| D2 | Read-only snapshots | 002,003 |

## External references

| ID | Reference | Research |
|---|---|---|
| R1 | Atomic rename/schema/gates | goal-status-ipc/01 |

## Assumptions

| ID | Assumption | Why safe | Falsified by |
|---|---|---|---|
| A1 | Snapshot directory is local | local-only scope | remote requirement appears |

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | Remote authentication | deferred (security model required) |
