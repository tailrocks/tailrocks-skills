# Principles and evidence

## Operating principles

1. Decide whether a state is correct before considering
   implementation difficulty. Effort-based labels never redefine
   known wrongness.
2. For a real defect, find the condition that permitted
   occurrence and escape. Prefer a correction that removes the
   bounded class over a local workaround.

Architecture is not the predetermined cause. Process,
deployment, dependencies, operations, requirements, hardware,
and multi-component interaction can all contribute. Preserve
multiple evidenced causes. Explain why prevention or detection
did not stop them.

## Correctness constraints

Authorization, compatibility promises, safety, data integrity,
external ownership, legal terms, and demonstrated platform
limits bind. Price, duration, effort, implementation size, ROI,
and sunk cost never select or weaken the destination.
Difficulty is not impossibility.

Contain active harm only through a separately approved,
narrow, reversible measure. Preserve evidence. Name the
deferred enabling condition. Give the containment a removal
trigger. Containment is never complete remediation.

## Correction options

Derive practical correction options from the proven invariant
and the failure evidence. Rank them from local to structural:
a local fix, a boundary fix, and a structural redesign. A
local fix can close the diagnosis when it removes the
evidenced class. Reserve structural redesign for defects whose
enabling condition spans boundaries. Current implementation is
evidence, not a constraint. Unrelated modernization stays out
of scope.

Choose structural correction only when evidence supports every
item below:

- The defect or concrete failed guarantee
- The enabling condition
- The bounded class
- The prevention mechanism
- Feasibility and safety
- The compatibility posture
- The authorization.

Reject machinery for hypothetical unrelated failures.
