# Rust API Design

Use this reference when designing or reviewing public items, crate boundaries,
traits, feature flags, constructors, conversion APIs, builders, type-state, or
semver-sensitive changes.

## Contents

- Naming
- Conversions
- Constructors and builders
- Methods, getters, and fields
- Function parameters
- Traits
- Type safety
- Type-state pattern
- Features, dependencies, and compatibility

## Naming

- Types, traits, and enum variants use `UpperCamelCase`.
- Functions, methods, modules, locals, and macros use `snake_case`.
- Constants and statics use `SCREAMING_SNAKE_CASE`.
- Acronyms are words: prefer `Uuid`, `HttpClient`, and `is_xid_start` over
  all-caps fragments unless local convention differs.
- Keep word order consistent with related APIs, especially error types such as
  `ParseFooError`.
- Feature names should describe the capability directly, such as `std` or
  `serde`, not `with-std` or `use-serde`.
- Cargo features must be additive; avoid negative names such as `no-foo`.

## Conversions

- Use `as_` for cheap borrowed-to-borrowed views.
- Use `to_` for conversions that allocate, compute, or create an owned value
  from a borrowed value.
- Use `into_` for consuming conversions.
- Implement `From` for infallible conversions and `TryFrom` for fallible ones.
  Do not implement `Into` or `TryInto` directly unless there is a special reason.
- Use `AsRef` and `AsMut` only where the API genuinely benefits from accepting
  multiple wrapper types.
- Place conversion methods on the most specific type involved.
- Prefer `TryFrom` or validating constructors for domain types that establish
  invariants from raw input.

## Constructors and Builders

- Use `new` for the primary constructor when construction is simple.
- Use domain-specific constructors when they communicate an action better:
  `open`, `connect`, `bind`, `parse`, or `from_*`.
- If the type has a sensible default, implement `Default`; `new` and `default`
  should agree when both exist.
- Prefer `Default` to a zero-argument `new` when there is no extra meaning in
  construction.
- Do not invent dummy default states for types that have no valid default.
- Use `Vec::new` for empty vectors.
- Use builders for complex construction with optional configuration, many
  parameters, compound inputs, required fields, or side effects.
- For config structs with many booleans/options, avoid `Default` when the caller
  has the better context for defaults.
- If both input parameters and return type vary, consider a command or query
  type rather than many nearly identical functions.

## Methods, Getters, and Fields

- Make an operation a method when it has a clear receiver.
- Avoid out-parameters; return tuples or structs unless the point is reusing a
  caller-owned buffer.
- Avoid unnecessary `get_` prefixes. Prefer `name(&self) -> &str` and
  `name_mut(&mut self) -> &mut String`.
- Return borrowed data from getters. Avoid `&String`, `&Vec<T>`, or
  `&Option<T>` in public APIs when `&str`, `&[T]`, or `Option<&T>` is more
  general.
- If any field value is valid and representation is intentionally public, a
  public field can be clearer than a getter.
- If a field has an invariant, document it, enforce it in construction, keep the
  field private, and provide a getter.
- Avoid setters as a default pattern; prefer methods that preserve invariants.

## Function Parameters

- Replace many optional or boolean parameters with a config struct.
- If a `bool` or `Option` parameter is always called with literal `true`,
  `false`, `Some`, or `None`, split behavior into separate functions.
- Avoid ambiguous primitive parameters where a newtype or enum would communicate
  domain meaning.
- Pass context parameters first when they are threaded unchanged through many
  calls.
- Use a context struct internally when many values travel together.

## Traits

- Implement common traits when they are meaningful: `Debug`, `Clone`, `Copy`,
  `Eq`, `PartialEq`, `Ord`, `PartialOrd`, `Hash`, `Display`, and `Default`.
- Public error types should implement `Debug`, `Display`, `std::error::Error`,
  and usually be `Send + Sync + 'static`.
- Decide early whether a trait is intended for generics, trait objects, or both.
- Object-safe trait methods cannot use generic methods and cannot require
  `Self: Sized` for methods called on trait objects.
- Add `where Self: Sized` to methods that should be excluded from trait objects.
- Seal traits when downstream implementations would prevent future evolution.
- Avoid blanket implementations that may conflict with future more-specific impls.
- Do not use `Deref` to emulate inheritance or reuse methods. Implement explicit
  methods, traits, or delegation instead.

## Type Safety

- Use newtypes to distinguish values with the same representation but different
  meaning, such as IDs, units, validated strings, and capability tokens.
- Replace ambiguous booleans and options with enums or config structs when the
  call site is unclear.
- Use `bitflags`-style types for combinable flag sets.
- Validate inputs at boundaries. Prefer static validation through types; use
  `Result` for runtime validation.
- Consider `#[non_exhaustive]` for public enums and structs that may need future
  variants or fields and will be matched by external users.

## Type-State Pattern

Use type-state when compile-time state safety clearly pays for the extra types.

- Encode states as types and transitions as type changes.
- Use `PhantomData` to carry state markers without runtime allocation.
- Good fits include required builder fields before `build`, protocol states,
  initialization phases, and APIs where invalid operations are common or costly.
- Type-state can replace runtime booleans or enums when the compiler should
  forbid illegal actions.
- Avoid it when a simple enum is enough, runtime flexibility is required, or the
  generic complexity outweighs the safety benefit.
- Use it when it saves bugs, increases safety, or simplifies logic, not for
  cleverness.

## Features, Dependencies, and Compatibility

- Gate optional integration dependencies behind clearly named features.
- Public dependencies of a stable crate become part of the stability story. Add
  them deliberately.
- Serialization derives create compatibility commitments. Keep wire/API types at
  boundaries, not deep in internals.
- Public structs with private fields can add fields later; public field structs
  usually cannot.
- Avoid exposing private helper errors, generated types, or internal modules in
  rustdoc.
- Re-exports create multiple import paths. Use them only when they are part of a
  deliberate public API.
- Keep IO, protocol, serialization, and external-process types at clear boundary
  layers rather than leaking them through core logic.
