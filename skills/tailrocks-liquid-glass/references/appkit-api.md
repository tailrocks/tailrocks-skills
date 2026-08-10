# AppKit Liquid Glass API — macOS

**Apple ships no AppKit Liquid Glass sample code.** Verified five independent
ways: the AppKit framework page has no sample-code section; the AppKit render
index contains 50 sample nodes and none is glass-related; `NSGlassEffectView`,
`NSGlassEffectContainerView`, and `NSBackgroundExtensionView` each have zero
sample-code references; the Sample Code Library's 656 samples match `glass` or
`liquid` only on the four SwiftUI Landmarks pages; and the AppKit design sessions
link no sample.

The `Adopting Liquid Glass` guide contains four code listings in total, **all
SwiftUI or UIKit — not one AppKit listing.**

For AppKit there is prose and API reference only. Verify every symbol against the
SDK in use rather than transposing a SwiftUI pattern.

## `NSGlassEffectView` — macOS 26.0

A view that embeds its content view in a dynamic glass effect.

| Member | Declaration | Availability |
|---|---|---|
| `contentView` | `var contentView: NSView?` | macOS 26.0 |
| `cornerRadius` | `var cornerRadius: CGFloat` | macOS 26.0 |
| `style` | `var style: NSGlassEffectView.Style` | macOS 26.0 |
| `tintColor` | `@NSCopying var tintColor: NSColor?` | macOS 26.0 |
| `effectIsInteractive` | `var effectIsInteractive: Bool` | **macOS 27.0 beta** |

`NSGlassEffectView.Style` — macOS 26.0 — `.regular`, `.clear`.

```swift
let glass = NSGlassEffectView()
glass.style = .regular
glass.cornerRadius = 16
glass.tintColor = nil          // nil is untinted; tint only for emphasis
glass.contentView = myControlStack
```

Content goes **inside** the glass view via `contentView`. Placing the glass view
behind content as a sibling is wrong — it will not composite as a glass surface.

`cornerRadius` is a raw `CGFloat`. **AppKit on macOS 26 has no concentric-corner
API at all.** `NSView.cornerConfiguration` and
`NSViewCornerRadius.containerConcentric` are macOS 27 beta. On macOS 26, either
host the surface in SwiftUI to get `ConcentricRectangle`, or derive the radius
explicitly and document that it must be revisited when the window corner radius
changes — which it did in 26 and does again in 27.

**AppKit has no interactive glass on macOS 26.** There is no equivalent of
SwiftUI's `Glass.interactive()`.

## `NSGlassEffectContainerView` — macOS 26.0

A view that efficiently merges descendant glass effect views when they are within
a specified proximity of each other.

Apple's own note is the only place the mechanism is named:

> Using a glass effect container view can improve performance by reducing the
> number of passes required to render similar glass effect views.

| Member | Availability |
|---|---|
| `contentView: NSView?` | macOS 26.0 |
| `spacing: CGFloat` — the proximity at which merging begins | macOS 26.0 |

```swift
let container = NSGlassEffectContainerView()
container.spacing = 20
container.contentView = stackOfGlassEffectViews   // NSGlassEffectViews live inside
```

## `NSBackgroundExtensionView` — macOS 26.0

A view that extends content to fill its own bounds. It can be laid out to extend
outside the safe area — under the title bar, sidebar, or inspector. By default it
lays out its content to stay within the safe area and modifies the content along
the edges to fill the container.

- `contentView: NSView?`
- `automaticallyPlacesContentView: Bool`

## Buttons and control metrics

- `NSButton.BezelStyle.glass` — macOS 26.0. A bezel style with a glass effect.
- **There is no `prominentGlass` or `clearGlass` bezel style on AppKit.** UIKit
  has four glass button configurations; AppKit has exactly one. Prominence on an
  AppKit toolbar is expressed with `NSToolbarItem.Style.prominent` plus
  `NSToolbarItem.backgroundTintColor`.
- `NSControl.ControlSize.extraLarge` — macOS 26.0.
- `NSView.prefersCompactControlSizeMetrics` — macOS 26.0. Controls in the view
  and its descendants are sized with compact metrics compatible with macOS 15.0
  and earlier. This is the escape hatch for layouts broken by the 26 control
  metric growth.

## Toolbars

- `NSToolbarItem.Style.prominent` and `NSToolbarItem.backgroundTintColor` —
  macOS 26.0. Tint toolbar items to make them stand apart from other items.
- Spacers and grouping: `NSToolbarItem.Identifier.space` (fixed),
  `.flexibleSpace`, `NSToolbarItemGroup`.
- `NSToolbarItem.isHidden` — hide the item, not its view.
- macOS 27 beta: `NSToolbarItemGroup.role`, `NSToolbarItemGroupRole`,
  `NSSegmentedControl.role`, `NSSegmentedControlRole.tabs`.

## Scroll edge effects — macOS 26.1, not 26.0

This is the availability most often gotten wrong on AppKit.

- `NSScrollEdgeEffectStyle` (class) — macOS **26.1** — `.automatic`, `.hard`,
  `.soft`.
- `NSTitlebarAccessoryViewController.preferredScrollEdgeEffectStyle` — macOS
  **26.1**.

Apple's own snippet assigns `NSScrollEdgeEffectStyle.softStyle` to
`preferredScrollEdgeEffectStyle`.

macOS 27 fixes: `NSScrollView` displays the system scroll edge effect when the
scroll view has no visible scrollers.

Session guidance for macOS 27: the automatic style resolves to a hard-edge effect
when there is free-floating text such as the window title in the title bar, and
sidebars extend to the window's edges.

## Split views, sidebars, inspectors

- `NSSplitViewController`, `NSSplitViewItem.init(inspectorWithViewController:)`
  (macOS 14).
- macOS 26.0 additions: `NSSplitViewItemAccessoryViewController`,
  `NSSplitViewItem.topAlignedAccessoryViewControllers` and
  `.bottomAlignedAccessoryViewControllers`.

Remove custom backgrounds from `NSToolbar` and `NSSplitView`. Apple names both
explicitly as elements whose custom backgrounds interfere with Liquid Glass and
with the scroll edge effect.

## Windows

- **No new `NSWindow` corner-radius or glass API in macOS 26.** Rounder corners
  are system-applied. Do not replicate the system appearance.
- macOS 27 applies a uniform, tighter corner radius to every window.
- macOS 27 behavior change that affects apps **linked against macOS 26**:
  `NSTitlebarAccessoryViewController` is allowed to draw outside its bounds by
  default, supporting shadows and interactive glass effects. Audit any clipping
  assumption.
- `NSApplication.presentationOptions.disableScreenCornerInteractions` — macOS 27.

## Appearance and accessibility reads

```swift
NSWorkspace.shared.accessibilityDisplayShouldReduceTransparency
NSWorkspace.shared.accessibilityDisplayShouldIncreaseContrast
NSWorkspace.shared.accessibilityDisplayShouldReduceMotion
NSWorkspace.shared.accessibilityDisplayShouldDifferentiateWithoutColor
```

High-contrast appearances: `NSAppearance.Name.accessibilityHighContrastAqua`,
`…DarkAqua`, `…VibrantLight`, `…VibrantDark`.

**No `NSAppearance.Name` and no `NSWorkspace` flag exposes the macOS 26.1
Clear/Tinted Liquid Glass choice.** It must be verified visually.

## Content-layer materials

Content-layer surfaces use `NSVisualEffectView.Material`, not glass. macOS
provides several standard materials with designated purposes and vibrant versions
of all of them. Two decisions are yours:

- when to allow vibrancy in custom views and controls, and
- which `NSVisualEffectView.BlendingMode` to use — behind-window or
  within-window.

Do not leave an `NSVisualEffectView` inside a popover's content view; the
adoption guide says to remove those custom background views.
