# TUI craft

The taste rules for terminal screens. Terminal interfaces fail the same few
ways: web-shaped layouts squeezed into a grid, color as the only signal,
states nobody designed, and text that lies about its width. Each rule below
exists because one of those failures is cheap to prevent at design time and
expensive to unwind after.

## Geometry

- Pin a **reference size** (80×24 unless the product argues otherwise) and a
  **minimum size**. Every screen is designed at both.
- Below minimum, a dedicated too-small screen replaces everything and names
  the actual and required sizes. Truncated chrome at unsupported sizes is
  not a fallback, it is a broken screen.
- Resize is a set of rules, not a set of frames: which region flexes, which
  columns keep absolute offsets, what drops first (footer hints drop before
  data; decoration drops before hints). Pin the rules in the manifest and
  prove them with the minimum-size golden.
- Column x-offsets stay stable across states of the same screen. A table
  whose columns shift when a banner appears reads as a different screen.

## Color and emphasis

- **Named ANSI-16 colors only.** The operator's terminal theme resolves
  them; RGB values fight the theme and lose. This also keeps goldens
  portable across terminals.
- **Never color as the only signal.** Every state pairs a glyph with a word
  (`● active`, `✗ failed`); selection carries a marker or reversal, not a
  hue. The frame must read identically in monochrome — text goldens enforce
  this by construction, so treat any meaning that vanishes from the text
  dump as a design defect.
- Emphasis budget: BOLD for titles, DIM for chrome (headers, footers,
  hints), REVERSED for selection. A screen that emphasizes everything
  emphasizes nothing.

## Density and alignment

- Fixed-width numeric formats (`002/003`, not `2/3`) so columns never
  wander between states.
- Every truncating column declares its width and truncation form
  (`9 + …`) in the manifest; truncation invented at implementation time is
  a contract gap.
- Measure display width, not bytes or chars — `…`, `·`, box-drawing, and
  wide glyphs will misalign a byte-counted layout.
- Right-align trailing metadata (ages, paths) against the right edge; gaps
  between columns are two spaces, consistently.

## States

Every screen designs four states or records why one cannot exist:

- **default** — realistic fixture data, not minimal data.
- **empty** — teaches the next action ("start a run with …"), never a bare
  blank panel.
- **loading** — what is known while waiting; where the layout already
  stands so arrival does not reflow.
- **error** — preserves the last good view where one exists, names the
  failing input, and says how to recover. An error state that discards a
  working screen is a data-loss path.

Conditions that overlay states (stale data, degraded connection) declare
their precedence explicitly — exactly one banner at a time, and the frame
for each contested combination pins the winner.

## Keys

- Primary actions are single keys, listed in a DIM footer; aliases exist
  but stay out of the footer.
- Unlisted keys are no-ops, never surprises.
- Footer content is part of the design: it changes per screen and is pinned
  by the goldens like everything else.

## Text

- Fixture strings are realistic: real-length names, a too-long value, a
  unicode value. A design blessed on `foo`/`bar` has not met its layout.
- Derived strings (ages, durations, counts) get their format pinned in the
  manifest — `3s ago`, `41m ago`, integer division — because two competent
  implementations will otherwise format them two ways.
