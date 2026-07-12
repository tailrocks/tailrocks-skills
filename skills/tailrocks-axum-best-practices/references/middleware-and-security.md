# Middleware and Security

Use `ServiceBuilder` so layer order reads top-to-bottom. The first layer sees a
request first and a response last. Place `HandleErrorLayer` above timeout,
load-shed, or other fallible layers so Axum's service remains response-producing
instead of closing connections on errors.

Default transport policy:

1. Create/validate a request ID and propagate it on the response.
2. Mark authorization, cookie, and other sensitive headers before tracing.
3. Create the HTTP trace span with request ID, method, matched route, status, and
   latency; exclude bodies, credentials, and high-cardinality secrets.
4. Catch panics at the outer boundary while still treating them as defects.
5. Enforce concurrency/load-shed and request timeout with stable error responses.
6. Enforce request/body limits before allocation and parsing.
7. Apply compression only to eligible responses; guard secrets against
   compression side channels.
8. Apply CORS from an explicit origin/method/header allowlist.
9. Apply authentication/authorization to the narrow route scope that requires it.

Router `.layer(...)` affects matched routes. Wrap the whole router as a service
when request identity/tracing must also cover 404/405 responses. Document this
choice.

Credentials with CORS forbid wildcard origins. Trust proxy-forwarded addresses
only behind a known proxy policy. Authorization is server-side and capability-
based; authentication context contains the minimum verified identity/claims.

A timeout cancels the response future, not necessarily the underlying database,
blocking, or spawned work. Propagate deadlines/cancellation into dependencies and
bound queues explicitly.

**Complete when:** request/response layer order is auditable, every fallible layer
maps to a response, limits apply before expensive work, credentials never meet
permissive CORS/logging/compression, and 404 coverage is intentional.
