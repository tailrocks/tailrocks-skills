# Stack and Layout

Load this reference when scaffolding, assigning modules, or auditing generated
TanStack Start structure.

## Scaffold from upstream

Use the current official TanStack CLI and select pnpm. Treat generated route-tree
and framework files as generated surfaces; modify their inputs, not their output.

The Vite plugin order is semantic: `tanstackStart()` precedes the React plugin.
Keep TypeScript on bundler module resolution and React JSX. Use one source alias
(`~/*` to `src/*`) consistently across TypeScript, Vite, tests, and imports.

## Ownership

Organize by responsibility rather than framework bucket size:

```text
src/
├── routes/          # route declarations, loaders, page composition
├── features/        # bounded product capabilities
├── domain/          # framework-independent values and rules
├── server/          # server functions, middleware, repositories, secrets
├── adapters/        # external APIs, storage, serialization
├── components/      # genuinely shared presentation
├── router.tsx       # router and Query context wiring
└── env.ts           # validated environment contracts
```

Keep route files thin: validate route/search input, preload data, and compose a
feature. Put reusable domain behavior outside route modules. Keep server-only
imports under explicit server boundaries; a shared barrel must not re-export
server capabilities.

Use the generated root route for document shell, head metadata, error/not-found
boundaries, and provider wiring. Place devtools behind a development condition.

## Completion check

The route tree is generated from declared routes, aliases resolve identically in
all tools, each module has one owner, route modules remain orchestration seams,
and no shared/client import graph reaches server secrets or infrastructure.
