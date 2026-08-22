# Contract Gates

The schema is code-first in Rust, but the *contract* is the SDL snapshot
committed at the repository root of the service (`schema.graphql`). Committing
it makes every schema change visible in review as a schema diff, gives codegen
and the diff gate a stable input, and turns "what did the API promise at tag
v1.4" into a `git show` instead of an archaeology project.

## The snapshot and its drift check

A dedicated binary prints the schema with no environment — which is why
`build_schema()` must take no live connections:

```rust
// crates/api/src/bin/print-schema.rs
use api::schema::build_schema;

fn main() {
    // Juniper's SDL export (schema-language feature, enabled by default).
    print!("{}", build_schema().as_sdl());
}
```

CI regenerates and fails on drift; the breaking-change gate then compares the
new snapshot against the mainline baseline. Both run as mise tasks so local
and CI execute identical commands:

```toml
[tasks."schema:snapshot"]
description = "Regenerate the committed SDL snapshot from the Rust schema"
run = "cargo run --quiet --package api --bin print-schema > schema.graphql"

[tasks."schema:check"]
description = "Fail on snapshot drift and on breaking schema changes"
run = [
  "cargo run --quiet --package api --bin print-schema > .artifacts/schema.head.graphql",
  "diff -u schema.graphql .artifacts/schema.head.graphql",
  "git show origin/main:schema.graphql > .artifacts/schema.base.graphql",
  "bun run graphql-inspector diff .artifacts/schema.base.graphql schema.graphql",
]
```

`graphql-inspector` (a Bun devDependency; any equivalent diff tool with
breaking-change semantics is acceptable) exits non-zero on breaking changes by
default. The two checks are distinct failures with distinct fixes: drift means
"run `schema:snapshot` and commit"; a breaking diff means "redesign the change
additively" — never "silence the gate".

## What counts as breaking

Anything that can make a previously valid client operation invalid or change
the meaning of data it already receives:

- Removing or renaming a type, field, argument, or directive a client can
  reach. A rename **is** a removal plus an addition — there is no rename in a
  versionless contract.
- Removing an enum value from output, or adding one clients cannot handle —
  which is why client code switches with a fallback arm; with that convention
  in place, enum *additions* are treated as safe.
- Output nullability loosening: `String!` becoming `String` breaks every
  client that trusted the non-null (the inverse, nullable to non-null on
  output, is safe).
- Input tightening: a new non-null input field or argument without a default,
  or a nullable input becoming non-null — existing operations stop validating.
- Changing a field's type, a default value's semantics, a union's member set
  (removal), or an interface implementation a fragment may rely on.

Additive and safe: new types, new fields, new nullable-or-defaulted inputs,
new enum values (given the fallback convention), new union members (given
fragment fallbacks), and documentation changes. The gate encodes exactly this
split; when the tool's judgment and this list disagree, the stricter reading
wins.

## Deprecation with a dated removal condition

Evolution replaces removal. The old field keeps working while the new one
exists, and its deprecation names both the replacement and the condition under
which it may be removed — with a date:

```graphql
type Invoice implements Node {
  id: ID!
  amountCents: Long!
  totalCents: Long!
    @deprecated(reason: "Use amountCents. Removable after 2026-12-01 once persisted-operation logs show zero use for 30 days.")
}
```

The reason is a contract, not a comment: it must name (1) the replacement,
(2) the earliest removal date, and (3) the evidence that gates removal —
for a persisted-operations client, hash-manifest logs make "zero use" a
measurable fact rather than a hope. Removing a deprecated field is itself a
breaking change: it goes through the same gate, carrying the recorded
approval and the usage evidence. A `@deprecated` with no reason, no date, or
no measurable condition is a finding.

## Versionless evolution

There is no `/v2` endpoint, no `InvoiceV2`, no `submitInvoice2`. Mechanism:
GraphQL clients select fields explicitly, so additions are invisible to
existing operations — the schema can grow indefinitely at one URL, and the
deprecation ledger *is* the version history. A parallel version forks every
client, doubles every gate, and converts the diff-based contract into two
drifting ones. When a change genuinely cannot be expressed additively (a
field's meaning must change), add the new field under a new name, deprecate
the old with the dated condition, and let the gate walk the removal through
its window.

**Complete when:** the committed snapshot regenerates byte-identical from
HEAD, the breaking-change diff against mainline is green or the break carries
recorded approval plus its published deprecation trail, every `@deprecated`
names replacement, date, and measurable removal evidence, and no parallel
version of any endpoint or type exists.
