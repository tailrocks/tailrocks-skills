---
name: tailrocks-contribute-submit
description: >-
  Use only when the user explicitly requests this skill. Submit one current prepared external contribution through exact separately approved legal, push, and PR actions. Revalidates remote state before every action and reports partial publication honestly.
argument-hint: "<prepared contribution handoff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Submit

Publish one prepared contribution. A prepare receipt, prior approval, or skill
invocation grants no outward authority. Every legal or remote mutation receives
fresh action-specific approval immediately before execution.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`contribution-handoff.md`](references/contribution-handoff.md), and
[`submission-protocol.md`](references/submission-protocol.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Submit

1. Bind canonical target/fork/remotes, current local HEAD and dirty state,
   recon/proposal/prepare hashes, exact commits/diff, base revision, venue,
   disclosure, legal requirements, PR body hash, credentials identity/scope,
   pacing state, and expiry. Refuse drift, ambiguity, symlink escape, missing
   gates, policy conflict, target-diff handoff files, or unrelated commits.
2. Refresh required remote identity/check data only after fresh approval for the
   exact read request. Use bounded pages/time/output/processes, one origin,
   scrubbed secrets, and no credential echo. Any changed claim, ownership,
   policy, base, remote, or open-PR cap invalidates submission.
3. Present the exact diff/commits, current nonzero gate receipts, full PR body,
   disclosure, target/base/head, and all actions. Obtain fresh user approval for
   this exact submission; it authorizes no legal attestation or action by itself.
4. If a signoff or legal acceptance is required, request separate exact human
   attestation immediately before the local signing/amend action. Re-hash the
   resulting commits and invalidate prior push/PR approvals.
5. Request fresh push approval bound to remote URL, branch, commit IDs, credential
   identity, and force mode (`false` unless separately approved). Revalidate all
   bindings immediately before one bounded push. Record the remote receipt.
6. After proving the remote branch contains the exact commits, request fresh PR
   creation approval bound to host/repository, base/head, title/body hash,
   disclosure, and draft state. Create through an exact body file; never
   interpolate prose into a shell command.
7. Publish `submission.json` and `log.md` by CAS after each state transition.
   Remote actions are irreversible here: never claim rollback. On failure stop,
   name exact local/remote partial state and the safe resume or recovery action.

## Machine transition

Obtain the loader-provided absolute path of this installed `SKILL.md`; ignore
ambient path variables and target-repository lookalikes. After each separately
approved action has an immutable remote receipt, run its sibling
`scripts/contribute-submit.ts --skill-file <that-absolute-SKILL.md>` with exactly one bounded
`tailrocks.contribution-stage-input/v1` JSON object on stdin. The helper proves
the canonical clean fork/base/HEAD/diff, binds every action's host, target,
payload and before-state hash to one unique approval no longer than five minutes
and one unique successful receipt, requires distinct `PUSH` and `CREATE_PR`
receipts, binds exact preparation predecessors, and publishes exactly
`submission.json` plus append-only `log.md` bytes by CAS. Only its
`tailrocks.contribution-stage/v1` success receipt permits `SUBMITTED`; refusal
or recovery state is terminal and grants no retry authority.

## Output and final gate

Return exactly one `SUBMITTED`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`
receipt with every approval/action identity, local/remote hashes,
URL, receipts, disclosure, partial state, and recovery. No unapproved signing,
amend, network request, credential use, push, force-push, PR/issue/comment,
close, merge, or other outward action.
