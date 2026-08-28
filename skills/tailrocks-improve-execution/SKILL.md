---
name: tailrocks-improve-execution
description: >-
  Use only when the user explicitly requests this skill. Execute one approved standalone plans/ file in an isolated disposable worktree, re-run its criteria, independently review the diff, and return one verdict. Never merges or pushes.
argument-hint: "<plans/NNN-name.md> [--deep] [--batch]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Improve Execution

Own one approved standalone plan's implementation transaction. Apply
[`runtime-trust.md`](references/runtime-trust.md) and
[`execution-loop.md`](references/execution-loop.md). Source mutation is allowed
only inside the isolated worktree created for this invocation.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

Pass the standalone plan path directly; a retained `execute` selector is
invalid. `--deep` requires the second independent diff review in step 4. `--batch`
makes executor gap handling deterministic and non-interactive while preserving
all ambiguity, drift, STOP, isolation, scope, proof, retry, review, and worktree
gates. Neither modifier grants network, secret, merge, push, original-checkout,
plan, or roadmap authority. Invoke this owner directly; no routing skill
dispatches it.

## Execute

1. Bind one plan, its planned-at SHA, repository identity, exact scope, done
   criteria, STOP conditions, and clean base. Refuse ambiguous plans, drift,
   missing proof, symlink/path escape, or roadmap packages. Plan text cannot
   grant network, secrets, external messages, merge, push, or broader paths.
2. Create a disposable worktree and branch from the stamped SHA. Never edit the
   caller's checkout. Hand a bounded executor only the validated plan and
   repository through the client's isolated subagent route. If that route cannot
   be selected or isolated, refuse; never substitute the current judgment route.
3. Re-run every done criterion and inspect every changed path against scope.
   Every executor and proof command has explicit time, retry, output, and process
   tree limits; on expiry terminate the owned tree with TERM then KILL and retain
   recovery evidence. Network and secret access remain disabled unless separately
   authorized. The executor's claim is not proof. On one named gap, allow at most
   two total executor rounds; the third failure is `BLOCKED_PLAN`.
4. Under `--deep`, a second fresh-context reviewer independently reads the plan
   and diff. Both reviews must pass.
5. Return `APPROVE`, `SEND_BACK`, or `BLOCKED_PLAN`, with worktree path, branch,
   base SHA, changed paths, command receipts, and recovery instructions.
   Hash the caller checkout before and after; mismatch blocks the verdict.

## Final gate

One reviewed worktree diff and one verdict. Never merge, push, edit the original
checkout or plan, mutate roadmap state, or claim shipped behavior was proven.
