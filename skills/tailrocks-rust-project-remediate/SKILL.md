---
name: tailrocks-rust-project-remediate
description: >-
  Use only when the user explicitly requests this skill. Remediate user-approved gaps in an existing Rust workspace baseline while keeping every intermediate state buildable. Use tailrocks-rust-project-audit to discover or report gaps; this skill requires explicit approved scope.
argument-hint: "<approved gap IDs or exact remediation scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Project Remediation

Close approved Rust workspace-policy gaps in coherent, reversible slices.
Finding a gap does not grant authority to fix it.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Cite secret locations and types without copying values.

## Remediate

1. **Bind approval.** Require exact approved gaps or an equivalent explicit
   remediation scope. Record the canonical repository root, current revision,
   dirty-tree state, and allowed paths. When approval cites an audit ID, require
   the exact `RUST-PROJECT-NNN` row with its status, evidence, expected state,
   and remediation scope; refuse a missing, duplicate, reordered, or `PASS` ID.
   **Complete when:** every intended edit maps to approval; otherwise stop.
2. **Resolve the rule.** Read the relevant local references in this order:
   [`workspace-and-layout.md`](references/workspace-and-layout.md),
   [`lints-clippy-rustfmt.md`](references/lints-clippy-rustfmt.md),
   [`toolchain-and-mise.md`](references/toolchain-and-mise.md), then
   [`supply-chain-and-testing.md`](references/supply-chain-and-testing.md).
   Apply [`shared-version-policy.md`](references/shared-version-policy.md) and
   [`version-policy.md`](references/version-policy.md) when pins change.
   For an absent baseline file, copy its canonical source from
   [`../tailrocks-rust-project-setup/templates/`](../tailrocks-rust-project-setup/templates/)
   and replace marked project values; never reconstruct it from prose. Preserve
   stronger compatible local policy. **Complete when:** the desired postcondition
   and rollback boundary are explicit.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
3. **Change one layer.** Close one approved structural, policy, toolchain, or
   gate layer at a time. Keep the workspace buildable; use narrow, owned,
   reasoned exceptions for legacy debt instead of broad allows. **Complete
   when:** the slice has no unrelated edits and its precondition still matches.
4. **Verify before continuing.** Run the repository's existing format, lint,
   test, dependency, and supply-chain tasks applicable to the slice. Restore
   owned edits on failure when safe; never overwrite concurrent changes.
   **Complete when:** the slice passes, is restored, or names retained recovery
   artifacts and a precise blocker.
5. **Report.** List changed paths, approved gaps closed, exact commands and
   counts, skipped checks, remaining exceptions, and recovery state. **Complete
   when:** no unapproved gap is claimed fixed.

## Final gate

Refuse unapproved mutation, broad exception policy, silently retained older
pins, unrecorded skipped gates, or completion while recoverable state is unknown.
