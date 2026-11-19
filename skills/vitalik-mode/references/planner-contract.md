# Planner contract

## Select the route

Keep the primary model unchanged.
Use the model and effort selected for planning.
Inspect the host's current delegation schema or advertised model catalog.
Do not infer model availability from a familiar name.
Do not use skill frontmatter as proof that the runtime applied a model setting.

Prefer a native subagent with explicit model and effort selection.
Otherwise, use an already available read-only external agent runner.
Keep the external runner within the authorized workspace and evidence scope.
Do not install credentials, change providers, or rewrite global model settings
to satisfy a selector.

If the requested model is unavailable, report the unavailable selector.
Offer the strongest available planning route.
Use it when existing user instructions authorize that fallback.
Otherwise, keep the selected route pending while collecting useful evidence.
If effort is unsupported, report its actual limit.
Never represent a primary-thread analysis as a separate subagent review.

## Give the planner this task

Pass task-local evidence with a concise request:

```text
Analyze this goal as a read-only planning subagent.
Do not modify files, merge, cancel workflows, publish releases, or create issues.
Return your plan to the primary agent, then stop.

Goal and completion conditions:
<current goal and delivery target>

Scope and authority:
<repositories, targets, permitted actions, explicit limits>

Planning identity:
<goal ID, activation generation, planning request ID>

Observed evidence:
<diffs, logs, review findings, queue timings, current SHAs, source links>

Existing plan and changed evidence:
<include only when revising a plan>

Prefer the shortest credible total delivery time, including expected repair.
Temporary red main and understood breakage are accepted tradeoffs for this goal.
Find the root cause before prescribing a shortcut.
Separate evidence, hypotheses, and uncertainty.
Consider ordinary processing and a faster path where comparison matters.
Preserve valid review findings as fix-now or tracked follow-up work.
Return the result fields below without private reasoning transcripts.
```

Do not pass an intended verdict as evidence.
Give independent reviewers the same relevant observations when comparing
recommendations.
Use more than one planner when disagreement or independent inspection can
materially improve the decision.
Do not turn routine replanning into an open-ended review committee.

## Required result

| Field | Content |
| --- | --- |
| Diagnosis | Observed cause, supporting evidence, confidence, and remaining uncertainty. |
| Goal fit | Why the proposed work advances the stated completion conditions. |
| Tradeoff | Waiting cost, shortcut cost, expected repair, and affected scope. |
| Plan | Ordered steps, dependencies, useful parallel work, and batch boundaries. |
| Observations | Cheap checks that can change the decision or reveal integration failure. |
| Recovery | Expected breakage, recovery action, owner, and next observation point. |
| Findings | Immediate fixes, valid deferrals, duplicates, and reasoned dismissals. |
| Replan triggers | Evidence or timing changes that invalidate the selected approach. |

Use ranges when timings are estimates.
If measurements are missing, identify the smallest useful measurement.
Do not block a credible plan on information that cannot change its immediate
steps.

## Primary-agent decision

Examine whether the plan matches the evidence and current authority.
Resolve material gaps with a focused follow-up to the planner.
Read the latest mode record before accepting the result.
Match its goal, activation generation, and planning request with the current
enabled state.
If they differ, retain the result as history without adopting it.
Record the accepted plan and its concise rationale.
Execute the plan in the primary thread.

Request another planning result before changing a material tradeoff.
Examples include expanding a merge batch, changing the target, or accepting
newly discovered breakage.
Also replan when recovery exceeds its useful estimate or the assumed cause
proves wrong.
Routine implementation choices within the accepted plan do not need another
planning round.
