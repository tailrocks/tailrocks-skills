# Plan 017: Finalize one whole-stack release candidate

> **Executor instructions**: In one session on the shared implementation
> branch, fan in every pre-finalizer tracked capability, derive one vNext exactly once, and
> make static release/support docs permanently truthful. Do not tag, publish,
> create another branch/PR, or promise a later tracked fix.

## Status

- **Priority**: P0
- **Dispatch**: BLOCKED until plans 036 and 044 have current same-branch
  completion receipts at one integration head
- **Effort**: S; one session on the shared implementation branch
- **Risk**: HIGH
- **Depends on**: plans 036 and 044
- **Covers**: G06, G14-G16
- **Guardrails**: N06-N08, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-16, F4-28,
  F4-31, F4-37, F4-40, F4-42, F4-45
- **Planned at**: design baseline `1e809bd`; same-branch fan-in recut required

## Why this matters

One atomic PR can contain only one final manifest version. All runtime,
release, provider, workflow, evidence, and static-documentation capability must
therefore converge before the sole version edit. Plan 043's already-bounded
attempt-validator/finalizer scope is the only tracked work intentionally left;
it changes no runtime, release contract, support claim, or version. Post-merge
facts live in immutable external evidence; static Git docs cannot require a
later cleanup PR.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = '<implementation-branch>'
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = '<integration-sha>'
test "$(rtk git rev-parse origin/main)" = '<frozen-base-sha>'
test "$(rtk git merge-base HEAD '<frozen-base-sha>')" = '<frozen-base-sha>'
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = '<implementation-branch>'
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
rtk git merge-base --is-ancestor <plan-036-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-044-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .claude-plugin/plugin.json .codex-plugin/plugin.json .kimi-plugin/plugin.json .claude-plugin/marketplace.json README.md INSTALL.md AGENTS.md CLAUDE.md CHANGELOG.md docs scripts/release-version.ts
rtk bun scripts/release-version.ts check --require-current-unreleased
rtk mise run verify
```

Expected: clean one-PR fan-in descendant of both final coding checkpoints; all
implementation tests pass; live versions begin equal and unchanged in this
attempt; no package/release/protected external prerequisite is needed.

## Spec contract

### Requirement G06/G14/G15/G16: one version and no post-merge Git mutation

All four plugin/marketplace versions SHALL change exactly once to one policy-
derived vNext after every pre-finalizer tracked capability exists. Static docs SHALL describe
the versioned release process and exact attestation/evidence lookup while saying
support is unqualified until a digest-addressed external closure verifies. One
atomic PR SHALL contain every tracked byte; no later version/docs/evidence commit
is part of this roadmap.

#### Scenario: external qualification later fails

- **WHEN** post-merge release/provider evidence is absent or fails
- **THEN** runtime/docs remain fail-closed/unqualified; Git stays unchanged and
  the release/activation operation reports BLOCKED.

## Must NOT

- **N06/N07**: no credential/live evidence/PR-head protected claim.
- **N08/N13**: complete implementation and external support remain distinct;
  version/hash/pending prose is not evidence.
- **N11**: no tag/release/package/policy/environment mutation.
- **N16**: versions/docs/manifests/diff/commands bounded.
- **N19**: one branch/PR/version edit; no second release version or later docs PR.

## Inputs to provide

- Repository release classification policy and the single shared branch/PR/
  attempt receipt identities.
- No release/package/provider credential or live external evidence.

## Starting state

- Plan 036 closes base-owned candidate verification code.
- Plan 044 closes external evidence publication and permanent static discovery.
- Plans 010/020 implemented provider adapters/schemas without public claims.
- No earlier plan changed a version; Plan 018 will publish this exact version
  only after Plan 043 atomically merges the whole PR.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Current | `rtk bun scripts/release-version.ts check --require-current-unreleased` | one unchanged value |
| Derive | `rtk bun scripts/release-version.ts derive --write --single-attempt` | four fields change once |
| Docs | `rtk bun scripts/provider-conformance.ts verify-static-support-docs --require-external-closure` | no future fact/static date/digest |
| Validation | `rtk bun run scripts/validate-skills.ts && rtk mise run verify` | lockstep/full gate exit 0 |
| Diff | `rtk git diff --check` | exit 0 |

## Scope

**In scope**: four version fields exactly once; release metadata; static
README/INSTALL/AGENTS/CLAUDE/CHANGELOG/docs instructions for immutable release
and digest-addressed external support verification.

**Out of scope**: runtime/provider/workflow/schema changes, live fact/date/
digest, tag/release/package/policy, second branch/PR/version.

## Git workflow

Checkpoint only on `<implementation-branch>` in the existing PR:

```sh
rtk git commit -s -m 'chore(release): prepare atomic goal release' \
  -m 'Co-authored-by: Codex <codex@openai.com>'
```

Do not open/merge/push another branch/PR. Plan 043 re-verifies this exact change
with all prior slices and performs the only merge.

## Steps

### Step 1: Prove the whole tracked implementation is present

Validate every predecessor tracked-plan completion receipt/ancestor, coverage/DAG, workflow
schema/permission, provider adapter, external-evidence API, installer/image, and
static docs path at this head. Any missing implementation returns its owner on
this same branch; no follow-up PR is allowed.

**Verify**: full repository/package gates pass; fixtures reject a missing owner,
stale receipt, provisional implementation, TODO code, promised later docs fix,
or second branch/PR reference.

### Step 2: Derive and write the sole vNext

Fail if four fields disagree or any attempt commit already changed them. Apply
repository policy mechanically, write all four once, and update candidate tag
examples to that value. Examples state they work only after immutable release
verification; do not set a post-release date/digest/support row.

**Verify**: Current/Derive/Validation reject disagreement, second increment,
wrong tag example, multiple versions, released claim, or version edit elsewhere.

### Step 3: Freeze permanently truthful release/support docs

Document one software release after atomic merge and exact commands to verify
release assets/signers and digest-addressed Codex/provider support closures.
When closure is absent/foreign/stale, CLI/docs say unqualified. Replace any
static “verified on” date contract with the attested closure's internal run
dates; rendering never copies them into Git.

**Verify**: Docs/Validation/Diff pass; mutations reject moving alias, static
future release/date/digest, support above closure, silent adapter fallback, or
need for a later repository edit.

## Test plan

- Final tracked-plan fan-in and no provisional/later work.
- Four-field single-write/version/tag-example lockstep.
- Static docs absent/valid/foreign/stale closure behavior.
- Full repository and single-attempt history scope.

## Done criteria

- [ ] Every pre-finalizer tracked capability exists at one shared PR head;
  Plan 043 alone adds the attempt validator and performs final replay/merge.
- [ ] Four versions changed exactly once to one whole-stack vNext.
- [ ] Static docs remain truthful before/after any external activation result.
- [ ] No later tracked runtime/release/provider/docs/evidence/version change is
  required; only Plan 043's closed attempt validator, replay, and merge remain.
- [ ] Same-branch signed checkpoint and all commands pass.

## STOP conditions

Stop on missing/stale tracked capability, prior version edit, live external
fact requirement, static future claim, second branch/PR/version, release
mutation, or work beyond one session. Fix only inside the same existing PR.

## Maintenance notes

Plan 043 performs the only atomic merge. Its downstream external operations
consume that merge SHA and may produce external artifacts only; Plan 018 is the
sole software release.
