# The native component map

This single artifact eliminates the largest share of generic agent output. It
forces the question "which Apple component already does this?" before the
question "how should this look?", and it tells an implementing agent how
literally each region may be reproduced.

## Three classifications

### `NATIVE`

A standard SwiftUI or AppKit component with semantic configuration only.

The design specifies: component, placement, content, symbol, states, keyboard
behavior, accessibility role, resize behavior.

The design must **not** specify: blur, opacity, stroke, shadow, corner radius, or
any internal appearance value. Those belong to the system, which renders the real
material and adapts it to content, appearance, and accessibility settings. A
design file that hard-codes them produces a frozen imitation of one screenshot
instead of the live system component.

Wrong:

```
Blur: 42 · Opacity: 72% · White stroke: 18% · Shadow y 8 blur 32 · Radius 14
```

Right:

```
Component:   native macOS toolbar item
Placement:   primary action
Symbol:      plus
Label:       New Connection
Material:    system-provided; no custom appearance
States:      default, hover, pressed, disabled, keyboard-focused, inactive window
Command:     File ▸ New Connection, Command-N
```

### `NATIVE-COMPOSED`

A product-specific arrangement built from standard components — for example a
records workspace made of a split view, a sidebar, a table, a toolbar, and an
inspector. The composition is the product's; the controls are the system's.

The design specifies hierarchy, proportion, and spacing between components. It
does not add containers, cards, or borders that the composition does not need.

### `CUSTOM`

An element no standard component can express: a timeline editor, a node graph, a
query-plan visualization, a domain-specific canvas or scrubber.

Requires the full contract. A `CUSTOM` classification with no record of which
native components were evaluated and why they were insufficient is a shortcut,
not a classification.

## The map

Produce one row per visible region.

| Region | Class | Component / API | Placement | Notes |
|---|---|---|---|---|
| Workspace navigation | NATIVE | `NavigationSplitView` sidebar | leading column | icons honor system accent color |
| Records | NATIVE | `Table` | detail | edge-to-edge, scrolls under chrome |
| Selection details | NATIVE | `.inspector(isPresented:)` | trailing | collapses below minimum width |
| Create record | NATIVE | `ToolbarItem(placement: .primaryAction)` | trailing | also File ▸ New, Command-N |
| Records workspace | NATIVE-COMPOSED | split view + table + toolbar + inspector | — | no extra card containers |
| Query plan | CUSTOM | `QueryPlanView` | detail | contract required |

## Default mapping

Start here. Deviating requires a reason in the brief.

| Product responsibility | Native structure |
|---|---|
| Main application hierarchy | `NavigationSplitView` |
| Collection navigation | native sidebar list |
| Dense structured records | SwiftUI `Table`; AppKit table when advanced behavior demands it |
| Selection details | inspector |
| Primary and frequent actions | toolbar plus menu-bar commands |
| Search | `.searchable` / native search field |
| Secondary options | menu or popover |
| Contextual object actions | context menu |
| Configuration | `Settings` scene with native forms |
| Temporary focused work | sheet |
| Destructive confirmation | native alert or confirmation |
| Application commands | main menu and keyboard shortcuts |
| Icons | SF Symbols |
| Application icon | Icon Composer, layered, `.icon` |
| Unique domain content | custom content view |
| Unique floating control | custom glass, only after justification |

## The decision order for any region

1. A standard component.
2. A standard component with its custom background removed.
3. A composition of standard components.
4. A system-supported extension point — a custom bar API rather than an overlay.
5. A custom component with a written contract.

Record why each earlier step was insufficient. "It looked better" is not a
reason; "the native table cannot express a hierarchical diff with inline
expansion" is.

## What this map buys the implementing agent

For `NATIVE` regions the agent uses the mapped API and does not reconstruct the
frame. That is what makes the result both faithful and dynamically correct: the
app renders the real system material, which keeps adapting to appearance,
accessibility settings, and content long after the design was approved.

For `CUSTOM` regions the agent reproduces the approved geometry closely, because
there is no system component to defer to.

Conflating the two is the root cause of interfaces that look plausible in a
screenshot and wrong in use.
