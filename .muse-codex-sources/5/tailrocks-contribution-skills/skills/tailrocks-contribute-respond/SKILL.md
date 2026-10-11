---
name: tailrocks-contribute-respond
description: >-
  Advance one submitted contribution through its next review state
  with authorized local fixes and authorized remote actions. Use only
  on an explicit user request. Authorization for one action never
  covers another action. This skill never acts without authorization
  and never protests publicly.
argument-hint: "<submitted contribution handoff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Respond

Advance one submitted contribution through its next review state. A
fetch, a local correction, a push, a reply, a retest, a close, and a
withdrawal are distinct transactions. Authorization for one action
never covers another action.

Resolve every relative link in this file against the directory that
holds this `SKILL.md` file. Never resolve links against the plugin
`skills` root.

## Use this skill

Use this skill when the user names it explicitly and gives one
submitted contribution handoff. Use this skill after submission. One
review round is the scope.

Do not use this skill to submit. Publication belongs to the submit skill.
Do not use this skill for new scope. New scope returns to proposal.
Do not use this skill to reopen a rejection or to protest publicly.

## Before you start

Collect these inputs:

- Target, fork, and pull-request identity.
- Contribution hashes.
- Current local and remote revisions.
- Handled review identities.
- Revision regime and pacing window.
- Credential scope.

The invocation authorizes review and check reads. Each remote
mutation needs explicit user authorization for that act.

## Procedure

1. Record target, fork, and pull-request identity, contribution
   hashes, and current local and remote revisions. Record handled
   review identities, the revision regime, pacing window, and
   credential scope. If any input is ambiguous, stale, or
   contradictory, stop and report the defect. If any path holds a
   symlink or escapes the root, stop and report the defect. If another
   response transaction is in flight, stop and report the defect.
2. Fetch current reviews, checks, and comments. Use bounded pages
   from one origin. Remove secrets. Record immutable response
   identities and hashes.
3. Classify each new item as answer, code change, rerun request,
   maintainer-only action, rejection, or terminal state. Draft replies in the
   accountable user's voice and cite evidence. Never write false agreement.
   Never insult. Never pressure maintainers. Never reopen a rejection. Never
   publish a generated protest.
4. For local fixes, require explicit exact scope. Use the prepare
   revision, verification, and diff-hygiene rules without
   invoking that skill. Before appended or revised commits, verify the recorded
   revision regime. New scope returns to proposal.
5. Before each remote mutation, present its exact payload and target plus
   current remote state. Remote mutations include push, comment, reply, retest
   command, close, and withdrawal. Require separate explicit authorization for
   that act. Before execution, revalidate both. Never batch authorization
   across messages or endpoints.
6. After each action, verify the exact remote confirmation and HEAD. On drift
   or uncertain success, stop. Before retry, deduplicate by immutable remote
   identity and body hash. Remote actions have no rollback. Report partial
   state and safe resume.
7. Write `response.json` and the `log.md` entry. Finish only when the current
   state is awaiting-review, merged, withdrawn, or rejected. Preserve
   concurrent local replacements. Name recovery details.

## Result

Return one outcome: updated, drafted, blocked, refused, or
recovery-required. Name fetched and action identities, per-action
authorizations, local and remote hashes, confirmations, unanswered
items, partial state, and recovery. Perform no unauthorized network,
credential, edit, commit, push, message, retest, close, merge,
withdrawal, or other outward action.

## Completion checks

Confirm every row:

- Every new review item is answered, fixed with evidence, or
  respectfully declined.
- The recorded revision regime governs all fix commits.
- Each remote mutation has its own explicit authorization.
- No force-push lacks exact authorization.
- `response.json` and `log.md` record the round outcome.
- Unanswered items, partial state, and recovery are named, when
  present.

## References

Use these references:

- [`runtime-trust.md`](references/runtime-trust.md): untrusted
  content, secrets, and authorization limits. Read it before
  step 2.
- [`contribution-handoff.md`](references/contribution-handoff.md):
  handoff location, state files, and integrity rules. Read it
  before step 7.
- [`review-response.md`](references/review-response.md): revision
  regime and review conduct. Read it before step 3.
