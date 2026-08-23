# Glass acceptance gate

Every custom glass surface, every custom bar, and every custom corner must be
rendered and inspected under each axis below. A surface verified only in the
default light appearance is unverified.

The reason this gate is not optional: system components substitute opaque and
high-contrast treatments automatically under several of these settings, and
hand-rolled surfaces do not. The failure is invisible in a default screenshot and
obvious to a person who has the setting on.

## Axes

| # | Axis | Where | Read API | Pass criterion |
|---|---|---|---|---|
| 1 | Light appearance | Appearance ▸ Light | `colorScheme` / `NSAppearance` | Custom colors defined; no invisible glyphs |
| 2 | Dark appearance | Appearance ▸ Dark | same | Same. Provide both light and dark colors even in a single-appearance app, because Liquid Glass adapts. |
| 3 | Auto appearance | Appearance ▸ Auto | — | No stale cached colors across the switch |
| 4 | Liquid Glass = Clear (default) | Appearance ▸ Liquid Glass | **none** | Custom glass matches adjacent system components |
| 5 | Liquid Glass = Tinted (26.1+) | Appearance ▸ Liquid Glass | **none** | Custom glass must not stay clear while system chrome goes opaque |
| 6 | macOS 27 Liquid Glass slider | Settings | **none** | Same as 4 and 5, across the range |
| 7 | Reduce Transparency | Accessibility ▸ Display | `accessibilityReduceTransparency` / `NSWorkspace.accessibilityDisplayShouldReduceTransparency` | Custom glass substitutes an opaque background; text contrast maintained |
| 8 | Increase Contrast | Accessibility ▸ Display | `colorSchemeContrast` / `NSWorkspace.accessibilityDisplayShouldIncreaseContrast`; `NSAppearance.Name.accessibilityHighContrast*` | HIG contrast minimums met; borders appear |
| 8b | Show Borders (macOS 27) | Accessibility ▸ Display | environment value | Custom surfaces gain explicit boundaries and stay aligned. A surface whose only edge was the material itself must acquire a real one. |
| 9 | Reduce Motion | Accessibility ▸ Display | `accessibilityReduceMotion` / `NSWorkspace.accessibilityDisplayShouldReduceMotion` | Glass morph animations replaced by fades. A glass morph is an animated blur, and Apple's Reduce Motion guidance says to avoid animating into and out of blurs. |
| 10 | Differentiate Without Color | Accessibility ▸ Display | `accessibilityDifferentiateWithoutColor` / `NSWorkspace.…` | Tinted glass is not the sole state signal |
| 11 | System accent color — all built-ins, custom, multicolor | Appearance ▸ Accent color | `NSColor.controlAccentColor` | Sidebar icons display the chosen color; prominent buttons re-tint |
| 12 | Highlight color | Appearance ▸ Highlight color | `NSColor.selectedContentBackgroundColor` | Selection legible on glass |
| 13 | Window main / key / inactive | click away | — | Inactive windows do not use vibrancy; custom chrome must follow the system-defined appearances |
| 14 | Sidebar icon size small / medium / large | General settings | — | Row metrics reflow |
| 15 | Scroll bars: Always / When scrolling / Automatic | Appearance | — | Scroll edge effect still correct with no visible scrollers |
| 16 | Display scale 1x / 2x, and dragging between displays | Displays | — | Corner radii and blurs resolve correctly on move |
| 17 | Wallpaper: bright photo, dark photo, solid | Wallpaper | — | Clear-glass surfaces legible; 35% dark dimming layer applied where required |
| 18 | Content behind bars: bright, dark, high-frequency imagery | in-app | — | Resting state maintains clear legibility |
| 19 | Window at minimum size, and full screen | — | — | Toolbar groups collapse into the *system* overflow; nothing overlaps |
| 20 | VoiceOver and Voice Control | Accessibility | — | Every icon has an accessibility label |
| 21 | Full Keyboard Access and focus ring | Accessibility ▸ Keyboard | `NSColor.keyboardFocusIndicatorColor` | Focus ring visible on glass |
| 22 | Hover | pointer | — | `.glass` and `.glassProminent` hover **outside** toolbars is broken on macOS 26 and fixed in 27 — verify, do not assume |
| 23 | Color profile sRGB vs Display P3 | Displays | — | No shift that breaks contrast |
| 24 | Localization, RTL, long strings | — | — | Toolbar groups do not overflow by default |

## Per-surface record

For each custom glass surface, record:

```
Surface:
Layer (must be FUNCTIONAL):
Why no standard component was sufficient:
Container it belongs to:
Variant (regular / clear) and, if clear, why regular is unsuitable:
Shape and how its radius is derived:
Availability guard and deployment target:
Substitution under Reduce Transparency:
Substitution under Reduce Motion:
Axes verified:
Axes failed, with blocker:
```

A surface without a container, or with a hard-coded radius adjacent to a system
container, or with no recorded substitution behavior, fails the gate regardless
of how it looks.

## Hard failures

Any one of these fails the surface outright:

- Glass on a content-layer element that is not a transient interactive control.
- Two independently overlapping or nested glass surfaces.
- A custom background on a toolbar, split view, sheet, or popover.
- A hard-coded corner radius adjacent to a system container.
- More than one tinted prominent action in a bar.
- No opaque substitution under Reduce Transparency.
- A macOS 27 symbol used without an availability guard on a macOS 26 target.
- An icon-only control with no accessibility label.
- A toolbar item with no corresponding menu-bar command.
- No rendered evidence.

Known platform blocker: macOS 27 Beta 5 records that `NSSegmentedCell` may draw
at the wrong location under Liquid Glass (168066807). Identify this OS defect
before attributing the displaced control to app layout.
