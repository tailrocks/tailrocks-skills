# Plan 033: Add the GHCR package-bootstrap lanes

> **Executor instructions**: In one session, extend the protected artifact
> workflow only with `package_preflight` and `package_visibility_verify`, plus
> durable bootstrap evidence/recovery. Do not qualify or release a version.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 009 has a current same-branch completion receipt
- **Effort**: S; one session
- **Risk**: HIGH
- **Depends on**: plan 009
- **Covers**: G08, G14, G15
- **Guardrails**: N05-N08, N11, N13, N16, N17
- **Research basis**: `advisor-plans/RESEARCH.md` F4-27, F4-28, F4-31,
  F4-37, F4-40
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

GHCR creates the first container package private, while release-candidate builds
require a public source-linked package. Bootstrap needs two explicit protected
modes and durable evidence; it must not be smuggled into a release build.

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
rtk git merge-base --is-ancestor <plan-009-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/release-artifacts.yml scripts/verify-oci-artifacts.ts scripts/verify-oci-artifacts.test.ts scripts/validate-workflows.ts tests/fixtures/package-bootstrap schemas docs/deterministic-goal-distribution.md
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/release-candidate-workflow
rtk mise run verify-kernel
```

Expected: exact clean plan-009 descendant and unchanged release-candidate lane.
No package/UI mutation is performed by this coding plan.

## Spec contract

### Requirement G08/G14/G15: recoverable public-package bootstrap

`package_preflight` SHALL create/build only an absent-or-private source-linked
package and durable attested preflight closure. After a separate attended
package-wide visibility change, `package_visibility_verify` SHALL build nothing,
prove anonymous access to exact preflight digests, and publish durable attested
bootstrap evidence. Modes and artifacts SHALL be closed and non-composable.

#### Scenario: interrupted first push

- **WHEN** the package exists but the original Actions artifact is gone
- **THEN** bounded provenance enumeration selects exactly one valid preflight
  closure or blocks; it never guesses newest.

## Must NOT

- **N05/N17**: no candidate/worker receives token, Docker socket, or network.
- **N06/N07**: only protected hosted token creates/signs package bytes; no PR
  or operator PAT enters workflow evidence.
- **N08/N13**: visibility/name/hash alone cannot prove source/provenance/children.
- **N11**: no package visibility mutation, version tag, release, or support claim.
- **N16**: enumeration, manifests, inputs, artifacts, registry calls, and output
  are bounded.

## Inputs to provide

- None for implementation. Plan 030 later supplies protected approval and
  explicit package-admin authorization for the UI visibility transition.

## Starting state

- Plan 009 owns one exact `release_candidate` lane and registry primitives.
- The live `tailrocks-verifier` package may be absent; first publish is private.
- Actions artifacts are transfer only and cannot bridge separate operations.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/package-bootstrap` | three artifact modes remain closed |
| OCI | `rtk bun test scripts/verify-oci-artifacts.test.ts` | preflight/recovery/bootstrap mutations pass |
| Recovery | `rtk bun scripts/verify-oci-artifacts.ts recover-preflight --fixtures tests/fixtures/package-bootstrap/recovery` | exact zero/one/multiple behavior |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- two new modes in `.github/workflows/release-artifacts.yml`
- `preflight-evidence-v1.json`, `bootstrap-evidence-v1.json`, schemas/fixtures
- bounded `verify-oci-artifacts.ts recover-preflight` and bootstrap validators
- package-bootstrap workflow validation/docs

**Out of scope**:

- Release-candidate semantics, installers, qualification/finalization.
- GHCR visibility UI/API mutation, version/tag/release/support claim.
- Policy/protected candidate/provider work.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `ci(goal): add package bootstrap lanes`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Add private package preflight and durable recovery

Add closed purpose `package_preflight`. It requires package absent or private;
an absent first push creates it private. It uses the same pinned build/provenance
contract as plan 009, source annotation, ephemeral `${{ github.token }}`, and
literal artifact `package-preflight-operation`. It publishes and directly
attests `preflight-evidence-v1.json` as a distinct OCI artifact binding
dispatch/run/authority, source/signer, owner/source link, index/children,
purpose, and `released=false`. No anonymous check/support claim is allowed.

Add `recover-preflight`: enumerate at most 32 manifests/attestations; accept only
direct release workflow signer, protected main source, exact package/linkage,
purpose, index/children/evidence closure. Zero blocks. Multiple blocks unless
one operator-supplied exact evidence digest selects exactly one. Never select by
time/tag order.

Add `inspect-package --repo <owner/repo> --package <org/name> --output
<new-json>`. It distinguishes exact API 404 from authenticated operational
failure and emits only `ABSENT | PRIVATE | PUBLIC` plus closed owner/type/name/
source-link fields. All non-404 errors and malformed/redacted states fail.

**Verify**: Workflow/OCI/Recovery commands reject public-required preflight,
wrong source/link, operator token, missing child/evidence, stale/fork signer,
zero/multiple ambiguity, pagination, and unbounded enumeration.

### Step 2: Add no-build public visibility verification

Add `package_visibility_verify`, accepting exact preflight index and evidence
digests only. It requires package public/source-linked, creates a fresh empty
Docker config with no helper, proves anonymous pull of index/children/evidence,
builds no binary/image, and emits literal `package-visibility-operation`. It
publishes/directly attests canonical `bootstrap-evidence-v1.json` in the public
package. That OCI digest is the durable plan-017 handoff.

Closed workflow inputs are authority SHA/nonce/envelope bytes+digest, version,
purpose, and conditional preflight digests. Only visibility mode accepts both;
preflight/release modes reject them. Run name keeps exact purpose/nonce/envelope
digest. Permissions remain plan 009's literal least set.

**Verify**: fixtures reject any build step, private/authenticated-only pull,
credential helper, missing source link, digest substitution, cross-purpose
input, wrong artifact name, broader permission, or mutable output.

## Test plan

- Fail-closed absent/private/public package state and source linkage.
- First private push, direct file/OCI provenance, durable preflight closure.
- Bounded interrupted recovery with zero/one/multiple candidates.
- Empty-config anonymous index/child/evidence pull and no-build visibility mode.
- Exact purpose/input/artifact/run-name transitions.

## Done criteria

- [ ] Preflight creates/recovers one private complete attested closure.
- [ ] Visibility mode builds nothing and proves exact public anonymous bytes.
- [ ] Durable bootstrap evidence no longer depends on Actions/tmp retention.
- [ ] Release-candidate lane is unchanged and all modes remain disjoint.
- [ ] No visibility/release/support mutation occurs.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on release-lane drift, unbounded recovery, token/source-link exposure,
cross-purpose input, visibility mutation need, anonymous-pull false positive,
external publication beyond candidate/bootstrap evidence, or work beyond one
session.

## Maintenance notes

Plan 030 performs the attended package bootstrap. Plan 034 adds qualification
and draft-recovery/finalization without changing these modes.
