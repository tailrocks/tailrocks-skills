# App archetypes

Classify the app's shape before choosing a layout. Without this step an agent
reaches for one generic shell — sidebar, content, inspector — and applies it to
a focused utility, a menu-bar extra, and a professional canvas alike. That is
the single most common structural failure in generated Mac interfaces, and no
amount of visual polish recovers from it.

Most products combine archetypes. **One must dominate each window.** Hybrids are
resolved by giving each archetype its own window or mode, not by merging them
into a universal shell.

Each entry below gives the primary object, the structure that follows from it,
what to optimize, and the failure that archetype specifically attracts.

## 1. Document editor

*Preview, Pages, TextEdit, an Xcode editor window, an image editor.*

**Primary object:** a document or project the person owns.

**Structure:** document title and status in the window; optional navigator or
thumbnail sidebar; the canvas; optional trailing inspector; File / Edit / View /
Window plus domain menus; autosave, versions, rename, duplicate, move, export,
Open Recent, and reveal-in-Finder where they apply.

**Optimize:** canvas area, data safety, undo depth, multiple windows, tabs,
restoration, precision.

**Attracts:** a dashboard home in front of the editor, a modal dialog for every
property, a fake Save button next to autosave, a single-window limitation, lost
unsaved work.

## 2. Library, source list, list-detail

*Finder, Mail, Notes, Music, Photos, Reminders.*

**Primary object:** a collection, and the item selected within it.

**Structure:** sidebar for sources, accounts, collections, or locations; content
list, grid, or table; detail or editor region; search and filters with an
explicit scope; strong selection with distinct active and inactive appearance.

**Optimize:** scanning, selection continuity across sort and filter, drag and
drop, keyboard traversal, performance at real collection size.

**Attracts:** every row rendered as a card, ambiguity between the selected
*source* and the selected *item*, a sidebar deeper than two levels, no multiple
selection, phone-style drill-down inside a wide window.

## 3. Professional canvas with inspector

*Keynote, Final Cut Pro, Logic Pro, Pixelmator Pro, design and CAD tools.*

**Primary object:** direct manipulation of visual, spatial, temporal, or
structured content.

**Structure:** the canvas or timeline takes the largest area; compact tools and
frequent actions; a navigator, layers, or source pane; an inspector for the
current selection's properties; a customizable workspace where workflows
genuinely differ.

**Optimize:** latency, precision, selection, zoom, guides, contextual tools,
shortcut depth, undo history.

**Attracts:** oversized controls stealing canvas, floating glass over every
tool, the inspector pressed into service as navigation, animation that delays
manipulation, pointer-only tools.

## 4. Focused utility

*A window manager, a capture tool, a converter, a system helper.*

**Primary object:** one narrow job, done quickly.

**Structure:** one window or popover; minimal persistent navigation; strong
defaults; integration through a keyboard shortcut, Services, Shortcuts, the menu
bar, or Finder where relevant.

**Optimize:** speed, low cognitive overhead, predictable lifecycle, system
integration.

**Attracts:** a marketing hero inside the app, a sidebar with three items, an
onboarding carousel, feature cards, a decorative dashboard. This archetype
attracts more invented structure than any other, because there is so little real
structure to build.

## 5. Menu-bar extra

*Status monitors, timers, launchers, sync clients.*

**Primary object:** status, plus a small set of frequent actions.

**Structure:** a legible status item with an accessibility label; a concise menu
or a purpose-built popover; a real window for configuration or deep work; full
keyboard and VoiceOver access.

**Optimize:** immediate scanning, minimal interruption, correct status-item
behavior, continuity after relaunch.

**Attracts:** an unlabeled mystery glyph, a scrolling phone screen stuffed into
a popover, critical information available only on hover, no Settings window.

## 6. Command launcher or transient palette

*Spotlight-shaped search, command panels, quick-open.*

**Primary object:** fast discovery and execution.

**Structure:** a focused search field; ranked results with clear categories and
shortcuts; keyboard-first navigation; immediate dismissal with focus restored to
where it was; **every command still reachable through menus and normal UI.**

**Optimize:** latency, relevance, concise labels, selection, preview, clarity
about what the action will do.

**Attracts:** the palette replacing the menu system entirely, ambiguous result
scope, decorative glass dominating the results, no pointer or accessibility
support.

## 7. Monitoring or operations workspace

*Organizers, observability tools, infrastructure consoles, financial terminals.*

**Primary object:** live or historical system state, and action on it.

**Structure:** high but controlled density; tables, timelines, charts, logs,
filters, inspectors; unmistakable live / stale / offline states; saved views and
restoration; keyboard navigation, copy, and export.

**Optimize:** truthful status, scanability, number formatting, performance, time
range control, filtering, large data, error recovery.

**Attracts:** a card grid for every metric, glass over dense data, status carried
by color alone, placeholder data that looks live, animated charts that defeat
comparison, phone-scale whitespace.

## 8. Media library and player

*Photos, Music, TV, media organizers.*

**Primary object:** discovery, organization, and playback or editing of media.

**Structure:** artwork leads visually; controls recede at rest; library and
source navigation; search, filters, metadata inspector, playback controls;
explicit loading, unavailable, and external-device states.

**Optimize:** legibility over *variable* content, smooth browsing, direct
manipulation, continuity, and Clear glass only for the content-tied temporary
interaction defined in `layer-model.md`, with
the required dimming obligation.

**Attracts:** text over uncontrolled imagery, permanently tinted glass, hidden
playback state, animated artwork competing with the content. This is the
archetype where Apple's own apps went wrong on the Mac — see the exemplar
corpus.

## 9. Settings

*System Settings, an app's Settings scene.*

**Primary object:** configuring durable behavior.

**Structure:** search when the surface is large; semantic grouping; native
controls and labels; immediate application where safe; relaunch implications
stated.

**Optimize:** predictability, reversibility, sensible defaults, help, and an
explanation for every disabled control.

**Attracts:** a card mosaic, custom toggles, an ambiguous Save button, global
settings mixed with document properties, a destructive reset with no stated
scope.

## Hybrids

Assign archetypes to separate windows or modes:

- a library window that opens document editor windows,
- a menu-bar extra that opens a full monitoring workspace,
- a canvas window that offers a transient palette while keeping its menus and
  toolbar.

Do not merge every archetype into one universal window. If a window cannot name
its dominant archetype, that is an information-architecture defect surfacing
early — which is the cheapest place to find it.

## Recording the choice

In the experience brief:

```
Dominant archetype:
Secondary archetypes, and which window or mode each owns:
Primary object of this window:
Why this archetype and not the adjacent one:
The failure this archetype attracts, and how the design avoids it:
```

The last line is the one that earns its keep. Each archetype has a
characteristic way of going wrong, and naming it in advance is far cheaper than
finding it in review.
