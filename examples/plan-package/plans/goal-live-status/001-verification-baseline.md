# Plan 001: Establish the verification baseline

## Status

- Priority: P1
- Effort: S
- Risk: LOW
- Depends on: none
- Planned at: `example001`, 2026-07-23

## Why this matters

Later plans may only cite gates that already exist. This slice creates a green
empty Rust workspace before feature code.

## Preconditions

- `test ! -e Cargo.toml` → exit 0 in this greenfield example.

## Spec contract

Tooling-only prerequisite; no product requirement.

## Must NOT

- N1: viewer MUST NOT mutate executor state.
- N2: viewer MUST NOT infer progress from liveness.

## Inputs to provide

None — fully self-contained.

## Starting state

No workspace exists. House baseline uses Rust 2024, resolver 3, and mise.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Build | `mise run check` | exit 0 |
| Tests | `mise run test` | all pass |
| Lint | `mise run lint` | exit 0 |

Evidence: example://workspace-gates.

## Scope

In: `Cargo.toml`, `mise.toml`, `rust-toolchain.toml`, `crates/status-core/**`,
`crates/status-tui/**`.
Out: snapshot parsing and UI behavior (plans 002/003).

## Git workflow

Use the integration feature branch. Commit this logical slice with a
Conventional Commit and DCO signoff; do not push without operator instruction.

## Steps

1. Create the two-crate edition-2024 resolver-3 skeleton.
   Verify: `mise run check` exits 0.
2. Add deterministic check/test/lint tasks and resolve exact stable
   `serde`, `serde_json`, and RFC-3339-capable `time` workspace pins for plan
   002.
   Verify: all three commands above exit 0.

## Test plan

Run empty-crate unit tests and Clippy through committed mise tasks.

## Done criteria

- [ ] `mise run check`, `mise run test`, and `mise run lint` exit 0.
- [ ] No files outside Scope changed, excluding protocol writes.
- [ ] Hub row updated.

## STOP conditions

- Required stable toolchain unavailable.
- A gate requires feature code from later plans.

## Maintenance notes

Every later command depends on these task names.
