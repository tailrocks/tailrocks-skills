# The Apple platform shell

Companion to [`rust-core-boundary.md`](rust-core-boundary.md). This is what
makes "all business logic in Rust" practical without binding every Apple
framework into Rust: capabilities inseparable from Apple's lifecycle and
entitlement model — StoreKit, BackgroundTasks, Keychain, notifications,
security-scoped files, WidgetKit, App Intents, camera and share — get thin
Swift adapters. The adapter executes the requested Apple **mechanism** and
returns normalized facts; every **product decision** stays in Rust.

The dividing question for any new capability: is this call Apple mechanism
(present the purchase sheet, store a keychain item, register a background
task) or product policy (whether the purchase unlocks access, when to ask,
whether to retry)? Mechanism → Swift adapter. Policy → Rust. An adapter
that decides whether a purchase is allowed, when a retry happens, whether a
document is valid, or whether a notification changes application state has
crossed the line — that is a review finding.

## The effect protocol

Rust requests platform work as a `PlatformEffect` (an ID plus a typed
kind); Swift executes it and returns a `PlatformEffectResult`; Rust marks
it acknowledged. The contract, all parts mandatory:

- **Durable queue.** Pending effects live in Rust's durable store until
  acknowledged — never as one streamed event. Stream notifications are
  lossy (bounded ring buffer, drop-on-full), and the process may be
  suspended or killed mid-effect.
- **Drain on activation.** Swift calls `pendingPlatformEffects()` on every
  foreground activation and after each update notice, so a dropped event or
  a background kill never strands an effect.
- **Idempotent by effect ID.** Executing the same effect twice must be
  safe, and one effect ID is never executed twice concurrently.
- **Scene scoping.** Limit draining to effects the current scene can
  execute (a widget process cannot present a purchase sheet).

The Swift side is one narrow protocol composed of small services:

```swift
@MainActor
protocol PlatformEffectHandling {
    func handle(_ effect: PlatformEffect) async -> PlatformEffectResult
}
```

The concrete handler switches on the effect kind and delegates to
`PurchaseService`, `KeychainService`, `FileAccessService`,
`NotificationService`, `BackgroundTaskService` — each mockable, none
containing policy.

## Per-framework splits

**StoreKit.** Swift loads native products, presents the purchase sheet,
receives verification results, and listens for transaction updates. Rust
receives normalized facts — product ID, transaction ID, original
transaction ID, verified/unverified status, purchase and expiration dates,
revocation status, ownership type — and decides entitlement and product
behavior. Localized prices and store display text stay in Swift: they are
presentation data supplied by the store.

**Keychain.** Swift owns the storage mechanism (store, retrieve, delete).
A secret may pass into Rust's in-memory authentication service when needed,
but never appears in observable view state or ordinary logs.

**Notifications.** Swift owns the authorization request, APNs
registration, device-token conversion, response callbacks, and links to
native notification settings. Rust owns whether and when to ask, the
token's meaning, server registration, business interpretation of payloads,
and the resulting navigation or data change.

**Files.** Swift owns `fileImporter`/`fileExporter`, security-scoped URL
access and macOS bookmarks, share sheets, and content-type selection. Rust
owns parsing, validation, transformation, import rules, export
serialization, and domain conflicts. Large data crosses as a file URL,
never as megabytes through the bridge.

**WidgetKit.** A small Swift target. Rust writes a compact read-only
widget snapshot into the App Group container; the widget extension reads
and renders it. Never boot the full Rust application runtime for a widget
timeline request.

**App Intents.** A small Swift target: the intent receives native
parameters, converts them to a typed Rust command, Rust executes the
business operation, Swift converts the result to an intent result.

## Networking and persistence split

Ordinary foreground API networking, authentication rules, retry/backoff,
response parsing, and caching are Rust (one reusable HTTP client, never a
client per action). Use a Swift adapter with system-managed URL loading
only when the feature needs Apple background-transfer behavior — a
download or upload that must continue under system background scheduling —
returning the finished file location and normalized outcome to Rust.

Rust is the **only authoritative persistence layer**: the embedded
database, migrations, repositories, cache tables, the sync outbox and
checkpoints, and the pending-effect queue. Swift supplies the correct
container path (Application Support, App Group, caches, temporary); Rust
opens and manages the database there. No SwiftData or Core Data store
alongside the Rust database without a documented Apple-framework need —
two authoritative stores create synchronization and migration complexity.

Remote writes go through a Rust-owned durable outbox: local transaction
updates the model and enqueues the sync operation, the UI updates
immediately, background sync acknowledges or marks a conflict. Operations
survive suspension and process termination.

## The iOS lifecycle

Backgrounding does not merely hide the UI: the process is suspended by
default and receives no CPU time; background execution is opportunistic,
constrained, and not guaranteed. Consequences for the Rust runtime, each
mandatory:

- Tokio provides no independent background execution; Rust stops making
  progress when the app is suspended.
- Never rely on a Rust shutdown callback running.
- Persist important state incrementally; make operations resumable;
  checkpoint before and during long work.
- Treat every foreground activation as potential process recovery: full
  snapshot reconciliation plus effect-queue drain.

Swift observes `scenePhase` and sends semantic lifecycle actions —
`becameActive` (Rust refreshes stale state; the store reconciles),
`becameInactive`, `enteredBackground` (Rust flushes durable state, pauses
nonessential work, marks sync resumable). The shell never encodes what
those transitions *mean*; it reports them.

**BackgroundTasks are brokered by Swift.** Swift owns registration,
scheduling, expiration handlers, progress the system requires, and
completion reporting for app-refresh and processing tasks. When the system
grants time, Swift hands Rust an execution context with a deadline; Rust
runs the resumable unit of business work and checkpoints; Swift reports
completion. Work must cooperate with expiration — save progress and
return, never fight the deadline.
