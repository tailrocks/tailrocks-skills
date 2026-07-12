---
name: tailrocks-rust-project-setup
description: Scaffold or audit a strict modern Rust workspace with edition 2024, resolver 3, inherited lints, pinned tooling, mise tasks, supply-chain gates, and nextest.
disable-model-invocation: true
---

# Rust Project Setup

Establish one reproducible baseline for project structure and tooling. Use
`tailrocks-rust-best-practices` for code-level ownership, API, error, test, and
performance decisions.

## Copy-ready baseline

Copy from `templates/` rather than reconstructing policy:

| Template | Destination |
|---|---|
| `Cargo.toml` | workspace `Cargo.toml` |
| `clippy.toml` | `clippy.toml` |
| `rustfmt.toml` | `rustfmt.toml` |
| `rust-toolchain.toml` | `rust-toolchain.toml` |
| `mise.toml` | `mise.toml` |
| `deny.toml` | `deny.toml` |
| `.config/nextest.toml` | `.config/nextest.toml` |

Preserve stronger compatible local policy. Replace marked project values and
ratchet thresholds from the repository's measured baseline.

## New workspace

1. **Lay out the workspace.** Read
   [`workspace-and-layout.md`](references/workspace-and-layout.md). Create the
   virtual root, `crates/` members, inherited metadata/dependencies/lints, and
   self-named modules.
   **Complete when:** every member is under the workspace, inherits root policy,
   and no legacy `mod.rs` or inline test module remains in the created surface.

2. **Install policy files.** Copy the templates and fill repository, license,
   MSRV, exact toolchain, targets, and tool versions. Read
   [`lints-clippy-rustfmt.md`](references/lints-clippy-rustfmt.md) before changing
   lint groups, thresholds, formatter policy, or suppression rules.
   **Complete when:** each policy has one source of truth and each member opts
   into workspace lints.

3. **Pin tools and tasks.** Read
   [`toolchain-and-mise.md`](references/toolchain-and-mise.md). Let
   `rust-toolchain.toml` own Rust; let mise own other tools and reproducible task
   entry points.
   **Complete when:** local and CI commands resolve through the same committed
   versions and task definitions.

4. **Wire quality gates.** Read
   [`supply-chain-and-testing.md`](references/supply-chain-and-testing.md). Add
   fast PR gates and separate heavy scheduled/pre-release gates.
   **Complete when:** formatting, Clippy, tests, doctests, license/source policy,
   advisories, and unused dependencies each have an explicit owner and cadence.

5. **Validate.** Provision with `mise install`, then run the repository's mise
   tasks for formatting, Clippy, tests, doctests, dependency policy, and shear.
   **Complete when:** every applicable gate has a recorded pass, failure,
   unavailability, or explicit reason it was not run.

## Existing workspace audit

Inspect the same four references in order: layout, lint/format policy,
toolchain/mise, then supply-chain/testing. Produce a gap list before editing and
close one coherent layer at a time. Keep each intermediate state buildable; use
narrow, reasoned exceptions for legacy debt instead of broad allows.

**Complete when:** every rule in all four references is satisfied, represented by
a documented exception with an owner, or recorded as a specific blocker.

## Final gate

Verify edition 2024 and resolver 3, workspace inheritance, self-named modules,
separate test files, workspace unsafe policy, strict lint participation, exact
tool versions, committed lock state, local/CI task parity, and all declared
quality gates. Report every skipped command and unresolved exception.
