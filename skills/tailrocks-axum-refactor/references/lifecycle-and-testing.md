# Lifecycle and Testing

Bind a `tokio::net::TcpListener` explicitly and serve with `axum::serve`. Startup
validates configuration and dependencies before accepting traffic. Register
graceful shutdown for SIGTERM/Ctrl-C, stop admission, propagate cancellation,
drain tracked requests/tasks to a deadline, and report forced termination.

Every spawned task belongs to a `JoinSet`, task tracker, or structured owner.
Detached fire-and-forget work requires an explicit durable queue or best-effort
contract with observed failure. Bound concurrency with semaphores/queues.

Use async APIs on runtime threads. Move unavoidable blocking filesystem,
subprocess, CPU-heavy, or synchronous library work to `spawn_blocking` and bound
it; cancellation must not imply a blocking operation stopped when it did not.

Initialize tracing once in the binary. Emit structured fields, request IDs, and
error sources. Never log secrets or full request/response bodies by default.

Test the constructed `Router` with `tower::ServiceExt::oneshot`; collect bodies
with `http-body-util`. Replace application ports at the state boundary. Test
status, headers, serialized body, rejections, auth, limits, and middleware order.
Use `MockConnectInfo` for unit contracts and a real ephemeral listener only for
HTTP framing, connection info, streaming, or shutdown behavior.

Add cancellation/shutdown tests with bounded time and deterministic signals.
Property/fuzz-test parsers and protocol inputs; load-test concurrency and timeout
policy before production claims.

**Complete when:** startup and shutdown are observable, every task is joined or
durably queued, blocking work is bounded, router contracts need no real socket,
and transport-only behavior has focused integration evidence.
