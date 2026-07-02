# Rust Review Checklist

Use this checklist for PR review, final self-review, or broad Rust audits.

## Start With Context

- Identify whether the crate is a library, binary, test utility, macro crate, or
  internal workspace crate.
- Read existing conventions before suggesting new ones: lint config, error
  crates, module layout, test style, feature policy, and dependency policy.
- Separate internal changes from boundary changes. Public items, exported types,
  feature flags, serialization, and dependencies need higher scrutiny.
- Check whether the repository has pinned toolchains, `rustfmt.toml`, Cargo lint
  tables, `just`, `make`, `xtask`, nextest, or custom CI commands before using
  default commands.

## Correctness and Safety

- Expected failure returns `Result`, not panic.
- `unwrap` and `expect` are absent from production paths unless they enforce a
  documented impossible invariant.
- Unsafe code has a local reason, a narrow scope, and documented caller or
  maintainer obligations.
- Thread-safety claims are backed by types, trait bounds, or tests for `Send` and
  `Sync` where relevant.
- Function preconditions are encoded in types or checked next to their use.
- OS strings, paths, wire formats, and external protocols are represented with
  boundary types that preserve their invariants.

## API Shape

- Names follow Rust conventions and communicate ownership/cost.
- Getter methods return borrowed data unless ownership is the point.
- Constructors, conversion traits, builders, iterators, and collection methods
  follow ecosystem expectations.
- Public types implement common traits when semantically valid.
- Public fields, re-exports, and trait impl surfaces are intentional.
- `bool`, `Option`, and primitive parameters do not obscure domain meaning.

## Ownership and Performance

- Parameters borrow when ownership is not needed and take ownership when cloning
  would otherwise be inevitable.
- Clones are deliberate and explained by ownership transfer, cheap reference
  counting, or measured tradeoffs.
- Hot paths avoid intermediate collections and repeated allocations.
- Generics, `impl Trait`, and `dyn Trait` are chosen for a reason: performance,
  code size, object safety, or heterogeneous collections.
- Large enum variants, boxed data, stack size, and pointer choices match the
  expected access pattern.

## Errors, Tests, and Docs

- Error types are meaningful, implement useful traits, and preserve context.
- Tests cover success and failure paths, including edge cases introduced by the
  change.
- Fixtures are minimal enough that the behavior under test is visible.
- Broken behavior is not hidden behind ignored tests or broad panic assertions.
- Public APIs have examples and document errors, panics, and safety obligations.
- Snapshot tests are stable, intentional, and reviewed as user-visible output.

## Lints and Tooling

- `cargo fmt --check` passes or project formatting instructions are followed.
- `cargo clippy --all-targets --all-features --locked -- -D warnings` passes, or
  a project-specific command is used and documented.
- Public docs and examples are checked when public API or rustdoc changes:
  `cargo doc --no-deps` and `cargo test --doc` as appropriate.
- Suppressions use the narrowest scope. Prefer `#[expect(...)]` with a reason
  over permanent `#[allow(...)]`.
- New lints are not introduced wholesale without project agreement.
- Performance claims are backed by release-mode benchmarks, profiling, or an
  obvious removed cost such as an allocation, clone, lock, or repeated work.

## Review Response Shape

Lead with concrete findings. Each finding should include:

- Location.
- Impact.
- Why the current code violates a Rust principle or local convention.
- A specific fix.

Then include:

- Validation commands run.
- Commands not run and why.
- Open API, behavior, or performance questions.
