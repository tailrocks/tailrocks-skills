---
name: tailrocks-rust-refactor
description: >-
  Use only when the user explicitly requests this skill. Restructure Rust code while preserving observable behavior and public contracts. Require a preservation oracle and approved scope. Use tailrocks-rust-best-practices when behavior changes and tailrocks-rust-review for read-only findings.
argument-hint: "<Rust refactor target and preserved behavior>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Refactor

## Use this skill

This skill improves Rust structure without changing behavior. Mutation is
allowed only in the approved scope, and only after a preservation oracle
exists.

Use this skill only when the user explicitly requests it. Do not use this
skill to add behavior or to report findings. New behavior belongs to
`tailrocks-rust-best-practices`. Findings-only work belongs to
`tailrocks-rust-review`.

## Before you start

Obey the active user request first. Require explicit mutation scope and a
contract of observable behavior that must remain unchanged.

Before any action, read `references/runtime-trust.md`. Cite secret
locations and types without copying values.

The skill accepts one argument: the Rust refactor target and the preserved
behavior. Without an explicit scope and contract, stop and ask.

## Procedure

1. **Confirm the selector and authority.** Route new behavior to
   `tailrocks-rust-best-practices`. Route findings-only work to
   `tailrocks-rust-review`. Stop rather than add behavior, change a public
   API, rewrite expectations, suppress warnings, or alter dependencies
   without separate approval. This step is complete when scope and
   preserved contract are explicit.
2. **Establish the oracle.** Inspect public APIs, callers, feature
   combinations, errors, tests, snapshots, doctests, performance budgets,
   and repository gates. Run the narrow existing proof before editing. If
   no adequate oracle exists, add characterization proof inside scope or
   stop. This step is complete when a failing preservation check would
   detect the prohibited behavior change.
3. **Load only relevant references.** Use only the topic references
   for the structural boundary being changed. This step is complete when
   the intended structure and its invariant are named.
4. **Remove the enabling structure.** Prefer one ownership move,
   extraction, consolidation, or boundary correction. Its completion must
   remove a measurable source of duplication, coupling, invalid state, or
   unsafe reasoning. Avoid opportunistic renames, formatting churn,
   dependency changes, and public API redesign. Apply small slices against
   the bytes inspected and never overwrite concurrent changes. This step
   is complete when the named structural defect no longer exists.
5. **Preserve concurrency and failure semantics.** Keep drop order,
   cancellation, lock scope, task ownership, panic and error behavior,
   and feature behavior equivalent. Keep unsafe preconditions and
   allocation-sensitive paths equivalent. If the approved contract
   explicitly permits a change, apply only that change. This step is
   complete when each moved boundary has a preservation argument tied to
   evidence.
6. **Re-run the oracle and gates.** Run identical before and after proof
   commands under the same toolchain, features, and relevant environment.
   Then run applicable format-check, strict Clippy, tests, doctests, and
   documented feature gates. Stop on unexplained drift. This step is
   complete when receipts prove equivalent observable behavior.
7. **Report the delta.** Name the structure removed, the measure that
   disappeared, proof receipts, and residual risks. This step is complete
   when no behavior change is described as cleanup.

## Result

The working tree holds the restructured code with equivalent observable
behavior. The report names the structure removed, the measure that
disappeared, proof receipts, and residual risks.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The skill diffed public signatures, errors, side effects, ordering,
  persistence, wire and file formats, feature behavior, and performance
  budgets against the pre-edit contract.
- No unexplained delta remains.
- No behavior change is described as cleanup.
- The skill changed no dependency without separate approval.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/ownership-performance.md`,
  `references/api-design.md`, `references/errors-testing-docs.md`,
  `references/readability-style-architecture.md`, and
  `references/tooling-lints.md` in step 3 only for the structural
  boundary being changed.
