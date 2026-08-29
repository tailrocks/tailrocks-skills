---
name: tailrocks-swift-rust-core-setup
description: >-
  Use only when the user explicitly requests this skill. Add the project-level Rust-core lane to a native Swift app: one-way generated bindings, isolated bridge packages, binding-drift proof, and Rust gates in the shared pipeline.
argument-hint: "<Swift project and approved Rust-core setup scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Rust-Core Setup

Own project wiring for a SwiftUI shell over a Rust-owned application runtime.
Boundary architecture and application behavior belong to
`tailrocks-swift-rust-core-boundary`; generic baseline work belongs to the Swift
project setup/audit/remediation owners; Rust workspace mechanics belong to the
Rust project family.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`shared-version-policy.md`](references/shared-version-policy.md), then
[`rust-core.md`](references/rust-core.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Setup

1. **Bind authority and prerequisites.** Record canonical Swift/Rust roots,
   revisions, dirty state, generated-binding tool/version, package graph,
   current gates, approved paths, compatibility oracle, and rollback boundary.
   Require an established Swift project baseline and explicit mutation
   authority; otherwise report the exact prerequisite.
2. **Enforce one-way ownership.** Keep bridge knowledge in contracts and FFI
   crates. Generated bindings are imported only by the handwritten bridge
   package; application views and feature packages never import them directly.
   Rust remains the application-runtime owner.
3. **Make generation reproducible.** Pin the bridge crate and CLI to the exact
   same version under latest-stable policy; upgrades are dedicated scope. Treat
   generator code and build scripts as supply-chain execution: inspect them
   first; scrub secrets; disable network except a separately authorized immutable
   fetch; make the target tree enforceably read-only; and use owner-only external
   cache, output, and staging. Bound fetch/retry/output/process trees and TERM
   then KILL on expiry. Compare public interface and drift, then CAS-publish only
   approved staged bytes if destinations are unchanged.
   Add a check-only binding-drift task whose check path never generates.
4. **Join the shared pipeline.** Add the Rust test lane and binding-drift proof
   beside the Swift generate/build/test tasks, preserving local/CI command
   parity and non-vacuous counts. Stable shipping gates; the forward lane stays
   nonblocking. Keep caches and derived outputs outside source ownership.
5. **Publish and prove transactionally.** Hash Git-visible bytes, stage writes,
   re-check preimages, and refuse concurrent replacement. Run ABI/generation
   drift, package-direction, Rust tests, Swift build, and integration proof under
   the same sandbox. Re-hash afterward; only approved CAS-published paths may
   differ. Retain recovery evidence on uncertainty. Report all gates and skips.

## Final gate

One-way package chain; generated FFI only; pinned reproducible generation;
binding-drift and counted Rust tests in the same task graph; Swift build passes;
no concurrent overwrite, hidden business-logic move, or unresolved recovery.
