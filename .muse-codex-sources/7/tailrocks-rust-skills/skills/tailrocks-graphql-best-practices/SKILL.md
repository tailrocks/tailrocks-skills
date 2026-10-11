---
name: tailrocks-graphql-best-practices
description: >-
  Apply public GraphQL API policy when in-scope work evolves schema, Juniper resolvers, SDL, pagination, or generated clients. Use tailrocks-graphql-review for read-only findings. This skill is not for cross-service communication. That is gRPC.
argument-hint: "<public GraphQL API evolution>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User evolves the public GraphQL API in authorized work.
---

# GraphQL Best Practices

## Use this skill

This skill evolves the public GraphQL API of public backend services.
Juniper on Axum serves the adapter. Business logic stays in Rust.
Generated types keep the TanStack client thin.

Use this skill when in-scope work evolves schema, Juniper resolvers, SDL,
pagination, or generated clients. Do not use this skill for cross-service
communication or read-only findings. Cross-service communication belongs
to `tailrocks-grpc-best-practices`. Read-only findings belong to
`tailrocks-graphql-review`.

## Before you start

Obey the active user request first. Selection supplies policy only.
Mutation authority comes from the active task.

Before any action, read `references/runtime-trust.md`. Verify current
official Juniper and Axum docs before relying on API syntax. Preserve
exact compatible pins.

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

The skill accepts one argument: the public GraphQL API evolution.

## Procedure

1. **Confirm selector and authority.** Continue only for approved
   public-API evolution with an exact target and mutation authority from
   the active task. Apply the routing matrix before any work. If a
   GraphQL request is vague with no resolvable target, refuse it pending
   scope. Selection never supplies scope. This step is complete when
   consumers, intended contract delta, target, and mutation scope are
   explicit.
2. **Fix the boundary.** Keep Juniper out of domain crates. Translate in
   resolvers. Delegate to domain crates. Decide nothing in resolvers.
   This step is complete when no business rule lives in a resolver or
   React component.
3. **Load only relevant references.** Choose the minimum set:

   | Decision | Reference |
   | --- | --- |
   | Naming, pagination, IDs, mutations, nullability, polymorphism | [`schema-design.md`](references/schema-design.md) |
   | Juniper layout, loaders, errors, limits, persisted operations | [`server-rust.md`](references/server-rust.md) |
   | Codegen, TanStack Query, fragments, client errors | [`client-tanstack.md`](references/client-tanstack.md) |
   | SDL snapshot, breaking diff, deprecation, evolution | [`contract-gates.md`](references/contract-gates.md) |

   This step is complete when every material schema, server, client, and
   evolution decision has governing policy.
4. **Shape the contract.** Model operations, not tables. Default lists to
   Relay connections. Use opaque IDs for nodes. Give each mutation one
   input and its own payload with typed user errors. Keep fields
   non-null unless a reason exists. This step is complete when each delta
   has a stated shape decision or recorded exception.
5. **Enforce server discipline.** Batch relations per request. Map domain
   errors without internal detail. Set numeric depth, complexity,
   timeout, and body budgets. Use persisted web operations and
   operation-named OpenTelemetry spans. This step is complete when no
   per-row fanout, leaked internal message, or implicit limit remains.
6. **Keep the client thin.** Generate types under Bun. Key queries by
   operation and variables. Colocate fragments. Render typed user
   errors. Keep transport failures generic. This step is complete when no
   handwritten response type or client business rule exists.
7. **Gate every change.** Regenerate the committed SDL. Run the
   breaking-change diff. Evolve additively. Require a dated removal
   condition for each deprecation. Never disable, bypass, or quietly
   re-snapshot past the gate. This step is complete when snapshot and
   code agree and the diff is green, or an approved announced migration
   already carries its published deprecation trail.
8. **Report evolution.** Name changed schema elements with client and
   server paths. Name snapshot and breaking-gate receipts, executed test
   counts, skipped gates, and residual compatibility risk. This step is
   complete when no contract delta stays hidden.

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

- The change accounts for every schema delta, list shape, nullability
  choice, mutation payload, and loader.
- The change accounts for every numeric limit, persisted-operation rule,
  dated deprecation, generated client type, and error mapping.
- The code logs internal errors once with correlation context. It never
  exposes them through GraphQL `message`.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/schema-design.md` in steps 2 and 4 for naming,
  pagination, IDs, mutations, nullability, and polymorphism.
- Read `references/server-rust.md` in steps 2 and 5 for Juniper layout,
  loaders, errors, limits, and persisted operations.
- Read `references/client-tanstack.md` in step 6 for codegen, TanStack
  Query, fragments, and client errors.
- Read `references/contract-gates.md` in step 7 for SDL snapshot,
  breaking diff, deprecation, and evolution.
