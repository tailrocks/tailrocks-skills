# Plan 031: Bootstrap protected release authority

> **Executor instructions**: After Plan 043 merges the whole implementation in
> its one branch and one pull request, run one attended external-only repository-
> administration operation from the detached atomic merge. Create the exact
> GitHub environment only if absent, or verify it if already identical; enable
> repository-enforced immutable releases only with explicit authorization.
> Configure no secret and create no tracked edit, commit, branch, ref, or PR.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until Plan 043's sole implementation PR is atomically
  merged and an administrator provides explicit reviewer identities plus
  environment/repository-setting mutation authorization
- **Effort**: S; one session, attended
- **Risk**: HIGH
- **Depends on**: plan 043
- **Covers**: G08, G14, G15
- **Guardrails**: N06, N07, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-24, F4-27, F4-28,
  F4-32, F4-33, F4-35, F4-36, F4-38, F4-44
- **Planned at**: design baseline `1e809bd`; external identities resolved live

## Why this matters

Naming a protected environment in workflow YAML does not create reviewer or
branch protection. Calling release assets immutable does not enable repository
immutable-release enforcement. One explicit admin operation must establish and
read back both authorities before protected operations can claim attended
execution and before a release can claim non-replaceable assets.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<plan-043-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_SHA="$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_ENVIRONMENT_TMP="$(mktemp -d /tmp/tailrocks-protected-environment.XXXXXX)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/branches/main --jq .protected)" = 'true'
TAILROCKS_IMMUTABLE_RELEASES="$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)"
test "$TAILROCKS_IMMUTABLE_RELEASES" = 'true' -o "$TAILROCKS_IMMUTABLE_RELEASES" = 'false'
```

Expected: clean detached checkout with
`HEAD == origin/main == <atomic-merge-sha>`, exact `MERGED` PR/merge-commit
readback for Plan 043's sole implementation PR, and protected `main`. Any
attached/dirty/drifted checkout or PR mismatch blocks before an API mutation.

Resolve each explicitly approved reviewer login/team slug to immutable numeric
ID using GitHub REST. Require one to six reviewers, all with repository read
access, none equal to the dispatching operator when represented as a user. Check
the current environment: 404 permits create; exact equality permits no-op;
anything else blocks rather than overwriting. Record immutable-release state;
`false` permits only the separately authorized enable path below.

## Spec contract

### Requirement G08/G14/G15: explicit attended and publication authority

Environment `tailrocks-protected-verifier` SHALL have zero wait, required
reviewers, `prevent_self_review=true`, and deployment policy restricted to
protected branches. Every reviewer SHALL be an explicit immutable User/Team ID.
Create is allowed only from absent state; existing state must compare exactly.
No environment secret is part of V1.
Current `main` SHALL be protected by an active repository ruleset that targets
`~DEFAULT_BRANCH`, has no bypass actor, and includes `pull_request`, `deletion`,
and `non_fast_forward`. The complete canonical rule configuration digest is
observed authority, not a setting this plan may alter.
An active repository tag ruleset SHALL cover `~ALL`, have no bypass actor, and
forbid deletion and non-fast-forward update. Its complete canonical digest is
also observed authority; this plan cannot mutate it.
Repository immutable releases SHALL be enabled through the documented endpoint
and independently read back as `enabled=true` before any release operation.

#### Scenario: conflicting existing environment

- **WHEN** reviewer set, self-review, wait, or branch policy differs
- **THEN** stop with exact diff; do not silently replace external authority.

#### Scenario: immutable releases are disabled

- **WHEN** readback is `enabled=false` and repository-setting authorization is
  absent
- **THEN** remain BLOCKED; do not publish a replaceable release.

## Must NOT

- **N06**: no provider/registry/oracle secret is created, read, or persisted.
- **N07**: PR/candidate actor cannot approve its own protected operation.
- **N11**: no package, tag, asset, policy, candidate, workflow dispatch, ref, or
  tracked-file mutation; only the two exact authorized repository settings may
  change.
- **N13**: environment configuration is authority input, not candidate PASS.
- **N16**: reviewer count/input/output/API response are schema-closed and bounded.
- **N19**: implementation already landed through Plan 043's one branch/PR;
  this operation creates no tracked edit, commit, branch, ref, or PR.

## Inputs to provide

- Explicit repository-administration authorization for create-if-absent
  environment configuration and, if currently disabled, immutable releases.
- Exact approved reviewer list as `User:<login>` or `Team:<slug>`; at least one
  reviewer must remain distinct from every expected dispatcher.
- A new mode-0600 task JSON file containing only that 1-6 element string list;
  no token or numeric ID is supplied by hand.
- Authenticated administrator with repository Administration write permission.

## Starting state

- Plan 043 atomically merged every workflow/helper, including the environment
  binding and closed REST-schema renderer/verifier, in one implementation PR.
- Live 2026-08-10 readback shows no environment and immutable releases disabled.
  Public organization membership/team discovery has not proved a reviewer
  distinct from the current dispatcher, so execution remains externally
  blocked until exact eligible identities are supplied.

## Commands you will need

Render and verify the desired configuration:

```sh
TAILROCKS_REVIEWER_SPECS='<new-task-json-path>'
rtk bun scripts/protected-environment.ts resolve-reviewers \
  --repo tailrocks/tailrocks-skills \
  --organization tailrocks \
  --input "$TAILROCKS_REVIEWER_SPECS" \
  --max-reviewers 6 \
  --output "$TAILROCKS_ENVIRONMENT_TMP/reviewers.json"
rtk bun scripts/protected-environment.ts render \
  --name tailrocks-protected-verifier \
  --reviewers "$TAILROCKS_ENVIRONMENT_TMP/reviewers.json" \
  --prevent-self-review true \
  --wait-timer 0 \
  --protected-branches true \
  --output "$TAILROCKS_ENVIRONMENT_TMP/desired.json"
rtk bun scripts/protected-environment.ts bootstrap \
  --repo tailrocks/tailrocks-skills \
  --name tailrocks-protected-verifier \
  --desired "$TAILROCKS_ENVIRONMENT_TMP/desired.json" \
  --expect absent-or-equal \
  --output "$TAILROCKS_ENVIRONMENT_TMP/observed.json"
rtk bun scripts/protected-environment.ts verify \
  --desired "$TAILROCKS_ENVIRONMENT_TMP/desired.json" \
  --observed "$TAILROCKS_ENVIRONMENT_TMP/observed.json"
rtk bun scripts/protected-environment.ts verify-main-authority \
  --repo tailrocks/tailrocks-skills \
  --branch main \
  --output "$TAILROCKS_ENVIRONMENT_TMP/main-authority.json"
rtk bun scripts/protected-environment.ts verify-tag-authority \
  --repo tailrocks/tailrocks-skills \
  --require-all-tags \
  --output "$TAILROCKS_ENVIRONMENT_TMP/tag-authority.json"
```

`bootstrap` uses API version `2026-03-10`. On 404 only, it sends exactly:

```json
{
  "wait_timer": 0,
  "prevent_self_review": true,
  "reviewers": [{"type": "User", "id": 123}],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
```

to `PUT repos/tailrocks/tailrocks-skills/environments/tailrocks-protected-verifier`.
Resolved JSON contains every exact approved `User` or `Team` entry and numeric
ID; render accepts no raw reviewer flags.
On 200 it performs no PUT unless response is already equal. Unknown protection
rules, duplicate reviewers, or concurrent conflicting readback fail.

When the recorded immutable-release state is `false` and the operator has
explicitly authorized the change, run exactly:

```sh
gh api --method PUT \
  -H 'X-GitHub-Api-Version: 2026-03-10' \
  repos/tailrocks/tailrocks-skills/immutable-releases
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)" = 'true'
```

When the initial state is already `true`, skip the PUT and run the same GET
assertion. No release/tag/asset command is part of this plan.

## Scope

**In scope**: one exact GitHub environment create-if-absent or equality
verification; reviewer/branch/self-review readback; enable-if-disabled immutable
releases; canonical digested snapshots of both live authorities. Every later
operation re-reads live state; these snapshots are audit records, not authority.

**Out of scope**: environment secrets, package visibility, workflow dispatch,
release/tag/asset/policy/candidate/provider work, repository/ref/file edits,
commits/branches/PRs, other environments/reviewers/settings.

## Git workflow

None. Stay detached at `<atomic-merge-sha>`. Do not add, commit, push, create or
edit a PR, or create/delete/update any branch, tag, or ref. Plan 043 already
delivered all tracked implementation through its sole branch and PR.

## Steps

### Step 1: Resolve reviewer and current authority exactly

Resolve every user/team through official REST, retain numeric ID/type/login or
slug, and prove read access. Record authenticated dispatcher identity. Reject
self-only reviewer sets, more than six, duplicate IDs, unresolved team, or
unprotected main. Resolve all active rules affecting `main`, require exact
repository source, active enforcement, `~DEFAULT_BRANCH`, zero bypass actors,
and the three minimum rule types above; retain the complete canonical ruleset
digest. Resolve active tag rulesets and require repository source, active
enforcement, `~ALL`, zero bypass actors, deletion protection, and non-fast-
forward protection. Render canonical desired JSON and digest.

`resolve-reviewers` uses only bounded API version `2026-03-10` calls: `GET
/user`; for a user, `GET /users/{login}` plus `GET
/repos/{owner}/{repo}/collaborators/{login}/permission`; for a team, `GET
/orgs/{org}/teams/{slug}`, `GET /orgs/{org}/teams/{slug}/repos/{owner}/{repo}`,
and at most 100 active members from the exact team ID to prove one eligible
member distinct from the dispatcher. Pagination, more than 100 members,
renamed/mismatched identities, no repository read permission, or a self-only
set blocks instead of guessing.

**Verify**: resolver fixtures cover user/team success, login/slug rename,
numeric-ID mismatch, missing repository permission, dispatcher-only reviewer,
team with/without a distinct active member, duplicate IDs, pagination/bounds,
redaction, 404, and every operational/API failure. Rendered reviewer bytes equal
the independently resolved manifest exactly; detached HEAD, `origin/main`, and
the Plan 043 PR readback still equal the atomic merge.

### Step 2: Create-if-absent or verify-equal, then read back

Run Bootstrap commands. Immediately GET the environment independently, require
exact name/ID/protection rules/reviewer IDs/self-review/wait/branch policy, and
compare canonical digest. A later protected dispatch must repeat this readback;
this snapshot alone never grants permanent trust.

**Verify**: helper fixtures cover absent create, equal no-op, conflicting state,
concurrent drift, missing reviewer, self-only set, unprotected branch, unknown
rule, inactive/wrong-target/bypassable/missing-rule ruleset, API/permission
failure, absent/bypassable/movable/deletable tag ruleset, and bounded redacted
output. Independent GET equals the desired canonical digest, and Git/PR
readback remains the exact detached atomic merge.

### Step 3: Enable immutable releases or verify existing equality

Use only the exact initial-state branch in Commands. A false state requires
fresh explicit authorization and one PUT; a true state permits GET-only no-op.
Immediately GET independently and retain the response, authority SHA, actor,
timestamp, and canonical response digest in the task record beside the
environment snapshots. Never create a release to test the setting in this plan.

**Verify**: final GET is `enabled=true`; wrong endpoint/repository, unknown
response, permission failure, missing authorization, or later false readback
fails. Re-run the detached-head, clean-tree, `origin/main`, and merged-PR checks
from Preconditions; all remain exact and no Git ref changed.

## Test plan

- Reviewer login/team-to-ID and read-access resolution.
- Exact create body, equal no-op, conflicting-state refusal.
- Required reviewer, prevent-self-review, zero wait, protected branches.
- Active PR-only/no-bypass default-branch ruleset and complete digest.
- Active all-tag/no-bypass/non-movable ruleset and complete digest.
- Immutable-release false/true routing, explicit authorization, PUT/GET readback.
- No secrets, other environment/setting, workflow, package, tag, asset, ref, or
  tracked-file mutation.

## Done criteria

- [ ] Protected main and exact reviewer IDs are verified.
- [ ] Current active main-ruleset digest satisfies the no-bypass PR-only minimum.
- [ ] Current active tag-ruleset digest covers all tags with no bypass/update/
  deletion path.
- [ ] Environment exists with exact required-reviewer/self-review/wait/branch
  policy and no V1 secret requirement.
- [ ] Desired/observed canonical snapshots and digest match.
- [ ] Repository immutable releases independently read back `enabled=true`.
- [ ] Detached `HEAD`, `origin/main`, and the Plan 043 PR merge commit still
  equal `<atomic-merge-sha>`.
- [ ] No package, workflow dispatch, tag, asset, ref, tracked-file, or unrelated
  repository-setting mutation occurred; no commit, branch, or PR was created.

## STOP conditions

Stop on absent admin authorization/permission, unresolved or self-only
reviewers, unprotected main, conflicting environment, concurrent drift, unknown
rule, secret requirement, bypassable/movable/deletable tag authority, immutable
releases disabled without explicit authorization, attached/dirty checkout,
atomic merge/PR/main drift, failed final readback, any Git mutation, or any
broader mutation. Report the exact existing state; never overwrite it by
assumption.

## Maintenance notes

Plan 030 first exercises this environment through the protected package
preflight. Every later dispatch rechecks and binds its current configuration
digest; changed reviewers/policy invalidate outstanding evidence. Plans 018 and
023 recheck immutable releases immediately before publication.
