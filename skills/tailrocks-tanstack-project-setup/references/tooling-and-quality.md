# Tooling and Quality

Load this reference when changing versions, pnpm policy, TypeScript, Oxc, tests,
or CI.

## Dependency policy

- Pin the exact pnpm release in `packageManager`.
- Pin every direct dependency and dev dependency exactly; avoid range prefixes.
- Commit `pnpm-lock.yaml`; use `pnpm ci` or a frozen-lockfile install in CI.
- Set `saveExact: true` and a minimum release age in `pnpm-workspace.yaml`.
- Upgrade TanStack Start, Router, Query, React, Vite, and their plugins as one
  compatibility set after reading current release and migration notes.
- Keep one runtime version policy in committed configuration and CI.

## TypeScript

Start with `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitReturns`,
`noFallthroughCasesInSwitch`, `noImplicitOverride`,
`noPropertyAccessFromIndexSignature`, `useUnknownInCatchVariables`,
`verbatimModuleSyntax`, and bundler resolution. Relax only a rule the framework or
an external declaration demonstrably cannot satisfy; localize and document the
exception.

Generated files are excluded or generated before typecheck according to upstream
tooling. Never patch generated route output to hide a type error.

## Oxc

Commit one Oxlint config and one Oxfmt config. Enable correctness and suspicious
categories, relevant TypeScript/React plugins, and type-aware analysis. Add
narrow rules for unsafe flow and promises after confirming support in the pinned
Oxc version.

Local formatting writes with `oxfmt`; CI uses `oxfmt --check`. Lint the complete
source/test/config surface and fail CI on warnings or errors according to the
committed policy. Suppress at the smallest scope with a reason and removal
condition.

## Tests

- Unit-test domain functions and schema/error translation without framework IO.
- Test route/search validation and loader behavior at route boundaries.
- Test server functions through their public contract with infrastructure
  adapters replaced at explicit seams.
- Test components by accessible behavior rather than implementation structure.
- Test hydration-sensitive behavior in an SSR-capable integration layer when it
  cannot be proven by unit tests.

Vitest uses jsdom only for browser-facing tests; server/domain tests prefer the
Node environment. Keep fixtures minimal and deterministic.

## Gates

Run these package scripts in CI after a frozen install:

1. `format:check`
2. `typecheck`
3. `lint`
4. `test`
5. `build`

Keep script definitions in `package.json` so local and CI entry points match.

## Completion check

Every tool and dependency resolves exactly, generated code has one owner, strict
checks cover source and tests, each test sits at a stable contract, and local/CI
commands share the same package scripts.
