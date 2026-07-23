# Goal Live Status

Status: READY
Updated: 2026-07-23

## Intent

Show operators what a `/goal` loop is doing without opening its transcript.

## Vocabulary

- Run: one bounded `/goal` execution.
- Slice: one manifest plan row.

## Decisions

- 2026-07-23 — Rust CLI/TUI because the house stack and terminal workflow are fixed.
- 2026-07-23 — Read status snapshots; never control the executor.

## Capabilities

- List runs newest-first.
- Show each run's current slice and terminal state.
- Refresh from an atomic snapshot.
- Explain stale snapshots without guessing progress.

## Screens

### Run list

```text
┌ Runs ───────────────────────────┐
│ ● docs     002/003  active      │
│ ✓ parser   004/004  done        │
└─────────────────────────────────┘
```

### Run detail

```text
┌ docs / 002 ─────────────────────┐
│ state: active · updated 3s ago  │
│ next: 003-render-status         │
└─────────────────────────────────┘
```

## Flows

- Open list → select run → inspect slice and update age → return.

## Data & integrations

- Read versioned JSON snapshots from the executor-owned status directory.

## References

- Existing Rust CLI workspace conventions.

## Research

- `research/goal-status-ipc/`

## Must not

- The viewer MUST NOT mutate executor state.
- The viewer MUST NOT infer progress from process liveness.

## Quality bar

- A valid snapshot appears within 250 ms.
- A corrupt snapshot shows an actionable error and preserves the last valid view.
- Every primary action is keyboard reachable.

## Open questions

## Open research questions

## Deferred

- Remote status transport — local-only until a security model exists.

## Log

- 2026-07-21 — tailrocks-idea captured DRAFT.
- 2026-07-22 — tailrocks-brainstorm set SHAPING.
- 2026-07-23 — tailrocks-finalize passed readiness and set READY.
