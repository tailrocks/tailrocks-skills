# Bun, TypeScript 7, Oxc, and Quality

## Reproducibility and supply chain

- Pin Bun exactly in `packageManager`; commit `bun.lock`.
- Pin direct dependencies exactly and add them with `bun add --exact`.
- Use `bun ci` in CI; lockfile drift fails.
- Set Bun's minimum package release age in `bunfig.toml`.
- Keep `trustedDependencies` minimal; lifecycle scripts run only after review.
- Upgrade Start, Router, Query, React, Vite, Tailwind, shadcn, TS7, and Oxc as
  one compatibility change with release-note review.

## TypeScript and Oxc

TypeScript 7 owns type checking. Use bundler resolution, explicit Bun/Vite global
types, relative path aliases, `skipLibCheck: false`, and the strict options in the
template. Remove `baseUrl` and TypeScript 6 aliases.

Oxc owns lint/format. Enable type-aware TypeScript, promises, React hooks,
accessibility, import, and unsafe-flow checks. CI denies warnings. Oxfmt writes
locally and checks in CI. Suppress locally with a reason/removal condition.

Dependency Cruiser owns the module graph: no cycles, unresolved imports, reverse
layer edges, route imports from inward modules, or product dependencies from UI
primitives. Consumers enter a feature through its public entry point. Knip owns
unused files, exports, and dependencies. Ratchet brownfield exceptions instead
of broad ignores.

## Bun tests

Use `bun:test`. Preload happy-dom and Testing Library matchers for browser tests;
cleanup after each test. Domain/server tests avoid DOM dependencies. Cover schema
and error translation, route/search validation, Query ownership/invalidation,
server functions through public seams, accessible component behavior, and
hydration-sensitive contracts.

## Gates

After `bun ci`, run `format:check`, `typecheck`, `lint`, `arch`, `hygiene`,
`test`, and `build` from `package.json`. Local and CI entry points are identical.

**Complete when:** no alternative toolchain appears, every direct version is
exact, lifecycle scripts are trusted explicitly, TS7 and Oxc cover source/tests,
and each stable contract has proportionate Bun test evidence.
