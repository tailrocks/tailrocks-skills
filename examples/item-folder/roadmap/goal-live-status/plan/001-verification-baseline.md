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
| Tests | `mise run test` | all pass, JUnit report written |
| Lint | `mise run lint` | exit 0 |

Evidence: example://workspace-gates.

The goal gate in `roadmap/goal-live-status/goal/START.md` proves each command
executed work rather than exiting 0 on nothing, so this slice owes it two
countable outputs: `mise run test` writes
`target/nextest/ci/junit.xml`, and `mise run lint` runs clippy over every
workspace target.

## Scope

In: `Cargo.toml`, `mise.toml`, `rust-toolchain.toml`, `.config/nextest.toml`,
`crates/status-core/**`, `crates/status-tui/**`.
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
3. Point the test task at a nextest `ci` profile that writes a JUnit report to
   `target/nextest/ci/junit.xml`, and give each empty crate one real unit test
   so the report is non-empty.
   Verify: `grep -c '<testcase' target/nextest/ci/junit.xml` prints a number
   above 0 after `mise run test`.

## Test plan

Run empty-crate unit tests and Clippy through committed mise tasks, and read
the JUnit report the test task wrote rather than its exit code alone.

## Done criteria

- [ ] `mise run check`, `mise run test`, and `mise run lint` exit 0.
- [ ] Both proof expressions in `goal/START.md`'s gates block print a count
      above 0 against this workspace.
- [ ] No files outside Scope changed, excluding protocol writes.
- [ ] Hub row updated.

## STOP conditions

- Required stable toolchain unavailable.
- A gate requires feature code from later plans.

## Maintenance notes

Every later command depends on these task names, and the goal gate depends on
the JUnit report path. Moving either is a re-plan, not an edit.
