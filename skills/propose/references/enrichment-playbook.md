# Enrichment Playbook

How the `propose` skill widens a rough idea into an evidence-backed proposal:
which facets to explore, how to brief parallel subagents, and how to vet what
comes back. The goal is breadth with evidence — surface the directions, risks,
and questions a single pass would miss, without deciding or planning.

## Evidence standard

Same bar as research, lighter depth. Every finding carries a locatable source:

- External claim → a URL.
- Codebase claim → a `file:line`.
- "This already exists / conflicts with X" → the exact file or feature.

"Might be useful", "could be slow", "users probably want" — not findings until
tied to evidence. If it is a hunch, record it as an **open question**, not a
finding.

## Facets — one subagent each, blind to the others

Dispatch independent subagents so each surfaces what the others cannot see. Brief
each with the framed idea, its single facet, the evidence standard, and "return
findings with sources only — do not recommend or plan".

- **Prior art / web** — how this is done elsewhere: libraries, patterns, products,
  standards. What is the canonical approach; what is discredited.
- **Codebase touchpoints** — where this idea would plug into the current repo:
  the modules, types, and seams it touches; what already exists that overlaps or
  conflicts. `file:line` evidence.
- **Constraints & invariants** — rules the idea must respect: architecture
  boundaries, existing contracts, data shapes, platform limits, conventions from
  intent docs (ADRs, `CONTEXT.md`, design docs).
- **Risks & failure modes** — what makes this hard or dangerous: edge cases,
  migration hazards, security or privacy surfaces, performance cliffs.
- **Alternative directions** — two to four genuinely different ways to realize the
  idea, each with its trade-off, so the human chooses from real options rather
  than the first one imagined.
- **Adjacent existing features** — what in the repo is close enough to extend
  instead of building anew (the DRY check: is there a symmetric feature to
  parameterize?).

Scale the facet set to the idea. A small idea inside a known repo may need only
codebase-touchpoints + alternatives; a greenfield idea leans on prior-art +
constraints.

## Vet before writing

- Open every cited source and confirm it says what the finding claims.
- Drop the unverifiable; downgrade hunches to open questions.
- Correct misattributions; dedupe overlapping findings from different subagents.
- Reconcile contradictions by reading the sources yourself, not by averaging.

## Turn findings into candidate directions

- Cluster the findings into two to four **candidate directions** — coherent ways
  forward, each with its trade-off and the findings that support it.
- Extract the **open questions**: the decisions only the human can make (scope,
  priorities, taste, unknowns research must resolve). These are what the human
  answers before `research` runs.

## Token discipline

- Scale the facet set and subagent count to the idea; a small idea in a known repo
  may need one facet done inline, not six subagents.
- Write a `findings/` file only when it changes a decision; fold a few findings
  straight into the README instead.
- Point at sources; never copy large blocks — the readers have the repo.

## Stop here

`propose` does not choose a direction, write steps, or touch source. It hands back
the enriched item — candidate directions + open questions + evidence — for the
human to react to. Planning is the `research` skill's job.
