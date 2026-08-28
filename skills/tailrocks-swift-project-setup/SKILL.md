---
name: tailrocks-swift-project-setup
description: >-
  Use only when the user explicitly requests this skill. Scaffold a new strict native macOS Swift baseline: declarative generation, deployment and SDK lanes, local signing, strict format/lint gates, tests, and mise-owned command parity. Existing projects route to audit or remediate.
argument-hint: "<new macOS project requirements>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Project Setup

Create one reproducible baseline for a new native macOS application. Existing
project inspection belongs to `tailrocks-swift-project-audit`; approved gap
closure belongs to `tailrocks-swift-project-remediate`. Agent wiring and a
Rust-core lane have separate owners.

Apply [`runtime-trust.md`](references/runtime-trust.md), then
[`shared-version-policy.md`](references/shared-version-policy.md). Resolve
current official stable releases before writing; when resolution is unavailable,
report the blocker instead of inventing or retaining placeholder pins.

## Scaffold

1. **Refuse an existing project.** Resolve the requested root before mutation.
   If Swift project configuration, sources, or a generated project already
   exist, refuse without auditing or changing them and route to
   `tailrocks-swift-project-audit`. Record allowed paths, preimages, and dirty
   state. **Complete when:** the target is a new-project scope with explicit
   write authority. Bind the canonical parent identity and prove the target is
   absent before any side effect.
2. **Write canonical baseline bytes.** Copy from [`templates/`](templates/),
   never reconstruct policy from prose. In order: `mise.toml`, `.gitignore`,
   `project.yml`, `.swift-format`, root/test/UI-test SwiftLint files, one Swift
   Testing test, one XCUITest with scoped accessibility audit, then the app entry
   point. Preserve any stronger compatible pre-existing policy inside the
   approved empty scaffold boundary. **Complete when:** every required artifact
   has one owner and marked project values are resolved literally.
3. **Establish project generation.** Apply
   [`project-generation.md`](references/project-generation.md). Use a declarative
   generator and `type: syncedFolder` for every target source entry; never commit
   generated project/workspace files. A package-only SwiftUI executable is not a
   signed application bundle and is refused. **Complete when:** one command
   generates a buildable app and adding a source needs no project-file edit.
4. **Pin the toolchain and SDK lanes.** Apply
   [`toolchain.md`](references/toolchain.md). Commit the minimum deployment
   target, stable shipping Xcode/SDK lane, beta forward-validation lane, exact
   tool pins, ad-hoc local signing, and the decided fallback/removal condition
   for forward-only APIs. **Complete when:** all values are explicit and no
   forward-only symbol reaches shipping unguarded.
5. **Install strict local policy.** Apply
   [`lint-and-format.md`](references/lint-and-format.md) and
   [`testing.md`](references/testing.md). The formatter comes from Xcode; do not
   install another. Format and lint violations fail, mistyped test selectors
   cannot report zero tests as success, and unit/UI/accessibility lanes have
   owners and cadence. Never put derived data under `/tmp` or `/private/tmp`.
   Never treat `UIDesignRequiresCompatibility` as a permanent strategy.
   **Complete when:** both false-green traps are mechanically blocked.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
6. **Publish transactionally.** Build the whole tree in owner-only external
   staging. Bound installs/fetches, retries, time, output, and process trees;
   TERM then KILL on expiry. Inspect generated output before publication.
   Re-check that the target is absent and its parent identity is unchanged, then
   atomically publish. Never overwrite or remove a concurrent replacement. Roll
   back only still-owned writes; retain named recovery evidence on uncertainty.
   **Complete when:** the complete baseline publishes, the target stays absent,
   or named recovery artifacts preserve uncertain state.
7. **Validate the complete baseline.** Provision only after files exist, then
   run the committed `mise run generate`, `format:check`, `lint`, `build`, and
   `test` tasks. CI invokes those same task names; the task set is the parity
   artifact. Report counts and every skip/blocker. **Complete when:** each gate
   has a pass, failure, or explicit unavailable reason.

## Specialist routes

- Xcode bridge and installed skill ownership:
  `tailrocks-swift-agent-integration`.
- Rust-owned application runtime and Swift package chain:
  `tailrocks-swift-rust-core-setup`.

Selection of either specialist supplies no mutation authority. Invoke it only
when its scope is explicitly requested.

## Final gate

New target only; canonical templates; declarative synchronized generation;
committed exact pins and both SDK lanes; ad-hoc signing; strict format/lint;
non-vacuous unit/UI/accessibility tests; external derived data; local/CI task
parity; no concurrent overwrite or unresolved recovery state.
