# Apple's own patterns

The normative rules stated by Apple's own designers, quoted, with the first-party
app each was demonstrated on. Use this to answer "what does correct look like"
without guessing.

Compiled 2026-08-11 from WWDC sessions, Apple Newsroom, and Apple support
documentation. Apple's Human Interface Guidelines are a JavaScript-rendered
application; its backing JSON is fetchable at
`developer.apple.com/tutorials/data/design/human-interface-guidelines/<slug>.json`
— note `data/design/…`, not `data/documentation/design/…`, which returns 404.
That path is how these rules are verifiable rather than remembered.

Every API symbol named below was probe-verified against the local SDK, not
recalled. The technique, which is worth reusing whenever availability matters:
compile a file that touches each symbol with an artificially low target and read
the diagnostics.

```sh
xcrun swiftc -c probe.swift -target arm64-apple-macos10.15 -o /dev/null
```

`'X' is only available in macOS N or newer` pins the exact introduction; `has no
member` or `cannot find … in scope` means the symbol is absent from the SDK
entirely. Documentation pages cannot give you this, because Apple renders
declarations from the newest published SDK.

Results against SDK 26.5: `Glass` (with `.identity`, `.interactive()`, `.tint`),
`backgroundExtensionEffect()`, `ToolbarSpacer`, and SwiftUI
`scrollEdgeEffectStyle(_:for:)` are **macOS 26.0**; `NSGlassEffectView`,
`NSGlassEffectContainerView`, `NSBackgroundExtensionView`,
`NSView.prefersCompactControlSizeMetrics`, `NSToolbarItem.style` and
`.backgroundTintColor` are **macOS 26.0**; `NSScrollEdgeEffectStyle` and
`NSTitlebarAccessoryViewController.preferredScrollEdgeEffectStyle` are **macOS
26.1**, not 26.0 — that AppKit/SwiftUI split is the availability trap in this
area.

## The layer rule, in Apple's words

> It is best reserved for the navigation layer that floats above the content of
> your app. **Consider this tableview: making it Liquid Glass would make it
> compete with other elements and muddy the hierarchy.**

That is the whole system. Everything below follows from it.

## Sidebars and inspectors are different materials

> Sidebars appear as **a pane of glass that floats above the window's content**,
> whereas inspectors use **an edge-to-edge glass that sits alongside the
> content**.

Two different treatments, both from `NSSplitViewController` / the SwiftUI
equivalents. Getting this backwards — an inspector that floats, a sidebar flush
to the edge — reads as wrong even to someone who cannot say why.

**macOS 27 changes the sidebar half of this:**

> Sidebars expand to the edges on Mac and iPad, providing clearer structure while
> still refracting content from your app and the wallpaper. And **icons in the
> sidebar regain their color using your app's accent color**, giving your app more
> personality and making it more clear **which window is key**.

So the coloured sidebar icon becomes a key-window signal on macOS 27. If you
replaced sidebar icons with a fixed palette, you removed that signal.

## Content extends beneath the floating sidebar

Apple's exemplar is the App Store:

> This App Store poster creates a striking effect when displayed edge-to-edge …
> **The content is being mirrored and blurred.**

And the Apple TV app on the Mac:

> In iPadOS and macOS, updated sidebars make apps like Apple TV even more
> immersive. **They refract the content behind them** — while reflecting content
> and the user's wallpaper from around them.

Use `backgroundExtensionEffect()` / `NSBackgroundExtensionView`, once per window.

## Toolbar grouping is automatic and typed

> AppKit **automatically groups multiple toolbar buttons together on one piece of
> glass**. Different types of controls are separated out into their own glass
> elements, like segmented controls, pop-up buttons and the search control.

You do not build the grouping; you *adjust* it with `NSToolbarItemGroup` or with
`ToolbarSpacer`. Apple's worked example is Mail: a leading-aligned filter group,
a trailing-aligned search-plus-compose group.

**Non-interactive items must opt out of the glass**, and Apple names the app:

> The informational text in the Photos toolbar is a great example.

In AppKit set `isBordered = false` on non-interactive custom items, or they read
as buttons.

**Toolbar glass flips light or dark based on the brightness of the content
scrolled under it.** Contrast is content-dependent, not theme-dependent — so
design and test against your worst-case content, never a neutral background.

## Tint marks the primary action, and reads as text on macOS

> A primary action, like Done, stays separate and appears tinted … **as a
> prominent text button on macOS.**

> Use tinting selectively to emphasize primary elements and actions.

AppKit expresses this with `NSToolbarItem.Style.prominent` plus
`backgroundTintColor`. Apple publishes no numeric limit on *tint*, while the HIG
mandates one primary action (quoted in `anti-patterns.md`); these are one rule:
one tinted primary action per bar, on the trailing side.

## Scroll edge effects: automatic is the default; hard is the Mac case

HIG revision checked 2026-08-11: Scroll views (latest recorded change
2026-03-24), Sidebars, Menus, App icons, and Design principles were reread from
Apple's live Human Interface Guidelines. Platform-specific sidebar-adaptation
language is not promoted into a macOS API rule without macOS availability.

Prefer `.automatic`, which commonly resolves soft; force a style only for a
tested structural need.

> **Hard is mostly used on macOS.** It creates a stronger, more opaque boundary —
> ideal for interactive text, controls without backgrounds, or pinned table
> headers.

> When there are pinned accessory views under a toolbar, such as column headers …
> we use a "hard style" effect instead … **applied uniformly across the height of
> the toolbar.**

And for dense apps, Apple names Calendar:

> For denser UIs with a lot of floating elements, like in the calendar app, tune
> the sharpness of the effect on your content with the `scrollEdgeEffectStyle`
> modifier.

macOS 27 makes the automatic resolution explicit:

> The automatic `NSScrollEdgeEffectStyle` resolves to a **hard-edge effect when
> there is free-floating text**, like the window title in the title bar.

## Controls float above a canvas, they do not sit beside it

Apple's canvas exemplar is Freeform:

> Freeform's inline editing controls are a great example. **They float above the
> content rather than sitting alongside**, and they work beautifully with the
> Liquid Glass material.

And Maps, for the corollary — floating controls are removed when something else
takes over the space: "Maps uses Liquid Glass for custom buttons that are
floating above the map… And when the sheet expands, Maps removes the buttons."

## Windows recede when inactive

> When a window loses focus on the Mac or iPad, **Liquid Glass shifts its
> appearance and visually recedes to guide attention.**

System components do this for free. A hand-rolled surface does not, and an
inactive window with one bright custom panel still glowing is an immediately
visible defect.

## Window corner radius is concentric with the toolbar

> **Windows with toolbars now use a larger radius**, which is designed to wrap
> concentrically around the glass toolbar elements … **Titlebar-only windows
> retain a smaller corner radius.**

The radius depends on the window's *contents*. This is why a hard-coded child
radius is wrong: the parent term is not fixed. macOS 27 then normalizes it —
"every window on macOS now also has the same tighter corner radius" — so any
literal derived by eye against macOS 26 is wrong on 27.

## The density ladder

Mini, small, medium, large, and — new in macOS 26 — extra large. Mini, small,
and medium are slightly taller than before and keep rounded-rectangle geometry
for horizontal density; large and extra large become capsules.

Dense inspectors and popovers opt back out with
`prefersCompactControlSizeMetrics` (AppKit) or `.controlSize(.small)` (SwiftUI).

**This is the ladder that decides whether an app reads as a Mac app.** Large
capsules everywhere is the single most recognizable failure.

## Menu icons expanded, then contracted

macOS 26:

> A significant expansion in the use of icons. Both menu bar menus and context
> menus now use icons … Within each section of a menu, the icons form a single
> column.

macOS 27 reverses it:

> iPad and Mac Menu Bars now have **a minimal set of icons by default**, reserving
> them for key actions.

`NSMenu` hides symbol images by default on 27; opt back in per item. An app that
added an icon to every menu item on 26 will look noisy on 27.

## macOS 27 — what arrives without recompiling

> The Liquid Glass design **automatically takes on its updated appearance. Apps
> gain this look without having to change a single line of code!**

The material itself:

> We tuned Liquid Glass so it **more effectively diffuses complex content behind
> it**. And to establish more depth and separation, we also introduced **a
> darkened edge along with brighter specular highlights**.

The toolbar:

> When content scrolls under floating bars, **a uniform toolbar appears across the
> top** and keeps the text legible while improving contrast. This effect is
> applied automatically for standard toolbars and can be customized using the
> existing scroll edge effect APIs.

Also on 27: sidebar selection uses a semi-bold text style for emphasis; bordered
toolbar items over the sidebar adopt Liquid Glass; and the platform gains a
"show borders" environment value.

Interactive glass arrives for AppKit, with Apple's own restraint note:

> There is an effect that can be added to glass. Where the glass subtly bounces
> when clicked … **Maps uses this for a few of their custom controls.** … use this
> effect with controls and buttons, or glass containers of interactive controls.
> **A little goes a long way!**

And concentricity gets an API, with Maps again as the example: "the local weather
view in Maps is concentric with the window."

## The user-facing escape hatch

macOS 26.1 added a two-way choice:

> Liquid Glass setting gives you the option to choose between the default clear
> look or a new tinted look which **increases opacity of the material in apps**.

macOS 27 replaces it with a range:

> A new slider lets you easily customize how Liquid Glass looks, **from ultraclear
> to fully tinted.**

**There is no read API for either.** A custom glass surface cannot adapt
programmatically, so it must be visually verified at both extremes. This is not
an inconvenience — it is the reason the acceptance gate exists.

Related, and important for anyone tempted to lean on it: independent
accessibility analysis of macOS 26 found that *"the Reduce Transparency control
in Accessibility settings no longer reduces transparency in any useful way."* Do
not design a low-separation interface on the assumption that a system setting
will rescue it.

## Which Apple app to copy

Apple's own apps are not uniformly good models. They split cleanly.

**Copy:** Safari (document and browser shapes), Apple TV (curated media
libraries), Freeform (canvases), Maps (canvas overlay controls, and on macOS 27
interactive glass and concentric content), Calendar (dense grids), Finder (the
most restrained end), App Store (background extension), Mail (toolbar grouping).

**Do not copy on the Mac:** Music, Photos, Podcasts, FaceTime, Home, Journal.
These apply iOS-flavored transparency to unpredictable user content, and three
independent reviews document the same legibility failure — controls that vanish
against album art and photo grids. Apple's own macOS 27 corrections target
exactly this.

Two of Apple's pro apps — iWork and Final Cut Pro — **opted out of Liquid Glass
entirely.** Opting out is not available beyond the compatibility key's expiry,
but the signal is worth reading: a dense professional tool is where this material
is hardest to apply well.

The annotated version of this corpus, with third-party exemplars, counter-examples,
and a practitioner postmortem, is this skill's exemplar reference (`exemplars.md`).

## The adoption method

From a shipping developer's Liquid Glass postmortem published by Apple, and the
most useful process advice in the corpus:

> There's rightfully a lot of attention on the actual glass material part of the
> design, but **the new design system is full of fantastic usability
> improvements** … many of the changes that I've made to padding and hierarchy, I
> haven't cordoned off to just the latest OS version.

> **A redesign is certainly not required to adopt the new design. In fact, my
> process was more adopt and then redesign. Many of the best aspects come from
> just using the latest version of system components.**

**Adopt, then redesign.** Recompiling gets the material; the usability gains come
from moving to current system components; a redesign is a separate, later
decision. A team that starts with a redesign will ship neither well.

And on where the material actually belongs:

> For me, this is what Liquid Glass is in service of: creating new ways to
> interact with apps **without getting in the way**. It lets interfaces feel alive
> without being overweight, expressive and functional without being distracting.

## One technique worth knowing: `identity` at rest

The same postmortem, on the variant that changes nothing until touched:

> **This effect doesn't change the appearance of a view until you interact with
> it.** … I've applied this effect here to the main tidal wave. **On first glance,
> it's not obvious there's anything glassy about it, but as you start sliding it,
> the interactive effect adds a soft, subtle highlight beneath the wave.**

`Glass.identity` leaves content unaffected as if no effect were applied. Combined
with `.interactive()`, it gives a chart, scrubber, or drag handle a tactile
response **without placing a persistent material in the content layer** — the
surface is inert at rest, so the content-layer prohibition is not engaged. It is
also the correct substitution point when neutralizing an effect under an
accessibility setting.
