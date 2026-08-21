# Custom renderers and the glass authority

Applies when anyone proposes drawing part of the interface with a non-Apple
renderer — a Rust UI framework such as GPUI, a bundled game or canvas
engine — or when the application is written in Rust and the question is
where glass can come from at all.

## The standing rule

**Never use GPUI or anything similar in a native Swift application.** The
main renderer is always Apple's modern, Apple-recommended one — SwiftUI on
the system rendering stack, AppKit only at a justified capability boundary.
This is a ban, not a preference ranking: a second UI system inside a native
app makes authentic Liquid Glass, accessibility, menus, focus, window
behavior, and standard macOS interactions harder, and its pixels inherit
nothing from any future OS release. Reject the proposal and name this rule;
do not negotiate a "just one embedded GPUI view" compromise.

## The authority fact

Liquid Glass is a system-managed material, not a shader recipe. The
operating system samples the content behind each surface, adapts light/dark
appearance from it, groups neighboring glass so adjacent surfaces sample and
morph as one system, applies legibility and accessibility substitutions,
recedes glass on inactive windows, and revises all of this across OS
releases — applications using system components inherit each year's
refinements by recompiling, custom reproductions inherit nothing. A custom
renderer can reproduce the *appearance* of glass at one point in time; it
cannot reproduce the implementation or its future. No artifact outside the OS
is authoritative for the material — not a design file, and not a
custom-rendered imitation. A blur-plus-rounded-corners imitation of glass is
a hard failure under `anti-patterns.md`.

## High-performance custom drawing, the Apple way

A region that genuinely needs full rendering freedom — an editor canvas, a
visualization, a real-time preview — is drawn with Apple's own modern
rendering inside the SwiftUI shell, never with a third-party UI framework:

- SwiftUI `Canvas` and `TimelineView` for immediate-mode 2D drawing.
- SwiftUI's Metal shader modifiers (`colorEffect`, `layerEffect`,
  `distortionEffect`) for GPU effects on SwiftUI content.
- A Metal view (`MTKView`) behind a representable only at a justified AppKit
  boundary under `tailrocks-swift-best-practices`' interop rules.

Whichever is used, that region is `CONTENT` in the layer model: glass chrome
— toolbars, sidebars, inspectors, floating controls — is built from system
components above it, and no glass is drawn inside it.

## Glass from Rust without Swift

A pure-Rust application (no Swift by project constraint) still uses Apple's
renderer: the `objc2` ecosystem's AppKit bindings expose `NSGlassEffectView`
(`contentView`, `cornerRadius`, `tintColor`, `style`) and
`NSGlassEffectContainerView` for system-managed grouping (verified
2026-08-16). GPUI is not the shell there either. Everything in this skill
applies unchanged — the decision order, layer discipline, container
batching, and the acceptance gate; the binding changes the calling language,
not the policy, and AppKit lane limits (no interactive glass on macOS 26,
numeric radius with a revisit condition) carry over from `appkit-api.md`.
One extra check: generated bindings can lag the newest SDK, so a symbol's
absence from the binding is not evidence it does not exist — verify against
the SDK, and bridge a missing symbol with a raw message send or a minimal
shim until the binding catches up. The house default remains a SwiftUI shell
over a Rust core (`tailrocks-swift-best-practices`'s Rust core boundary);
the zero-Swift AppKit route exists only for a hard no-Swift constraint.
