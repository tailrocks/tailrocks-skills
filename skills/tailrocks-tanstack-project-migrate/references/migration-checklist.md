# Migration Checklist

## Inventory

- Bun, TypeScript, TanStack, React, Vite, Tailwind, shadcn, and Oxc versions.
- Foreign lockfiles, package-manager commands, test runners, lint/format tools,
  and component systems.
- Generated routes and their owning source/configuration.
- Server-only imports reachable from shared/client modules.
- Raw environment, request, route/search, storage, form, and external data.
- Router/Query duplicate cache ownership.
- Assertions, `any`, floating promises, effect cleanup, and SSR browser globals.
- shadcn configuration, aliases, installed source, semantic tokens, and local
  component modifications.

## Sequence

1. Move installs/scripts to pinned Bun; remove foreign lockfiles and commit
   `bun.lock`.
2. Align official Start/Vite/generated routing before local refactors.
3. Adopt TypeScript 7 and remove unsupported options, `baseUrl`, and TS6 aliases.
4. Establish Oxc/Oxfmt/Bun-test/build gates on current behavior.
5. Seal server/client boundaries and validate environment and external data.
6. Assign each remote datum to Router or Query; remove duplicate caches.
7. Initialize shadcn/Tailwind v4, migrate UI by behavior, then remove the former
   component system.
8. Tighten type-aware rules and add missing boundary, accessibility, and SSR tests.

Each slice leaves a runnable app and stable external behavior. Temporary
exceptions name an owner, reason, removal condition, and narrow scope.

**Complete when:** Bun is the only toolchain, every inventory item is accounted
for, generated output is reproducible, UI behavior/accessibility is preserved,
and no assertion or broad suppression conceals migration debt.
