# Subagent fan-out

A round executes many surfaces, and each one needs its own
build, its own fixtures, and its own long output. One context
that runs them all judges the fifth surface with attention
full of the first four, and lets one failure narrative color
the next.

Fan out: one agent per surface row, each blind to the others.

## The brief of each agent

- The surface, and the exact command or interaction that
  exercises it.
- The bound SHA and the built artifact path. Every agent uses
  the same build, so a difference between two surfaces is a
  difference in the product, not in the compiler flags.
- The configuration or data directory for the run.
- The authorized target, isolated data, and allowed side
  effects. Production, external, or irreversible effects need
  explicit authorization. Otherwise return `NOT EXECUTED`
  without attempting them.
- The tested claims: the statements of the item about this
  surface, and any `U#` from the feedback round that names
  it.
- The blessed reference for a visual surface, by path.
- The disposable checkout path and the inventory row. The
  agent runs the native tool and returns the execution block
  plus the evidence projection. Handwritten execution facts
  are invalid.

State three prohibitions in the brief, because agents drift
toward helpfulness: **fix nothing**, **report no verdict
without execution**, and **soften no defect into a
suggestion**.

## The decisions lane

One agent checks the recorded decisions of the item against
the shipped result. Its brief holds the decisions list. The
list is the package `plan/spec/decisions.md`, or the live
`## Decisions` of the item when no package exists. It holds
the bound SHA and the built artifacts. It holds the same
three prohibitions. It returns one row per decision:

- `HELD`: the artifact honors the decision, with the
  evidence: a command that exercised the behavior, or
  `file:line` for a structural choice that only inspection
  settles.
- `VIOLATED`: the artifact contradicts the decision. This is
  a blocking finding: the user made a choice, nothing
  re-opened it, and the work broke it. Report the actual
  behavior of the artifact, with evidence.
- `NOT VERIFIABLE`: the round never settles it (no
  environment, or no shipped surface reaches the decision
  yet). Name the sign that settles it. Never drop it
  silently, because an unchecked decision is the path where
  "the user decided X" quietly turns into "the build does Y".

A decision that the evidence shows violated gets the same
refute pass as any defect before reporting.

## The return of an agent

The execution block from `execution-evidence.md`, nothing
else. No recommendations, no root-cause theory beyond the
shown output, no prioritization. The round orders findings
once, at the end, with every surface visible. An agent that
returns prose without executed output leaves its row missing,
and the round never publishes with a missing row.

## The refute pass

Findings arrive plausible. Plausible is not true, and a round
that reports a defect that the code lacks costs more trust
than one that misses a defect.

- Every `DEFECT` gets an independent agent whose brief is to
  **reproduce it from the evidence alone**. No
  reproduction downgrades the finding to its actual
  observation, or drops it, and the report states that fact.
- Every `WORKS` on a surface that the user reported broken
  gets an agent. Its brief is to **make it fail the way
  that the user described**. A clean verdict that
  contradicts a user report needs more evidence than one
  that agrees with it, because the user was there.
- `--deep` runs several refuters per finding with distinct
  lenses: reproduction, cold start, wrong data,
  concurrency. Redundancy catches flakes. Diversity catches
  failure modes.

## Ordering the findings

Once, at the end, with everything visible:

1. **Blocking**: the surface never works at all. It panics,
   hangs, produces nothing, or produces something actively
   wrong.
2. **Decision violations**: the artifact contradicts a
   recorded decision. Blocking in effect, reported apart,
   because they are settled user ground, not broken
   behavior.
3. **Contract drift**: it runs, and it is not the blessed or
   specified result.
4. **Proof defects**: criteria and gates that certified rows
   that they never exercised.
5. **The holding parts**: named explicitly. A report that
   lists only failures reads as a verdict on the whole
   delivery. The working parts are the parts that the next
   round never breaks.

Then the recommended order, never the same as severity. A
defect whose fix gates three others goes first even when one
of the three is worse. State the gating relations.
