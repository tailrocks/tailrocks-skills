# Stack and Layout

Scaffold with the official TanStack CLI through Bun. Treat generated route-tree
files as generated output; modify route declarations/configuration, never output.

Vite plugin order is semantic: `tanstackStart()` precedes React; Tailwind v4 is
installed with its Vite plugin. Use `@/*` to `./src/*` consistently across TS7,
Vite, shadcn, tests, and imports.

```text
src/
├── routes/          # route declarations, validation, loaders, composition
├── features/        # bounded product capabilities
├── domain/          # framework-independent values and rules
├── server/          # server functions, middleware, repositories, secrets
├── adapters/        # external APIs, storage, serialization
├── components/ui/   # shadcn source owned by the project
├── components/      # composed product components
├── lib/             # narrow shared infrastructure and cn()
├── styles/app.css   # Tailwind v4 and semantic theme variables
├── router.tsx       # Router/Query context wiring
└── env.ts           # validated server/public environment contracts
```

Keep route files thin and feature/domain behavior inward. Shared barrels never
re-export server capabilities. Root route owns document shell, metadata,
error/not-found boundaries, and providers; devtools render only in development.

**Complete when:** generated routing is reproducible, aliases agree everywhere,
each module has one owner, route modules orchestrate rather than implement
domain behavior, and client imports cannot reach server secrets.
