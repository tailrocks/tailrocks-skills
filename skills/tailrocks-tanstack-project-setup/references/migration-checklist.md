# Migration Checklist

Load this reference before hardening an existing TanStack Start application.

## Inventory

- Current TanStack Start, Router, Query, React, Vite, TypeScript, pnpm, and Oxc
  versions plus peer constraints.
- Generated route files and the source/configuration that owns them.
- Server-only imports reachable from shared or client modules.
- Raw environment, request, route/search, storage, and external response access.
- Router loader data and Query caches, including duplicate ownership.
- Assertions, `any`, floating promises, effect cleanup, and SSR browser-global
  access.
- Existing package scripts, tests, CI install mode, and lockfile drift.

## Sequence

1. Pin pnpm and current direct dependencies; regenerate and commit one lockfile.
2. Align the official Start/Vite/generated-route surface before local refactors.
3. Establish format, typecheck, lint, test, and build scripts using current
   behavior as the initial gate.
4. Seal server/client import boundaries and validate environment variables.
5. Parse route/search/request/external values before domain use.
6. Assign each remote datum to Router or Query and remove duplicate caches.
7. Tighten TypeScript and type-aware lint rules in coherent slices.
8. Add missing boundary and SSR tests; make all gates blocking.

Each slice leaves the app runnable and keeps external behavior stable unless the
migration explicitly changes a contract. A temporary exception names its owner,
reason, removal condition, and narrow scope.

## Completion check

Every inventory item is accounted for, every slice has a rollback-sized diff and
passing gate record, generated output is reproducible, and no assertion or broad
suppression conceals migration debt.
