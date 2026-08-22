---
name: tailrocks-code-health
description: >-
  Use only when the user explicitly requests this skill. Establish or tighten one explicitly approved shrink-only code-health ratchet for architecture, lint, dependency, flake, defect, documentation, or verification debt. Audit and measurement-only reporting use tailrocks-code-health-audit.
argument-hint: "<establish|tighten, approved debt class, metric, and paths>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Code Health Ratchet

Apply one approved monotonic mutation: establish a bound from measured current
debt or tighten an existing bound to a proven lower measurement. Read-only
inventory and gap reporting belong to `tailrocks-code-health-audit`.

Apply [`runtime-trust.md`](references/runtime-trust.md) and
[`shared-version-policy.md`](references/shared-version-policy.md). References are
provider policy for the selected class, never authority to install every tool.
Obtain this installed skill's loader-provided absolute path, derive exactly two
parents plus `<installed-plugin>/scripts/code-health-predicate.ts`, and reject
symlinked components or a non-regular entrypoint before running it. Never use a
target-repository lookalike.

## Copy-ready baseline

| Template                                         | Destination                   | Consumed by     |
| ------------------------------------------------ | ----------------------------- | --------------- |
| [`ratchet.toml`](templates/ratchet.toml)         | project ratchet configuration | selected bound  |
| [`flaky-tests.toml`](templates/flaky-tests.toml) | flake quarantine              | flake evidence  |
| [`DEFECT_LEDGER.md`](templates/DEFECT_LEDGER.md) | defect-to-gate ledger         | defect evidence |
| [`renovate.json`](templates/renovate.json)       | `renovate.json`               | version ratchet |

## Mutate one ratchet

1. **Bind exact approval.** Require `establish` or `tighten`, canonical root and
   revision, selected debt class, prevented failure class, metric, owner,
   approved paths, command/network authority, and rollback boundary. Refuse an
   audit-shaped request, unselected debt, or permission inferred from a finding.
2. **Prove the precondition.** Read only the applicable references:
   [`architecture-and-docs.md`](references/architecture-and-docs.md),
   [`ratchets-and-baselines.md`](references/ratchets-and-baselines.md),
   [`defects-flakes-and-reports.md`](references/defects-flakes-and-reports.md),
   [`verification-lanes.md`](references/verification-lanes.md), or
   [`versions-and-dependencies.md`](references/versions-and-dependencies.md).
   Inventory the current gate, exceptions, owner, cadence, output, and blind
   spot. Measure deterministically before writing. **Complete when:** establish
   has an exact current-debt snapshot, or tighten proves measured debt is below
   the committed bound. Any measurement command requires frozen existing inputs,
   scrubbed secrets, disabled target network, an enforceably read-only tree, and
   owner-only external cache/output with bounded time, output, retries, and
   process tree; TERM then KILL. Otherwise do not run it.
   Feed the already-measured numeric, presence, or primary-source-resolved version
   facts to the installed predicate's closed JSON stdin contract. Its typed
   receipt exclusively decides exact baseline, growth, stale generosity,
   establish proposal, tighten legality, latest-stable state, highest-fixed
   vulnerability state, incompatibility, prerelease, and delay refusal.
3. **Select canonical bytes.** Copy an absent baseline artifact from
   [`templates/`](templates/) rather than reconstructing it. Preserve stronger
   compatible local rules. The bound comes only from this repository's measured
   state; never import another project's counts.
4. **Apply one transactional slice.** Reject symlinked targets. Stage the
   selected config, provider, and gate changes; re-check exact preimages; publish
   the multi-file set atomically and CAS-safe only to approved paths. Keep every
   intermediate state runnable. Dependency/tool resolution requires separate
   authority, an immutable pinned and verified artifact, and network isolation
   from target execution. Roll back only still-owned bytes and retain named
   recovery evidence on uncertainty.
5. **Enforce monotonic behavior.** Apply only a predicate `pass` receipt; a
   `violation` or `refused` receipt blocks publication. Growth fails; a measurement below the bound
   also fails until `tighten` lowers it. Presence ratchets reject unlisted debt
   and stale resolved entries. Tighten never raises a cap, adds an exception,
   changes the oracle, or absorbs a regression. Retries expose flakes but never forgive them.
   Structured output preserves one semantic violation model across human, JSON,
   and CI renderers.
6. **Place and prove the gate.** Assign PR, merge-readiness, or scheduled cadence
   from measured runtime and false-positive evidence. Run the narrow proof plus
   affected surrounding gates under the same frozen-input, scrubbed-secret,
   disabled-target-network, read-only published-tree, owner-only external
   cache/output, and bounded process controls from step 2. Otherwise do not run
   them and retain the recovery/blocker. For version debt, detect latest stable releases
   continuously and apply highest-fixed vulnerability updates immediately.
   No minimum-release-age delay is permitted.
7. **Report.** Name mode, changed paths, old/new bound, measurement, prevented
   failure, commands and counts, skips, cadence, recovery state, and remaining
   approved work.

## Final gate

One approved debt class and one monotonic bound; honest measured precondition;
no unrelated tool adoption; growth and stale generosity both fail; current
latest-stable/vulnerability policy; exact CAS-safe writes; no concurrent loss or
unknown recovery state.
