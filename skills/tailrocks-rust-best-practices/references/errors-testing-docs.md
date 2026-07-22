# Errors, Tests, and Documentation

Scope: fallible behavior, public docs, test coverage, assertions, snapshots,
comments, panic behavior, and unsafe contracts.

## Error Handling

- Expected runtime failures return `Result<T, E>`.
- Absence is `Option<T>` only when there is no useful error information;
  consider `Result<T, E>` when absence has a meaningful cause.
- Avoid `Result<T, String>` and `Result<T, ()>` in public APIs; define a
  meaningful error type.
- Prefer `?` over nested match chains when propagation is the intent.
- Use `or_else`, `map_err`, and `if let Ok(...) else` for recovery;
  `inspect_err` to log or observe errors before propagation.
- Preserve context when crossing boundaries: IO, parsing, network calls, user
  input, task execution, external services.
- User-facing error messages do not end with punctuation unless local
  convention requires it.

## Error Types and Crates

- Libraries usually expose typed errors.
- Use `thiserror` when deriving `Display`, `Error`, and `From` reduces
  boilerplate for library, crate, or module-level errors.
- Model layered systems with nested enum or struct errors and `#[from]` where
  propagation is part of the contract.
- Use custom error structs when a module has one meaningful error shape.
- Use `anyhow` mainly for binaries, CLIs, application boundaries, prototypes,
  and test helpers. Avoid leaking `anyhow::Result` through library APIs that
  callers need to inspect precisely. Add application-level context with
  `anyhow::Context` where the original error is not actionable enough.
- In async runtimes, errors crossing task or `.await` boundaries must meet
  needed bounds such as `Send + Sync + 'static`.
- Avoid `Box<dyn std::error::Error>` in libraries unless type erasure is truly
  required.

## Panic Policy

Acceptable panics:

- Tests and test helpers.
- Examples where hidden setup makes the example clearer.
- Internal invariants indicating a programming bug, with a precise `expect`
  message.
- Truly unreachable code the type system cannot express.
- Explicit application crashes when crashing is the chosen behavior.

Avoid panics on invalid user input; in parsers, servers, long-running tools,
and background tasks; and in library APIs unless misuse is the documented
contract.

Use `todo!`, `unimplemented!`, and `unreachable!` when they communicate intent
more precisely than a generic panic.

## Comments

- Comments explain why, not what: invariants, safety reasoning, compatibility
  hacks, platform behavior, performance tradeoffs, external protocol
  requirements, links to design docs and ADRs.
- Prefix important comments with purpose labels when useful: `SAFETY:`,
  `PERF:`, `CONTEXT:`.
- Remove comments that duplicate names or control flow. Do not trust old
  comments blindly — update or delete stale ones.
- Task-tracking comments point to a tracked issue or carry enough context to
  act on later.
- Inline comments carrying real context are proper sentences.

## Documentation Contracts

Public docs tell users how to succeed and how failure behaves.

- `///` for public items, `//!` for modules or crates.
- Add `# Examples` when examples clarify why or how to use an item.
- Add `# Errors` for fallible functions, `# Panics` for documented panic
  conditions, `# Safety` for unsafe functions and unsafe traits.
- Hide doctest setup lines with `#` to keep examples runnable without clutter.
- Prefer examples that propagate errors with `?`, not `unwrap`.
- Link related types, constructors, variants, and modules when that helps
  navigation.
- Use `cargo doc --open` to inspect generated documentation when changing
  public docs.

Doc lints when a project wants stricter docs: `missing_docs`,
`broken_intra_doc_links`, `empty_docs`, `missing_panics_doc`,
`missing_errors_doc`, `missing_safety_doc`.

## Unit and Integration Tests

- Tests are living examples of behavior.
- `#[test]` for test functions; `#[cfg(test)]` modules for test-only code.
- Test behavior through stable boundaries, not incidental helper APIs.
- Keep fixtures minimal; every extra line must make the scenario clearer.
- Cover error paths and edge cases, not only happy paths.
- Descriptive names communicate unit of work, expected behavior, and state
  being checked. Organize many tests for one function under a module named for
  that function.
- One behavior per test. Very few assertions, ideally one, unless multiple
  assertions form one inseparable behavior.
- Prefer explicit assertions on `Err`, `None`, or output values over
  `#[should_panic]` unless panic is the public contract.
- Do not ignore broken tests silently. If preserving current wrong behavior is
  necessary, assert that behavior and leave a clear fixme.
- Success assertions on fallible operations include failure messages that
  expose the unexpected error when practical.
- Use `unwrap_err`, `to_string`, or direct equality to test error behavior.

Unit tests live near the code and may inspect private or `pub(crate)` details.
Integration tests live under `tests/` and exercise public APIs like external
users do. For binaries, split reusable logic into `src/lib.rs` so integration
tests can exercise it directly.

## Doc Tests

- Doc tests keep public API examples valid. Keep them small, self-contained,
  and free of network, environment-specific files, or timing.
- `cargo test` runs doctests; `cargo nextest run` does not. Run
  `cargo test --doc` separately when nextest is the main runner.
- Use `ignore` only when the example should not run; prefer `text` for plain
  formatted snippets. Use `no_run` when code should compile but not execute
  due to side effects. Use `compile_fail` for intentionally invalid usage.
  Use `should_panic` only when panic is the documented behavior.

## Assertions

- `assert!` for boolean conditions, `assert_eq!` for equality.
- Formatted assertion messages show actual state or useful differences.
- `matches!` with `assert!` for pattern assertions when exact values are not
  needed.
- Consider `pretty_assertions` where richer diffs help and the project accepts
  the dependency.

## Snapshot Tests

Use snapshots when output is structured, large, or user-visible enough that
reviewing a whole expected value beats many assertions.

Good targets: rendered diagnostics, generated code, structured text output,
serialization formats, CLI output, rendered HTML or templates.

Discipline:

- Keep snapshots deterministic, small, named, and committed to version
  control.
- Redact timestamps, paths, IDs, UUIDs, random values, and other unstable
  fields.
- Review snapshot diffs as product/API changes, not test noise.
- Avoid snapshots for tiny values, primitives, critical-path logic, flaky
  output, or external resources where mocks or direct assertions are clearer.

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
