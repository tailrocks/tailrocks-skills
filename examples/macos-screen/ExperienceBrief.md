# Experience Brief — ConnectionsBoard sessions workspace

Status: APPROVED
Approved by: maintainer-delegated executor (dogfood exercise)
Approved on: 2026-08-11

## User

A backend engineer monitoring live database connections during an incident.
Expert user, keyboard-first, uses the screen for sustained stretches.

## Primary job

See at a glance which sessions on the selected connection are unhealthy, and
inspect one session's details without losing the list.

## Primary objects

Connections (select), sessions (select, inspect, terminate), session details
(inspect).

## Information hierarchy

Visible immediately: connection list, session table with state per row.
Contextual: session detail (inspector).
Inspector: session metadata, statement, timings.
Separate window or sheet: none.
Progressively disclosed: terminate confirmation.

## Actions

| Action | Frequency | Consequence | Placement | Menu command | Shortcut |
|---|---|---|---|---|---|
| Refresh sessions | constant | safe | toolbar | View ▸ Refresh Sessions | ⌘R |
| Toggle inspector | constant | safe | toolbar | View ▸ Show Inspector | ⌘⌥I |
| Pause live feed | occasional | safe | floating cluster over table | View ▸ Pause Live Feed | ⌘P |
| Terminate session | rare | destructive | context menu + menu bar | Session ▸ Terminate | ⌘⌫ |

Primary action: Refresh sessions (advances the monitoring job; terminate is
rare and destructive, deliberately not prominent).

## Window model

Single main window.

## Input

Pointer: row selection, cluster buttons.
Keyboard workflow: ⌘R refresh, ⌘⌥I inspector, arrows in table, ⌘⌫ terminate
with confirmation, ⌘P pause feed.
Trackpad: scroll.
Drag and drop: none.
Context menus: per session row (Inspect, Terminate).

## Recovery

Undo: not applicable (terminate is remote and confirmed).
Confirmation: required for Terminate.
Autosave: n/a (read-mostly monitoring).
Error recovery: connection failure state with retry.

## Density

High-density professional.

## Window sizes

Minimum usable: 720 × 440 — table with state, name, and duration columns and
the toolbar remain usable; the inspector presents as a system overlay over
content at this width (native behavior — corrected from an earlier
"auto-collapses" assumption after the rendered minimum-width capture).
Typical: 1100 × 700.
Wide: 1500 × 900.
Collapses as width decreases: inspector first, then sidebar.

## States

Empty: no connection selected → guidance text.
Loading: refresh in flight, table keeps last data.
Normal: mixed healthy/slow/blocked sessions.
Very large dataset: 5,000 sessions (lazy table).
Long values: long statement strings truncate with full text in inspector.
Missing values: idle sessions have no current statement.
Error: connection unreachable → non-modal error state with retry.
Offline: same as error.
Permission denied: read-only role hides Terminate.
Destructive operation pending: terminate confirmation.

## Accessibility risks

VoiceOver: session state must be announced (label includes state).
Keyboard-only: cluster buttons reachable; ⌘P equivalent exists.
Focus visibility: focus ring over table rows and cluster buttons.
Reduce Motion: feed-pause morph replaced by fade.
Reduce Transparency: glass cluster substitutes opaque background.
Increase Contrast: state colors carry symbols too.
Color independence: state = symbol + text, never color alone.

## Localization risks

Text expansion: German session-state labels ~1.4×; toolbar has three items,
within overflow safety.
Right-to-left: table and inspector mirror; no directional artwork.
Locale-sensitive: durations and timestamps via formatters.

## Out of scope

Query editing, schema browsing, multi-connection dashboards.
