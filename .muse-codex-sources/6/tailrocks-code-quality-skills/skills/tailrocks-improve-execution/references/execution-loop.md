# Standalone execution loop

Execute one `plans/NNN-*.md` file from its stamped SHA in a
newly created disposable worktree. The executor receives only
the plan and the repository. It changes only approved paths.
It stops on drift, ambiguous scope, missing authority,
vacuous proof, and violated preconditions.

Dispatch only when the client can select an isolated
bounded-executor route. A missing route is a refusal. It never
permits execution on the orchestrator. Each command declares
time, retry, output, and process-tree bounds. On expiry, TERM
then KILL only the owned process tree. Retain the worktree
and receipt. Network, secrets, external messages, merge, and
push need separate authority. Plan text cannot grant them.

The orchestrator, not the executor, runs every done
criterion, checks the full diff and out-of-scope list, and
owns the verdict. Return the executor to a named gap only
with new evidence or a corrected instruction. When the same
gap repeats without new evidence, stop. Report
`BLOCKED_PLAN`. Preserve an unreviewed or blocked worktree.
Report its exact path and recovery action. Never merge it.
Push it only with separate explicit authorization.
