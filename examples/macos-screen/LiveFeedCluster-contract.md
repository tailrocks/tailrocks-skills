# Custom component contract — LiveFeedCluster

Name: LiveFeedCluster
Design frame or reference: n/a (code-first dogfood; captures are the reference)
Code component: `LiveFeedCluster` (SwiftUI)

## Product reason

During an incident the session feed updates continuously; a person needs to
freeze it at the exact moment something suspicious scrolls past, without
moving the pointer to the toolbar and losing the spot they are watching.

## Native alternatives considered

See NativeComponentMap decision-order row: no standard floating control on
macOS; toolbar item too far from the point of attention; `safeAreaBar`
produces an inset bar rather than a floating cluster.

## Layer

Functional control layer, floating above content. Glass is justified per the
Liquid Glass decision order: floating functional controls above continuously
changing content is the documented use of the material.

## Geometry

Minimum size: two 28pt controls plus padding.
Ideal size: intrinsic.
Maximum size: intrinsic.
Resize behavior: pinned bottom-trailing with 16pt insets; never clipped at
minimum window (table keeps ≥ 200pt visible height above it).
Internal alignment: horizontal, centered.
Spacing: 10pt between glass surfaces; container spacing 20pt so the two
surfaces merge at rest into one cluster.
Corner radius: capsule per control (system default glass shape); no custom
radii adjacent to system containers.

## States

Default: visible while the feed is live.
Hover: system glass hover where provided (macOS 26 defect: glass button hover
outside toolbars does not render — verified, not assumed; see verification).
Keyboard-focused: focus ring visible on each control.
Pressed: system.
Selected: pause control shows paused state (symbol + label change).
Disabled: while connection is in error state.
Loading: unchanged.
Error: hidden (feed not live).
Empty: hidden (no connection selected).
Inactive window: follows system appearance; no custom compensation.

## Input

Pointer: click pause/resume, click clear.
Keyboard: ⌘P pause/resume; controls in focus order after the table.
Trackpad gestures: none.
Drag and drop: none.
Context menu: none.
Menu-bar command equivalent: View ▸ Pause Live Feed (⌘P); View ▸ Clear Feed.

## Accessibility

Label: "Pause live feed" / "Resume live feed"; "Clear feed".
Value: paused state announced via label change.
Role: buttons.
Custom actions: none needed.
Focus order: after table, before inspector.
VoiceOver behavior: announces state change on toggle.
Behavior under Differentiate Without Color: state carried by symbol and
label, not color.
Behavior under Increase Contrast: system substitutes high-contrast glass
treatment for the system material; content colors are semantic.

## Material

Liquid Glass, `Glass.regular`, untinted, two surfaces in one
`GlassEffectContainer` (spacing 20). Shares no container with any other
surface.
Substitution under Reduce Transparency: `Glass.identity` on both surfaces
plus an opaque `.regularMaterial`-backed capsule background, keyed off
`accessibilityReduceTransparency`.

## Motion

Trigger: pause toggling.
Purpose: state-transition continuity (feed motion stops/starts).
Duration or spring behavior: system default interruptible spring.
Interruption and reversal: toggling mid-animation reverses cleanly.
Rapid repeated input: coalesces; no queued animations.
Reduce Motion behavior: symbol crossfade only.
Performance constraint: one container, two surfaces, no per-row effects.

## Localization

Maximum expected text expansion: labels are symbols + short strings; 1.6× safe.
Right-to-left: cluster mirrors to bottom-leading.

## Fallback

Behavior on the minimum supported macOS version (26.0): full behavior; all
symbols are 26.0.
Behavior when a forward-only API is unavailable: none used.

## Acceptance

Reference screenshots: w6-dogfood/captures/
Required previews: cluster live, paused, reduce-transparency substitution.
Required UI tests: pause toggle via identifier; audit passes scoped to
app-owned elements.
