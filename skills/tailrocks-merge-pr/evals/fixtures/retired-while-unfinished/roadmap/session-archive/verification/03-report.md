# Verification round 3 — session-archive

Executed 2026-08-16 against commit `c22b7e5` on a clean build.

## Blocking

- **B1 — Reopening an archived session shows an empty transcript.** Archive,
  reopen, and the transcript pane renders zero rows. Reproduced 3/3 from a
  fresh launch; the store writes the transcript path and the reader reads a
  field nothing assigns.
- **B2 — The archived-only filter returns every session.** Selecting
  "Archived" lists live sessions too.

## Non-blocking

- The archive confirmation sheet has no cancel affordance.

## Cleared this round

- Round 2's "archive button disabled for owned sessions" no longer reproduces.
