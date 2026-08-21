# Verification round 3 — session-sync

Executed 2026-08-19 against commit `b71e0c4` on a clean build.

## Blocking

- **Archiving loses the transcript.** Archiving a session and reopening it
  shows an empty transcript pane. Reproduced 3/3 from a fresh launch.
- **Filter keeps archived sessions.** Selecting a project lists sessions
  already archived; the archived-only filter returns everything.

## Non-blocking

- The empty state's copy still says "no sessions yet" while loading.

## Cleared this round

- Round 2's "live refresh stops after sleep" no longer reproduces.
