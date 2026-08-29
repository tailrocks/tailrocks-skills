---
name: tailrocks-swift-project-remediate
description: >-
  Use only when the user explicitly requests this skill. Close exact approved SWIFT-PROJECT gap-ledger rows in an existing native macOS project using canonical references and templates in transactional buildable slices. Never infer approval or discover scope.
argument-hint: "<approved SWIFT-PROJECT gap IDs and path scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Project Remediation

Close approved baseline gaps in an existing project. This owner does not
scaffold, audit, wire agent knowledge, or add a Rust-core lane.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`shared-version-policy.md`](references/shared-version-policy.md), and the four
local baseline references. Policy never enlarges approval.

## Remediate

1. **Bind exact approval.** Require audit revision, ordered approved
   `SWIFT-PROJECT-*` rows, evidence, expected state, and allowlisted paths.
   Re-test each gap; refuse stale, duplicate, reordered, passing, blocked, or
   unapproved rows. Mid-feature baseline edits require the roadmap item or user
   to name that work explicitly; refuse feature rearchitecture, agent
   integration, Rust-core integration, and unrelated baseline debt. Record root,
   revision, dirty state, and preimages. **Complete
   when:** every write maps one-to-one to a live approved row.
2. **Select canonical policy.** Read relevant references in this order:
   [`project-generation.md`](references/project-generation.md),
   [`toolchain.md`](references/toolchain.md),
   [`lint-and-format.md`](references/lint-and-format.md), then
   [`testing.md`](references/testing.md). For absent baseline files, copy exact
   bytes from setup [`templates/`](../tailrocks-swift-project-setup/templates/)
   and replace marked values literally. Resolve official exact pins; preserve
   stronger compatible local policy. Templates are sources, not blanket
   overwrite authority.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
3. **Apply one buildable transaction.** Close one approved generation,
   toolchain, policy, or test layer. Stage writes, re-check exact preimages, and
   publish with compare-and-swap semantics. Bound commands, network, retries,
   output, and child processes. Never overwrite concurrent changes; roll back
   only still-owned bytes and retain named recovery evidence on uncertainty.
4. **Verify before continuing.** Run the affected committed `mise` tasks and
   row-specific proof, including test-count assertions where relevant. Recheck
   the approved IDs without rewriting their audit record. **Complete when:**
   fixed rows pass, adjacent rules do not regress, and intermediate state builds.
5. **Report.** Map each approved ID to changed paths, pre/post evidence, command
   counts, skips, recovery state, and remaining gaps. No unrelated cleanup.

## Final gate

Every changed byte is approved, canonical, current, buildable, and verified;
no inferred scope, blanket overwrite, concurrent loss, or unknown recovery
state. Specialist work routes separately.
