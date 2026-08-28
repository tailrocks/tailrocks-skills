---
name: tailrocks-grpc-best-practices
description: >-
  Apply cross-service gRPC policy when in-scope work evolves proto or Buf contracts, tonic/prost services, status mapping, deadlines, streaming, health, or wire tests. Use tailrocks-grpc-review for findings. Not for public APIs; those are GraphQL.
argument-hint: "<cross-service gRPC contract evolution>"
license: Apache-2.0
user-invocable: true
---

# gRPC Best Practices

Evolve cross-service contracts between Rust services. Public APIs belong to
`tailrocks-graphql-best-practices`. The adapter uses tonic + prost on Tokio/Tower;
proto tooling is governed by Buf. Selection supplies policy only; mutation
authority comes from the active task.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Verify current official tonic and Buf docs before relying on API
syntax; preserve exact compatible pins.

## Service contract routing

Classify the surface before requested authority. This matrix has precedence over
trigger wording and selects exactly one owner:

| Surface | Requested authority | Sole owner |
|---|---|---|
| Public API | Evolution or mutation | `tailrocks-graphql-best-practices` |
| Public API | Read-only review or audit | `tailrocks-graphql-review` |
| Cross-service Rust contract | Evolution or mutation | `tailrocks-grpc-best-practices` |
| Cross-service Rust contract | Read-only review or audit | `tailrocks-grpc-review` |

If either axis is unresolved, refuse pending classification with `Route: —` and
no mutation. If the selected owner is not this skill, refuse, name only that
owner, and stop without mutation.

## Evolve

1. **Confirm selector and authority.** Continue only for approved gRPC contract
   or service evolution with an exact target and mutation authority from the
   active task. Apply the routing matrix before any work. Browser, third-party,
   grpc-web, and transcoded surfaces are public APIs. A vague gRPC request with
   no resolvable proto, RPC, or adapter target is refused pending scope;
   selection never supplies it. **Complete when:** peers, contract delta,
   compatibility target, exact target, and mutation scope are explicit.
2. **Map the surface.** Locate proto modules, Buf config, codegen, adapters,
   clients, interceptors/layers, health/reflection, and wire tests. **Complete
   when:** every RPC's contract, adapter, error map, deadline, and proof are known.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   |---|---|
   | Proto style, field history, presence, pagination, Buf gates | [`proto-contracts.md`](references/proto-contracts.md) |
   | Codegen, seams, conversions, status, channels, TLS, interceptors | [`tonic-server-client.md`](references/tonic-server-client.md) |
   | Deadlines, retries, streaming, health, shutdown, observability, wire tests | [`operations.md`](references/operations.md) |
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

   **Complete when:** every material wire, adapter, and operational decision has policy.
4. **Contract first.** CI runs Buf lint and breaking gates; generated Rust is
   never hand-edited. Never renumber or reuse a field; reserve removed numbers
   and names. **Complete when:** gates pass or an explicitly user-approved new
   package major has coexistence, consumer migration, and old-version drain proof.
5. **Keep generated types at the edge.** Convert proto to domain types in the
   adapter and map every domain failure to one canonical status code. Internal
   detail never enters `Status`. **Complete when:** domain crates compile without
   tonic/prost and mappings are exhaustive.
6. **Operate deliberately.** Every call has a deadline; servers observe
   cancellation; retries are idempotent and code-limited; health, reflection,
   drain, TLS, metadata, and streaming ownership are explicit. **Complete when:**
   no call runs unbounded or shutdown loses work invisibly.
7. **Test the wire.** Drive a generated client against a spawned server and
   assert statuses, details, deadlines, cancellation, and metadata. **Complete
   when:** every stable wire contract has proof or named risk.
8. **Report evolution.** Name proto/service paths, field-history and compatibility
   decisions, Buf receipts, wire-test counts, skipped gates, and residual rollout
   risk. **Complete when:** no wire delta is hidden.

## gRPC Evolution Report

Return exactly these top-level fields, in order: `Outcome` (`EVOLVED`,
`BLOCKED`, or `REFUSED`), `Scope binding`, `Contract changes`, `Compatibility`,
`Verification`, `Skipped gates`, `Residual risk`, and `Route`. Verification
entries name the command, exit status, and positive executed count; an unrun
gate is skipped, never passed. `Route` is `—` except when the routing matrix
selects another owner; then it names exactly that owner and reason. A refusal
reports `Contract changes` as `none` and performs no mutation. Never emit a
second free-form summary that can contradict these fields.

## Final gate

Account for every RPC pair, field-number history, status mapping, deadline,
idempotency statement, auth metadata, trace propagation, health transition,
shutdown drain, and wire test. Never disable the breaking gate or serialize
internal errors.
