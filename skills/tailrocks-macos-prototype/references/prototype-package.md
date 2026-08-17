# The prototype package

One package per feature, one layout everywhere. The prototype is a small
SwiftPM executable that renders the approved design's scenarios and
nothing else — no persistence, no networking, no real data.

## Layout

```text
Design/Prototypes/<Feature>/
├── Package.swift                  # executable, current macOS platform
├── Sources/<Feature>Proto/
│   ├── ProtoMain.swift            # the launch-contract harness (from templates)
│   ├── Fixtures.swift             # scenarios from the design's fixtures
│   └── <views>.swift              # the view layer — production code
├── Regions.md                     # region → class → match mode → budget
├── captures/                      # visual-qa harness output + metadata
└── SIGNOFF.md                     # blessing record + design revisions
```

`Design/` is the same package root the design-file handoff uses; the
prototype sits beside those artifacts as the runnable member of the set.
Scaffold the package with `tailrocks-swift-project-setup`'s baseline so
toolchain, format, and lint gates match the repository; never build from a
temporary directory — windows die within seconds and captures lie.

## The view layer is production code

Everything outside `ProtoMain.swift` and `Fixtures.swift` is written to
lift verbatim into the real app: view structs over view-model shapes,
accessibility identifiers on every driveable element, the component map's
classifications respected exactly — standard components for `NATIVE`
regions, the written contract for every `CUSTOM` region. Follow
`tailrocks-swift-best-practices` for the code and `tailrocks-liquid-glass`
for every material decision; the prototype is the first consumer of both,
not an exception to them.

Two consequences worth holding:

- **The prototype is committed and stays.** Discarding it after capture —
  the pre-standardization habit — forfeits the view layer, the launch
  contract, and the ability to ever re-capture the baseline. It is deleted
  only when the feature it proved is deleted.
- **Divergence found while building is a design finding.** When the
  material, a component's real behavior, or a fixture contradicts the
  approved artifacts, the prototype does not quietly decide: the finding
  goes back to `tailrocks-macos-design` (or the material owner), and the
  prototype follows the corrected design.

## SIGNOFF.md — the blessing record

```markdown
# <Feature> prototype sign-off

- **Design inputs**: <each consumed artifact with path and revision/date>
- **Scenarios**: <name — one line each; which matrix cells were captured>
- **Environment**: <macOS build, SDK, display scale, backdrop>
- **Covered by visual-qa lane**: <real-settings states run there, or none yet>
- **Not proven by captures**: <hover, motion, VoiceOver, … — routed where>
- **Blessed**: <YYYY-MM-DD> by <user> — <one line on what was approved>
```

An unfilled `Blessed` row means draft: the captures bind nobody, and no
downstream document may cite the prototype as settled design. After
sign-off, `captures/` is the implementation's baseline; changing it means
re-capturing under a recorded re-blessing, never editing images or
metadata in place.

## Delivery wiring

When the work belongs to a roadmap item: the item's `## Screens` section
gains `Design: Design/Prototypes/<Feature>/SIGNOFF.md` pointer lines, the
work lands on the item's `roadmap/<slug>` branch, and the invocation ends
in one commit marked `Tailrocks-Skill: tailrocks-macos-prototype` — the
delivery family's one-invocation, one-commit shape extended to the paths
this skill owns. Blessing before READY: unblessed captures are SHAPING
ground, and the item says so.
