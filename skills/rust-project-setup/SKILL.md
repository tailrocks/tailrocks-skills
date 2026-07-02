---
name: rust-project-setup
description: Set up or audit a strict, modern Rust project — workspace and crate layout, lint/Clippy/rustfmt config, a pinned toolchain, mise tooling, and supply-chain and test gates. Invoke explicitly to scaffold or harden project structure and tooling; for code-level guidance, use rust-best-practices.
disable-model-invocation: true
---

# Rust Project Setup

Set up Rust projects that are strict by default, modern by default, and
reproducible by default. This skill owns **project structure and tooling**; the
`rust-best-practices` skill owns the code you write inside that structure.

The stance: adopt the latest stable edition, the strictest lint posture that
still ships, and pinned, single-source toolchains. Opt *out* of a rule
explicitly, with a reason — never opt in to strictness after the fact. Do not
carry legacy layouts, `mod.rs` files, resolver 1/2, or unpinned toolchains for
compatibility. Correctness and consistency win over convenience.

## What ships here

Copy-ready config lives in `templates/`. Each is commented and tuned to the
strict baseline described below:

| Template | Destination | Purpose |
|---|---|---|
| `templates/Cargo.toml` | `Cargo.toml` (workspace root) | resolver 3, edition 2024, shared metadata, the full strict `[workspace.lints]` tables, profiles |
| `templates/clippy.toml` | `clippy.toml` | complexity ceilings, allow-in-tests, `disallowed-methods` |
| `templates/rustfmt.toml` | `rustfmt.toml` | edition + `style_edition` 2024, optional nightly import hygiene |
| `templates/rust-toolchain.toml` | `rust-toolchain.toml` | pinned stable channel + components + targets |
| `templates/mise.toml` | `mise.toml` | pinned tools, tasks, `idiomatic_version_file` → Rust |
| `templates/deny.toml` | `deny.toml` | advisories, license allowlist, bans, source lock |
| `templates/.config/nextest.toml` | `.config/nextest.toml` | nextest runner profile |

## Workflow

### New project or crate

1. Create the workspace root even for a single crate. Copy `templates/Cargo.toml`
   to the root and put code under `crates/<name>/`. A workspace from day one
   makes shared lints, metadata, and dependency versions free, and adding a
   second crate is then trivial.
2. Copy `clippy.toml`, `rustfmt.toml`, `rust-toolchain.toml`, `mise.toml`,
   `deny.toml`, and `.config/nextest.toml` to the root. Fill the marked fields
   (`repository`, MSRV, channel, targets, tool versions).
3. In every member crate's `Cargo.toml`, inherit shared policy — never copy it:

   ```toml
   [package]
   name = "your-crate"
   version = "0.1.0"
   edition.workspace = true
   rust-version.workspace = true
   license.workspace = true
   repository.workspace = true

   [lints]
   workspace = true
   ```
4. Provision the toolchain and tools: `mise install`. Then `mise run lint` and
   `mise run test`.
5. Load the matching reference below for the details behind each choice.

### Auditing or hardening an existing project

Work through the references and close the gaps in this order — each is a hard
requirement of the baseline:

- `references/workspace-and-layout.md` — edition 2024, `resolver = "3"`, a
  `crates/` workspace, shared-metadata inheritance, **no `mod.rs`**, tests in
  their own file.
- `references/lints-clippy-rustfmt.md` — the strict `[workspace.lints.rust]` and
  `[workspace.lints.clippy]` tables, `clippy.toml`, rustfmt, warnings policy, and
  suppression discipline.
- `references/toolchain-and-mise.md` — `rust-toolchain.toml` as the single
  version source and **mise everywhere** for tools and tasks.
- `references/supply-chain-and-testing.md` — cargo-deny, cargo-audit,
  cargo-shear, cargo-hack, and cargo-nextest, and how they layer in CI.

## Non-negotiable defaults

- **Edition 2024, `resolver = "3"`.** No older edition or resolver in new work.
- **Workspace always.** Root `[workspace]`; crates under `crates/`; one crate per
  bounded concern; a thin binary over testable library crates.
- **Members inherit.** `[workspace.package]` for metadata, `[lints] workspace =
  true`, `[workspace.dependencies]` for one version per crate. No per-crate
  copies.
- **Self-named modules.** `foo.rs` + `foo/bar.rs`. `clippy::mod_module_files =
  "deny"`. `lib.rs` and `main.rs` are the only crate-root exceptions.
- **Tests in their own file.** `foo.rs` declares `#[cfg(test)] mod tests;`; tests
  live in `foo/tests.rs`, inline, with no child modules.
- **`unsafe_code = "forbid"`** workspace-wide; relax to `deny` only on the one
  crate that needs it, and document every block with `// SAFETY:`.
- **`unwrap`/`expect`/`panic`/`todo`/`dbg`/`print*` denied** in Clippy; tests
  exempted via `clippy.toml`.
- **Pinned toolchain** in `rust-toolchain.toml`; **mise** manages every other
  tool with a committed `mise.lock`.
- **Supply-chain gates** (`cargo deny`, `cargo audit`, `cargo shear`) and
  **nextest** run in CI.
- **Suppress with `#[expect(lint, reason = "...")]`**, never bare `#[allow]`.

## Validation

```bash
cargo fmt --check
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo nextest run --workspace --all-features --locked
cargo test --workspace --doc --locked
cargo deny check advisories licenses bans sources
cargo shear
```

Prefer the `mise run` task wrappers so local and CI commands are identical. When
a check cannot run (a tool is unavailable, a feature set is mutually exclusive),
say so and name what was skipped.
