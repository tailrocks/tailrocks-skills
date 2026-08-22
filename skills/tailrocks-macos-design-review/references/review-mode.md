# Review mode

A `review` is read-only and never confers mutation permission. What it runs
depends on the subject.

## A screen or window

Stage 4's rubric and its full review shape, run against the rendered evidence.

## A prototype package

Conformance to this skill, not taste:

- The fixed launch contract answered — `--tr-scenario`, `--tr-appearance`,
  `--tr-window`, `--tr-reduce`, `--tr-backdrop` — with no per-feature renames.
- `Regions.md` with every visible region classified and no pixel-gated native
  region.
- A `SIGNOFF.md` naming the user and the date; a claimed blessing without
  either is a finding.
- No bespoke capture loop, private pixel-diff tool, or private manifest shape.
- A per-process `--tr-reduce` preview is legitimate alongside the visual-qa
  real-settings lane; do not flag it.

## A glass surface or an existing app's chrome

Inventory every supplied artifact before writing findings; configuration files
such as `project.yml` establish the deployment target. Report these named
checks separately so none can disappear inside prose:

- **Layer** — classify every screen region as `CONTENT` or `FUNCTIONAL`.
- **Mechanics** — modifier order as its own row (`glassEffect` before padding
  is a violation), plus container batching, corner concentricity, and tint
  count.
- **Availability** — every used symbol against the declared deployment target,
  naming whether a guard is required.
- **Anti-patterns** — every custom surface against every entry in
  `anti-patterns.md`, including the performance framing.
- **Mechanism** — for every violation, the mechanism stated separately from
  the violated rule.

Then run the glass acceptance gate in `verification.md`. A glass surface that
has not been rendered under Reduce Transparency, Increase Contrast, the Liquid
Glass appearance setting, and an inactive window has not been verified —
system components substitute opaque treatments under those settings
automatically and hand-rolled surfaces do not; `tailrocks-macos-visual-qa`
owns this running-app capture mechanism.

**Complete when:** every custom glass surface has the per-surface record from
`verification.md`: justification, container, shape, availability guard,
variant choice (with a reason for `clear`), Reduce Transparency and Reduce
Motion substitutions, and a pass or specific blocker on every gate row.
