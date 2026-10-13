# Landing policy

This skill performs the only supported landing. One invocation lands at most
one PR with one merge or enqueue attempt.

- Squash is mandatory. The merge command is always
  `gh pr merge "$PR" --repo "$REPO" --squash --match-head-commit
  "$REVIEWED_HEAD"`, with `--auto` added only for a confirmed
  squash-method queue route. There is no merge-commit or rebase choice.
- The head guard requires the PR head to still be the reviewed commit.
  It is not a compare-and-swap on a caller-selected target SHA. A last
  read and a later write still have a race window. A local lock does
  not prevent another remote writer. Never claim a target lock.
- When base freshness matters, prefer a merge queue or a server-enforced
  freshness check. When those protections are absent, block an affected
  high-risk merge rather than inventing safety.
- When the target requires the merge queue, the skill takes the enqueue
  route only after verifying the queue's effective merge method is
  squash. An unknown or non-squash queue method blocks the merge with a
  configuration gap. The CLI strategy flag never overrides the server's
  queue method.
- The skill never uses `--admin`, rule bypass, disabled checks, a direct
  target push, a rule change, or branch deletion in the merge command.
- The skill never deletes a source branch. Sources survive failed,
  blocked, or uncertain operations.
- Terminal states are `blocked`, `pending`, `queued`, `merged`,
  `failed`, and `uncertain`. An enqueue is not a merge. `pending` at
  the poll bound is never success.
- After GitHub reports a merge, the skill verifies the intended PR, the
  intended repository and target, the merge commit, and the post-merge
  check state. The target may advance past the merge commit.
- Bounded waiting only. Check remote state before any retry. When the
  result is `failed`, retain the candidate and its evidence. When the
  result is `uncertain`, query the remote state before any retry.
