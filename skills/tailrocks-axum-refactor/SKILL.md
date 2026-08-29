---
name: tailrocks-axum-refactor
description: >-
  Use only when the user explicitly requests this skill. Restructure Axum adapters or Tower composition while preserving HTTP behavior. Require an independent oracle; use tailrocks-axum-best-practices when transport behavior changes.
argument-hint: "<Axum refactor scope and preserved HTTP behavior>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Axum Refactor

Improve Axum adapter structure while preserving every observable HTTP contract.
Mutation is limited to the approved scope and requires an independent oracle.
Generic Rust restructuring belongs to `tailrocks-rust-refactor`.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Verify current official Axum and Tower docs before relying on
API-specific behavior.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Refactor

1. **Confirm selector and authority.** Require exact mutation scope and preserved
   HTTP behavior. Route new statuses, bodies, headers, routes, middleware policy,
   or lifecycle behavior to `tailrocks-axum-best-practices`; route findings-only
   work to `tailrocks-axum-review`. Stop rather than rewrite expectations,
   suppress warnings, or change dependencies without separate approval.
   **Complete when:** prohibited deltas and scope are explicit.
2. **Freeze the oracle before editing.** Capture route topology, public HTTP
   status/body/header behavior, rejections, middleware request/response order,
   authorization, limits, timeouts, cancellation, task/shutdown semantics, logs,
   stable tracing/request-ID fields, relevant public Rust APIs, and
   latency/resource tolerances. Run narrow existing proof before mutation; add
   characterization proof inside scope or stop. **Complete when:**
   the oracle would detect a prohibited change independently of implementation.
3. **Load only relevant references.** Use architecture/state,
   extractors/errors, middleware/security, and lifecycle/testing for the changed
   boundary. **Complete when:** the structural defect and disappearing measure
   are named.
4. **Apply narrow structural slices.** Extract, consolidate, or move ownership
   without changing transport behavior. Keep Axum at the adapter edge; preserve
   router layer scope and order, extractor semantics, state identity, error
   mapping, and task ownership. Compare inspected bytes before each write and
   never overwrite concurrent changes. **Complete when:** the named coupling,
   duplication, or invalid ownership boundary disappears.
5. **Re-run identical proof.** Use the same toolchain, features, environment,
   and commands before and after each slice, then applicable format-check,
   strict Clippy, transport tests, and lifecycle proof. Stop on unexplained
   drift. **Complete when:** receipts prove equivalent observable behavior.
6. **Report the delta.** Name the removed structure and measure, changed paths,
   proof receipts, skipped gates, and residual uncertainty. **Complete when:** no
   behavior change is mislabeled as refactoring.

## Final gate

Diff routes, methods, statuses, bodies, headers, rejection shape, authorization,
layer order, limits, timeouts, cancellation, tasks, shutdown, logs, and resource
budgets against the frozen contract. Any unexplained delta blocks completion.
