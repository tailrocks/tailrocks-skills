---
name: tailrocks-rust-project-setup
description: Scaffold, audit, or remediate a latest-compatible strict Rust workspace baseline. Use for workspace layout, toolchains, lints, formatting, mise, dependency policy, and test gates; audits are read-only unless remediation is explicitly requested.
disable-model-invocation: true
user-invocable: true
---

# Rust Project Setup

Establish one reproducible baseline for project structure and tooling. Code-level
API and domain design are outside this skill.

Before changing configuration, apply the freshness gate in
[`version-policy.md`](references/version-policy.md). Resolve current releases
from official sources, select the latest compatible stable versions, and commit
exact toolchain and lock state. If only a prerelease satisfies the required
stack, report it and require explicit approval.

Use `scripts/resolve-crate-versions.ts <crate>...` through Bun when crate version
selection is part of the change. Treat its JSON as registry evidence, then verify
compatibility and feature requirements in official crate documentation.

## Modes

- `scaffold`: create a new workspace and its baseline.
- `audit`: inspect and produce a gap report; do not edit files or install tools.
- `remediate`: close approved audit gaps in never-broken slices.

Do not infer mutation permission from the presence of gaps.

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

## Existing workspace audit and remediation

Inspect the same four references in order: layout, lint/format policy,
toolchain/mise, then supply-chain/testing. In `audit` mode, stop after the gap
list. In `remediate` mode, close one approved coherent layer at a time. Keep each
intermediate state buildable; use narrow, reasoned exceptions for legacy debt
instead of broad allows.

**Complete when:** every rule in all four references is satisfied, represented by
a documented exception with an owner, or recorded as a specific blocker.

## Final gate

Verify edition 2024 and resolver 3, workspace inheritance, self-named modules,
separate test files, workspace unsafe policy, strict lint participation, exact
tool versions, committed lock state, local/CI task parity, and all declared
quality gates. Report every skipped command and unresolved exception.
