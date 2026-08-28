---
name: tailrocks-contribute-respond
description: >-
  Use only when the user explicitly requests this skill. Handle one submitted contribution's current review round through approved local fixes and separately approved remote actions. Never auto-posts, auto-pushes, escalates, or carries approval between actions.
argument-hint: "<submitted contribution handoff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Respond

Advance one submitted contribution through its next review state. Fetching,
local correction, push, reply, retest, close, or withdrawal are distinct
transactions; one approval never carries to another.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`contribution-handoff.md`](references/contribution-handoff.md), and
[`review-response.md`](references/review-response.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Respond

1. Bind target/fork/PR identity, contribution receipts/hashes, current local and
   remote revisions, last handled review IDs, revision regime, pacing window,
   credentials scope, and expiry. Reject ambiguity, stale or contradictory
   handoff, escaping/symlinked paths, and another in-flight response transaction.
2. Before fetching reviews/checks/comments, require fresh approval bound to exact
   host/PR/endpoints and transmitted identity. Fetch bounded pages from one
   origin, scrub secrets, and record immutable response IDs/hashes.
3. Classify each new item as answer, code change, rerun request, maintainer-only
   action, rejection, or terminal state. Draft replies in the user's accountable
   voice, cite evidence, and never fabricate agreement, insult, pressure,
   relitigate rejection, or publish a generated escalation.
4. Local fixes require explicit exact scope and use the prepare owner's command,
   oracle, diff-hygiene, CAS, and recovery contract without invoking that skill.
   Recheck the recorded revision regime before producing fixup or rerolled
   commits. New scope returns to proposal.
5. Immediately before each push, comment/reply, retest command, close,
   withdrawal, or other remote mutation, present its exact payload/target and
   current remote state; require a separate fresh approval and revalidate both.
   Never batch authority across messages or endpoints.
6. After each action, verify the exact remote receipt and HEAD. Stop on drift or
   uncertain success; deduplicate by immutable remote ID/body hash before retry.
   Remote actions are not rollbackable—report partial state and safe resume.
7. Publish `response.json` and `log.md` by per-file CAS. Finish only on current
   awaiting-review, merged, withdrawn, or rejected truth; preserve concurrent
   local replacements and name recovery artifacts.

## Machine transition

Obtain the loader-provided absolute path of this installed `SKILL.md`; ignore
ambient path variables and target-repository lookalikes. After each separately
approved action has an immutable remote receipt, run its sibling
`scripts/contribute-respond.ts --skill-file <that-absolute-SKILL.md>` with exactly one bounded
`tailrocks.contribution-stage-input/v1` JSON object on stdin. The helper proves
the canonical clean fork/base/HEAD/diff, binds every action's host, target,
payload and before-state hash to one unique approval no longer than five minutes
and one unique successful receipt, requires a current `GET` receipt, binds the
exact submitted predecessor, and publishes exactly `response.json` plus
append-only `log.md` bytes by CAS. Only its
`tailrocks.contribution-stage/v1` success receipt permits the recorded response
state; refusal or recovery state is terminal and grants no retry authority.

## Output and final gate

Return exactly one `UPDATED`, `DRAFTED`, `BLOCKED`, `REFUSED`, or
`RECOVERY_REQUIRED` receipt with fetched/action identities, per-action
approvals, local/remote hashes, receipts, unanswered items, partial state, and
recovery. No unapproved network, credential, edit, commit, push, message, retest,
close, merge, withdrawal, or other outward action.
