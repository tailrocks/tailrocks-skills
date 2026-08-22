# Tonic Server and Client

Scope: build-owned codegen, crate seams, adapter conversions, status-code
mapping, structured error details, channel construction, TLS between
services, interceptors, and Tower layers.

Resolve every dependency at its latest stable release at execution time
(`cargo add` does this); never copy a version number from prose, including
this file. Current lines split the prost integration out of `tonic` into
`tonic-prost` (runtime codec) and `tonic-prost-build` (codegen) — verify
symbol locations against the docs of the versions the workspace resolves.

## Codegen owned by the build

Dependencies: `tonic`, `prost`, `tonic-prost`, `prost-types`; build
dependency `tonic-prost-build`; `tonic-health`, `tonic-reflection`, and
`tonic-types` where the sections below use them.

`build.rs` in the gRPC adapter crate:

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR")?);
    tonic_prost_build::configure()
        // Required for the reflection service; see operations.md.
        .file_descriptor_set_path(out_dir.join("descriptor.bin"))
        .compile_protos(
            &["proto/tailrocks/inventory/v1/inventory.proto"],
            &["proto"],
        )?;
    Ok(())
}
```

Include the generated module once, in one place:

```rust
pub mod inventory_v1 {
    tonic::include_proto!("tailrocks.inventory.v1");

    pub const FILE_DESCRIPTOR_SET: &[u8] =
        tonic::include_file_descriptor_set!("descriptor");
}
```

- Generated code lives in `OUT_DIR`: never committed, never edited. An edit
  that survives until the next build ships a Rust type that no longer
  matches the wire.
- `buf generate` with the community prost/tonic plugins is the alternative
  when the proto module is a separate repository publishing a generated
  crate. One workspace uses one mechanism, not both — two generators drift.

## Crate seams: the domain never sees prost

The core crate holds domain types and application capabilities and compiles
without tonic, prost, or any transport dependency. The gRPC crate is an
adapter: generated modules, conversions, service impls, server assembly.

Conversions live at the edge, in the adapter crate, as ordinary trait impls:

- `TryFrom<pb::CreateItemRequest> for domain::CreateItem` — fallible,
  because requests arrive from another process and validation happens here,
  once, before the domain is called.
- `From<domain::Item> for pb::Item` — infallible, because the domain type is
  already valid.

```rust
impl TryFrom<pb::CreateItemRequest> for domain::CreateItem {
    type Error = RequestError;

    fn try_from(req: pb::CreateItemRequest) -> Result<Self, Self::Error> {
        Ok(Self {
            sku: req.sku.parse().map_err(|_| RequestError::field("sku"))?,
            quantity: domain::Quantity::new(req.quantity)
                .ok_or_else(|| RequestError::field("quantity"))?,
        })
    }
}
```

Failure scenario the seam prevents: a generated type stored in the domain or
database layer couples every consumer to the proto contract — a v2 package
migration then rewrites persistence and business logic instead of one
adapter, and prost's generated `Option`s and open enums leak "maybe unset"
into code that already proved validity.

The service impl is thin — convert in, call one narrow capability, convert
out, map errors:

```rust
pub struct InventoryGrpc {
    app: Arc<dyn InventoryOps>,
}

#[tonic::async_trait]
impl inventory_service_server::InventoryService for InventoryGrpc {
    async fn create_item(
        &self,
        request: Request<pb::CreateItemRequest>,
    ) -> Result<Response<pb::CreateItemResponse>, Status> {
        let cmd = domain::CreateItem::try_from(request.into_inner())
            .map_err(RequestError::into_status)?;
        let item = self.app.create_item(cmd).await.map_err(to_status)?;
        Ok(Response::new(pb::CreateItemResponse {
            item: Some(item.into()),
        }))
    }
}
```

## Status mapping: one exhaustive function per adapter

Domain errors map to canonical codes in a single `fn to_status(err:
DomainError) -> Status` with an exhaustive match — a new domain variant
fails compilation until someone decides its code, instead of defaulting to
`Internal` at 3 a.m.

| Domain failure class | Code |
|---|---|
| Request invalid regardless of system state (parse, range, malformed id) | `InvalidArgument` |
| Referenced entity does not exist | `NotFound` |
| Create/claim conflicts with an existing entity | `AlreadyExists` |
| State forbids the operation; retrying unchanged will not help | `FailedPrecondition` |
| Concurrency conflict; safe to retry the whole transaction at a higher level | `Aborted` |
| Quota or rate limit exhausted | `ResourceExhausted` |
| Caller unidentified or credentials invalid | `Unauthenticated` |
| Caller identified but not allowed | `PermissionDenied` |
| Transient dependency failure; retrying may help | `Unavailable` |
| Invariant broken — a bug, not an input | `Internal` |

Rules with mechanisms:

- **`Internal` never carries internal detail.** Log the cause once, at the
  mapping point, with the trace/correlation id; return a generic message.
  The `Status` message crosses a trust boundary between teams and ends up in
  the caller's logs — SQL fragments, hostnames, and struct dumps in it are
  an information leak with a long shelf life.
- **Do not fabricate `DeadlineExceeded`, `Cancelled`, or `Unimplemented`.**
  The transport and codegen own those; a handler emitting them lies to
  retry policies and dashboards about what happened.
- **`NotFound` vs `InvalidArgument`:** a well-formed id that matches nothing
  is `NotFound`; an id that could never match anything is
  `InvalidArgument`. Callers cache and branch on the difference.

When the caller must act structurally on a failure, attach `google.rpc`
details with `tonic-types` instead of packing structure into the message:

```rust
use tonic_types::{ErrorDetails, StatusExt};

let mut details = ErrorDetails::new();
details.add_bad_request_violation("quantity", "must be a positive integer");
return Err(Status::with_error_details(
    Code::InvalidArgument,
    "request validation failed",
    details,
));
```

`BadRequest` for per-field violations, `ErrorInfo` for machine-readable
reason/domain, `RetryInfo` to tell clients how long to back off. Clients
read them with `status.get_error_details()`.

## Client construction and channels

A `Channel` multiplexes every call over one HTTP/2 connection and is cheap
to clone. Build it once at startup, store it (or the generated client, also
cheap-clone) in application state, clone per call site.

```rust
let channel = Endpoint::from_shared(cfg.inventory_url.clone())?
    .connect_timeout(Duration::from_secs(2))
    .http2_keep_alive_interval(Duration::from_secs(30))
    .keep_alive_timeout(Duration::from_secs(10))
    .keep_alive_while_idle(true)
    .tls_config(client_tls()?)?
    .connect_lazy();
let inventory = InventoryServiceClient::new(channel);
```

- **Never connect per request.** Each connect pays TCP + TLS + HTTP/2 setup,
  and a churn of short-lived connections defeats keepalive, load reporting,
  and every balancing strategy at once.
- `connect_lazy` keeps startup order out of the dependency graph; the first
  call surfaces `Unavailable`, which the retry policy in
  [`references/operations.md`](operations.md) already handles.
- HTTP/2 keepalives are what actually detect a dead peer behind a silent
  middlebox; without them a hung connection looks identical to a slow one
  until the OS gives up, minutes later.
- Set `max_decoding_message_size`/`max_encoding_message_size` deliberately
  when payloads can exceed the default decode limit (4 MiB); an unexamined
  default here is a latent production failure on the first large page.

## TLS between services

Decide once per deployment and record it:

- **Platform mTLS (service mesh/sidecar):** the mesh authenticates and
  encrypts; tonic listens in plaintext on localhost only. Do not layer app
  TLS on top — double encryption, and certificate rotation now has two
  owners.
- **App-level TLS (no mesh):** rustls-backed tonic TLS, mTLS preferred so
  the server authenticates callers, not just the reverse. Enable exactly one
  TLS backend feature on `tonic` plus a roots feature; check current feature
  names in the tonic docs for the resolved version.

```rust
let tls = ServerTlsConfig::new()
    .identity(Identity::from_pem(cert_pem, key_pem))
    // mTLS: only holders of a cert from this CA may call.
    .client_ca_root(Certificate::from_pem(client_ca_pem));

let client_tls = ClientTlsConfig::new()
    .ca_certificate(Certificate::from_pem(ca_pem))
    .identity(Identity::from_pem(cert_pem, key_pem))
    .domain_name("inventory.internal");
```

Certificates and keys come from the platform's secret store; cite their
location in findings, never their contents.

## Interceptors and Tower layers

Two tools, one rule: an interceptor is synchronous, metadata-only, and
cheap — auth checks, id propagation. Anything async, fallible against a
backend, body-aware, or timing-related is a Tower layer on
`Server::builder().layer(...)`, ordered like any Tower stack: request id,
then trace span, then metrics, then limits.

Auth at the server edge — verify once, inject the verified principal, and
let handlers read the extension instead of re-parsing metadata:

```rust
fn auth(mut req: Request<()>) -> Result<Request<()>, Status> {
    let token = req
        .metadata()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| Status::unauthenticated("missing credentials"))?;
    let principal = verify_token(token)
        .map_err(|_| Status::unauthenticated("invalid credentials"))?;
    req.extensions_mut().insert(principal);
    Ok(req)
}

let svc = InventoryServiceServer::with_interceptor(grpc, auth);
```

With app-level mTLS, the peer identity from `request.peer_certs()` can serve
as the principal instead of a token; with mesh mTLS, trust the mesh-injected
identity headers only from the mesh's own listener.

Tracing propagation is symmetric or traces fragment at every hop: the client
interceptor injects W3C `traceparent` metadata from the current span
context; the server extracts it and parents the per-RPC span on it before
any work runs. Metrics live in a layer recording service, method, and final
status code — the fields [`references/operations.md`](operations.md) builds
alerting on.
