# Mutation and API Safety

Load this reference for readonly design, unsafe escape hatches, absence semantics,
or exported module contracts.

## Mutation boundary

Expose domain values and inputs as readonly by default. Prefer pure updates when
their allocation cost is acceptable. When mutation is required, name it and keep
it inside a builder, reducer implementation, parser, cache, adapter, or measured
hot loop; expose a readonly result.

`readonly` is shallow and compile-time-only. It does not control aliases, data
races, or runtime writes. Freeze values only when the runtime contract requires
freezing.

## Escape hatches

Treat these as findings until justified by a narrow boundary:

- explicit or implicit `any`;
- assertions on untrusted or insufficiently narrowed data;
- non-null assertions and double assertions;
- `@ts-ignore`;
- partial custom guards or exported assertion functions;
- broad index signatures that evade known keys;
- caught values used as `Error` without narrowing;
- promises with no visible owner.

Prefer `unknown` plus narrowing, parser output, discriminated unions,
`satisfies`, precise helper types, and adapters around incorrect dependency
typings. Use `@ts-expect-error` only in intentional type tests or documented
compatibility shims, with a reason that becomes stale when the error disappears.

## Absence

With `exactOptionalPropertyTypes`, distinguish an omitted key from a present key
whose value is absent:

```ts
type Preferences = {
  readonly themeOverride?: "light" | "dark";
  readonly resolvedLocale: Locale | undefined;
};
```

Keep one project convention for `null` and `undefined`. Preserve `null` when a
protocol requires it or it represents a distinct domain state.

## Exported contracts

Use inference inside implementations. Give exported functions, public callbacks,
and module boundaries explicit return types when inference could silently drift
the API. Pass narrow capability interfaces instead of broad service containers.
Expose neither mutable collections nor raw dependency errors without an explicit
contract.

## Completion check

Mutation is locally visible, every escape hatch has a checked boundary and
reason, absence has one meaning per shape, and exported types reveal only stable
capabilities.
