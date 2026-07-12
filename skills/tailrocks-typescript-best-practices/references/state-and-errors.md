# State and Errors

Load this reference when modeling alternatives, transitions, absence, or expected
failure.

## Closed state

Use a discriminated union when fields depend on a mode. Each variant carries only
the data valid in that state:

```ts
type RequestState<T, E> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "failure"; readonly error: E };
```

Prefer named transition functions, reducers, or command handlers over scattered
field mutation. A rejected normal transition returns a typed failure.

Handle variants exhaustively. Use the project's existing helper or a `never`
check:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
```

Use `satisfies Record<Union, Value>` for exhaustive lookup maps. A runtime
fallback handles version skew only after parsing the raw value into an explicit
unknown variant or deliberate failure; it must not erase compile-time coverage.

## Failure channel

Use the repository's established `Result`, `Either`, `Effect`, or tagged-error
convention. For a small isolated scope with no convention:

```ts
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Choose deliberately:

| Condition | Contract |
|---|---|
| Expected caller-recoverable domain failure | `Result<T, E>` or equivalent |
| Ordinary absence | `T | undefined` or local `Option` |
| Invalid external input | Parser result with structured issues |
| Known dependency exception | Catch in adapter; translate to domain error |
| Broken invariant/programmer defect | Throw or fail fast |
| Unknown thrown value | Preserve as unexpected after safe context |

Make expected errors a closed union carrying the context a caller needs. Each
caller handles every variant, maps it to a documented higher-level error, or
propagates it through the existing composition mechanism.

`Result<T, unknown>` usually hides classification. A leaf helper that cannot
meaningfully fail stays infallible. Logging alone consumes an error only when the
API explicitly promises best-effort behavior.

## Completion check

Every state combination is valid, every transition has one owner, every expected
failure is visible to its responsible caller, and exhaustive handling fails at
compile time when a new variant appears.
