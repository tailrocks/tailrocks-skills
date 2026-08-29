---
name: tailrocks-tanstack-project-remediate
description: >-
  Use only when the user explicitly requests this skill. Close exact approved TANSTACK gap-ledger rows in an existing house-stack application, using canonical references and templates in verified transactional slices. Use migrate for foreign-stack transition; never infer approval.
argument-hint: "<approved TANSTACK gap IDs and path scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TanStack Project Remediate

Close user-approved baseline gaps in an existing house-stack application. This
owner does not scaffold, audit, or perform a foreign-stack migration.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`shared-version-policy.md`](references/shared-version-policy.md), and the five
local baseline references.
Copied policy does not enlarge the exact approved gap or path scope.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Remediate

1. **Bind exact approval.** Require audit revision, approved `TANSTACK-*` IDs,
   evidence, expected state, and allowlisted paths. Re-test each gap; refuse stale,
   duplicate, reordered, passing, blocked, unapproved, or migration-shaped rows.
   Refuse discovery and scaffolding. **Complete when:** each
   write maps one-to-one to a live approved ledger row.
2. **Select canonical bytes deliberately.** Compare relevant files with setup
   [`templates/`](../tailrocks-tanstack-project-setup/templates/) and resolve
   official exact pins through the setup
   [resolver](../tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts). Use
   exact canonical bytes for absent baseline files, never reconstruct them from
   prose. Preserve stronger compatible local policy. Templates are a source,
   never blanket overwrite authority.
   **Complete when:** the minimal delta and preserved local behavior are explicit.
3. **Apply one transactional slice.** Capture exact preimages and repository
   identity; stage writes; re-check bytes before publish; never replace concurrent
   changes. Bound commands, network, retries, output, and child processes. Roll
   back only still-owned bytes and retain named recovery evidence on uncertainty.
   **Complete when:** all approved paths publish or prior bytes remain.
4. **Verify the row and surrounding contract.** Run the row-specific proof plus
   affected Bun format/type/lint/architecture/test/build gates. Re-audit the fixed
   IDs without rewriting the audit record. **Complete when:** rows now pass and no
   adjacent rule regressed.
5. **Report.** Map each approved ID to changed paths, before/after evidence, gate
   counts, skips, recovery state, and remaining gaps. **Complete when:** no work
   outside approved IDs is hidden as cleanup.

## Final gate

Every changed byte is inside the approved scope, derives from current canonical
policy, preserves local behavior, survives focused and surrounding gates, and
did not overwrite concurrent user work. Foreign-stack transition routes to
`tailrocks-tanstack-project-migrate`.
