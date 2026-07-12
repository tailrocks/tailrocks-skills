---
name: tailrocks-axum-best-practices
description: Build, review, or refactor production Axum services with typed HTTP boundaries, Tower middleware, security limits, tracing, graceful shutdown, async task ownership, and contract tests.
disable-model-invocation: true
---

# Axum Best Practices

Treat Axum as the HTTP adapter over domain/application code and Tower as the
transport policy engine. Use `tailrocks-rust-best-practices` for language-level
decisions and `tailrocks-rust-project-setup` for workspace/tooling policy.
Before relying on API syntax, use the latest stable Axum docs and refresh the
house version table; never target an older release series for familiarity.

## Steps

1. **Map the boundary.** Inspect router construction, state, extractors, response
   DTOs, middleware order, shutdown, spawned work, and tests.
   **Complete when:** each route's input, authorization, domain call, error map,
   response, timeout, and task lifetime is explicit.

2. **Load relevant reference.** Choose by decision:

   | Decision | Reference |
   |---|---|
   | Crate seams, routers, typed state, handler thinness | [`architecture-and-state.md`](references/architecture-and-state.md) |
   | Extractors, validation, errors, response contracts | [`extractors-and-errors.md`](references/extractors-and-errors.md) |
   | Tower order, limits, auth, CORS, tracing, request IDs | [`middleware-and-security.md`](references/middleware-and-security.md) |
   | Serving, shutdown, task ownership, blocking work, tests | [`lifecycle-and-testing.md`](references/lifecycle-and-testing.md) |

   **Complete when:** local policy or a loaded reference governs every material
   HTTP decision.

3. **Design inward.** Keep Axum types in the HTTP crate. Convert validated
   transport input into domain commands, call narrow application capabilities,
   and map domain output back to stable HTTP DTOs.
   **Complete when:** domain/application crates compile without Axum, HTTP, Tower,
   or serialization dependencies unless serialization is itself domain policy.

4. **Compose policy.** Build one auditable Tower stack with request identity,
   sensitive-header handling, tracing, body/concurrency/timeout limits, panic
   containment, compression, CORS, and route-specific authorization.
   **Complete when:** layer order is documented by request/response flow and every
   fallible service error becomes an HTTP response.

5. **Own lifecycle.** Bind explicitly, serve with graceful shutdown, propagate
   cancellation, drain tracked tasks, bound blocking/concurrent work, and emit
   structured startup/shutdown failures.
   **Complete when:** no detached task, blocking runtime call, or unbounded queue
   can outlive service ownership invisibly.

6. **Test contracts.** Exercise routers as Tower services; add real-socket tests
   only for connection/transport behavior. Cover rejection bodies, auth, limits,
   middleware order, cancellation, and graceful shutdown.
   **Complete when:** every externally stable status/body/header contract and
   transport policy has a focused test or named residual risk.

## Final gate

Account for every extractor rejection, domain error, response status, secret,
credential boundary, request limit, timeout, request ID, span field, background
task, shutdown path, and blocking operation. Internal errors are logged once with
correlation context and never exposed to clients.
