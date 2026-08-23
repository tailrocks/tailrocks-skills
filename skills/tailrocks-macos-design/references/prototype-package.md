# The prototype package

One package per feature, one layout everywhere. The prototype is a small
SwiftPM executable that renders the approved design's scenarios and
nothing else — no persistence, no networking, no real data.

## The four laws

**No screenshots during design.** The prototype is reviewed **running** — the
user launches it, or the agent drives its scenarios in front of them — and
judges the real material live. Screenshots are frozen only after finalization,
by `tailrocks-macos-visual-baseline` driving this prototype through its launch
contract; asked for captures mid-iteration, decline and name the boundary.
Captures taken mid-iteration are churn re-shot on every tweak, and picking
between directions is the design stage's structural alternatives, never a
screenshot comparison here.

**The standard-harness law: never rebuild verification machinery the house
already ships.** Capture runs through the repository's typed macOS visual harness
(window-ID resolution, the atomic kill-launch-capture loop, its diff protocol
and state matrix); the prototype's contribution is being drivable. A bespoke
capture loop, pixel-diff tool, or private manifest shape splits the repository
into two verification stacks that cannot read each other's baselines.

**The fixed launch contract.** Every prototype answers the same arguments —
`--tr-scenario`, `--tr-appearance`, `--tr-window`, `--tr-reduce`,
`--tr-backdrop`, semantics in `launch-contract.md` — and the real app ships
the same contract debug-only. Per-feature names are the convergence failure
this law exists to stop: no two runs converge, and nothing downstream can
drive the app. `--tr-reduce` previews a reduction substitution per process
through the app's own accessibility hooks — legitimate alongside the
visual-qa real-settings matrix, never a substitute for it.

**The blessing gate.** First obtain an independent acceptance `PASS` from
`tailrocks-macos-design-review` against a named live-render session for this
exact prototype revision; static or frozen evidence cannot supply that verdict.
Then the user signs off the same running prototype; the agent never does. The
user walks every scenario, both appearances, the declared sizes — live — and
the sign-off is recorded in `SIGNOFF.md` with its date and the design artifacts'
revision. Until then the prototype is a draft that binds nobody, and a run that
ends without one says so with the Blessed row pending. Only after both gates may
`tailrocks-macos-visual-baseline` capture and freeze its bounded output.

## The six steps

1. **Verify the inputs.** An approved design — brief, component map with every
   region classified, contracts for every `CUSTOM` region, concrete fixtures —
   is the precondition; a missing or unapproved input routes back to the
   design stage. Name every consumed artifact with its revision.
2. **Build the package** per the layout below on
   `tailrocks-swift-project-setup`'s baseline, copying
   `templates/ProtoMain.swift`. Complete when the package builds and every
   fixture scenario renders through the contract.
3. **Review live and iterate** per scenario, both appearances, the declared
   sizes, adjusting within the approved design until the blessing gate is
   met — or end the run stating the prototype is a draft awaiting sign-off.
4. **Bind the regions.** Read `match-policy.md` and derive `Regions.md` from
   the component map: every region names its class, match mode, and budget;
   native regions verify structurally through the accessibility tree, never
   pixel-gated; content and custom regions are pixel-budgeted; glass compares
   only under an identical backdrop. A whole-window zero-pixel diff across two
   binaries is not an acceptance gate: same-binary determinism does not
   transfer. Complete when every visible region has a machine-executable mode.
5. **Hand off to capture.** After finalization, `tailrocks-macos-visual-baseline`
   drives this prototype and freezes the baseline; name what remains for that
   lane — the capture matrix and the real-settings states.
6. **Relocate, never delete.** Once the baseline is frozen, the feature PR
   that ships the real implementation moves the prototype package out of its
   diff — a reference branch or a standing prototypes home the repository
   already excludes from production builds. Deleting it forfeits the only
   source the frozen baseline can be regenerated from and forces the next
   design change to rebuild the prototype from nothing; a prototype package
   inside the shipped feature's diff is a defect to report, not a detail to
   note. Complete when the diff carries no prototype files and the new home is
   named — or a named user exception records why it stays.

## Layout

```text
Design/Prototypes/<Feature>/
├── Package.swift                  # executable, current macOS platform
├── Sources/<Feature>Proto/
│   ├── ProtoMain.swift            # the launch-contract harness (from templates)
│   ├── Fixtures.swift             # scenarios from the design's fixtures
│   └── <views>.swift              # the view layer — production code
├── Regions.md                     # region → class → match mode → budget
└── SIGNOFF.md                     # blessing record + design revisions

No captures live here during design: the baseline is frozen after
finalization by `tailrocks-macos-visual-baseline`, driving this package through
the launch contract, and lands where the baseline owner keeps
its baselines.
```

`Design/` is the package root `tailrocks-macos-design` writes its artifacts
into; the prototype sits beside them as the runnable member of the set —
the design documents describe the screen, the prototype is the screen.
Scaffold the package with `tailrocks-swift-project-setup`'s baseline so
toolchain, format, and lint gates match the repository; never build from a
temporary directory — windows die within seconds and captures lie.

## The view layer is production code

Everything outside `ProtoMain.swift` and `Fixtures.swift` is written to
lift verbatim into the real app: view structs over view-model shapes,
accessibility identifiers on every driveable element, the component map's
classifications respected exactly — standard components for `NATIVE`
regions, the written contract for every `CUSTOM` region. Follow
`tailrocks-swift-best-practices` for the code and this skill's material
authority for every material decision; the prototype is the first consumer of both,
not an exception to them.

Two consequences worth holding:

- **The prototype is committed and stays.** Discarding it after capture —
  the pre-standardization habit — forfeits the view layer, the launch
  contract, and the ability to ever re-capture the baseline. It is deleted
  only when the feature it proved is deleted.
- **Divergence found while building is a design finding.** When the
  material, a component's real behavior, or a fixture contradicts the
  approved artifacts, the prototype does not quietly decide: the finding
  goes back to the design stage (or the material rules), and the
  prototype follows the corrected design.

## SIGNOFF.md — the blessing record

```markdown
# <Feature> prototype sign-off

- **Design inputs**: <each consumed artifact with path and revision/date>
- **Scenarios**: <name — one line each; which were walked live, in which
  appearances and sizes>
- **Pending capture lane**: <what tailrocks-macos-visual-baseline freezes after
  finalization — the scenario matrix per Regions.md, plus the
  real-settings states>
- **Not proven live**: <hover under automation, VoiceOver, keyboard
  paths — routed where>
- **Prototype identity**: <Git revision> — <package-tree SHA-256>
- **Acceptance review**: <DesignReview.md path> — SHA-256 <digest> — `PASS`
  by <reviewer> in <live session identity>
- **Blessed**: <YYYY-MM-DD> by <user> — <one line on what was approved,
  reviewed running>
```

An unfilled identity, acceptance-review `PASS`, or `Blessed` row means draft:
the prototype binds nobody, and no downstream document may cite it as settled
design. After sign-off the
design is frozen; a change to the prototype's rendering means a recorded
re-blessing, and any already-frozen baseline is re-captured by the
visual-baseline lane, never edited in place.

## Delivery wiring

When the work belongs to a roadmap item: the item's `## Screens` section
gains `Design: Design/Prototypes/<Feature>/SIGNOFF.md` pointer lines, the
work lands on the item's `roadmap/<slug>` branch, and the invocation ends
in one commit marked `Tailrocks-Skill: tailrocks-macos-design` — the
delivery family's one-invocation, one-commit shape extended to the paths
this skill owns. Blessing before READY: an unblessed prototype is SHAPING
ground, and the item says so.
