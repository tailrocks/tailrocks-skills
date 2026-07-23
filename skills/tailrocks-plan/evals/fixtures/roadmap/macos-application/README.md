# macOS Application

Status: READY

## Intent

Add a native macOS companion for the existing CLI/TUI.

## Vocabulary

- Session: one CLI work session.
- Project: directory owning sessions.

## Decisions

- 2026-07-23 — Use a native desktop shell because platform behavior matters.

## Capabilities

- List sessions grouped by project.
- Show live session state.
- Open a selected session.
- Filter sessions by project.

## Screens

### Session list

```text
┌ Projects ─┬ Sessions ───────────┐
│ All       │ ● active   api      │
│ tailrocks │ ○ stopped  docs     │
└───────────┴─────────────────────┘
```

### Session detail

```text
┌ Session: api ───────────────────┐
│ status: active                  │
│ [Open] [Stop]                   │
└─────────────────────────────────┘
```

## Flows

- Choose project → choose session → inspect detail → open session.

## Data & integrations

- Read session metadata through the existing CLI boundary.

## References

- Existing CLI/TUI behavior.

## Research

- `research/pure-rust-macos-ui/`

## Must not

- Do not embed a web renderer for the primary UI.
- Do not bypass the CLI's session ownership.

## Quality bar

- Session state appears within one second of a CLI update.
- Empty and error states remain actionable.
- Keyboard navigation reaches every primary action.

## Open questions

## Open research questions

## Deferred

## Log

- 2026-07-23 — Captured as DRAFT.
- 2026-07-23 — Shaped through brainstorm.
- 2026-07-23 — Final readiness checklist passed; set READY.
