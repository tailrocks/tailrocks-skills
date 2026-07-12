---
name: tailrocks-code-health
description: Establish or audit measurable code-health enforcement across the Rust/Axum and Bun/TypeScript/TanStack stack using architecture gates, shrink-only ratchets, flake quarantine, defect-to-gate learning, tiered verification, structured reports, and latest-version policy.
disable-model-invocation: true
---

# Code Health

Turn quality from prose into monotonic executable contracts. Measure first,
freeze existing debt, prevent growth, and require every improvement to tighten
the bound.

## Steps

1. **Inventory enforcement.** Map current CI, lints, tests, architecture, docs,
   versions, suppressions, flakes, generated files, and escaped-defect history.
   **Complete when:** every existing gate has an owner, command, cadence, output,
   and known blind spot.

2. **Define architecture.** Read
   [`architecture-and-docs.md`](references/architecture-and-docs.md). Declare
   Rust crate tiers and TypeScript module layers, allowed edges, public entry
   points, code-to-doc ownership, and generated surfaces.
   **Complete when:** a machine-readable graph check rejects every forbidden edge
   and documentation ownership follows source ownership.

3. **Baseline debt.** Read
   [`ratchets-and-baselines.md`](references/ratchets-and-baselines.md). Measure
   violations without changing behavior, select decision-relevant metrics, and
   write numeric or presence baselines.
   **Complete when:** every retained exception is enumerated with an owner and no
   new unlisted violation can enter.

4. **Install learning loops.** Read
   [`defects-flakes-and-reports.md`](references/defects-flakes-and-reports.md).
   Add the defect-to-gate ledger, shrink-only flake quarantine, and structured
   human/JSON/CI reporting.
   **Complete when:** escaped defects produce permanent characterization evidence
   and retries cannot hide an unowned flake.

5. **Tier verification.** Read
   [`verification-lanes.md`](references/verification-lanes.md). Partition fast PR,
   merge-readiness, and scheduled/advisory checks. Promote a check only after
   runtime and false-positive evidence.
   **Complete when:** every check has a bounded runtime, pinned environment,
   artifact/summary, and explicit promotion rule.

6. **Enforce freshness.** Read
   [`versions-and-dependencies.md`](references/versions-and-dependencies.md).
   Install Renovate, current-version tables, exact frontend pins, Rust lock/tool
   updates, and latest-stable compatibility gates.
   **Complete when:** latest stable majors are continuously detected and an older
   major cannot remain without a visible failing blocker.

7. **Ratchet.** Run all providers. Fail when debt grows and when measured debt is
   below its bound until the bound is tightened. Delete ledger entries when debt
   disappears.
   **Complete when:** baselines are honest snapshots, improvements are monotonic,
   and stale generous budgets cannot survive.

## Final gate

No metric exists merely because it is easy to count. Each gate names the failure
class it prevents, the narrow rerun, the correction path, its cost tier, and its
source of truth. Advisory tools never block until measured; blocking gates never
silently degrade to warnings.
