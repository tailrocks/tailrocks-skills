# TypeScript Language Testing

Bun owns tests. Use `bun:test`, preload happy-dom only for browser-facing tests,
cleanup Testing Library state after each test, and prefer accessible behavior.
Runtime tests cover parsing, errors, transitions, adapters, async cleanup, and
mutation. Type tests use reasoned `@ts-expect-error` only for public constraints.

**Complete when:** runtime behavior has runtime proof, high-value public type
constraints have focused compile-time proof, and no test duplicates project
tooling policy owned by the TanStack project family.
