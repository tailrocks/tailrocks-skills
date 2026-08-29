---
name: tailrocks-rust-refactor
description: >-
  Use only when the user explicitly requests this skill. Restructure Rust code while preserving observable behavior and public contracts. Require a preservation oracle and approved scope. Use tailrocks-rust-best-practices when behavior changes and tailrocks-rust-review for read-only findings.
argument-hint: "<Rust refactor target and preserved behavior>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Refactor

Improve Rust structure without changing behavior. Mutation is allowed only in
the approved scope, and only after a preservation oracle exists.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Cite secret locations and types without copying values.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Refactor

1. **Confirm the selector and authority.** Require explicit mutation scope and a
   contract of observable behavior that must remain unchanged. New behavior
   routes to `tailrocks-rust-best-practices`; findings-only work routes to
   `tailrocks-rust-review`. Stop rather than add behavior, change a public API,
   rewrite expectations, suppress warnings, or alter dependencies without
   separate approval. **Complete when:** scope and preserved contract are explicit.
2. **Establish the oracle.** Inspect public APIs, callers, feature combinations,
   errors, tests, snapshots, doctests, performance budgets, and repository
   gates. Run the narrow existing proof before editing. If no adequate oracle
   exists, add characterization proof inside scope or stop. **Complete when:** a
   failing preservation check would detect the prohibited behavior change.
3. **Load only relevant references.** Use ownership/performance, API design,
   errors/tests/docs, readability/architecture, and tooling/lints only for the
   structural boundary being changed. **Complete when:** the intended structure
   and its invariant are named.
4. **Remove the enabling structure.** Prefer one ownership move, extraction,
   consolidation, or boundary correction whose completion removes a measurable
   source of duplication, coupling, invalid state, or unsafe reasoning. Avoid
   opportunistic renames, formatting churn, dependency changes, and public API
   redesign. Apply small slices against the bytes inspected and never overwrite
   concurrent changes. **Complete when:** the named structural defect no longer exists.
5. **Preserve concurrency and failure semantics.** Keep drop order, cancellation,
   lock scope, task ownership, panic/error behavior, feature behavior, unsafe
   preconditions, and allocation-sensitive paths equivalent unless the approved
   contract explicitly permits otherwise. **Complete when:** each moved boundary
   has a preservation argument tied to evidence.
6. **Re-run the oracle and gates.** Run identical before/after proof commands
   under the same toolchain, features, and relevant environment, then applicable
   format-check, strict Clippy, tests, doctests, and documented feature gates.
   Stop on unexplained drift. **Complete when:** receipts prove equivalent
   observable behavior.
7. **Report the delta.** Name the structure removed, the measure that disappeared,
   proof receipts, and residual risks. **Complete when:** no behavior change is
   described as cleanup.

## Final gate

Diff public signatures, errors, side effects, ordering, persistence, wire/file
formats, feature behavior, and performance budgets against the pre-edit contract.
Any unexplained delta means the refactor is incomplete.
