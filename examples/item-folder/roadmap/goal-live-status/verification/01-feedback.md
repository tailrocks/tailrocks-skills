# Feedback — round 01

- **Item**: roadmap/goal-live-status/README.md
- **Branch**: roadmap/goal-live-status · **At**: `example00c`
- **Reported**: 2026-07-29
- **Verified by**: [`verification/01-report.md`](01-report.md)

## Statements

Each statement is one defect in the user's own words. Verdicts belong to the
report, never here.

### U1 — a dead run kept reading as active

> I killed the docs loop and went to lunch. The list still had it on `active`
> when I came back — same slice, same everything. The detail screen at least
> told me the timestamp was old, but the list just lied to me.

- **Surface**: Run list (S1), row for run `docs`.
- **Reproduction**: start a loop, kill the executor process, leave the viewer
  open, watch the row.
- **Expected instead**: "the row should say it hasn't heard anything, not that
  the run is active".

### U2 — the list reorders under me

> Every time it refreshes the rows jump around and I lose the one I was
> looking at.

- **Surface**: Run list (S1), refresh.
- **Reproduction**: not given.
- **Expected instead**: not given.

## Environment

- **Built from**: roadmap/goal-live-status at `example00c`
- **Data**: the live executor status directory, four runs, one killed
- **Platform**: macOS 26.6, Ghostty, 120×40
