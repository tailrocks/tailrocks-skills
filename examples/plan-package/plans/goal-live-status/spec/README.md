# Goal Live Status Specification

## Capability index

- [Status board](status-board.md) — S1, S2, F1–F4, W1, B1–B3.

## Must-not registry

| ID | Statement | Reason | Enforced in plans |
|---|---|---|---|
| N1 | Viewer MUST NOT mutate executor state | observer boundary | 002,003 |
| N2 | Viewer MUST NOT infer progress from liveness | liveness is not progress | 002,003 |

## Deferrals

- Q1 remote authentication — deferred until a security model is selected.
