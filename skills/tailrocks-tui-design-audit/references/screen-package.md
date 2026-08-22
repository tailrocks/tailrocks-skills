# The screen package and its handoff

Where the artifacts live, what the manifest must say, and how the delivery
pipeline consumes the package. Predictability is the point: every feature,
every repository, the same names in the same places.

## Layout

Everything lives with the gallery crate — design code, frames, and manifest
travel together and regenerate with one command:

```text
crates/<app>-gallery/
├── golden/<screen>--<state>--<WxH>.txt
├── MANIFEST.md
└── …                     # crate sources per gallery.md
```

The view functions live in the application crate's library (`src/ui/…`),
because they ship. Nothing about the design package lives outside these two
homes — no `design/` folder, no sidecar JSON, no tool scripts.

## MANIFEST.md — the human contract

One section per screen; every slot filled or explicitly `None` with a
reason:

```markdown
## <Screen name>

- **Purpose**: <one line>
- **Sizes**: reference <WxH>, minimum <WxH>; resize rules: <which region
  flexes, what drops first>
- **States**: default | empty | loading | error — one line each on what it
  shows; precedence for overlaying conditions
- **Style roles**: <role → named ANSI-16 color + modifier>, one per row
- **Formats**: <every derived string's pinned format>
- **Keys**: <footer content per state, aliases>
- **Frames**: <golden file names this section owns>
- **Blessed**: <YYYY-MM-DD> by <user> — <one line on what was approved>
```

An unfilled `Blessed` row means the screen is a draft, and a draft is not a
contract: the golden test still runs, but no downstream document may cite
the frames as settled design.

## Delivery wiring

When the work belongs to a roadmap item:

- The item's `## Screens` subsection for each screen keeps its schematic
  and gains one pointer line:
  `Design: crates/<app>-gallery/MANIFEST.md §<Screen name>` — the frames
  are the pixel truth, the item keeps intent. Never paste frames into the
  item; a copy is a second source of truth.
- Work happens on the item's `roadmap/<slug>` branch, and the invocation
  ends in one commit of everything it produced, marked with the
  `Tailrocks-Skill: tailrocks-tui-design` trailer — the same one-invocation,
  one-commit shape the delivery family uses, extended to the gallery and
  view-layer paths this skill owns.
- Planning copies nothing: a plan's screen contract cites the manifest
  section and frame files by path. The golden test is the screen's
  observable check, so a plan's done criteria get "golden test green" for
  free through the repository's test gate.
- Blessing before READY: an item whose screens have unblessed frames is
  still SHAPING ground — say so rather than letting a draft ride into
  planning.

Outside the roadmap flow the same package and commit convention apply; only
the branch and pointer targets change.
