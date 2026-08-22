# React and Async

Load this reference when changing React components, hooks, effects, events,
transitions, or asynchronous work.

## React ownership

- Keep render pure: derive renderable data during render instead of synchronizing
  duplicated state in an effect.
- Use state for information that changes rendering; use refs for mutable values
  that do not.
- Call hooks unconditionally at component or custom-hook top level.
- Let events own user-triggered work. Let effects synchronize with external
  systems and return cleanup that exactly reverses setup.
- Keep effect dependencies truthful. Stabilize a value only when identity is part
  of the contract; moving code or data to its real owner beats memo cargo cults.
- Use stable domain keys for lists. An array index is valid only for a truly
  static sequence with no insertion, deletion, sorting, or stateful children.
- Represent loading, empty, success, and recoverable failure explicitly. Error
  boundaries own unexpected render failures, not ordinary domain errors.

## Async ownership

Every promise has an owner: awaited, returned, collected, or deliberately
detached through a named best-effort boundary that observes failure.

Effects and loaders that can outlive their input use cancellation or stale-result
suppression. Prefer `AbortSignal` when the dependency supports it. Cleanup closes
subscriptions, timers, observers, sockets, and request ownership.

Avoid sequential awaits when operations are independent; start them together and
join them. Preserve ordering when a dependency or side effect requires it.

At server/client boundaries, serialize only validated data and translate
dependency exceptions before they cross into UI contracts. Never expose secrets
or server-only capabilities in client bundles.

## Completion check

Render stays pure, each effect owns one external synchronization with complete
cleanup, dependencies are truthful, list identity is stable, every promise and
request lifetime has an owner, and expected UI states are exhaustive.
