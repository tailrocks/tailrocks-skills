# macOS Application plan hub

| Plan | Status | Scope |
|---|---|---|
| 001 | DONE | baseline |
| 004 | STALE | session storage |
| 007 | STALE | session migration |

## Change log

- 2026-08-20 — Rust-owned append-only event log replaces mutable JSON; 004 and
  007 are STALE pending atomic one-time import and Rust reopen plus imported
  session IDs/count verification before backup removal.
