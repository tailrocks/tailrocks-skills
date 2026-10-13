---
name: tailrocks-rust-project-remediate
description: >-
  Use only when the user explicitly requests this skill. Remediate user-approved gaps in an existing Rust workspace baseline while keeping every intermediate state buildable. Use tailrocks-rust-project-audit to discover or report gaps. This skill requires explicit approved scope.
argument-hint: "<approved gap IDs or exact remediation scope>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Project Remediation

## Use this skill

This skill closes approved Rust workspace-policy gaps in coherent,
reversible slices. It keeps every intermediate state buildable. Finding a
gap does not grant authority to fix it.

Use this skill only when the user explicitly requests it. Do not use this
skill to discover gaps. Gap discovery belongs to
`tailrocks-rust-project-audit`. This skill requires explicit approved
scope.

## Before you start

Obey the active user request first. Require exact approved gaps or an
equivalent explicit remediation scope.

Before any action, read `references/runtime-trust.md`. Cite secret
locations and types without copying values.

The skill accepts one argument: the approved gap IDs or exact remediation
scope. Without explicit approval, stop and ask.

## Procedure

1. **Bind approval.** Record the canonical repository root, current
   revision, dirty-tree state, and allowed paths. When approval cites an
   audit ID, require the exact `RUST-PROJECT-NNN` row with its status,
   evidence, expected state, and remediation scope. Refuse a missing,
   duplicate, reordered, or `PASS` ID. This step is complete when every
   intended edit maps to approval. Otherwise stop.
2. **Resolve the rule.** Read the relevant local references in this
   order: `references/workspace-and-layout.md`,
   `references/lints-clippy-rustfmt.md`,
   `references/toolchain-and-mise.md`, then
   `references/supply-chain-and-testing.md`. When pins change, apply
   `references/shared-version-policy.md` first. Then apply
   `references/version-policy.md`. For an absent baseline file, copy its
   canonical source from
   [`../tailrocks-rust-project-setup/assets/`](../tailrocks-rust-project-setup/assets/).
   Replace marked project values. Never reconstruct it from prose.
   Preserve stronger compatible local policy. This step is complete when
   the desired postcondition and rollback boundary are explicit.
3. **Change one layer.** Close one approved structural, policy,
   toolchain, or gate layer at a time. Keep the workspace buildable. Use
   narrow, owned, reasoned exceptions for legacy debt instead of broad
   allows. This step is complete when the slice has no unrelated edits
   and its precondition still matches.
4. **Verify before continuing.** Run the existing format, lint, test,
   dependency, and supply-chain tasks of the repository that apply to the
   slice. If the slice fails, restore owned edits when safe. Never
   overwrite concurrent changes. This step is complete when the slice
   passes, is restored, or names retained recovery artifacts and a
   precise blocker.
5. **Report.** List changed paths, approved gaps closed, exact commands
   and counts, skipped checks, remaining exceptions, and recovery state.
   This step is complete when no unapproved gap is claimed fixed.

## Result

The working tree holds the closed gaps with the workspace buildable. The
report lists changed paths, approved gaps closed, exact commands and
counts, skipped checks, remaining exceptions, and recovery state.

## Completion checks

Before the result is complete, make sure that each item below is true:

- Every intended edit mapped to approval.
- No broad exception policy was added.
- No older pin was silently retained.
- No skipped gate lacks a record.
- No recoverable state is unknown at completion.

## References

Resolve each relative link against the directory that contains this
SKILL.md file, never the plugin skills root.

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the trust
  rules.
- Read `references/workspace-and-layout.md`,
  `references/lints-clippy-rustfmt.md`,
  `references/toolchain-and-mise.md`, and
  `references/supply-chain-and-testing.md` in step 2 in the stated order.
- Read `references/shared-version-policy.md` and
  `references/version-policy.md` in step 2 when pins change.
