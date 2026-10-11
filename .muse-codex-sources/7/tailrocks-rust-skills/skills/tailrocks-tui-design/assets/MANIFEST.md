# Screen manifest — <application>

The human half of the design contract. Frames under `golden/` are the pixel
truth; this file carries what a text frame cannot: intent, style roles,
formats, and the blessing record. One section per screen; every slot filled
or explicitly `None` with a reason.

## <Screen name>

- **Purpose**: <one line>
- **Sizes**: reference <WxH>, minimum <WxH>; resize rules: <which region
  flexes, what drops first>
- **States**: default | empty | loading | error — one line each on what it
  shows; precedence for overlaying conditions: <e.g. error > stale, one
  banner at a time>
- **Style roles**:
  | Role | Style |
  |---|---|
  | <panel title> | <BOLD> |
  | <chrome: headers, footer, hints> | <DIM> |
  | <selection> | <REVERSED> |
  | <state glyph: active / done / blocked / failed> | <Cyan / Green / Yellow / Red> |
- **Formats**: <every derived string's pinned format — ages, durations,
  counts, truncation per column>
- **Keys**: <footer content per state; aliases that stay out of the footer>
- **Frames**: <golden file names this section owns>
- **Blessed**: <YYYY-MM-DD> by <user> at revision <full SHA> — registry
  <digest>, view/fixture sources <digest>, frames/style matrix <digest>; <one
  line on what exact screen/state/size/style set was approved>
