# macOS Application

- **Status**: READY
- **Slug**: macos-application
- **Created**: 2026-07-23
- **Plan**: — (`plan/` once planned) · **Verified**: — (`verification/` once run)

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

- **Design**: prototype sign-off — `design/session-list/SIGNOFF.md`, blessed
  2026-08-14 on the running prototype.

### Session detail

```text
┌ Session: api ───────────────────┐
│ status: active                  │
│ [Open] [Stop]                   │
└─────────────────────────────────┘
```

- **Design**: prototype sign-off — `design/session-detail/SIGNOFF.md`, blessed
  2026-08-14 on the running prototype.

## Flows

- Choose project → choose session → inspect detail → open session.

## Data & integrations

- Read session metadata through the existing CLI boundary.

## References

- Existing CLI/TUI behavior: `crates/session-cli/src/main.rs`.

## Research

- `research/macos-native-shell/README.md`
- `research/session-cli-boundary/README.md`
- `research/verification-tooling/README.md`
- `research/macos-accessibility/README.md`

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

## Remaining
