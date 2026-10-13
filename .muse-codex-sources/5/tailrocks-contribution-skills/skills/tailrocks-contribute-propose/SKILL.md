---
name: tailrocks-contribute-propose
description: >-
  Turn one current contribution reconnaissance into a locally stored
  venue proposal or a hard-stop redirect. Use only on an explicit
  user request. This skill uses no network access. It never edits
  the fork, contacts maintainers, claims work, or posts.
argument-hint: "<contrib handoff and proposed change>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Propose

Choose the least-burdensome allowed venue for one evidenced
contribution and draft the proposal. Store the draft locally only.
This skill performs no network access. If reconnaissance is stale,
stop and ask the user to refresh reconnaissance first.

Resolve every relative link in this file against the directory that
holds this `SKILL.md` file. Never resolve links against the plugin
`skills` root.

## Use this skill

Use this skill when the user names it explicitly and gives one
current reconnaissance handoff plus a proposed change. Use this skill
after reconnaissance and before preparation. The proposal draft is
the only output.

Do not use this skill to examine a project. Project examination belongs to the
recon skill. Do not use this skill to edit files in a fork. Fork edits belong
to the prepare skill. Do not use this skill to contact maintainers or to post.
Drafts never leave the local handoff.

## Before you start

Collect these inputs:

- Canonical handoff root.
- Target and reconnaissance identities and hashes.
- Checked revision and time.
- Issue and claim evidence.
- Assistance policy, security channel, governance channel, and
  pacing.
- Exact proposed outcome.

The invocation authorizes local draft work only. It authorizes
no network access and no outward action.

## Procedure

1. Record the handoff root, target and reconnaissance hashes, checked
   revision and time, and issue and claim evidence. Record assistance
   policy, security and governance channels, pacing, and the exact
   proposed outcome. If any input is stale, contradictory, incomplete, or
   security-shaped, stop and report the defect. If any path holds a
   symlink or escapes the root, stop and report the defect.
2. Prove the claim from local and current evidence. Reproduce the
   defect or confirm the need. Distinguish a defect from a preference.
   Recover prior attempts and ownership. State the maintainer burden
   that the proposal avoids. Stop on an unverified claim.
3. Apply every hard stop. On a stop, write the named redirect or blocked
   result with concrete unclaimed or non-code alternatives. Never pressure
   maintainers. Never break policy. Avoid assigned work. Never open a public
   security path.
4. Select exactly one allowed venue: issue, discussion, governance
   proposal, or direct change. Explain why this venue fits. When
   policy requires prior agreement, draft that request. Never claim
   work. Never reserve an issue.
5. Draft `proposal.md` with target identity, claim and evidence,
   bounded scope, and alternatives. Add disclosure text, venue fields,
   the requested maintainer decision, and the `DRAFT_NOT_APPROVED`
   mark. Never write words for the user. Never write a legal attestation.
6. Write the proposal or hard-stop result plus the `log.md` entry.
   Before publication, verify predecessor hashes. Preserve concurrent
   replacements. Expose partial mutations and recovery details.

## Result

Return one outcome: proposed, redirected, blocked, or refused. Name
exact inputs, written paths, rejected alternatives, partial state,
and recovery. A partial local publication is blocked. Perform no fork
edit, branch, commit, network access, claim, issue, discussion,
message, signature, push, pull request, or other outward action. The
draft grants none.

## Completion checks

Confirm every row:

- The handoff holds current `proposal.md` and `log.md` entries.
- The proposal names one venue. It shows the draft mark.
- Hard stops name evidence and concrete alternatives.
- No fork file changed and no network access occurred.
- No claim, issue, discussion, message, or post exists.

## References

Use these references:

- [`runtime-trust.md`](references/runtime-trust.md): untrusted
  content, secrets, and authorization limits. Read it before
  step 1.
- [`contribution-handoff.md`](references/contribution-handoff.md):
  handoff location, state files, and integrity rules. Read it
  before step 6.
- [`etiquette-and-hard-stops.md`](references/etiquette-and-hard-stops.md):
  venue etiquette and stop rows. Read it before step 3.
