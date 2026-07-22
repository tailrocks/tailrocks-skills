---
name: tailrocks-typescript-best-practices
description: >-
  Use only when the user explicitly requests this skill. Apply strict Rust-inspired TypeScript 7 contracts when writing, reviewing, refactoring, or migrating TypeScript. Use for state, typed failure, runtime validation, readonly APIs, async ownership, and tests; use Bun and Oxc only, and keep review mode read-only.
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TypeScript Best Practices

Make invalid state, recoverable failure, untrusted input, mutation, and async
ownership visible. Borrow Rust's modeling discipline without claiming Rust's
ownership or runtime guarantees.

The tooling stack is fixed: Bun owns installation, scripts, runtime helpers, and
tests; TypeScript 7 owns type checking; Oxc owns linting and formatting. No
alternative package managers, test runners, or TypeScript 6 compiler aliases.

This skill owns language-level React purity, effect, and async contracts.
Router, Query, server-function, SSR, shadcn, and application-layout decisions
are framework policy outside this skill.

## Steps

1. **Select the mode.** Classify as `review`, `write`, `refactor`, or `migrate`.
   `review` is read-only; other modes mutate only the approved scope. A non-Bun
   lockfile is migration evidence, not permission to run its package manager.
   **Complete when:** mutation permission and expected output are explicit.

2. **Map the contract.** Inspect the smallest relevant package manifest,
   lockfile, TypeScript and lint configuration, module boundaries, domain types,
   adapters, React components, and tests.
   **Complete when:** the affected invariants, trust boundaries, failure owners,
   mutation aliases, async lifetimes, and compatibility constraints are explicit.

3. **Load only relevant reference.** Choose by decision:

   | Decision | Reference |
   |---|---|
   | Discriminated unions, transitions, exhaustive handling, typed errors | [`state-and-errors.md`](references/state-and-errors.md) |
   | Runtime parsing, unknown-key policy, brands, smart constructors | [`boundaries-and-domain-values.md`](references/boundaries-and-domain-values.md) |
   | Readonly APIs, escape hatches, optional fields, exported contracts | [`mutation-and-api-safety.md`](references/mutation-and-api-safety.md) |
   | React purity, effects, events, keys, async cancellation | [`react-and-async.md`](references/react-and-async.md) |
   | Compiler/lint baseline, testing, strictness migrations | [`compiler-lint-testing.md`](references/compiler-lint-testing.md) |

   **Complete when:** every material design decision is governed by local policy
   or one loaded reference.

4. **Design before implementation.** Model alternatives and failures first;
   parse external values from `unknown`; construct validated domain values at
   one boundary; expose readonly data and narrow capabilities; give every
   promise and effect a visible owner.
   **Complete when:** callers cannot accidentally skip a meaningful state,
   failure, validation step, mutation boundary, or async cleanup.

5. **Change only in mutation modes.** Preserve an established convention when it
   enforces the same safety property. Introduce a library, compiler flag, brand,
   `Result`, or state abstraction only when the changed contract requires it.
   **Complete when:** unsafe assertions are removed or sealed behind checked,
   documented adapters and unrelated behavior remains unchanged.

6. **Test the contract proportionately.** Runtime tests for behavior and
   boundary parsing; type tests only for high-value public constraints. Prefer
   repository Bun scripts. If the repository is not yet Bun-owned, report the
   migration blocker; never execute npm, pnpm, or yarn as a fallback.
   **Complete when:** every new variant, expected failure, parser policy, and
   externally visible async/mutation behavior has proportionate coverage.

7. **Validate and report.** In mutation modes, run the applicable typecheck,
   lint, and focused test commands. Report changed contracts, safety gained,
   exact outcomes, and residual escape hatches or migration risk.
   **Complete when:** each applicable gate is recorded as passed, failed,
   unavailable, or intentionally unrun with a reason.

## Review order

Prioritize unvalidated external data, representable invalid states, hidden
recoverable failure, unsound guards/assertions, unowned async work, invisible
mutation, non-exhaustive variants, unchecked lookup, and API drift. Lead with
severity-ordered `file:line` findings; defer style-only churn while safety
defects remain.

## Final gate

Account for every changed domain state, expected failure, trust boundary, domain
primitive, mutation path, promise, effect, exported contract, and safety escape
hatch. Prefer truthful readable contracts over type-level cleverness.
