# macOS craft

macOS is not an enlarged iPhone. An interface can be attractive in a screenshot
and still feel entirely non-native because it ignores the interaction model.

## The interaction model an agent must respect

Window lifecycle and restoration. Single-window versus multi-window. Document
architecture. Menu-bar commands. Keyboard shortcuts. Focus and key-view order.
First responder. Selection models. Undo and redo. Drag and drop. Context menus.
Sidebars and inspectors. Toolbar customization. Tables, outlines, and
hierarchical data. Pointer hover. Resize-aware layout.

Concrete obligations that agent output most often drops:

- **Every toolbar item must also exist as a command in the menu bar.** This is a
  macOS-specific rule with no iOS analogue.
- **The system adds the toolbar overflow menu** when items no longer fit. Never
  add one manually.
- **macOS toolbar items have no bezel.**
- **Sidebar icons use the app accent color by default**, and a person can change
  the system accent color — the icons must display the color they chose.
- **Sidebar size is user-controllable** (small, medium, large) in General
  settings; row metrics must reflow.
- **Avoid critical information or actions at the bottom** of a window or sidebar.
- **Window main, key, and inactive appearances come from the system.** Inactive
  windows do not use vibrancy and appear subdued; custom chrome must follow the
  system-defined appearances.
- **Avoid custom window UI.** Do not build custom window frames or controls, and
  do not replicate the system-provided appearance.
- **Hover-only actions need a keyboard and menu equivalent.** A pointer-only
  affordance is an accessibility failure, not a polish choice.

## Density

Density is the strongest single signal separating a native Mac app from an
enlarged phone app. Professional Mac interfaces need compact toolbars, smaller
controls, high information density, precise pointer targets, keyboard-first
operation, multiple windows, inspectors, tables, columnar layouts, drag and drop,
and resize-aware layout.

Control geometry follows size, not fashion: smaller Mac controls use rounded
rectangles; larger, more prominent controls become capsule-like. Turning every
button into a large floating pill is the most recognizable AI-generated mistake
on macOS.

macOS 26 grew control metrics. Do not hard-code layout metrics.
`NSView.prefersCompactControlSizeMetrics` restores macOS 15-compatible metrics as
a compatibility escape hatch, and `NSControl.ControlSize.extraLarge` exists for
genuinely large controls. Use `controlSize` rather than fixed frames.

## Typography

macOS uses SF Pro. **macOS does not support Dynamic Type.** Do not design bars,
rows, or truncation behavior around text-size scaling — that is an iOS concern
and designing for it on the Mac produces slack layout with no benefit.

The built-in scale runs from Large Title 26/32 to Caption 10/13. Use system
control fonts — `controlContentFont`, `menuBarFont`, `titleBarFont` — to track
control metrics, not a user text-size setting. Semantic roles use
`preferredFont(forTextStyle:)` or SwiftUI text styles.

Define semantic roles, not arbitrary styling:

```
Text / Window Title
Text / Section Title
Text / Body
Text / Secondary
Text / Table Primary
Text / Table Secondary
Text / Monospaced Data
Text / Caption
Text / Error
```

SF Mono is appropriate for aligned technical content. New York exists for
editorial use. A custom face requires a product reason, not a mood.

Section headers use title-style capitalization as of macOS 26, not all caps.

## Color

Use semantic system colors and appearance variants. Avoid hard-coding system
color values.

> Even if your app ships in a single appearance mode, provide both light and dark
> colors to support Liquid Glass adaptivity.

Define roles, not hexes:

```
Color / Accent
Color / Primary Text
Color / Secondary Text
Color / Destructive
Color / Success
Color / Warning
Color / Data Series 1…n
```

Color must carry meaning: primary action, selected state, status, or a
product-specific signal. Color that exists to make a control more visible is
decoration, and it costs the interface its ability to signal what actually
matters.

Never let color be the sole state signal — Differentiate Without Color must leave
every state distinguishable.

## Spacing and geometry

Create named spacing roles rather than scattering numbers:

```
Spacing / Inline Tight
Spacing / Inline
Spacing / Section
Spacing / Pane
Spacing / Window Edge

Radius / Custom Small
Radius / Custom Medium
Radius / Custom Large
```

Do not create a radius token for native buttons, fields, menus, or toolbars.
Their geometry belongs to the system, and it changed in macOS 26 and changes
again in 27.

For custom surfaces adjacent to a system container, derive the radius
concentrically rather than choosing one. See `swiftui-api.md` for the
mechanism and the correct API spellings.

### Capsule or rounded rectangle

Liquid Glass does not mean every control becomes a capsule. The Mac shape grammar
keeps mini, small, and medium controls as rounded rectangles and reserves capsule
geometry for larger, more prominent ones. Getting this wrong is the single most
recognizable AI-generated tell on macOS, because it destroys density.

**Capsule** — a prominent primary action; a compact status-and-action pair; a
self-contained playback control; a short segmented choice; a free-floating
transient control group.

**Rounded rectangle** — inspector fields; dense toolbar controls; steppers;
pop-up buttons; filters; professional editing controls; table and list actions.

**Neither** — capsule table rows, capsule navigation items, large rounded cards
nested inside an already-rounded window, and any radius that differs from its
neighbours without a structural reason.

## Icons

SF Symbols first — over 7,000 symbols aligned to San Francisco, with matching
weights and scales.

- Provide a text label whenever a symbol alone is ambiguous. Do not mix text and
  icons across items that share a background.
- **Always specify an accessibility label for every icon**, regardless of what is
  shown in the interface.
- Keep symbol rendering mode and scale consistent within a surface.
- Custom icons need a reason; a custom icon that duplicates an SF Symbol is a
  consistency cost with no benefit.

Maintain an explicit symbol map so the implementing agent does not invent names:

```
DesignName,SFSymbol,Usage,LabelRequired
Create,plus,Primary toolbar action,true
Delete,trash,Destructive action,true
Inspector,sidebar.right,Toggle inspector,false
Refresh,arrow.clockwise,Reload content,false
Search,magnifyingglass,Search,true
```

## The application icon

Use Icon Composer, which ships with Xcode. Design layered artwork and export a
single `.icon` file covering the macOS appearance set: default, dark, clear
light, clear dark, tinted light, tinted dark.

- macOS spec: square, rounded-rect mask, 1024×1024, layered, maximum four
  z-ordered groups.
- Prefer vector sources (SVG or PDF).
- **Let the system handle blurring and other visual effects.** Do not bake
  specular highlights, drop shadows, bevels, blurs, or glows into the artwork.
- Prefer clearly defined edges in foreground layers, and keep features consistent
  across appearances.

The `.icon` file is not an asset catalog entry. Add it to the project and set the
target's app icon to the file name without its extension.

## Motion

Motion must explain causality. Distinguish decorative animation from
state-transition continuity, spatial explanation, direct-manipulation feedback,
focus transitions, navigation transitions, selection feedback, loading, and error
recovery. Only the first is optional; the rest carry meaning.

Three pass/fail tests, before any judgement call:

- An interruptible, gesture-driven, or retargetable animation must preserve
  velocity through interruption — which a duration-based easing curve cannot do.
- Dismissal reverses the reveal along the same axis.
- No animation may be one a person must sit through twice.

Under Reduce Motion, replace transitions in the x, y, and z axes with fades,
reduce automatic and repetitive animation including zooming and scaling, and
avoid animating into and out of blurs — which covers every glass morph.

Full criteria, the motion specification, and the review questions are in the
motion reference for this skill.

## Visual evaluation questions

Ask these against a rendered screenshot, not against source:

- What is the first thing perceived? Is that the correct thing?
- Can the current location and selection be identified without hovering?
- Is there exactly one clear primary action?
- Does content remain visually dominant over chrome?
- Is glass serving structure or decoration?
- Does the layout stay coherent at minimum width and when resized?
- Are controls using native conventions and native geometry?
- Is the density appropriate for sustained desktop work?
- Does the interface remain understandable with color removed?
- What is unnecessary and can be deleted?

The last question is the one that most improves a design.
