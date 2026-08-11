# SwiftUI Liquid Glass API — macOS

Every availability string below is Apple's own. Verify against the SDK in use
before quoting a signature in generated code: Apple renders declarations from the
newest published SDK, and Xcode 27 introduced `@ContentBuilder` as the unified
replacement for type-specific builders — where a signature shows
`@ContentBuilder`, the macOS 26.0 SDK almost certainly declared `@ViewBuilder`.
The two are source-compatible in practice.

## Core effect

```
func glassEffect(_ glass: Glass = .regular,
                 in shape: some Shape = DefaultGlassEffectShape()) -> some View
```

macOS 26.0. The system renders a shape anchored behind the view with the Liquid
Glass material, then applies the foreground effects of Liquid Glass over the
view. The material fills the entire frame *including padding*.

There is **no** `glassEffect(_:in:isEnabled:)` overload.

```swift
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect()                                   // regular, in a Capsule

Text("Hello, World!").font(.title).padding()
    .glassEffect(in: .rect(cornerRadius: 16.0))

Text("Hello, World!").font(.title).padding()
    .glassEffect(.regular.tint(.orange).interactive())
```

**Modifier order is load-bearing.** Apple: "Apply the `glassEffect(_:in:)`
modifier after other modifiers that affect the appearance of the view." The
modifier captures the content beneath it to hand to the container; appearance
modifiers applied after it are not part of the captured content.

## `Glass` configuration

`struct Glass` — macOS 26.0.

| Member | Declaration | Availability |
|---|---|---|
| `Glass.regular` | `static var regular: Glass` | macOS 26.0 |
| `Glass.clear` | `static var clear: Glass` | macOS 26.0 |
| `Glass.identity` | `static var identity: Glass` — content remains unaffected, as if no glass effect were applied | macOS 26.0 |
| `.tint(_:)` | `func tint(_ color: Color?) -> Glass` | macOS 26.0 |
| `.interactive(_:)` | `func interactive(_ isEnabled: Bool = true) -> Glass` | macOS 26.0 |

`DefaultGlassEffectShape` — the default shape applied by glass effects, a
capsule — macOS 26.0.

`Glass.identity` is the correct substitution point when neutralizing an effect
under an accessibility setting.

## Containers and morphing

```
struct GlassEffectContainer<Content: View>
init(spacing: CGFloat? = nil, @ContentBuilder content: () -> Content)
```

macOS 26.0.

```
func glassEffectID(_ id: (some Hashable & Sendable)?, in namespace: Namespace.ID) -> some View
func glassEffectUnion(id: (some Hashable & Sendable)?, namespace: Namespace.ID) -> some View
func glassEffectTransition(_ transition: GlassEffectTransition) -> some View
```

All macOS 26.0. The transition modifier is `glassEffectTransition(_:)` — there is
**no** `isEnabled:` parameter.

`GlassEffectTransition` — macOS 26.0 — `.identity`, `.matchedGeometry` (the
default for effects inside container spacing), `.materialize`.

Apple's rules:

> Use `GlassEffectContainer` when applying Liquid Glass effects on multiple views
> to achieve the best rendering performance.

> The larger the spacing value on the container, the sooner the Liquid Glass
> effects behind views blend together and merge the shapes during a transition. A
> spacing value on the container that's larger than the spacing of an interior
> `HStack`, `VStack`, or other layout container causes Liquid Glass effects to
> blend together at rest because the views are too close to each other.

> Use the `materialize` transition for effects you want to add or remove that are
> farther from each other than the container's assigned spacing. To provide
> people with a consistent experience, use `matchedGeometry` and `materialize`
> transitions across your apps.

> The `glassEffectID(_:in:)` and `glassEffectTransition(_:)` modifiers only
> affect their content during view hierarchy transitions or animations.

`glassEffectUnion` semantics: all Liquid Glass effects with the same shape and
the same variant are combined into a single shape.

```swift
@State private var isExpanded = false
@Namespace private var namespace

GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "scribble.variable")
            .frame(width: 80, height: 80).font(.system(size: 36))
            .glassEffect()
            .glassEffectID("pencil", in: namespace)

        if isExpanded {
            Image(systemName: "eraser.fill")
                .frame(width: 80, height: 80).font(.system(size: 36))
                .glassEffect()
                .glassEffectID("eraser", in: namespace)
        }
    }
}
```

## Button styles

| API | Declaration | Availability |
|---|---|---|
| `.glass` | `static var glass: GlassButtonStyle` | macOS 26.0 |
| `.glassProminent` | `static var glassProminent: GlassProminentButtonStyle` | macOS 26.0 |
| `.glass(_:)` | `static func glass(_ glass: Glass) -> Self` | macOS 26.0 |

Known macOS 26 defect, fixed in 27: `.glass` and `.glassProminent` buttons do not
display a hover state when used outside a toolbar. Verify hover explicitly rather
than assuming it works.

## Scroll edge effects

```
func scrollEdgeEffectStyle(_ style: ScrollEdgeEffectStyle?, for edges: Edge.Set) -> some View
func scrollEdgeEffectHidden(_ hidden: Bool = true, for edges: Edge.Set = .all) -> some View
struct ScrollEdgeEffectStyle   // .automatic (default) | .hard | .soft
```

All macOS 26.0. `.hard` provides a linear, nearly opaque boundary; `.soft`
provides a subtle, blurred boundary. Prefer `.automatic`.

```swift
ScrollView { LazyVStack { ForEach(data) { RowView($0) } } }
    .scrollEdgeEffectStyle(.hard, for: .all)
```

## Background extension

```
func backgroundExtensionEffect() -> some View
func backgroundExtensionEffect(isEnabled: Bool) -> some View
```

macOS 26.0. The view is duplicated into mirrored copies placed around it on any
edge with available safe area, then blurred.

> Apply this modifier with discretion. This should often be used with only a
> single instance of background content with consideration of visual clarity
> and performance.

The modifier clips the view to prevent copies overlapping. Two placement rules
from Apple's own sample:

- The view must touch the leading and trailing container edges. Do not pad the
  enclosing scroll view or stack.
- Apply `.backgroundExtensionEffect()` **before** `.overlay`, or the overlay
  content slides under the sidebar. Apple calls this out specifically for macOS.

To inset horizontally scrolling content from a sidebar, use a leading
`Spacer().frame(width:)` *inside* the stack — never `.padding()` on the scroll
view, which defeats the auto-adjustment that lets content scroll underneath.

## Custom bars

```
func safeAreaBar(edge: HorizontalEdge, alignment: VerticalAlignment = .center,
                 spacing: CGFloat? = nil,
                 @ContentBuilder content: () -> some View) -> some View
func safeAreaBar(edge: VerticalEdge, alignment: HorizontalAlignment = .center,
                 spacing: CGFloat? = nil,
                 @ContentBuilder content: () -> some View) -> some View
```

macOS 26.0, two overloads: `HorizontalEdge` for a bar beside the view,
`VerticalEdge` for a bar above or below it. Makes space for the content view by
insetting the modified view, adjusting the safe area **and scroll edge
effects** to match.

This is the correct way to build a custom bar that participates in the glass
layer. An `overlay` carrying `.glassEffect` adjusts neither the safe area nor the
scroll edge effect and is the wrong construction.

## Toolbars

| API | Declaration | Availability |
|---|---|---|
| `ToolbarSpacer` | `init(_ sizing: SpacerSizing = .flexible, placement: ToolbarItemPlacement = .automatic)` | macOS 26.0 (iOS/iPadOS/Catalyst 26.0; **not** tvOS/watchOS/visionOS) |
| `SpacerSizing` | `.fixed` \| `.flexible` | macOS 26.0 |
| `ToolbarContent.sharedBackgroundVisibility(_:)` | `func sharedBackgroundVisibility(_ visibility: Visibility) -> some ToolbarContent` | macOS 26.0 |
| `DefaultToolbarItem` | `struct DefaultToolbarItem` | macOS 26.0 |
| `ToolbarContent.hidden(_:)` | `func hidden(_ hidden: Bool = true) -> some ToolbarContent` | macOS 15.0 |
| `ToolbarContent.visibilityPriority(_:)` | `func visibilityPriority(_ priority: ToolbarItemVisibilityPriority) -> some ToolbarContent` | macOS **26.1** at runtime — but the symbol is **absent from the macOS 26.5 SDK** (Xcode 26.6); it compiles only against the macOS 27 beta SDK. Other platforms are 27.0 beta. |
| `toolbarMinimizationBehavior(_:for:)` | | macOS **27.0 beta** |
| `toolbarOverflowMenu(content:)`, `ToolbarItemPlacement.topBarPinnedTrailing` | | **no macOS availability** |

In a macOS window toolbar, items are given a glass background shared with other
items in the same logical grouping. Grouping is expressed with spacers and with
the choice between `ToolbarItem` and `ToolbarItemGroup` — items in a group share
one capsule. Glass itself is automatic.

```swift
.toolbar {
    ToolbarSpacer(.flexible)
    ToolbarItem { ShareLink(item: landmark, preview: landmark.sharePreview) }
    ToolbarSpacer(.fixed)
    ToolbarItemGroup {                       // this group shares one glass capsule
        FavoriteButton(landmark: landmark)
        CollectionsMenu(landmark: landmark)
    }
    ToolbarSpacer(.fixed)
    ToolbarItem { Button("Info", systemImage: "info") { } }
}
```

Hide the **item**, not its view: `ToolbarContent.hidden(_:)` in SwiftUI,
`NSToolbarItem.isHidden` in AppKit. Aim for a maximum of three groups. Keep
actions with text labels separate, and do not mix text and icons across items
that share a background. Always specify an accessibility label for each icon
regardless of what is shown.

## Concentric shapes — correct names

`.rect(corner: .containerConcentric)` is **not SwiftUI API**. `containerConcentric`
is the UIKit spelling (`UICornerRadius`, iOS 26) and the AppKit spelling
(`NSViewCornerRadius`, macOS 27 beta). SwiftUI uses `Edge.Corner.Style.concentric`.

```
struct ConcentricRectangle                                            // macOS 26.0
init()                                                                 // each corner individually concentric
init(corners: Edge.Corner.Style, isUniform: Bool)
init(topLeadingCorner:topTrailingCorner:bottomLeadingCorner:bottomTrailingCorner:)
init(uniformTopCorners:uniformBottomCorners:)

static func Shape.rect(corners: Edge.Corner.Style, isUniform: Bool = false) -> Self   // macOS 26.0

struct Edge.Corner.Style                                               // macOS 26.0
  static var  concentric: Edge.Corner.Style
  static func concentric(minimum: Edge.Corner.Style? = nil) -> Edge.Corner.Style
  static func fixed(CGFloat) -> Edge.Corner.Style
  // ExpressibleByFloatLiteral and ExpressibleByIntegerLiteral

func View.containerShape(_ shape: some RoundedRectangularShape) -> some View          // macOS 26.0
```

> `ConcentricRectangle` automatically calculates each corner's radius relative to
> the container shape, so your view adapts correctly across devices and sizes
> without hard-coded values.

> To allow `ConcentricRectangle` to resolve corner radii … use `containerShape(_:)`
> to specify a container shape that implements `RoundedRectangularShape`, such as
> `Circle`, `Rectangle`, `RoundedRectangle`, or `Capsule`.

> When your `ConcentricRectangle`'s corners are far away from the containing
> shape's corners … the corner radius the system calculates may be zero … use
> `concentric(minimum:)`.

`isUniform: true` calculates each corner's radius first, then applies the largest
to every corner.

```swift
ConcentricRectangle(
    topLeadingCorner: .concentric(minimum: 12.0),
    topTrailingCorner: .fixed(24.0),
    bottomLeadingCorner: .concentric,
    bottomTrailingCorner: .fixed(0.0)
)
```

macOS 27 beta adds `GeometryProxy.concentricCornerRadii` and
`concentricCornerRadii(in:)` returning `RectangleCornerRadii?` for custom drawing.

## Presentations, windows, menu bar

| API | Availability | Note |
|---|---|---|
| `presentationBackground(_:)`, `presentationBackground(alignment:content:)` | macOS 13.3 | No glass-specific API. The rule is to *remove* custom sheet and popover backgrounds. |
| `presentationBackgroundInteraction(_:)` | macOS 13.3 | unchanged |
| `glassBackgroundEffect(...)` | **visionOS 1.0 only** | Not available on macOS. Frequent hallucination. |
| `WindowStyle` | macOS 11.0 (`.plain` is macOS **15.0**) | `.automatic`, `.titleBar`, `.hiddenTitleBar`, `.plain`. No new glass window style in 26 or 27 beta. |
| `containerBackground(_:for:)` | macOS 14.0 | `ContainerBackgroundPlacement.window` is macOS **15.0** |
| `windowToolbarStyle(_:)`, `WindowToolbarStyle` | macOS 11.0 | pre-existing |
| `MenuBarExtra`, `MenuBarExtraStyle` | macOS 13.0 | **No Liquid Glass API surface.** Appearance is entirely system-supplied. |

## Apple's only sample

`Landmarks: Building an app with Liquid Glass` —
`developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass`.
Native macOS target (`SUPPORTS_MACCATALYST = NO`), deployment target macOS 26.0,
refreshed June 2026. Its four articles cover background extension, horizontal
scrolling under a sidebar or inspector, toolbar glass grouping, and custom
activity badges.

The entire glass API surface the shipped sample uses:
`backgroundExtensionEffect()`, `ToolbarSpacer(.flexible)` and `(.fixed)`,
`GlassEffectContainer(spacing:)`, `.glassEffect(.regular, in: .rect(cornerRadius:))`,
`.glassEffectID(_:in:)`, `.buttonStyle(.glass)`, and one macOS-conditional
`.tint(.clear)` on a glass button. It uses no `glassEffectUnion`, no
`glassEffectTransition`, no `scrollEdgeEffectStyle`, no `safeAreaBar`, no
`ConcentricRectangle`, and no AppKit glass class. That is a useful calibration
for how little custom glass a well-built app needs.
