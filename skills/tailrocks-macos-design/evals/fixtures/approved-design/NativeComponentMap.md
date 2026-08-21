# Native Component Map — ConnectionsBoard sessions workspace

## Map

| Region | Class | Component / API | Placement | Allowed customization | Forbidden customization |
|---|---|---|---|---|---|
| Connection navigation | NATIVE | `NavigationSplitView` sidebar `List` | leading column | row content, symbols | any background, any material |
| Session table | NATIVE | SwiftUI `Table` | detail | columns, row content | row backgrounds, materials, fixed row metrics |
| Session details | NATIVE | `.inspector(isPresented:)` | trailing | width range, content | material, corner radius |
| Refresh | NATIVE | `ToolbarItem(placement: .primaryAction)` | trailing | symbol, label, shortcut | bezel, blur, radius, shadow, tint (only one prominent action allowed and none is needed here) |
| Inspector toggle | NATIVE | `ToolbarItem` | trailing | symbol | same |
| Live-feed cluster | CUSTOM | `LiveFeedCluster` (GlassEffectContainer) | floating, bottom-trailing over table | per contract | outside contract |
| Whole workspace | NATIVE-COMPOSED | split view + table + toolbar + inspector | — | proportion, spacing roles | added cards or containers |

## NATIVE regions — detail

```
Region:      Refresh
Component:   ToolbarItem(placement: .primaryAction) Button
Placement:   trailing
Symbol:      arrow.clockwise
Label:       Refresh Sessions
States:      default, hover, pressed, disabled (while loading), keyboard-focused, inactive window
Material:    system-provided; no custom appearance
Keyboard:    ⌘R
Menu command: View ▸ Refresh Sessions
Accessibility role: button, label "Refresh Sessions"
Resize behavior: overflow handled by the system
```

```
Region:      Inspector toggle
Component:   ToolbarItem Button
Placement:   trailing
Symbol:      sidebar.right
Label:       Inspector
States:      as above
Material:    system-provided
Keyboard:    ⌘⌥I
Menu command: View ▸ Show Inspector
Accessibility role: button, label "Inspector"
Resize behavior: system overflow
```

## NATIVE-COMPOSED regions — detail

```
Region:      Whole workspace
Composition: NavigationSplitView(sidebar: List, detail: Table + .inspector)
Hierarchy and proportion: table dominates; sidebar 220–280pt; inspector 260–320pt
Spacing roles between components: system defaults only
Containers deliberately NOT added: no cards, no custom panes, no decorative borders
```

## CUSTOM regions — detail

```
Region:         Live-feed cluster
Component name: LiveFeedCluster
Native alternatives evaluated, and why each was insufficient:
  1 standard component — no standard floating control over scrolling content
    exists on macOS (bottom accessories are iOS-family).
  2 background removed — n/a, nothing to strip.
  3 composition — a toolbar item cannot express pause-at-point-of-attention:
    the control must sit where the motion it stops is happening (the feed),
    which is the documented purpose of a floating functional control.
  4 system extension point — `safeAreaBar` was evaluated: it insets the
    content and creates a full-width bar; the need is a compact floating
    cluster over content, not a bar.
  5 custom — chosen, with contract.
Contract location: w6-dogfood/LiveFeedCluster-contract.md
```

## Decision order evidence

| Region | 1 standard | 2 background removed | 3 composition | 4 system extension point | 5 custom |
|---|---|---|---|---|---|
| Live-feed cluster | no floating-control component | n/a | toolbar too far from the motion | safeAreaBar makes a bar, not a cluster | chosen |
