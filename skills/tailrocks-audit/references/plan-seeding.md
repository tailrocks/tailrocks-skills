# Plan seeding

A selected finding becomes exactly one of two artifacts. Never a third,
parallel format — everything downstream (`tailrocks-brainstorm`,
`tailrocks-finalize`, `tailrocks-plan`, `tailrocks-reconcile`, `/goal`)
only understands `roadmap/<slug>/README.md` items and `plans/<slug>/`
packages.

## The size test

Seed directly into a `plans/<slug>/` package, skipping the roadmap
pipeline entirely, only when **all** of the following hold:

- The finding fits one fresh executor session — no vertical slicing
  needed.
- Effort is S or M and confidence is HIGH.
- Nothing about the fix requires a product decision — it is purely
  mechanical (a bug fix, a dependency bump, a coverage gap, a doc
  correction). Anything that changes user-facing behavior or trades one
  approach against another goes through shaping instead, even at S effort.
- The finding's evidence is enough to write the plan's Starting-state
  excerpts without further research.

Everything else — L effort, any confidence below HIGH, anything with an
open product question, and every `direction` finding — becomes a `DRAFT`
`roadmap/<slug>/README.md` item instead. A direction finding always seeds
an item; it always needs the shaping interview to decide whether it is
wanted before anyone plans it.

## Seeding a plan package directly

Follow `tailrocks-plan`'s plan-template reference for the file shape:
exact file paths, current-state code excerpts (from this audit's own
verified evidence — no new research pass needed), the repository's proven
build/test/lint commands as verification gates, an explicit out-of-scope
list, and STOP conditions for drift. Stamp the commit this audit ran
against. Write `plans/<slug>/README.md` (single-row manifest) plus the one
plan file; no coverage ledger or spec is needed for a single mechanical
slice — those exist to reconcile competing requirements, and a
direct-seeded plan has none. Set the roadmap-adjacent status this package
needs (`PLANNED`, ready for `execute` or a manual hand-off) without a
backing roadmap item; `tailrocks-reconcile` treats a package with no
parent item the same as one with a merged, closed-out item.

## Seeding a roadmap item

Derive a content-based slug per `tailrocks-idea`'s naming rule. Fill the
item template with the finding's own evidence instead of leaving it
empty — this is the one legitimate divergence from `tailrocks-idea`'s
"capture only, gaps stay empty" rule, because an audit-sourced item
already has verified evidence behind it, not a bare user statement. Cite
`file:line` in the item body the same way the audit table did. Open the
item's delivery branch and draft PR the same way `tailrocks-idea` does,
committed with the `Tailrocks-Skill: tailrocks-audit` trailer. Name the
next command in the report: `tailrocks-brainstorm <slug>` for most items,
`tailrocks-finalize <slug>` when the audit already answered every open
question.
