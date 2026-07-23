# Status Board

## Purpose

Render executor-owned snapshots without controlling or guessing executor state.

### Requirement: Parse versioned snapshots
The core MUST parse supported snapshot envelopes and reject unsupported versions.
Covers: F2, F3, N1 · Evidence: example://snapshot-schema

#### Scenario: Valid snapshot loads
- **GIVEN** a supported complete snapshot
- **WHEN** the reader loads it
- **THEN** typed run and slice state is returned within 250 ms

### Requirement: Preserve the last valid view
The core MUST preserve the last valid state when a refresh is corrupt.
Covers: F4, B2 · Evidence: example://rust-atomic-rename

#### Scenario: Corrupt refresh
- **GIVEN** one valid snapshot was rendered
- **WHEN** the next snapshot is truncated
- **THEN** the prior view remains and an actionable error is shown

### Requirement: Render run navigation
The TUI SHALL list runs newest-first and open a selected run's detail.
Covers: S1, S2, F1, W1 · Evidence: roadmap §Screens

#### Scenario: Navigate list and detail
- **GIVEN** two runs exist
- **WHEN** the user selects one and presses Enter
- **THEN** its current slice, state, and update age appear

### Requirement: Support keyboard operation
The TUI MUST expose every primary action through documented keys.
Covers: B3, W1 · Evidence: roadmap §Quality bar

#### Scenario: Keyboard navigation
- **GIVEN** the run list has focus
- **WHEN** the user navigates, opens detail, and returns using keys
- **THEN** every primary action completes without pointer input

## Screen: Run list (S1)

- Regions: title, runs, help.
- States: loading, populated, empty, error.
- Navigation: Enter → Run detail.

## Screen: Run detail (S2)

- Regions: identity, status, current slice, update age.
- States: valid, stale, corrupt-refresh warning.
- Navigation: Escape → Run list.
