# Audit lanes

Twelve parallel lanes, each a subagent scoped to one question over the
same target (whole repository, branch diff, or a single named category).
This mirrors `tailrocks-review-pr`'s stack-lane dispatch and adversarial
verify — the same fan-out-then-verify shape, aimed at a cold repository
instead of a diff.

## Lanes

- **Correctness** — logic errors, off-by-ones, unhandled edge cases,
  contract violations against the house stack skills' own rules.
- **Security** — trust-boundary gaps, missing authorization, injection
  surfaces, secret handling. Cite location and type only, never the value.
- **Performance** — algorithmic complexity, N+1 patterns, unnecessary
  allocation or I/O on hot paths.
- **Test coverage** — untested branches, missing edge cases, tests that
  assert nothing discriminating.
- **Tech debt** — duplication that has already drifted, dead
  configuration, structural rot the house-quality skills would flag.
- **Dependencies and migrations** — stale pins, deprecated APIs, majors
  behind the house "latest stable" rule.
- **DX** — friction in the repository's own build/test/lint loop, missing
  or misleading `AGENTS.md` coverage.
- **Docs** — stale or missing documentation against current behavior.
- **Direction** — feature or roadmap suggestions. Every one must cite
  repository evidence (a gap, a half-built path, a TODO, a pattern used
  once and never finished) — an idea with no evidence behind it is not a
  finding, it is idea-slop, and gets dropped in verification.
- **UX** — usability defects in screens the repository already ships
  (existing routes, existing components). It never proposes new screen
  designs and never overrides a blessed pattern — a candidate that
  contradicts a blessed design is not a finding, it is routed to
  `tailrocks-web-design` to re-bless or reject. The lane has two halves
  with two different skip conditions:
  - **Objective defects** — broken flows, unreachable or missing states,
    inconsistent interaction, accessibility gaps. These need no blessing
    to judge and **run in any repository that ships a UI at all**. Skip
    only when there is no UI.
  - **Blessed-pattern conformance** — what shipped measured against taste
    `tailrocks-web-design` already blessed. Skip this half in a
    repository with no blessed web screens, and say so.
- **Terminal UI** — screens in a ratatui application, judged against the
  golden frames `tailrocks-tui-design` blessed. Same split as the UX
  lane: frame drift against a blessed golden runs only where goldens
  exist; unreachable states, unhandled resize, and key bindings a user
  cannot discover run wherever the repository ships a terminal UI. Skip
  in a repository with no terminal UI.
- **Liquid Glass** — native macOS chrome and material misuse. This lane
  carries no taste of its own: its judgment source is `tailrocks-macos-design`'s
  `review` mode rubric and `tailrocks-liquid-glass`'s acceptance gate,
  invoked directly rather than re-derived, so exactly one skill still owns
  the aesthetic call. Candidates are rubric hard-failures and gate
  violations found against shipped native screens, not fresh taste
  judgment. Skip this lane in a repository with no native macOS surface.
- **Agent legibility** — how safely an agent, not a human, can navigate
  and extend this codebase cold. Two obligations, each load-bearing:
  - **Cold-read navigability** — file and function sizes that blow a
    fresh-context read, names that do not survive a cold grep, missing or
    stale `AGENTS.md` coverage for a directory with conventions of its
    own.
  - **House-stack conformance** — any language, framework, package
    manager, tool, **or protocol and layering role** in use outside the
    stack this repository has decided on. Not just stray artifacts: a
    public REST API where the doctrine says GraphQL, a second protocol
    between services where it says gRPC, or business logic living in the
    UI layer where it says the UI is a thin shell over a Rust-owned core
    are all findings for this lane, and none of them is a stray
    dependency. **The baseline is the repository's own decisions, never
    this skill's preferences:** read its instruction files
    (`AGENTS.md`/`CLAUDE.md` at every level), its lockfiles and
    `mise.toml`/equivalent, and its ADRs. A stack the repository has
    genuinely decided on is not a finding no matter what it is; a
    deviation from a stack it *did* decide on is one even when the
    deviation is individually reasonable, because the failure mode is an
    agent copying the wrong pattern from it.

  Distinct from tech debt (structural rot) and from the best-practices
  skills (per-language idiom correctness) — this lane is about
  discoverability and surface restriction, not correctness.

`quick` mode runs correctness, security, and tech debt only, and each lane
stops at its first pass over obvious hotspots rather than exhaustively
walking every package. `--deep` composes as a depth modifier over any other
mode or named lane — `security --deep`, `liquid-glass --deep`, plain
`--deep` —
running every applicable lane over every package with no early cutoff; it
is never a standalone alternative to a category. A single named category
runs only that lane. `branch` mode scopes every lane's target to the
branch diff against its merge base and also composes with `--deep` and a
named category.

## Candidate shape

Every candidate a lane returns carries: `file:line` evidence, one-sentence
impact, an effort size (S/M/L), and a confidence level (HIGH/MEDIUM/LOW).
A lane returning a candidate with no evidence is a defect in the lane's
run, not a finding — drop it before it reaches verification.

## Verify by re-reading

Lanes over-report; do not trust a lane's own confidence. Before any
candidate reaches the prioritized table, the orchestrator (not the lane
subagent) re-opens the cited file and line itself: confirm the code says
what the candidate claims, confirm the attribution (right file, right
function, right condition), and drop anything that does not hold on
re-read. A direction finding is verified by confirming the cited evidence
actually shows the gap claimed, and that no intent document already
decided against it.

Record every drop with a one-line reason. A rejected finding gets that
reason logged where the next audit run will see it — the roadmap index's
Log, or the item's own Log when one already exists — so the same
rejected idea does not resurface next run without new evidence.

## Prioritization

Leverage = impact ÷ effort, weighted by confidence (a HIGH-confidence
medium-impact finding outranks a LOW-confidence high-impact one). Sort
descending into the reported table; direction findings get their own
table, sorted the same way but never merged with defect findings — a
feature suggestion and a bug are not comparable on the same axis.
