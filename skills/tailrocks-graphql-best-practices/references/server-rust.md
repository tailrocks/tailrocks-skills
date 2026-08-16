# Server: Juniper on Axum

Juniper is the sanctioned GraphQL library for Rust — the reference project is
<https://github.com/graphql-rust/juniper>. Latest stable `juniper` with
`juniper_axum` on the latest stable Axum; verify current docs for exact
signatures before writing code (the `RootNode` generics and the
`juniper_axum` extractors have shifted across releases). The GraphQL crate is
an adapter: it depends on the domain crates, never the reverse, and the
domain crates compile without Juniper, Axum, or serde unless serialization is
itself domain policy.

## Module layout

Code-first, one module per domain area, roots assembled in one place:

```text
crates/api/src/
  schema/
    mod.rs          # build_schema(), Query/Mutation root assembly
    invoice.rs      # Invoice object, InvoiceConnection, invoice mutations
    customer.rs     # Customer object
    errors.rs       # UserError, UserErrorCode, domain-error mapping
    context.rs      # per-request Context: viewer, request ID, loaders
    loaders.rs      # dataloader batchers
    id.rs           # opaque ID encode/decode with type tag
  bin/
    print-schema.rs # prints the SDL for the contract gate
```

`build_schema()` takes no live connections — everything request-scoped
(viewer identity, request ID, loaders) lives in the Juniper `Context`
constructed per request. That keeps `print-schema` runnable in CI with no
environment (see `references/contract-gates.md`).

## Axum wiring

```rust
use axum::{extract::State, routing::post, Router};
use juniper::{EmptySubscription, RootNode};
use juniper_axum::{extract::JuniperRequest, response::JuniperResponse};

pub type ApiSchema = RootNode<'static, Query, Mutation, EmptySubscription<Context>>;

pub fn build_schema() -> ApiSchema {
    ApiSchema::new(Query, Mutation, EmptySubscription::new())
}

async fn graphql_handler(
    State(state): State<AppState>,
    viewer: Viewer, // authenticated by Tower middleware before this point
    JuniperRequest(request): JuniperRequest,
) -> JuniperResponse {
    let ctx = Context::for_request(&state, viewer); // fresh loaders per request
    JuniperResponse(request.execute(&state.schema, &ctx).await)
}

pub fn graphql_router(state: AppState) -> Router {
    Router::new()
        .route("/graphql", post(graphql_handler))
        .with_state(state)
}
```

Write the handler yourself rather than using the crate's prebuilt `graphql`
handler: per-request context construction (viewer, loaders, request ID) is
the point, and the prebuilt handler hides it. Authentication, body limits,
timeouts, and the outer middleware live in the Tower stack around this router
(tailrocks-axum-best-practices owns that stack); the GraphQL layer consumes
the already-authenticated identity from request data.

## Storage handles

PostgreSQL is the storage layer, reached through tokio-postgres (the
rust-postgres project) pooled by **deadpool-postgres** — the direct analog of
HikariCP in the reference JVM stack; neither reference project pins a Rust
pool (the Rust reference has no database layer, the JVM one pools with
HikariCP), so deadpool-postgres is the recorded decision, not an inherited
pin. The pool is constructed at startup, owned by the domain core, and sized
with written numbers (max connections, acquire timeout) alongside the GraphQL
limits. Resolvers and loaders never check out connections or run SQL — they
call core capabilities, and the core holds the pool. A `Pool` field on the
Juniper `Context` is a boundary leak and a finding in review.

## Per-request loaders: the N+1 gate

A relation resolver runs once per parent row. `invoices(first: 50)` with a
naive `customer` resolver issues 51 queries — the N+1. Juniper ships no
loader, so batching comes from the `dataloader` crate: every resolver that
crosses a relation goes through a loader held in the `Context`, which
coalesces all loads in one resolution wave into a single batched call and
deduplicates repeats within the request:

```rust
use std::{collections::HashMap, sync::Arc};

use dataloader::{cached::Loader, BatchFn};

pub struct CustomerBatcher {
    core: Arc<BillingCore>,
}

impl BatchFn<CustomerId, Result<Customer, Arc<CoreError>>> for CustomerBatcher {
    async fn load(
        &mut self,
        keys: &[CustomerId],
    ) -> HashMap<CustomerId, Result<Customer, Arc<CoreError>>> {
        match self.core.customers_by_ids(keys).await {
            Ok(customers) => customers.into_iter().map(|c| (c.id, Ok(c))).collect(),
            Err(err) => {
                let err = Arc::new(err);
                keys.iter().map(|k| (*k, Err(Arc::clone(&err)))).collect()
            }
        }
    }
}

pub type CustomerLoader = Loader<CustomerId, Result<Customer, Arc<CoreError>>, CustomerBatcher>;

pub struct Context {
    pub viewer: Viewer,
    pub request_id: RequestId,
    pub customers: CustomerLoader,
}

impl juniper::Context for Context {}
```

```rust
use juniper::{graphql_object, FieldResult};

#[graphql_object(context = Context)]
impl Invoice {
    async fn customer(&self, ctx: &Context) -> FieldResult<Customer> {
        ctx.customers
            .load(self.customer_id)
            .await
            .map_err(|e| internal(&e, &ctx.request_id))
    }
}
```

**Loaders are per-request.** Construct them in `Context::for_request`. The
`cached` flavor is safe precisely because the cache dies with the request; a
process-wide loader becomes an unbounded, invalidation-free cache that serves
one user's data to another. The per-request lifetime is the correctness
boundary, not an optimization detail.

## Error mapping

Two channels, never mixed:

- **Expected domain outcomes** — validation, preconditions, not-found,
  not-authorized-for-this-object — return as typed `userErrors` in the
  mutation payload (shape in `references/schema-design.md`). The resolver
  matches the core's error enum exhaustively and maps each variant to a
  `UserErrorCode`; a new core variant fails compilation until mapped.
- **System failures** — pool exhausted, downstream timeout, bug — become one
  `FieldError` with a stable machine `code` extension and an opaque message.
  Log once, at the mapping site, with the full source chain and correlation
  ID; the client sees `"internal error"` and the request ID, never
  `e.to_string()`. A SQL fragment, file path, or panic message in a GraphQL
  `message` is a finding in every mode.

```rust
use juniper::{graphql_value, FieldError};

fn internal(err: &CoreError, request_id: &RequestId) -> FieldError {
    tracing::error!(error = ?err, %request_id, "graphql internal error");
    FieldError::new("internal error", graphql_value!({ "code": "INTERNAL" }))
}
```

Implement `IntoFieldError` on the adapter's error type so resolvers use `?`
and the mapping stays in one audited place instead of scattered `map_err`s.

## Limits and introspection

- Juniper ships no depth or complexity limiter — state the gap and
  compensate at the boundary, with written numbers. The persisted-operation
  allowlist (below) is the primary complexity control for the public
  surface: every allowed document was reviewed, so its depth and cost are
  known. Where free-form queries remain enabled (development, internal
  tooling), parse the incoming document and reject past a stated selection
  depth before `execute`, and rely on the Tower body and timeout budgets for
  size and time. A deployment with neither an allowlist nor a boundary depth
  guard is a finding.
- **Disabling introspection in production is a decision, not a default.**
  `RootNode` supports disabling introspection; with persisted operations
  enforced, introspection adds no attack surface worth the tooling loss, and
  without them, disabling it is reasonable hygiene. Record the decision
  either way — an unexplained disable and an unexplained open introspection
  endpoint are both findings.

## Persisted (trusted) operations

The public web client ships a build-time manifest of every operation it can
send, keyed by hash (`references/client-tanstack.md` covers generation). In
production the handler executes only manifest hashes: look up the document by
hash before handing it to Juniper, reject unknown hashes with a stable error,
and never accept free-form query text from the public client. Mechanism: the
schema's theoretical query space collapses to an audited allowlist —
complexity attacks and data-shape probing are cut off before validation. This
is doubly load-bearing under Juniper, which has no built-in complexity
analysis to fall back on. Free-form queries stay enabled in development and
for internal tooling behind authentication.

## Request budget and OpenTelemetry tracing

Every request carries a deadline (Tower `TimeoutLayer` around the route), and
tracing is OpenTelemetry end to end: `tracing` spans bridge through
`tracing-opentelemetry` into an OTLP exporter (`opentelemetry-otlp`),
initialized once at startup with a resource that names the service. Open the
span in `graphql_handler` around `execute` — the incoming request exposes the
operation name, and the persisted-document hash rides alongside — recording
`graphql.operation.name` per OTel semantic conventions, so one slow persisted
operation is findable across service boundaries without logging variables
(which may hold PII). Resolver-level spans are opt-in for hot paths, not
blanket instrumentation. The same pipeline carries the gRPC spans of the
internal services, which is the point: one trace follows a public GraphQL
request into every internal call.

## Subscriptions

A subscription is a delivery promise: connection lifecycle, auth at connect
and re-auth on token expiry, backpressure, missed-event semantics, and
horizontal fan-out all become your contract (`juniper_graphql_ws` covers only
the wire protocol, none of the operations story). Offer subscriptions only
when that story is owned end to end — a real event source and a deployment
that holds sockets. Otherwise model freshness as queries the client polls
with TanStack Query intervals — polling a cheap persisted operation is a
working system; a half-owned WebSocket topology is an outage schedule.

**Complete when:** domain crates compile without Juniper, the core owns the
deadpool-postgres pool and no resolver touches SQL or a connection, every
relation resolver batches through a per-request loader in the `Context`,
every core error variant maps exhaustively to a user-error code or the opaque
internal error, the depth, timeout, body, and pool numbers are written down,
the persisted-operation and introspection postures are recorded decisions,
spans export through OpenTelemetry with the operation name, and no
subscription exists without an owned delivery story.
