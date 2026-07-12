---
name: tailrocks-typescript-best-practices
description: Write, review, refactor, or migrate strict Rust-inspired TypeScript and React with exhaustive state, typed failure, validated boundaries, domain values, explicit mutation, safe async behavior, and durable tests.
disable-model-invocation: true
---

# TypeScript Best Practices

Make invalid state, recoverable failure, untrusted input, mutation, and async
ownership visible. Borrow Rust's modeling discipline without claiming Rust's
ownership or runtime guarantees.

## Steps

1. **Map the contract.** Inspect the smallest relevant package manifest,
   lockfile, TypeScript and lint configuration, module boundaries, domain types,
   adapters, React components, and tests.
   **Complete when:** the affected invariants, trust boundaries, failure owners,
   mutation aliases, async lifetimes, and compatibility constraints are explicit.

2. **Load only relevant reference.** Choose by decision:

   | Decision | Reference |
   |---|---|
   | Discriminated unions, transitions, exhaustive handling, typed errors | [`state-and-errors.md`](references/state-and-errors.md) |
   | Runtime parsing, unknown-key policy, brands, smart constructors | [`boundaries-and-domain-values.md`](references/boundaries-and-domain-values.md) |
   | Readonly APIs, escape hatches, optional fields, exported contracts | [`mutation-and-api-safety.md`](references/mutation-and-api-safety.md) |
   | React purity, effects, events, keys, async cancellation | [`react-and-async.md`](references/react-and-async.md) |
   | Compiler/lint baseline, testing, strictness migrations | [`compiler-lint-testing.md`](references/compiler-lint-testing.md) |

   **Complete when:** every material design decision is governed by local policy
   or one loaded reference.

3. **Design before implementation.** Model alternatives and failures first;
   parse external values from `unknown`; construct validated domain values at one
   boundary; expose readonly data and narrow capabilities; assign every promise
   and effect a visible owner.
   **Complete when:** callers cannot accidentally skip a meaningful state,
   failure, validation step, mutation boundary, or async cleanup.

4. **Implement the smallest coherent change.** Preserve an established
   convention when it enforces the same safety property. Introduce a library,
   compiler flag, brand, `Result`, or state abstraction only when the changed
   contract requires it.
   **Complete when:** unsafe assertions are removed or sealed behind checked,
   documented adapters and unrelated behavior remains unchanged.

5. **Test the contract.** Add runtime tests for behavior and boundary parsing;
   add type tests only for high-value public constraints. Prefer repository
   scripts and infer the package manager from the lockfile.
   **Complete when:** every new variant, expected failure, parser policy, and
   externally visible async/mutation behavior has proportionate coverage.

6. **Validate and report.** Run the applicable typecheck, lint, and focused test
   commands. Report changed contracts, safety gained, exact outcomes, and
   residual escape hatches or migration risk.
   **Complete when:** each applicable gate is recorded as passed, failed,
   unavailable, or intentionally unrun with a reason.

## Review order

Prioritize unvalidated external data, representable invalid states, hidden
recoverable failure, unsound guards/assertions, unowned async work, invisible
mutation, non-exhaustive variants, unchecked lookup, and API drift. Lead with
severity-ordered `file:line` findings; defer style-only churn while safety defects
remain.

## Final gate

Account for every changed domain state, expected failure, trust boundary, domain
primitive, mutation path, promise, effect, exported contract, and safety escape
hatch. Prefer truthful readable contracts over type-level cleverness.
