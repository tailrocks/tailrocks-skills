# The screen package and its handoff

Where the artifacts live, what the manifest must say, and how the delivery
pipeline consumes the package. Predictability is the point: every feature,
every repository, the same names in the same places.

## Layout

```text
src/components/screens/<screen>-screen.tsx   # ships: the pure screen component
src/design/fixtures/<screen>.ts              # deterministic per-state fixtures
src/design/registry.ts                       # screens × states — the enumeration
src/routes/design/…                          # guarded design route group
tests/visual/<screen>.spec.ts                # the capture matrix
tests/visual/…-snapshots/                    # committed baselines
tests/visual/MANIFEST.md                     # the human contract
```

No `design/` folder at the repository root, no sidecar HTML, no tool
scripts: the app renders, Playwright freezes, the manifest explains.

## MANIFEST.md — the human contract

One section per screen; every slot filled or explicitly `None` with a
reason:

```markdown
## <Screen name>

- **Purpose**: <one line>
- **Route**: /design/<screen>; ships at <real route once implemented>
- **States**: default | empty | loading | error — one line each;
  precedence for overlapping conditions
- **Viewports**: <desktop WxH>, <mobile WxH>; responsive rules: <what
  stacks, what collapses, what drops>
- **Components**: <installed components composed; any custom region with
  the alternatives evaluated>
- **Copy**: <where the blessed strings live — the fixture module>
- **Masks & budgets**: <masked regions with reasons; any budget above the
  default with its reason — None when clean>
- **Environment**: <browser + version, OS family the baselines bind to>
- **Baselines**: <snapshot file names this section owns>
- **Blessed**: <YYYY-MM-DD> by <user> — <one line on what was approved>
```

An unfilled `Blessed` row means the screen is a draft: the suite still
runs, but no downstream document may cite the baselines as settled design.

## Delivery wiring

When the work belongs to a roadmap item:

- The item's `## Screens` subsection keeps its schematic and gains one
  pointer line: `Design: tests/visual/MANIFEST.md §<Screen name>`. Never
  paste captures or class lists into the item; a copy is a second source
  of truth.
- Work happens on the item's `roadmap/<slug>` branch, and the invocation
  ends in one commit of everything it produced, marked with the
  `Tailrocks-Skill: tailrocks-web-design` trailer — the delivery family's
  one-invocation, one-commit shape extended to the paths this skill owns.
- Planning copies nothing: a plan's screen contract cites the manifest
  section and baseline files by path, and the visual suite is the screen's
  observable check in the plan's done criteria.
- Blessing before READY: an item whose screens have unblessed baselines is
  still SHAPING ground — say so rather than letting a draft ride into
  planning.

Outside the roadmap flow the same package and commit convention apply;
only the branch and pointer targets change.
