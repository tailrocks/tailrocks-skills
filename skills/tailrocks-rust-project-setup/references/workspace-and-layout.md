# Workspace and Source Layout

Use this reference when creating a project, adding a crate, or reviewing the
structure of a Cargo workspace. The baseline is strict and modern: edition 2024,
resolver 3, a workspace from the first commit, and Rust 2024 self-named module
files with no `mod.rs`.

## Contents

- Edition and resolver
- Everything is a workspace
- Crate separation
- Shared-metadata and lint inheritance
- Module layout: no `mod.rs`
- Tests in their own file
- Item order and naming

## Edition and Resolver

- Set `edition = "2024"` in `[workspace.package]` and inherit it in every member.
  New code targets the current edition; there is no reason to start on an older
  one.
- Set `resolver = "3"` in `[workspace]`. It is the edition-2024 feature resolver;
  resolver 1 and 2 are legacy for new work.
- `rust-version` in `[workspace.package]` is the **MSRV floor** — the oldest
  toolchain you promise to build on. Keep it honest with a CI job that builds on
  exactly that version. It is independent of, and usually older than, the pinned
  build channel in `rust-toolchain.toml`.

## Everything Is a Workspace

Create the `[workspace]` root even when you have one crate today.

- Shared lint tables, package metadata, and dependency versions become available
  immediately and cost nothing.
- Adding a second crate later is a one-line `members` change instead of a
  restructuring.
- The root is typically a *virtual* manifest (a `[workspace]` with no
  `[package]`); the actual crates live under `crates/`.

```text
your-repo/
├── Cargo.toml            # [workspace] root — members, shared metadata, lints
├── Cargo.lock            # committed for bins and workspaces
├── rust-toolchain.toml
├── clippy.toml
├── rustfmt.toml
├── deny.toml
├── mise.toml
├── .config/nextest.toml
└── crates/
    ├── your-app/         # thin binary crate
    │   └── src/main.rs
    └── your-core/        # library crate with the real logic
        └── src/lib.rs
```

## Crate Separation

- **One crate per bounded concern.** Split by responsibility — domain/core, IO,
  protocol, CLI, a `xtask` automation binary — not by arbitrary size. Each crate
  is a compile unit and a dependency-graph node, so boundaries you draw here are
  the boundaries the compiler enforces.
- **Keep binaries thin.** Put logic in library crates and let the binary be a
  small `main` that wires them together. Library code is unit- and
  integration-testable; code trapped in `main.rs` is not.
- **Make the dependency graph a DAG.** Leaf crates depend on core crates, never
  the reverse. No cycles. If two crates need each other, a shared concept wants
  its own crate underneath both.
- **List members with a glob** (`members = ["crates/*"]`) so adding a crate needs
  no manifest edit. Fall back to an explicit list only to exclude a sibling
  directory.
- Parallel compilation, incremental rebuilds, and clear ownership all improve as
  a natural consequence of real crate boundaries.

## Shared-Metadata and Lint Inheritance

Declare policy once at the root; inherit it everywhere. Never copy these into
member crates.

Root `Cargo.toml`:

```toml
[workspace.package]
edition = "2024"
rust-version = "1.90"
license = "Apache-2.0"
repository = "https://github.com/your-org/your-repo"

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
```

Each member `Cargo.toml`:

```toml
[package]
name = "your-core"
version = "0.1.0"
edition.workspace = true
rust-version.workspace = true
license.workspace = true
repository.workspace = true

[lints]
workspace = true

[dependencies]
serde.workspace = true
```

- `[lints] workspace = true` is what pulls in the strict `[workspace.lints]`
  tables. A crate missing this line silently escapes the entire lint policy —
  check for it in review.
- `[workspace.dependencies]` gives one version per third-party crate across the
  whole workspace: no drift, no duplicate builds, one place to bump.

## Module Layout: No `mod.rs`

Use Rust 2024 self-named module files. This is enforced by
`clippy::mod_module_files = "deny"` in the workspace Clippy table.

```text
# correct — self-named module root beside its children
crates/your-core/src/parser.rs         # module root: `mod parser;` in lib.rs
crates/your-core/src/parser/expr.rs    # child module: `mod expr;` in parser.rs
crates/your-core/src/parser/tests.rs   # tests for parser

# wrong — legacy layout, fails the lint
crates/your-core/src/parser/mod.rs
```

- `lib.rs` and `main.rs` are the only permitted crate-root files.
- The self-named layout keeps a module and its submodules adjacent in the file
  tree and eliminates a directory full of indistinguishable `mod.rs` tabs.

## Tests in Their Own File

Do not inline `#[cfg(test)] mod tests { ... }` in a source file. Split logic from
tests, always.

```text
crates/your-core/src/parser.rs         # implementation + `#[cfg(test)] mod tests;`
crates/your-core/src/parser/tests.rs   # ALL tests for parser, inline, nothing else
```

- `parser.rs` ends with `#[cfg(test)] mod tests;`.
- `parser/tests.rs` holds every test function inline. It must **not** declare
  child modules or split tests across sub-files — one module has one test
  surface.
- A `tests.rs` that grows unwieldy is a signal the module under test does too
  much, not a signal to split the test file.
- Integration tests that exercise the public API like an external user go under
  the crate's `tests/` directory instead.

## Item Order and Naming

Optimize each file for a first-time reader; the deeper rules live in the
`tailrocks-rust-best-practices` skill (`references/readability-style-architecture.md`).

- Public or entry-point items first, then supporting private helpers.
- The module's main type or function before its details.
- Standard Rust naming: `snake_case` for crates, modules, files, functions, and
  values; `UpperCamelCase` for types and traits; `SCREAMING_SNAKE_CASE` for
  constants and statics.
- Avoid clever abbreviations. Established domain terms (`tui`, `cli`, `pty`,
  `db`, `ctx`) are fine; invented shortenings (`mgr`, `cfg_ed`, `ws`) are not.
