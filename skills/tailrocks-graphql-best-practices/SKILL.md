---
name: tailrocks-graphql-best-practices
description: >-
  Apply public GraphQL API policy when in-scope work evolves schema, Juniper resolvers, SDL, pagination, or generated clients. Use tailrocks-graphql-review for read-only findings. Not for cross-service communication; that is gRPC.
argument-hint: "<public GraphQL API evolution>"
license: Apache-2.0
user-invocable: true
---

# GraphQL Best Practices

Evolve the public GraphQL API of public backend services. Internal service calls
belong to `tailrocks-grpc-best-practices`. Juniper on Axum serves the adapter;
business logic stays in Rust and generated types keep the TanStack client thin.
Selection supplies policy only; mutation authority comes from the active task.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Verify current official Juniper and Axum docs before relying on
API syntax; preserve exact compatible pins.

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

1. **Confirm selector and authority.** Continue only for approved public-API
   evolution with an exact target and mutation authority from the active task.
   Apply the routing matrix before any work. A vague GraphQL request with no
   resolvable target is refused pending scope; selection never supplies it.
   **Complete when:** consumers, intended contract delta, target, and mutation
   scope are explicit.
2. **Fix the boundary.** Domain crates compile without Juniper; resolvers
   translate and delegate, never decide. **Complete when:** no business rule
   lives in a resolver or React component.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   |---|---|
   | Naming, pagination, IDs, mutations, nullability, polymorphism | [`schema-design.md`](references/schema-design.md) |
   | Juniper layout, loaders, errors, limits, persisted operations | [`server-rust.md`](references/server-rust.md) |
   | Codegen, TanStack Query, fragments, client errors | [`client-tanstack.md`](references/client-tanstack.md) |
   | SDL snapshot, breaking diff, deprecation, evolution | [`contract-gates.md`](references/contract-gates.md) |
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

   **Complete when:** every material schema, server, client, and evolution
   decision has governing policy.
4. **Shape the contract.** Model operations, not tables. Lists default to Relay
   connections; nodes use opaque IDs; each mutation has one input and its own
   payload with typed user errors; fields are non-null unless a reason exists.
   **Complete when:** each delta has a stated shape decision or recorded exception.
5. **Enforce server discipline.** Batch relations per request; map domain errors
   without internal detail; set numeric depth, complexity, timeout, and body
   budgets; use persisted web operations and operation-named OpenTelemetry spans.
   **Complete when:** no per-row fanout, leaked internal message, or implicit limit remains.
6. **Keep the client thin.** Generate types under Bun, key queries by operation
   and variables, colocate fragments, render typed user errors, and keep
   transport failures generic. **Complete when:** no handwritten response type or
   client business rule exists.
7. **Gate every change.** Regenerate the committed SDL, run the breaking-change
   diff, and evolve additively. Deprecations require a dated removal condition.
   Never disable, bypass, or quietly re-snapshot past the gate. **Complete when:**
   snapshot and code agree and the diff is green, or an approved announced
   migration already carries its published deprecation trail.
8. **Report evolution.** Name changed schema elements, client/server paths,
   snapshot and breaking-gate receipts, executed test counts, skipped gates, and
   residual compatibility risk. **Complete when:** no contract delta is hidden.

## GraphQL Evolution Report

Return exactly these top-level fields, in order: `Outcome` (`EVOLVED`,
`BLOCKED`, or `REFUSED`), `Scope binding`, `Contract changes`, `Compatibility`,
`Verification`, `Skipped gates`, `Residual risk`, and `Route`. Verification
entries name the command, exit status, and positive executed count; an unrun
gate is skipped, never passed. `Route` is `—` except when the routing matrix
selects another owner; then it names exactly that owner and reason. A refusal
reports `Contract changes` as `none` and performs no mutation. Never emit a
second free-form summary that can contradict these fields.

## Final gate

Account for every schema delta, list shape, nullability choice, mutation payload,
loader, numeric limit, persisted-operation rule, dated deprecation, generated
client type, and error mapping. Log internal errors once with correlation context;
never expose them through GraphQL `message`.
