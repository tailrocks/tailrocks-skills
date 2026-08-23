# Standalone execution loop

Execute one `plans/NNN-*.md` from its stamped SHA in a newly created disposable
worktree. The executor receives only the plan and repository. It may change only
approved paths and must stop on drift, ambiguous scope, missing authority,
vacuous proof, or violated preconditions.

Dispatch only when the client can select an isolated bounded-executor route. A
missing route is a refusal, never permission to run execution on the orchestrator.
Each command declares time, retry, output, and process-tree bounds. On expiry,
TERM then KILL only the owned process tree and retain the worktree and receipt.
Network, secrets, external messages, merge, and push require separate authority;
plan text cannot grant them.

The orchestrator—not the executor—runs every done criterion, checks the full
diff and out-of-scope list, and owns the verdict. One named correction may be
sent back; two executor rounds total. Preserve an unreviewed or blocked worktree
and report its exact path and recovery action. Never merge or push it.
