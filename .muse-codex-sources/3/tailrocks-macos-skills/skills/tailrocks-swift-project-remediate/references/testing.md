# Tests and gates

## Two frameworks, split by purpose

The newer testing framework replaces the older one **for unit tests only**. UI
automation and performance tests still require the older framework. Both run
under the same build and package test commands.

Practical split:

- Unit and integration tests — newer framework, suites and traits.
- UI automation, accessibility audits, launch and lifecycle tests — older
  framework.

## Swift Testing API surface

Use `@Test` and `@Suite`, `#expect` for ordinary assertions, and `#require` when
later assertions require an unwrapped value. Known defects use `withKnownIssue`;
traits include `.disabled`, `.tags`, `.timeLimit`, and `.serialized`. Tests run
in parallel by default; use `@MainActor` for main-isolated UI state and
`.serialized` only for proven shared-state conflicts. In an Xcode selector such
as `AppTests/MathSuite/addsNumbers()`, `MathSuite` is the suite type name.

## The silent-failure trap

Filtering differs between the two entry points, and the difference produces a
green run that tested nothing:

- Package-level filtering takes a **regular expression**.
- Build-level test selection takes an **exact identifier**, and test functions
  written in the newer framework need **trailing parentheses**.

```sh
xcodebuild test -project App.xcodeproj -scheme App -destination 'platform=macOS' \
  "-only-testing:AppTests/MathSuite/addsNumbers()"
```

Omit the parentheses and the selector matches nothing, the run reports zero
tests, and it **still exits reporting success**.

Defend against it: assert on the executed-test count, not on the exit status
alone. A gate that cannot distinguish "all tests passed" from "no tests ran" is
not a gate.

## Invocation

```sh
set -o pipefail
xcodebuild test -project App.xcodeproj -scheme App \
  -destination 'platform=macOS' \
  -derivedDataPath "$HOME/Library/Developer/AppBuild" | xcbeautify
```

`set -o pipefail` is mandatory. Without it the pipeline reports the formatter's
status and every test run appears to pass.

The derived data path must be outside a temporary directory — an application
bundle launched from `/tmp` loses its windows, which breaks UI tests and every
visual verification downstream.

## The accessibility audit

The only automated design gate that exists on this platform, and it is
macOS-native:

```swift
func testAccessibility() throws {
    let app = XCUIApplication()
    app.launch()
    try app.performAccessibilityAudit(for: [
        .contrast,
        .elementDetection,
        .hitRegion,
        .sufficientElementDescription,
    ]) { issue in
        // The macOS audit walks the whole session, including the system
        // menu bar and screen containers the app cannot label; a bare audit
        // therefore fails on any app. Scope it to app-owned elements —
        // every app-owned element carries an accessibility identifier.
        guard let element = issue.element else { return true }
        return element.identifier.isEmpty
    }
}
```

macOS 14+. There is no dynamic-type audit to exclude on macOS —
`XCUIAccessibilityAuditType.dynamicType` has no macOS availability, and macOS
has no Dynamic Type.

This reads the real view hierarchy, which makes it substantially stronger than
inferring contrast from captured pixels. It runs through the test action, so it
needs an interactive graphical session.

## Accessibility identifiers are a testing requirement

Every interactive element gets an accessibility identifier during development.
SwiftUI's identifier surfaces directly as the accessibility identifier, which is
what makes an element drivable from outside a test target.

An element with no identifier cannot be driven, and adding one later is a code
change inside the change being verified.

## Snapshot tests

Content-layer views only. **Liquid Glass surfaces snapshot fully transparent**
from a detached view, so a snapshot suite covering glass chrome asserts on blank
rectangles while reporting green.

Wrap in a hosting controller — there is no direct SwiftUI snapshot strategy on
macOS — render at 1x into a bitmap representation without a window, and keep glass
chrome out of the suite entirely. Verify chrome by capturing the running
application instead.

## Gate tiers

| Tier | Cadence | Contents |
|---|---|---|
| Pull request | every change | generate, strict format check, strict lint, build, unit tests |
| Merge | every merge to the default branch | the above plus `mise run test:ui` and the accessibility audit |
| Scheduled | nightly or weekly | dead-code scan, forward-validation SDK build, visual state matrix, performance profile |

Continuous integration cannot run the interactive parts without a graphical
session and the Screen Recording, Accessibility, and Automation permissions.
Those are one-time graphical grants that cannot be automated. Either provision
runners accordingly, or state plainly that visual verification is a
development-machine capability — do not let the absence of the check read as a
pass.
