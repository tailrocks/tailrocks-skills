# Principles and Evidence

## Operating principles

1. Decide whether a state is correct before considering implementation
   difficulty. Effort-based labels never redefine known wrongness.
2. For a real defect, find the condition that permitted occurrence and escape;
   prefer a correction that removes the bounded class over a local workaround.

Architecture is not the predetermined cause. Process, deployment, dependencies,
operations, requirements, hardware, and multi-component interaction can all
contribute. Preserve multiple evidenced causes and explain why prevention or
detection did not stop them.

## Correctness constraints

Authorization, compatibility promises, safety, data integrity, external
ownership, legal terms, and demonstrated platform limits bind. Price, duration,
effort, implementation size, ROI, and sunk cost do not select or weaken the
destination. Difficulty is not impossibility.

Contain active harm only through a separately approved, narrow, reversible
measure. Preserve evidence, name the deferred enabling condition, and give the
containment a removal trigger. Containment is never complete remediation.

## Greenfield counterfactual

Re-derive the affected capability from the proven invariant and failure
evidence. Decide ownership, validation, state, API, persistence, concurrency,
and lifecycle boundaries that make the class unrepresentable or reject it at
one mechanical boundary. Current implementation is evidence, not a constraint;
unrelated modernization remains out of scope.

Choose structural correction only when the defect or concrete failed guarantee,
enabling condition, bounded class, prevention mechanism, feasibility, safety,
compatibility posture, and authorization are evidenced. Reject machinery for
hypothetical unrelated failures.
