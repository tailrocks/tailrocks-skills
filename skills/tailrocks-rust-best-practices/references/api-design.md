# Rust API Design

Scope: public items, crate boundaries, traits, feature flags, constructors,
conversion APIs, builders, type-state, and semver-sensitive changes.

## Naming

- Types, traits, enum variants: `UpperCamelCase`. Functions, methods, modules,
  locals, macros: `snake_case`. Constants and statics: `SCREAMING_SNAKE_CASE`.
- Acronyms are words: prefer `Uuid`, `HttpClient`, and `is_xid_start` over
  all-caps fragments unless local convention differs.
- Keep word order consistent with related APIs, especially error types such as
  `ParseFooError`.
- Feature names describe the capability directly (`std`, `serde`), not
  `with-std` or `use-serde`.
- Cargo features must be additive; avoid negative names such as `no-foo`.

## Conversions

- `as_`: cheap borrowed-to-borrowed view. `to_`: allocates, computes, or
  creates an owned value from a borrowed one. `into_`: consuming conversion.
- Implement `From` for infallible conversions, `TryFrom` for fallible ones. Do
  not implement `Into` or `TryInto` directly without a special reason.
- Use `AsRef` and `AsMut` only where accepting multiple wrapper types genuinely
  benefits the API.
- Place conversion methods on the most specific type involved.
- Domain types that establish invariants from raw input: prefer `TryFrom` or
  validating constructors.

## Constructors and Builders

- `new` for the primary constructor when construction is simple.
- Domain-specific constructors when they communicate an action better: `open`,
  `connect`, `bind`, `parse`, `from_*`.
- Implement `Default` when the type has a sensible default; `new` and
  `default` should agree when both exist. Prefer `Default` to a zero-argument
  `new` with no extra meaning in construction.
- Do not invent dummy default states for types with no valid default.
- Use `Vec::new` for empty vectors.
- Use builders for complex construction: optional configuration, many
  parameters, compound inputs, required fields, or side effects.
- Config structs with many booleans/options: avoid `Default` when the caller
  has the better context for defaults.
- If both input parameters and return type vary, consider a command or query
  type over many nearly identical functions.

## Methods, Getters, and Fields

- An operation with a clear receiver is a method.
- Avoid out-parameters; return tuples or structs unless the point is reusing a
  caller-owned buffer.
- No unnecessary `get_` prefixes: `name(&self) -> &str`,
  `name_mut(&mut self) -> &mut String`.
- Getters return borrowed data. Avoid `&String`, `&Vec<T>`, or `&Option<T>` in
  public APIs when `&str`, `&[T]`, or `Option<&T>` is more general.
- If any field value is valid and representation is intentionally public, a
  public field can be clearer than a getter.
- A field with an invariant: document it, enforce it in construction, keep the
  field private, provide a getter.
- Avoid setters as a default pattern; prefer methods that preserve invariants.

## Function Parameters

- Replace many optional or boolean parameters with a config struct.
- A `bool` or `Option` parameter always called with literal `true`, `false`,
  `Some`, or `None`: split behavior into separate functions.
- Avoid ambiguous primitive parameters where a newtype or enum would carry
  domain meaning.
- Pass context parameters first when threaded unchanged through many calls.
- Use a context struct internally when many values travel together.

## Traits

- Implement common traits when meaningful: `Debug`, `Clone`, `Copy`, `Eq`,
  `PartialEq`, `Ord`, `PartialOrd`, `Hash`, `Display`, `Default`.
- Public error types implement `Debug`, `Display`, `std::error::Error`, and
  are usually `Send + Sync + 'static`.
- Decide early whether a trait targets generics, trait objects, or both.
- Object-safe trait methods cannot use generic methods and cannot require
  `Self: Sized` for methods called on trait objects. Add `where Self: Sized`
  to methods excluded from trait objects.
- Seal traits when downstream implementations would prevent future evolution.
- Avoid blanket implementations that may conflict with future more-specific
  impls.
- Do not use `Deref` to emulate inheritance or reuse methods; implement
  explicit methods, traits, or delegation.

## Type Safety

- Newtypes distinguish same-representation values with different meaning: IDs,
  units, validated strings, capability tokens.
- Replace ambiguous booleans and options with enums or config structs when the
  call site is unclear.
- Use `bitflags`-style types for combinable flag sets.
- Validate inputs at boundaries. Prefer static validation through types; use
  `Result` for runtime validation.
- Consider `#[non_exhaustive]` for public enums and structs that may gain
  variants or fields and will be matched by external users.

## Type-State Pattern

Use type-state when compile-time state safety clearly pays for the extra types.

- Encode states as types, transitions as type changes.
- Use `PhantomData` to carry state markers without runtime allocation.
- Good fits: required builder fields before `build`, protocol states,
  initialization phases, APIs where invalid operations are common or costly.
- Type-state can replace runtime booleans or enums when the compiler should
  forbid illegal actions.
- Avoid it when a simple enum is enough, runtime flexibility is required, or
  the generic complexity outweighs the safety benefit. Use it for saved bugs,
  safety, or simpler logic — not cleverness.

## Features, Dependencies, and Compatibility

- Gate optional integration dependencies behind clearly named features.
- Public dependencies of a stable crate join its stability story; add them
  deliberately.
- Serialization derives create compatibility commitments. Keep wire/API types
  at boundaries, not deep in internals.
- Public structs with private fields can add fields later; public field
  structs usually cannot.
- Do not expose private helper errors, generated types, or internal modules in
  rustdoc.
- Re-exports create multiple import paths; use them only as deliberate public
  API.
- Keep IO, protocol, serialization, and external-process types at clear
  boundary layers rather than leaking through core logic.
