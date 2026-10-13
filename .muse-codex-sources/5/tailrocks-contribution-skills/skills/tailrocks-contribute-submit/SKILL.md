---
name: tailrocks-contribute-submit
description: >-
  Submit one current prepared external contribution through the
  authorized push and pull-request actions. Use only on an explicit
  user request. Revalidates remote state before every action and
  reports partial publication honestly.
argument-hint: "<prepared contribution handoff>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Submit

Publish one prepared contribution. The explicit user submission request
authorizes the named push and pull-request actions. A signoff or legal
acceptance needs explicit user authorization immediately before the act.
Immediately before each action, revalidate state.

Resolve every relative link in this file against the directory that
holds this `SKILL.md` file. Never resolve links against the plugin
`skills` root.

## Use this skill

Use this skill when the user names it explicitly and gives one
current prepared handoff. Use this skill after preparation.
Publication is the only output.

Do not use this skill to implement changes. Implementation belongs to the
prepare skill. Do not use this skill to answer reviews. Review responses
belong to the respond skill. Do not use this skill when the prepared state is
stale or the gates are missing.

## Before you start

Collect these inputs:

- Canonical target, fork, and remote identities.
- Current local HEAD and dirty state.
- Reconnaissance, proposal, and preparation hashes.
- Exact commits and diff.
- Base revision, venue, and disclosure.
- Legal requirements and pull-request body.
- Credential identity and scope.
- Pacing state.

The invocation authorizes remote identity and check reads for
revalidation.

## Procedure

1. Record canonical target, fork, and remote identities, current
   local HEAD, and dirty state. Record reconnaissance, proposal, and
   preparation hashes, exact commits and diff, base revision, venue,
   and disclosure. Record legal requirements, the pull-request body,
   credential identity and scope, and pacing state. If any input
   shows drift, ambiguity, symlink escape, or missing gates, stop and
   report the defect. If any input shows policy conflict, handoff
   files in the target diff, or unrelated commits, stop and report
   the defect.
2. Refresh required remote identity and check data. Use bounded
   pages, time, output, and processes. Use one origin. Remove secrets.
   Never echo credentials. If any claim, ownership, policy, base,
   remote, or open pull-request cap changed, stop. The submission is
   invalid.
3. Present the exact diff and commits, current gate results, full
   pull-request body, disclosure, target, base, and head, and all
   actions. Confirm that the explicit submission request covers these
   exact actions. If it does not, stop and ask the user.
4. If a signoff or legal acceptance is required, request separate
   human attestation. The request immediately precedes the local
   signing act. After any signed or amended commit, repeat step 3.
5. Immediately before the push, revalidate all bindings. Push once
   without force. Verify the remote branch holds the exact commits.
   Record the remote confirmation. Never use force without separate
   explicit authorization.
6. Revalidate that no equivalent pull request exists. Create the pull
   request from an exact body file. Verify the returned repository,
   base, head, body, and URL. Never interpolate prose into a shell
   command.
7. After each state transition, write `submission.json` and the
   `log.md` entry. Remote actions are irreversible here. Never claim
   rollback. On failure, stop. Name exact local and remote partial state plus
   the safe resume or recovery action.

Example publication commands (shell):

```sh
git push origin HEAD:refs/heads/contrib/issue-slug
gh pr create --repo OWNER/REPO --base BASE --head USER:BRANCH \
  --title "TITLE" --body-file pr-description.md
```

## Result

Return one outcome: submitted, blocked, refused, or recovery-required.
Name every action identity, local and remote hashes, URL,
confirmations, disclosure, partial state, and recovery. Perform no
unauthorized signing, amend, network request, credential use, push,
force-push, pull-request, issue, comment, close, merge, or other
outward action.

## Completion checks

Confirm every row:

- The remote branch contains the exact pushed commits.
- The pull request matches the presented body and head.
- `submission.json` and `log.md` record every transition.
- No signing, amend, push, or pull-request action lacks explicit
  authorization.
- Partial state and recovery actions are named, when present.

## References

Use these references:

- [`runtime-trust.md`](references/runtime-trust.md): untrusted
  content, secrets, and authorization limits. Read it before
  step 2.
- [`contribution-handoff.md`](references/contribution-handoff.md):
  handoff location, state files, and integrity rules. Read it
  before step 7.
- [`submission-protocol.md`](references/submission-protocol.md):
  revalidation and publication order. Read it before step 1.
