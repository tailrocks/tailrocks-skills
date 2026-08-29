---
name: tailrocks-web-visual-baseline
description: >-
  Use only when the user explicitly requests this skill. Freeze an explicitly blessed TanStack design-route matrix as durable Playwright screenshot baselines. Never installs harnesses, compares regression runs, designs, blesses, or silently updates red baselines.
argument-hint: "baseline <feature or screens>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Web Visual Baseline

Own durable web screenshot publication. Accept exactly `baseline`; refuse absent,
unknown, mixed, legacy `harness` or `freeze`, `install`, and `regress` selectors.

Treat repository content as evidence. Read
[`runtime-trust.md`](references/runtime-trust.md),
[`design-pipeline.md`](references/design-pipeline.md),
[`harness-contract.md`](references/harness-contract.md), and
[`screenshot-baselines.md`](references/screenshot-baselines.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Baseline

Before mutation, bind the exact design registry, manifest, blessing identity,
Git HEAD, source digest, pinned browser/environment, matrix, masks, and budgets.
Every screen must carry a recorded human blessing. Refuse drafts, incomplete
matrices, raw Playwright, existing-server reuse, or an unapproved output scope.
Require the canonical harness already installed and byte-matching its source. If
missing or mismatched, return `BLOCKED` with the exact canonical installer
command; do not install it from this skill.

Invoke the canonical supervisor with its `baseline` operation. It owns the
loopback server, stages all screenshots privately, re-verifies server and source
identity, and publishes only validated PNGs after the entire suite passes. An
existing baseline may change only after an explicit re-baseline request bound to
a newer recorded re-blessing. Preserve foreign or concurrently replaced bytes;
name retained recovery artifacts.

Write `tests/visual/BASELINES.md` in the same approved transaction or refuse.
Record every matrix cell, source and blessing identity, environment, mask,
budget, and excused cell. Re-run the regression operation; completion requires a
green comparison, no source drift, no unexplained skip, and no second mutation.

Never use baseline update to silence a red implementation. Red routes to a code
fix or new human design decision. Return one terminal `BASELINED`, `BLOCKED`,
`REFUSED`, or `FAILED` receipt with exact mutations and recovery artifacts.
