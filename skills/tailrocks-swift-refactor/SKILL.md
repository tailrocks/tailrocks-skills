---
name: tailrocks-swift-refactor
description: >-
  Use only when the user explicitly requests this skill. Refactor Swift and SwiftUI code under a preservation oracle while retaining behavior, public API, isolation, cancellation, state identity, rendering, accessibility, errors, availability, and bridge lifecycles.
argument-hint: "<Swift refactor target and preservation oracle>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Refactor

Restructure Swift code only after an adequate preservation oracle passes. Refuse
new behavior, contract/expectation changes, review-only output, project changes,
visual redesign, and Rust-core boundary architecture.

Apply [`runtime-trust.md`](references/runtime-trust.md), then relevant local code
references. Copied policy does not enlarge scope.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Refactor

1. **Freeze behavior.** Bind root/revision, approved paths and preimages, public
   API, error/fallback semantics, isolation, task ordering/cancellation, state and
   view identity, rendering/accessibility/focus, AppKit lifecycle, storage, and
   performance budgets. Run identical focused proof before editing.
2. **Name the structural defect.** Identify mixed ownership, duplicated state,
   unstable identity, excessive invalidation, tangled task lifetime, or oversized
   bridge and the measurable surface that disappears.
3. **Stage one narrow restructure.** Preserve all frozen contracts, native
   rendering, and Rust-owned behavior. Capture preimages; compare-and-swap only
   unchanged approved files; never overwrite concurrent work.
4. **Prove preservation.** Re-run the identical oracle and affected existing
   bounded gates. Unexplained drift fails. Restore only still-owned bytes or name
   recovery artifacts. Report structure removed, measure, proof, and residual risk.

## Final gate

Same behavior, APIs, actors, tasks, identity, pixels/semantics, errors,
availability, and bridge lifetime; less structural surface; no concurrent overwrite.
