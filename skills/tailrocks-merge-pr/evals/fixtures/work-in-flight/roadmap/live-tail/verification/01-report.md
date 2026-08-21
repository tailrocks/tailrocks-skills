# Verification round 1 — live-tail

Executed 2026-08-20 against commit `a7e2f18` on a clean build.

## Blocking

- **B1 — Resuming a paused tail drops the buffered output.** Pause for ten
  seconds, resume, and the lines produced while paused never render.

## Non-blocking

- The follow indicator does not animate.

## Cleared this round

- Nothing to clear; this is the first round.
