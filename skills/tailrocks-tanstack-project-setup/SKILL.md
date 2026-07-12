---
name: tailrocks-tanstack-project-setup
description: Scaffold, migrate, or audit a strict TanStack Start React application with pnpm, Vite, TypeScript, Oxc, Router, Query, validated server boundaries, tests, exact versions, and CI gates.
disable-model-invocation: true
---

# TanStack Project Setup

Build one reproducible full-stack React baseline. Use current upstream TanStack,
Vite, Oxc, and pnpm documentation whenever their syntax or package surface may
have changed; preserve stronger compatible local policy.

## Copy-ready baseline

Copy and adapt these files instead of reconstructing configuration:

| Template | Destination |
|---|---|
| `package.json` | `package.json` |
| `pnpm-workspace.yaml` | `pnpm-workspace.yaml` |
| `tsconfig.json` | `tsconfig.json` |
| `vite.config.ts` | `vite.config.ts` |
| `oxlint.config.ts` | `oxlint.config.ts` |
| `.oxfmtrc.json` | `.oxfmtrc.json` |
| `vitest.config.ts` | `vitest.config.ts` |

The versions are a reproducible snapshot, not an instruction to remain stale.
For a new setup, resolve current mutually compatible releases, pin every direct
dependency exactly, and commit `pnpm-lock.yaml` in the same change.

## New application

1. **Scaffold.** Use the current official TanStack CLI with pnpm, then reconcile
   the generated application with
   [`stack-and-layout.md`](references/stack-and-layout.md). Prefer generated route
   plumbing over hand-written framework internals.
   **Complete when:** the app starts from official generated structure and every
   source file has a clear route, domain, server, client, or adapter owner.

2. **Install strict tooling.** Copy the templates, update exact versions as one
   compatibility set, and read
   [`tooling-and-quality.md`](references/tooling-and-quality.md).
   **Complete when:** pnpm, dependencies, TypeScript, Oxc, Oxfmt, Vitest, and CI
   all resolve from committed single-source configuration and lock state.

3. **Establish boundaries.** Read
   [`boundaries-and-data.md`](references/boundaries-and-data.md). Validate server
   function input, environment variables, route/search params, and external
   responses before domain use. Mark server-only and client-only code explicitly.
   **Complete when:** secrets cannot enter client bundles and every untrusted value
   crosses one checked boundary.

4. **Assign data ownership.** Let Router own navigation and route lifecycle; use
   Query for shared, interactive, invalidated, or background-refetched server
   state. Preload Query data from loaders through shared query options when both
   layers need it.
   **Complete when:** every remote datum has one cache owner, stable keys, defined
   freshness, and an invalidation path.

5. **Test and gate.** Add boundary, route, component, and server tests at stable
   contracts. Run format check, typecheck, type-aware lint, tests, and production
   build through package scripts.
   **Complete when:** every gate has a recorded pass, failure, unavailability, or
   explicit reason it was not run.

## Existing application migration

Read [`migration-checklist.md`](references/migration-checklist.md). Inventory the
generated framework surface, package/version drift, trust boundaries, cache
ownership, and current gates before editing. Migrate one layer at a time while
keeping a runnable application and committed lockfile.

**Complete when:** every checklist item is satisfied, represented by a narrow
documented exception with an owner, or recorded as a specific blocker.

## Final gate

Verify exact compatible versions, frozen-lockfile CI, strict TypeScript, Oxc and
Oxfmt gates, generated route integrity, explicit server/client separation,
validated inputs and environment, single cache ownership, SSR-safe behavior,
focused tests, and a successful production build record.
