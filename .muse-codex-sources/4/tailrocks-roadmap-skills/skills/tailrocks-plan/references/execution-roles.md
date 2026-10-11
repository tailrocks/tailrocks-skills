# Execution roles

Select the least-capable route whose eligibility holds for the
exact task shape. Cost never makes a known-wrong route
acceptable.

Every assignment records the role, inputs, output or evidence,
and the escalation taken. Never assign a route that lacks an
eligibility predicate.

## `human-decision`

- **Eligible when:** unresolved user intent, irreversible
  authorization, or a choice that no artifact derives
  remains.
- **Forbidden:** inferring consent, preferences, or an
  irreversible choice.
- **Inputs:** the concrete decision, options, consequences,
  and the evidence that leaves it unresolved.
- **Record:** decision request, answer or deferral,
  authority, and date.
- **Escalate:** immediately when the decision blocks a plan
  or changes scope.
- **Fresh context:** no.

## `frontier-judgment`

- **Eligible when:** architecture or decomposition is
  ambiguous, risk or security needs classification, sources
  conflict, a STOP needs routing, or final semantic
  acceptance is due.
- **Forbidden:** claiming that a mechanical check proves
  semantic fitness, or passing an unresolved decision to a
  bounded executor.
- **Inputs:** relevant artifact excerpts, evidence,
  constraints, and open alternatives.
- **Record:** decision, rationale, cited evidence, unresolved
  risks, and next escalation.
- **Escalate:** to `human-decision` for intent or
  authorization. Otherwise retain ownership until ambiguity
  clears.
- **Fresh context:** only when paired with
  `independent-verifier` for final semantic acceptance.

## `bounded-executor`

- **Eligible when:** one self-contained plan supplies explicit
  inputs, file scope, expected edits, commands, done criteria,
  and STOP conditions.
- **Forbidden:** choosing architecture, filling an
  unspecified gap, changing scope, or continuing after a
  STOP.
- **Inputs:** the hub, one plan, verified preconditions, and
  declared inputs.
- **Record:** commands and outputs, changed files, status
  transition, and any STOP evidence.
- **Escalate:** every STOP to the `frontier-judgment` owner.
- **Fresh context:** no.

## `fast-mechanical`

- **Eligible when:** a read-only search, indexing,
  extraction, formatting, or deterministic transformation
  holds a fully specified expected form.
- **Forbidden:** synthesizing findings, classifying risk,
  resolving conflict, or accepting semantic correctness.
- **Inputs:** exact source boundary, transformation, and
  output form.
- **Record:** command or method, input boundary, output, and
  deterministic check where available.
- **Escalate:** any ambiguity, missing input, or result that
  needs judgment to `frontier-judgment`.
- **Fresh context:** no.

## `independent-verifier`

- **Eligible when:** a fresh, read-only context is blind to
  the reasoning of the producer and inspects cited sources
  through a fixed finding schema.
- **Forbidden:** modifying artifacts, reviewing its own
  reasoning, or issuing final semantic acceptance without
  `frontier-judgment` capability.
- **Inputs:** artifact boundary, cited sources, read-only
  scope, and fixed finding schema.
- **Record:** per finding, artifact section, cited source,
  observation, and verdict. State fresh-context provenance.
- **Escalate:** every mismatch or missing source to the
  frontier owner.
- **Fresh context:** yes.

## `deterministic-gate`

- **Eligible when:** a local command or schema holds an exit
  status that proves one named mechanical claim.
- **Forbidden:** proving intent, completeness, architecture,
  or semantic acceptance beyond that claim.
- **Inputs:** command or schema, exact claim, and expected
  result.
- **Record:** invocation, output, exit status, and claimed
  boundary.
- **Escalate:** failed or inapplicable gates to the role that
  owns the claim.
- **Fresh context:** no.

Final semantic acceptance is `frontier-judgment` plus
`independent-verifier`. Deterministic gates complement that
acceptance. They never replace either capability.
