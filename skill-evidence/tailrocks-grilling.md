# Skill evidence contract

- Schema: `tailrocks.skill-evidence/v1`
- Skill: `tailrocks-grilling`
- Source SHA: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- Recorded date: `2026-08-22`
- Provenance: `fresh no-guidance control run plus user-confirmed invocation requirement`

## Evidence

- Observed failure: Given “Grill me on adding team synchronization to my existing application before we build it,” the control asked one question, supplied no recommended answer, did not expose the dependency frontier, and gave no completion or confirmation condition.
- Baseline/control: The fresh control answered, “Good. One question at a time. Vague answers get challenged.” It then asked for one workflow sentence and the current pain. The negative control is a complete implementation request with no grill or stress-test intent; the skill must not trigger.
- Required behavior: A model-selected, conversation-only interview asks the whole currently resolvable decision frontier with a recommendation per question, retrieves facts instead of delegating them to the user, recomputes after every round, and never acts before the user confirms shared understanding.
- Acceptance checks: Static validator accepts the MODEL_POLICY tuple and rejects crossed tuples; behavior evals cover normal, dependency, contradiction, early-exit, fact, ownership-boundary, trigger-negative, and no-human cases; generated docs label the skill MODEL_POLICY; runtime invocation probes are deferred to a client-loaded verification session.

## Operational contract

- Inputs: A plan, decision, or idea in conversation or a readable artifact, plus a live user who explicitly asks to be grilled, interrogated, challenged, or stress-tested before action.
- Preconditions: The subject is identifiable, user-owned decisions remain open, and execution has not started under this skill.
- Output and destination: Numbered conversation rounds followed by a concise settled-decision map that the user explicitly confirms; no repository artifact.
- Postconditions: The frontier is empty, every question carried a recommendation, no dependent question was asked early, lookupable facts were not delegated to the user, and no implementation occurred.
- Failure branches: Ask one intake question when the subject is missing; hold fact-dependent branches when a fact is unavailable; show the unresolved frontier when the user exits; route roadmap shaping/readiness and medium-specific design work to their owners; refuse self-decided product choices or execution.
- Authority: Read repository and documentation evidence and dispatch read-only investigators. No writes, status changes, commits, pushes, external messages, or implementation.
- Side effects: Read-only filesystem, process, and network inspection only.
- Retry limits: One alternate source for each failed fact lookup; then mark the fact unavailable and keep dependent decisions blocked.
- Recovery: Nothing to roll back. After interruption, reconstruct settled and open decisions, ask the user to validate that state, then resume.
- Idempotency: Reinvocation preserves settled decisions and reopens them only when inputs changed or answers conflict.
- Secret handling: Avoid reading secret values; never place them in prompts, output, logs, or artifacts; cite location and type only.
