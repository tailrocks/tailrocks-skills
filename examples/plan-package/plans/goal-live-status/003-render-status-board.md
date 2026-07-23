# Plan 003: Render the status board

## Status

- Priority: P1
- Effort: M
- Risk: MED
- Depends on: 002
- Covers: S1–S2, F1–F4, W1, B3
- Guardrails: N1, N2
- Planned at: `example001`, 2026-07-23

## Why this matters

The TUI exposes only reader state and preserves a strict observer boundary.

## Preconditions

- `mise run test --package status-core` → parser tests pass.

## Spec contract

### Requirement: Render run navigation
The TUI SHALL list runs newest-first and open a selected run's detail.

#### Scenario: Navigate list and detail
- **GIVEN** two runs exist
- **WHEN** the user selects one and presses Enter
- **THEN** its slice, state, and age appear

### Requirement: Support keyboard operation
The TUI MUST expose every primary action through documented keys.

#### Scenario: Keyboard navigation
- **GIVEN** the run list has focus
- **WHEN** keys navigate, open, and return
- **THEN** no pointer input is required

## Screen contract

Run list: title/runs/help; loading/populated/empty/error; Enter opens detail.
Run detail: identity/state/slice/age; Escape returns.

## Must NOT

- N1: viewer MUST NOT mutate executor state.
- N2: viewer MUST NOT infer progress from liveness.

## Inputs to provide

None — ASCII contracts above are authoritative.

## Starting state

Plan 002 exposes immutable typed snapshots and refresh errors.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| TUI tests | `mise run test --package status-tui` | all pass |
| Full gates | `mise run check && mise run test && mise run lint` | exit 0 |

Evidence: example://workspace-gates.

## Scope

In: `crates/status-tui/src/**`, `crates/status-tui/tests/**`.
Out: parser changes (002), executor control, remote transport.

## Git workflow

Use the integration feature branch. Commit this logical slice with a
Conventional Commit and DCO signoff; do not push without operator instruction.

## Steps

1. Implement newest-first list and explicit empty/error states.
   Verify: snapshot rendering tests pass.
2. Implement detail navigation and stable selection.
   Verify: transition-table tests pass.
3. Bind documented keys and render help.
   Verify: keyboard-only integration scenario passes.

## Test plan

Golden terminal buffers assert regions; transition tests assert navigation
independently from rendering.

## Done criteria

- [ ] Both spec scenarios have passing tests.
- [ ] Full gates exit 0.
- [ ] No files outside Scope changed, excluding protocol writes.
- [ ] Hub row updated.

## STOP conditions

- Plan 002 reader contract differs from Starting state.
- Any action requires writing executor state.

## Maintenance notes

Keep view state separate from executor snapshot state.
