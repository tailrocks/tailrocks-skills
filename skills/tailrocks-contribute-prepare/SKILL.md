---
name: tailrocks-contribute-prepare
description: >-
  Use only when the user explicitly requests this skill. Implement one approved external contribution in the user's dedicated fork clone and produce a local submission package. Never pushes, posts, signs, submits, or mutates the upstream project.
argument-hint: "<approved proposal and fork clone>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Prepare

Implement exactly one current approved proposal inside a dedicated fork clone.
The completed output is local branch/commit state plus a submission package;
submission authority belongs only to `tailrocks-contribute-submit`.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`contribution-handoff.md`](references/contribution-handoff.md), and
[`preparation-gate.md`](references/preparation-gate.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Prepare

1. Bind canonical target and fork identities, current recon/proposal hashes,
   explicit preparation approval, base/head revisions, dirty state, exact allowed
   paths/claim, policy, checks, disclosure, commit regime, and expiry. Refuse
   stale, unapproved, symlinked, escaping, upstream-owned, already-in-flight, or
   scope-broadened work. Never auto-stash or overwrite unrelated bytes.
2. Establish the relevant baseline with frozen existing dependencies/inputs,
   scrubbed secrets, disabled network and external caches, bounded
   time/retries/output/process tree, TERM-then-KILL cleanup,
   and nonzero unit proof. Red, vacuous, or mutation-prone baselines block.
3. Implement only the proposal in the fork. Publish each path sequentially by
   expected-preimage-to-owned-postimage CAS with receipts; never claim multi-file
   atomicity. Preserve project style and all unrelated behavior. New findings or
   scope return to proposal rather than expanding silently.
4. Add regression evidence for a defect and run every discovered focused/full
   gate. Recheck base drift, diff allowlist, generated artifacts, documentation,
   templates, changelog regime, disclosure placement, and exclusion of
   `contrib/` plus agent metadata from the target diff.
5. Create only policy-compliant unsigned local commits with explicit local
   commit authority. Never add or amend a legal signoff, accept an agreement, or
   fabricate attribution/disclosure; those acts belong only to submit.
6. Write `pr_description.md` and `prepare-receipt.json`, then append `log.md`,
   each by CAS. On failure restore each preimage only when current bytes still
   equal this invocation's owned postimage; preserve concurrent replacements and
   report surviving paths/recovery artifacts.

## Machine transition

Obtain the loader-provided absolute path of this installed `SKILL.md`; ignore
ambient path variables and target-repository lookalikes. After local commits and
gates, run its sibling `scripts/contribute-prepare.ts --skill-file
<that-absolute-SKILL.md>` with exactly one bounded
`tailrocks.contribution-stage-input/v1` JSON object on stdin. The helper proves
the canonical clean fork HEAD, exact base diff and sorted changed-path allowlist,
refuses handoff or agent metadata in that diff, rejects every approval, external
action, and remote receipt, binds exact recon/proposal predecessors, and
publishes exactly `prepare-receipt.json`, `pr_description.md`, and append-only
`log.md` bytes by CAS. Only its `tailrocks.contribution-stage/v1` success receipt
permits `PREPARED`; refusal or recovery state is terminal.

## Output and final gate

Return exactly one `PREPARED`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`
receipt with target/fork
identity, input approvals/hashes, changed paths, local commits, command/unit
receipts, disclosure, exact handoff writes, partial state, and recovery. No
network, install, credential use, signoff, push, issue/PR/comment, or upstream
mutation. `PREPARED` means no partial mutation survives; otherwise return
`RECOVERY_REQUIRED`.
