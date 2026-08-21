# Session Sync

- **Status**: IN EXECUTION
- **Slug**: session-sync
- **Created**: 2026-07-30
- **Plan**: `plan/` · **Verified**: `verification/`

## Intent

Keep the macOS session list in step with the CLI's live sessions. Ships when a
user sees every live session, filters it by project, and archives one without
losing its transcript.

## Capabilities

- Show every live session within two seconds of it starting.
- Filter the list by project.
- Archive a session without losing its transcript.

## Quality bar

- No stale row survives a session ending.

## Remaining

- Archiving a session drops its transcript (round 3, blocking).
- Filtering by project still lists archived sessions (round 3, blocking).

## Deferred

—
