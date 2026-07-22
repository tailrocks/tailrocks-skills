# Principles and Evidence

## Provenance

Paraphrased, calibrated adaptation of `johnsoncodehk`'s
[`CLAUDE.shareable.md`](https://gist.github.com/johnsoncodehk/6f6b9892936f335e491e92b65646fbea),
last inspected 2026-07-12. The gist has no license for verbatim
redistribution, so this repository keeps the ideas and attribution without
its text. Its two linked operating principles:

1. Judge whether a known state is correct before considering implementation
   difficulty; effort-based labels do not redefine known wrongness.
2. For a real bug, ask what condition permitted the failure class and prefer
   a correction that removes that condition over a local workaround.

## What this skill preserves

- Correctness and feasibility are different questions.
- Price, duration, effort, implementation size, and sunk investment do not
  determine the correct end state.
- Difficulty is not proof of impossibility.
- The immediate failing line is often not a sufficient causal explanation.
- A real escaped defect justifies investigating the broader enabling
  condition.
- A symptom patch must not conceal a deferred structural cause.
- Structural correction is reactive to evidence, not permission for
  speculative generalization.

## What this skill calibrates

### Architecture is not the only cause

Failures also arise from process, complex system behavior, deployment,
networks, hardware, dependencies, operations, and ambiguous requirements.
Google SRE incident analysis reports multiple distinct trigger and
contributing-cause categories, not one architectural cause:

- <https://sre.google/workbook/postmortem-analysis/>
- <https://sre.google/sre-book/postmortem-culture/>

Ask which prevention or detection boundary failed. Architecture is a frequent
answer, not a predetermined one.

### Causes can be multiple

Google's postmortem guidance seeks all contributing causes and preventive
actions. Reject a monocausal story chosen for simplicity; the chain must
explain occurrence and why existing checks did not stop or detect it.

### Structural relationships are evidence-driven

SEI research shows defects in large systems can be architecturally connected
and that correcting a design source can prevent recurrence across files. It
does not imply every isolated defect requires a broad refactor:

- <https://insights.sei.cmu.edu/blog/a-case-study-in-locating-the-architectural-roots-of-technical-debt/>
- <https://insights.sei.cmu.edu/blog/early-software-vulnerability-detection-with-technical-debt/>

Require evidence of the connection and bound the class before restructuring.

### Containment can precede full diagnosis

For active compromise or continuing harm, CISA incident-response guidance
orders containment, evidence preservation, eradication, and recovery. A
reversible guard, rollback, isolation step, or feature disable can be correct
immediate containment without removing the root cause:

- <https://www.cisa.gov/sites/default/files/publications/Cybersecurity_Incident_Vulnerability_Response_Playbooks_508C.pdf>

Name containment honestly; continue structural remediation once the system is
safe.

### Price and time do not select the destination

Authorization, compatibility, safety, external ownership, and explicit user
scope can limit what an agent may change. Price, duration, engineering
effort, implementation size, ROI, and sunk cost cannot. Record the strongest
feasible correct end state. If migration must be sliced to preserve
correctness, compatibility, data, or rollback safety, every slice keeps the
same target; a cheaper intermediate state never becomes the accepted
destination.

### Use a greenfield counterfactual

Existing architecture creates anchoring and sunk-cost bias. Re-derive the
affected capability from scratch with today's evidence: which types,
boundaries, ownership rules, state transitions, validation points,
persistence contracts, and lifecycle controls prevent the defect class by
construction. That model is the target even when reaching it requires a
large refactor, migration, or replacement. The counterfactual is bounded by
the proven invariant and defect class — no unrelated modernization, no
abstractions for hypothetical needs.

## Decision test

Use the structural correction when all are true:

- the defect or inconsistency is proven;
- the enabling condition is evidenced;
- the proposed change prevents the bounded class;
- the change respects authorization, compatibility, and safety;
- the destination is not weakened to reduce price, time, or effort;
- it does not add machinery for hypothetical unrelated failures.

Use temporary containment when active harm requires it or the structural
change is outside the current authorized slice. Either way, state the
deferred root condition and the containment-removal trigger.
