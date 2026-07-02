---
name: rust-best-practices
description: Strict, idiomatic Rust code guidance for writing, reviewing, and refactoring Rust — ownership, API design, errors, tests, docs, unsafe, and performance. Invoke explicitly for code-level work; for workspace, lint, toolchain, and tooling setup, use rust-project-setup.
disable-model-invocation: true
---

# Rust Best Practices

Write Rust that is readable, explicit, testable, and performant by design, on the
latest stable edition (2024). Default to the strict posture: encode invariants in
types, return `Result` instead of panicking, borrow instead of cloning, and make
every cost visible at the call site. Follow the project's existing conventions
first; when the project is new or silent, apply the guidance here rather than a
softer default.

This skill covers the **code you write**. Its sibling, `rust-project-setup`, owns
the **project around it** — workspace layout, `crates/` separation, the strict
`[workspace.lints]` tables, `clippy.toml`, rustfmt, `rust-toolchain.toml`, mise,
and the cargo-deny / audit / shear / hack / nextest gates. Reach for that skill
whenever the task touches structure or tooling.

## Workflow

1. Inspect context before changing code: `Cargo.toml`, crate type, workspace
   layout, public API boundaries, feature flags, the workspace lint tables,
   `clippy.toml`, `rustfmt.toml`, tests, docs, and dependency policy.
2. Load the reference that matches the decision:
   - `references/review-checklist.md` for PR review, audits, or final checks.
   - `references/ownership-performance.md` for borrowing, cloning, allocation,
     iterators, dispatch, stack/heap choices, pointers, and shared state.
   - `references/api-design.md` for public APIs, naming, traits, constructors,
     feature flags, type safety, type-state, and future compatibility.
   - `references/errors-testing-docs.md` for `Result`, panics, error crates,
     async error bounds, tests, doc tests, snapshots, comments, and rustdoc.
   - `references/readability-style-architecture.md` for file layout, imports,
     naming, control flow, helper functions, and dependency boundaries.
   - `references/tooling-lints.md` for reading Clippy as a design-review signal,
     acting on high-value lints, suppression discipline, and profiling. Config
     and CI setup live in the `rust-project-setup` skill.
3. Make the smallest coherent change. Separate API boundary changes, dependency
   additions, and broad refactors from local implementation edits when practical.
4. Validate with the workspace's commands. Prefer the `mise run` task wrappers;
   otherwise:
   - `cargo fmt --check`
   - `cargo clippy --workspace --all-targets --all-features --locked -- -D warnings`
   - `cargo nextest run --workspace --all-features --locked` (plus
     `cargo test --workspace --doc --locked` for doctests)
   Adjust when features are mutually exclusive, tests require opt-in, or the
   repository documents a custom command.
5. Report residual risk: commands not run, warnings suppressed, missing negative
   tests, public API compatibility questions, or performance claims not backed by
   measurement.

## Core Rules

### Ownership and Allocation

- Prefer borrowed parameters when ownership is not required: `&str` over
  `String`, `&[T]` over `Vec<T>`, `&Path` over `PathBuf`, and `Option<&T>` over
  `&Option<T>`.
- Take ownership when the function stores, moves, sends, or would otherwise clone
  the value. Let the caller decide where cloning happens.
- Treat `.clone()` as a design decision. Do not clone to appease the borrow
  checker.
- Avoid intermediate `Vec` or `String` allocations when iterators, slices,
  borrowed views, or lazy fallback closures are enough.
- Prefer clear control flow over clever combinator chains when the chain hides
  errors, branching, ownership, or side effects.

### Errors and Panics

- Return `Result<T, E>` for expected failure. Use `Option<T>` only when absence
  has no meaningful error detail.
- `unwrap`, `expect`, `panic!`, `todo!`, and `dbg!` are denied in production code
  by the workspace lint tables; they belong in tests, examples with hidden setup,
  or genuinely unreachable invariants with precise context. Never use them as
  validation on runtime input.
- Prefer typed errors for libraries (`thiserror`). Use `anyhow`-style errors at
  binary, CLI, application, prototype, or test-helper boundaries.
- Use `?` for propagation. Add context at IO, parsing, network, task, or
  user-facing boundaries.
- Document public failure behavior with `# Errors`, `# Panics`, and `# Safety`
  sections where relevant.

### API Design

- Follow Rust naming and ownership conventions: `snake_case` values,
  `UpperCamelCase` types, `SCREAMING_SNAKE_CASE` constants, and meaningful
  `as_`/`to_`/`into_` conversions.
- Implement common traits when they make semantic sense: `Debug`, `Clone`,
  `Copy`, `Eq`, `Hash`, `Default`, `Display`, `Error`, `From`, `TryFrom`,
  `AsRef`, and `AsMut`.
- Encode invariants in types: newtypes, enums, builders, config structs,
  type-state, and validated wrappers beat ambiguous `bool`, `Option`, `String`,
  or primitive parameters.
- Keep fields private unless exposing representation is part of the stable
  contract. Use sealed traits when downstream implementations would block future
  evolution.
- Add public dependencies, re-exports, blanket generics, and serialization
  derives only as intentional compatibility commitments.

### Tests and Documentation

- Tests are readable examples of behavior: precise names, minimal fixtures, and
  success plus failure-path coverage. Live in their own file per the layout rule
  (see `rust-project-setup`), not inline `#[cfg(test)] mod tests { ... }`.
- Prefer behavior tests at stable boundaries over tests that freeze incidental
  helper APIs.
- Use doc tests for public API examples; propagate errors with `?` rather than
  `unwrap` unless the unwrap is the point.
- Use snapshots for generated, rendered, serialized, or CLI output. Keep them
  deterministic and redacted.
- Comments explain why — invariants, safety, compatibility, platform behavior,
  performance tradeoffs, external constraints. Prefer clearer code and tests over
  comments that restate the implementation.

### Lints and Suppression

- Treat Clippy as a design-review assistant and act on its findings. The
  workspace runs `clippy::all` at deny and `pedantic`/`cargo` at warn (gated by
  `-D warnings` in CI) — read the output, do not silence it wholesale.
- Fix warnings before suppressing them. When suppression is justified, use
  `#[expect(clippy::lint_name, reason = "...")]` at the smallest scope so stale
  suppressions are reported later. Never a blanket crate-level `#[allow]`.
- Do not enable `clippy::restriction` or `clippy::nursery` as a group; cherry-pick
  an individual lint with a reason when it encodes a real rule.
- Do not bake `#![deny(warnings)]` into crates; the CI `-D warnings` flag is the
  gate, so a toolchain bump never bricks local builds.

### Readability and Architecture

- Optimize for first-time readers: public or entry-point items first, important
  types before helpers, imports grouped consistently, details near their use.
- Keep control flow local and visible. Express preconditions in types or adjacent
  checks rather than splitting validation and use across distant helpers.
- Prefer boring, searchable names over abbreviations. Use short names only for
  established conventions such as `db`, `ctx`, `acc`, `idx`, `res`, or `it`.
- Add dependencies conservatively; prefer a maintained, canonical crate over a
  hand-rolled parser/serializer/crypto, but weigh each new crate's compile,
  maintenance, supply-chain, and public-API cost.
- Separate stable boundaries from unstable internals. IO, serialization,
  protocols, public types, feature flags, and re-exports deserve explicit
  boundary design.

## Review Output

When reviewing Rust code, lead with actionable findings ordered by severity. For
each finding, include the file/line, impact, violated Rust principle or local
convention, and a practical fix. Then list validation commands and remaining test
or API risks.

When writing or refactoring Rust code, briefly state the local convention
followed and the validation performed. Do not claim performance wins unless
measured or the change removes an obvious allocation or clone in ordinary code.
