# AppKit Liquid Glass API — macOS

**Apple ships no downloadable AppKit Liquid Glass sample code.** Verified five independent
ways: the AppKit framework page has no sample-code section; the AppKit render
index contains 50 sample nodes and none is glass-related; `NSGlassEffectView`,
`NSGlassEffectContainerView`, and `NSBackgroundExtensionView` each have zero
sample-code references; the Sample Code Library's 656 samples match `glass` or
`liquid` only on the four SwiftUI Landmarks pages; and the AppKit design sessions
link no sample.

The `Adopting Liquid Glass` guide contains four code listings in total, **all
SwiftUI or UIKit — not one AppKit listing.**

WWDC26 session 289, *Modernize your AppKit app*, does ship an Apple-authored
`cornerConfiguration` listing; WWDC25 session 310 and the adoption guide remain
prose/API-led for AppKit Liquid Glass. Verify every symbol against the SDK in use.

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

Worked pattern — a transport-control cluster whose glass surfaces merge when
close. Compiles with `swiftc -c -target arm64-apple-macos26.0` against the
macOS 26.5 SDK (Xcode 26.6):

```swift
import AppKit

@available(macOS 26.0, *)
final class TransportCluster: NSView {
    private let container = NSGlassEffectContainerView()

    init(buttons: [NSButton]) {
        super.init(frame: .zero)

        let glassViews: [NSGlassEffectView] = buttons.map { button in
            let glass = NSGlassEffectView()
            glass.style = .regular
            glass.cornerRadius = 18
            glass.tintColor = nil
            glass.contentView = button
            return glass
        }

        let row = NSStackView(views: glassViews)
        row.orientation = .horizontal
        row.spacing = 12

        container.spacing = 12   // equal spacing: distinct at rest, merge during proximity transitions
        container.contentView = row

        container.translatesAutoresizingMaskIntoConstraints = false
        addSubview(container)
        NSLayoutConstraint.activate([
            container.leadingAnchor.constraint(equalTo: leadingAnchor),
            container.trailingAnchor.constraint(equalTo: trailingAnchor),
            container.topAnchor.constraint(equalTo: topAnchor),
            container.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }
}
```

The numeric edit above was not re-probed. The glass views live inside the container's `contentView` hierarchy; the
container merges any descendant glass views that come within `spacing` points
of each other.

## `NSBackgroundExtensionView` — macOS 26.0

A view that extends content to fill its own bounds. It can be laid out to extend
outside the safe area — under the title bar, sidebar, or inspector. By default it
lays out its content to stay within the safe area and modifies the content along
the edges to fill the container.

- `contentView: NSView?`
- `automaticallyPlacesContentView: Bool`

Worked pattern — a hero image that extends under the transparent title bar
while its safe-area copy stays untouched. Compiles with
`swiftc -c -target arm64-apple-macos26.0` against the macOS 26.5 SDK
(Xcode 26.6):

```swift
import AppKit

@available(macOS 26.0, *)
func makeHeroPane(hero: NSImageView) -> NSView {
    let extensionView = NSBackgroundExtensionView()
    extensionView.contentView = hero
    extensionView.automaticallyPlacesContentView = true
    return extensionView
}
```

Pin the returned view to the window content's full bounds (not the safe area);
the extension view itself keeps `hero` inside the safe area and synthesizes the
extended edges.

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

Worked pattern — one prominent tinted item for the toolbar's primary action.
Compiles with `swiftc -c -target arm64-apple-macos26.0` against the macOS 26.5
SDK (Xcode 26.6):

```swift
import AppKit

extension NSToolbarItem.Identifier {
    static let publish = NSToolbarItem.Identifier("com.example.publish")
}

final class PublishToolbarDelegate: NSObject, NSToolbarDelegate {
    func toolbar(
        _ toolbar: NSToolbar,
        itemForItemIdentifier itemIdentifier: NSToolbarItem.Identifier,
        willBeInsertedIntoToolbar flag: Bool
    ) -> NSToolbarItem? {
        guard itemIdentifier == .publish else { return nil }
        let item = NSToolbarItem(itemIdentifier: itemIdentifier)
        item.label = "Publish"
        item.image = NSImage(
            systemSymbolName: "paperplane.fill",
            accessibilityDescription: "Publish"
        )
        if #available(macOS 26.0, *) {
            item.style = .prominent
            item.backgroundTintColor = .systemBlue
        }
        return item
    }

    func toolbarAllowedItemIdentifiers(_ toolbar: NSToolbar) -> [NSToolbarItem.Identifier] {
        [.publish, .flexibleSpace]
    }

    func toolbarDefaultItemIdentifiers(_ toolbar: NSToolbar) -> [NSToolbarItem.Identifier] {
        [.flexibleSpace, .publish]
    }
}
```

One prominent item per toolbar; prominence on every item is prominence on none.

## Scroll edge effects — macOS 26.1, not 26.0

This is the availability most often gotten wrong on AppKit.

- `NSScrollEdgeEffectStyle` (class) — macOS **26.1** — Swift members
  `.automatic`, `.hard`, `.soft` (spelling per Swift import convention; not
  re-probed after this edit).
- `NSTitlebarAccessoryViewController.preferredScrollEdgeEffectStyle` — macOS
  **26.1**.

Apple's quoted Objective-C snippet uses `softStyle`; the `…Style` suffix drops
on Swift import.

Worked pattern — a bottom title-bar accessory that forces a hard edge under a
pinned filter bar. Compiles with `swiftc -c -target arm64-apple-macos26.0`
against the macOS 26.5 SDK (Xcode 26.6); the 26.1-only symbols are guarded:

```swift
import AppKit

@available(macOS 26.1, *)
func installFilterBar(_ filterBar: NSView, in window: NSWindow) {
    let accessory = NSTitlebarAccessoryViewController()
    accessory.view = filterBar
    accessory.layoutAttribute = .bottom
    accessory.preferredScrollEdgeEffectStyle = .hard
    window.addTitlebarAccessoryViewController(accessory)
}
```

On a 26.0 deployment target the call site needs `if #available(macOS 26.1, *)`
and a fallback that installs the accessory without a style preference.

macOS 27 fixes: `NSScrollView` displays the system scroll edge effect when the
scroll view has no visible scrollers.

Session guidance for macOS 27: the automatic style resolves to a hard-edge effect
when there is free-floating text such as the window title in the title bar, and
sidebars extend to the window's edges.

## Split views, sidebars, inspectors

### System-supported bars

| Position | AppKit API |
|---|---|
| Window title bar | `NSTitlebarAccessoryViewController` |
| Split-item top/bottom | `NSSplitViewItemAccessoryViewController` via `topAlignedAccessoryViewControllers` / `bottomAlignedAccessoryViewControllers` |

- `NSSplitViewController`, `NSSplitViewItem.init(inspectorWithViewController:)`
  (macOS 11.0).
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

| Existing `NSVisualEffectView` surface | Migration decision |
|---|---|
| Sidebar | Replace custom material with system sidebar construction; do not add glass manually. |
| Toolbar accessory | Move into `NSTitlebarAccessoryViewController` or the split-item accessory APIs. |
| Floating functional panel | Use `NSGlassEffectView` only after the layer model justifies a custom transient surface. |
| Content | Keep the purpose-appropriate `NSVisualEffectView.Material`; content never becomes glass. |
