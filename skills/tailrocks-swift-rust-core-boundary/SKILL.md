---
name: tailrocks-swift-rust-core-boundary
description: >-
  Use only when the user explicitly requests this skill. Design, implement, or review the thin SwiftUI platform shell over a Rust-owned application runtime: generated FFI, immutable view state, typed actions, durable Apple effects, and one main-actor store.
argument-hint: "<Rust-core Swift boundary task or review scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Rust-Core Boundary

Own the architecture where a native SwiftUI shell fronts a Rust application
runtime. Ordinary Swift code writing/review/refactor belongs to separate owners.

Apply [`runtime-trust.md`](references/runtime-trust.md), then read
[`rust-core-boundary.md`](references/rust-core-boundary.md). Also read
[`apple-platform-shell.md`](references/apple-platform-shell.md) for StoreKit,
Keychain, notifications, background tasks, files, widgets, intents, or lifecycle.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Boundary

1. **Bind authority and mode.** Record exact Rust/Swift revisions and paths,
   requested architecture/implementation/review output, target platforms, ABI
   baseline, compatibility oracle, and mutation scope. Review and
   architecture-only analysis are immutable; any code or artifact edit requires
   explicit write authority.
2. **Assign responsibility once.** Rust owns domain rules, application state,
   I/O, persistence, synchronization, decisions, effect queue, and recoverability.
   Swift owns scenes, native presentation, localization/formatting, and narrow
   Apple mechanisms. Generated FFI alone converts types.
3. **Enforce the message/store contract.** Typed semantic actions enter Rust;
   feature-scoped immutable view state returns. Exactly one `@MainActor
   @Observable` store owns the core handle; views see state plus `send`, never
   FFI. Notices are lossy invalidations followed by snapshot pulls.
4. **Make platform effects durable.** Rust queues effects until acknowledged;
   Swift executes an Apple mechanism idempotently per effect ID and returns a
   typed result. Product policy stays in Rust. Reconcile on launch, reconnect,
   activation, and dropped-notice recovery.
5. **Prove and report.** Test generated ABI compatibility, enqueue latency,
   revisions, loss recovery, cancellation, effect replay/idempotency, lifecycle,
   localization, and actor isolation. Implementation uses CAS-safe writes and
   never overwrites concurrent bytes. Review commands require explicit execution
   authority, an enforceably read-only tree, frozen existing tools/inputs,
   scrubbed secrets, disabled network, external owner-only cache/output, bounded
   time/output/children, and TERM then KILL. Hash before/after; never install,
   generate, format-write, or restore user bytes. Otherwise commands are not run.
   Report ownership table, proof, and residual boundary risk.

## Final gate

One core handle owner; no FFI in views; no business rule or network/database work
in Swift; no user-facing English in Rust; durable idempotent effects; generated ABI.
