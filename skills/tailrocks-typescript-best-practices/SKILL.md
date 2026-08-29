---
name: tailrocks-typescript-best-practices
description: >-
  Apply strict TypeScript 7 and React language/UI policy when writing in-scope code involving state, runtime validation, typed failure, readonly APIs, or async ownership. Not review, refactoring, migration, project tooling, or backend business logic.
argument-hint: "<TypeScript or React writing task>"
license: Apache-2.0
user-invocable: true
---

# TypeScript Best Practices

Write TypeScript 7 and React code whose invalid state, recoverable failure,
untrusted input, mutation, and async ownership are visible. This owner changes
behavior only within the active task's explicit scope. Selection alone grants no
mutation or tool authority.

Business logic stays in Rust behind the GraphQL public API. TypeScript models
presentation state, boundary validation, and typed views of server-owned data.
Project configuration, package ownership, exact pins, and CI belong to the
TanStack project family. Refuse review, behavior-preserving refactor, and source
compatibility migration requests; route them to `tailrocks-typescript-review`,
`tailrocks-typescript-refactor`, or `tailrocks-typescript-migrate`.
Dependency or configuration changes require separate authority and their project owner.

Apply [`runtime-trust.md`](references/runtime-trust.md). Load only the relevant
language reference:

| Decision | Reference |
|---|---|
| State, transitions, exhaustive handling, typed errors | [`state-and-errors.md`](references/state-and-errors.md) |
| Runtime parsing, brands, smart constructors | [`boundaries-and-domain-values.md`](references/boundaries-and-domain-values.md) |
| Readonly APIs, escape hatches, exported contracts | [`mutation-and-api-safety.md`](references/mutation-and-api-safety.md) |
| React purity, effects, events, async cancellation | [`react-and-async.md`](references/react-and-async.md) |
| Proportionate language-contract tests | [`testing.md`](references/testing.md) |
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Write

1. **Bind the task.** Record approved paths, intended behavior, conventions,
   trust boundaries, failure owners, mutation aliases, async lifetimes, and
   applicable existing gates. **Complete when:** behavior and authority are explicit.
2. **Model before implementation.** Represent meaningful alternatives and
   failures; parse external values from `unknown`; construct domain values at one
   boundary; expose readonly data and narrow capabilities; give each promise and
   effect an owner. **Complete when:** callers cannot skip a meaningful contract.
3. **Implement the smallest coherent behavior.** Preserve conventions enforcing
   the same safety property. Add an abstraction only when the changed contract
   requires it. Domain rules remain in Rust. **Complete when:** no assertion or
   broad suppression conceals the new behavior.
4. **Test and report.** Add runtime proof for behavior/boundaries and type proof
   only for high-value public constraints. Run only task-authorized existing Bun
   gates with bounded time/output and no fallback package manager. Report changed
   contracts, outcomes, and residual escape hatches. **Complete when:** every new
   state, failure, parser policy, and async/mutation behavior has evidence.

## Final gate

Account for every changed state, expected failure, trust boundary, domain value,
mutation path, promise, effect, exported contract, and safety escape hatch.
