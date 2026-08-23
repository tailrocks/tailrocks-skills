---
name: tailrocks-simplify
description: >-
  Use only when the user explicitly requests this skill. Apply one explicitly approved set of measured code removals within a bound diff while preserving every observable behavior. Requires a proven oracle; never discovers removals or changes behavior.
argument-hint: "apply <approved removal set and PR, branch, or diff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Simplify Apply

Apply one exact removal set already produced by `tailrocks-simplify-audit` and
explicitly approved by the user. This owner discovers no candidate, broadens no
scope, fixes no defect, and changes no behavior. Naming an audit report grants no
mutation authority.

Legacy default or `audit` prints `Use tailrocks-simplify-audit` and stops
unchanged. Only explicit `apply` plus the exact approved findings continues.
Refuse mixed selectors and never silently invoke the audit owner.

Apply [`runtime-trust.md`](references/runtime-trust.md) and
[`behavior-preservation.md`](references/behavior-preservation.md).

## Apply

1. Bind canonical repository, HEAD, merge base/range, dirty state, exact approved
   finding IDs, touched/dead-code reach, approved characterization-test paths,
   expected counted deltas, and hashes of every writable file. Reject stale,
   ambiguous, symlinked, escaping, behavior-changing, or extra-scope work.
2. Require a preservation oracle before production mutation: relevant existing
   tests must enter every removed path, or an explicitly approved
   characterization test must first pass against unchanged production bytes.
   Reasoned equivalence alone is permitted only for a locally obvious unreachable
   symbol with complete reference proof—never errors, effects, ordering, timing,
   resources, interfaces, concurrency, authorization, validation, or security.
3. Run baseline/proof commands only with explicit execution authority, frozen
   existing dependencies and inputs, scrubbed secrets, disabled network,
   owner-only external cache/output, bounded time/retries/output/process tree,
   TERM-then-KILL cleanup, and repository hashes before/after each read-only run.
   A red, vacuous, unavailable, or mutation-prone baseline blocks application.
4. If approved, publish each characterization-test file sequentially by
   compare-and-swap, record its receipt, and prove it against unchanged production
   bytes. Then apply exactly one approved removal: publish every production file
   sequentially by expected-preimage-to-owned-postimage CAS, recording one receipt
   per path, run its focused oracle, and continue one removal at a time. Never
   claim multi-file atomicity.
5. On any failed oracle, restore a preimage only by CAS after current bytes prove
   they still match the owned postimage. Never use broad Git restoration, repair
   behavior, or overwrite a concurrent replacement. Retain and name every
   surviving changed path and recovery artifact when full rollback is impossible.
6. Run focused and full repository gates under the same bounded command contract.
   Recount every promised measure and compare the final changed-path allowlist,
   observable contracts, and repository state with the approved receipt.

## Output and final gate

Return `APPLIED`, `BLOCKED`, `ROLLED_BACK`, or `RECOVERY_REQUIRED` with target
identity, approved IDs, pre/post hashes, tests established before production
edits, command/unit receipts, per-removal and total measured deltas, exact changed
paths, partial mutations, and recovery artifacts. `ROLLED_BACK` means every owned
mutation was restored and no changed path survives; any surviving mutation is
`RECOVERY_REQUIRED`. No unapproved edit, behavior change, commit, push, merge,
issue, comment, dependency install, or external action.
