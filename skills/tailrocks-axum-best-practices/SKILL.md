---
name: tailrocks-axum-best-practices
description: >-
  Apply Axum policy when in-scope work builds or changes HTTP adapters, routers, handlers, extractors, Tower layers, lifecycle, or transport tests. Use tailrocks-axum-review for findings and tailrocks-axum-refactor when HTTP behavior stays unchanged.
argument-hint: "<Axum adapter behavior to build or change>"
license: Apache-2.0
user-invocable: true
---

# Axum Best Practices

Build Axum HTTP adapters over domain/application code; use Tower as the
transport policy engine. Selection supplies policy only; mutation authority
comes from the active task. Use `tailrocks-rust-best-practices` for domain Rust.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Verify current official Axum and Tower docs before relying on
API syntax. Preserve exact compatible pins; never silently choose an older line.

## Build

1. **Confirm the selector.** Continue only when the task adds or changes Axum
   HTTP behavior. Refuse review without mutation and name `tailrocks-axum-review`;
   refuse behavior-preserving restructuring and name `tailrocks-axum-refactor`.
   **Complete when:** behavior and approved mutation scope are explicit.
2. **Map the boundary.** Inspect router construction, state, extractors, response
   DTOs, middleware order, shutdown, spawned work, and tests. **Complete when:**
   each route's input, authorization, domain call, error map, response, timeout,
   and task lifetime is explicit.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   |---|---|
   | Crate seams, routers, typed state, handler thinness | [`architecture-and-state.md`](references/architecture-and-state.md) |
   | Extractors, validation, errors, response contracts | [`extractors-and-errors.md`](references/extractors-and-errors.md) |
   | Tower order, limits, auth, CORS, tracing, request IDs | [`middleware-and-security.md`](references/middleware-and-security.md) |
   | Serving, shutdown, task ownership, blocking work, tests | [`lifecycle-and-testing.md`](references/lifecycle-and-testing.md) |
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

   **Complete when:** local policy or a loaded reference governs every material
   HTTP decision.
4. **Design inward.** Keep Axum types in the HTTP crate. Convert validated
   transport input into domain commands, call narrow application capabilities,
   and map domain output to stable HTTP DTOs. **Complete when:** domain crates do
   not depend on Axum, HTTP, Tower, or transport serialization.
5. **Compose one auditable policy stack.** Order request identity,
   sensitive-header handling, tracing, body/concurrency/timeout limits, panic
   containment, compression, CORS, and route authorization by request/response
   flow. **Complete when:** order is explicit and every service error maps to a
   stable HTTP response.
6. **Own lifecycle.** Bind explicitly, serve with graceful shutdown, propagate
   cancellation, drain tracked tasks, bound blocking/concurrent work, and emit
   structured startup/shutdown failures. **Complete when:** no detached task,
   blocking runtime call, or unbounded queue outlives service ownership invisibly.
7. **Test transport contracts.** Exercise routers as Tower services; reserve
   sockets for connection behavior. Cover rejection bodies, auth, limits,
   middleware order, cancellation, and shutdown. **Complete when:** each stable
   status/body/header contract and transport policy has proof or named risk.
8. **Report the build.** Name changed adapter paths, stable route/error/policy
   contracts, commands with executed-test counts, skipped gates, and residual
   security/lifecycle risk. **Complete when:** the result distinguishes domain
   behavior from HTTP-adapter behavior and hides no unverified contract.

## Final gate

Account for every extractor rejection, domain error, response status, secret,
credential boundary, request limit, timeout, request ID, span field, background
task, shutdown path, and blocking operation. Log internal errors once with
correlation context and never expose them to clients.
