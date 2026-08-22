# Readability, Style, and Architecture

Scope: source layout, imports, naming, tests, local reasoning, dependency
boundaries, and maintainable project structure.

## Change Scale

Classify changes before editing or reviewing:

- Internal implementation change: require behavior tests; no new panics on
  unhappy paths.
- Public API expansion: scrutinize naming, ownership, compatibility, docs,
  examples, and future evolution.
- New dependency or re-export: scrutinize compile time, maintenance, security,
  feature flags, and boundary leakage.

Split API boundary changes from broad refactors when that keeps diffs
reviewable. Keep unrelated cleanup out of behavior changes.

## Formatting and Imports

- `rustfmt` owns mechanical formatting. No style debates in review unless
  formatting hides meaning.
- Diff-friendly line structure: trailing commas in multiline lists, block
  indentation over visual alignment.
- Module declarations before imports when a file has both.
- Follow local import order. If none exists: standard library, external
  crates, current crate, parent or child modules, then intentional re-exports
  — groups separated by blank lines, each easy to scan.
- Prefer `use crate::...` in larger modules over fragile `super::...` chains
  unless local code consistently uses relative paths.
- Avoid local `use SomeEnum::*` when variant qualification improves
  searchability and clarity.
- For traits from modules such as `std::fmt` or `std::ops`, importing the
  module and writing `fmt::Display` or `ops::Deref` often makes the origin
  clearer.
- Use re-exports sparingly: they create multiple valid paths to one item and
  may become public API commitments.

## Item Order

Optimize files for a first-time reader.

- Public or entry-point items before private helpers; the module's main type
  or function first.
- Core type declarations before impl details for a top-down view of the API;
  related types ordered high-level to supporting detail.
- Keep helper structs and single-use context objects near the code that uses
  them.
- Do not split a small feature across many modules to satisfy an abstract
  layering idea.

## Naming

- Boring, searchable names. Full words over ad-hoc abbreviations or
  contractions.
- Consistent terminology across modules, tests, docs, diagnostics, and errors.
- Good short names are contextual and conventional: `db`, `ctx`, `acc`, `it`,
  `idx`, `res`, `n_items`, `item_idx`.
- Rust keyword conflicts: a clear local convention such as `type_`, `trait_`,
  `enum_`, or a domain-specific alternative.
- Prefer names that reveal units, ownership, state, and domain meaning over
  generic names such as `data`, `value`, or `flag`.

## Functions and Preconditions

- Express preconditions in types when possible.
- Keep validation checks next to the code that relies on them unless
  validation returns a refined type. Prefer returning a refined value such as
  `Option<&str>` or a validated newtype over separate boolean predicates that
  can drift from later use.
- Avoid outward "doer" objects that only execute one action; prefer a function
  or inherent method when that is the clearer API.
- Replace many optional or boolean parameters with a config struct, enum, or
  separate functions.
- Pass context parameters first when threaded unchanged through many calls;
  use internal context structs when many values must travel together.
- Use OS string and path types at OS boundaries. Use domain-specific path
  types when they encode important invariants: absolute paths, workspace
  roots, virtual paths.

## Control Flow

- Early returns to reduce nesting when they make the main path clearer.
- `return Err(err)` for early errors when the explicit return is clearer than
  `Err(err)?`.
- `match` when exact variants matter or both branches deserve names. Avoid
  `if let ... { } else { }` when a `match` would make the fallback variant
  explicit.
- No `ref` keyword when match ergonomics already provide the needed reference.
- `=> (),` for intentionally empty match arms.
- Range comparisons in spatial order: `lo <= x && x <= hi`.
- Use `map`, `then`, `filter`, and related combinators when they are natural;
  prefer `for`, `if`, or `match` when direct control flow communicates more.
- Prefer type ascription on the binding over turbofish on the expression when
  the result type is what readers need to see. Avoid `_` in ascribed types
  when the concrete type is important to readability.

## Helpers and Context

- Do not extract a helper just because a block is a few lines long;
  single-use helpers can create parameter churn and hide control flow.
- Extract helpers that name a reusable concept, isolate unsafe code, reduce
  duplication, make tests clearer, or need their own `return` or `?` flow.
- Nested helper functions go at the end of the enclosing function, at most one
  level deep.
- Introduce helper variables freely, especially for multiline conditions;
  named conditions improve debugging and usually format better.
- Avoid making large bodies generic across crate boundaries; a small generic
  wrapper can call a non-generic implementation to reduce duplicated machine
  code.

## Tests and Assertions

- Keep test fixtures minimal; remove copied real-world code that does not
  affect the behavior under test.
- Unindented raw string literals for multiline Rust fixtures when that keeps
  the fixture readable.
- Prefer explicit assertions on `Err`, `None`, diagnostics, or output values
  over `#[should_panic]` unless panic is the documented behavior.
- No `#[ignore]` for broken tests. If preserving current wrong behavior is
  necessary, assert that behavior and leave a tracked follow-up note.
- Coverage marks only where the project already uses that pattern; each mark
  tied to one canonical condition and one test.
- Assert invariants near the code that depends on them. In libraries and
  long-running tools, prefer recoverable diagnostics for user input failures.

## Comments and Documentation Style

- Comments explain why: invariants, safety, compatibility, platform behavior,
  performance tradeoffs, external constraints.
- Substantial inline comments are proper sentences. Use labels such as
  `SAFETY:`, `PERF:`, or `CONTEXT:` when they make important reasoning easier
  to find.
- Markdown docs: sentence-per-line formatting can make diffs cleaner; split
  overlong sentences instead of hard-wrapping unreadable text.
- Move lasting design context to rustdoc, tests, design docs, or architecture
  decision records. Local comments must not be the only durable documentation
  for public behavior.

## Dependencies and Boundaries

- Add dependencies only when they remove meaningful complexity or match an
  existing project pattern. No small helper crates for trivial code.
- Inspect transitive dependencies when a new dependency looks questionable.
- Prefer project-local utilities for reusable internal behavior in large
  workspaces.
- Check whether a dependency becomes public through exported types, feature
  flags, error types, trait bounds, re-exports, or serialization formats.
- Keep IO, serialization, process state, and external protocols at explicit
  boundaries. Do not derive serialization on deep internal types just because
  it is easy; use separate boundary DTOs when wire compatibility matters.
- Preserve partial availability in long-running tools: broken inputs usually
  produce diagnostics, not a crashed process.
- Add observability at long-running or concurrent boundaries so failures can
  be diagnosed without invasive debugging.

## Debugging and Profiling

- Prefer targeted tests over manual reproduction steps when capturing a bug.
- Use project tracing or logging conventions. Do not write diagnostics to
  stdout when stdout is a protocol or data channel.
- For performance issues, create a repeatable workload before optimizing.
- Keep profiling instrumentation cheap enough for the intended environment.
