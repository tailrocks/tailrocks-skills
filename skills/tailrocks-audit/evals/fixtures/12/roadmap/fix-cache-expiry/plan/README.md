# fix-cache-expiry — plan manifest

Parentless package: seeded directly by an audit run, no roadmap item beside
it and no row in any index. Stamped against commit `7c19d40`.

Frozen contract fingerprint: `sha256:41b0…9e2c`

| # | Plan | Status | Session | Done criteria re-run |
|---|------|--------|---------|----------------------|
| 001 | invert the expiry comparison in `get()` and cover it | TODO | — | — |

## Gates

- `bun test src/cache.test.ts ||| bun test --reporter=verbose src/cache.test.ts | tail -1` — the proof prints how many tests executed.
- `bun run lint ||| bun run lint --print-config-summary` — the proof prints the rule count applied.

## Out of scope

- Any change to the cache eviction policy.
- Any change to callers of `get()`.
