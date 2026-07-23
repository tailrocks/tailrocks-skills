# Plan 002: Parse status snapshots safely

## Status

- Priority: P1
- Effort: M
- Risk: MED
- Depends on: 001
- Covers: F2–F4, B1–B2
- Guardrails: N1, N2
- Planned at: `example001`, 2026-07-23

## Why this matters

A typed reader removes the enabling condition for guessed or partial state.

## Preconditions

- `mise run check` → exit 0 and both skeleton crates compile.

## Spec contract

### Requirement: Parse versioned snapshots
The core MUST parse supported snapshot envelopes and reject unsupported versions.

#### Scenario: Valid snapshot loads
- **GIVEN** a supported complete snapshot
- **WHEN** the reader loads it
- **THEN** typed state is returned within 250 ms

### Requirement: Preserve the last valid view
The core MUST preserve the last valid state when a refresh is corrupt.

#### Scenario: Corrupt refresh
- **GIVEN** one valid snapshot was rendered
- **WHEN** the next snapshot is truncated
- **THEN** prior state remains with an actionable error

## Must NOT

- N1: viewer MUST NOT mutate executor state.
- N2: viewer MUST NOT infer progress from liveness.

## Inputs to provide

None — schema version 1 is inlined here.

## Starting state

Plan 001 created `status-core`; no parser exists. Snapshot envelope:
`{"version":1,"runs":[{"id":"docs","slice":"002","state":"active"}]}`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Core tests | `mise run test --package status-core` | all pass |
| Lint | `mise run lint` | exit 0 |

Evidence: example://workspace-gates.

## Scope

In: `crates/status-core/src/**`, `crates/status-core/tests/**`.
Out: terminal rendering (003), executor writer, remote transport.

## Git workflow

Use the integration feature branch. Commit this logical slice with a
Conventional Commit and DCO signoff; do not push without operator instruction.

## Steps

1. Add closed enums and versioned serde DTOs; reject unknown versions.
   Verify: parser unit tests pass.
2. Add a reader that swaps cached state only after complete validation.
   Verify: truncated/unknown-version tests preserve prior state.
3. Add a deterministic small-fixture timing bound.
   Verify: local fixture loads within 250 ms.

## Test plan

Independent fixtures: valid v1, unknown v2, truncated JSON, empty runs.

## Done criteria

- [ ] All four fixtures have tests and pass.
- [ ] `mise run lint` exits 0.
- [ ] No files outside Scope changed, excluding protocol writes.
- [ ] Hub row updated.

## STOP conditions

- Plan 001 gates fail.
- A1 is falsified by a remote-transport requirement.
- Correct parsing requires changing executor output.

## Maintenance notes

Add schema versions without widening unknown values into strings.
