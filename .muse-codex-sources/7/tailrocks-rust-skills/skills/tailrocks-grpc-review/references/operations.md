# Operations

Scope: deadlines and cancellation, retry policy, streaming judgement, health
checking, reflection policy, graceful shutdown, load balancing, observability,
and wire-level contract tests.

## Deadlines are mandatory

Every client call carries a deadline. Tonic transmits it as `grpc-timeout`
metadata so the server and every hop can see the remaining budget.

```rust
let mut request = Request::new(pb::GetItemRequest { id });
request.set_timeout(Duration::from_millis(800));
let response = client.get_item(request).await?;
```

- Choose the value per RPC from the callee's measured latency budget, not one
  global constant. A channel-level `.timeout(...)` may serve as the ceiling,
  with per-call overrides for expensive RPCs.
- **Propagate the budget.** A service calling downstream derives the child
  deadline from its own remaining budget minus its remaining work — never a
  fresh full deadline. Mechanism of the failure: with fresh deadlines at
  every hop, work continues far downstream long after the original caller
  gave up. Under load that abandoned work is what finishes the service
  off.
- `Server::builder().timeout(...)` is the server-side backstop for clients
  that violate the rule. It bounds the damage. It does not excuse the
  client.

Without deadlines the failure mode is total. One stuck dependency pins its
callers' tasks and connections. Their callers pin theirs. The outage
propagates upstream until memory or connection limits fail services that
were themselves healthy.

## Cancellation on the server

When the deadline expires or the caller disconnects, tonic drops the handler
future at its next await point. Three obligations follow:

- **Handlers are cancel-safe.** No half-applied state across an `.await`
  without transactional protection. A cancellation between two writes must
  not strand the first.
- **Side effects that must complete once started are spawned** into an
  owned, tracked task. It survives the RPC and is drained at shutdown. The
  RPC's cancellation stops the response, not the committed work.
- **Stop working when cancelled**. Work that continues after the caller is
  gone is pure waste. Cancellations spike exactly when the service is
  overloaded. The retry storm arrives at the same moment.

## Retry policy

Retry only when both conditions hold. The RPC is idempotent — stated in its
proto comment, which is the source of truth per
[`references/proto-contracts.md`](proto-contracts.md). The status code is
worth retrying.

- Retry `Unavailable` (transient by definition). Retry `ResourceExhausted`
  only while honoring a `RetryInfo` backoff. Retry `Aborted` at the
  application layer that owns the transactional retry loop.
- Never retry: `InvalidArgument`, `NotFound`, `AlreadyExists`,
  `FailedPrecondition`, `PermissionDenied`, `Internal` — the answer will not
  change. Never re-spend an exhausted budget on `DeadlineExceeded`.
- Every retry lives inside the original deadline. Use bounded attempts,
  exponential backoff with jitter, and a metric so retry volume is visible
  before it becomes a storm.
- A non-idempotent mutation that must survive retries carries a
  client-generated `request_id` field the server deduplicates. Only then may
  the caller resend, and the proto comment says so.
- tonic channels do not implement gRPC service-config retries, and that is
  fine. Retries are explicit: a Tower retry layer on the client or a small
  helper. The policy is visible in code review instead of hidden in config
  resolution.

## Streaming judgement

Unary is the default. It is simpler at every layer that has to reason about
the RPC: deadlines, retries, balancing, tests.

- **Server-streaming earns its cost** when the consumer processes results
  incrementally or the result set is unbounded — exports, tail/watch feeds.
  "The list is big" is what pagination is for. Do not stream to dodge page
  tokens.
- **Backpressure is a bounded channel.** A full channel suspends the
  producer — that suspension is the backpressure. A `send` error means the
  client is gone: stop producing, do not log-and-continue.

```rust
async fn watch_items(
    &self,
    request: Request<pb::WatchItemsRequest>,
) -> Result<Response<Self::WatchItemsStream>, Status> {
    let mut events = self.app.subscribe(request.into_inner().try_into()?);
    let (tx, rx) = tokio::sync::mpsc::channel(16);
    tokio::spawn(async move {
        while let Some(event) = events.next().await {
            if tx.send(Ok(event.into())).await.is_err() {
                break; // Client disconnected; stop producing.
            }
        }
    });
    Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
}
```

- Client-streaming and bidirectional streaming are rare. Each use states in
  the design why request/response framing cannot express it.

## Health checking

Wire `grpc.health.v1` via `tonic-health` and drive it honestly:

```rust
let (health_reporter, health_service) = tonic_health::server::health_reporter();
health_reporter
    .set_serving::<InventoryServiceServer<InventoryGrpc>>()
    .await;
```

- Flip to `NOT_SERVING` when a hard dependency is down. Flip first thing
  when shutdown begins, so balancers and Kubernetes gRPC probes route away
  before the listener closes.
- Probes point at the health service, not at a business RPC. A business RPC
  as a probe turns every deploy of a dependency into a restart loop.

## Server reflection

Register `tonic-reflection` from the descriptor set the build already
produces (`file_descriptor_set_path` in `build.rs` — see
[`references/tonic-server-client.md`](tonic-server-client.md)):

```rust
let reflection = tonic_reflection::server::Builder::configure()
    .register_encoded_file_descriptor_set(inventory_v1::FILE_DESCRIPTOR_SET)
    .build_v1()?;
```

Tailrocks architecture choice: every gRPC listener is internal, and
reflection stays enabled. gRPC itself permits public listeners. Inside the
trust boundary, live inspection with `buf curl` or `grpcurl` during an
incident outweighs schema secrecy. Reflection must never ride a listener
that is reachable from outside that boundary. If such a listener exists,
the listener is the defect to fix, not the reflection service.

## Graceful shutdown

```rust
Server::builder()
    .layer(observability_stack)
    .add_service(health_service)
    .add_service(reflection)
    .add_service(InventoryServiceServer::with_interceptor(grpc, auth))
    .serve_with_shutdown(addr, shutdown_signal())
    .await?;
```

Drain order on SIGTERM:

1. Health to `NOT_SERVING`, so new traffic routes away.
2. Trigger the shutdown future. `serve_with_shutdown` stops accepting and
   waits for in-flight RPCs.
3. Cancel long-lived streams explicitly (a `CancellationToken` or watch
   channel the producers select on). Watch-style streams never end on their
   own, and an un-cancelled stream keeps the drain from ever completing.
4. Drain owned background tasks, bounded by a drain deadline shorter than
   the platform's kill timeout — a drain that outlives SIGKILL did not
   happen.

## Load balancing

One HTTP/2 connection carries all of a client's streams. An L4 balancer
balances connections, so every request from a given client rides one backend
for the connection's lifetime. The fleet looks balanced by connection count
and lopsided by request count. One hot client can pin one replica. This
never shows up in staging with a single replica. It is found in production
unless decided up front. Choose per service and record it:

- **L7 proxy or service mesh** balancing per-request — the default when a
  mesh exists.
- **Client-side balancing** (`Channel::balance_list`, DNS re-resolution)
  when there is no proxy in the path.

## Observability

- One tracing span per RPC, parented from `traceparent` metadata. Record
  `rpc.system = "grpc"`, `rpc.service`, `rpc.method`, and
  `rpc.grpc.status_code` at completion. These are the OpenTelemetry
  semantic-convention names, so dashboards work across services.
- Metrics: request count and latency histograms labeled by service, method,
  and status code. The status-code distribution is the alerting signal. A
  rising `Internal` or `Unavailable` rate is an incident even while latency
  looks healthy. It is also the v1-drain evidence the migration procedure in
  [`references/proto-contracts.md`](proto-contracts.md) relies on.
- The error cause is logged once, at the status-mapping point, with the
  trace id — not at every layer it passes through.

## Contract tests on the wire

Unit tests of the service impl never execute the codec, the interceptors,
the Tower stack, or the status mapping. That is where cross-service defects
actually live. Contract tests spawn the real server on an ephemeral port and
drive the generated client across it:

```rust
async fn spawn_server() -> std::net::SocketAddr {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    let incoming = TcpListenerStream::new(listener);
    tokio::spawn(
        Server::builder()
            .add_service(InventoryServiceServer::with_interceptor(
                test_service(),
                auth,
            ))
            .serve_with_incoming(incoming),
    );
    addr
}

#[tokio::test]
async fn missing_item_maps_to_not_found_without_internal_detail() {
    let addr = spawn_server().await;
    let mut client = InventoryServiceClient::connect(format!("http://{addr}"))
        .await
        .unwrap();

    let status = client
        .get_item(pb::GetItemRequest { id: "missing".into() })
        .await
        .unwrap_err();

    assert_eq!(status.code(), Code::NotFound);
    assert!(
        !status.message().contains("SELECT"),
        "internal detail leaked into Status: {}",
        status.message()
    );
}
```

Cover, at minimum, every deliberately returned status code per RPC. Cover
auth rejection (`Unauthenticated` and `PermissionDenied`). Cover deadline
behavior (a handler stalled past the client timeout yields `DeadlineExceeded`
at the client). Cover stream termination on client drop and the message-size
limit. These tests are the executable form of the contract comments. When one
fails, the contract or the comment is wrong. Both are fixable in review
instead of in an incident.
