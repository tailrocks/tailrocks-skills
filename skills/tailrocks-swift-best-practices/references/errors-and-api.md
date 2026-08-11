# Errors, API surface, availability

## Typed failure

Model failure as a value with a case per distinguishable outcome. A stringly
typed error can be logged and nothing else — it cannot be switched on, recovered
from, or tested.

```swift
enum ConnectionFailure: Error {
    case unreachable(host: String)
    case authenticationRejected
    case timedOut(after: Duration)
    case cancelled
}
```

The test for a good error type: can a caller decide what to do from the case
alone, without parsing a message? If not, the type is under-specified.

### Typed throws

Use `throws(E)` for a closed failure set at a module boundary where every caller
benefits from exhaustive recovery. A public escaping boundary may still use
`any Error` when failures are intentionally open-ended; generic and `rethrows`
APIs should preserve the caller's error type rather than erase it accidentally.

## User-facing failure carries recovery

An error surfaced to a person is not finished until it answers what happened,
whether anything was lost, and what to do next. An alert that says only that an
operation failed is a dead end.

Conform to `LocalizedError` and implement `errorDescription`, `failureReason`,
and `recoverySuggestion`. Tie recovery to an action a person can take. Where the
operation can be retried safely, offer the retry rather than describing it.

Destructive operations need confirmation, undo, or recovery — at least one. This
is a hard failure in design review, so it is cheaper to build in.

## Trapping

Reserve trapping for genuine programmer error — a violated invariant that means
the program's assumptions are already wrong. When trapping, say which invariant:

```swift
preconditionFailure("Selection referenced record \(id), which is not in the store")
```

Never trap on input, on the network, on the file system, or on anything a person
can cause. Force operations remain errors in application code. The setup skill's
nested config disables them only inside test targets where failure is the
assertion, keeping the strict lint gate warning-free.

## API surface

- The smallest surface that expresses the need. Every public symbol is a
  commitment, and internal is the default.
- Name for the call site. A method reads as a phrase at the point of use.
- Make illegal states unrepresentable before validating against them. A type that
  cannot hold a contradiction needs no check.
- Prefer values to references wherever identity is not part of the meaning.
- Do not add a parameter for a case that does not exist yet. Speculative
  generality costs more than the change it was meant to avoid.

Document the *why*. The signature already states the what.

## Availability

Every symbol newer than the minimum deployment target needs a guard, and the
fallback path needs a decision:

```swift
if #available(macOS 26.1, *) {
    accessory.preferredScrollEdgeEffectStyle = .hard
} else {
    // macOS 26.0 has no scroll-edge style preference; ship the default
    // automatic effect. Remove this branch when the minimum target
    // reaches 26.1.
}
```

Rules:

- A guard whose fallback is a trap is not a guard. Decide the degraded behavior.
- Mark the fallback with a removal condition, so it disappears when the minimum
  target moves instead of accumulating.
- Do not reason about availability from documentation alone. Documentation
  renders declarations from the newest published SDK, so verify against the SDK
  in use.

The cross-platform hallucinations that produce build failures on macOS are
catalogued in the Liquid Glass skill; the common shape is a symbol that exists on
another Apple platform or in a newer SDK and is reached for by analogy.

## Logging

Use the unified logging system with a subsystem and per-area categories. Choose
privacy annotations deliberately — anything derived from user content is private
by default and only made public with a reason.

Log at the boundary where a failure becomes interesting, not at every frame of
the call stack. A log line per layer turns a single failure into a wall of text
and hides the one line that mattered.

## Dependencies

Every dependency is a commitment to its maintenance, license, and platform
support. For a macOS app specifically, check that a package actually supports
macOS rather than assuming from an iOS-focused README, and check the license
before vendoring.

Pin exact versions and commit the resolved state so a build is reproducible.
