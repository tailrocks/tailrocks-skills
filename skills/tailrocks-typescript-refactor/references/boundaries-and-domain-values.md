# Boundaries and Domain Values

Load this reference when data enters from IO or when raw primitives can violate
or confuse domain invariants.

## Parse from `unknown`

Treat HTTP/RPC/SDK responses, request inputs, environment variables, JSON,
storage, files, CLI input, database driver values, and cross-process/package
messages as untrusted unless a stronger runtime contract proves otherwise.

At each trust boundary:

1. Hold the raw value as `unknown`.
2. Parse every required property with a runtime schema or complete validator.
3. Translate parse failure into the boundary's established error contract.
4. Pass only parsed output into domain code.

A type assertion is not validation. A custom guard or assertion function earns
its claimed type only by checking every required property.

Choose unknown-key behavior per protocol:

- Strip for read-only responses when forward compatibility matters.
- Reject for configuration, commands, signed payloads, and write APIs when extra
  keys indicate misuse or tampering.
- Preserve only through an explicit passthrough contract.

## Domain primitives

Use an opaque value when two raw primitives are meaningfully confusable or when a
primitive has a runtime invariant. Prefer the project's schema-backed brand. A
local unique-symbol brand is acceptable when its assertion is sealed behind a
runtime check:

```ts
declare const positiveCentsBrand: unique symbol;

export type PositiveCents = number & {
  readonly [positiveCentsBrand]: "PositiveCents";
};

export function parsePositiveCents(input: unknown): PositiveCents | undefined {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input <= 0) {
    return undefined;
  }
  return input as PositiveCents;
}
```

Keep raw construction private. Export `parse`, `from`, or `tryFrom`. A class used
as a nominal value needs a private instance member or ECMAScript `#private`
brand; a private constructor alone does not defeat structural compatibility.

Brands are not decoration. Plain values stay plain when confusion and invalidity
carry no meaningful risk.

## Completion check

No external value reaches domain logic through `any`, a cast, or a partial guard;
unknown-key policy is explicit; and each opaque domain value has exactly one
checked construction boundary.
