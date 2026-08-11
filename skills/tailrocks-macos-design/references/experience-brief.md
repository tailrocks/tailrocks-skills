# The experience brief

The brief exists to make the expensive decisions explicit before styling makes
them implicitly. Every field below has changed a real design when answered
honestly.

A brief is not a requirements document. It is short enough that an agent reads it
in full for every meaningful design task.

## Why an adjective prompt fails

Compare the two instructions an agent can receive.

Useless:

```
Make the interface premium, futuristic, and Apple-like.
```

Every important decision is left undefined, so the model fills the gap with the
statistical center of web design: cards, gradients, pills, arbitrary spacing.

Useful:

```
This is a professional macOS workspace for sustained daily use.

The interface prioritizes content density, legibility, keyboard operation, and
calm hierarchy. Use native macOS structures before custom components. Liquid
Glass is reserved for navigation and controls above content. Do not use
translucent content cards, decorative gradients, oversized pills, or
web-dashboard layouts.

The primary content must visually dominate the toolbar, sidebar, and inspector.
At the minimum window width the primary task must remain usable without
horizontal clipping.
```

The second states a character, a density, a layer policy, a dominance rule, and a
falsifiable minimum-width constraint.

## Fields

**User.** Who uses this, and with what expertise? A tool used eight hours a day
by an expert has different density, keyboard, and error-recovery obligations than
one used twice a month.

**Primary job.** The single most important thing a person needs to accomplish.
One sentence. If it takes three, the feature is not scoped.

**Archetype.** Record the dominant archetype, secondary archetypes and owning
windows or modes, primary object, why the adjacent archetype lost, and the
failure the chosen archetype attracts.

**Primary objects.** What people create, select, edit, inspect, organize, export.
The object model drives the navigation model; guessing the navigation model first
is how features acquire the wrong window architecture.

**Information hierarchy.** What must be visible immediately. What appears
contextually. What belongs in an inspector. What belongs in a separate window or
sheet. What is progressively disclosed.

**Frequency and consequence.** Which actions happen constantly, occasionally, and
rarely. Which are destructive. Frequency decides toolbar placement; consequence
decides confirmation and undo. A frequent action is not automatically the primary
action — the primary action is the one that advances the primary job.

**Window model.** Single main window, multiple windows, document-based, utility
panels, menu-bar experience, settings window. This is a Mac decision with no iOS
analogue and it is routinely skipped.

**Input.** Pointer, keyboard-first, trackpad, drag and drop, context menus,
services, and system integrations in scope. Declare the keyboard workflow explicitly; keyboard support retrofitted
after layout is always worse than keyboard support designed in.

**Recovery.** Undo, confirmation, autosave, version history, error recovery. A
destructive action without at least one of these is a hard failure later.

**Continuity.** Per-window restoration of position, size, sidebar width,
selection, and open documents.

**Latency targets.** Immediate acknowledgement, selection, and menu opening;
long work preserves layout and exposes progress and cancellation.

**Density.** High-density professional workspace, calm consumer experience, or
media-rich immersive presentation. Pick one. Density is the single strongest
signal that separates a native Mac app from an enlarged phone app.

**Minimum usable window.** What must remain functional at the minimum size, and
what collapses or becomes contextual. Choose product-specific reference
dimensions and record them — there is no universal macOS minimum, and a design
without one has not been designed for a resizable window.

**Accessibility.** VoiceOver, keyboard-only operation, Reduce Motion, Reduce
Transparency, Increase Contrast, color independence, focus visibility. These are
design inputs, not a post-processing pass.

**Localization.** Long translated strings, right-to-left content, locale-sensitive
numbers, dates, and units. Toolbar groups that fit in English and overflow in
German were designed against one locale.

## Approval

A person approves the brief before visual work begins. Approval is the point at
which the expensive structural decisions become settled ground; changing them
later invalidates the component map, the alternatives, and the review.

Record the approval date and the approver alongside the brief.
