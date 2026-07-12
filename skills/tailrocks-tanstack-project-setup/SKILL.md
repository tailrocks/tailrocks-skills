---
name: tailrocks-tanstack-project-setup
description: Scaffold, migrate, or audit a Bun-only TanStack Start application with TypeScript 7, React, Router, Query, shadcn/ui, Tailwind CSS v4, Oxc, Bun tests, exact versions, and CI gates.
disable-model-invocation: true
---

# TanStack Project Setup

Use one frontend stack: Bun, TypeScript 7, TanStack Start/Router/Query, React,
shadcn/ui, Tailwind CSS v4, and Oxc. Alternative package managers, frameworks,
component systems, linters, formatters, and test runners are outside scope.

## Copy-ready baseline

| Template | Destination |
|---|---|
| `package.json` | `package.json` |
| `bunfig.toml` | `bunfig.toml` |
| `tsconfig.json` | `tsconfig.json` |
| `vite.config.ts` | `vite.config.ts` |
| `oxlint.config.ts` | `oxlint.config.ts` |
| `.oxfmtrc.json` | `.oxfmtrc.json` |
| `components.json` | `components.json` |
| `test/setup.ts` | `test/setup.ts` |
| `dependency-cruiser.config.mjs` | `dependency-cruiser.config.mjs` |
| `knip.json` | `knip.json` |

Versions are a compatible snapshot. Resolve current versions as one stack,
pin every direct package exactly, and commit `bun.lock` with the change.
Read [`version-policy.md`](references/version-policy.md) first and update its
dated table whenever any template version changes.

## Steps

1. **Scaffold.** Use the current official TanStack CLI through Bun and select the
   Start template. Reconcile generated structure with
   [`stack-and-layout.md`](references/stack-and-layout.md).
   **Complete when:** generated route plumbing is intact and each module has a
   route, feature, domain, server, client, adapter, or UI owner.

2. **Install the baseline.** Copy templates, run `bun install`, initialize
   shadcn through the pinned CLI, and read
   [`tooling-and-quality.md`](references/tooling-and-quality.md).
   **Complete when:** exact packages, Bun version, TypeScript, Oxc, Oxfmt,
   Tailwind, tests, and CI resolve from committed config and `bun.lock`.

3. **Establish boundaries.** Read
   [`boundaries-and-data.md`](references/boundaries-and-data.md). Validate server
   function input, environment, route/search params, forms, and external
   responses. Mark execution environment explicitly.
   **Complete when:** secrets cannot reach clients and every untrusted value
   crosses one checked boundary.

4. **Assign data ownership.** Router owns route lifecycle; Query owns shared,
   interactive, invalidated, or background-refetched server state. Share one
   query-options factory between loader preload and components.
   **Complete when:** every remote datum has one cache owner, stable keys,
   semantic freshness, and an invalidation path.

5. **Build UI from shadcn source.** Read
   [`shadcn-ui.md`](references/shadcn-ui.md). Inspect project info, search the
   registry, read component docs, preview changes, then add/compose components.
   **Complete when:** UI uses installed shadcn components, semantic tokens,
   accessible composition, project aliases, and reviewed registry source.

6. **Gate.** Run format check, TS7 typecheck, type-aware lint, architecture,
   unused-code/dependency hygiene, Bun tests, and a production build through
   package scripts.
   **Complete when:** each gate has a recorded pass, failure, unavailability, or
   explicit reason it was not run.

For existing applications, follow
[`migration-checklist.md`](references/migration-checklist.md) in never-broken
slices.

## Final gate

Verify Bun-only commands, exact compatible versions, `bun ci`, TypeScript 7
without compatibility aliases, strict Oxc/Oxfmt, generated route integrity,
architecture and unused-code gates, explicit server/client separation, validated data, single cache ownership,
shadcn composition, Tailwind semantic tokens, SSR-safe behavior, Bun tests, and
production build evidence.
