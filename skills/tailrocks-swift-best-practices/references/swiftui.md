# SwiftUI on macOS

## State ownership

State lives at the **lowest node that spans every reader and every writer**.

- Higher than that: every unrelated update invalidates the subtree.
- Lower than that: the state is destroyed when the view is re-created, and the
  bug reads as "it forgets what I typed".

Ownership rules that hold up:

- `@State` owns view-local state no one else reads.
- A parent owns shared state and passes focused `@Binding` projections.
- An `@Observable` model owns state that outlives any view.
- `@Environment` carries genuinely shared dependencies; passing a binding down
  four levels means ownership is misplaced.

Derived state is computed, not stored. Two stored properties that can disagree
will eventually disagree.

## View identity

Identity churn re-creates state, restarts animations, and defeats every
optimization the framework performs. It is the most expensive and least visible
SwiftUI mistake.

- Identifiers must be **stable** and **unique**. An array index is neither once
  the collection can reorder, filter, or insert.
- An identifier derived from mutable content changes when the content changes,
  which destroys and re-creates the row instead of updating it.
- A conditional that swaps between two structurally different branches creates a
  new identity. When continuity matters, keep one branch and vary its content.

Symptoms to recognize in review: a text field that loses focus while typing, a
selection that resets on refresh, an animation that snaps instead of moving, a
scroll position that jumps.

## Keep work out of `body`

`body` is called often and unpredictably. Anything expensive there runs far more
often than the author imagined.

Move out: date and number formatting, sorting, filtering, regular expressions,
allocation, image decoding, and anything touching the file system.

Store formatters and precompute derived collections in the model. Where a value
must be derived per row, derive it once when the collection changes, not once per
`body` call.

## Layout

Prefer the framework's layout containers to fixed frames. A hard-coded frame is
correct on exactly one window size, and macOS windows resize continuously.

- Declare minimum and ideal sizes rather than fixed ones; the window's minimum
  size is a product decision recorded in the brief, and the layout must honor it
  without clipping.
- A custom layout is worth writing when the arrangement genuinely cannot be
  expressed by stacks and grids — not to avoid learning the alignment system.
- Alignment guides handle cross-container alignment. Padding used to fake
  alignment breaks at the next size.

Control geometry follows control size. Use the control-size environment rather
than fixed frames, and remember that macOS 26 grew control metrics — a layout
built around the old dimensions will be wrong.

## Scenes and windows

macOS windowing has no iOS analogue and is routinely skipped by iOS-shaped code:

- Choose the scene type deliberately: a single main window, multiple windows, a
  document group, a settings scene, a menu-bar extra, a utility panel.
- Commands belong in the command surface so they appear in the menu bar. **Every
  toolbar action needs a menu-bar command**, and the command is the canonical
  definition, with the toolbar item as a shortcut to it.
- Restore state per window, not per app, wherever a person can have two windows
  showing different things.
- Handle main, key, and inactive appearance. Inactive windows do not use
  vibrancy and appear subdued; custom chrome must follow the system-defined
  appearances.

## Focus and keyboard

Keyboard support designed in is better than keyboard support retrofitted, and the
difference is structural rather than cosmetic.

- Model focus explicitly rather than hoping the default traversal is right.
- Every pointer-reachable action needs a keyboard path.
- Hover-only affordances are an accessibility failure; a hover state may reveal
  emphasis, never the only route to a function.
- Verify focus order by walking it and recording the visited identifiers, not by
  looking at the layout.

## Performance

Measure before changing. The framework's own instrument reports view body cost
and update counts, and the animation-hitch model explains where a frame was lost.

The recurring causes on macOS, in rough order of frequency:

1. Identity churn causing whole-subtree re-creation.
2. Expensive work inside `body`.
3. Publisher-based `ObservableObject` / `@Published` scoped too broadly, so
   whole-object `objectWillChange` invalidates unrelated readers. `@Observable`
   tracks per-property reads; ask why a new model remains publisher-based.
4. Unbatched material effects — each one is its own render pass.
5. Large collections rendered eagerly instead of lazily.

Profile on the lowest-spec Apple silicon Mac the product supports, with an
external display attached. Backdrop-sampling cost scales with the sampled region,
so a large external display is the honest test.

## Previews

Name every preview for the state it shows, and provide realistic fixtures — zero
items, one item, thousands, long strings, missing values, error, permission
denied. A preview with six perfectly sized placeholder rows proves nothing.

Previews are a development tool, not verification. There is no supported headless
path from a preview to an image, and Liquid Glass surfaces do not render
correctly in detached snapshots. Verification means capturing the running app.
