# Subagent fan-out

A round executes many surfaces, and each one needs its own build, its own
fixtures, and its own long output. Running them in one context means the
fifth surface is judged by an agent whose attention is full of the first
four — and it means one surface's failure narrative colors the next.

Fan out: one agent per surface row, each blind to the others.

## The brief each agent gets

- The surface, and the exact command or interaction that exercises it.
- The bound SHA and the built artifact's path — every agent uses the same
  build, so a difference between two surfaces is a difference in the product,
  not in the compiler flags.
- The configuration or data directory to run against.
- The claims to test: the item's statements about this surface, and any `U#`
  from the feedback round that names it.
- The blessed reference for a visual surface, by path.
- The evidence contract it must return.

And three prohibitions, stated in the brief because agents drift toward
helpfulness: **do not fix anything**, **do not report a verdict you did not
execute**, and **do not soften a defect into a suggestion**.

## The decisions lane

One agent checks the item's recorded decisions against what shipped. Its
brief: the decisions list (the package's `plan/spec/decisions.md`, or the
item's live `## Decisions` when no package exists), the bound SHA, the built
artifacts, and the same three prohibitions. It returns one row per decision:

- `HELD` — the artifact honors the decision, with the evidence: a command
  that exercised the behavior, or `file:line` for a structural choice that
  only inspection can settle.
- `VIOLATED` — the artifact contradicts the decision. This is a blocking
  finding: the user made a choice, nothing re-opened it, and the work broke
  it. Report what the artifact does instead, with evidence.
- `NOT VERIFIABLE` — the round cannot settle it (no environment, decision
  not yet reachable by any shipped surface). Named with what would settle
  it; never silently dropped, because an unchecked decision is how "the
  user decided X" quietly becomes "the build does Y".

A decision the evidence shows violated gets the same refute pass as any
defect before it is reported.

## What an agent returns

The evidence block from `execution-evidence.md`, nothing else. No
recommendations, no root-cause theory beyond what the output shows, no
prioritization — the round orders findings once, at the end, with every
surface visible. An agent that returns prose instead of the contract is re-run
with the contract restated.

## The refute pass

Findings arrive plausible. That is not the same as true, and a round that
reports a defect the code does not have costs more trust than one that misses
a defect.

- Every `DEFECT` gets an independent agent whose brief is to **reproduce it
  from the evidence alone**. Cannot reproduce → the finding is downgraded to
  the observation it actually is, or dropped, and the report says so.
- Every `WORKS` on a surface the user reported broken gets an agent whose
  brief is to **make it fail the way they described**. A clean verdict that
  contradicts a user's report needs more evidence than one that agrees with
  it, because the user was there.
- `--deep` runs several refuters per finding with distinct lenses —
  reproduction, cold start, wrong-data, concurrency — rather than several
  copies of the same attempt. Redundancy catches flakes; diversity catches
  failure modes.

Convergence between two agents is not verification when both ran the same
command in the same environment. When two independent verdicts agree, check
that they had independent reasons.

## Ordering the findings

Once, at the end, with everything visible:

1. **Blocking** — the surface cannot be used at all: it panics, hangs,
   produces nothing, or produces something actively wrong.
2. **Decision violations** — the artifact contradicts a recorded decision.
   Blocking in effect, reported on their own because they are ground the
   user settled, not behavior that broke.
3. **Contract drift** — it runs, and it is not what was blessed or specified.
4. **Proof defects** — criteria and gates that certified rows they never
   exercised.
5. **What holds up** — named explicitly, because a report that lists only
   failures reads as a verdict on the whole delivery, and the parts that work
   are what the next round must not break.

Then the recommended order, which is not the same as severity: a defect whose
fix is a precondition for three others goes first even when one of the three
is worse. Say which item gates which.
