# The layer model

Liquid Glass forms a distinct functional layer for controls and navigation
elements that floats above the content layer. That sentence is the entire design
system. Every rule below is a consequence of it.

## The normative rule

Apple, Human Interface Guidelines ▸ Materials:

> Don't use Liquid Glass in the content layer. Liquid Glass works best when it
> provides a clear distinction between interactive elements and content, and
> including it in the content layer can result in unnecessary complexity and a
> confusing visual hierarchy. Instead, use standard materials for elements in the
> content layer, such as app backgrounds.

The one documented exception:

> An exception to this is for controls in the content layer with a transient
> interactive element like sliders and toggles; in these cases, the element takes
> on a Liquid Glass appearance to emphasize its interactivity when a person
> activates it.

Transient means *while the person is manipulating it*. A permanently glass
control sitting in a list row is not covered by this exception.

## Three planes, not two

The content/functional split is the rule. Splitting the functional layer in two
is what makes it usable, because the two halves behave differently and get
different treatments.

| Plane | Purpose | Contents | Behavior |
|---|---|---|---|
| **Content** | the person's work | documents, tables, lists, canvases, media, code, maps | opaque or standard materials; never glass |
| **Structural** | persistent navigation and commands | toolbar, sidebar, inspector chrome, search | glass, system-supplied, present at rest |
| **Transient** | temporary interaction | menus, popovers, sheets, contextual editors, floating palettes | glass, system-supplied, appears from its source and leaves |

Why the split earns its keep:

- **Structural glass is always on screen**, so it must be quiet. It is judged on
  legibility over the worst content the app can show.
- **Transient glass is brief and has an origin.** It is judged on whether it
  emerges from the thing that invoked it and returns attention afterwards.
- **Presentation morphing is system-owned.** Standard sheets and popovers
  presented from glass controls receive the system transition; a hand-rolled
  floating panel loses that relationship and must not imitate it.

Most custom-glass mistakes are a transient element built as structural — a
palette that never leaves, an editor docked instead of arising from the
selection — or a structural element given transient drama.

The `CUSTOM` glass that is usually justified is transient: a contextual editor
originating at the selected object, a floating control group over a canvas that
disappears when a sheet takes over. The structural plane is nearly always better
served by a standard component.

## Quiet at rest

Liquid Glass should not shimmer, refract, or deform continuously. The interface
is not the subject; the work is.

The intended sequence:

1. **At rest** — controls recede. Nothing moves.
2. **On hover** — the interface clarifies what is interactive.
3. **On press** — the control responds physically, but subtly.
4. **During transition** — related surfaces morph rather than cut.
5. **After completion** — attention returns to the content.

Apple's restraint note on AppKit's macOS 27 `effectIsInteractive` arrival is the
calibration for step 3: *"A little goes a long way!"*

A resting state that draws the eye is a defect regardless of how good it looks in
a screenshot, because a person sees the resting state for hours and the
interaction states for milliseconds.

## Classify before implementing

Produce this table for every screen before writing any glass code. A region that
resists classification is an information-architecture defect surfacing as a
styling question.

| Region | Layer | Component | Glass source |
|---|---|---|---|
| Sidebar | FUNCTIONAL | `NavigationSplitView` sidebar | automatic |
| Window toolbar | FUNCTIONAL | `.toolbar` / `NSToolbar` | automatic |
| Inspector | FUNCTIONAL | `.inspector` / `NSSplitViewItem(inspectorWithViewController:)` | automatic |
| Record table | CONTENT | `Table` | none — standard material |
| Detail form | CONTENT | `Form` + `.formStyle(.grouped)` | none |
| Floating canvas controls | FUNCTIONAL | custom, justified | `GlassEffectContainer` |

`CONTENT` regions use standard materials: SwiftUI `Material`, AppKit
`NSVisualEffectView.Material`. They never receive `glassEffect` or
`NSGlassEffectView`.

## Establish the hierarchy

Apple, Adopting Liquid Glass ▸ Navigation:

> Establish a clear navigation hierarchy … clearly separate your content from
> navigation elements … to establish a distinct functional layer above the
> content layer.

Two structural obligations follow:

- **Extend content beneath sidebars and inspectors** — SwiftUI
  `backgroundExtensionEffect()`, AppKit `NSBackgroundExtensionView`. Content that
  stops at the sidebar edge reads as two documents rather than one surface with
  floating chrome.
- **Check content safe areas for sidebars and inspectors.** Content must be laid
  out to the window edge with the safe area handling the inset, not padded away
  from the chrome manually.

## Layout consequences

From HIG ▸ Layout:

> Differentiate controls from content. Instead of a background, use a scroll edge
> effect to provide a transition between content and the control area.

> Extend content to fill the screen or window … Controls and navigation
> components like sidebars and tab bars appear on top of content rather than on
> the same plane.

macOS-specific: avoid placing controls or critical information at the bottom of a
window, and avoid displaying content within the camera housing at the top edge
(`NSPrefersDisplaySafeAreaCompatibilityMode`).

## Scroll edge effects are structural, not decorative

From HIG ▸ Scroll views:

> Only use a scroll edge effect when a scroll view is behind floating interface
> elements. Scroll edge effects aren't decorative. They don't block or darken
> like overlays; they exist to ensure controls stay visually distinct.

> Apply one scroll edge effect per view. In split view layouts on iPad and Mac,
> each pane can have its own scroll edge effect; in this case, keep them
> consistent in height to maintain alignment.

> Prefer the automatic scroll edge effect style. … This style provides a more
> opaque visual separation for top toolbars that contain a large number of
> controls, text that appears outside of Liquid Glass controls, and pinned table
> headers. If you use the soft scroll edge effect style instead, thoroughly test
> your interface to ensure your controls maintain legibility in a variety of
> contexts.

## Variant selection

Two variants, and the choice is not stylistic.

**Regular** is the default and the correct answer nearly always. It blurs and
adjusts the luminosity of background content. Use it when background content
might create legibility issues, or when components carry a significant amount of
text — alerts, sidebars, popovers.

**Clear** is highly translucent and is only for components floating above media
backgrounds such as photos and video. It carries a concrete obligation:

> If the underlying content is bright, consider adding a dark dimming layer of
> 35% opacity. If the underlying content is sufficiently dark, or if you use
> standard media playback controls from AVKit that provide their own dimming
> layer, you don't need to apply a dimming layer.

Do not mix variants arbitrarily within one context. Choosing `clear` requires a
written reason why `regular` is unsuitable.

## Color and tint

From HIG ▸ Color, Liquid Glass section:

> By default, Liquid Glass has no inherent color, and instead takes on colors
> from the content directly behind it.

> For smaller elements like toolbars and tab bars, the system can adapt Liquid
> Glass between a light and dark appearance in response to the underlying
> content … Liquid Glass appears more opaque in larger elements like sidebars to
> preserve legibility.

> Apply color sparingly to the Liquid Glass material … To emphasize primary
> actions, apply color to the background rather than to symbols or text. Refrain
> from adding color to the background of multiple controls.

> Even if your app ships in a single appearance mode, provide both light and dark
> colors to support Liquid Glass adaptivity.

> Avoid hard-coding system color values.

From HIG ▸ Toolbars: only one primary action, on the trailing side, using the
prominent style. Avoid applying a similar color to toolbar item labels and
content layer backgrounds.

## macOS-specific obligations

These have no iOS equivalent and are routinely missed:

- **Every toolbar item must also exist as a command in the menu bar.**
- macOS toolbar items have no bezel.
- The system adds the overflow menu when items no longer fit. Do not add one
  manually.
- Sidebar icons use the app accent color by default, and a person can change the
  system accent color — the icons must display the color they chose.
- Sidebar size (small / medium / large) is user-controllable in General settings;
  row metrics must reflow.
- Avoid putting critical information or actions at the bottom of a sidebar.
- Window main, key, and inactive appearances come from the system. Inactive
  windows do not use vibrancy, which makes them appear subdued and visually
  farther away; custom chrome must follow the system-defined appearances.
- Avoid creating custom window UI. Do not make custom window frames or controls
  and do not replicate the system-provided appearance.
- macOS has no Dynamic Type. The type scale is fixed: Large Title 26/32 through
  Caption 10/13, SF Pro. Use the `NSFont` dynamic variants
  (`controlContentFont`, `menuBarFont`, `titleBarFont`) to match system controls.

## What changed in the surrounding system at 26.0

Adopting an existing app trips over these even when no glass code is written:

- Control dimensions grew. Do not hard-code layout metrics.
  `NSView.prefersCompactControlSizeMetrics` restores macOS 15-compatible metrics
  as an escape hatch, and `NSControl.ControlSize.extraLarge` was added.
- Section headers use title-style capitalization, not all caps.
- Forms should adopt the `grouped` style.
- Windows adopt rounder corners.
- Sheets and popovers: remove any visual effect view added to the content view.
