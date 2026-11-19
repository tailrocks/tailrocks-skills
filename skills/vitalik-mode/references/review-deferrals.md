# Review deferrals

## Disposition

Read the finding and its relevant code or evidence.
Do not infer validity from the reviewer's confidence or model name.
Use the current goal to decide timing.

| Disposition | Meaning | Required record |
| --- | --- | --- |
| `fix-now` | The finding blocks the goal or invalidates the shortcut. | Source, fix, and observed result. |
| `deferred` | The finding is valid and aligned, with lower current priority. | Source, reason, and confirmed tracking link. |
| `duplicate` | An existing item covers the same outcome. | Source, canonical item, and coverage explanation. |
| `dismissed` | Evidence rejects the finding or it does not serve the target. | Source and specific rationale. |
| `tracking-pending` | The follow-up is valid, but external tracking is unavailable. | Complete issue content, access gap, and next action. |

Do not classify a valid finding as dismissed only because time is short.
Work outside the current delivery slice can still align with the intended
outcome.
Preserve that work through deferral when it remains useful.
Do not treat a stale comment location as proof that the defect disappeared.
If further diagnosis can change the plan, include the finding in the planner's
next request.

## Create durable follow-up

Search existing issues and the goal record for the same source or outcome.
Reuse an issue that already covers the finding.
Confirm that its state and acceptance criteria still track the unresolved
outcome.
If the issue is closed, inspect its resolution and the current defect.
If the defect remains, create a current issue or reopen the old issue when
authorized.
If the earlier work fixed the defect, record the supporting evidence instead.
If creation times out, inspect the repository before retrying.
Use a stable source URL or review identifier to prevent duplicate issues.

Create one issue when the findings share one implementation outcome.
Preserve a source and acceptance criterion for each grouped finding.
Create separate issues when owners, dependencies, or completion conditions
differ.
Use an epic to connect related issues when the host supports that structure.
If native sub-issues are unavailable, use a parent issue with explicit child
links.

Use the [deferred issue template](../assets/deferred-issue.md).
Include these facts:

- The original review comment, PR, file, and relevant source revision.
- The finding and why it is valid.
- Its impact and alignment with the intended outcome.
- Why current delivery takes priority.
- The expected fix and observable acceptance criteria.
- Dependencies and the condition for revisiting the work.
- An owner when known, or an explicit unassigned state.

Do not invent an assignee, deadline, or commitment from another person.
Confirm the issue URL and its stored content after creation.
Require an active tracking destination for an unresolved deferred outcome.
Record that link against every finding it covers.

## Preserve the review conversation

If the task permits review replies, state the disposition where the reviewer can
find it.
For deferral, link the issue and explain the time tradeoff.
Do not say that a defect is fixed when only its tracking changed.
Resolve a deferred thread only after the explanation and tracking link are
preserved.
If the host cannot store them, leave the thread open.

Keep issue creation and thread resolution as separate operations.
If one succeeds and the other fails, record their distinct states.
Do not delete comments or falsify review status to make a merge appear ready.

## Tracking failure

If external issue creation is unavailable, save the complete issue content in
the goal record.
Mark it `tracking-pending` rather than `deferred`.
Preserve the source links before continuing the fast path.
Retry when the service becomes available during the task.
At handoff, identify the tracking gap and the action needed to close it.
Do not claim that an issue exists or promise unattended future work.

## Completion

Include a short finding table in the delivery report.
Link each deferred or duplicate item to its durable destination.
Keep deferred issues open until their own acceptance criteria are met.
Completing the current goal does not silently close the follow-up work.
