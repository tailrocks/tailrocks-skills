# macOS Application

Status: READY

## Decisions

- 2026-08-20 — Replace the mutable JSON snapshot with a Rust-owned append-only session event log. The Swift shell never reads storage. Perform a one-time atomic import from the legacy JSON snapshot; retain its backup until Rust reopens the new log and imported session IDs/count match the legacy snapshot. Plans 004 and 007 are STALE.

## Plan

- `plans/macos-application/README.md`

## Log

- Package planned.
- Storage decision recorded; plans 004 and 007 marked STALE.
