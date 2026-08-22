---
name: tailrocks-improve-deep
description: >-
  Use only when the user explicitly requests this skill. Audit a whole repository or one non-security category exhaustively through read-only lanes and fresh independent refutation, returning one verified report and no artifacts.
argument-hint: "[<non-security category>] [--batch] [repository path]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Improve Deep

Own exhaustive non-security repository audit. Apply
[`runtime-trust.md`](references/runtime-trust.md) and
[`repository-audit-lanes.md`](references/repository-audit-lanes.md). This owner
is read-only and returns one report; it never plans, implements, reconciles, or
seeds delivery work.

## Audit

1. Bind root, revision, dirty state, whole-repository or one category scope, and
   every package in scope. Refuse `quick`, security, branch review, and multiple
   primary categories with the exact owning route.
2. Map every applicable common lane over every package. No hotspot sampling,
   leverage cutoff, silent package omission, or inferred execution authority.
   A target command runs only with explicit authority in an enforceably
   read-only tree using frozen inputs, scrubbed secrets, disabled network,
   owner-only external cache/output, bounded time/output/processes,
   TERM-then-KILL cleanup, and before/after hashes; otherwise record `NOT_RUN`.
3. Dispatch one bounded read-only investigator per independent lane/package
   slice. Every lane returns candidates or an explicit skip with evidence.
4. The orchestrator reopens every citation. Then a fresh-context independent
   verifier receives only the claim, target identity, and cited locations—not
   the raising lane's reasoning—and returns `CONFIRMED` or `REFUTED` with cause.
5. Report only twice-confirmed candidates. Rank by correctness, consistency,
   goal fit, severity, confidence, and fix risk; effort stays metadata. Separate
   direction options from defects.

## Output and final gate

Return one exhaustive report containing package/lane coverage, skipped scopes,
both verification receipts per surviving finding, rejected claims, and next
owners. No file, comment, plan, roadmap artifact, commit, or external action.
