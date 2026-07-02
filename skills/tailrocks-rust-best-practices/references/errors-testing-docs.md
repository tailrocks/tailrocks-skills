# Errors, Tests, and Documentation

Use this reference when changing fallible behavior, public docs, test coverage,
assertions, snapshots, comments, panic behavior, or unsafe contracts.

## Contents

- Error handling
- Error types and crates
- Panic policy
- Comments
- Documentation contracts
- Unit and integration tests
- Doc tests
- Assertions
- Snapshot tests
- Test command selection

## Error Handling

- Expected runtime failures return `Result<T, E>`.
- Absence is `Option<T>` only when there is no useful error information.
- Avoid `Result<T, String>` and `Result<T, ()>` in public APIs. Define a
  meaningful error type.
- Consider returning `Result<T, E>` instead of `Option<T>` when absence has a
  meaningful cause.
- Prefer `?` over nested match chains when propagation is the intent.
- Use `or_else`, `map_err`, and `if let Ok(...) else` for recovery.
- Use `inspect_err` for logging or observing errors before propagation.
- Preserve context when crossing boundaries such as IO, parsing, network calls,
  user input, task execution, or external services.
- Do not end user-facing error messages with punctuation unless local convention
  requires it.

## Error Types and Crates

- Libraries should usually expose typed errors.
- Use `thiserror` when deriving `Display`, `Error`, and `From` reduces boilerplate
  for library, crate, or module-level errors.
- Model layered systems with nested enum or struct errors and `#[from]` where
  propagation is part of the contract.
- Use custom error structs when a module has one meaningful error shape.
- Use `anyhow` mainly for binaries, CLIs, application boundaries, prototypes, and
  test helpers.
- Avoid leaking `anyhow::Result` through library APIs that callers need to
  inspect precisely.
- Add application-level context with `anyhow::Context` where the original error
  is not actionable enough.
- In async runtimes, ensure errors crossing task or `.await` boundaries meet
  needed bounds such as `Send + Sync + 'static`.
- Avoid `Box<dyn std::error::Error>` in libraries unless type erasure is truly
  required.

## Panic Policy

Acceptable panics:

- Tests and test helpers.
- Examples where hidden setup makes the example clearer.
- Internal invariants that would indicate a programming bug, with a precise
  `expect` message.
- Truly unreachable code that the type system cannot express.
- Explicit application crashes when crashing is the chosen behavior.

Avoid panics:

- On invalid user input.
- In parsers, servers, long-running tools, and background tasks.
- In library APIs unless misuse is the documented contract.

Use `todo!`, `unimplemented!`, and `unreachable!` when they communicate intent
more precisely than a generic panic.

## Comments

- Comments explain why, not what.
- Useful comments describe invariants, safety reasoning, compatibility hacks,
  platform behavior, performance tradeoffs, external protocol requirements, or
  links to design docs and ADRs.
- Prefix important comments with purpose labels when useful, such as `SAFETY:`,
  `PERF:`, or `CONTEXT:`.
- Remove comments that duplicate names or control flow.
- Do not trust old comments blindly. Update or delete stale comments.
- Task-tracking comments should point to a tracked issue or contain enough
  context to act on later.
- Inline comments should be proper sentences when they carry real context.

## Documentation Contracts

Public docs should tell users how to succeed and how failure behaves.

- Use `///` for public items and `//!` for modules or crates.
- Add `# Examples` when examples clarify why or how to use an item.
- Add `# Errors` for fallible functions.
- Add `# Panics` for documented panic conditions.
- Add `# Safety` for unsafe functions and unsafe traits.
- Add hidden setup lines in doctests with `#` to keep examples runnable without
  clutter.
- Prefer examples that propagate errors with `?`, not `unwrap`.
- Link to related types, constructors, variants, and modules when that helps
  users navigate.
- Use `cargo doc --open` to inspect generated documentation when changing public
  docs.

Useful doc lints when a project wants stricter docs:

- `missing_docs`.
- `broken_intra_doc_links`.
- `empty_docs`.
- `missing_panics_doc`.
- `missing_errors_doc`.
- `missing_safety_doc`.

## Unit and Integration Tests

- Treat tests as living examples of behavior.
- Use `#[test]` for test functions and `#[cfg(test)]` modules for test-only code.
- Test behavior through stable boundaries, not incidental helper APIs.
- Keep fixtures minimal; every extra line should make the scenario clearer.
- Cover error paths and edge cases, not only happy paths.
- Use descriptive names that communicate unit of work, expected behavior, and
  state being checked.
- Organize many tests for one function under a module named for that function.
- Test one behavior per test.
- Prefer very few assertions, ideally one assertion per test, unless multiple
  assertions are part of one inseparable behavior.
- Prefer explicit assertions on `Err`, `None`, or output values over
  `#[should_panic]` unless panic is the public contract.
- Do not ignore broken tests silently. If preserving current wrong behavior is
  necessary, assert that behavior and leave a clear fixme.
- For success assertions on fallible operations, include useful failure messages
  that expose the unexpected error when practical.
- Use `unwrap_err`, `to_string`, or direct equality to test error behavior.

Unit tests live near the code and can inspect private or `pub(crate)` details.
Integration tests live under `tests/` and should exercise public APIs like
external users do. For binaries, split reusable logic into `src/lib.rs` so
integration tests can exercise it directly.

## Doc Tests

- Use doc tests for public API examples that should stay valid.
- Keep examples small and self-contained.
- Avoid examples that require network, environment-specific files, or timing.
- `cargo test` runs doctests; `cargo nextest run` does not. Run
  `cargo test --doc` separately when nextest is the main runner.
- Use `ignore` only when the example should not run; prefer `text` for plain
  formatted snippets.
- Use `no_run` when code should compile but not execute due to side effects.
- Use `compile_fail` for intentionally invalid usage examples.
- Use `should_panic` only when panic is the documented behavior.

## Assertions

- Use `assert!` for boolean conditions and `assert_eq!` for equality.
- Add formatted assertion messages that show actual state or useful differences.
- Use `matches!` with `assert!` for pattern assertions when exact values are not
  needed.
- Consider `pretty_assertions` where richer diffs help and the project accepts
  the dependency.

## Snapshot Tests

Use snapshots when output is structured, large, or user-visible enough that
reviewing a whole expected value is clearer than writing many assertions.

Good snapshot targets:

- Rendered diagnostics.
- Generated code.
- Structured text output.
- Serialization formats.
- CLI output.
- Rendered HTML or templates.

Snapshot discipline:

- Keep snapshots deterministic.
- Keep snapshots small and named.
- Redact timestamps, paths, IDs, UUIDs, random values, and other unstable fields.
- Commit snapshots to version control.
- Review snapshot diffs as product/API changes, not as test noise.
- Avoid snapshots for tiny values, primitives, critical-path logic, flaky output,
  or external resources where mocks or direct assertions are clearer.

## Test Command Selection

Default to:

```bash
cargo test --all-targets --all-features --locked
```

Adjust when:

- The workspace has feature combinations that cannot be enabled together.
- The project intentionally lacks `Cargo.lock`.
- Slow tests require an opt-in environment variable.
- The repository documents a custom test runner, `just`, `make`, or `xtask`.
- The project uses nextest and needs a separate doctest command.
