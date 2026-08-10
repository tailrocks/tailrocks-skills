# Plan 019: Bootstrap immutable policy from the Codex release closure

> **Executor instructions**: After the one atomic implementation PR is merged
> and Plan 040 publishes its exact Codex release-closure OCI, run one attended
> protected workflow operation from the detached atomic merge. Consume only that
> digest-addressed closure and publish one digest-addressed protected-policy OCI.
> Verify no candidate and create no tracked edit, commit, branch, Git ref, PR,
> software version, tag, or GitHub Release.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until Plan 040's external operation publishes and
  verifies one exact Codex release-closure OCI and protected-environment
  approval is present
- **Effort**: S; one attended session
- **Risk**: HIGH
- **Depends on**: plan 040
- **Covers**: G08, G14, G15, G16
- **Guardrails**: N05-N08, N11, N13, N16, N18, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-24,
  F4-27, F4-28, F4-41, F4-45
- **Planned at**: design baseline `1e809bd`; external identities resolved live

## Why this matters

A software release and operator-attested native records are not protected
verification policy. Plan 040 closes the exact macOS/Linux Codex evidence into
one protected, directly attested OCI subject. This operation consumes that
immutable closure, independently rechecks its release and isolation identities,
then publishes one policy subject without changing Git or minting another
software release.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<plan-043-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SHA="$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_CLOSURE_AUTHORITY_SHA='<plan-040-authority-sha>'
TAILROCKS_CODEX_RELEASE_CLOSURE_OCI_REF='<plan-040-codex-release-closure-oci-ref>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_BOOTSTRAP_TMP="$(mktemp -d /tmp/tailrocks-policy-bootstrap.XXXXXX)"
TAILROCKS_REGISTRY_CONFIG="$TAILROCKS_BOOTSTRAP_TMP/ghcr-auth"
tailrocks_cleanup_policy_auth() {
  if test -d "$TAILROCKS_REGISTRY_CONFIG"; then
    DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
      rtk docker logout ghcr.io >/dev/null 2>&1 || true
    rm -f -- "$TAILROCKS_REGISTRY_CONFIG/config.json" || true
    rmdir -- "$TAILROCKS_REGISTRY_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
tailrocks_abort_policy_auth() {
  tailrocks_cleanup_policy_auth
  trap - EXIT INT TERM
  exit "$1"
}
trap tailrocks_cleanup_policy_auth EXIT
trap 'tailrocks_abort_policy_auth 130' INT
trap 'tailrocks_abort_policy_auth 143' TERM
test "$TAILROCKS_CLOSURE_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
gh release verify "$TAILROCKS_RELEASE_TAG"
test "$(rtk git ls-remote --refs origin "refs/tags/$TAILROCKS_RELEASE_TAG" | cut -f1)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
rtk bun scripts/protected-environment.ts read \
  --repo tailrocks/tailrocks-skills \
  --name tailrocks-protected-verifier \
  --output "$TAILROCKS_BOOTSTRAP_TMP/environment.json"
rtk bun scripts/protected-environment.ts verify-operational \
  --observed "$TAILROCKS_BOOTSTRAP_TMP/environment.json" \
  --require-reviewer \
  --require-prevent-self-review \
  --require-zero-wait \
  --require-protected-branches
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)" = 'true'
test ! -e "$TAILROCKS_REGISTRY_CONFIG"
install -d -m 700 "$TAILROCKS_REGISTRY_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | \
  env -u TAILROCKS_GHCR_READ_TOKEN \
    DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
    rtk docker login ghcr.io \
    --username "$TAILROCKS_GHCR_USER" \
    --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
test -z "${TAILROCKS_GHCR_READ_TOKEN+x}"
test ! -e "$TAILROCKS_BOOTSTRAP_TMP/release-closure"
DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
  rtk bun scripts/protected-workflow.ts verify-evidence-oci \
    --oci-ref "$TAILROCKS_CODEX_RELEASE_CLOSURE_OCI_REF" \
    --purpose codex_fanin \
    --schema codex-release-closure-v1 \
    --authority-ref "$TAILROCKS_AUTHORITY_REF" \
    --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --repull \
    --output-dir "$TAILROCKS_BOOTSTRAP_TMP/release-closure"
TAILROCKS_CLOSURE_PAYLOAD="$TAILROCKS_BOOTSTRAP_TMP/release-closure/evidence.json"
TAILROCKS_CLOSURE_MANIFEST="$TAILROCKS_BOOTSTRAP_TMP/release-closure/evidence-manifest.json"
TAILROCKS_CLOSURE_MANIFEST_SHA256="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_CLOSURE_MANIFEST")"
test "${#TAILROCKS_CLOSURE_MANIFEST_SHA256}" -eq 64
case "$TAILROCKS_CLOSURE_MANIFEST_SHA256" in
  *[!0-9a-f]*|'') exit 1 ;;
esac
```

Expected: clean detached checkout with
`HEAD == origin/main == <atomic-merge-sha>`, exact `MERGED` PR/merge-commit
readback for Plan 043's sole PR, exact Plan 018 release tag, exact protected
environment, immutable releases enabled, and one digest-only
`oci://ghcr.io/tailrocks/tailrocks-codex-release-closure@sha256:<digest>`.
The helper permits no tag, repulls and verifies canonical evidence bytes plus
direct file/OCI attestations from `publish-goal-evidence.yml`, pins ref/source/
signer to the atomic merge on GitHub-hosted runners, and reconstructs a validated
derived `evidence-manifest.json` receipt beside `evidence.json`. The manifest is
not stored inside the OCI subject. Its canonical SHA-256 is computed with the
repository-owned helper and becomes a separate workflow input. Any mismatch
blocks before policy dispatch.

## Spec contract

### Requirement G08/G14/G15/G16: policy derives from one exact external closure

The protected bootstrap workflow SHALL accept the exact Plan 018 release tag,
one digest-addressed Plan 040 Codex release-closure OCI reference, and the
SHA-256 of the canonical derived manifest reconstructed by
`verify-evidence-oci --repull`. It SHALL
independently verify that closure, reconstruct the same manifest, require its
digest, verify the immutable Plan 018 release it names, exact CLI and verifier
OCI subjects, both physical native target records, schemas, isolation profile,
bounds, and direct signer identities. It SHALL emit canonical policy bytes that
bind the closure URI/digest and manifest digest, then publish/attest those bytes
as one digest-addressed OCI subject. Candidate-writable state SHALL have no
policy mutation path.

The policy SHALL claim only Codex facts present in the closure. Shipped provider
adapters are capability exposure, not a support tier. Provider support remains
pending until its later protected external support manifest verifies; neither
this policy nor the software release may predeclare it.

#### Scenario: closure or authority drift

- **WHEN** the closure is tagged/movable, foreign, noncanonical, unattested,
  sourced from another SHA, disagrees with the release, or changes any bound
  subject/schema/isolation fact
- **THEN** bootstrap publishes nothing and reports the exact mismatch.

## Must NOT

- **N05/N16**: policy binds the exact proven runtime isolation and every closed
  ingress/egress/resource/query cap.
- **N06/N07**: candidate/PR receives no environment, registry, provider, or
  oracle credential and cannot mint policy.
- **N08/N13**: policy identity is neither candidate PASS nor support truth beyond
  the exact Plan 040 closure.
- **N11**: no rebuild, software version/tag/GitHub Release, environment mutation,
  candidate verification, or moving policy alias.
- **N18**: policy permits only integrity-only comparators with cumulative query
  caps and `confidentiality=false`.
- **N19**: Plan 043 already delivered all tracked implementation through one
  branch/PR. This operation creates no tracked edit, commit, branch, Git ref, or
  PR; no later software version/release is part of this attempt.

## Inputs to provide

- Exact Plan 043 PR/atomic merge SHA, Plan 018 release tag, and Plan 040 closure
  OCI URI/authority SHA.
- Explicit protected-environment reviewer approval and authenticated,
  task-private GitHub/GHCR operator session. Supply the GHCR read identity as
  process-only `TAILROCKS_GHCR_USER`/`TAILROCKS_GHCR_READ_TOKEN`; the token is
  piped to login with tracing disabled, immediately unset, and never enters
  evidence, workflow inputs, logs, artifacts, or repository files.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before GitHub or verifier children.

## Starting state

- Plan 043's sole PR atomically merged the policy workflow, validators, schemas,
  static fail-closed documentation, and all adapters.
- Plan 018 published the only software version/tag/GitHub Release from that
  atomic merge. Plans 028 and 039 published native Codex evidence.
- Plan 040, as an external-only operation, fanned those exact records into the
  immutable closure supplied here. It created no merge or documentation commit.
- Plan 031 established the environment; Plan 030 established the public package.
  Their current live state is re-read rather than trusted from an old receipt.

## Commands you will need

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow bootstrap-protected-verifier.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input "release_tag=$TAILROCKS_RELEASE_TAG" \
  --input "release_closure_oci_ref=$TAILROCKS_CODEX_RELEASE_CLOSURE_OCI_REF" \
  --input "release_closure_manifest_sha256=$TAILROCKS_CLOSURE_MANIFEST_SHA256" \
  --out "$TAILROCKS_BOOTSTRAP_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_BOOTSTRAP_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_BOOTSTRAP_TMP/dispatch.json" \
  --artifact protected-policy-operation \
  --dir "$TAILROCKS_BOOTSTRAP_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_BOOTSTRAP_TMP/dispatch.json" \
  --manifest "$TAILROCKS_BOOTSTRAP_TMP/artifacts/dispatch-context.json"
```

Expected: exactly one protected bootstrap run/attempt matches workflow, main
ref, atomic authority SHA, event, actor, time, nonce, exact release tag, closure
digest, and canonical reconstructed-manifest SHA-256. No qualification digest,
candidate SHA, provider name, or mutable OCI alias is accepted as a substitute
for either closure identity.

## Scope

**In scope**: read-only verification of Plan 040's exact release closure; one
protected workflow dispatch/approval; no-candidate canaries; one canonical,
directly attested, digest-addressed policy OCI publication.

**Out of scope**: tracked repository writes, commits, branches, Git refs, PRs,
environment/secret mutation, candidate code/SHA, verifier rebuild, software
version/tag/GitHub Release, moving policy alias, provider-support claim.

## Git workflow

None. Stay detached at `<atomic-merge-sha>`. Do not add, commit, push, create
or edit a PR, or create/delete/update any branch, tag, or ref. Plan 043 already
merged every tracked byte; Plan 018's exact software tag is the sole post-merge
Git-ref exception and is read-only here.

## Steps

### Step 1: Independently verify the exact Codex release closure

Run the Preconditions helper with task-private registry auth and `--repull`.
Require the exact package and digest form, canonical evidence bytes, direct file
and OCI attestations from `.github/workflows/publish-goal-evidence.yml`,
protected main ref, source/signer equal to the atomic merge, and hosted runner.
Treat the materialized manifest only as a validated derived receipt reconstructed
from immutable OCI metadata and attestations; hash those canonical receipt bytes
with `release-version.ts file-sha256`. The closure
must bind exactly two distinct physical native targets, the one Plan 018 tag and
source, immutable GitHub Release verification, release/qualification manifests,
both CLI and both broker hashes/direct attestations, canonical native-boundary
receipt digests, verifier OCI index/children, Codex version/tier observations,
isolation profile, schemas, and evidence run dates.

Re-resolve every release asset and OCI digest named by the closure. Verify the
GitHub Release/tag/source, immutable-release enforcement, file/index/child
attestations, and digest repulls. A closure assertion never replaces direct
verification of its machine-checkable subjects.

**Verify**: `verify-evidence-oci --repull` exits 0 and materializes canonical
evidence plus one reconstructed validated manifest; `file-sha256` returns the
exact 64-character lowercase manifest digest. Mutation fixtures and the live
check reject a moving ref,
foreign package/workflow, wrong source/signer/runner, zero/duplicate/third or
emulated target, release/qualification/subject drift, failed native lifecycle,
unknown field, or provider-tier field.

### Step 2: Dispatch one policy publication bound to that closure

Dispatch only `bootstrap-protected-verifier.yml` with the exact release tag,
digest URI, and canonical reconstructed-manifest SHA-256. The workflow repeats
Step 1 under protected authority, reconstructs and hashes the same derived
receipt, requires tag/closure/digest equality, runs pinned no-candidate benign/
hostile image canaries, and creates canonical `policy-v1.json`. Policy binds
closure URI/digest and manifest digest, software release/tag/source,
qualification-manifest digest, release/evidence workflow/source/signer
identities, binary hashes, verifier OCI URI/index/children, target/schema matrix,
native broker hashes and boundary-receipt digests,
fixed runtime profile, all caps, comparator
owner, `oracle_visibility=integrity_only`, cumulative `max_queries`, and
`confidentiality=false`.

It publishes exact bytes to `ghcr.io/tailrocks/tailrocks-verifier-policy` by
digest, directly attests file and OCI subjects from
`bootstrap-protected-verifier.yml`, repulls by digest, and emits a closed
manifest. It creates no moving tag and accepts no candidate or provider-support
input.

**Verify**: dispatch/context commands exit 0 and identify one protected run at
the atomic merge with all three exact release/closure inputs. Workflow fixtures
reject a second/ambiguous run, missing/wrong manifest digest, PR/ref/self-hosted/
reusable signer, closure drift, canary failure, broader permissions, publish-
before-verify, mutable output, provider tier, or any release/Git write.

### Step 3: Verify immutable policy bytes and frozen Git

Resolve and validate exact output fields:

```sh
TAILROCKS_POLICY_FILE="$TAILROCKS_BOOTSTRAP_TMP/artifacts/policy-v1.json"
TAILROCKS_POLICY_MANIFEST="$TAILROCKS_BOOTSTRAP_TMP/artifacts/policy-manifest.json"
TAILROCKS_POLICY_DIGEST="$(rtk bun scripts/verify-protected-policy.ts print-field --manifest "$TAILROCKS_POLICY_MANIFEST" --field oci_digest)"
TAILROCKS_POLICY_OCI_REF="oci://ghcr.io/tailrocks/tailrocks-verifier-policy@$TAILROCKS_POLICY_DIGEST"
rtk bun scripts/verify-protected-policy.ts \
  --bundle "$TAILROCKS_POLICY_FILE" \
  --manifest "$TAILROCKS_POLICY_MANIFEST"
DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
  gh attestation verify "$TAILROCKS_POLICY_FILE" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/bootstrap-protected-verifier.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
  gh attestation verify "$TAILROCKS_POLICY_OCI_REF" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/bootstrap-protected-verifier.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_REGISTRY_CONFIG" \
  rtk bun scripts/verify-protected-policy.ts \
    --oci-ref "$TAILROCKS_POLICY_OCI_REF" \
    --output "$TAILROCKS_BOOTSTRAP_TMP/repulled-policy-v1.json"
cmp "$TAILROCKS_POLICY_FILE" "$TAILROCKS_BOOTSTRAP_TMP/repulled-policy-v1.json"
tailrocks_cleanup_policy_auth
trap - EXIT INT TERM
test ! -e "$TAILROCKS_REGISTRY_CONFIG"
test -z "${TAILROCKS_GHCR_READ_TOKEN+x}"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
```

Retain the policy OCI URI/digest, closure URI/digest, direct attestation
identities, and dispatch receipt as the only handoff to Plan 024. Do not write a
mutable environment variable, repository file, release asset, or policy alias.

**Verify**: local manifest validation, both direct attestations, digest repull,
and byte comparison pass under the task-private Docker config. Logout removes
the config and token variable; final clean/detached HEAD, `origin/main`, and
exact merged-PR readback remain the atomic merge; no Git state changed.

## Test plan

- Exact Plan 040 closure package/digest/schema/authority, reconstructed manifest
  digest, and two-target closure.
- Immutable release/file/index/child/qualification cross-checks.
- Protected run correlation and no-candidate benign/hostile canaries.
- Canonical policy closure/cap/query/provider-tier mutation cases.
- Task-private registry login/immediate token unset/signal cleanup; direct file/
  OCI attestation and digest repull byte equality.
- Detached HEAD, atomic main/PR readback, and zero Git/release mutation.

## Done criteria

- [ ] Exact atomic authority, Plan 040 closure, release, workflow, signer, runner,
  and subject identities verify.
- [ ] One canonical policy file and OCI subject are digest-addressed, repulled,
  and directly attested by protected authority.
- [ ] Policy binds the exact Codex closure URI/digest and reconstructed-manifest
  SHA-256, and claims no provider support tier.
- [ ] Handoff records immutable policy and closure OCI URIs/digests; no moving
  pointer exists.
- [ ] Detached `HEAD`, `origin/main`, and Plan 043 PR merge commit still equal
  `<atomic-merge-sha>`.
- [ ] No candidate, rebuild, software release/version, environment setting,
  tracked file, commit, branch, Git ref, or PR mutation occurred.

## STOP conditions

Stop on attached/dirty checkout, atomic main/PR drift, missing/mutable/foreign
Plan 040 closure, wrong reconstructed-manifest SHA-256, unprotected ref/
environment, ambiguous run, reusable or self-hosted signer, release/
attestation/digest/canary failure, registry credential residue, mutable policy,
false confidentiality or provider-tier claim, required environment/release/Git
mutation, or need for a later software version. Emit
`BLOCKED(reason=PROTECTED_POLICY_UNAVAILABLE)`; do not open another branch/PR
or mint another release.

## Maintenance notes

Plan 024 creates the first later candidate subject and consumes only this exact
policy OCI URI. Plan 023 may later publish provider support as a separate
digest-addressed external manifest after evidence exists; it cannot edit this
software release, change the policy in place, bump a version, or create another
implementation PR.
