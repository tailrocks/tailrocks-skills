# Plan 030: Bootstrap the public verifier package

> **Executor instructions**: After Plan 043's single atomic implementation
> merge and Plan 031's external authority bootstrap, run one attended GHCR
> operation from the detached atomic merge. Create the package through the
> protected preflight workflow if absent, then require explicit operator
> confirmation before the irreversible private-to-public visibility change.
> Publish no release/support claim and create no tracked edit, commit, branch,
> Git ref, or PR.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 031 is complete and an organization/package
  admin explicitly authorizes public GHCR visibility
- **Effort**: S; one session, attended
- **Risk**: HIGH
- **Depends on**: plan 031
- **Covers**: G08, G14, G15
- **Guardrails**: N05-N07, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-24, F4-27, F4-28,
  F4-31, F4-32, F4-39, F4-40
- **Planned at**: design baseline `1e809bd`; external package state resolved live

## Why this matters

GHCR creates a first package private. Visibility is package-wide, not tag-wide,
and public container packages allow anonymous pulls. Release workflows cannot
promise public digest installs until one authorized bootstrap creates, links,
and permanently makes the package public.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<plan-043-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SHA="$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST="${TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST:-}"
TAILROCKS_PACKAGE_TMP="$(mktemp -d /tmp/tailrocks-ghcr-bootstrap.XXXXXX)"
TAILROCKS_PRIVATE_CONFIG="$TAILROCKS_PACKAGE_TMP/private-registry-auth"
TAILROCKS_ANON_DOCKER_CONFIG="$TAILROCKS_PACKAGE_TMP/anonymous-registry"
tailrocks_drop_private_package_auth() {
  set +e
  if test -d "$TAILROCKS_PRIVATE_CONFIG"; then
    DOCKER_CONFIG="$TAILROCKS_PRIVATE_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_PRIVATE_CONFIG/config.json"
    rmdir -- "$TAILROCKS_PRIVATE_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
tailrocks_cleanup_package_auth() {
  tailrocks_drop_private_package_auth
  unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
  rmdir -- "$TAILROCKS_ANON_DOCKER_CONFIG" 2>/dev/null || true
}
trap tailrocks_cleanup_package_auth EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
install -d -m 700 "$TAILROCKS_PRIVATE_CONFIG"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | \
  env -u TAILROCKS_GHCR_READ_TOKEN \
    DOCKER_CONFIG="$TAILROCKS_PRIVATE_CONFIG" \
    rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
test -z "${TAILROCKS_GHCR_READ_TOKEN+x}"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
rtk bun scripts/protected-environment.ts read \
  --repo tailrocks/tailrocks-skills \
  --name tailrocks-protected-verifier \
  --output "$TAILROCKS_PACKAGE_TMP/environment.json"
rtk bun scripts/protected-environment.ts verify-operational \
  --observed "$TAILROCKS_PACKAGE_TMP/environment.json" \
  --require-reviewer \
  --require-prevent-self-review \
  --require-zero-wait \
  --require-protected-branches
rtk bun scripts/protected-environment.ts verify-main-authority \
  --repo tailrocks/tailrocks-skills \
  --branch main \
  --output "$TAILROCKS_PACKAGE_TMP/main-authority.json"
rtk bun scripts/protected-environment.ts verify-tag-authority \
  --repo tailrocks/tailrocks-skills \
  --require-all-tags \
  --output "$TAILROCKS_PACKAGE_TMP/tag-authority.json"
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)" = 'true'
TAILROCKS_VERSION="$(rtk bun scripts/release-version.ts current --format plain)"
TAILROCKS_PACKAGE_STATE_FILE="$TAILROCKS_PACKAGE_TMP/package-state.json"
rtk bun scripts/verify-oci-artifacts.ts inspect-package \
  --repo tailrocks/tailrocks-skills \
  --package tailrocks/tailrocks-verifier \
  --output "$TAILROCKS_PACKAGE_STATE_FILE"
TAILROCKS_PACKAGE_STATE="$(rtk bun scripts/verify-oci-artifacts.ts print-field \
  --manifest "$TAILROCKS_PACKAGE_STATE_FILE" --field state)"
case "$TAILROCKS_PACKAGE_STATE" in
  ABSENT|PRIVATE|PUBLIC) ;;
  *) exit 1 ;;
esac
```

Expected: clean detached checkout with
`HEAD == origin/main == <atomic-merge-sha>`, exact `MERGED` PR/merge-commit
readback for Plan 043's sole PR, and the exact Plan 031 environment, branch/tag
authority, and immutable-release settings. Any mismatch blocks before workflow
dispatch or package mutation.

The fail-closed package-state helper treats only exact 404 as `ABSENT`.
`PRIVATE` selects the visibility path. `PUBLIC` skips visibility mutation only
after source linkage, Actions write, and anonymous pull checks pass. Either
existing path must recover exactly one valid preflight closure before Step 2.
Any API error or other owner/type/state blocks.

## Spec contract

### Requirement G08/G14/G15: one public source-linked verifier package

The protected release workflow SHALL create the absent package in
`package_preflight` mode from exact default authority and emit one signed
candidate digest without a release/support claim. An authorized package admin
SHALL make exactly that package public through GitHub's package settings. The
operation SHALL read back `visibility=public`, repository source linkage, and an
anonymous digest pull before later release preparation.

#### Scenario: package is private or wrong owner

- **WHEN** readback is not exact organization/container/name/public/source
- **THEN** plan remains BLOCKED; later release plans cannot dispatch.

## Must NOT

- **N05/N06**: no candidate process or registry credential enters image/runtime
  evidence; preflight build remains protected and bounded.
- **N07**: PR-head workflow cannot create trusted package identity.
- **N11**: no version/tag/GitHub Release/support/policy/candidate proof mutation.
- **N13**: package/public status is distribution availability, not candidate PASS.
- **N16**: workflow run, image/index/children, logs, and temp evidence are bounded.
- **N19**: Plan 043 already merged all implementation through one branch/PR;
  this external operation creates no tracked edit, commit, branch, Git ref, or PR.

## Inputs to provide

- Explicit organization/package-admin authorization for the irreversible public
  visibility change.
- Protected workflow approval and authenticated GitHub/GHCR operator. Secret
  values remain in process/UI only.
- Process-only `TAILROCKS_GHCR_USER`/`TAILROCKS_GHCR_READ_TOKEN` with private-
  package read access. Login uses only the named 0700 task config; token is
  immediately unset and cleanup runs on success, failure, and signals.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before invoking GitHub.
- For interrupted state with multiple valid preflight closures, one explicit
  expected preflight-evidence digest; absent input never means “choose newest.”
  Record it as `TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST='<sha256:hex>'`
  before invoking the retry selector; leave it unset when exactly one matches.

## Starting state

- Current audit found no `tailrocks-verifier` package under the organization.
- GitHub documents first publication as private and states a public package
  cannot be made private again.
- Plan 043's sole atomic PR already merged package-preflight mode, exact run
  correlation, direct signer provenance, and OCI validators.
- Plan 031 supplies the exact protected environment/reviewer configuration.

## Commands you will need

For `TAILROCKS_PACKAGE_STATE=ABSENT`, run exactly:

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow release-artifacts.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_AUTHORITY_SHA" \
  --input "version=$TAILROCKS_VERSION" \
  --input 'purpose=package_preflight' \
  --out "$TAILROCKS_PACKAGE_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_PACKAGE_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_PACKAGE_TMP/dispatch.json" \
  --artifact package-preflight-operation \
  --dir "$TAILROCKS_PACKAGE_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_PACKAGE_TMP/dispatch.json" \
  --manifest "$TAILROCKS_PACKAGE_TMP/artifacts/dispatch-context.json"
TAILROCKS_MANIFEST="$TAILROCKS_PACKAGE_TMP/artifacts/release-manifest.json"
TAILROCKS_PREFLIGHT_SOURCE_SHA="$TAILROCKS_AUTHORITY_SHA"
rtk bun scripts/verify-release-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_AUTHORITY_SHA" \
  --require-version "$TAILROCKS_VERSION" \
  --require-purpose package_preflight \
  --require-released false
rtk bun scripts/verify-oci-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_AUTHORITY_SHA"
TAILROCKS_OCI_INDEX_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field index_digest)"
TAILROCKS_OCI_AMD64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_amd64_digest)"
TAILROCKS_OCI_ARM64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_arm64_digest)"
TAILROCKS_PREFLIGHT_EVIDENCE_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field preflight_evidence_digest)"
TAILROCKS_PREFLIGHT_EVIDENCE_OCI_REF="oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_PREFLIGHT_EVIDENCE_DIGEST"
for TAILROCKS_BINARY in \
  "$TAILROCKS_PACKAGE_TMP/artifacts/tailrocks-aarch64-apple-darwin" \
  "$TAILROCKS_PACKAGE_TMP/artifacts/tailrocks-x86_64-unknown-linux-musl"
do
  gh attestation verify "$TAILROCKS_BINARY" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_AUTHORITY_SHA" \
    --signer-digest "$TAILROCKS_AUTHORITY_SHA" \
    --deny-self-hosted-runners
done
for TAILROCKS_OCI_DIGEST in \
  "$TAILROCKS_OCI_INDEX_DIGEST" \
  "$TAILROCKS_OCI_AMD64_DIGEST" \
  "$TAILROCKS_OCI_ARM64_DIGEST"
do
  DOCKER_CONFIG="$TAILROCKS_PRIVATE_CONFIG" gh attestation verify \
    "oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_OCI_DIGEST" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_AUTHORITY_SHA" \
    --signer-digest "$TAILROCKS_AUTHORITY_SHA" \
    --deny-self-hosted-runners
done
DOCKER_CONFIG="$TAILROCKS_PRIVATE_CONFIG" \
  gh attestation verify "$TAILROCKS_PREFLIGHT_EVIDENCE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_AUTHORITY_SHA" \
  --deny-self-hosted-runners
```

Expected: exactly one protected `package_preflight` run and an attested manifest
with full OCI index/children/source/signer identities and `released=false`.
Require index, both child, and preflight-evidence digest values match
`sha256:[0-9a-f]{64}`; omission/change of any exact attestation constraint fails.

For `PRIVATE` or `PUBLIC`, do not use the absent-package dispatch.
Recover exactly one prior protected preflight closure:

```sh
tailrocks_recover_preflight() {
  DOCKER_CONFIG="$TAILROCKS_PRIVATE_CONFIG" \
    rtk bun scripts/verify-oci-artifacts.ts recover-preflight \
  --package-ref ghcr.io/tailrocks/tailrocks-verifier \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
  --source-ref refs/heads/main \
  --max-candidates 32 \
  "$@" \
  --output-dir "$TAILROCKS_PACKAGE_TMP/recovered" \
  --output "$TAILROCKS_PACKAGE_TMP/recovery.json"
}
if test -n "$TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST"; then
  TAILROCKS_EXPECTED_PREFLIGHT_HEX="${TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST#sha256:}"
  case "$TAILROCKS_EXPECTED_PREFLIGHT_HEX" in
    ''|*[!0-9a-f]*) exit 1 ;;
  esac
  test "${#TAILROCKS_EXPECTED_PREFLIGHT_HEX}" -eq 64
  unset TAILROCKS_EXPECTED_PREFLIGHT_HEX
  tailrocks_recover_preflight \
    --expected-preflight-evidence-digest "$TAILROCKS_EXPECTED_PREFLIGHT_EVIDENCE_DIGEST"
else
  tailrocks_recover_preflight
fi
TAILROCKS_MANIFEST="$TAILROCKS_PACKAGE_TMP/recovered/release-manifest.json"
TAILROCKS_PREFLIGHT_SOURCE_SHA="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_PACKAGE_TMP/recovery.json" --field source_sha)"
TAILROCKS_OCI_INDEX_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field index_digest)"
TAILROCKS_OCI_AMD64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_amd64_digest)"
TAILROCKS_OCI_ARM64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_arm64_digest)"
TAILROCKS_PREFLIGHT_EVIDENCE_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field preflight_evidence_digest)"
TAILROCKS_PREFLIGHT_EVIDENCE_OCI_REF="oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_PREFLIGHT_EVIDENCE_DIGEST"
```

`recover-preflight` performs the same exact file/index/child/evidence
attestation constraints as the absent path using its recovered source SHA and
rejects redacted, zero, multiple, partial, tag-only, or unlinked candidates.
If it reports multiple candidates, stop. On a new attended run set the one
explicit expected digest before the precondition block; the branch above passes
that exact selector. Empty means no selection, and no other selector is allowed.

## Scope

**In scope**: protected package-preflight and no-build visibility-verification
dispatches; one GHCR package creation if absent; attended visibility change for
exactly `tailrocks/tailrocks-verifier`; source/workflow access, anonymous pull,
and durable bootstrap-evidence verification.

**Out of scope**: tracked repository edits/commits, branch/Git-ref/PR mutation,
version/tag/GitHub Release, support claim, policy/candidate/provider work, any
other package/settings.

## Git workflow

None. Stay detached at `<atomic-merge-sha>`. Do not add, commit, push, create or
edit a PR, or create/delete/update any Git branch, tag, or ref. Plan 043 already
delivered every tracked byte in its one branch and PR.

## Steps

### Step 1: Create and verify the private package if absent

Dispatch only the exact protected preflight above. Verify binary/index/children
with exact release-workflow repo/ref/source/signer/hosted-runner constraints.
Use only the validated/assigned index and child digest variables above. Require
the package API returns organization owner, `container`, exact name,
`visibility=private`, and source linkage to
`https://github.com/tailrocks/tailrocks-skills`. Preflight candidate tags and
digests are public-distribution mechanics only; they carry no version/support.
Require the preflight-evidence OCI bytes equal the downloaded canonical file and
bind exact dispatch/run/envelope/package/index/children fields.

If the package already exists, do not push another seed until its owner/source/
visibility and current contents are understood through the exact recovery path.

**Verify**: the downloaded/recovered manifest, direct file/index/child/evidence
attestations, source/signer SHA, hosted runner, package owner/type/name,
repository source link, routed private-or-existing-public visibility, and
`released=false` all match. Re-read detached HEAD, `origin/main`, and the Plan
043 PR; each still equals the atomic merge.

### Step 2: Perform the explicit irreversible visibility change

**Warning:** GitHub states a public package cannot be made private again. Stop
without exact admin authorization.

For `PRIVATE`, with authorization, open only
`https://github.com/orgs/tailrocks/packages/container/tailrocks-verifier/settings`.
Under Danger Zone choose Change visibility, choose Public, type the exact package
name, and confirm. GitHub exposes no supported REST mutation for this visibility
step; do not invent one or automate browser credentials.
For `PUBLIC`, do not open settings or attempt a visibility mutation.

Before opening package settings, destroy private registry auth and create the
empty anonymous config used for every later OCI lookup:

```sh
tailrocks_drop_private_package_auth
test ! -e "$TAILROCKS_PRIVATE_CONFIG"
install -d -m 700 "$TAILROCKS_ANON_DOCKER_CONFIG"
test -z "$(find "$TAILROCKS_ANON_DOCKER_CONFIG" -mindepth 1 -print -quit)"
```

Immediately read back:

```sh
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' orgs/tailrocks/packages/container/tailrocks-verifier --jq .visibility)" = 'public'
```

Dispatch the protected no-build visibility verifier and bind exact preflight
subjects:

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow release-artifacts.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_AUTHORITY_SHA" \
  --input "version=$TAILROCKS_VERSION" \
  --input 'purpose=package_visibility_verify' \
  --input "preflight_index_digest=$TAILROCKS_OCI_INDEX_DIGEST" \
  --input "preflight_evidence_digest=$TAILROCKS_PREFLIGHT_EVIDENCE_DIGEST" \
  --out "$TAILROCKS_PACKAGE_TMP/public-dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_PACKAGE_TMP/public-dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_PACKAGE_TMP/public-dispatch.json" \
  --artifact package-visibility-operation \
  --dir "$TAILROCKS_PACKAGE_TMP/public-artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_PACKAGE_TMP/public-dispatch.json" \
  --manifest "$TAILROCKS_PACKAGE_TMP/public-artifacts/dispatch-context.json"
TAILROCKS_BOOTSTRAP_MANIFEST="$TAILROCKS_PACKAGE_TMP/public-artifacts/bootstrap-manifest.json"
TAILROCKS_BOOTSTRAP_EVIDENCE_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_BOOTSTRAP_MANIFEST" --field bootstrap_evidence_digest)"
TAILROCKS_BOOTSTRAP_EVIDENCE_OCI_REF="oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_BOOTSTRAP_EVIDENCE_DIGEST"
env -u GH_TOKEN -u GITHUB_TOKEN -u CR_PAT \
  DOCKER_CONFIG="$TAILROCKS_ANON_DOCKER_CONFIG" \
  rtk bun scripts/verify-oci-artifacts.ts verify-bootstrap-evidence \
  --oci-ref "$TAILROCKS_BOOTSTRAP_EVIDENCE_OCI_REF" \
  --manifest "$TAILROCKS_BOOTSTRAP_MANIFEST" \
  --require-source "$TAILROCKS_AUTHORITY_SHA" \
  --require-index "$TAILROCKS_OCI_INDEX_DIGEST" \
  --require-anonymous-pull
env -u GH_TOKEN -u GITHUB_TOKEN -u CR_PAT \
  DOCKER_CONFIG="$TAILROCKS_ANON_DOCKER_CONFIG" \
  gh attestation verify "$TAILROCKS_BOOTSTRAP_EVIDENCE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_AUTHORITY_SHA" \
  --deny-self-hosted-runners
```

The mode builds no binary/image and emits no release/support claim. Then remove
registry auth from a fresh process and run:

```sh
env -u GH_TOKEN -u GITHUB_TOKEN -u CR_PAT \
  DOCKER_CONFIG="$TAILROCKS_ANON_DOCKER_CONFIG" \
  rtk docker buildx imagetools inspect \
  "ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_OCI_INDEX_DIGEST"
env -u GH_TOKEN -u GITHUB_TOKEN -u CR_PAT \
  DOCKER_CONFIG="$TAILROCKS_ANON_DOCKER_CONFIG" \
  rtk bun scripts/verify-oci-artifacts.ts verify-bootstrap-evidence \
    --oci-ref "$TAILROCKS_BOOTSTRAP_EVIDENCE_OCI_REF" \
    --manifest "$TAILROCKS_BOOTSTRAP_MANIFEST" \
    --require-source "$TAILROCKS_AUTHORITY_SHA" \
    --require-index "$TAILROCKS_OCI_INDEX_DIGEST" \
    --require-anonymous-pull
tailrocks_cleanup_package_auth
trap - EXIT INT TERM
test ! -e "$TAILROCKS_PRIVATE_CONFIG"
test ! -e "$TAILROCKS_ANON_DOCKER_CONFIG"
test -z "${TAILROCKS_GHCR_READ_TOKEN+x}"
```

Require exact index and both children from the manifest. Keep the preflight
version as an auditable package bootstrap; do not delete/tag/promote it.
Repull `$TAILROCKS_BOOTSTRAP_EVIDENCE_OCI_REF` anonymously through the pinned OCI
client, compare canonical bytes, and retain that full URI plus authority SHA as
the only durable Plan 018 handoff. Actions retention and task temp are not the
handoff.

**Verify**: package readback is exact and public; a fresh empty
`DOCKER_CONFIG` resolves the expected index/children and bootstrap-evidence OCI
bytes without auth; all direct attestation constraints pass. Re-run the clean
detached-head, `origin/main`, and merged-PR checks from Preconditions; no Git
state changed.

## Test plan

- Absent/private/public/wrong-owner/wrong-source package state routing.
- Protected preflight run and direct signer/OCI provenance.
- Protected no-build visibility run and durable public evidence OCI provenance.
- Explicit irreversible approval boundary; no unsupported API mutation.
- Public readback and empty-`DOCKER_CONFIG` unauthenticated exact digest/index/
  children inspection.
- No version/release/support/repository mutation.

## Done criteria

- [ ] Exact package exists under `tailrocks`, links this repository, and is public.
- [ ] Protected preflight manifest/attestations bind exact authority and OCI
  index/children with `released=false`.
- [ ] Fresh unauthenticated digest inspection returns exact index/children.
- [ ] Public attested bootstrap-evidence OCI bytes round-trip and its exact URI/
  authority SHA are handed to Plan 018.
- [ ] Irreversible visibility authorization and readback are retained.
- [ ] Detached `HEAD`, `origin/main`, and the Plan 043 PR merge commit still
  equal `<atomic-merge-sha>`.
- [ ] No tracked repository/Git-ref/version/release/policy mutation occurred;
  no commit, branch, or PR was created.

## STOP conditions

Stop on absent admin approval/auth, wrong package owner/source/type, ambiguous
workflow run, zero/multiple/unselected preflight closure, provenance/digest
mismatch, inability to verify public visibility or anonymous pull, request to
automate unsupported visibility mutation, attached/dirty checkout, atomic
merge/PR/main drift, or any repository/version/release/support change.

## Maintenance notes

Plan 018 may publish the sole software release only after this package is public.
Public candidate digests remain discoverable; only the immutable version tag,
release assets, and later external evidence can create exact release/support
claims. No later software version or implementation PR is part of this roadmap.
