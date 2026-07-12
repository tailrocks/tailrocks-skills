# TypeScript 7, Oxc, Bun Test, and Migration

TypeScript 7 is the only compiler. It provides native `tsc`, enables `strict`
and side-effect import checking by default, removes `baseUrl`, and defaults
`types` to empty. Keep critical policy explicit:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "noUncheckedSideEffectImports": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true,
    "skipLibCheck": false,
    "types": ["bun", "vite/client"]
  }
}
```

Paths are relative to the config (`"@/*": ["./src/*"]`). Set `rootDir`
explicitly when emitting or project layout requires it. TypeScript 7.0 has no
compiler API; use Oxc and API-independent tools rather than installing a hidden
TypeScript 6 alias.

Use type-aware Oxc correctness, suspicious, promise, React hooks, accessibility,
and unsafe-flow rules. CI denies warnings. A suppression is local, reasoned, and
names its removal condition.

Use Dependency Cruiser for import-graph invariants that a file-local linter
cannot prove: cycles, unresolved imports, layer direction, route isolation, and
entry-point-only feature access. Use Knip for unused files, exports, and direct
dependencies. Known violations enter a shrink-only baseline; unlisted violations
fail immediately.

Bun owns tests. Use `bun:test`, preload happy-dom only for browser-facing tests,
cleanup Testing Library state after each test, and prefer accessible behavior.
Runtime tests cover parsing, errors, transitions, adapters, async cleanup, and
mutation. Type tests use reasoned `@ts-expect-error` only for public constraints.

Migration order:

1. Move install/scripts/tests to Bun and commit `bun.lock`.
2. Adopt TypeScript 7 config; remove unsupported options and `baseUrl`.
3. Stop new `any`, casts, ignored failures, and floating promises.
4. Parse external values and add high-value domain types.
5. Model invalid state and expected failure explicitly.
6. Localize mutation/effects and enable remaining strict checks.

Each slice passes `bun run typecheck`, `bun run lint`, and `bun test` and preserves
external behavior unless the migration explicitly changes a contract.
