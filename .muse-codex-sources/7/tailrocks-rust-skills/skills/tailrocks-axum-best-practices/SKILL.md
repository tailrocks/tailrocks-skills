---
name: tailrocks-axum-best-practices
description: >-
  Apply Axum policy when in-scope work builds or changes HTTP adapters, routers, handlers, extractors, Tower layers, lifecycle, or transport tests. Use tailrocks-axum-review for findings and tailrocks-axum-refactor when HTTP behavior stays unchanged.
argument-hint: "<Axum adapter behavior to build or change>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User builds or changes Axum HTTP adapters in authorized work.
---

# Axum Best Practices

## Use this skill

This skill builds Axum HTTP adapters over domain and application code. It
uses Tower as the transport policy engine.

Use this skill when the task adds or changes Axum HTTP behavior. Do not
use this skill for domain Rust, read-only findings, or
behavior-preserving restructuring. Domain Rust belongs to
`tailrocks-rust-best-practices`. Findings belong to
`tailrocks-axum-review`. Behavior-preserving restructuring belongs to
`tailrocks-axum-refactor`.

## Before you start

Obey the active user request first. Selection supplies policy only.
Mutation authority comes from the active task.

Before any action, read `references/runtime-trust.md`. Verify current
official Axum and Tower docs before relying on API syntax. Preserve exact
compatible pins. Never silently choose an older line.

The skill accepts one argument: the Axum adapter behavior to build or
change. Without an explicit behavior and mutation scope, stop and ask.

## Procedure

1. **Confirm the selector.** Continue only when the task adds or changes
   Axum HTTP behavior. If the request seeks review without mutation,
   refuse it. Name `tailrocks-axum-review`. If the request seeks
   behavior-preserving restructuring, refuse it. Name
   `tailrocks-axum-refactor`. This step is complete when behavior and
   approved mutation scope are explicit.
2. **Map the boundary.** Inspect router construction, state, extractors,
   response DTOs, middleware order, shutdown, spawned work, and tests.
   This step is complete when each route input, authorization, domain
   call, error map, response, timeout, and task lifetime is explicit.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   | --- | --- |
   | Crate seams, routers, typed state, handler thinness | [`architecture-and-state.md`](references/architecture-and-state.md) |
   | Extractors, validation, errors, response contracts | [`extractors-and-errors.md`](references/extractors-and-errors.md) |
   | Tower order, limits, auth, CORS, tracing, request IDs | [`middleware-and-security.md`](references/middleware-and-security.md) |
   | Serving, shutdown, task ownership, blocking work, tests | [`lifecycle-and-testing.md`](references/lifecycle-and-testing.md) |

   This step is complete when local policy or a loaded reference governs
   every material HTTP decision.
4. **Design inward.** Keep Axum types in the HTTP crate. Convert validated
   transport input into domain commands. Call narrow application
   capabilities. Map domain output to stable HTTP DTOs. This step is
   complete when domain crates do not depend on Axum, HTTP, Tower, or
   transport serialization.
5. **Compose one auditable policy stack.** Order the stack by request
   and response flow. Include request identity, sensitive-header
   handling, tracing, body limits, concurrency limits, timeout limits,
   panic containment, compression, CORS, and route authorization. This
   step is complete when order is explicit and every service error maps
   to a stable HTTP response.
6. **Own lifecycle.** Bind explicitly. Serve with graceful shutdown.
   Propagate cancellation. Drain tracked tasks. Bound blocking and
   concurrent work. Emit structured startup and shutdown failures. This
   step is complete when no detached task, blocking runtime call, or
   unbounded queue outlives service ownership invisibly.
7. **Test transport contracts.** Exercise routers as Tower services.
   Reserve sockets for connection behavior. Cover rejection bodies, auth,
   limits, middleware order, cancellation, and shutdown. This step is
   complete when each stable status and body and header contract and
   transport policy has proof or named risk.
8. **Report the build.** Name changed adapter paths with stable route,
   error, and policy contracts. Name commands with executed-test counts,
   skipped gates, and residual security and lifecycle risk. This step is
   complete when the result distinguishes domain behavior from HTTP
   adapter behavior and hides no unverified contract.

## Result

The working tree holds the built or changed Axum adapter. The report
names changed paths, stable contracts, validation outcomes, skipped
gates, and residual risks.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The change accounts for every extractor rejection, domain error,
  response status, secret, credential boundary, request limit, and
  timeout.
- The change accounts for every request ID, span field, background task,
  shutdown path, and blocking operation.
- The code logs internal errors once with correlation context and never
  exposes them to clients.
- The result distinguishes domain behavior from HTTP adapter behavior.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/architecture-and-state.md` in steps 2 and 4 for crate
  seams, routers, typed state, and handler thinness.
- Read `references/extractors-and-errors.md` in steps 2 and 4 for
  extractors, validation, errors, and response contracts.
- Read `references/middleware-and-security.md` in steps 2 and 5 for
  Tower order, limits, auth, CORS, tracing, and request IDs.
- Read `references/lifecycle-and-testing.md` in steps 2, 6, and 7 for
  serving, shutdown, task ownership, blocking work, and tests.
