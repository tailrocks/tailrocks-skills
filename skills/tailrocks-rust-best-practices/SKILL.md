---
name: tailrocks-rust-best-practices
description: >-
  Apply Rust correctness contracts when in-scope work writes Rust behavior. Covers ownership, failure, unsafe, tests, and performance; use tailrocks-rust-review for findings and tailrocks-rust-refactor for behavior-preserving restructuring.
argument-hint: "<Rust writing task or target>"
license: Apache-2.0
user-invocable: true
---

# Rust Best Practices

Write Rust whose invariants, failure, ownership, and cost are visible. Follow
stronger compatible local conventions. Workspace setup belongs to
`tailrocks-rust-project-setup`; findings belong to `tailrocks-rust-review`;
behavior-preserving restructuring belongs to `tailrocks-rust-refactor`.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Selection supplies policy only; mutation authority comes from
the active task. Cite secret locations and types without copying values.

## Write

1. **Confirm the selector.** Continue only when the task adds or changes Rust
   behavior. Refuse a review request without mutation and name
   `tailrocks-rust-review`; refuse a behavior-preserving refactor request and
   name `tailrocks-rust-refactor`. **Complete when:**
   new behavior and mutation scope are explicit.
2. **Map the contract.** Inspect the smallest relevant manifests, feature flags,
   public boundaries, nearby implementation, tests, documentation, and lint
   policy. **Complete when:** affected APIs, invariants, ownership flow, expected
   failures, and compatibility constraints are explicit.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   |---|---|
   | Borrowing, cloning, allocation, dispatch, shared state, performance | [`ownership-performance.md`](references/ownership-performance.md) |
   | Public APIs, traits, naming, constructors, type-state, compatibility | [`api-design.md`](references/api-design.md) |
   | Errors, panics, tests, doc tests, comments, rustdoc | [`errors-testing-docs.md`](references/errors-testing-docs.md) |
   | Layout, imports, control flow, naming, module boundaries | [`readability-style-architecture.md`](references/readability-style-architecture.md) |
   | Clippy findings, suppression, profiling | [`tooling-lints.md`](references/tooling-lints.md) |
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

   **Complete when:** every material design decision is covered by local policy
   or one loaded reference.
4. **Design before patching.** Prefer types that make invalid states
   unrepresentable, `Result` for recoverable failure, borrowing where ownership
   is unnecessary, and explicit boundary costs. Treat each clone, allocation,
   panic, unsafe block, public dependency, re-export, and broad generic as a
   deliberate commitment. **Complete when:** the shape explains why ownership,
   failure, and compatibility sit at their chosen boundaries.
5. **Implement the narrow behavior.** Keep API changes, dependency additions,
   and unrelated restructuring separate. Place tests at stable behavioral
   boundaries and document public errors, panics, and safety contracts.
   **Complete when:** changed paths preserve invariants without warning-silencing
   or borrow-checker appeasement clones.
6. **Validate proportionately.** Prefer existing `mise run` tasks. Default to
   `cargo fmt --check`, strict workspace Clippy with `-D warnings`, nextest, and
   doctests, adjusted only for documented exclusions or custom runners.
   **Complete when:** each applicable gate has a pass, failure, unavailability,
   or explicit reason it was not run.
7. **Report the change.** State the convention followed, validation outcomes,
   and residual API, testing, unsafe, or performance risk. **Complete when:** no
   performance claim exceeds measurement and no residual risk is hidden.

## Final gate

Account for every modified public contract, expected failure, unsafe operation,
allocation-sensitive path, and test boundary. A justified local exception uses
the repository's narrow suppression mechanism and explains why design cannot
remove it.
