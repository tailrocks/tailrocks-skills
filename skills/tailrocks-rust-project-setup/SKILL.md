---
name: tailrocks-rust-project-setup
description: >-
  Use only when the user explicitly requests this skill. Scaffold a strict Rust workspace with layout, toolchains, lints, mise, dependency policy, and test gates. For existing projects, use tailrocks-rust-project-audit to report gaps or tailrocks-rust-project-remediate for approved fixes.
argument-hint: "<new workspace requirements>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Project Setup

Establish one reproducible baseline for project structure and tooling. Code-level
API and domain design are outside this skill.

This skill creates a new Rust workspace surface. If a Rust workspace already
exists, refuse without inspecting or changing it and route gap discovery to
`tailrocks-rust-project-audit` or approved fixes to
`tailrocks-rust-project-remediate`.

Before changing configuration, apply the freshness gate in
[`version-policy.md`](references/version-policy.md). Resolve current releases
from official sources, select the latest compatible stable versions, and commit
exact toolchain and lock state. If only a prerelease satisfies the required
stack, report it and require explicit approval.

Use `scripts/resolve-crate-versions.ts <crate>...` through Bun when crate version
selection is part of the change. Treat its JSON as registry evidence, then verify
compatibility and feature requirements in official crate documentation.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Apply the common freshness rule in
[`shared-version-policy.md`](references/shared-version-policy.md) before the
Rust-specific version policy. Cite secret locations and types without copying values.

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

2. **Install policy files.** Copy the templates and fill repository, MSRV,
   exact toolchain, targets, and tool versions. The `license` key ships
   commented out — set it only when the project is open source, and never
   assume one. Read
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
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

5. **Validate.** Provision with `mise install`, then run the repository's mise
   tasks for formatting, Clippy, tests, doctests, dependency policy, and shear.
   **Complete when:** every applicable gate has a recorded pass, failure,
   unavailability, or explicit reason it was not run.

## Final gate

Verify edition 2024 and resolver 3, workspace inheritance, self-named modules,
separate test files, workspace unsafe policy, strict lint participation, exact
tool versions, committed lock state, local/CI task parity, and all declared
quality gates. Report every skipped command and unresolved exception.
