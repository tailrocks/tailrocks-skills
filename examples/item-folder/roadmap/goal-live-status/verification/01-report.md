# Verification round 01

- **Item**: roadmap/goal-live-status/README.md
- **Branch**: roadmap/goal-live-status · **Built from**: `example00c`
- **Run**: 2026-07-29
- **Answers**: `verification/01-feedback.md`
- **Environment**: the live executor status directory, four runs, one killed ·
  macOS 26.6, Ghostty 120×40

Every plan row is DONE and `goal/check.sh` returns `PASS`. This round started
the built binary against a real status directory anyway, because neither of
those proves the board tells an operator the truth.

## Reported statements

| ID | Reported | Verdict | Evidence |
|----|----------|---------|----------|
| U1 | A killed run kept reading as `active` in the list | CONFIRMED | B1 |
| U2 | The list reorders on refresh and loses the selected row | REFUTED | selection held on `docs` across 20 refreshes; the movement is newest-first ordering (F1) |

## Blocking defects

### B1 — a run whose snapshot stopped advancing still reads as active

- **Command**: `cargo run -p status-tui -- --dir ./.goal/status`, executor for
  run `docs` killed with `SIGKILL` at 14:02
- **Exit**: 0 (still running) · **Duration**: row unchanged for 11 minutes
- **Decisive line**: `● docs     002/003  active` — rendered at 14:13, eleven
  minutes after the last snapshot write
- **Artifact**: `verification/01-runlist-1413.txt`
- **Cause**: `crates/status-tui/src/list.rs:88` renders `run.state` directly;
  the staleness comparison against `updated_at` exists only in the detail view
  at `detail.rs:41`
- **Instead of**: the item's must-not on inferring progress from liveness, and
  F4 — "explain stale snapshots without guessing progress". The list infers
  "still active" from the absence of news.

## Contract drift

- **Run list (S1)** — the blessed frame in `crates/status-gallery/MANIFEST.md
  §Run list`, blessed 2026-07-23, carries a `stale` glyph and word on a row
  whose snapshot aged out. The shipped list has neither: present in the
  reference and absent in the implementation.

## Proof defects

| Criterion or gate | Verdict | Decisive line |
|---|---|---|
| — | — | none this round; both gates proved their counts (312 test cases, 14 clippy targets) |

## What holds up

- The typed reader: unsupported versions, truncated JSON, and duplicate IDs all
  returned their typed errors, and `last_valid()` stayed pointer-identical
  across every failed refresh (`Arc::ptr_eq` asserted in-session).
- Keyboard-only operation (B3): list → detail → return completed with no
  pointer input, and the frames matched the blessed goldens for both screens.
- The 250 ms bound (B1 in the ledger): 41 ms worst case over 20 timed refreshes
  of a 100-run directory.

## Recommended order

1. B1 — the list's staleness signal. Nothing else is gated on it, and it is the
   only blocking defect this round found.

Whether newest-first ordering should freeze while a row is selected is a
product question for `tailrocks-record-decision`, not a verification finding.
Recorded here so a later round does not re-file it as U2.

## Not executed

| Surface | Obstacle | Claims left unproven |
|---|---|---|
| Corrupt-refresh warning on the detail screen | no way to truncate a snapshot mid-write against the live executor | that the warning appears while the prior view survives, outside the unit tests |
