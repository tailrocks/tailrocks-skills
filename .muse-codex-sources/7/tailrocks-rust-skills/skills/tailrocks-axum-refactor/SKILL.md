---
name: tailrocks-axum-refactor
description: >-
  Use only when the user explicitly requests this skill. Restructure Axum adapters or Tower composition while preserving HTTP behavior. Require an independent oracle. Use tailrocks-axum-best-practices when transport behavior changes.
argument-hint: "<Axum refactor scope and preserved HTTP behavior>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# Axum Refactor

## Use this skill

This skill improves Axum adapter structure while preserving every
observable HTTP contract. Mutation is limited to the approved scope and
requires an independent oracle.

Use this skill only when the user explicitly requests it. Do not use this
skill for generic Rust restructuring, behavior changes, or findings-only
work. Generic Rust restructuring belongs to `tailrocks-rust-refactor`.
Behavior changes belong to `tailrocks-axum-best-practices`. Findings-only
work belongs to `tailrocks-axum-review`.

## Before you start

Obey the active user request first. Require exact mutation scope and
preserved HTTP behavior.

Before any action, read `references/runtime-trust.md`. Verify current
official Axum and Tower docs before relying on API-specific behavior.

The skill accepts one argument: the Axum refactor scope and the preserved
HTTP behavior. Without an explicit scope and contract, stop and ask.

## Procedure

1. **Confirm selector and authority.** Route new statuses, bodies,
   headers, routes, middleware policy, or lifecycle behavior to
   `tailrocks-axum-best-practices`. Route findings-only work to
   `tailrocks-axum-review`. Stop rather than rewrite expectations,
   suppress warnings, or change dependencies without separate approval.
   This step is complete when prohibited deltas and scope are explicit.
2. **Freeze the oracle before editing.** Capture route topology, HTTP
   status, body, and header behavior, rejections, middleware request and
   response order, authorization, limits, timeouts, and cancellation.
   Capture task and shutdown semantics, logs, stable tracing and
   request-ID fields, and relevant public Rust APIs. Capture latency and
   resource tolerances. Run narrow existing proof before mutation. If no
   adequate characterization proof exists, add it inside scope or stop.
   This step is complete when the oracle would detect a prohibited
   change independently of implementation.
3. **Load only relevant references.** Use architecture and state,
   extractors and errors, middleware and security, and lifecycle and
   testing for the changed boundary. This step is complete when the
   structural defect and disappearing measure are named.
4. **Apply narrow structural slices.** Extract, consolidate, or move
   ownership without changing transport behavior. Keep Axum at the
   adapter edge. Preserve router layer scope and order, extractor
   semantics, state identity, error mapping, and task ownership. Compare
   inspected bytes before each write. Never overwrite concurrent changes.
   This step is complete when the named coupling, duplication, or invalid
   ownership boundary disappears.
5. **Re-run identical proof.** Use the same toolchain, features,
   environment, and commands before and after each slice. Then run
   applicable format-check, strict Clippy, transport tests, and lifecycle
   proof. Stop on unexplained drift. This step is complete when receipts
   prove equivalent observable behavior.
6. **Report the delta.** Name the removed structure and measure, changed
   paths, proof receipts, skipped gates, and residual uncertainty. This
   step is complete when no behavior change is mislabeled as
   refactoring.

## Result

The working tree holds the restructured adapter with equivalent
observable HTTP behavior. The report names the removed structure and
measure, changed paths, proof receipts, skipped gates, and residual
uncertainty.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The skill diffed routes, methods, statuses, bodies, headers, rejection
  shape, and authorization against the frozen contract.
- The skill diffed layer order, limits, timeouts, cancellation, tasks,
  shutdown, logs, and resource budgets against the frozen contract.
- No unexplained delta remains.
- No behavior change is mislabeled as refactoring.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/architecture-and-state.md`,
  `references/extractors-and-errors.md`,
  `references/middleware-and-security.md`, and
  `references/lifecycle-and-testing.md` in step 3 only for the changed
  boundary.
