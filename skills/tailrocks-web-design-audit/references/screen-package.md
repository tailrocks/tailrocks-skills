# The screen package and its handoff

Where the artifacts live, what the manifest must say, and how the delivery
pipeline consumes the package. Predictability is the point: every feature,
every repository, the same names in the same places.

## Layout

```text
src/components/screens/<screen>-screen.tsx   # ships: the pure screen component
src/design/fixtures/<screen>.ts              # deterministic per-state fixtures
src/design/registry.tsx                      # screens × states — the enumeration
src/design/MANIFEST.md                       # the human contract
src/routes/design/…                          # guarded design route group
```

No `design/` folder at the repository root, no sidecar HTML, no captured
images: the app renders, the manifest explains, and the frozen baselines —
produced by `tailrocks-web-visual-baseline` once the design is finalized — live
with that skill's suite, not here.

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
- **Revision**: <40-hex Git revision>
- **Component hash**: <screen component path> — SHA-256 <digest>
- **Fixture hash**: <fixture module path> — SHA-256 <digest>
- **Registry hash**: src/design/registry.ts — SHA-256 <digest>
- **Blessed matrix**: <every state> × `light|dark` × <every viewport WxH>
- **Blessed**: <YYYY-MM-DD> by <user> — <one line on what was approved>
```

An unfilled identity, matrix, or `Blessed` row means the screen is a draft: the
routes still render, but no downstream document may cite the design as settled, and
`tailrocks-web-visual-baseline` must refuse to freeze baselines from it.

## Delivery wiring

When the work belongs to a roadmap item:

- The item's `## Screens` subsection keeps its schematic and gains one
  pointer line: `Design: src/design/MANIFEST.md §<Screen name>`. Never
  paste captures or class lists into the item; a copy is a second source
  of truth.
- Work happens on the item's `roadmap/<slug>` branch, and the invocation
  ends in one commit of everything it produced, marked with the
  `Tailrocks-Skill: tailrocks-web-design` trailer — the delivery family's
  one-invocation, one-commit shape extended to the paths this skill owns.
- Blessing before READY: an item whose screens have unblessed design
  routes is still SHAPING ground — say so rather than letting a draft
  ride into planning.
- After finalization, `tailrocks-web-visual-baseline` freezes the screenshot
  baselines from these routes; planning then cites the manifest section
  and that suite as the screen's observable check.

Outside the roadmap flow the same package and commit convention apply;
only the branch and pointer targets change.
