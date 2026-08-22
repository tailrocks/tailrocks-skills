---
name: tailrocks-simplify-audit
description: >-
  Use only when the user explicitly requests this skill. Audit one pull request, branch, or diff read-only for measured code removals whose observable behavior can be preserved. Returns findings only; never edits, tests in, or applies them.
argument-hint: "<PR, branch, or diff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Simplify Audit

Find what one bound change can lose while preserving all observable behavior.
This owner is read-only and returns one report. It never writes a
characterization test, edits production, applies a candidate, or infers approval.

Apply [`runtime-trust.md`](references/runtime-trust.md) and
[`simplification-ladder.md`](references/simplification-ladder.md).

## Audit

1. Bind canonical repository, HEAD, exact merge base/range or worktree snapshot,
   dirty state, touched files/hunks, and Git-visible hashes. Scope is only changed
   lines plus code the change made dead; untouched cleanup is excluded.
2. Mark protected constructs before searching: trust-boundary validation,
   authentication/authorization, errors and failure paths, transactions, retries,
   idempotency, ordering, cleanup, concurrency/cancellation, accessibility,
   timeouts, and security limits. An unexplained guard is kept.
3. Walk the ladder per hunk and stop at the first supported removal. Reuse claims
   cite an existing repository path or an exact API present in the pinned runtime.
   A new dependency, rename, extraction, reorganization, two-site abstraction,
   or clever equivalent is not simplification.
4. Count lines, branches, names, parameters, nesting depth, configuration keys,
   or direct dependencies before/after. No positive counted delta means reject.
5. Re-read each candidate and argue identical return/error types, side-effect
   order/count, timing, cleanup, wire/persisted forms, logs with consumers,
   rendering semantics, focus, and accessibility for every accepted input class.
   “Looks equivalent” is never evidence.
6. Inspect existing tests and prove whether they enter the removed path. Run a
   command only with explicit authority in an enforceably read-only tree using
   frozen inputs, scrubbed secrets, disabled network, owner-only external
   cache/output, bounded time/retries/output/process tree, TERM-then-KILL cleanup,
   and before/after hashes. Otherwise mark the oracle `NOT_RUN`.
7. Return one report with range, protected constructs, rejected candidates,
   behavior changes routed elsewhere, and findings shaped as ID, location,
   removal, ladder rung, preservation argument/level, required pre-edit test,
   measured delta, exact allowed paths, and risks.

## Final gate

No repository byte changed. Every hunk has a verdict; every finding removes a
counted measure and carries re-read preservation evidence. No candidate is
approved or applied, no guard of unknown purpose is called redundant, and no
secret value enters output.
