# Goal Live Status

- **Status**: IN EXECUTION
- **Slug**: goal-live-status
- **Created**: 2026-07-21
- **Plan**: [`plan/`](plan/README.md) · **Verified**:
  [`verification/01-report.md`](verification/01-report.md)

## Intent

Show operators what a `/goal` loop is doing without opening its transcript.

When this ships, an operator watching a long loop knows which run is moving,
which slice it is on, and how old that claim is — without reading a transcript
and without the viewer being able to touch the executor.

## Vocabulary

- **Run**: one bounded `/goal` execution. _Avoid_: "job", "session".
- **Slice**: one manifest plan row. _Avoid_: "task", "step".

## Decisions

- 2026-07-23 — **Rust CLI/TUI**. Because the house stack and the operator's
  terminal workflow are fixed.
- 2026-07-23 — **Read status snapshots; never control the executor**. Because a
  viewer that can write is a second writer to state one process owns.

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

- **Purpose**: one line per run, newest first, at a glance.
- **States**: loading / populated / empty / error.
- **Key interactions**: ↑↓ moves selection — Enter opens Run detail.
- **Design**: `crates/status-gallery/MANIFEST.md §Run list`, blessed
  2026-07-23 (tailrocks-tui-design golden frames).

### Run detail

```text
┌ docs / 002 ─────────────────────┐
│ state: active · updated 3s ago  │
│ next: 003-render-status         │
└─────────────────────────────────┘
```

- **Purpose**: the selected run's current slice, state, and update age.
- **States**: valid / stale / corrupt-refresh warning.
- **Key interactions**: Escape returns to Run list.
- **Design**: `crates/status-gallery/MANIFEST.md §Run detail`, blessed
  2026-07-23 (tailrocks-tui-design golden frames).

## Flows

- Open list → select run → inspect slice and update age → return.

## Data & integrations

- Read versioned JSON snapshots from the executor-owned status directory.

## References

- Existing Rust CLI workspace conventions.

## Research

- [`research/goal-status-ipc/`](../../research/goal-status-ipc/README.md) —
  how the executor publishes status, and what a reader may assume about it.

## Must not

- MUST NOT mutate executor state — the executor is the single writer.
- MUST NOT infer progress from process liveness — liveness is not progress.

## Quality bar

- A valid snapshot appears within 250 ms.
- A corrupt snapshot shows an actionable error and preserves the last valid view.
- Every primary action is keyboard reachable.

## Open questions

## Open research questions

## Deferred

- Remote status transport — local-only until a security model exists.

## Remaining

- The run list still presents a run whose snapshot has stopped advancing as
  `active`, with no staleness signal on the row (round 01 `B1`, answering `U1`;
  S1, F4, and the blessed frame for §Run list).

## Run

Start execution:

```text
Follow roadmap/goal-live-status/goal/START.md
```

Resume after any interruption:

```text
Follow roadmap/goal-live-status/goal/RESUME.md
```
