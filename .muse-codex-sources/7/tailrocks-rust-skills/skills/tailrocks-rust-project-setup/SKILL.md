---
name: tailrocks-rust-project-setup
description: >-
  Use only when the user explicitly requests this skill. Scaffold a strict Rust workspace with layout, toolchains, lints, mise, dependency policy, and test gates. For existing projects, use tailrocks-rust-project-audit to report gaps or tailrocks-rust-project-remediate for approved fixes.
argument-hint: "<new workspace requirements>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Project Setup

## Use this skill

This skill establishes one reproducible baseline for project structure and
tooling. It creates a new Rust workspace surface. Code-level API and domain
design are outside this skill.

Use this skill only when the user explicitly requests it. Do not use this
skill on an existing Rust workspace. Gap discovery on existing work belongs
to `tailrocks-rust-project-audit`. Approved fixes belong to
`tailrocks-rust-project-remediate`.

## Before you start

Obey the active user request first. If a Rust workspace already exists,
refuse without inspecting or changing it. Route gap discovery to
`tailrocks-rust-project-audit`. Route approved fixes to
`tailrocks-rust-project-remediate`.

Before changing configuration, apply the freshness gate in
`references/version-policy.md`. Apply the common freshness rule in
`references/shared-version-policy.md` before the Rust-specific version
policy. Before any action, read `references/runtime-trust.md`. Cite secret
locations and types without copying values.

Resolve current releases from official sources. Select the latest
compatible stable versions. Commit exact toolchain and lock state. If only
a prerelease satisfies the required stack, report it. Require explicit
approval before use.

The skill accepts one argument: the new workspace requirements.

## Procedure

1. **Lay out the workspace.** Read
   `references/workspace-and-layout.md`. Create the virtual root,
   `crates/` members, inherited metadata and dependencies and lints, and
   self-named modules. This step is complete when every member is under
   the workspace and inherits root policy. No legacy `mod.rs` and no
   inline test module remain in the created surface. Both rules are
   Tailrocks rules.
2. **Resolve versions natively.** When crate version selection is part of
   the change, query the crates.io API for one crate at a time. Read its
   maximum stable version from the response. Verify compatibility and
   feature requirements in official crate documentation. This step is
   complete when every selected version has registry evidence and
   documented compatibility.
3. **Install policy files.** Copy the templates from `assets/` rather
   than reconstructing policy:

   | Template | Destination |
   | --- | --- |
   | `Cargo.toml` | workspace `Cargo.toml` |
   | `clippy.toml` | `clippy.toml` |
   | `rustfmt.toml` | `rustfmt.toml` |
   | `rust-toolchain.toml` | `rust-toolchain.toml` |
   | `mise.toml` | `mise.toml` |
   | `deny.toml` | `deny.toml` |
   | `.cargo/audit.toml` | `.cargo/audit.toml` |
   | `.config/nextest.toml` | `.config/nextest.toml` |

   Replace marked project values. Ratchet thresholds from the measured
   repository baseline. Preserve stronger compatible local policy. Fill
   repository, MSRV, exact toolchain, targets, and tool versions. The
   `license` key ships commented out. Set it only for an open-source
   project. Never assume a license. Read
   `references/lints-clippy-rustfmt.md` before changing lint groups,
   thresholds, formatter policy, or suppression rules. This step is
   complete when each policy has one source of truth and each member opts
   into workspace lints.
4. **Pin tools and tasks.** Read `references/toolchain-and-mise.md`. Let
   `rust-toolchain.toml` own Rust. Let mise own other tools and
   reproducible task entry points. This step is complete when local and CI
   commands resolve through the same committed versions and task
   definitions.
5. **Wire quality gates.** Read `references/supply-chain-and-testing.md`.
   Add fast pull-request gates. Add separate heavy scheduled and
   pre-release gates. This step is complete when formatting, Clippy,
   tests, doctests, license and source policy, advisories, and unused
   dependencies each have an explicit owner and cadence.
6. **Validate.** Provision with `mise install`. Then run the existing
   format, lint, test, dependency, and supply-chain tasks of the
   repository that apply to the new surface. Run the `vet` task only
   after `cargo vet init` created `supply-chain/`. This step is complete
   when every applicable gate has a recorded pass, failure,
   unavailability, or explicit reason it did not run.

## Result

The target holds a new Rust workspace with layout, policy files, pinned
tools, and quality gates. The report lists created paths, selected
versions, validation outcomes, skipped commands, and unresolved
exceptions.

## Completion checks

Before the result is complete, make sure that each item below is true:

- The workspace uses edition 2024 and resolver 3 with workspace
  inheritance.
- The created surface uses self-named modules and separate test files.
- The workspace unsafe policy and strict lint participation are in place.
- Tool versions are exact, lock state is committed, and local and CI
  tasks match.
- All declared quality gates have an owner and cadence.
- The report names every skipped command and unresolved exception.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/shared-version-policy.md` and
  `references/version-policy.md` before changing configuration for the
  freshness gates.
- Read `references/workspace-and-layout.md` in step 1 for workspace
  structure.
- Read `references/lints-clippy-rustfmt.md` in step 3 for lint and
  formatter policy.
- Read `references/toolchain-and-mise.md` in step 4 for toolchain and
  task ownership.
- Read `references/supply-chain-and-testing.md` in step 5 for gate
  assignment and cadence.
