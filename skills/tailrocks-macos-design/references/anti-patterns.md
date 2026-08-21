# Anti-patterns and their mechanisms

A finding must name the mechanism, not merely cite the rule. Each entry below
gives the normative statement, why the system actually breaks, and the fix.

The non-negotiables, indexed:

- Apply `glassEffect(_:in:)` **after** other appearance modifiers — anything
  applied later is not captured (§9). One `GlassEffectContainer` (SwiftUI) or
  `NSGlassEffectContainerView` (AppKit) per visual cluster — never one per
  view, never one per screen (§7). **No nesting or independent overlap** of
  glass surfaces — a hard failure per `verification.md` (§2).
- State which radius case applies — **capsule** for one free-floating control,
  **concentric derivation** for a multi-control cluster or beside another
  container corner, or a **documented numeric radius** with a revisit
  condition where no concentric API exists — and record which applies (§4).
  Tint at most one prominent action per bar, on the background rather than
  the glyph (§5).
- **Per-row glass — reject.** **Rule:** rows are content; use standard content
  materials and reserve glass for a functional-layer control. **Mechanism:**
  row glass occupies the wrong compositing layer, breaking the scroll edge
  effect and content-derived adaptation (§1). **Cost:** every unbatched row
  adds its own backdrop-sample, blur, and refraction pass — unbounded in row
  count (§7, the performance framing).
- Cross-platform spellings that do not exist on macOS 26 — reject on sight and
  name the correct form (§8, §4): `glassBackgroundEffect(...)` is
  visionOS-only; `.rect(corner: .containerConcentric)` is the UIKit and AppKit
  27 beta spelling, and a correction is incomplete unless it supplies both
  `ConcentricRectangle` and `Edge.Corner.Style.concentric` with
  `containerShape(_:)`; `NSGlassEffectView.effectIsInteractive` is macOS 27
  beta — AppKit has no interactive glass on macOS 26 at all.

## 1. Glass in the content layer

**Rule.** "Don't use Liquid Glass in the content layer … including it in the
content layer can result in unnecessary complexity and a confusing visual
hierarchy."

**Mechanism.** Liquid Glass is *defined* as a distinct functional layer floating
above the content layer. Putting it in content destroys the only cue that
separates controls from material, and it places the surface in the wrong
compositing layer, so scroll edge effects and content-driven light/dark
adaptation have nothing to key off.

**Fix.** Use `Material` (SwiftUI) or `NSVisualEffectView.Material` (AppKit) in
content. Documented exception: a transient interactive element — a slider or
toggle knob — legitimately takes glass while a person is manipulating it.

## 2. Glass-on-glass nesting

**Rule.** "Avoid overcrowding or layering Liquid Glass elements on top of each
other."

**Mechanism.** Each glass layer samples what is behind it. Stacking makes layer
*n+1* sample the already-refracted output of layer *n*, so the backdrop it reads
is not real content — luminosity adaptation and the legibility guarantee both
break, and you pay an extra full render pass per nesting level.

**Fix.** One glass surface per functional group. Merge siblings with
`GlassEffectContainer` or `NSGlassEffectContainerView` instead of stacking. For
elements *on* glass, use fills, transparency, or vibrancy — not another glass
effect.

## 3. Custom opaque backgrounds on bars, split views, sheets, popovers

**Rule.** "Any custom backgrounds and appearances you use in these elements might
overlay or interfere with Liquid Glass or other effects that the system provides,
such as the scroll edge effect." And: "Reduce your use of custom backgrounds in
controls and navigation elements."

**Mechanism.** The scroll edge effect is drawn by the system *between* the
scrolling content and the bar. An opaque custom background composites above it,
so the effect is invisible or double-drawn, and the bar stops receiving
content-derived light/dark adaptation.

**Fix.** Delete the custom background — the adoption preflight is deletion:
before adding any glass API, delete every custom toolbar background, bezel,
separator, and effect, then use the standard component. Never preserve that
decoration in a fallback. Tune with `scrollEdgeEffectStyle(_:for:)`
or `NSScrollEdgeEffectStyle`. Delete `NSVisualEffectView` from popover content
views. Named by Apple: `NSToolbar`, `NSSplitView`, `NavigationStack`,
`NavigationSplitView`, `WindowStyle.titleBar`, `toolbar(content:)`.

## 4. Hard-coded corner radii

**Rule.** `ConcentricRectangle` "automatically calculates each corner's radius
relative to the container shape, so your view adapts correctly across devices and
sizes without hard-coded values." And: "If you need to create a custom component,
ensure that its corner radius is also concentric with the bar's corners."

**Mechanism.** Concentricity means sharing a center point with the container's
corner arc. The correct child radius is `parentRadius − inset`, and both terms
change with the window corner radius — which changed in macOS 26 and changes
again in 27 — as well as with display and layout. A literal is wrong everywhere
except the one configuration it was eyeballed against.

**Fix.** SwiftUI `ConcentricRectangle` plus `containerShape(_:)`. AppKit has no
API before macOS 27 (`NSViewCornerRadius.containerConcentric`), so host in
SwiftUI or derive from `NSView.effectiveCornerRadii` on 27+.

The same rule applies to control dimensions: macOS 26 grew control metrics.
Hard-coded layout metrics break. `NSView.prefersCompactControlSizeMetrics` is the
compatibility escape hatch, not the default answer.

**Decision, stated per surface.** **Capsule** for one free-floating control —
system-derived, never numeric. **Concentric derivation** (`ConcentricRectangle`,
`containerShape(_:)`, or `.rect(corners: .concentric)`) for any multi-control
cluster — two or more actions, even on one shared surface — or beside another
container corner. A **documented numeric radius** only where no concentric API
exists (AppKit on macOS 26), with a revisit condition for container-radius
changes. Record explicitly which case applies and whether concentric derivation
was used.

**Correction output.** Rejecting `.rect(corner: .containerConcentric)` — UIKit
(iOS 26) and AppKit (macOS 27 beta), not SwiftUI — is incomplete unless the
response literally supplies both `ConcentricRectangle` and
`Edge.Corner.Style.concentric` with `containerShape(_:)`, even if its code also
uses the valid shorthand `.rect(corners: .concentric)`.

## 5. Tint abuse

**Rule.** "By default, Liquid Glass has no inherent color, and instead takes on
colors from the content directly behind it." · "Apply color sparingly … Refrain
from adding color to the background of multiple controls." · "To emphasize
primary actions, apply color to the background rather than to symbols or text." ·
"Only specify one primary action."

**Mechanism.** Tint fights the material's content-derived adaptation. If every
control is tinted, none reads as primary. Tinted labels over colorful content
lose contrast — hence the separate rule: "Avoid applying a similar color to
toolbar item labels and content layer backgrounds."

**Fix.** At most one prominent action per bar, on the trailing side. Tint the
background, never the glyph.

## 6. Ignoring Reduce Transparency, Increase Contrast, Reduce Motion

**Rule.** "Ensure you test your app's custom elements, colors, and animations
with different configurations of these settings."

**Mechanism.** System components substitute opaque and high-contrast treatments
automatically. A hand-rolled glass panel does not — it stays translucent while
everything around it goes opaque. That is simultaneously an accessibility failure
and a visual break, and it is invisible in a default-settings screenshot.
`Glass.identity` exists precisely to neutralize an effect.

**Fix.** Branch on `accessibilityReduceTransparency`, `colorSchemeContrast`, or
the `NSWorkspace.accessibilityDisplayShould…` flags and substitute an opaque
material. Under Reduce Motion, replace glass morph animations with fades —
"reduce automatic and repetitive animations, including zooming, scaling, and
peripheral motion."

## 7. Per-view `glassEffect` outside a container

**Rule.** Stated twice by Apple: "Use `GlassEffectContainer` when applying Liquid
Glass effects on multiple views to achieve the best rendering performance" and
"Creating too many Liquid Glass effect containers and applying too many effects
to views outside of containers can degrade performance."

**Mechanism.** Each unbatched glass surface is its own backdrop-sample, blur, and
refraction render pass. A container merges N surfaces into one pass, and it is
the **only** way shapes can blend or morph. AppKit names the mechanism directly:
"reducing the number of passes required to render similar glass effect views."

**Fix.** One container per visual cluster. Not one per view. Not one per screen.
Never `glassEffect` on list or table rows — unbounded N, and it violates the
content-layer rule anyway.

## 8. iOS patterns leaking into macOS

Each of these is an availability-verified failure, not a style preference:

- `glassBackgroundEffect(...)` is **visionOS only**.
- `toolbarOverflowMenu(content:)` and `ToolbarItemPlacement.topBarPinnedTrailing`
  have **no macOS availability at all**.
- `NSGlassEffectView.effectIsInteractive` is macOS 27 beta — interactive AppKit
  glass is impossible on macOS 26.
- AppKit has one glass bezel style; UIKit has four button glass configurations.
- `UIView.cornerConfiguration` is iOS 26; the AppKit equivalent is macOS 27.
- macOS has **no Dynamic Type**. Do not design bars around text-size scaling.
- macOS toolbar items have **no bezel**, and the **system** adds the overflow
  menu — "Don't add an overflow menu manually."
- macOS-only obligations that iOS-shaped code omits: every toolbar item must also
  exist as a menu-bar command; sidebar icons must honor the user's system accent
  color; window main, key, and inactive appearances must come from the system.
- Enlarging an iPhone navigation pattern to desktop size — oversized capsules for
  every action, a card grid standing in for information architecture, hover-only
  actions with no keyboard or menu equivalent.

## 9. Wrong modifier order

**Rule.** "Apply the `glassEffect(_:in:)` modifier after other modifiers that
affect the appearance of the view."

**Mechanism.** The modifier captures the content beneath it to hand to the
container. Appearance modifiers applied after it are not part of the captured
content, so they render outside the material.

The same class of bug applies to `backgroundExtensionEffect()`, which must be
applied **before** `.overlay` or the overlay content slides under the sidebar.

## 10. Shipping `UIDesignRequiresCompatibility` as a strategy

**Rule.** The key is documented as temporary: "Temporarily use this key while
reviewing and refining your app's UI for the design in the latest SDKs."

**Mechanism.** The system **ignores the key when the app is built against the 27
SDK or later**, and Apple has stated it is removing support for opting into the
old design. Any plan resting on it has a hard expiry that arrives with the next
SDK bump, not with a deprecation warning.

**Fix.** Treat it as a short migration window with a dated exit, and schedule the
adoption work inside that window.

## 11. Mid-merge spacing at rest

**Rule.** Container spacing must not leave neighboring surfaces permanently
half-fused at rest. Use spacing no larger than the interior spacing for distinct
surfaces, or intentionally build one merged capsule.

**Mechanism.** Merging is a proximity transition. Holding surfaces in its
mid-band makes the metaball seam permanent, as the shipped dogfood captures and
ReviewDisposition row linked by the macOS design rubric record.

## 12. Raw `glassEffect` on a standard button

**Rule.** A standard button takes a glass *button style* —
`.buttonStyle(.glass)` or `.buttonStyle(.glassProminent)` (macOS 26.0) —
never a raw `glassEffect(_:in:)` applied to the button view. Toolbar and
navigation controls already receive native glass treatment automatically.

**Mechanism.** The raw modifier wraps the button's rendered content in a
separate glass surface, producing an ordinary button sitting *on top of*
glass instead of an integrated glass control: press feedback, tint
handling, container grouping, and the accessibility substitutions all come
from the button style, and the wrapped form receives none of them.

**Fix.** Replace the modifier with the style; reserve `.glassProminent` for
the single genuinely primary action per the tint rule.

## 13. A custom bar as an `overlay` carrying `.glassEffect`

**Rule.** A custom bar uses the system-supported construction — SwiftUI
`safeAreaBar(edge:...)`, AppKit `NSTitlebarAccessoryViewController` or
split-item `top-`/`bottomAlignedAccessoryViewControllers` — never an `overlay`
carrying `.glassEffect`.

**Mechanism.** The supported APIs adjust bar geometry and the scroll edge
effect; an overlay adjusts neither, so the bar floats over content the layout
does not know about and the effect has nothing to key off.

**Fix.** Move the bar into `safeAreaBar` or the accessory-view controller and
let the system place it.

## Performance framing

Apple publishes **no numeric cost, no per-effect budget, and no Liquid-Glass
Instruments template.** Any "maximum N glass surfaces" figure is invented — mark
it as such if it appears in a review.

What Apple does say: combine custom effects in a container to improve rendering
performance; apply `backgroundExtensionEffect()` with discretion and generally to
only a single instance of background content; and "Limit the use of Liquid Glass
effects onscreen at the same time." Glass cost scales with what is behind it, not
only with its own area, because the system adapts the material in response to the
underlying content.

Derived practice, not quoted: one container per visual cluster; one
`backgroundExtensionEffect()` per window; profile with Time Profiler and the
animation-hitch model on the lowest-spec Apple silicon Mac you support, with an
external display attached, since backdrop sampling cost scales with the sampled
region. Capture a before and an after profile and lock the fix in with a
performance test.
