---
name: tailrocks-grpc-best-practices
description: >-
  Apply cross-service gRPC policy when in-scope work evolves proto or Buf contracts, tonic/prost services, status mapping, deadlines, streaming, health, or wire tests. Use tailrocks-grpc-review for findings. This skill is not for public APIs. Those are GraphQL.
argument-hint: "<cross-service gRPC contract evolution>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User evolves a cross-service gRPC contract in authorized work.
---

# gRPC Best Practices

## Use this skill

This skill evolves cross-service contracts between Rust services. The
adapter uses tonic plus prost on Tokio and Tower. Buf governs proto
tooling.

Use this skill when in-scope work evolves proto contracts, Buf gates,
tonic or prost services, or wire tests. It also covers status mapping,
deadlines, streaming, and health. Do not use this skill for public APIs
or read-only findings. Public APIs belong to
`tailrocks-graphql-best-practices`. Read-only findings belong to
`tailrocks-grpc-review`.

## Before you start

Obey the active user request first. Selection supplies policy only.
Mutation authority comes from the active task.

Before any action, read `references/runtime-trust.md`. Verify current
official tonic and Buf docs before relying on API syntax. Preserve exact
compatible pins.

Classify the surface before requesting authority. This matrix has
precedence over trigger wording and selects exactly one owner:

| Surface | Authority | Owner |
| --- | --- | --- |
| Public API | Evolve or mutate | `tailrocks-graphql-best-practices` |
| Public API | Review or audit | `tailrocks-graphql-review` |
| Cross-service contract | Evolve or mutate | `tailrocks-grpc-best-practices` |
| Cross-service contract | Review or audit | `tailrocks-grpc-review` |

If either axis is unresolved, refuse pending classification with `Route:
—`. Do not mutate. If the selected owner is not this skill, refuse. Name
only that owner. Stop without mutation.

The skill accepts one argument: the cross-service gRPC contract
evolution.

## Procedure

1. **Confirm selector and authority.** Continue only for approved gRPC
   contract or service evolution with an exact target and mutation
   authority from the active task. Apply the routing matrix before any
   work. Browser, third-party, grpc-web, and transcoded surfaces are
   public APIs. If a gRPC request is vague with no resolvable proto, RPC,
   or adapter target, refuse it pending scope. Selection never supplies
   scope. This step is complete when peers, contract delta, compatibility
   target, exact target, and mutation scope are explicit.
2. **Map the surface.** Locate proto modules, Buf config, codegen,
   adapters, clients, interceptors and layers, health and reflection,
   and wire tests. This step is complete when every RPC contract,
   adapter, error map, deadline, and proof is known.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   | --- | --- |
   | Proto style, field history, presence, pagination, Buf gates | [`proto-contracts.md`](references/proto-contracts.md) |
   | Codegen, seams, conversions, status, channels, TLS, interceptors | [`tonic-server-client.md`](references/tonic-server-client.md) |
   | Deadlines, retries, streaming, health, shutdown, observability, wire tests | [`operations.md`](references/operations.md) |

   This step is complete when every material wire, adapter, and
   operational decision has policy.
4. **Contract first.** Run Buf lint and breaking gates in CI. Never
   hand-edit generated Rust. Never renumber or reuse a field. Reserve
   removed numbers and names. This step is complete when gates pass, or
   an explicitly user-approved new package major has coexistence,
   consumer migration, and old-version drain proof.
5. **Keep generated types at the edge.** Convert proto to domain types in
   the adapter. Map every domain failure to one canonical status code.
   Keep internal detail out of `Status`. This step is complete when
   domain crates compile without tonic or prost and mappings are
   exhaustive.
6. **Operate deliberately.** Give every call a deadline. Observe
   cancellation on servers. Limit retries to idempotent calls with code
   limits. Keep health, reflection, drain, TLS, metadata, and streaming
   ownership explicit. This step is complete when no call runs unbounded
   and no shutdown loses work invisibly.
7. **Test the wire.** Drive a generated client against a spawned server.
   Assert statuses, details, deadlines, cancellation, and metadata. This
   step is complete when every stable wire contract has proof or named
   risk.
8. **Report evolution.** Name proto and service paths, field-history and
   compatibility decisions, Buf receipts, wire-test counts, skipped
   gates, and residual rollout risk. This step is complete when no wire
   delta stays hidden.

## Result

Return exactly these top-level fields in order:

- `Outcome`: `EVOLVED`, `BLOCKED`, or `REFUSED`.
- `Scope binding`
- `Contract changes`
- `Compatibility`
- `Verification`
- `Skipped gates`
- `Residual risk`
- `Route`

Verification entries name the command, exit status, and positive executed
count. An unrun gate is skipped, never passed. `Route` is `—` except when
the routing matrix selects another owner. Then it names exactly that
owner and reason. A refusal reports `Contract changes` as `none` and
performs no mutation. Never emit a second free-form summary that can
contradict these fields.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The change accounts for every RPC pair, field-number history, status
  mapping, deadline, and idempotency statement.
- The change accounts for every auth metadata, trace propagation, health
  transition, shutdown drain, and wire test.
- The change never disables the breaking gate and never serializes
  internal errors.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/proto-contracts.md` in steps 2 and 4 for proto style,
  field history, presence, pagination, and Buf gates.
- Read `references/tonic-server-client.md` in steps 2 and 5 for codegen,
  seams, conversions, status, channels, TLS, and interceptors.
- Read `references/operations.md` in steps 2, 6, and 7 for deadlines,
  retries, streaming, health, shutdown, observability, and wire tests.
