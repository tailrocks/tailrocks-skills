---
name: tailrocks-code-health
description: >-
  Use only when the user explicitly requests this skill. Establish, audit, or tighten measurable shrink-only code-health ratchets. Use when existing architecture, lint, dependency, flake, defect, documentation, or verification debt must stop growing; do not use as a generic request to add every quality tool.
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Code Health

Turn one selected debt class from prose into a monotonic executable contract.
Measure first, freeze existing debt, prevent growth, and require improvements to
tighten the bound. References below are provider adapters for that single job,
not a mandate to install every quality program.

## Steps

1. **Select the mode and debt class.** `audit` measures read-only; `establish`
   creates an approved ratchet; `tighten` lowers an existing bound. Select only
   debt whose growth would represent a named failure class.
   **Complete when:** mutation permission, metric, owner, and prevented failure
   are explicit.

2. **Inventory enforcement.** Map only the current gates and exceptions relevant
   to the selected debt class.
   **Complete when:** every existing gate has an owner, command, cadence, output,
   and known blind spot.

3. **Load one provider when relevant.** Read
   [`architecture-and-docs.md`](references/architecture-and-docs.md). Declare
   Rust crate tiers and TypeScript module layers, allowed edges, public entry
   points, code-to-doc ownership, and generated surfaces.
   **Complete when:** a machine-readable graph check rejects every forbidden edge
   and documentation ownership follows source ownership.

4. **Baseline debt.** Read
   [`ratchets-and-baselines.md`](references/ratchets-and-baselines.md). Measure
   violations without changing behavior, select decision-relevant metrics, and
   write numeric or presence baselines.
   **Complete when:** every retained exception is enumerated with an owner and no
   new unlisted violation can enter.

5. **Attach learning evidence when relevant.** Read
   [`defects-flakes-and-reports.md`](references/defects-flakes-and-reports.md).
   Add the defect-to-gate ledger, shrink-only flake quarantine, and structured
   human/JSON/CI reporting.
   **Complete when:** escaped defects produce permanent characterization evidence
   and retries cannot hide an unowned flake.

6. **Place the ratchet in a verification lane.** Read
   [`verification-lanes.md`](references/verification-lanes.md). Partition fast PR,
   merge-readiness, and scheduled/advisory checks. Promote a check only after
   runtime and false-positive evidence.
   **Complete when:** every check has a bounded runtime, pinned environment,
   artifact/summary, and explicit promotion rule.

7. **Ratchet version debt only when it is the selected class.** Read
   [`versions-and-dependencies.md`](references/versions-and-dependencies.md).
   Install Renovate, current-version tables, exact frontend pins, Rust lock/tool
   updates, and latest-stable compatibility gates.
   **Complete when:** latest stable majors are continuously detected and an older
   major cannot remain without a visible failing blocker.

8. **Enforce the selected ratchet.** Run its provider. Fail when debt grows and
   when measured debt is below its bound until the bound is tightened. Delete
   ledger entries when debt disappears.
   **Complete when:** baselines are honest snapshots, improvements are monotonic,
   and stale generous budgets cannot survive.

## Final gate

No metric exists merely because it is easy to count. Each gate names the failure
class it prevents, the narrow rerun, the correction path, its cost tier, and its
source of truth. Advisory tools never block until measured; blocking gates never
silently degrade to warnings.
