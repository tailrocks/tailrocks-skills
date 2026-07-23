# Goal Live Status Specification

## Capability index

- [Status board](status-board.md) — S1, S2, F1–F4, W1, B1–B3.

## Design constraints and evidence

- D1: implementation is a Rust CLI/TUI; plans 001–003 preserve that boundary.
- D2: snapshots are read-only; N1 enforces this in plans 002–003.
- R1: atomic rename, schema-version, and gate evidence comes from
  `research/goal-status-ipc/01-status-sources.md`.
- A1: snapshot storage is local. If remote transport becomes required, stop
  and route the falsified assumption through the roadmap decision flow.

## Must-not registry

| ID | Statement | Reason | Enforced in plans |
|---|---|---|---|
| N1 | Viewer MUST NOT mutate executor state | observer boundary | 002,003 |
| N2 | Viewer MUST NOT infer progress from liveness | liveness is not progress | 002,003 |

## Deferrals

- Q1 remote authentication — deferred until a security model is selected.
