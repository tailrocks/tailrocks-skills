# Delivery report — Goal Live Status

- **Slug**: goal-live-status · **Status**: IN EXECUTION
- **Last verified**: 2026-07-24 at `example002` (round 01)

## Proven

- The typed reader rejects unsupported versions, truncated JSON, and duplicate
  IDs with typed errors, and `last_valid()` stays pointer-identical across a
  failed refresh — verified 2026-07-24 at `example002` (round 01, holds up).
- Keyboard-only operation: list → detail → return with no pointer input,
  frames matching the blessed goldens for both screens — verified 2026-07-24
  at `example002` (round 01, holds up).
- A valid snapshot appears within 250 ms: 41 ms worst case over 20 timed
  refreshes of a 100-run directory — verified 2026-07-24 at `example002`
  (round 01, holds up).

## Not proven

- Staleness signaling on a run whose snapshot has stopped advancing — open as
  round 01 `B1`; see the item's Remaining.
