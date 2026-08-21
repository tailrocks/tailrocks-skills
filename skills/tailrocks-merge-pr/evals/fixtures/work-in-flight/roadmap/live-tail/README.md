# Live Tail

- **Status**: IN EXECUTION
- **Slug**: live-tail
- **Created**: 2026-08-03
- **Plan**: `plan/` · **Verified**: `verification/`

## Intent

Stream a running agent's output into the app without polling.

## Capabilities

- Follow a running session's output as it is produced.
- Pause and resume following without losing buffered output.

## Quality bar

- Output appears within 200 ms of the agent producing it.

## Remaining

- Pausing the tail and resuming replays the buffered output (round 1,
  blocking).
- Plan 003 (backpressure) reaches a terminal status.
