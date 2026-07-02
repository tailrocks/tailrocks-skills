# Research Playbook

How to run the deep research pass: fan out across modalities, hold a strict
evidence standard, and converge until every load-bearing unknown is small. Used
by the `research` skill after a direction is confirmed.

## Evidence standard

A claim is only usable with a source:

- **Web / external** → a URL to a primary source (official docs, the library's
  repo, a spec, a paper). Secondary blogs are a lead to verify, not a source.
- **Codebase** → a `file:line`. "The auth middleware validates the token" →
  `src/mw/auth.ts:42`.
- **Numbers** (size, latency, counts) → the method that produced them ("measured
  with `hyperfine` on commit abc123", "counted `rg -c`").

Unsourced assertions do not go into `research/` files or plans. If you cannot
source it, mark it an **open unknown** and either research it or scope it out.

## Modalities — fan out, don't serialize

Dispatch independent subagents so coverage compounds and no single pass is the
bottleneck. Give each a distinct question and blind it to the others:

- **Primary-source / web** — the exact APIs, versions, config, and gotchas of any
  external library, service, or protocol the direction depends on. Prefer the
  latest stable docs; note version-specific behavior.
- **Codebase evidence** — the real integration seams: where this plugs in, the
  conventions to match, the types and functions to reuse, the tests that pin
  current behavior. Every claim a `file:line`.
- **Prior art / reference implementations** — how comparable features are built
  here or in well-regarded projects; what to copy, what to avoid, and why.
- **Constraints & failure modes** — invariants the direction must not break,
  migration ordering, backward-compat surfaces, error and edge-case behavior.

Brief each subagent with: the confirmed direction, the specific question, the
evidence standard above, and "return findings with sources only — no
recommendations".

## Effort levels

- **Standard** (default) — one fan-out round across the modalities, then
  synthesize.
- **`--deep`** — after the first round, run a **completeness critic**: a fresh
  subagent asks "what is still unverified, unread, or assumed?" Its output is the
  next round's questions. Repeat until a round surfaces nothing load-bearing
  (or two rounds add nothing new). Reslice any unknown still too big to plan
  around into a smaller, answerable question.

## Synthesize

- Write `research/00-summary.md` first: the headline conclusions the plan will
  rest on, each linking to the chapter that backs it, plus a short "decisions
  made" list and any remaining open unknowns.
- Write `research/NN-<topic>.md` chapters: the evidence, organized by question,
  every claim sourced. Keep raw enough that a reviewer can re-verify without
  redoing the search.
- Reconcile contradictions between subagents by opening the cited sources
  yourself — do not average two guesses.

## Hand to planning

Research is done when the summary answers every question from step 2 of the
workflow, every claim is sourced, and the remaining unknowns are explicitly
scoped out (not silently dropped). Only then present the implementation shape for
the human confirm gate, and write the plans.

## Token discipline

- Match fan-out and depth to the direction's size; a small, well-scoped direction
  may need one subagent or none.
- Files cite sources; they never copy code. No chapter for a subagent that found
  nothing load-bearing.
- Default to `00-summary.md` only; add chapters when the evidence is voluminous or
  `--deep` is set. The plan, not the research, is where anything gets inlined.

## Common mistakes

- Recommending before the evidence is in — gather first, decide at synthesis.
- A secondary blog treated as a primary source.
- A local number with no method stamp.
- Dropping an inconvenient unknown instead of scoping it out loud.
- Writing the plan before the human confirms the direction and shape.
