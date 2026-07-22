# Principles and Evidence

## Provenance

This skill is a paraphrased and calibrated adaptation of `johnsoncodehk`'s
[`CLAUDE.shareable.md`](https://gist.github.com/johnsoncodehk/6f6b9892936f335e491e92b65646fbea),
last inspected 2026-07-12. The gist provides no license for verbatim
redistribution, so this repository preserves the ideas and attribution without
copying its text.

The gist proposes two linked operating principles:

1. Judge whether a known state is correct before considering implementation
   difficulty; do not use effort-based labels to redefine known wrongness.
2. For a real bug, ask what condition permitted the failure class and prefer a
   correction that removes that condition over a local workaround.

## What this skill preserves

- Correctness and feasibility are different questions.
- Price, duration, effort, implementation size, and sunk investment do not
  determine the correct end state.
- Difficulty is not proof of impossibility.
- The immediate failing line is often not a sufficient causal explanation.
- A real escaped defect justifies investigating the broader enabling condition.
- A symptom patch must not conceal a deferred structural cause.
- Structural correction is reactive to evidence, not permission for speculative
  generalization.

## What this skill calibrates

### Architecture is not the only cause

Failures can involve software design, development process, complex system
behavior, deployment planning, networks, hardware, dependencies, operations, or
ambiguous requirements. Google SRE's incident analysis reports several distinct
trigger and contributing-cause categories rather than treating every failure as
one architectural cause:

- <https://sre.google/workbook/postmortem-analysis/>
- <https://sre.google/sre-book/postmortem-culture/>

Therefore ask which prevention or detection boundary failed. Architecture is a
frequent answer, not a predetermined one.

### Causes can be multiple

Google's postmortem guidance seeks all contributing causes and preventive
actions. Avoid a monocausal story selected merely because it is simple. The
causal chain must explain occurrence and why existing checks did not stop or
detect it.

### Structural relationships are evidence-driven

SEI research documents that defects in large systems can be architecturally
connected and that correcting a design source can prevent recurrence across
multiple files. It does not imply that every isolated defect requires a broad
refactor:

- <https://insights.sei.cmu.edu/blog/a-case-study-in-locating-the-architectural-roots-of-technical-debt/>
- <https://insights.sei.cmu.edu/blog/early-software-vulnerability-detection-with-technical-debt/>

Require evidence of the connection and bound the class before restructuring.

### Containment can precede full diagnosis

For active compromise or continuing harm, CISA incident-response guidance puts
containment, evidence preservation, eradication, and recovery into an ordered
response. A reversible guard, rollback, isolation step, or feature disable may
be correct immediate containment even though it does not remove the root cause:

- <https://www.cisa.gov/sites/default/files/publications/Cybersecurity_Incident_Vulnerability_Response_Playbooks_508C.pdf>

Name containment honestly and continue structural remediation after the system
is safe.

### Price and time do not select the destination

Authorization, compatibility, safety, external ownership, and explicit user
scope can limit what an agent may change. Price, duration, engineering effort,
implementation size, ROI, and sunk cost cannot. Record the strongest feasible
correct end state. If migration must be sliced to preserve correctness,
compatibility, data, or rollback safety, every slice must retain the same target;
the cheaper intermediate state cannot become the accepted destination.

### Use a greenfield counterfactual

Existing architecture creates anchoring and sunk-cost bias. Re-derive the
affected capability as if implementing it from scratch with today's evidence.
Ask which types, boundaries, ownership rules, state transitions, validation
points, persistence contracts, and lifecycle controls would prevent the defect
class by construction. Use that model as the target even when reaching it
requires a large refactor, migration, or replacement.

The counterfactual is bounded by the proven invariant and defect class. It does
not authorize unrelated modernization or abstractions for hypothetical needs.

## Decision test

Use the structural correction when all are true:

- the defect or inconsistency is proven;
- the enabling condition is evidenced;
- the proposed change prevents the bounded class;
- the change respects authorization, compatibility, and safety;
- the destination is not weakened to reduce price, time, or effort;
- it does not add machinery for hypothetical unrelated failures.

Use temporary containment when active harm requires it or the structural change
is outside the current authorized slice. In either case, state the deferred root
condition and the containment-removal trigger.
