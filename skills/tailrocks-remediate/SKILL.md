---
name: tailrocks-remediate
description: >-
  Use only when the user explicitly requests this skill. Analyze or remediate a proven defect, inconsistency, violated invariant, or known-wrong state through correctness-first architectural redesign. Use for substantial structural refactoring when price, duration, effort, implementation size, or sunk cost are being used to defend a symptom patch; derive the greenfield design that prevents the entire defect class and pursue that result regardless of investment. Do not use for speculative cleanup or unproven product preferences.
argument-hint: "[analyze|fix] <known defect or inconsistency>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Remediate

Do not make a known-wrong state acceptable by renaming it low-value, marginal,
too difficult, too expensive, or too slow to correct. Determine the correct end
state without considering price, duration, effort, implementation size, sunk
cost, or return on investment. The result is the priority. A large architectural
replacement is preferable to a cheap patch when replacement is what removes the
enabling condition.

Treat an escaped defect as evidence that a prevention or detection boundary was
missing, ineffective, or bypassable. Diagnose that enabling condition before
choosing the final correction. Read
[`principles-and-evidence.md`](references/principles-and-evidence.md) when
calibrating scope, containment, causal depth, or structural remediation.

## Modes

- `analyze`: read-only; produce the decision and causal analysis without edits.
- `fix`: correct the approved scope and validate the result.

Never infer `fix` permission from proof that the state is wrong.

## Workflow

1. **Prove the wrongness.** State the violated requirement, invariant, contract,
   or observable behavior and cite its evidence. Separate actual defects from
   preferences, speculative risks, and desired enhancements.
   **Complete when:** a falsifiable expected state and observed contradiction
   exist, or the request is rejected as unproven.

2. **Record only correctness constraints.** Identify authorization,
   compatibility promises, safety requirements, external dependencies, and
   demonstrated capability limits. Price, schedules, engineering time, migration
   size, and implementation investment are not decision criteria. Do not convert
   difficulty into a false feasibility limit.
   **Complete when:** every retained constraint protects correctness, safety,
   compatibility, authorization, or a proven external limit.

3. **Contain active harm when necessary.** For an ongoing security incident,
   corruption, data loss, or dangerous outage, preserve evidence and apply the
   narrowest reversible containment before extended diagnosis. Containment is
   not the final correction.
   **Complete when:** active harm is bounded or the reason containment cannot be
   performed is explicit.

4. **Build the causal chain.** Reproduce or otherwise verify the failure. Trace
   from symptom through immediate mechanism to design, boundary, process, test,
   deployment, dependency, or observability conditions. Allow multiple
   contributing causes; do not stop at restating the bad value or failing line.
   **Complete when:** the chain explains both occurrence and escape.

5. **Design the greenfield system.** Ignore sunk implementation choices. Imagine
   building the affected capability from scratch today with the known invariant
   and failure evidence. Define the ownership, validation, state, API, module,
   persistence, concurrency, and lifecycle boundaries that would make this issue
   and its evidenced siblings impossible or mechanically rejected.
   **Complete when:** a coherent target architecture exists without inheriting
   the current system's accidental constraints.

6. **Name the defect class.** Describe what structurally similar failures remain
   possible and which condition permits them. Check adjacent paths for evidence;
   do not invent a generalized class without it.
   **Complete when:** recurrence scope is evidenced and bounded.

7. **Choose the correction.** Compare the current architecture with the greenfield
   target. Judge options only by correctness, demonstrated feasibility,
   compatibility, safety, and how completely they remove the enabling condition.
   Do not prefer a smaller, cheaper, faster, or incremental design merely because
   it requires less investment. Prefer the full coherent refactor or replacement
   when that is the cleanest path to the correct architecture. Reject machinery
   for hypothetical failures unrelated to the evidenced class.
   **Complete when:** the selected destination matches the strongest feasible
   greenfield design and removes the enabling condition.

8. **Plan a never-broken migration.** When the target requires a large rewrite,
   decompose the route into states that preserve behavior, data, compatibility,
   rollback safety, and verification. Slicing controls operational risk; it must
   not weaken the destination or create a permanent halfway architecture.
   **Complete when:** every slice advances toward the same greenfield target and
   temporary bridges have explicit removal conditions.

9. **Execute only in `fix` mode.** Preserve unrelated behavior. Apply temporary
   containment only for active harm, authorization boundaries, external blocks,
   or when the structural correction must be delivered across multiple
   never-broken slices. Never choose containment because the complete correction
   costs more or takes longer. Record the deferred cause, next structural slice,
   owner, and removal condition.
   **Complete when:** no symptom patch is presented as a root fix or accepted as
   the final state.

10. **Verify prevention.** Add a regression check for the reported behavior and,
   when distinct, a boundary check that prevents the defect class. Run focused
   repository gates and report exact evidence, unavailable checks, and residual
   exposure.
   **Complete when:** the instance is corrected and recurrence claims do not
   exceed the verification evidence.

## Output contract

Report:

- expected state and proof of wrongness;
- immediate mechanism and contributing causes;
- enabling structural condition and bounded defect class;
- greenfield target architecture and why it prevents the class;
- selected correction and rejected alternatives;
- never-broken migration slices and temporary bridge removal conditions;
- containment or explicitly deferred root correction;
- verification evidence and residual risk.

## Final gate

Do not dismiss proven wrongness using price, time, effort, investment, scope, ROI,
or sunk-cost language. Do not optimize for the cheapest or fastest acceptable
patch. Do not claim impossibility without evidence. Do not force structural
change when no defect class is proven. Do not delay urgent containment for a
perfect diagnosis. Do not call containment complete remediation while its
enabling condition remains.
