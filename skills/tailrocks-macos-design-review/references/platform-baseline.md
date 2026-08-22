# Platform baseline and availability

Availability errors are the dominant failure mode when an agent writes Liquid
Glass code. Apple's documentation site renders declarations from the newest
published SDK, so a symbol page that looks current may describe an API that does
not exist on the deployment target. Resolve the target first, then verify each
symbol.

## Establish the target before writing code

Record all four values and keep them in the project's agent instructions:

```
Minimum deployment target:
Shipping SDK / Xcode:
Forward-validation SDK / Xcode:
Behavior when a forward-only API is unavailable:
```

An availability guard is not optional decoration. Several glass symbols an agent
will reach for by analogy with iOS or with a newer SDK do not exist on
macOS 26 at all.

## State of the platform as verified 2026-08-21

| Fact | Value |
|---|---|
| Latest shipping macOS | 26.6.2 "Tahoe" — `gdmf.apple.com/v2/pmv`, 2026-08-21 |
| macOS 27 | Announced, named "Golden Gate", **not shipping** — beta, "coming this fall" |
| Shipping toolchain | Xcode 26.6 (17F113), Swift 6.3.3, macOS 26.5 SDK as reported by `xcrun --show-sdk-version` on 2026-08-21; requires host macOS 26.2+ |
| Beta toolchain | Xcode 27 beta 5, Swift 6.4, macOS 27 SDK; requires host macOS 26.4+; checked 2026-08-17 |
| Intel | Xcode 27 is Apple-silicon-only; `ARCHS_STANDARD` drops `x86_64` when the deployment target is 27.0 or later. Universal back-deploy to macOS 12 still supported. |

Re-verify these before relying on them. Release notes:
`developer.apple.com/documentation/macos-release-notes`,
`developer.apple.com/documentation/xcode-release-notes`.

Apple's macOS 26.6 release notes label the bundled SDK 26.6, while Xcode 26.6's
release notes and the installed toolchain report 26.5. Treat the local
`xcrun --show-sdk-version` result as the compile-lane authority; both release
note pages were rechecked 2026-08-11.

## Almost every 26.x glass symbol is 26.0 — three exceptions

Only three relevant items appear after 26.0 through 26.6:

| Symbol | Availability |
|---|---|
| `NSScrollEdgeEffectStyle` | macOS **26.1** — not 26.0 |
| `NSTitlebarAccessoryViewController.preferredScrollEdgeEffectStyle` | macOS **26.1** |
| SwiftUI `ToolbarContent.visibilityPriority(_:)` | macOS **26.1** at runtime, but declared only in the macOS **27 beta SDK** — it does not compile against SDK 26.5 (Xcode 26.6) |

macOS 26.4 fixed one glass defect: a non-opaque window hosting glass content now
updates the backdrop behind the glass while the window is inactive.

## The macOS 26.1 Liquid Glass appearance setting is not readable

System Settings ▸ Appearance ▸ Liquid Glass lets a person choose between the
default clear look and a tinted look that increases the opacity of the material.

**There is no API to read or branch on this setting.** No `glassLook`,
`liquidGlassAppearance`, or `prefersTintedGlass` symbol exists in SwiftUI,
AppKit, or UIKit. Apple's only statement is that standard components adapt
automatically.

`Glass.regular` and `Glass.clear` are author-side variants. They are not readers
of the user preference. Do not conflate the two — code that switches variant
based on an assumed system read is wrong by construction.

The practical consequence: a custom glass surface must be *visually verified*
under both settings, because it cannot be programmatically adapted.

## macOS 27 new API — guard these

Every symbol below is macOS 27 beta. Using any of them without an availability
guard breaks a macOS 26 deployment target.

| Symbol | Note |
|---|---|
| `NSGlassEffectView.effectIsInteractive` | **AppKit has no interactive glass at all on macOS 26** |
| `NSView.cornerConfiguration`, `NSViewCornerConfiguration`, `NSViewCornerRadius` | `.containerConcentric`, `.containerConcentric(_:)`, `.fixed(_:)`, and `.uniformCorners(radius:)`; macOS and Mac Catalyst 27 beta |
| `NSView.effectiveCornerRadii`, `invalidateCornerConfiguration()`, `viewDidChangeEffectiveCornerRadii()` | companions to the above |
| SwiftUI `GeometryProxy.concentricCornerRadii` / `concentricCornerRadii(in:)` | returns `RectangleCornerRadii?`, for custom drawing |
| `NSToolbarItemGroup.role`, `NSToolbarItemGroupRole` | |
| `NSSegmentedControl.role`, `NSSegmentedControlRole.tabs`, SwiftUI `TabsPickerStyle` | |
| `toolbarMinimizationBehavior(_:for:)` | |
| `toolbarMinimizationSafeAreaAdjustment(_:for:)` | |
| `NSMenuItem.preferredImageVisibility` | controls menu-image visibility |

SwiftUI `windowResizeAnchor(_:)` anchors content-driven window resizing and is
**macOS 26.0, not 27** — DocC declares 26.0 and it compiles against the 26.5
SDK (rechecked 2026-08-17). Use `.topLeading` to avoid pixel cracking during
animated macOS resizes. It appears in the 27 column only in older notes.

`tabViewBottomAccessory(content:)` was rechecked in DocC on 2026-08-17. Its
documented behavior is iPhone tab-bar placement, so it is not a macOS bar
construction and remains blocklisted in the router.

## macOS 27 rebuild changes

- A `TabView` in an inspector automatically uses the `.tabs` picker appearance
  when built with the 27 SDK (170678002).
- Apps linked with the 27 SDK hide symbol and non-symbol menu images by default;
  use `NSMenuItem.preferredImageVisibility` where HIG guidance requires one.

## macOS 27 deprecations

- `TextInputBorderShape` and `textInputBorderShape(_:)` replace the
  soft-deprecated `.squareBorder` / `.roundedBorder`; use `.bordered`.

Two macOS 27 changes affect apps **linked against macOS 26**, so audit them even
if the deployment target does not move:

- `NSTitlebarAccessoryViewController` is now allowed to draw outside its bounds
  by default, supporting shadows and interactive glass effects. Audit any code
  that assumed clipping.
- `NSMenu` hides all menu item symbol images by default; menu bar and context
  menus present a reduced set of images. In SwiftUI, opt back in with
  `labelStyle(_:)` and `.titleAndIcon`.

macOS 27 design changes that arrive without recompiling: more uniform refraction
and improved contrast, uniform toolbars, edge-to-edge sidebars, a tighter and
uniform window corner radius, and a settings slider ranging from ultraclear to
fully tinted. There is no read API for the slider in the beta.

## The compatibility escape hatch expires

`UIDesignRequiresCompatibility` (Boolean; the `UI` prefix is correct on macOS —
no `NS` variant exists) opts an app out of the new design. Availability
iOS/iPadOS/macOS/tvOS 26.0.

**The system ignores this key when the app is built against the 27 SDK or
later.** Apple has stated it is removing support for opting into the old design.
Treat the key as a short-lived migration aid with a hard deadline, never as a
strategy.

## Symbols that do not exist on macOS

Reaching for these is the most common cross-platform hallucination:

| Symbol | Where it actually lives |
|---|---|
| `glassBackgroundEffect(...)` | **visionOS only** |
| `toolbarOverflowMenu(content:)`, `ToolbarOverflowMenu` | iOS/iPadOS/Catalyst/visionOS 27 — **no macOS availability** |
| `ToolbarItemPlacement.topBarPinnedTrailing` | same — no macOS |
| `UIView.cornerConfiguration`, `UICornerRadius.containerConcentric` | UIKit, iOS 26. AppKit equivalent is macOS 27. |
| `UIButton.Configuration.prominentGlass()`, `.clearGlass()`, `.prominentClearGlass()` | UIKit. AppKit has exactly one glass bezel style. |
| Dynamic Type | macOS does not support it. Do not design bars around text-size scaling. |

`tabBarMinimizeBehavior(_:)` declares macOS 26.0 availability but the guidance
frames it as an iOS behavior; treat it as iOS-only in practice.

## Version policy

Target the latest stable macOS SDK and Xcode available at execution time. Adopt a
beta SDK only as a forward-validation lane with the shipping lane unchanged, and
never let a forward-only symbol reach the shipping target without a guard.

When a required behavior exists only in a beta SDK, report that fact and require
explicit approval before moving the deployment target.
