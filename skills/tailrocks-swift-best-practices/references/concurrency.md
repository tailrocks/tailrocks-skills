# Concurrency

Strict concurrency is a design constraint, not a diagnostic to silence. Code that
was annotated until the compiler stopped complaining compiles and then deadlocks
or drops work.

## Decide isolation per type, once

Write down, for each type, which of these it is:

- **Main-actor isolated** — user interface state and anything that touches it.
- **Actor isolated** — mutable state with a single logical owner and asynchronous
  access.
- **Sendable value** — immutable, or safely copyable across isolation domains.
- **Deliberately non-isolated** — pure computation with no mutable state.

A type that cannot be placed in one of these four categories has an ownership
problem that annotations will not fix.

Do not annotate a type main-actor isolated merely because a call site is. That
pulls background work onto the main actor and the symptom appears later as a
stutter during scrolling or resizing, far from the cause.

## Escape hatches are claims

An unchecked `Sendable` conformance, a non-isolated escape, or a captured
reference across an isolation boundary is a claim that some invariant makes the
access safe. Write the invariant down at the declaration:

```swift
// Safe: `storage` is only mutated during `init`, before any reference escapes.
// Every later access is read-only.
final class ImmutableAfterInit: @unchecked Sendable { … }
```

A claim with no stated invariant is a suppressed diagnostic wearing a costume.
Reject it in review.

## Structured by default

Prefer task groups and `async let` to detached tasks. Structured concurrency
gives cancellation, error propagation, and lifetime for free.

An unstructured task needs three things, and a review should ask for all three:

1. An owner — something that holds it and can cancel it.
2. A cancellation path — checked at every suspension point that matters.
3. A lifetime tied to something real — a view's presence, a window, a document.

A task started in a view's appearance callback and never cancelled outlives the
view. On macOS, where windows open and close freely, this leaks per window.

## Cancellation is cooperative

Check for cancellation in loops and before expensive work. Cancellation that is
never checked is cancellation that never happens:

```swift
for item in items {
    try Task.checkCancellation()
    await process(item)
}
```

Long synchronous work inside an asynchronous function blocks its executor. Break
it up or move it off the actor.

## Crossing into the interface

The boundary between background work and interface state is where most races
appear. Make the crossing explicit and single: compute off the main actor, then
hand a finished value across once.

Avoid a pattern where each incremental result hops to the main actor separately —
it multiplies the crossings and creates ordering hazards that are invisible until
the machine is loaded.

## Legacy asynchronous code

Wrap a callback API in a continuation once, at the boundary, and never resume a
continuation twice or zero times. With an unsafe continuation both are undefined
behavior; a checked continuation traps on double-resume and logs a leak — which
is why the checked form is the default choice. Where a callback can fire more
than once, a continuation is the wrong tool; use a stream.

## Verify against the toolchain in use

Swift's concurrency surface has moved every release: default isolation settings,
approachable-concurrency modes, and non-sending parameter behavior have all
changed. Do not assume a pattern from memory.

Confirm the language mode and the concurrency-related build settings the project
actually uses before writing or reviewing annotations, and check the release
notes for the pinned toolchain rather than reasoning from a previous version.
For Xcode 26.6, the setup baseline confirms only `SWIFT_STRICT_CONCURRENCY`;
default-isolation and approachable-concurrency build-setting names are absent,
so their behavior must not be claimed as pinned.

## Parallel tests

Swift Testing runs cases in parallel by default. Suites touching main-actor UI
state need `@MainActor`; proven shared-state conflicts may require `.serialized`.
Intermittent state bleed between cases is the failure signature, not harmless
flake. See the setup skill's testing API surface for the full trait list.
