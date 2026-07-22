---
name: tailrocks-axum-best-practices
description: >-
  Use only when the user explicitly requests this skill. Apply production Axum HTTP-adapter practices when building, reviewing, or refactoring routers, handlers, extractors, Tower middleware, lifecycle, and transport tests. Do not use for Rust code without an HTTP boundary.
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Axum Best Practices

Axum is the HTTP adapter over domain/application code; Tower is the transport
policy engine. Apply strict Rust ownership, failure, and lifecycle contracts
directly — this skill is self-contained. Verify current official Axum and Tower
docs before relying on API syntax. Prefer the latest compatible stable release,
then preserve the repository's exact pins; never silently select an older line
for familiarity.

## Steps

1. **Select the mode.** Classify as `review`, `build`, or `refactor`. `review`
   is read-only; other modes mutate only the approved scope.
   **Complete when:** mutation permission and expected output are explicit.

2. **Map the boundary.** Inspect router construction, state, extractors, response
   DTOs, middleware order, shutdown, spawned work, and tests.
   **Complete when:** each route's input, authorization, domain call, error map,
   response, timeout, and task lifetime is explicit.

3. **Load relevant reference.** Choose by decision:

   | Decision | Reference |
   |---|---|
   | Crate seams, routers, typed state, handler thinness | [`architecture-and-state.md`](references/architecture-and-state.md) |
   | Extractors, validation, errors, response contracts | [`extractors-and-errors.md`](references/extractors-and-errors.md) |
   | Tower order, limits, auth, CORS, tracing, request IDs | [`middleware-and-security.md`](references/middleware-and-security.md) |
   | Serving, shutdown, task ownership, blocking work, tests | [`lifecycle-and-testing.md`](references/lifecycle-and-testing.md) |

   **Complete when:** local policy or a loaded reference governs every material
   HTTP decision.

4. **Design inward.** Keep Axum types in the HTTP crate. Convert validated
   transport input into domain commands, call narrow application capabilities,
   map domain output to stable HTTP DTOs.
   **Complete when:** domain/application crates compile without Axum, HTTP, Tower,
   or serialization dependencies unless serialization is itself domain policy.

5. **Compose policy in mutation modes; audit it in review mode.** One auditable
   Tower stack: request identity, sensitive-header handling, tracing,
   body/concurrency/timeout limits, panic containment, compression, CORS, and
   route-specific authorization.
   **Complete when:** layer order is documented by request/response flow and every
   fallible service error becomes an HTTP response.

6. **Own lifecycle.** Bind explicitly, serve with graceful shutdown, propagate
   cancellation, drain tracked tasks, bound blocking/concurrent work, emit
   structured startup/shutdown failures.
   **Complete when:** no detached task, blocking runtime call, or unbounded queue
   can outlive service ownership invisibly.

7. **Test contracts proportionately.** Exercise routers as Tower services;
   real-socket tests only for connection/transport behavior. Cover rejection
   bodies, auth, limits, middleware order, cancellation, and graceful shutdown.
   **Complete when:** every externally stable status/body/header contract and
   transport policy has a focused test or named residual risk.

## Final gate

Account for every extractor rejection, domain error, response status, secret,
credential boundary, request limit, timeout, request ID, span field, background
task, shutdown path, and blocking operation. Internal errors are logged once with
correlation context and never exposed to clients.
