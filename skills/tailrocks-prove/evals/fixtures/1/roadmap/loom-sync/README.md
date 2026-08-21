# Loom Sync

- **Status**: IN EXECUTION
- **Slug**: loom-sync
- **Created**: 2026-07-30
- **Plan**: `plan/` · **Verified**: `verification/` (rounds 01, 02)

## Intent

Sync loom sessions across the desktop app and the CLI so a session started in
one is visible in the other within a minute.

## Vocabulary

- **Session**: one loom recording, live or finished.

## Decisions

- 2026-07-30 — **One projection serves both surfaces**. Because two builders
  drift and the drift is invisible until a user compares them.

## Capabilities

- List sessions in the CLI with their sync state.
- Show the same list in the desktop sidebar.
- Refresh on demand from either surface.

## Screens

### Session list

```text
┌ Sessions ─────────────┐
│ ● live    standup     │
│ ○ synced  retro       │
└───────────────────────┘
```

- **Purpose**: see every session and whether it synced.
- **States**: default / empty / loading / error.
- **Design**: golden frames — `plan/spec/frames/MANIFEST.md`, blessed 2026-08-02.

## Flows

- Start a session in the CLI → it appears in the desktop sidebar within a minute.

## Data & integrations

- Sync state comes from the existing session store; no new storage.

## References

## Research

## Must not

- MUST NOT show a session without its sync state — an unlabelled row reads as
  synced and is the failure this item exists to prevent.

## Quality bar

A user can tell, from either surface, which sessions are synced.

## Open questions

## Open research questions

## Deferred

## Remaining
