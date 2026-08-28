---
name: tailrocks-improve-reconcile
description: >-
  Use only when the user explicitly requests this skill. Reconcile the standalone plans/ backlog against current repository truth, optionally re-verifying every row, and update only plans/README.md. Never edits plans, source, or roadmap items.
argument-hint: "[--deep] [--batch] [repository path]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Improve Reconcile

Synchronize standalone plan status with repository truth. Apply
[`runtime-trust.md`](references/runtime-trust.md) and
[`reconciliation.md`](references/reconciliation.md). The sole writable output is
`plans/README.md`.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

Pass only the optional repository path and modifiers; a retained `sweep`
selector is invalid. `--deep` re-verifies every indexed row without sampling. `--batch` makes status
selection deterministic and non-interactive while preserving every evidence,
command, compare-and-swap, and no-change rule. Neither modifier grants plan-body,
source, roadmap, Git, or remote authority. Invoke this owner directly; no
routing skill dispatches it.

## Reconcile

1. Bind root, revision, dirty state, index bytes, and every indexed plan. Refuse
   a roadmap item; `tailrocks-reconcile` owns those.
2. For each row, verify plan existence, stamped SHA, current evidence, changed
   paths, dependencies, and status claim. Default may inspect rows whose state
   or evidence changed; `--deep` re-verifies every row without sampling.
   Run target commands only with explicit authority under the same read-only,
   frozen-input, network-off, secret-scrubbed, external-cache, bounded-process,
   TERM-then-KILL, and post-hash contract; otherwise mark proof unavailable.
3. Mark truth only: `TODO`, `IN_PROGRESS`, `BLOCKED`, `STALE`, or `RETIRED`.
   Missing evidence is not completion. A finding fixed independently becomes
   `RETIRED` with fixing SHA. A defective plan becomes `BLOCKED` and routes to a
   new `tailrocks-improve-plan` invocation; never rewrite it here.
4. Reject symlinked or escaping paths. Atomically compare-and-swap one updated
   `plans/README.md`; rollback only owned bytes. On drift, leave bytes unchanged
   and report the conflict.

## Final gate

Exactly one index update or a no-change receipt. No plan body, source, roadmap,
branch, commit, remote, issue, or comment changed. Every row has current evidence.
