# TypeScript Source Migration

The Bun/TypeScript project baseline is a prerequisite owned by
`tailrocks-tanstack-project-migrate`. This owner retains only code-semantic work:

1. Stop new `any`, casts, ignored failures, and floating promises.
2. Parse external values and add high-value presentation/domain-view types.
3. Model invalid state and expected failure explicitly.
4. Localize mutation/effects and enable established strict checks.

Each source slice passes the existing Bun typecheck, lint, and focused tests and
preserves external behavior unless explicit compatibility authority names a
contract change.
