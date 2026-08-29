---
name: tailrocks-tanstack-project-migrate
description: >-
  Use only when the user explicitly requests this skill. Migrate an existing frontend application to the Bun-only TanStack Start baseline in never-broken, rollback-safe slices while preserving observable behavior. Use project audit for findings and remediate for approved baseline gaps.
argument-hint: "<existing application and approved migration scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TanStack Project Migrate

Move an existing application from a foreign or materially older stack to the
house baseline without breaking it between slices. This is not gap remediation.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`shared-version-policy.md`](references/shared-version-policy.md), the five local
baseline references, and [`migration-checklist.md`](references/migration-checklist.md).
Copied policy does not enlarge the explicit migration scope. Do not produce a
migration-plan artifact; migrate the application directly in verified slices.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Migrate

1. **Bind authority and behavior.** Require explicit source and target stacks,
   mutation scope, allowed paths, exact base revision, dirty state, and rollback
   boundary. The independent before/after oracle covers routes and URLs,
   loaders/actions, server/client semantics, cache behavior, accessibility,
   rendered behavior, and current gates. Refuse an audit-only or gap-only request
   and name its owner. **Complete when:** authority and preservation proof exist.
2. **Inventory every displaced owner.** Record package manager/lockfiles,
   framework, routing/cache, TypeScript, lint/format/test/build tools, component
   system, styling, environment/data boundaries, and business logic placement.
   **Complete when:** nothing can be removed without a named replacement and proof.
3. **Resolve current baseline.** Load the canonical setup references and compare
   [`templates/`](../tailrocks-tanstack-project-setup/templates/); use the setup
   [version resolver](../tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts)
   for exact official pins. Never copy templates blindly over existing bytes.
   **Complete when:** target state and
   compatibility constraints are explicit.
4. **Execute never-broken slices.** Follow the migration checklist order. Before
   each slice capture inspected hashes; stage owner-only writes; compare-and-swap
   only unchanged approved paths; bound command time/output/network/retries and
   terminate children on expiry; preserve concurrent changes; run the same
   focused behavior proof afterward; commit no temporary broad suppression.
   **Complete when:** each slice is runnable and
   independently reversible before the next begins.
5. **Remove old owners only after replacement proof.** Foreign lockfiles,
   configs, routes, caches, components, and packages leave only after the new
   owner passes equivalent behavior/accessibility proof. Product logic moves to
   Rust rather than into TS adapters. **Complete when:** no responsibility has
   two owners or none.
6. **Gate and report.** Run Bun-only install/CI, format, TS7, Oxc, architecture,
   unused-code/dependency, tests, and build after the final slice. Report slice
   receipts, changed paths, preserved flows, removed owners, skips, rollback
   state, and residual risk. **Complete when:** target baseline and behavior both pass.

## Final gate

Prove behavior/accessibility preservation, Bun-only ownership, exact pins,
generated-route integrity, thin GraphQL adapters, validated boundaries, one cache
owner, shadcn/Tailwind semantics, no concurrent byte overwritten, and no former
toolchain/config owner left behind.
