# TUI Dashboard

Status: SHAPING

## Intent

Give the CLI a live dashboard so a long run can be watched without tailing logs.

## Vocabulary

- Run: one execution of the CLI's pipeline.
- Lane: a parallel worker inside a run.

## Decisions

- 2026-08-12 — Terminal-first, because the operators live in a terminal already.

## Capabilities

- Show every lane's live status in one frame.
- Show a lane's last error without leaving the dashboard.
- Sort lanes by elapsed time.

## Screens

### Run overview

```text
┌ Run 8f21 ──────────────┬ Lanes ─────────┐
│ elapsed 00:04:11       │ ● build   0:41 │
│ 3 running · 1 failed   │ ✗ test    1:02 │
└────────────────────────┴────────────────┘
```

- **Purpose**: watch a run without tailing logs.
- **States**: default / empty (no run) / loading / error (run unreachable).
- **Design**: —

### Lane detail

```text
┌ Lane: test ────────────────────────────┐
│ exit 101 · 1:02                        │
│ last error: assertion failed at ...    │
└────────────────────────────────────────┘
```

- **Purpose**: read a failing lane's last error in place.
- **States**: default / empty (no output yet) / error.
- **Design**: —

## Flows

- Watch run overview → select failing lane → read last error → return.

## Data & integrations

- Run state comes from the existing in-process supervisor; no new storage.

## References

- `crates/cli/` — the binary this dashboard ships inside.

## Research

## Must not

- MUST NOT introduce a second UI framework — the stack is ratatui with crossterm.

## Quality bar

An operator can tell, in one frame, which lanes are alive and which failed.

## Open questions

## Open research questions

## Deferred

## Log

- 2026-08-12 — tailrocks-brainstorm — SHAPING. Screens carry schematic mockups and
  states; no design reference has been produced yet.
