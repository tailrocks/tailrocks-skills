# Custom renderers and the glass authority

Applies when any part of the interface is drawn by a non-Apple renderer — a
Rust UI framework such as GPUI, a raw Metal surface, a canvas or game view —
or when the application is written in Rust and the question is where glass
can come from at all.

**Standing rule: the application's main renderer is always Apple's modern,
Apple-recommended one.** For a Swift macOS or iOS app that is SwiftUI on the
system rendering stack; at a justified capability boundary, AppKit. A custom
renderer is never the application shell and never the default — at most one
embedded workspace surface, admitted under the justification below.

## The authority fact

Liquid Glass is a system-managed material, not a shader recipe. The
operating system samples the content behind each surface, adapts light/dark
appearance from it, groups neighboring glass so adjacent surfaces sample and
morph as one system, applies legibility and accessibility substitutions,
recedes glass on inactive windows, and revises all of this across OS
releases — applications using system components inherit each year's
refinements by recompiling, custom reproductions inherit nothing. A custom
renderer can reproduce the *appearance* of glass at one point in time; it
cannot reproduce the implementation or its future. This is the same finding
as the design-file rule in `apple-patterns.md`: no artifact outside the OS
is authoritative for the material — not a Sketch file, and not a
custom-rendered imitation.

## The rule

- Glass chrome — toolbars, sidebars, inspectors, floating controls — is
  built from system components (SwiftUI, or AppKit at a justified
  boundary). Never hand-roll glass inside a custom renderer, and treat a
  blur-plus-rounded-corners imitation of glass as a hard failure under
  `anti-patterns.md`.
- A custom-rendered surface is `CONTENT` by definition in the layer model:
  it is the workspace the functional layer floats above. Classify it that
  way and apply the content-layer rules — no glass across it, standard
  window chrome above it.

## The architecture that follows

Native shell, custom center: the system owns windows, toolbars, sidebars,
inspectors, menus, search, settings, and every glass surface; the custom
renderer owns the one region that genuinely needs full rendering freedom —
an editor, canvas, terminal, graph, or visualization. Reach for a custom
renderer only when that region needs rendering control a native view cannot
give; a conventional productivity surface (forms, lists, tables, settings)
never qualifies.

Embedding cost: a framework like GPUI documents a standalone model — it
creates its own application object and windows. Hosting it as a content
view inside a native window is custom integration work, not a documented
drop-in; budget it, and choose it only when the custom surface earns it.

## Glass from Rust without Swift

A Rust application does not need Swift to reach the real material: the
`objc2` ecosystem's AppKit bindings expose `NSGlassEffectView`
(`contentView`, `cornerRadius`, `tintColor`, `style`) and
`NSGlassEffectContainerView` for system-managed grouping (verified
2026-08-16). Everything in this skill still applies unchanged — the
decision order, layer discipline, container batching, and the acceptance
gate; the binding changes the calling language, not the policy, and AppKit
lane limits (no interactive glass on macOS 26, numeric radius with a
revisit condition) carry over from `appkit-api.md`. One extra check:
generated bindings can lag the newest SDK, so a symbol's absence from the
binding is not evidence it does not exist — verify against the SDK, and
bridge a missing symbol with a raw message send or a minimal shim until the
binding catches up. Note the house default remains a SwiftUI shell
(`tailrocks-swift-best-practices`'s Rust core boundary); the zero-Swift
AppKit route is for when no Swift code is a hard project constraint.
