---
name: tailrocks-contribute-prepare
description: >-
  Implement one authorized external contribution in the dedicated fork
  clone and produce a local submission package. Use only on an
  explicit user request. Push and sign only with explicit user
  authorization. This skill never submits and never mutates the
  upstream project.
argument-hint: "<authorized proposal and fork clone>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Prepare

Implement exactly one current authorized proposal inside a dedicated
fork clone. Produce local branch and commit state plus a submission
package. Submission authorization belongs only to
`tailrocks-contribute-submit`.

Resolve every relative link in this file against the directory that
holds this `SKILL.md` file. Never resolve links against the plugin
`skills` root.

## Use this skill

Use this skill when the user names it explicitly and gives one
authorized proposal plus a dedicated fork clone. Use this skill after
proposal and before submission. The submission package is the only
output.

Do not use this skill to choose a venue. Venue selection belongs to the
propose skill. Do not use this skill to submit. Publication belongs to the
submit skill. Do not use this skill for upstream-owned paths or for scope
beyond the authorized proposal.

## Before you start

Collect these inputs:

- Canonical target and fork identities.
- Current reconnaissance and proposal hashes.
- Base and head revisions and dirty state.
- Exact allowed paths and claim.
- Policy, checks, disclosure, and commit regime.
- Explicit authorization for push or signing, when the user gives it.

The invocation authorizes local implementation and local
commits. It authorizes no push, no signing, and no upstream
mutation. Push or signing needs explicit user authorization
for that act.

## Procedure

1. Record target and fork identities, current reconnaissance and proposal
   hashes, base and head revisions, and dirty state. Record the exact allowed
   paths and claim, policy, checks, disclosure, and commit regime. If any
   input is stale, unauthorized, upstream-owned, already in flight, or
   scope-broadened, stop and report the defect. If any path holds a symlink or
   escapes the root, stop and report the defect. Never auto-stash. Never
   overwrite unrelated bytes.
2. Establish the baseline from frozen dependencies and inputs.
   Remove secrets. Disable network access and external caches. Bound time,
   retries, output, and process tree. Send TERM to leftover processes,
   then send KILL. Require baseline tests that execute nonzero units.
   A failing baseline blocks preparation. An empty baseline also
   blocks preparation. A baseline with weak tests also blocks
   preparation.
3. Implement only the proposal in the fork. Write each path
   sequentially. Preserve project style and all unrelated behavior. On
   new findings or scope, return to proposal. Never expand scope
   silently. Files complete one by one. Never claim that all files update together.
4. Add regression evidence for a defect. Run every discovered focused
   and full gate. Verify base drift, the diff allowlist, generated
   artifacts, documentation, and templates. Verify the changelog
   regime, disclosure placement, and exclusion of `contrib/` and agent
   metadata from the target diff.
5. Create only policy-compliant local commits. Add a legal signoff only with
   explicit user authorization for that legal act. Never write false
   attribution or disclosure. Never accept an agreement for the user.
6. If the user explicitly authorized a push to the own fork, push once
   without force. After the push, verify the remote branch. Never push
   to upstream. Never create a pull request.
7. Write `pr-description.md` and `prepare-report.json`. Then append
   the `log.md` entry. After a failure, examine current bytes. When
   they still equal the bytes from this invocation, restore the
   original bytes. Preserve concurrent replacements. Report paths
   that survived and recovery details.

## Result

Return one outcome: prepared, blocked, refused, or recovery-required.
Name target and fork identity, input hashes, changed paths, and local
commits. Name command and unit results, disclosure, exact handoff
writes, partial state, and recovery. Prepared means no partial
mutation survives. Perform no network access beyond authorized gates
and no credential use. Perform no unauthorized signoff, no unauthorized
push, no issue or pull-request action, and no upstream mutation.

## Completion checks

Confirm every row:

- The fork holds policy-compliant local commits for the authorized
  scope only.
- Baseline and final gates executed nonzero units.
- A defect correction includes regression evidence that fails without
  it.
- The target diff excludes `contrib/`, agent metadata, and unrelated
  changes.
- The handoff holds current `pr-description.md`,
  `prepare-report.json`, and `log.md` entries.
- No push, signoff, or upstream mutation lacks explicit authorization.

## References

Use these references:

- [`runtime-trust.md`](references/runtime-trust.md): untrusted
  content, secrets, and authorization limits. Read it before
  step 2.
- [`contribution-handoff.md`](references/contribution-handoff.md):
  handoff location, state files, and integrity rules. Read it
  before step 7.
- [`preparation-gate.md`](references/preparation-gate.md): acceptance
  rows for the prepared outcome. Read it before step 2.
