# Troubleshooting

## The command is missing

Read the [installation guide](installation.md) for your agent's native prefix.
Some hosts use a namespaced plugin command, `$vitalik-mode` , or
`/skill:vitalik-mode` .
The canonical name remains `vitalik-mode`.

Confirm that the installation includes the complete skill directory.
Keep references, assets, and agent metadata beside `SKILL.md`.
Reload the agent's skill inventory if its documented installation flow requires
it.
Do not claim that a missing slash alias means the skill cannot load.

## The requested model is unavailable

Inspect the host's advertised model catalog and delegation controls.
Confirm the exact provider, model identifier, and supported effort values.
Some hosts route subagents through configured profiles or a secondary-model
pool.

Use an already authorized alternative route when available.
Otherwise, select an available planner explicitly.
The mode keeps new shortcuts pending while it collects useful evidence.
It does not switch the primary model silently.

## The host has no subagent tool

Use an available read-only external agent route when the host permits it.
Do not install credentials or change global provider settings as an incidental
step.
If neither route exists, the agent reports `planning-limited`.
Ordinary authorized work can continue.
An inline planning fallback requires an explicit user choice.
Its result must not be reported as an independent subagent review.

## The mode disappears after compaction

Restore the current goal's mode record and handoff.
The handoff must include the skill locator and record locator.
It must instruct the next agent to read both before mode-specific work.
If neither record remains, enable the mode again for the current goal.
The package cannot guarantee native automatic reload on every agent.

## An old planner returns after a change

Compare the result's goal, activation generation, and planning request with the
current record.
Ignore it for execution if any identity differs or the mode is off.
Keep it as historical analysis when useful.
An old result must not reactivate the mode or replace a newer plan.

## An issue cannot be created

Preserve the complete finding and proposed issue content in the goal record.
Use `tracking-pending` until an active external issue exists.
Report the access or service failure accurately.
Do not resolve the review thread without a preserved explanation and tracking
link.
Retry during the task when access returns.

## Main stays red longer than expected

Collect the current failures and compare them with the accepted plan.
Ask the selected planning subagent to revise the diagnosis and recovery
approach.
Stop extending a batch whose assumptions no longer hold.
Choose a forward fix or rollback according to expected total recovery time.
Keep the recovery owner and next action explicit.

## An administrator action is denied

Report the specific denied operation and the available alternatives.
Use actual permissions and supported operations.
The mode does not create administrator access or override platform controls.
Keep useful work moving while the planning subagent revises the blocked step.
