---
name: tailrocks-rust-best-practices
description: Write, review, or refactor strict idiomatic Rust across ownership, APIs, errors, tests, documentation, unsafe code, performance, and readability.
disable-model-invocation: true
---

# Rust Best Practices

Make invariants, failure, ownership, and cost visible. Follow stronger local
conventions; otherwise use the strict posture in this skill. Use
`tailrocks-rust-project-setup` when the task changes workspace structure,
toolchains, lint configuration, or CI gates. Use
`tailrocks-axum-best-practices` when HTTP handlers, extractors, routers, Tower
middleware, service lifecycle, or web security are involved.

## Steps

1. **Map the contract.** Inspect the smallest relevant manifests, feature flags,
   public boundaries, nearby implementation, tests, documentation, and lint
   policy.
   **Complete when:** the affected API, invariants, ownership flow, expected
   failures, and compatibility constraints are explicit.

2. **Load only relevant reference.** Choose by decision:

   | Decision | Reference |
   |---|---|
   | Review or final audit | [`review-checklist.md`](references/review-checklist.md) |
   | Borrowing, cloning, allocation, dispatch, shared state, performance | [`ownership-performance.md`](references/ownership-performance.md) |
   | Public APIs, traits, naming, constructors, type-state, compatibility | [`api-design.md`](references/api-design.md) |
   | Errors, panics, tests, doc tests, comments, rustdoc | [`errors-testing-docs.md`](references/errors-testing-docs.md) |
   | Layout, imports, control flow, naming, module boundaries | [`readability-style-architecture.md`](references/readability-style-architecture.md) |
   | Clippy findings, suppression, profiling | [`tooling-lints.md`](references/tooling-lints.md) |

   **Complete when:** every material design decision is covered by local policy
   or one loaded reference.

3. **Design before patching.** Prefer types that make invalid states
   unrepresentable, `Result` for recoverable failure, borrowing where ownership
   is unnecessary, and explicit boundary costs. Treat each clone, allocation,
   panic, unsafe block, public dependency, re-export, and broad generic as a
   deliberate commitment.
   **Complete when:** the proposed shape explains why ownership, failure, and
   compatibility sit at their chosen boundaries.

4. **Implement the smallest coherent change.** Keep API changes, dependency
   additions, and broad refactors separate when they have independent reasons.
   Place tests at stable behavioral boundaries and document public errors,
   panics, and safety contracts where applicable.
   **Complete when:** every changed path preserves its invariants without
   warning-silencing or borrow-checker appeasement clones.

5. **Validate with repository commands.** Prefer existing `mise run` tasks.
   Otherwise use the applicable set: `cargo fmt --check`, strict workspace
   Clippy with `-D warnings`, nextest, and doctests. Adjust for documented feature
   exclusions or custom runners.
   **Complete when:** each applicable gate has a recorded pass, failure,
   unavailability, or explicit reason it was not run.

6. **Report.** For reviews, lead with severity-ordered findings containing
   `file:line`, impact, violated contract, and practical correction. For changes,
   state the convention followed, validation outcomes, and residual API,
   testing, unsafe, or performance risk.
   **Complete when:** no performance claim exceeds available measurement and no
   residual risk is hidden.

## Final gate

Account for every modified public contract, expected failure, unsafe operation,
allocation-sensitive path, and test boundary. A justified local exception uses
the repository's narrow suppression mechanism and explains why the design cannot
remove it.
