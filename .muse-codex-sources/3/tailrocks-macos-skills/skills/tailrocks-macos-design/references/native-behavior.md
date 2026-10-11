# The native behavior contract

A Mac app can look correct and feel foreign within seconds. Appearance is the
cheap half; this file is the expensive half.

The test a person applies without knowing they are applying it: **does every
action do what I already expected?** An interface that passes the visual review
and fails this one is a Liquid Glass skin over a non-Mac interaction model.

None of this is optional polish. Apple's own macOS characterization —
*"several hours of deep concentration"*, *"multiple apps open at the same time"*,
*"any combination"* of input modes — is a description of an app people live
inside, and the things below are what makes that survivable.

## Continuity — the app remembers

The least visible axis and one of the most decisive. An app that forgets is an
app people do not trust with real work.

Restore across quit and relaunch:

- Open windows, their positions and sizes
- Selected tab or document per window
- Sidebar and inspector visibility, and **sidebar width**
- Expanded and collapsed sections
- Selection, where selection is meaningful rather than transient
- Sort order, filters, and view mode
- Search scope and query, where the search is a mode rather than a lookup
- Work in progress

Restore **per window**, not per app, wherever a person can have two windows
showing different things. A second window that inherits the first window's state
is a bug that only appears for the people who use the app most.

Apple's file-management guidance sets the floor:

> Help people be confident that their work is always preserved unless they cancel
> or delete it. In general, **avoid making people take an explicit action to save
> their work.**

Losing window state, sidebar width, open documents, filters, or selection makes
an otherwise beautiful app feel unfinished. This is a design requirement, not an
implementation detail, and it belongs in the brief.

## Interaction latency

Distinct from frame rate, and more important. Frame rate is how smoothly an
animation runs; latency is **how long the app takes to acknowledge that a person
acted.**

The rule: **a control responds visually the moment it is used, even when the
work behind it is asynchronous.** Acknowledgement and completion are two separate
events, and only the first has a hard deadline.

Design targets that belong in the brief:

| Event | Expectation |
|---|---|
| Control acknowledges input | Immediate, always |
| Menu opens | Immediate |
| Selection changes | Immediate |
| Window resize | Continuous, no reflow lag |
| Scrolling | Stable at realistic data volume |
| Search | Results arrive progressively; the field never blocks |
| Long operation | Progress proportionate to duration, and cancellable |
| Background work | Never freezes the window; unrelated actions stay available |

Loading must not move the layout. Content arriving should fill reserved space,
not push controls under the pointer as someone reaches for them.

Test all of it against a realistic data set. An app that is fast with twelve
items and unusable with twelve thousand has not been tested.

## Menus are the command model

The menu bar is the authoritative map of what the app can do — not legacy
decoration, and not a duplicate of the toolbar.

> Mac users … rely on it to help them learn what an app does and find the commands
> they need. To help your app or game feel at home in macOS, it's essential to
> provide a consistent menu bar experience.

Rules that are testable:

- Standard menus in the standard order: app name, File, Edit, Format, View,
  app-specific, Window, Help.
- **Every toolbar item is also a menu command.** The command is canonical; the
  toolbar item is a shortcut to it.
- Populate each menu with **every** action related to its name.
- Order by **frequency of use, not alphabetically**.
- Show shortcuts in the menu.
- > Always show the same set of menu items. … **If a menu bar item isn't
  > actionable, disable the action instead of hiding it from the menu.**
- Never hide menus or items by context. Items stay in the same place even when
  inactive.
- Reflect state with checkmarks and selections.
- Context menus for the object under the pointer.

**A command palette is an accelerator, never a replacement.** It does not remove
the need for menus, shortcuts, context menus, or visible structure. An app whose
only route to a command is a palette has hidden its own capability from everyone
who does not already know it exists.

## Keyboard completeness

Non-negotiable. Keyboard-only operation is a hard requirement, and a
keyboard-navigation dead end is a hard failure in review.

- Standard menu shortcuts, working as they do everywhere else.
- > In general, don't repurpose standard keyboard shortcuts for custom actions.
- Arrow-key navigation; Tab and Shift-Tab focus movement; Return and Space
  activation; Escape dismisses transient interface.
- Selection extension from the keyboard.
- Custom shortcuts for high-frequency domain actions, discoverable in menus.
- Full Keyboard Access reaches everything.
- **Focus indication is always visible.** Hiding the focus ring because it
  disrupts a visual design is a defect, not a style decision.

Keyboard support designed in is structurally different from keyboard support
retrofitted. Declare the keyboard workflow in the brief, before layout.

## Pointer, selection, direct manipulation

The Mac is a precision-input platform, and Apple's own macOS best practice is to
*"help people take advantage of high-precision input modes to perform
pixel-perfect selections and edits."*

- Hover clarifies what is interactive — and **never carries the only route to a
  function.** Hover-only actions are an accessibility failure.
- Correct resize cursors; standard text and object selection.
- Shift-click range selection; command-click discontinuous selection.
- Rubber-band selection on canvases and collections.
- Drag and drop, with autoscroll during the drag and a visible drop indicator.
- Context menus. In a properly behaved app, opening a context menu shows a focus
  ring on the item it applies to **even when that item is not selected.**
- Double-click and space-bar preview conventions.
- Precise hit targets without oversized visual chrome.
- > Avoid redefining systemwide trackpad gestures.
- > Provide a consistent experience in your app, whether people are using
  > gestures, eyes, a pointing device, or a keyboard.

Use the platform's selection, gesture, menu, and drag-and-drop infrastructure
rather than raw pointer tracking. Hand-rolled event handling is where standard
behavior quietly goes missing.

## Documents and data

Where people own the content, adopt the document behaviors they already know:
autosave, versions, duplicate, rename, move, export, reveal in the file browser,
Open Recent, tabs, proxy dragging from the title, and restoring open documents.

Destructive and irreversible actions:

> **Warn people when they initiate a task that can cause data loss that's
> unexpected and irreversible.** In contrast, **don't warn people when data loss
> is the expected result of their action.**

Both halves matter. A confirmation on an expected deletion trains people to
dismiss confirmations, which disarms the one that mattered.

> Alerts can lose their impact if you use them too often.

Undo is a design surface, not a menu item:

> Let people undo multiple times. Avoid placing unnecessary limits…

> **Show the results of an undo or redo** … it's crucial to highlight the result
> of each undo and redo to keep people from thinking that the action had no
> effect.

Name the operation in the menu item — *Undo Typing*, *Redo Bold* — rather than a
bare *Undo*.

For synchronized or server-backed apps, provide the equivalent continuity: never
lose unsaved edits; make sync state legible; show offline state; make conflicts
actionable; never block the whole window for background activity; distinguish
local, syncing, and synced.

## Search as a mode

Search is a mode with state, not a text field.

- Native placement — trailing in the toolbar, or in the sidebar where the app's
  structure puts it there.
- Searches as typed where performance allows; results arrive progressively.
- **Preserves scope**, and shows which scope is active.
- Highlights matches; supports filtering.
- **Restores the previous view on dismissal.** A search that resets the workspace
  makes people avoid searching.
- Meaningful empty state that says what was searched and offers a way out.

Keep command search, content search, and help search visibly distinct. Merging
them without showing scope means results a person cannot interpret.

## Empty, loading, error

A polished app is still designed when there is nothing to show. These three
states are where unfinished apps are most obvious, and they are cheap to get
right.

**Empty** — say what belongs here, why it is empty, and what the primary next
action is. Mention whether content can be dragged in, and name the shortcut if
there is one. An empty state that only says "No items" has wasted the one moment
a person was willing to read.

**Loading** — preserve the layout. Reserve the space content will occupy so
nothing jumps. Progress proportionate to duration. Cancellable when long.
Unrelated actions stay available.

**Error** — describe what happened in the person's language, not the system's.
Preserve their work. Offer a direct recovery action. Put technical detail behind
disclosure. Do not use a modal alert for a minor recoverable condition.

> Show people when a command can't be carried out and help them understand why.

> Let people dismiss a modal view before presenting another one.

## Inspectors

An inspector answers one question: *what properties can I view or change for the
current selection?*

- Trailing side. It does not compete with navigation, and it never becomes a
  second navigation system.
- Collapsible, and its state is restored.
- Compact native controls, grouped into semantic sections, with disclosure for
  advanced settings.
- **Handles multiple selection**, including mixed values — the case that is
  always skipped and always encountered.
- Updates immediately as selection changes.
- No Apply button where the change can safely be immediate.
- Aligned labels, explicit units, full keyboard focus and tab traversal.

For a professional app an inspector beats a modal dialog for nearly every
property adjustment, because it keeps the object visible while it is edited.

## System integration

Native quality comes from the app's relationship with the whole system, not from
one window's appearance. Not every app needs every integration — but each
relevant one should be deliberate, and the brief should say which are in scope.

Spotlight indexing · App Intents · Shortcuts actions · Services · Share ·
Quick Look · Finder extensions · widgets · menu-bar extras · notifications with
useful actions · Focus filters · Handoff · universal links · document or data
sync · Continuity Camera · dragging content into other apps · standard open,
save, and export panels · Open With · Open Recent · automation support for
professional workflows.

Two Apple rules worth carrying:

> Make custom Dock menu items available in other places, too.

> Let people choose when to exit full-screen mode.

And personalization is one of Apple's six macOS best practices, not a nicety:
*"letting people customize toolbars, configure windows to display the views they
use most."*

## The rule underneath all of it

**Do not draw what the system can own.**

Every hand-drawn equivalent of a system behavior forfeits, silently and
permanently: updated material behavior, accessibility adaptation, current shape
grammar, main/key/inactive states, keyboard behavior, focus indication,
localization, right-to-left layout, and every future system refinement. It also
guarantees drift — the app looks correct on the OS it was built against and
progressively wrong afterwards.

The corollary for review: when a custom implementation is proposed, the question
is not "does it look right" but "which of those did we just give up, and what did
we get for them?"
