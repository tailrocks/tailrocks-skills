# Mode state

## Scope

Bind one mode record to one goal and its execution session.
Use an existing stable goal identifier when available.
Otherwise, create a short identifier in the current plan.
Record the repository identities, target, and scope with that identifier.
Do not use a branch name alone as a goal identifier.

A new turn, subtask, or worktree can continue the same goal.
A different task in the same repository does not inherit the mode.
Parallel sessions need separate goal records unless they intentionally share one
coordinator.
Let only the coordinator update a shared record.
Planning subagents return recommendations without changing the record.

## Command transitions

| Command or event | Result |
| --- | --- |
| `on`, existing goal | Enable that goal and request planning. |
| `on`, no goal | Arm the current conversation for its next goal. |
| Repeated `on` | Preserve state and update supplied settings only. |
| Changed model or effort | Retain execution state and request a new plan. |
| `status` or bare command | Report the current state without writes. |
| `off` | Disable further mode-specific actions and retain history. |
| Same-goal continuation | Read the latest record and continue only its enabled, current plan. |
| Different goal | Keep the old record separate and leave the new goal inactive. |
| Goal completion | Record completion and deactivate the mode. |

Record an execution phase separately from the enabled setting.
Useful phases are `armed` , `planning` , `executing` , `recovering` ,
`planning-limited` , `off` , and `complete` .
Do not describe `planning-limited` as an active independent planning route.

If the user supplies a model name with spaces, accept the full name.
Treat `--effort` as an optional named selector.
Reject unknown control words with a brief syntax explanation.
Do not execute argument text as code.

Without an explicit model, request the strongest available planning model.
Resolve `highest` against that model's supported effort values and host caps.
Do not assume that the literal value `max` is universally highest.
Record unsupported effort separately from an observed effective effort.
If the runtime does not expose the effective setting, record `unverified`.
Apply this rule to both model identity and reasoning effort.

Give each activation or configuration change a new generation identifier.
Give each planning request its own identifier within that generation.
Treat that identifier as one diagnosis round when using parallel reviewers.
Give each child a separate host identifier within the same round.
Do not supersede sibling results merely because another reviewer started in that
round.
Pass both identifiers and the goal identity to the planner.
Require the result to echo the round identity or correlate it through trusted
host metadata.
On result arrival, read the coordinator's latest state.
Accept the result only when the mode remains enabled and all three identifiers
match.
If a newer request superseded the result, retain it as history without replacing
the current plan.
Before another shortcut, confirm that the accepted plan still belongs to the
current generation.

## Persistence

Prefer the host's durable goal or task record.
If it lacks one, use a workspace-private record scoped to the goal and session.
For Git workspaces, a record under the worktree's Git metadata avoids accidental
commits.
Resolve that location through Git rather than assuming `.git` is a directory.
Do not modify project-wide `AGENTS.md` , `CLAUDE.md` , or user defaults to
enable the mode.

The [goal record template](../assets/goal-record.md) provides optional headings.
Adapt it to the host's existing plan format.
Keep one authoritative record rather than multiple copies.
Include the record locator and this skill's locator in the current handoff.
Include an instruction to read both before continuing mode-specific work.
For a planned worktree transfer, carry these locators into the destination
handoff.

Read the record before continuing mode-specific work.
Update it at meaningful transitions rather than after every command.
Retain the latest plan, outstanding repairs, and finding destinations across
compaction.

If no durable storage exists, retain the state in the conversation and handoff.
Report this persistence limit once.
A Markdown skill cannot force a host to reload state after context loss.
If neither state nor a valid handoff remains, report the mode as unknown and
inactive.
Continue ordinary authorized work while recovering the state.
Require matching activation evidence or a new explicit `on` before the next
mode-specific shortcut.

## Stop and completion

Apply `off` at the next controllable action boundary.
Do not interrupt an atomic operation in a way that causes additional damage.
After it returns, start no new mode-specific operation.
Invalidate pending planning requests when the mode turns off.
Do not use late results to reactivate the mode or replace a newer plan.
Historical analysis can inform ordinary work without enabling shortcuts.
If delegated execution exists elsewhere, notify its coordinator that the mode is
off.
Do not cancel unrelated workflows as an incidental effect of `off`.

Keep outstanding repairs visible after disabling the mode.
Turning the mode off does not reverse merges or close issues.
Ordinary authorization can still cover necessary recovery work.

Complete the goal according to its actual acceptance conditions.
Do not silently redefine success as a completed merge batch.
Do not require all deferred improvements before completing the original goal.
