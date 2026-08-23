# Driving and auditing the interface

## The fast loop: press through the accessibility tree

SwiftUI's `.accessibilityIdentifier("…")` surfaces directly as the accessibility
identifier on the element. An agent can find an element by identifier and send it
a press action, then read state back out of the same tree — no test target, no
rebuild, no test host.

Install and compile the repository macOS visual-QA AX driver:
`ax-drive <exact-pid> find|press|read <AXIdentifier>`. AppleScript `System
Events` cannot match `AXIdentifier`; this purpose-built AXUIElement tool can.

This is a far tighter cycle than a full UI-test run, and it is the correct default
for iterating on a screen.

Requirements:

- The terminal application holds the **Accessibility** permission.
- The application is running with a real window (see the atomic loop).
- **The window is on a Space the automation can reach.** On a machine where a
  person is working in another Space, the accessibility tree reports the app
  foreground with zero windows and every wait and click fails. For a
  verification-target app, the reliable mitigation is app-side: insert
  `.canJoinAllSpaces` into the window's `collectionBehavior` when a
  verification flag is set, so the window is present on whichever Space the
  automation session sees.
- The pixel path and the automation path fail independently — capture by window
  ID can succeed while the window list reports zero windows. Do not treat a
  successful capture as proof that driving will work, or the reverse.

Give every element an accessibility identifier during development. An element
with no identifier is not drivable, and adding one later is a code change inside
the change you were trying to verify.

## The slow loop: UI tests

Use a UI test when the verification needs real application lifecycle management —
launch arguments, termination, state restoration, multiple windows.

**UI automation still requires the older test framework.** The newer testing
framework replaces the older one for unit tests only; it does not cover UI
automation or performance tests.

Filtering differs between the two and the difference is dangerous:

- Package-level filtering takes a regular expression.
- Build-level test selection takes an **exact identifier**, and functions written
  in the newer framework need trailing parentheses.

```sh
xcodebuild test -scheme App -destination 'platform=macOS' \
  "-only-testing:AppTests/MathSuite/addsNumbers()"
```

Omit the parentheses and the selector matches nothing, reports zero tests, and
still exits reporting success. A typo'd filter is a green run that tested
nothing. Assert on the executed-test count, not on the exit status alone.

## The only automated design gate

```swift
let owned = [app] + app.descendants(matching: .any)
    .allElementsBoundByAccessibilityElement
try app.performAccessibilityAudit(for: [
    .contrast,
    .elementDetection,
    .hitRegion,
    .sufficientElementDescription,
]) { issue in
    // The audit walks the whole session, including the system menu bar and
    // screen containers the app cannot label; unscoped, it fails on any app.
    guard let element = issue.element else { return true }
    return !owned.contains(element)
}
```

macOS 14+. Audit types available on macOS: action, contrast, element detection,
hit region, parent-child, sufficient element description. The dynamic-type,
text-clipped, and trait audits are iOS-family only — they do not exist in the
macOS SDK, so auditing `.all` never runs them (and macOS has no Dynamic Type
anyway).

This reads the real view hierarchy, which makes it far stronger than inferring
contrast from pixels.

It runs through the test action, so it needs a graphical session like everything
else here.
The explicit typed harness installer copies the repository macOS visual-QA
`AuditTests.swift` when the project has no UI-test target. Verification never
infers installer authority.

**No accessibility inspector command-line tool exists. No HIG linter exists. No
Liquid Glass linter exists** — not from Apple, not from anyone. This audit plus a
human reviewer is the entire automated surface. Do not report a design as
"passing lint"; there is nothing to lint against.

## What to drive, per screen

Behavior claimed in a review must be behavior driven, not behavior assumed:

| Claim | Drive it by |
|---|---|
| Primary action works | press the toolbar item's identifier, read resulting state |
| Keyboard workflow works | send the key equivalent, verify focus and result |
| Focus order is correct | walk focus and record the visited identifiers in order |
| Selection is visible | select, capture, inspect |
| Context menu exists | invoke it, enumerate items |
| Destructive action is recoverable | perform, undo, verify restoration |
| Inspector collapses at minimum width | resize, capture, verify no clipping |
| Hover state renders | move the pointer, capture — glass button hover outside a toolbar is broken on macOS 26 and fixed in 27, so verify rather than assume |

## Do not trigger modal system dialogs

An alert, confirm, or prompt that blocks the main event loop stops the automation
path entirely and cannot be dismissed programmatically from the same session.
Prefer logging over dialogs during a verification run, and warn before driving a
control known to raise one.
