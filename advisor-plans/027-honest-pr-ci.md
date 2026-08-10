# Plan 027: Run complete credential-free PR self-check CI

> **Executor instructions**: Wire the finished offline gates into PR CI in one
> session. Keep every result labeled PR-head self-check. Do not add protected
> workflows, credentials, provider trials, packaging, or release behavior.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 038 has a current same-branch completion receipt
- **Effort**: S; one session
- **Risk**: HIGH
- **Depends on**: plan 038
- **Covers**: G14, G15
- **Guardrails**: N05-N08, N11, N13, N14, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-16,
  F4-27, F4-30
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Separate infrastructure can rerun PR checks, but the PR still controls its
workflow, verifier, fixtures, and ground truth. CI must be complete and useful
without claiming independent or merge-authoritative proof.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = "<integration-sha>"
test "$(rtk git rev-parse origin/main)" = "<frozen-base-sha>"
test "$(rtk git merge-base HEAD "<frozen-base-sha>")" = "<frozen-base-sha>"
rtk git merge-base --is-ancestor <plan-038-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/validate.yml mise.toml scripts/validate-workflows.ts scripts/validate-workflows.test.ts docs/eval-runner-design.md
rtk mise run verify-kernel
rtk mise run eval-all-replay
```

Expected: exact dependency/integration SHAs match, both offline gates pass, and
scoped diff is empty.

## Spec contract

### Requirement G14/G15: honest PR-head self-check

PR CI SHALL run the complete offline kernel and eval gates without provider
credentials, privileged tokens, writable remotes, protected environments, or
release permissions. Any resulting receipt/evidence SHALL be labeled
`pr_head_self_checked`; it SHALL NOT mint `protected_verifier` or serve as
merge-authoritative certification.

#### Scenario: PR changes verifier and expected fixture

- **WHEN** CI passes on separate hosted infrastructure
- **THEN** the check remains `pr_head_self_checked` because PR bytes still
  control both subject and checker.

## Must NOT

- **N05/N06**: no host candidate execution or provider/release secret in PR jobs.
- **N07**: PR-head workflow/binary/fixtures cannot certify themselves protected.
- **N08**: cached/historical results cannot replace current final rerun.
- **N11**: PR CI cannot write refs, releases, packages, policies, or environments.
- **N13/N14**: no independence claim or cross-candidate writable cache.
- **N16**: jobs, artifacts, logs, workspaces, and time are bounded.

## Inputs to provide

None. GitHub-hosted runner identity is environment evidence, not verifier
independence.

## Starting state

- Plan 038 provides complete offline `verify-kernel` and `eval-all-replay` gates
  plus retained-trial metrics.
- `.github/workflows/validate.yml` has skill/script validation and online
  freshness but no complete Rust/artifact gate.
- Protected workflows are intentionally absent until plan 022.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Workflow lint | `rtk bun scripts/validate-workflows.ts` | exit 0 |
| Workflow tests | `rtk bun test scripts/validate-workflows.test.ts` | exit 0 |
| Local full gate | `rtk mise run verify-kernel && rtk mise run eval-all-replay` | exit 0 |
| Stable aggregate | `rtk mise run verify` | exit 0; runs both gates once |

## Scope

**In scope**:

- `.github/workflows/validate.yml`
- `mise.toml` for one `verify` aggregate over the two existing tasks
- `scripts/validate-workflows.ts`, test, and hostile workflow fixtures
- `docs/eval-runner-design.md` PR trust-label section

**Out of scope**:

- Bootstrap/protected-candidate/release workflows (plans 009/022).
- Credentials, live providers, publication, policy, environment mutation.
- Build/result cache shared across candidate SHAs.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `ci(goal): run honest PR self-checks`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Run complete offline gates in PR jobs

Add `verify` as the stable ordered aggregate of `verify-kernel` followed by
`eval-all-replay`. Run `mise run verify` directly because CI
does not assume developer `rtk`. Use actions pinned by full commit and least
permissions. Checkout receives no persistent credential. Keep mutable registry
freshness in a separately named online diagnostic; it cannot affect offline
acceptance semantics.

Do not restore or save writable build/result caches. Only immutable,
digest-addressed dependency sources may be shared read-only. Bound job timeout,
artifact retention, log/output size, and workspace ingestion.

**Verify**: Workflow lint/local-gate commands pass; fixtures fail on an omitted,
reordered, cached, credentialed, writable, unbounded, or online-authoritative
offline gate.

### Step 2: Enforce workflow trust boundaries

When a PR contains a plan package/receipt, rerun final reconciliation through
the PR-head binary and pinned OCI profile, then label output
`pr_head_self_checked`. Static validation rejects secret references, privileged
tokens, writable checkout/remotes, mutable action refs, self-hosted runners,
`pull_request_target` execution of head bytes, broad write permissions,
environment access, release/package writes, caches, and protected labels.

**Verify**: workflow tests reject one fixture for each forbidden shape and a
fixture calling PR-head output protected/independent/merge-authoritative.

## Test plan

- PR/fork permissions, tokens, checkout credentials, ref/event attacks.
- No cache restore/save, environment, package, release, or remote write.
- Exact offline commands and nonzero propagation.
- Honest `pr_head_self_checked` output for package reconciliation.

## Done criteria

- [ ] Recut records plan-038 and shared-branch final-head SHAs.
- [ ] PR CI runs both complete offline gates with no credentials.
- [ ] Workflow validator rejects every privileged/self-certifying shape.
- [ ] Every PR receipt/evidence uses only `pr_head_self_checked`.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop if a PR job needs a secret, writable remote/cache, protected environment,
mutable authority, host candidate execution, stronger trust label, incomplete
offline gate, or work beyond one session.

## Maintenance notes

Plan 009 packages release artifacts after this honest CI seam. Plan 022 alone
adds base-owned protected workflows.
