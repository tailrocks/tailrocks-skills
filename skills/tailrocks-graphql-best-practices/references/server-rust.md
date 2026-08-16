# Server: async-graphql on Axum

Latest stable async-graphql and async-graphql-axum on the latest stable Axum;
verify current docs for exact signatures before writing code. The GraphQL
crate is an adapter: it depends on the domain crates, never the reverse, and
the domain crates compile without async-graphql, Axum, or serde unless
serialization is itself domain policy.

## Module layout

Code-first, one module per domain area, roots assembled in one place:

```text
crates/api/src/
  schema/
    mod.rs          # build_schema(), QueryRoot/MutationRoot assembly, limits
    invoice.rs      # Invoice object, InvoiceConnection, invoice mutations
    customer.rs     # Customer object
    errors.rs       # UserError, UserErrorCode, domain-error mapping
    loaders.rs      # DataLoader implementations
    id.rs           # opaque ID encode/decode with type tag
  bin/
    print-schema.rs # prints schema.sdl() for the contract gate
```

`build_schema()` takes no live connections — request-scoped data (viewer
identity, loaders) is injected per request. That keeps `print-schema`
runnable in CI with no environment (see `references/contract-gates.md`).

## Axum wiring

```rust
use async_graphql::{EmptySubscription, Schema};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{extract::State, routing::post, Router};

pub type ApiSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn build_schema() -> ApiSchema {
    Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .limit_depth(12)
        .limit_complexity(600)
        .finish()
}

async fn graphql_handler(
    State(state): State<AppState>,
    viewer: Viewer, // authenticated by Tower middleware before this point
    req: GraphQLRequest,
) -> GraphQLResponse {
    let request = req
        .into_inner()
        .data(viewer)
        .data(state.loaders()); // fresh per-request loaders
    state.schema.execute(request).await.into()
}

pub fn graphql_router(state: AppState) -> Router {
    Router::new()
        .route("/graphql", post(graphql_handler))
        .with_state(state)
}
```

Authentication, body limits, timeouts, and the outer middleware live in the
Tower stack around this router (tailrocks-axum-best-practices owns that
stack); the GraphQL layer consumes the already-authenticated identity from
request data.

## Storage handles

PostgreSQL is the storage layer, reached through tokio-postgres (the
rust-postgres project) pooled by **deadpool-postgres** — the direct analog of
HikariCP in the reference JVM stack; neither reference project pins a Rust
pool (the Rust reference has no database layer, the JVM one pools with
HikariCP), so deadpool-postgres is the recorded decision, not an inherited
pin. The pool is constructed at startup, owned by the domain core, and sized
with written numbers (max connections, acquire timeout) alongside the GraphQL
limits. Resolvers and loaders never check out connections or run SQL — they
call core capabilities, and the core holds the pool. A `Pool` reachable from
schema `data` is a boundary leak and a finding in review.

## DataLoader: the N+1 gate

A relation resolver runs once per parent row. `invoices(first: 50)` with a
naive `customer` resolver issues 51 queries — the N+1. Every resolver that
crosses a relation goes through async-graphql's `DataLoader`, which coalesces
all loads in one resolution wave into a single batched call:

```rust
use async_graphql::dataloader::{DataLoader, Loader};
use std::{collections::HashMap, sync::Arc};

pub struct CustomerLoader {
    core: Arc<BillingCore>,
}

impl Loader<CustomerId> for CustomerLoader {
    type Value = Customer;
    type Error = Arc<CoreError>;

    async fn load(
        &self,
        keys: &[CustomerId],
    ) -> Result<HashMap<CustomerId, Customer>, Self::Error> {
        let customers = self.core.customers_by_ids(keys).await.map_err(Arc::new)?;
        Ok(customers.into_iter().map(|c| (c.id, c)).collect())
    }
}

pub fn request_loaders(core: Arc<BillingCore>) -> DataLoader<CustomerLoader> {
    DataLoader::new(CustomerLoader { core }, tokio::spawn)
}
```

```rust
#[Object]
impl Invoice {
    async fn customer(&self, ctx: &Context<'_>) -> async_graphql::Result<Customer> {
        let loader = ctx.data_unchecked::<DataLoader<CustomerLoader>>();
        loader
            .load_one(self.customer_id)
            .await?
            .ok_or_else(|| user_error(UserErrorCode::NotFound))
    }
}
```

**Loaders are per-request.** Construct them in the handler and attach with
`.data()`. A process-wide loader becomes an unbounded, invalidation-free
cache that serves one user's data to another; the per-request lifetime is the
correctness boundary, not an optimization detail.

## Error mapping

Two channels, never mixed:

- **Expected domain outcomes** — validation, preconditions, not-found,
  not-authorized-for-this-object — return as typed `userErrors` in the
  mutation payload (shape in `references/schema-design.md`). The resolver
  matches the core's error enum exhaustively and maps each variant to a
  `UserErrorCode`; a new core variant fails compilation until mapped.
- **System failures** — pool exhausted, downstream timeout, bug — become one
  top-level GraphQL error with a stable machine `code` extension and an opaque
  message. Log once, at the mapping site, with the full source chain and
  correlation ID; the client sees `"internal error"` and the request ID, never
  `e.to_string()`. A SQL fragment, file path, or panic message in a GraphQL
  `message` is a finding in every mode.

```rust
fn internal(err: CoreError, request_id: &RequestId) -> async_graphql::Error {
    tracing::error!(error = ?err, %request_id, "graphql internal error");
    async_graphql::Error::new("internal error")
        .extend_with(|_, e| e.set("code", "INTERNAL"))
}
```

## Limits and introspection

- `limit_depth` and `limit_complexity` are always set on the schema builder,
  with numbers derived from the deepest legitimate persisted operation plus
  headroom — an unbounded public schema is a denial-of-service invitation via
  crafted nesting.
- Recursive fragments and oversized bodies are rejected by the same budget:
  body size and request timeout come from the Tower stack, not resolver code.
- **Disabling introspection in production is a decision, not a default.** With
  persisted operations enforced, introspection adds no attack surface worth
  the tooling loss; without them, disabling it via the schema builder is
  reasonable hygiene. Record the decision either way — an unexplained
  `.disable_introspection()` and an unexplained open introspection endpoint
  are both findings.

## Persisted (trusted) operations

The public web client ships a build-time manifest of every operation it can
send, keyed by hash (`references/client-tanstack.md` covers generation). In
production the server executes only manifest hashes: look up the document by
hash, reject unknown hashes with a stable error, and never accept free-form
query text from the public client. Mechanism: the schema's theoretical query
space collapses to an audited allowlist — complexity attacks and data-shape
probing are cut off before validation. Free-form queries stay enabled in
development and for internal tooling behind authentication.

## Request budget and OpenTelemetry tracing

Every request carries a deadline (Tower `TimeoutLayer` around the route), and
tracing is OpenTelemetry end to end: `tracing` spans bridge through
`tracing-opentelemetry` into an OTLP exporter (`opentelemetry-otlp`),
initialized once at startup with a resource that names the service. Wire
async-graphql's tracing extension once in `build_schema()` rather than
instrumenting resolvers by hand, and put the operation name and persisted
document hash on the request span — `graphql.operation.name` per OTel
semantic conventions — so one slow persisted operation is findable across
service boundaries without logging variables (which may hold PII). The same
pipeline carries the gRPC spans of the internal services, which is the point:
one trace follows a public GraphQL request into every internal call.

## Subscriptions

A subscription is a delivery promise: connection lifecycle, auth at connect
and re-auth on token expiry, backpressure, missed-event semantics, and
horizontal fan-out all become your contract. Offer subscriptions only when
that story is owned end to end (a real event source and a deployment that
holds sockets). Otherwise model freshness as queries the client polls with
TanStack Query intervals — polling a cheap persisted operation is a working
system; a half-owned WebSocket topology is an outage schedule.

**Complete when:** domain crates compile without async-graphql, the core owns
the deadpool-postgres pool and no resolver touches SQL or a connection, every
relation resolver batches through a per-request loader, every core error
variant maps exhaustively to a user-error code or the opaque internal error,
depth, complexity, timeout, body, and pool numbers are written down, the
persisted-operation and introspection postures are recorded decisions, spans
export through OpenTelemetry with the operation name, and no subscription
exists without an owned delivery story.
