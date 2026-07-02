# Toolchain and mise

Use this reference to pin the Rust toolchain and manage every other tool with
mise. Two rules drive everything here: **`rust-toolchain.toml` is the single
source of the Rust version**, and **mise manages every other tool**, with a
committed lockfile so local and CI environments are identical.

## Contents

- rust-toolchain.toml: the single version source
- MSRV versus the pinned channel
- mise everywhere
- Reading the toolchain from rust-toolchain.toml
- Pinning tools
- Tasks and CI parity
- Bootstrapping

## rust-toolchain.toml: The Single Version Source

`templates/rust-toolchain.toml`. Commit it. It is read by rustup, rust-analyzer,
CI, and mise, so the Rust version is declared here and nowhere else.

```toml
[toolchain]
channel = "1.90.0"
components = ["clippy", "rustfmt"]
# targets = ["x86_64-unknown-linux-gnu", "aarch64-unknown-linux-gnu"]
```

- **Pin an exact stable release** (`1.90.0`), never the bare `stable` channel.
  `stable` silently moves under you on the next release and turns an unrelated
  commit into the one that "broke CI". Bump the pin deliberately, in its own
  commit.
- List **components** you require (`clippy`, `rustfmt`) so every environment
  provisions them.
- List **targets** you build or cross-compile for so `mise install` and CI fetch
  them up front.

## MSRV Versus the Pinned Channel

These are two different numbers with two different jobs:

- **`rust-version` in `Cargo.toml`** — the MSRV *floor*, the oldest toolchain you
  promise to support. Verify it with a CI job that builds on exactly that version
  (for example `cargo +1.90 check --workspace`).
- **`channel` in `rust-toolchain.toml`** — the toolchain everyone actually builds
  and lints with. It is usually newer than the floor.

Keeping them distinct lets you develop on a current compiler while still
guaranteeing the floor compiles.

## mise Everywhere

Use [mise](https://mise.jdx.dev) as the toolchain and dev-tool manager for every
Rust project. It is the house standard.

Why mise:

- **One installer, pinned.** Every contributor and CI runner gets the same tool
  versions from one `mise install`.
- **A committed `mise.lock`.** Exact resolved versions are recorded and enforced
  (`lockfile = true`), so "works on my machine" version skew disappears.
- **CI parity.** CI provisions tools with the same file (via `jdx/mise-action`)
  and runs the same `mise run` tasks, so a green local run means a green CI run.

## Reading the Toolchain From rust-toolchain.toml

Do not list Rust in `[tools]`. Point mise at the toolchain file instead:

```toml
[settings]
idiomatic_version_file_enable_tools = ["rust"]
```

mise then reads `channel` and `components` from `rust-toolchain.toml`. Declaring
the Rust version in both files is the single most common mistake — it creates two
sources that drift. The toolchain file wins; `mise.toml` stays silent on Rust.

## Pinning Tools

`templates/mise.toml`:

```toml
[tools]
"cargo:cargo-nextest" = "latest"
"cargo:cargo-deny" = "latest"
"cargo:cargo-audit" = "latest"
"cargo:cargo-shear" = "latest"
"cargo:cargo-hack" = "latest"
cargo-binstall = "latest"

[settings]
cargo.binstall = true
idiomatic_version_file_enable_tools = ["rust"]
lockfile = true
```

- The `cargo:` backend installs a cargo tool; with `cargo.binstall = true` mise
  fetches a prebuilt binary via cargo-binstall instead of compiling from source.
- Replace `"latest"` with the exact versions from `mise.lock` after the first
  `mise install`, so builds are fully reproducible rather than "whatever was
  newest that day".
- Add project-specific tools the same way (`shellcheck`, `actionlint`, `node`,
  `zig`, a docs toolchain).

## Tasks and CI Parity

Define one task per check class and run the identical command locally and in CI:

```toml
[tasks.lint]
run = [
    "cargo fmt --check",
    "cargo clippy --workspace --all-targets --all-features --locked -- -D warnings",
]

[tasks.test]
run = [
    "cargo nextest run --workspace --all-features --locked",
    "cargo test --workspace --doc --locked",
]

[tasks.deny]
run = "cargo deny check advisories licenses bans sources"
```

Keeping the commands *in* `mise.toml` (not duplicated in a workflow YAML) is what
guarantees a failure reproduces locally with the same invocation.

## Bootstrapping

```bash
mise install          # provision the toolchain + all tools from the lockfile
mise run lint         # fmt check + strict clippy
mise run test         # nextest + doctests
mise run deny         # supply-chain gates
```
