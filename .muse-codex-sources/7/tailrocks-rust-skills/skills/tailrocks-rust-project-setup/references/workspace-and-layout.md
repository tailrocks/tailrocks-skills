# Workspace and Source Layout

Baseline for creating a project, adding a crate, or reviewing Cargo workspace
structure. Strict and modern: edition 2024, resolver 3, a workspace from the
first commit, and self-named module files with no `mod.rs`. The module-file
rule and the test-file rule below are Tailrocks rules. They are not Cargo
requirements.

## Edition and Resolver

- Set `edition = "2024"` in `[workspace.package]` and inherit it in every
  member.
- Set `resolver = "3"` in `[workspace]` — the edition-2024 feature resolver.
- By default, keep `rust-version` in `[workspace.package]` equal to the
  pinned channel in `rust-toolchain.toml`. If published crates promise an
  older MSRV, set that floor explicitly and add a CI job on exactly that
  version. Otherwise the equal pin is the only supported toolchain.

## Everything Is a Workspace

Create the `[workspace]` root even with one crate. Shared lint tables,
metadata, and dependency versions apply immediately, and a second crate is a
one-line `members` change. The root is typically a *virtual* manifest (a
`[workspace]` with no `[package]`). The actual crates live under `crates/`.

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

- **One crate per bounded concern.** Split by responsibility — domain/core,
  IO, protocol, CLI, a `xtask` automation binary — not by arbitrary size.
  Crate boundaries are the boundaries the compiler enforces.
- **Keep binaries thin.** Logic lives in library crates. The binary is a small
  `main` that wires them together. Unit tests run in binary targets, but
  integration tests under `tests/` can use only the library target. Logic
  that needs integration coverage belongs in a library crate.
- **Make the dependency graph a DAG.** Leaf crates depend on core crates,
  never the reverse. No cycles. If two crates need each other, a shared
  concept wants its own crate underneath both.
- **List members with a glob** (`members = ["crates/*"]`) so adding a crate
  needs no manifest edit. Fall back to an explicit list only to exclude a
  sibling directory.

## Shared-Metadata and Lint Inheritance

Declare policy once at the root. Inherit it everywhere. Never copy these
values into member crates. Cargo inherits exactly these package keys:
`authors`, `categories`, `description`, `documentation`, `edition`,
`exclude`, `homepage`, `include`, `keywords`, `license`, `license-file`,
`publish`, `readme`, `repository`, `rust-version`, and `version`. Cargo also
shares `[workspace.dependencies]` and `[workspace.lints]`. Cargo inherits
nothing else.

Root `Cargo.toml`:

```toml
[workspace.package]
edition = "2024"
# Equal to rust-toolchain.toml's channel — that file owns the number, and a
# gate checks the two agree. Copy the value from the scaffold Cargo.toml template.
rust-version = "<toolchain channel>"
# Open source? Uncomment and set your SPDX identifier.
# license = "Apache-2.0"
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
# Uncomment together with the root `license` key.
# license.workspace = true
repository.workspace = true

[lints]
workspace = true

[dependencies]
serde.workspace = true
```

- `[lints] workspace = true` pulls in the strict `[workspace.lints]` tables. A
  crate missing this line silently escapes the entire lint policy — check for
  it in review.
- `[workspace.dependencies]` gives one version requirement per third-party
  crate across the whole workspace: one place to bump. It does not remove
  every duplicate version or build. Different requirements and feature sets
  can still resolve more than one version of one crate.

## Module Layout: No `mod.rs` (Tailrocks Rule)

Use self-named module files. This rule is a Tailrocks rule, not a Cargo
requirement. The workspace Clippy table enforces it with
`clippy::mod_module_files = "deny"`.

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
  tree.

## Tests in Their Own File (Tailrocks Rule)

Do not inline `#[cfg(test)] mod tests { ... }` in a source file. Split logic
from tests, always. This rule is a Tailrocks rule, not a Cargo requirement.
Cargo accepts inline test modules, including in binary targets.

```text
crates/your-core/src/parser.rs         # implementation + `#[cfg(test)] mod tests;`
crates/your-core/src/parser/tests.rs   # ALL tests for parser, inline, nothing else
```

- `parser.rs` ends with `#[cfg(test)] mod tests;`.
- `parser/tests.rs` holds every test function inline. It must **not** declare
  child modules or split tests across sub-files — one module has one test
  surface.
- A `tests.rs` that grows unwieldy signals the module under test does too
  much, not that the test file should split.
- Integration tests that exercise the public API like an external user go
  under the crate's `tests/` directory instead.

## Item Order and Naming

Optimize each file for a first-time reader. The deeper rules live in the
`tailrocks-rust-best-practices` skill
(`tailrocks-rust-best-practices/references/readability-style-architecture.md`).

- Public or entry-point items first, then supporting private helpers. Put
  the module's main type or function before its details.
- Standard Rust naming: use `snake_case` for crates, modules, files,
  functions, and values. Use `UpperCamelCase` for types and traits. Use
  `SCREAMING_SNAKE_CASE` for constants and statics.
- Avoid clever abbreviations. Established domain terms (`tui`, `cli`, `pty`,
  `db`, `ctx`) are fine. Invented shortenings (`mgr`, `cfg_ed`, `ws`) are
  not.
