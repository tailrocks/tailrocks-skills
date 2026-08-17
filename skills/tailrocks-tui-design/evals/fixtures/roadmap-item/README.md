# Goal live status board

- **Status**: READY
- **Slug**: goal-live-status

## Intent

Operators watching autonomous goal runs from the terminal see live progress
without tailing logs. Ships when `goalctl status` renders every active run
with its slice progress, updating as snapshots change.

## Decisions

- 2026-07-23 — **Rust CLI/TUI** because the house stack and terminal
  workflow are fixed.
- 2026-07-23 — **Read-only viewer.** The board never writes to the status
  directory.

## Screens

### Status board

```text
┌ Runs ───────────────────────────┐
│ ● docs     002/003  active      │
│ ✓ parser   004/004  done        │
└─────────────────────────────────┘
```

- **Purpose**: every run at a glance with slice progress.
- **States**: default; empty (no runs yet); stale data must be visibly
  flagged.
- **Key interactions**: select run, refresh, quit.

## Must not

- MUST NOT infer progress from executor process liveness — snapshots are
  the only truth.
