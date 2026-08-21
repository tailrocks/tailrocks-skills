---
name: tailrocks-skill-refactor
description: >-
  Use only when the user explicitly requests this skill. Apply user-selected findings, by ID, from a skill-audit report to a skill: fix descriptions, routers, references, and evals per doctrine while preserving the invocation contract. Refuses work without a report basis; ends in an independent re-audit.
argument-hint: "<skill name> <finding IDs>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Skill Refactor

Applies an audit report. The report — written by `tailrocks-skill-audit`
under `skill-audits/` — is the observed failure in field-evidence form:
**no report, no refactor.** A paraphrased defect list, a remembered
audit, or a hunch routes back to `tailrocks-skill-audit` first.

The invocation contract is untouchable: name, trigger surface, and
arguments stay as they are. A finding whose fix would change them is
returned to the user, not applied.

The difference from `tailrocks-skill-update`: update answers a behavior
failure observed in use; refactor answers a doctrine audit's defect
list. The protections are the same — eval-pinned lines checked, the full
eval set updated for CI, the harness never run locally.

## Steps

1. **Read the report and confirm the selection.** Default source:
   `skill-audits/<skill-name>.md` at the repository root; a pasted or
   pathed report is accepted. Confirm every selected ID exists in the
   report. Check drift: if the report's audited-at commit predates
   changes to the skill, the selection no longer maps to the text —
   route to a re-audit and stop. No report at all — route to
   `tailrocks-skill-audit` and stop.
   **Complete when:** the selection maps to live findings in a current
   report, or the request is rerouted.

2. **Vet the selection against the skill as it stands.** Open each
   selected finding's evidence yourself. A finding that no longer
   reproduces is skipped, with the reason recorded — never applied to
   text that does not have the defect.
   **Complete when:** each selected finding is confirmed present or
   recorded as skipped with its reason.

3. **Apply the selected fixes, one finding at a time.** Per the design
   and testing doctrine shipped with `tailrocks-skill-audit`:
   strengthen over append, depth to references routed by when to read,
   structural cues for load-bearing requirements, trigger-only
   descriptions. Check the skill's `evals/evals.json` before touching
   any line a case depends on, and update the full eval set for CI when
   a fix moves behavior a case pins. Nothing beyond the selected IDs —
   an adjacent defect noticed mid-fix is reported, not repaired.
   **Complete when:** every confirmed finding is applied and the eval
   set is updated; validation is green.

4. **Verify independently.** Hand off to a fresh `tailrocks-skill-audit`
   pass on the skill — the re-audit overwrites the report and shows the
   selected IDs resolved. The refactor never verifies itself: the agent
   that applied a fix is the worst judge of whether the defect is gone.
   **Complete when:** the re-audit is handed off or invoked; a
   self-declared pass does not count.

## Red flags — STOP

- "While you're in there, also fix X" — anything beyond the selected IDs
  is a new selection; confirm it first.
- "Skip the re-audit, the fixes are obvious" — the implementer never
  self-verifies.
- "Refactor from this summary of what's wrong" — a summary is not a
  report; audit first.
- "Make the trigger fire more often as part of the fix" — contract
  change; returned to the user, not applied.

## Final gate

Never refactor without a report. Never apply an unselected finding.
Never change the invocation contract. Never apply a finding whose
evidence you did not re-open. Never self-verify. Never run the eval
harness locally. Report every skipped finding with its reason.
