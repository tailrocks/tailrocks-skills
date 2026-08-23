# The Apple platform shell over a Rust core

Status: adopted 2026-08-16. Source: an architecture research pass into the
strongest shape for the house's native-app rule ("thin SwiftUI shell over a
Rust-owned application runtime"), accepted as the source of truth for what
the macOS/Swift skill family teaches. This note records the decisions and
where each one is encoded; the skills are the normative text.

## The decisions

1. **The shell is an Apple platform shell, not only a UI layer.** Some
   nonvisual capabilities — StoreKit, BackgroundTasks, WidgetKit, App
   Intents, notification authorization, Keychain, security-scoped files —
   are inseparable from Apple's lifecycle and entitlement model. Their
   mechanism lives in Swift as narrow adapters; every product decision
   around them stays in Rust. This upgrades the previous "tiny Swift
   adapter as a named exception" framing into a first-class, contract-bound
   layer.
2. **The boundary is five message concepts, not four.** `AppAction`,
   feature-scoped `ViewState`, `UpdateNotice`, `PlatformEffect` /
   `PlatformEffectResult`, and `CoreError`. The platform-effect pair is the
   new concept; the update stream changed meaning (next item).
3. **Notices are lossy; state is pulled.** Bridge streams ride a bounded
   per-subscription ring buffer that drops new events when full, so a
   streamed event is never a guaranteed-delivery business log. Rust pushes
   a lightweight invalidation (revision + changed features); Swift pulls
   the latest snapshots, applies only newer revisions, and fully
   reconciles on launch, reconnection, and foreground activation. This
   replaced the earlier push-the-new-state stream model.
4. **Platform effects are durable until acknowledged.** Pending effects
   live in a durable Rust queue; Swift drains `pendingPlatformEffects()`
   on activation and after notices; execution is idempotent per effect ID.
   A dropped stream event or a suspended process cannot strand an effect.
5. **Snapshots are feature-scoped by default.** One giant observed state
   value invalidates every view on any change and re-encodes the whole
   tree at the boundary; per-feature snapshot properties (sidebar,
   content, detail, sync status) replaced whole-screen-snapshot-first.
6. **"Swift MVVM with Rust repositories" is rejected by name.** Screen
   view models that own validation, retries, permissions, and navigation
   turn Swift into the real application and Rust into a helper library,
   duplicating every state machine. The named anti-model gives reviews a
   handle.
7. **The iOS lifecycle is a runtime constraint, not a UI detail.**
   Suspension stops the Rust runtime; nothing may rely on a shutdown
   callback. Incremental persistence, resumable operations, checkpoints,
   scene-phase actions as semantic lifecycle events, Swift-brokered
   BackgroundTasks, and a Rust-owned durable outbox follow.
8. **Packaging isolates the bridge on both sides.** Bridge knowledge is
   confined to two crates (`apple-contracts`, `apple-ffi`); on the Swift
   side only the handwritten `AppCoreBridge` package imports the generated
   bindings, and everything else depends on the bridge package. Static
   library with release debug info for symbolication; split SwiftPM
   layout; one FFI module while multi-module packaging has open bridge
   issues; bridge crate and CLI pinned to the same exact version and
   upgraded only as a dedicated change.

## Where each decision is encoded

- `skills/tailrocks-swift-best-practices/references/rust-core-boundary.md`
  — decisions 1 (summary), 2, 3, 5, 6, plus the dispatch contract, store
  rule, FFI performance rules, and the testing split (including
  lost-notice reconciliation and effect-idempotency tests).
- `skills/tailrocks-swift-best-practices/references/apple-platform-shell.md`
  — decisions 1, 4, 7 in full: the effect protocol, per-framework
  mechanism/policy splits, networking and persistence split, the durable
  outbox, and the iOS lifecycle rules.
- `skills/tailrocks-swift-rust-core-setup/references/rust-core.md` —
  decision 8: layout, Cargo configuration, pins, packaging, and the CI
  gate order.
- `skills/tailrocks-macos-design/references/anti-patterns.md` §12 — the
  one glass rule the research pass surfaced that the family had not stated
  explicitly: raw `glassEffect` on a standard button versus the native
  glass button styles.
- Root `AGENTS.md` — the doctrine sentence now names the platform-shell
  refinement so every skill inherits it.

## Deliberately not adopted

- No new skill. The architecture deepens the existing family
  (best-practices owns the contract, project-setup owns the build); a
  separate skill would split one responsibility across two owners.
- No verbatim import of the research report. House rule: knowledge is
  extracted into the skills' own references; external prose is not a
  dependency. Version-bearing facts (bridge version, toolchain lanes)
  carry verification dates and re-resolve at execution time.
