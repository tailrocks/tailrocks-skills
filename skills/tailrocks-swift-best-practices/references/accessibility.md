# Accessibility as a code obligation

Accessibility is part of the implementation. Added afterwards it is a retrofit
that fights the structure; designed in it is nearly free.

It is also the only part of the interface with an automated gate —
`performAccessibilityAudit` — so it is the one place where a machine can tell you
that you are wrong before a person does.

## Semantics on every interactive element

- **Label — `.accessibilityLabel(_:)`.** What the element is. Required on every icon-only control regardless
  of what is shown in the interface — this is Apple's rule, not a preference.
- **Value — `.accessibilityValue(_:)`.** What it currently reads or holds.
- **Traits — `.accessibilityAddTraits(_:)`.** What kind of thing it is. A tappable rectangle with no
  role is invisible to assistive technology.
- **Custom actions — `.accessibilityAction(named:_:)`.** Where a gesture or hover reveals functionality, expose it
  as an action rather than leaving it unreachable.
- **Identifier — `.accessibilityIdentifier(_:)`.** Stable, and present on everything a verification harness must
  drive. An element with no identifier cannot be driven at all.

Group related elements with `.accessibilityElement(children:)`; hide decoration
with `.accessibilityHidden(_:)`. SwiftUI authors traits; AppKit roles come from
`NSAccessibilityProtocol` role properties.

## Focus and keyboard

- Every pointer-reachable action has a keyboard path.
- Every toolbar action has a menu-bar command. On macOS this is both an
  accessibility obligation and a platform convention.
- Focus order follows reading order. Verify by walking focus and recording the
  visited identifiers — reading the layout is not verification.
- The focus ring must remain visible over every background the element can sit
  on, including a translucent one.
- A keyboard-navigation dead end is a hard failure.

## System settings the code must honor

| Setting | Read | Obligation |
|---|---|---|
| Reduce Transparency | `accessibilityReduceTransparency`, `NSWorkspace.accessibilityDisplayShouldReduceTransparency` | Custom translucent surfaces substitute an opaque background. System components do this automatically; hand-rolled ones do not. |
| Increase Contrast | `colorSchemeContrast`, `NSWorkspace.accessibilityDisplayShouldIncreaseContrast` | Meet the contrast minimums; borders appear where they were implied. |
| Reduce Motion | `accessibilityReduceMotion`, `NSWorkspace.accessibilityDisplayShouldReduceMotion` | Replace positional and scaling transitions with fades; reduce automatic and repetitive animation. |
| Differentiate Without Color | `accessibilityDifferentiateWithoutColor`, `NSWorkspace.shared.accessibilityDisplayShouldDifferentiateWithoutColor` | No state communicated by color alone. |

The failure mode for the first two is specific and easy to miss: a hand-rolled
translucent panel stays translucent while every system surface around it goes
opaque. It is invisible in a default screenshot and immediately obvious to
someone who has the setting on.

macOS has **no Dynamic Type**. Do not write scaling logic for it.

## Color

Semantic system colors, with light and dark variants and an increased-contrast
variant for each custom color. Avoid hard-coding system color values — they
change between releases, and a hard-coded copy stops matching the system.

Provide both light and dark colors even in a single-appearance app, because the
material adapts regardless.

## Localization as an accessibility concern

Long translated strings, right-to-left layout, and locale-sensitive numbers and
dates all change what a screen reader announces and whether a control still fits.
A toolbar that fits in English and overflows elsewhere was verified against one
locale.

## Verification

Run the audit in a UI test for contrast, element detection, hit region, and
sufficient element description. There is no dynamic-type audit to exclude on
macOS: `XCUIAccessibilityAuditType.dynamicType` has no macOS availability, so
auditing `.all` never runs it.

The audit reads the real view hierarchy, which makes it far stronger than
inferring contrast from captured pixels. It cannot judge focus order, keyboard
paths, or whether a label is *useful* rather than merely present — those need a
person, or a driven walk that records what it visited.
