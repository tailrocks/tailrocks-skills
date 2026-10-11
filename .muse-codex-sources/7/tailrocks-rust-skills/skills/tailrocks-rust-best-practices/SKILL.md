---
name: tailrocks-rust-best-practices
description: >-
  Apply Rust correctness contracts when in-scope work writes Rust behavior. Covers ownership, failure, unsafe, tests, and performance. Use tailrocks-rust-review for findings and tailrocks-rust-refactor for behavior-preserving restructuring.
argument-hint: "<Rust writing task or target>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User adds or changes Rust behavior in authorized work.
---

# Rust Best Practices

## Use this skill

This skill writes Rust whose invariants, failure, ownership, and cost stay
visible. It governs new and changed Rust behavior.

Use this skill when the task adds or changes Rust behavior. Do not use this
skill for workspace setup, read-only findings, or behavior-preserving
restructuring. Workspace setup belongs to `tailrocks-rust-project-setup`.
Findings belong to `tailrocks-rust-review`. Behavior-preserving
restructuring belongs to `tailrocks-rust-refactor`.

## Before you start

Obey the active user request first. Stronger compatible local conventions
win over this skill. Selection supplies policy only. Mutation authority
comes from the active task.

Before any action, read `references/runtime-trust.md`. Cite secret
locations and types without copying values.

The skill accepts one argument: the Rust writing task or target. Without an
explicit behavior and mutation scope, stop and ask.

## Procedure

1. **Confirm the selector.** Continue only when the task adds or changes
   Rust behavior. If the request seeks findings without mutation, refuse it
   and name `tailrocks-rust-review`. If the request seeks
   behavior-preserving restructuring, refuse it and name
   `tailrocks-rust-refactor`. This step is complete when new behavior and
   mutation scope are explicit.
2. **Map the contract.** Inspect the smallest relevant manifests, feature
   flags, public boundaries, nearby implementation, tests, documentation,
   and lint policy. This step is complete when affected APIs, invariants,
   ownership flow, expected failures, and compatibility constraints are
   explicit.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   | --- | --- |
   | Borrowing, cloning, allocation, dispatch, shared state, performance | [`ownership-performance.md`](references/ownership-performance.md) |
   | Public APIs, traits, naming, constructors, type-state, compatibility | [`api-design.md`](references/api-design.md) |
   | Errors, panics, tests, doc tests, comments, rustdoc | [`errors-testing-docs.md`](references/errors-testing-docs.md) |
   | Layout, imports, control flow, naming, module boundaries | [`readability-style-architecture.md`](references/readability-style-architecture.md) |
   | Clippy findings, suppression, profiling | [`tooling-lints.md`](references/tooling-lints.md) |

   This step is complete when local policy or one loaded reference covers
   every material design decision.
4. **Design before patching.** Prefer types that make invalid states
   unrepresentable. Use `Result` for recoverable failure. Borrow where
   ownership is unnecessary. State explicit boundary costs. Treat each
   clone, allocation, panic, unsafe block, public dependency, re-export,
   and broad generic as a deliberate commitment. This step is complete when
   the shape explains why ownership, failure, and compatibility sit at
   their chosen boundaries.
5. **Implement the narrow behavior.** Keep API changes, dependency
   additions, and unrelated restructuring in separate changes. Place tests
   at stable behavioral boundaries. Document public errors, panics, and
   safety contracts. This step is complete when changed paths preserve
   invariants without warning-silencing or borrow-checker appeasement
   clones.
6. **Validate proportionately.** Prefer existing `mise run` tasks. Default
   to `cargo fmt --check`, strict workspace Clippy with `-D warnings`,
   nextest, and doctests. Adjust the default only for documented exclusions
   or custom runners. This step is complete when each applicable gate has a
   pass, failure, unavailability, or explicit reason it did not run.
7. **Report the change.** State the convention used, validation outcomes,
   and residual API, testing, unsafe, or performance risk. This step is
   complete when no performance claim exceeds measurement and no residual
   risk stays hidden.

## Result

The working tree holds the narrow behavior change. The report states the
convention used, validation outcomes, and residual risks. No performance
claim exceeds measurement.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The change accounts for every modified public contract, expected
  failure, unsafe operation, allocation-sensitive path, and test boundary.
- No performance claim exceeds measurement.
- No residual risk stays hidden.
- Each justified local exception uses the narrow suppression mechanism of
  the repository and explains why design cannot remove it.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/ownership-performance.md` in steps 2 and 4 for
  borrowing, cloning, allocation, dispatch, shared state, and performance.
- Read `references/api-design.md` in steps 2 and 4 for public APIs,
  traits, naming, constructors, type-state, and compatibility.
- Read `references/errors-testing-docs.md` in steps 2 and 5 for errors,
  panics, tests, doctests, comments, and rustdoc.
- Read `references/readability-style-architecture.md` in steps 2 and 5 for
  layout, imports, control flow, naming, and module boundaries.
- Read `references/tooling-lints.md` in step 6 for Clippy findings,
  suppression, and profiling.
