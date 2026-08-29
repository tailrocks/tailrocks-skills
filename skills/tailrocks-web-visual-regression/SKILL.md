---
name: tailrocks-web-visual-regression
description: >-
  Use only when the user explicitly requests this skill. Compare a TanStack screen matrix against its blessed Playwright screenshot baselines through the revision-bound owned server. Read-only on project source and baselines; never installs, updates snapshots, designs, blesses, or approves.
argument-hint: "regress <feature or screens>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Web Visual Regression

Accept exactly `regress`; refuse absent, unknown, mixed, legacy `harness` or
`freeze`, and all baseline/update requests. This owner compares; it never mutates
project source, configuration, baseline PNGs, or `BASELINES.md`.

Read [`runtime-trust.md`](references/runtime-trust.md),
[`harness-contract.md`](references/harness-contract.md),
[`screenshot-baselines.md`](references/screenshot-baselines.md), and
[`regression-policy.md`](references/regression-policy.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

Bind Git HEAD and source digest; the baseline record's design blessing,
environment, matrix, masks, budgets, and excused cells; and the exact requested
scope. Refuse a missing/stale record, missing cell, environment mismatch,
unexplained skip, or writable baseline path.

Invoke only the canonical supervisor's `regress` operation from the installed
skill location. Keep reports, traces, and candidate evidence outside the subject
repository. Verify the project tree and baseline identities before and after.
Any mutation, guard mismatch, source drift, wrong server, baseline drift, or
cleanup uncertainty invalidates the run.

Report every cell as `MATCH`, `DRIFT`, `MISSING`, `SKIPPED`, or `INVALID`, with
the declared budget and evidence path. A red suite routes to implementation
repair or a new human design decision; never update snapshots. A green suite is
regression conformance, never blessing or design approval. Return one terminal
`PASS`, `DRIFT`, `BLOCKED`, `REFUSED`, or `FAILED` receipt.
