# Plan 043: Deliver the whole implementation in one atomic pull request

> **Executor instructions**: Finish the attempt validator on the existing
> shared branch/PR, then be the only plan allowed to finalize or merge that PR.
> Reverify every tracked slice at one exact final head and perform one protected
> squash merge with explicit approval. Never create another branch or PR.

## Status

- **Priority**: P0
- **Dispatch**: BLOCKED until plan 017 and every predecessor same-branch
  completion receipt are current at one proposed final PR head
- **Effort**: M; one attended finalization session
- **Risk**: HIGH
- **Depends on**: plan 017
- **Covers**: G16
- **Guardrails**: N06-N08, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-08, F4-14, F4-27,
  F4-45, F4-49
- **Planned at**: design baseline `1e809bd`; shared-attempt identities required

## Why this matters

Per-plan branches and merges let partially integrated semantics escape and make
later plans prove a different tree. The user requires the complete repository
implementation to land together: one branch, one PR, one final head, one merge.

## Preconditions — run before anything else

```sh
TAILROCKS_IMPLEMENTATION_BRANCH='<implementation-branch>'
TAILROCKS_IMPLEMENTATION_PR='<implementation-pr-number>'
TAILROCKS_BASE_SHA='<frozen-base-sha>'
TAILROCKS_START_HEAD="$(rtk git rev-parse HEAD)"
TAILROCKS_FINALIZE_TMP="$(mktemp -d /tmp/tailrocks-atomic-finalize.XXXXXX)"
tailrocks_cleanup_atomic_finalize() {
  rm -f -- "$TAILROCKS_FINALIZE_TMP/main-merge-authority.json" \
    "$TAILROCKS_FINALIZE_TMP/premerge-main-authority.json"
  rmdir -- "$TAILROCKS_FINALIZE_TMP" 2>/dev/null || true
}
trap tailrocks_cleanup_atomic_finalize EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
test "$(rtk git branch --show-current)" = "$TAILROCKS_IMPLEMENTATION_BRANCH"
test -z "$(rtk git status --porcelain=v1)"
rtk git fetch origin main "$TAILROCKS_IMPLEMENTATION_BRANCH"
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json headRefName --jq .headRefName)" = "$TAILROCKS_IMPLEMENTATION_BRANCH"
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json headRefOid --jq .headRefOid)" = "$TAILROCKS_START_HEAD"
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json state --jq .state)" = OPEN
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json isDraft --jq .isDraft)" = true
test "$(gh pr list --state all --head "$TAILROCKS_IMPLEMENTATION_BRANCH" --json number --jq 'length')" = 1
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_BASE_SHA"
test "$(rtk git merge-base "$TAILROCKS_START_HEAD" "$TAILROCKS_BASE_SHA")" = "$TAILROCKS_BASE_SHA"
rtk git merge-base --is-ancestor <plan-017-completion-sha> "$TAILROCKS_START_HEAD"
test -d '<attempt-receipt-dir>'
rtk bun scripts/protected-environment.ts verify-main-authority \
  --repo tailrocks/tailrocks-skills --branch main \
  --require-strict-status-checks --require-dismiss-stale-reviews \
  --require-last-push-approval --require-enforced-admins \
  --require-zero-bypass --require-no-merge-queue \
  --output "$TAILROCKS_FINALIZE_TMP/main-merge-authority.json"
rtk mise run verify
```

Expected: exactly one open draft PR from the one shared branch to unchanged
`main`; every predecessor checkpoint exists on that head; the bounded external
receipt directory and closed plan package exist. Main movement, another
branch/PR, missing predecessor, or head mismatch blocks the whole attempt.

## Spec contract

### Requirement G16: one branch, one PR, one atomic implementation merge

All tracked implementation SHALL be committed to one shared branch and exposed
through exactly one PR. Intermediate plan commits are scheduling checkpoints,
never separately merged deliverables. Before merge, every tracked done
criterion SHALL rerun at the exact final PR head. One approved squash merge
SHALL make all implementation bytes visible together. Post-merge activation
SHALL create no tracked edit, commit, implementation branch, or PR; Plan 018's
one exact release tag is the sole Git-ref exception.

#### Scenario: completed slice touched later

- **WHEN** a later checkpoint changes any path in an earlier slice's declared
  scope
- **THEN** that receipt becomes STALE and final delivery blocks until its exact
  tests/done criteria rerun at the final head.

#### Scenario: a second PR is proposed

- **WHEN** any slice asks for its own branch, PR, merge, or later docs commit
- **THEN** reject it as N19 scope divergence; do not call the package complete.

## Must NOT

- **N06**: final PR jobs get no provider/release/admin credential.
- **N08/N13**: intermediate receipts/green commits do not prove final head.
- **N07**: the PR-head attempt validator remains `pr_head_self_checked`; it
  cannot authorize its own merge or upgrade operator receipts.
- **N11**: merge requires explicit operator approval after all final checks.
- **N16**: branch, PR, commits, receipts, checks, reviews, diff, output bounded.
- **N19**: no second implementation branch/PR, intermediate merge, stacked PR,
  post-merge docs/evidence commit, or plan-specific push target. Only the exact
  Plan-018 software-release tag may be created after merge.

## Inputs to provide

- The single branch/PR/base identifiers created once at attempt kickoff.
- Sanitized operator-owned receipt snapshot containing no secret. Give the
  validator only a read-only copy; independently hash it before/after. The
  PR-head validator sees that copy and remains self-check evidence, never an
  independent verifier.
- Explicit approval to mark the exact draft ready and squash-merge it.
- Exact authenticated merge author name/email for the final DCO trailer and a
  current unredacted admin readback proving strict up-to-date checks, stale-review
  dismissal, last-push approval, enforced admins, zero bypass, and no merge
  queue. Without that server-side base-movement guard, merge is forbidden.

## Starting state

- Plans 000-017, 020, 022, 025-027, 032-038, and 044-045 completed as signed/
  co-authored checkpoint commits on this same branch.
- Plan 017 owns the sole whole-stack version/readiness change.
- No protected-release/provider/policy claim exists yet; activation starts only
  after this merge.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Attempt | `rtk bun scripts/validate-implementation-attempt.ts --branch "$TAILROCKS_IMPLEMENTATION_BRANCH" --pr "$TAILROCKS_IMPLEMENTATION_PR" --base "$TAILROCKS_BASE_SHA" --head "$TAILROCKS_FINAL_HEAD" --receipts '<attempt-receipt-dir>' --require-plans 000-017,020,022,025-027,032-038,043-045 --require-final-head` | every tracked slice current at one head |
| Package | `rtk bun scripts/validate-implementation-attempt.ts --coverage advisor-plans/COVERAGE.md --plans advisor-plans --check-plan-package` | exact closed DAG/coverage/scope |
| Repository | `rtk mise run verify` | full gate exit 0 |
| History | `rtk git log --format='%H%x00%B%x00' "$TAILROCKS_BASE_SHA..$TAILROCKS_FINAL_HEAD"` | bounded commits; DCO + Codex trailer each |
| PR | `gh pr checks "$TAILROCKS_IMPLEMENTATION_PR" --required` | all required checks green |

## Scope

**In scope**: attempt-receipt validation, final full-tree verification, exact
existing PR readiness and one authorized squash merge; specifically
`scripts/validate-implementation-attempt.ts`, its tests/hostile fixtures,
`schemas/implementation-attempt-receipt.schema.json`, and the atomic-delivery
section of `docs/deterministic-goal-distribution.md`.

**Out of scope**: source fixes, second branch/PR, plan-specific merge, release/
package/policy/provider activation, PR-head protected claim.

## Git workflow

Use only `<implementation-branch>` and `<implementation-pr-number>`. Do not
create, switch, or push another branch; do not open another PR. First commit the
bounded validator to this existing branch:

```sh
rtk git add -- scripts/validate-implementation-attempt.ts \
  scripts/validate-implementation-attempt.test.ts \
  schemas/implementation-attempt-receipt.schema.json \
  tests/fixtures/implementation-attempt \
  docs/deterministic-goal-distribution.md
rtk git commit -s -m 'ci(goal): enforce one atomic implementation attempt' \
  -m 'Co-authored-by: Codex <codex@openai.com>'
TAILROCKS_FINAL_HEAD="$(rtk git rev-parse HEAD)"
rtk git push origin "HEAD:refs/heads/$TAILROCKS_IMPLEMENTATION_BRANCH"
```

After every final-head gate and explicit merge approval:

```sh
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json headRefOid --jq .headRefOid)" = "$TAILROCKS_FINAL_HEAD"
gh pr ready "$TAILROCKS_IMPLEMENTATION_PR"
gh pr checks "$TAILROCKS_IMPLEMENTATION_PR" --required --watch
rtk git fetch origin main
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_BASE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_BASE_SHA"
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json headRefOid --jq .headRefOid)" = "$TAILROCKS_FINAL_HEAD"
rtk bun scripts/protected-environment.ts verify-main-authority \
  --repo tailrocks/tailrocks-skills --branch main \
  --require-strict-status-checks --require-dismiss-stale-reviews \
  --require-last-push-approval --require-enforced-admins \
  --require-zero-bypass --require-no-merge-queue \
  --output "$TAILROCKS_FINALIZE_TMP/premerge-main-authority.json"
TAILROCKS_MERGE_AUTHOR_NAME='<authenticated-name>'
TAILROCKS_MERGE_AUTHOR_EMAIL='<authenticated-email>'
TAILROCKS_MERGE_SIGNOFF="$TAILROCKS_MERGE_AUTHOR_NAME <$TAILROCKS_MERGE_AUTHOR_EMAIL>"
TAILROCKS_MERGE_BODY="$(printf 'Signed-off-by: %s\n\nCo-authored-by: Codex <codex@openai.com>\n' "$TAILROCKS_MERGE_SIGNOFF")"
gh pr merge "$TAILROCKS_IMPLEMENTATION_PR" --squash --delete-branch \
  --match-head-commit "$TAILROCKS_FINAL_HEAD" \
  --author-email "$TAILROCKS_MERGE_AUTHOR_EMAIL" \
  --subject 'feat(goal): deliver verifiable native goal runtime' \
  --body "$TAILROCKS_MERGE_BODY"
TAILROCKS_ATOMIC_MERGE_SHA="$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json mergeCommit --jq .mergeCommit.oid)"
test "$(gh pr view "$TAILROCKS_IMPLEMENTATION_PR" --json state --jq .state)" = MERGED
test -n "$TAILROCKS_ATOMIC_MERGE_SHA"
rtk git fetch origin main
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse "$TAILROCKS_FINAL_HEAD^{tree}")" = \
  "$(rtk git rev-parse "$TAILROCKS_ATOMIC_MERGE_SHA^{tree}")"
rtk git log -1 --format=%B "$TAILROCKS_ATOMIC_MERGE_SHA" | \
  rtk bun scripts/validate-implementation-attempt.ts --check-final-merge-trailers
tailrocks_cleanup_atomic_finalize
trap - EXIT INT TERM
```

## Steps

### Step 1: Implement the closed atomic-attempt validator

Define a bounded canonical receipt schema. Each receipt binds plan ID/digest,
frozen base, start/completion SHA, declared path scope, scope-diff digest,
dependency completion SHAs, exact commands/results/evidence references, and a
`CHECKPOINT | STALE | FINAL_HEAD_VERIFIED` state. Reject duplicate/missing/extra
IDs, symlinks, traversal, unknown fields, unbounded files, secret values, commit
outside the one branch ancestry, dependency not ancestor, a scope touched after
completion without a final-head rerun, or any subject other than the requested
head. Validate the closed expected plan set, not a directory-provided list.
The same helper parses plan metadata and COVERAGE, proves reciprocal ownership,
exact dependency rows, acyclicity, no transitive edge, one Verify block per
step, and the single tracked/external phase boundary.

**Verify**: validator tests pass; hostile fixtures reject a second PR/base,
missing plan, stale scope, forged digest, non-ancestor, intermediate subject,
unknown field, symlink/traversal, oversized receipt, secret-shaped value,
coverage mismatch, cycle, redundant edge, missing step Verify, or a tracked
plan after the atomic-merge boundary.

Commit only the named scope to the existing branch, push only that branch, and
set `TAILROCKS_FINAL_HEAD` to the resulting exact SHA.

### Step 2: Reverify every slice at one final PR head

Freeze head. Validate dependency receipts, plan digests, scope-diff digests,
statuses, commit ancestry, and no second branch/PR. Rerun every tracked plan's
done command at this head, not merely its checkpoint. Regenerate final receipts
with `subject_sha=$TAILROCKS_FINAL_HEAD`, including plan 043 itself; any later
edit invalidates them all. The exact required IDs are
`000-017,020,022,025-027,032-038,043-045`.

**Verify**: Attempt/Package/Repository/History pass; mutation fixtures reject
missing/stale/intermediate-subject receipts, touched scope, duplicate PR,
dependency not ancestor, unsigned/missing trailer commit, or head drift.

### Step 3: Review the complete atomic diff

Review `TAILROCKS_BASE_SHA..TAILROCKS_FINAL_HEAD` as one system. Require every
G-ID/N-ID, workflow permission, generated asset, version field, static docs,
rollback, and activation runbook present. PR title/body/check inventory must
describe the whole diff and label CI self-check only. No pending implementation
row or promised later code/doc fix may remain.

**Verify**: Package/Repository and PR checks pass; deliberate omission, extra
scope, provisional code, second version bump, protected CI claim, or later-doc
promise fails final review.

### Step 4: Perform one approved protected merge and freeze its identity

Push only the existing branch, mark only the existing PR ready, wait exact
required checks/reviews, then re-read exact head/base and server-enforced strict
main authority. Squash-merge once with `--match-head-commit`; strict status/
review rules atomically reject concurrent base movement. Read back PR state and merge
commit; fetch main; require `origin/main` equals that merge commit and contains
the final PR tree. Write the merge SHA/tree/PR number into the external
activation receipt. Do not write it back into Git.

**Verify**: PR is `MERGED`, one merge commit/tree matches the approved final
head tree, branch is deleted, no other implementation PR exists, and activation
receipt validates. Any queue/rebase/head/review/check drift before merge blocks.

## Test plan

- Single branch/PR identity and duplicate/stacked PR rejection.
- Closed receipt schema, plan-set, bounds, path, ancestry, and secret rejection.
- Completion receipt staleness and final-head rerun.
- Full plan/DAG/coverage/version/history/CI truth.
- One squash merge tree equality and external merge receipt.

## Done criteria

- [ ] Every tracked slice is final-head verified, not merely checkpoint-green.
- [ ] Atomic-attempt validator is committed and tested on the same PR.
- [ ] Exactly one branch and one PR contain the complete implementation.
- [ ] One explicitly approved squash merge lands the exact final tree.
- [ ] No promised tracked follow-up, second version, or post-merge doc edit.
- [ ] External activation receipt names exact merge SHA/tree/PR.

## STOP conditions

Stop on any second branch/PR, main/head drift, stale/missing receipt, incomplete
slice, red check/review, unapproved merge, tree mismatch, release mutation, or
need for a later tracked fix. Fix only on the same branch/PR, rerun all final
checks, and still merge once.

## Maintenance notes

The downstream external operations consume only the atomic merge SHA and
external receipts. They may activate services/artifacts but can never mutate
repository history.
