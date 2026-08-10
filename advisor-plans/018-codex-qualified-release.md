# Plan 018: Publish the sole atomic software release

> **Executor instructions**: After Plan 043 merges the complete implementation
> through its one branch and one pull request, and Plan 030 makes the verifier
> package public, run one attended protected release operation from the detached
> atomic merge. Publish the version already committed by Plan 017; never edit or
> increment it. The exact release tag is the sole authorized post-merge Git-ref
> exception. Create no tracked edit, commit, branch, other ref, or PR.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until Plan 030 is complete and the operator explicitly
  authorizes publication of the exact atomic merge/version
- **Effort**: M; one attended, resumable publication operation
- **Risk**: HIGH
- **Depends on**: plan 030
- **Covers**: G06, G08, G14-G16
- **Guardrails**: N03-N08, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-06, F4-16,
  F4-22, F4-24, F4-27, F4-28, F4-37, F4-44, F4-45, F4-47, F4-50
- **Planned at**: design baseline `1e809bd`; publication identities resolved live

## Why this matters

Plan 017 writes one whole-stack vNext after every pre-finalizer tracked capability is present,
and Plan 043 exposes those bytes together in one atomic merge. This operation is
the only software publication for that implementation: one version, one Git
tag, one immutable GitHub Release, and one identical OCI version tag. It binds
and qualifies exact protected-build subjects, preserves a first-write recovery
closure for interruption, and never rebuilds after qualification.

The release may contain Codex and provider adapter code because all code is
already merged. Adapter presence is not provider support. Static documentation
remains fail-closed, Codex support waits for Plan 040's external release closure,
and provider support waits for its later external support manifest. No later
software version or release may be used to finish this implementation attempt.

## Preconditions — run before anything else

Run exactly:

```sh
TAILROCKS_ATOMIC_PR='<plan-043-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SHA="$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_ALLOWED_SIGNERS='config/protected-authority-signers'
test -f "$TAILROCKS_ALLOWED_SIGNERS"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
TAILROCKS_PACKAGE_BOOTSTRAP_OCI_REF='<plan-030-bootstrap-evidence-oci-ref>'
TAILROCKS_RELEASE_TMP="$(mktemp -d /tmp/tailrocks-software-release.XXXXXX)"
TAILROCKS_ANON_CONFIG="$TAILROCKS_RELEASE_TMP/anonymous-docker"
TAILROCKS_READ_CONFIG="$TAILROCKS_RELEASE_TMP/ghcr-read-auth"
TAILROCKS_POST_CONFIG="$TAILROCKS_RELEASE_TMP/ghcr-post-auth"
tailrocks_cleanup_release_auth() {
  set +e
  for TAILROCKS_AUTH_DIR in "$TAILROCKS_READ_CONFIG" "$TAILROCKS_POST_CONFIG"
  do
    if test -d "$TAILROCKS_AUTH_DIR"; then
      DOCKER_CONFIG="$TAILROCKS_AUTH_DIR" rtk docker logout ghcr.io >/dev/null 2>&1
      rm -f -- "$TAILROCKS_AUTH_DIR/config.json"
      rmdir -- "$TAILROCKS_AUTH_DIR" 2>/dev/null || true
    fi
  done
  unset TAILROCKS_GHCR_READ_TOKEN TAILROCKS_GHCR_POST_TOKEN
  unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
}
trap tailrocks_cleanup_release_auth EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
install -d -m 700 "$TAILROCKS_ANON_CONFIG"
test -z "$(find "$TAILROCKS_ANON_CONFIG" -mindepth 1 -print -quit)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' orgs/tailrocks/packages/container/tailrocks-verifier --jq '[.package_type,.name,.visibility,.repository.full_name] | @tsv')" = "$(printf 'container\ttailrocks-verifier\tpublic\ttailrocks/tailrocks-skills')"
env -u GH_TOKEN -u GITHUB_TOKEN -u CR_PAT \
  -u TAILROCKS_AUTHORITY_SIGNING_KEY -u TAILROCKS_AUTHORITY_SIGNER_ID \
  DOCKER_CONFIG="$TAILROCKS_ANON_CONFIG" \
  rtk bun scripts/verify-oci-artifacts.ts verify-bootstrap-evidence \
    --oci-ref "$TAILROCKS_PACKAGE_BOOTSTRAP_OCI_REF" \
    --require-source "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --require-anonymous-pull
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)" = 'true'
TAILROCKS_VERSION="$(rtk bun scripts/release-version.ts current --format plain)"
TAILROCKS_RELEASE_TAG="v$TAILROCKS_VERSION"
rtk bun scripts/release-version.ts check --require-unreleased
rtk bun scripts/protected-environment.ts verify-tag-authority \
  --repo tailrocks/tailrocks-skills \
  --candidate-tag "$TAILROCKS_RELEASE_TAG" \
  --require-all-tags \
  --output "$TAILROCKS_RELEASE_TMP/tag-authority.json"
TAILROCKS_PUBLICATION_STATE="$TAILROCKS_RELEASE_TMP/publication-state.json"
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills \
  --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex \
  --output "$TAILROCKS_PUBLICATION_STATE"
TAILROCKS_PUBLICATION_MODE="$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)"
case "$TAILROCKS_PUBLICATION_MODE" in
  EMPTY|TAG_ONLY|DRAFT_EMPTY|DRAFT_RECOVERABLE|DRAFT_COMPLETE|PUBLISHED_PENDING_VERIFY) ;;
  *) exit 1 ;;
esac
rtk mise run verify
rtk codex --version
```

Expected: clean detached checkout with
`HEAD == origin/main == <atomic-merge-sha>`, exact `MERGED` PR/merge-commit
readback for Plan 043's sole PR, Plan 030's exact public package/bootstrap
evidence, one lockstep unreleased version already present in the merge, immutable
release/tag authority, complete repository gates, exact Codex client, and an
empty or recoverable publication state for that same version. Any mismatch or
absent release authorization blocks before dispatch or mutation.

## Spec contract

### Requirement G06/G08/G14-G16: publish all merged code once

One nonce-bound protected workflow SHALL build and directly attest the native
CLI, Plan-045 broker, and verifier OCI subjects from the exact atomic merge. An attended native
Codex run SHALL qualify only those downloaded/digest-pinned subjects and remain
`operator_attested`. The release SHALL publish the already-merged Plan 017
version, exact atomic tag, immutable GitHub Release assets, and a digest-
preserving OCI version tag without rebuild.

The first completed draft asset SHALL be a canonical recovery bundle containing
the entire sealed generation and a domain-separated signature from the pinned
operator key over every subject/asset identity. An interrupted operation may resume only that
same version, tag, atomic source, qualification generation, and asset closure.
It is not permission for a second implementation branch/PR, a second version, or
a replacement release.

#### Scenario: publication or subject drift

- **WHEN** atomic main/PR, version, workflow run, signer, file hash, OCI index/
  child, qualification, release metadata, tag target, or recovered byte differs
- **THEN** stop; publish nothing further and never substitute a new version.

#### Scenario: adapters exist without provider evidence

- **WHEN** the software contains a provider adapter but no verified external
  provider support manifest exists
- **THEN** release/docs expose the adapter only as unqualified capability and
  report provider support pending; no tier/date/support claim is emitted.

## Must NOT

- **N03-N05/N17**: mutable candidate argv, host candidate gates, or same-user
  secret visibility cannot support an autonomous tier.
- **N06/N07**: auth remains operator/workflow-owned; PR/candidate receives none.
- **N08/N12/N13**: transcript, prior PASS, tag, hash, adapter presence, or
  attestation cannot replace exact final-subject evidence.
- **N11**: no publication without explicit authorization; no rebuild after
  qualification and no repair by replacing uploaded/published bytes.
- **N16**: workflow search, artifacts, state, API pages, processes, evidence,
  assets, and retries are closed/bounded.
- **N18**: native comparator evidence is integrity-only, query-capped, and makes
  no confidentiality claim.
- **N19**: Plan 043 is the only implementation branch/PR/merge. The exact
  `refs/tags/$TAILROCKS_RELEASE_TAG` target at the atomic merge is the sole
  authorized post-merge Git-ref exception. No tracked edit, commit, branch,
  other ref, PR, later version, or later software release is allowed.

## Inputs to provide

- Exact Plan 043 PR/atomic merge SHA and Plan 030 bootstrap-evidence OCI URI.
- Explicit authorization for this exact atomic SHA/version/tag and immutable
  GitHub Release/OCI publication.
- Authenticated operator GitHub/GHCR session and native Codex TTY under the
  proven dedicated host-read boundary. Credentials never enter inputs, logs,
  evidence, recovery bytes, or child processes.
- Exact directly attested released Plan-045 broker digest, reviewed rendered
  account-policy digest, and attended host-admin
  authority to apply its rendered create-if-absent/verify-equal boundary before
  native execution; any conflict or broader privilege blocks.
- Process-only `TAILROCKS_GHCR_READ_TOKEN` for Step 1 attestation lookup. After
  native qualification, provide `TAILROCKS_GHCR_POST_TOKEN` with `write:packages`
  only when publication still needs OCI promotion; verify-only recovery needs
  read scope. Both use the named task-private configs, are piped with tracing
  disabled, immediately unset, and never enter a provider/candidate process.
- Protected-environment approval and repository-admin read authority for
  unredacted authority-envelope pre/post checks.
- Plan-022-pinned signer ID and matching controller-owned mode-0600 authority
  signing key. Native Codex runs only as the distinct `tailrocks-native-client`
  OS principal with its task-only auth home; it cannot read controller home,
  signing key, parent environment, Git/GH credentials, or agent sockets.

## Starting state

- Plan 017 changed all four version fields exactly once and made static docs
  permanently fail-closed until external evidence verifies.
- Plan 043 atomically merged every runtime, adapter, workflow, validator, schema,
  test, and static documentation byte through one PR.
- Plan 031 established attended release authority. Plan 030 established the
  exact public/source-linked verifier package and bootstrap-evidence OCI.
- No software tag/Release/version tag exists unless the publication state is one
  of the exact resumable states above. No provider support tier is predeclared.

## Commands you will need

For `EMPTY`, `TAG_ONLY`, or `DRAFT_EMPTY`, create one qualification generation:

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow release-artifacts.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input "version=$TAILROCKS_VERSION" \
  --input 'purpose=release_candidate' \
  --out "$TAILROCKS_RELEASE_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_RELEASE_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_RELEASE_TMP/dispatch.json" \
  --artifact release-operation \
  --dir "$TAILROCKS_RELEASE_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_RELEASE_TMP/dispatch.json" \
  --manifest "$TAILROCKS_RELEASE_TMP/artifacts/dispatch-context.json"
TAILROCKS_RELEASE_CONTEXT="$TAILROCKS_RELEASE_TMP/artifacts/dispatch-context.json"
TAILROCKS_MANIFEST="$TAILROCKS_RELEASE_TMP/artifacts/release-manifest.json"
TAILROCKS_BINARY_DARWIN="$TAILROCKS_RELEASE_TMP/artifacts/tailrocks-aarch64-apple-darwin"
TAILROCKS_BINARY_LINUX="$TAILROCKS_RELEASE_TMP/artifacts/tailrocks-x86_64-unknown-linux-musl"
TAILROCKS_BROKER_DARWIN="$TAILROCKS_RELEASE_TMP/artifacts/tailrocks-native-client-broker-aarch64-apple-darwin"
TAILROCKS_BROKER_LINUX="$TAILROCKS_RELEASE_TMP/artifacts/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
TAILROCKS_CODEX_QUALIFICATION="$TAILROCKS_RELEASE_TMP/codex-qualification.json"
TAILROCKS_QUALIFICATION_MANIFEST="$TAILROCKS_RELEASE_TMP/qualification-manifest.json"
TAILROCKS_RELEASE_NOTES="$TAILROCKS_RELEASE_TMP/artifacts/release-notes.md"
TAILROCKS_AUTHORITY_CONTEXT="$TAILROCKS_RELEASE_CONTEXT"
```

Exactly one run/attempt must match workflow, main ref, atomic head, event, actor,
time, nonce, version, purpose, and downloaded context.

## Interrupted-session recovery

For `DRAFT_RECOVERABLE` or `DRAFT_COMPLETE`, do not dispatch another build or
create new qualification evidence. Recover the original generation exactly:

```sh
gh release download "$TAILROCKS_RELEASE_TAG" \
  --pattern release-recovery-v1.json \
  --dir "$TAILROCKS_RELEASE_TMP/recovery-download"
TAILROCKS_RECOVERY_BUNDLE="$TAILROCKS_RELEASE_TMP/recovery-download/release-recovery-v1.json"
rtk bun scripts/release-version.ts recover-release \
  --state "$TAILROCKS_PUBLICATION_STATE" \
  --bundle "$TAILROCKS_RECOVERY_BUNDLE" \
  --allowed-signers "$TAILROCKS_ALLOWED_SIGNERS" \
  --require-signer-id "$TAILROCKS_AUTHORITY_SIGNER_ID" \
  --output-dir "$TAILROCKS_RELEASE_TMP/recovered-assets"
TAILROCKS_MANIFEST="$TAILROCKS_RELEASE_TMP/recovered-assets/release-manifest.json"
TAILROCKS_RELEASE_CONTEXT="$TAILROCKS_RELEASE_TMP/recovered-assets/dispatch-context.json"
TAILROCKS_BINARY_DARWIN="$TAILROCKS_RELEASE_TMP/recovered-assets/tailrocks-aarch64-apple-darwin"
TAILROCKS_BINARY_LINUX="$TAILROCKS_RELEASE_TMP/recovered-assets/tailrocks-x86_64-unknown-linux-musl"
TAILROCKS_BROKER_DARWIN="$TAILROCKS_RELEASE_TMP/recovered-assets/tailrocks-native-client-broker-aarch64-apple-darwin"
TAILROCKS_BROKER_LINUX="$TAILROCKS_RELEASE_TMP/recovered-assets/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
TAILROCKS_NATIVE_BOUNDARY_RECEIPT="$TAILROCKS_RELEASE_TMP/recovered-assets/native-boundary-v1.json"
TAILROCKS_CODEX_QUALIFICATION="$TAILROCKS_RELEASE_TMP/recovered-assets/codex-qualification.json"
TAILROCKS_QUALIFICATION_MANIFEST="$TAILROCKS_RELEASE_TMP/recovered-assets/qualification-manifest.json"
TAILROCKS_RELEASE_NOTES="$TAILROCKS_RELEASE_TMP/recovered-assets/release-notes.md"
rtk bun scripts/verify-release-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --require-version "$TAILROCKS_VERSION"
rtk bun scripts/verify-release-artifacts.ts verify-qualification \
  --release-manifest "$TAILROCKS_MANIFEST" \
  --qualification-manifest "$TAILROCKS_QUALIFICATION_MANIFEST" \
  --evidence "$TAILROCKS_CODEX_QUALIFICATION" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --dispatch-context "$TAILROCKS_RELEASE_CONTEXT" \
  --release-notes "$TAILROCKS_RELEASE_NOTES"
rtk bun scripts/verify-oci-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_OCI_INDEX_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field index_digest)"
TAILROCKS_OCI_AMD64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_amd64_digest)"
TAILROCKS_OCI_ARM64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_arm64_digest)"
if test "$TAILROCKS_PUBLICATION_MODE" != PUBLISHED_PENDING_VERIFY; then
TAILROCKS_RECOVERY_BUNDLE_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_RECOVERY_BUNDLE")"
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow release-artifacts.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input "version=$TAILROCKS_VERSION" \
  --input 'purpose=release_finalize' \
  --input "recovery_bundle_digest=$TAILROCKS_RECOVERY_BUNDLE_DIGEST" \
  --out "$TAILROCKS_RELEASE_TMP/finalize-dispatch.json"
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_RELEASE_TMP/finalize-dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_RELEASE_TMP/finalize-dispatch.json" \
  --artifact release-finalization \
  --dir "$TAILROCKS_RELEASE_TMP/finalization"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_RELEASE_TMP/finalize-dispatch.json" \
  --manifest "$TAILROCKS_RELEASE_TMP/finalization/dispatch-context.json"
TAILROCKS_AUTHORITY_CONTEXT="$TAILROCKS_RELEASE_TMP/finalization/dispatch-context.json"
fi
```

The finalize mode builds, signs, promotes, uploads, tags, and publishes nothing;
it supplies fresh protected approval for the exact existing recovery digest.
For `PUBLISHED_PENDING_VERIFY`, use the same download/recovery verification but
skip finalize and every mutation. A conflict or unrecoverable immutable byte
leaves this attempt permanently BLOCKED; it does not authorize another version.

## Scope

**In scope**: one protected release build; disposable exact install/OCI/native
Codex qualification; canonical recovery closure; authorized exact software tag,
GitHub Release assets, and digest-preserving OCI version-tag publication; final
immutable round-trip verification.

**Out of scope**: tracked repository edits, commits, branches, PRs, any Git ref
other than the exact release tag, version changes, second software release,
policy/candidate publication, provider qualification/support manifest, static
documentation edits.

## Git workflow

None. Stay detached at `<atomic-merge-sha>`. Do not add, commit, push a branch,
open/edit a PR, or create/update/delete any Git ref except the single authorized
`refs/tags/$TAILROCKS_RELEASE_TAG` pointing at that SHA. Push that exact tag
directly from the detached commit; never create an implementation branch or
local follow-up commit.

## Steps

### Step 1: Build once from the atomic merge and verify every subject

For a new generation, dispatch the Commands lane once. Validate the closed
release manifest and resolve all three OCI digests:

```sh
test ! -e "$TAILROCKS_READ_CONFIG"
install -d -m 700 "$TAILROCKS_READ_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | \
  env -u TAILROCKS_GHCR_READ_TOKEN \
    DOCKER_CONFIG="$TAILROCKS_READ_CONFIG" \
    rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
test -z "${TAILROCKS_GHCR_READ_TOKEN+x}"
rtk bun scripts/verify-release-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --require-version "$TAILROCKS_VERSION" \
  --require-purpose release_candidate \
  --require-released false
rtk bun scripts/verify-oci-artifacts.ts \
  --manifest "$TAILROCKS_MANIFEST" \
  --require-source "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_OCI_INDEX_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field index_digest)"
TAILROCKS_OCI_AMD64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_amd64_digest)"
TAILROCKS_OCI_ARM64_DIGEST="$(rtk bun scripts/verify-oci-artifacts.ts print-field --manifest "$TAILROCKS_MANIFEST" --field linux_arm64_digest)"
```

Require each digest to match `sha256:[0-9a-f]{64}`. Verify both CLI files, both
Plan-045 broker files, and the index plus both children using `gh attestation verify` with exact repository,
`release-artifacts.yml` signer workflow, `refs/heads/main`, source and signer
digest equal to the atomic merge, and `--deny-self-hosted-runners`. Pull by
digest, select each child, remove/repull, and require byte-identical subjects.

```sh
for TAILROCKS_BINARY in \
  "$TAILROCKS_BINARY_DARWIN" \
  "$TAILROCKS_BINARY_LINUX" \
  "$TAILROCKS_BROKER_DARWIN" \
  "$TAILROCKS_BROKER_LINUX"
do
  gh attestation verify "$TAILROCKS_BINARY" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --deny-self-hosted-runners
done
for TAILROCKS_OCI_DIGEST in \
  "$TAILROCKS_OCI_INDEX_DIGEST" \
  "$TAILROCKS_OCI_AMD64_DIGEST" \
  "$TAILROCKS_OCI_ARM64_DIGEST"
do
  DOCKER_CONFIG="$TAILROCKS_READ_CONFIG" gh attestation verify \
    "oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_OCI_DIGEST" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
    --deny-self-hosted-runners
done
```

Use `DOCKER_CONFIG="$TAILROCKS_READ_CONFIG"` for every digest pull/repull in
this step. Before any native Codex/provider child starts, run:

```sh
DOCKER_CONFIG="$TAILROCKS_READ_CONFIG" rtk docker logout ghcr.io >/dev/null
rm -f -- "$TAILROCKS_READ_CONFIG/config.json"
rmdir -- "$TAILROCKS_READ_CONFIG"
test ! -e "$TAILROCKS_READ_CONFIG"
```

**Verify**: manifest/OCI validators and all seven direct attestations pass. Wrong
ref/source/signer/platform/digest, reusable signer, self-hosted claim, missing
child/broker role, package-bootstrap mismatch, mutable tag, or main/PR drift fails before
installation or qualification.

### Step 2: Qualify only those subjects and seal one recovery generation

Run clean install, real-prior upgrade when one exists, failed-upgrade rollback,
uninstall/reinstall, PATH-shadow attack, digest-pinned OCI pull/remove/repull,
platform child checks, offline/hostile canaries, and `--pull never` isolated
execution. Worker receives no registry auth, network, socket, provider
credential, or host candidate code.

Run the interactive native Codex lifecycle, never `codex exec`:

```sh
test ! -e "$TAILROCKS_RELEASE_TMP/native-codex-home"
TAILROCKS_BOUNDARY_PLAN_DIR="$TAILROCKS_RELEASE_TMP/native-boundary-plan"
TAILROCKS_NATIVE_BOUNDARY_RECEIPT="$TAILROCKS_RELEASE_TMP/native-boundary-v1.json"
case "$(uname -s):$(uname -m)" in
  Darwin:arm64) TAILROCKS_NATIVE_BROKER="$TAILROCKS_BROKER_DARWIN" ;;
  Linux:x86_64) TAILROCKS_NATIVE_BROKER="$TAILROCKS_BROKER_LINUX" ;;
  *) exit 1 ;;
esac
TAILROCKS_NATIVE_BROKER_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_NATIVE_BROKER")"
rtk bun scripts/install-native-client-boundary.ts render \
  --platform "$(uname -s | tr '[:upper:]' '[:lower:]')" \
  --principal tailrocks-native-client \
  --controller-user "$(id -un)" \
  --broker "$TAILROCKS_NATIVE_BROKER" \
  --output-dir "$TAILROCKS_BOUNDARY_PLAN_DIR"
TAILROCKS_BOUNDARY_PLAN="$TAILROCKS_BOUNDARY_PLAN_DIR/plan.json"
TAILROCKS_BOUNDARY_PLAN_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_BOUNDARY_PLAN")"
TAILROCKS_NATIVE_POLICY_DIGEST="$(rtk bun scripts/install-native-client-boundary.ts print-field --plan "$TAILROCKS_BOUNDARY_PLAN" --field policy_sha256)"
test "$(rtk bun scripts/install-native-client-boundary.ts print-field --plan "$TAILROCKS_BOUNDARY_PLAN" --field broker_sha256)" = "$TAILROCKS_NATIVE_BROKER_DIGEST"
rtk bun scripts/install-native-client-boundary.ts review --plan "$TAILROCKS_BOUNDARY_PLAN"
# STOP: a separate attended operator reviews the full plan and supplies this digest.
test -n "${TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST:?missing independent boundary-plan approval}"
test "$TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST" = "$TAILROCKS_BOUNDARY_PLAN_DIGEST"
rtk bun scripts/install-native-client-boundary.ts ensure-live \
  --reviewed-plan "$TAILROCKS_BOUNDARY_PLAN" \
  --approve-plan-sha256 "$TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST" \
  --output "$TAILROCKS_RELEASE_TMP/native-boundary-install.json"
unset TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST
rtk bun scripts/install-native-client-boundary.ts verify-live \
  --principal tailrocks-native-client \
  --broker-digest "$TAILROCKS_NATIVE_BROKER_DIGEST" \
  --policy-digest "$TAILROCKS_NATIVE_POLICY_DIGEST" \
  --output "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT"
rtk bun scripts/provider-conformance.ts run-release \
  --provider codex \
  --client-principal tailrocks-native-client \
  --client-task-home "$TAILROCKS_RELEASE_TMP/native-codex-home" \
  --controller-signing-key "$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --release-manifest "$TAILROCKS_MANIFEST" \
  --output "$TAILROCKS_CODEX_QUALIFICATION"
rtk bun scripts/native-client-sandbox.ts assert-quiescent \
  --principal tailrocks-native-client
test ! -e "$TAILROCKS_RELEASE_TMP/native-codex-home"
rtk bun scripts/provider-conformance.ts validate-release \
  "$TAILROCKS_CODEX_QUALIFICATION"
rtk bun scripts/verify-release-artifacts.ts seal-qualification \
  --release-manifest "$TAILROCKS_MANIFEST" \
  --evidence "$TAILROCKS_CODEX_QUALIFICATION" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --dispatch-context "$TAILROCKS_RELEASE_CONTEXT" \
  --release-notes "$TAILROCKS_RELEASE_NOTES" \
  --output "$TAILROCKS_QUALIFICATION_MANIFEST"
TAILROCKS_RECOVERY_BUNDLE="$TAILROCKS_RELEASE_TMP/release-recovery-v1.json"
rtk bun scripts/release-version.ts seal-release-recovery \
  --profile codex \
  --sealed-manifest "$TAILROCKS_QUALIFICATION_MANIFEST" \
  --signer-id "$TAILROCKS_AUTHORITY_SIGNER_ID" \
  --signing-key "$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  --allowed-signers "$TAILROCKS_ALLOWED_SIGNERS" \
  --asset "$TAILROCKS_BINARY_DARWIN" \
  --asset "$TAILROCKS_BINARY_LINUX" \
  --asset "$TAILROCKS_BROKER_DARWIN" \
  --asset "$TAILROCKS_BROKER_LINUX" \
  --asset "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --asset "$TAILROCKS_MANIFEST" \
  --asset "$TAILROCKS_RELEASE_CONTEXT" \
  --asset "$TAILROCKS_CODEX_QUALIFICATION" \
  --asset "$TAILROCKS_QUALIFICATION_MANIFEST" \
  --asset "$TAILROCKS_RELEASE_NOTES" \
  --output "$TAILROCKS_RECOVERY_BUNDLE"
```

Exercise CONTINUE/NEXT/BLOCKED/PASS, resume/compaction/budget exhaustion, stale
PASS, hook/session conflict, scope/oracle/tool/profile/image tamper, cumulative
query overflow, outside read/write, network, and broker probing. Qualification
binds exact Codex/config/hook, binaries, OCI index/children, atomic source,
direct signer, schemas, host profile, and `operator_attested` origin.

Release notes may list installed adapters but must say Codex support awaits the
Plan 040 external closure and provider support awaits its external manifest.
They may not infer a tier from adapter presence or this local qualification.

**Verify**: qualification validation, pinned signer/namespace verification,
seal verification, and recovery round trip
exit 0; the recovered files exactly equal all ten source assets. Fixtures
reject subject drift, credential residue, false trust/confidentiality, provider
tier/date claim, unbounded evidence, noncanonical recovery, or a second
generation after recovery exists.

### Step 3: Publish the sealed generation through the exact recovery states

Immediately re-read local `origin/main`, remote GitHub main, and the PR; require
the Preconditions identity and clean detached checkout without fetching or
moving any local ref. Refresh `inspect-publication`. Execute only the matching
transition:

1. `EMPTY`: push
   `$TAILROCKS_ATOMIC_MERGE_SHA:refs/tags/$TAILROCKS_RELEASE_TAG`, then require
   remote `TAG_ONLY`.
2. `TAG_ONLY`: create an empty draft with exact tag/title/notes.
3. `DRAFT_EMPTY`: upload `release-recovery-v1.json` first.
4. `DRAFT_RECOVERABLE`: recover original bytes, compare every present asset,
   and upload only missing canonical names. Never clobber completed bytes.
5. `DRAFT_COMPLETE`: verify exact closure; upload nothing.
6. Promote the exact OCI index to `:$TAILROCKS_RELEASE_TAG` with unchanged index
   and children, then publish the verified draft without rebuilding.
7. `PUBLISHED_PENDING_VERIFY`: mutate nothing; proceed to Step 4.

Use only these mutation commands after the corresponding state check:

```sh
test ! -e "$TAILROCKS_POST_CONFIG"
install -d -m 700 "$TAILROCKS_POST_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_POST_TOKEN:?missing GHCR post-qualification token}"
printf '%s' "$TAILROCKS_GHCR_POST_TOKEN" | \
  env -u TAILROCKS_GHCR_POST_TOKEN \
    DOCKER_CONFIG="$TAILROCKS_POST_CONFIG" \
    rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_POST_TOKEN
test -z "${TAILROCKS_GHCR_POST_TOKEN+x}"
if test "$TAILROCKS_PUBLICATION_MODE" = PUBLISHED_PENDING_VERIFY; then
  rtk bun scripts/verify-oci-artifacts.ts require-registry-auth \
    --config "$TAILROCKS_POST_CONFIG" \
    --repository ghcr.io/tailrocks/tailrocks-verifier \
    --require-action pull
else
  rtk bun scripts/verify-oci-artifacts.ts require-registry-auth \
    --config "$TAILROCKS_POST_CONFIG" \
    --repository ghcr.io/tailrocks/tailrocks-verifier \
    --require-action pull --require-action push
fi
if test "$TAILROCKS_PUBLICATION_MODE" != PUBLISHED_PENDING_VERIFY; then
rtk bun scripts/protected-workflow.ts verify-authority \
  --context "$TAILROCKS_AUTHORITY_CONTEXT" \
  --require-current \
  --out "$TAILROCKS_RELEASE_TMP/prepublish-authority.json"
if test "$TAILROCKS_PUBLICATION_MODE" = EMPTY; then
  rtk git push origin "$TAILROCKS_ATOMIC_MERGE_SHA:refs/tags/$TAILROCKS_RELEASE_TAG"
fi
test "$(rtk git ls-remote --refs origin "refs/tags/$TAILROCKS_RELEASE_TAG" | cut -f1)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
TAILROCKS_PUBLICATION_MODE="$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)"
if test "$TAILROCKS_PUBLICATION_MODE" = TAG_ONLY; then
  gh release create "$TAILROCKS_RELEASE_TAG" --draft --verify-tag \
    --title "$TAILROCKS_RELEASE_TAG" --notes-file "$TAILROCKS_RELEASE_NOTES"
fi
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
TAILROCKS_PUBLICATION_MODE="$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)"
if test "$TAILROCKS_PUBLICATION_MODE" = DRAFT_EMPTY; then
  rtk bun scripts/release-version.ts upload-recovery-bundle \
    --state "$TAILROCKS_PUBLICATION_STATE" \
    --bundle "$TAILROCKS_RECOVERY_BUNDLE" \
    --repair-starter-assets
fi
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
TAILROCKS_PUBLICATION_MODE="$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)"
case "$TAILROCKS_PUBLICATION_MODE" in
  DRAFT_RECOVERABLE)
    rtk bun scripts/release-version.ts reconcile-draft-assets \
      --state "$TAILROCKS_PUBLICATION_STATE" \
      --recovery-bundle "$TAILROCKS_RECOVERY_BUNDLE" \
      --sealed-manifest "$TAILROCKS_QUALIFICATION_MANIFEST" \
      --download-dir "$TAILROCKS_RELEASE_TMP/draft-assets" \
      --asset "$TAILROCKS_BINARY_DARWIN" \
      --asset "$TAILROCKS_BINARY_LINUX" \
      --asset "$TAILROCKS_BROKER_DARWIN" \
      --asset "$TAILROCKS_BROKER_LINUX" \
      --asset "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
      --asset "$TAILROCKS_MANIFEST" \
      --asset "$TAILROCKS_RELEASE_CONTEXT" \
      --asset "$TAILROCKS_CODEX_QUALIFICATION" \
      --asset "$TAILROCKS_QUALIFICATION_MANIFEST" \
      --asset "$TAILROCKS_RELEASE_NOTES" \
      --upload-missing \
      --repair-starter-assets
    ;;
  DRAFT_COMPLETE)
    rtk bun scripts/release-version.ts reconcile-draft-assets \
      --state "$TAILROCKS_PUBLICATION_STATE" \
      --recovery-bundle "$TAILROCKS_RECOVERY_BUNDLE" \
      --sealed-manifest "$TAILROCKS_QUALIFICATION_MANIFEST" \
      --download-dir "$TAILROCKS_RELEASE_TMP/draft-assets" \
      --asset "$TAILROCKS_BINARY_DARWIN" \
      --asset "$TAILROCKS_BINARY_LINUX" \
      --asset "$TAILROCKS_BROKER_DARWIN" \
      --asset "$TAILROCKS_BROKER_LINUX" \
      --asset "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
      --asset "$TAILROCKS_MANIFEST" \
      --asset "$TAILROCKS_RELEASE_CONTEXT" \
      --asset "$TAILROCKS_CODEX_QUALIFICATION" \
      --asset "$TAILROCKS_QUALIFICATION_MANIFEST" \
      --asset "$TAILROCKS_RELEASE_NOTES"
    ;;
  *) exit 1 ;;
esac
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
test "$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)" = DRAFT_COMPLETE
DOCKER_CONFIG="$TAILROCKS_POST_CONFIG" rtk bun scripts/oci-release.ts promote \
  --source "ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_OCI_INDEX_DIGEST" \
  --tag "ghcr.io/tailrocks/tailrocks-verifier:$TAILROCKS_RELEASE_TAG" \
  --expect-index "$TAILROCKS_OCI_INDEX_DIGEST" \
  --expect-child "linux/amd64=$TAILROCKS_OCI_AMD64_DIGEST" \
  --expect-child "linux/arm64=$TAILROCKS_OCI_ARM64_DIGEST"
rtk bun scripts/protected-workflow.ts verify-authority \
  --context "$TAILROCKS_AUTHORITY_CONTEXT" \
  --require-current \
  --out "$TAILROCKS_RELEASE_TMP/prerelease-authority.json"
test "$(gh api -H 'X-GitHub-Api-Version: 2026-03-10' repos/tailrocks/tailrocks-skills/immutable-releases --jq .enabled)" = 'true'
gh release edit "$TAILROCKS_RELEASE_TAG" --draft=false --verify-tag
fi
```

After any failure, rerun `inspect-publication` and stop. That helper treats an
unsigned, foreign-signer, or altered recovery bundle as `CONFLICT`. A later attended session
may resume only the exact matching state and recovery generation. The helper's
only deletion permission is an exact draft `state=starter` asset before completed
bytes exist. It may never move/delete the release tag or replace/delete uploaded
or published bytes.

**Verify**: after each mutation, the next enumerated state is observed; remote
tag always equals the atomic merge; OCI version tag resolves to the exact index/
children; immutable-release and authority readbacks remain exact. Any unlisted
state, concurrent change, missing authorization, or need to change bytes blocks
without a later version.

### Step 4: Round-trip the immutable release and freeze support truth

Download the published release into a new directory. Run `gh release verify` and
`gh release verify-asset` for every canonical asset. Recover the bundle, compare
all bytes and digests, re-run release/qualification validators, direct CLI/
broker/index/child attestations, digest and version-tag pulls, and installer/image
lifecycle checks. Require Git tag target, release source, manifest source, and
all workflow/signer identities equal the atomic merge. Every registry lookup in
this step uses `DOCKER_CONFIG="$TAILROCKS_POST_CONFIG"`; no native/provider child
runs after this config is created.

```sh
TAILROCKS_PUBLISHED_DIR="$TAILROCKS_RELEASE_TMP/published-release"
test ! -e "$TAILROCKS_PUBLISHED_DIR"
mkdir "$TAILROCKS_PUBLISHED_DIR"
gh release download "$TAILROCKS_RELEASE_TAG" --dir "$TAILROCKS_PUBLISHED_DIR"
gh release verify "$TAILROCKS_RELEASE_TAG"
for TAILROCKS_RELEASE_ASSET in \
  "$TAILROCKS_PUBLISHED_DIR/release-recovery-v1.json" \
  "$TAILROCKS_PUBLISHED_DIR/tailrocks-aarch64-apple-darwin" \
  "$TAILROCKS_PUBLISHED_DIR/tailrocks-x86_64-unknown-linux-musl" \
  "$TAILROCKS_PUBLISHED_DIR/tailrocks-native-client-broker-aarch64-apple-darwin" \
  "$TAILROCKS_PUBLISHED_DIR/tailrocks-native-client-broker-x86_64-unknown-linux-musl" \
  "$TAILROCKS_PUBLISHED_DIR/native-boundary-v1.json" \
  "$TAILROCKS_PUBLISHED_DIR/release-manifest.json" \
  "$TAILROCKS_PUBLISHED_DIR/dispatch-context.json" \
  "$TAILROCKS_PUBLISHED_DIR/codex-qualification.json" \
  "$TAILROCKS_PUBLISHED_DIR/qualification-manifest.json" \
  "$TAILROCKS_PUBLISHED_DIR/release-notes.md"
do
  gh release verify-asset "$TAILROCKS_RELEASE_TAG" "$TAILROCKS_RELEASE_ASSET"
done
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
rtk bun scripts/release-version.ts recover-release \
  --state "$TAILROCKS_PUBLICATION_STATE" \
  --bundle "$TAILROCKS_PUBLISHED_DIR/release-recovery-v1.json" \
  --allowed-signers "$TAILROCKS_ALLOWED_SIGNERS" \
  --require-signer-id "$TAILROCKS_AUTHORITY_SIGNER_ID" \
  --output-dir "$TAILROCKS_RELEASE_TMP/final-recovered-assets"
rtk bun scripts/verify-release-artifacts.ts \
  --manifest "$TAILROCKS_PUBLISHED_DIR/release-manifest.json" \
  --require-source "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --require-version "$TAILROCKS_VERSION"
rtk bun scripts/verify-release-artifacts.ts verify-qualification \
  --release-manifest "$TAILROCKS_PUBLISHED_DIR/release-manifest.json" \
  --qualification-manifest "$TAILROCKS_PUBLISHED_DIR/qualification-manifest.json" \
  --evidence "$TAILROCKS_PUBLISHED_DIR/codex-qualification.json" \
  --native-boundary-receipt "$TAILROCKS_PUBLISHED_DIR/native-boundary-v1.json" \
  --dispatch-context "$TAILROCKS_PUBLISHED_DIR/dispatch-context.json" \
  --release-notes "$TAILROCKS_PUBLISHED_DIR/release-notes.md"
```

Finally rerun:

```sh
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git ls-remote --refs origin "refs/tags/$TAILROCKS_RELEASE_TAG" | cut -f1)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
rtk bun scripts/release-version.ts inspect-publication \
  --repo tailrocks/tailrocks-skills --remote origin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --profile codex --output "$TAILROCKS_PUBLICATION_STATE"
test "$(rtk bun scripts/release-version.ts print-field --input "$TAILROCKS_PUBLICATION_STATE" --field state)" = PUBLISHED_PENDING_VERIFY
tailrocks_cleanup_release_auth
trap - EXIT INT TERM
test ! -e "$TAILROCKS_READ_CONFIG"
test ! -e "$TAILROCKS_POST_CONFIG"
test -z "${TAILROCKS_AUTHORITY_SIGNING_KEY+x}"
```

Retain exact release/tag/version/source, asset/qualification/recovery digests,
OCI index/children/version tag, authority envelopes, workflow run/attempt, and
publication authorization in the external receipt. Codex/provider support
remains pending until its corresponding digest-addressed external manifest
verifies; no Git documentation edit follows.

**Verify**: independent redownload/recovery/repull and every attestation pass;
final detached HEAD, atomic main/PR, clean tree, exact sole tag, and publication
state remain unchanged. Static support resolver still fails closed without an
external closure and never infers provider tier from included adapters.

## Test plan

- Atomic detached HEAD/main/PR identity and Plan 030 bootstrap receipt.
- Unique protected release run/attempt and direct signer provenance.
- Binary/index/child install, OCI lifecycle, and native Codex qualification.
- Canonical recovery, every interruption state, starter repair, and no clobber.
- Exact one-tag/GitHub Release/OCI promotion and immutable round trip.
- Adapter-present/provider-manifest-absent support remains pending.
- No tracked edit, commit, branch, second ref/PR/version/release.

## Done criteria

- [ ] One premerged lockstep version is published; no version file changed.
- [ ] Exact atomic authority/ref/run/source/signer and all subjects verify.
- [ ] The sole release tag targets the atomic merge; immutable GitHub Release
  files and OCI version tag equal the qualified subjects after round trip.
- [ ] Recovery bundle reconstructs the exact publication generation and every
  resumable state is closed.
- [ ] Adapter exposure creates no provider tier; Codex/provider support remains
  pending until its exact external manifest verifies.
- [ ] Detached `HEAD`, `origin/main`, and Plan 043 PR merge commit still equal
  `<atomic-merge-sha>`; worktree is clean.
- [ ] No tracked edit, commit, branch, other Git ref, PR, later version, or later
  software release was created.

## STOP conditions

Stop on attached/dirty checkout, atomic main/PR drift, missing Plan 030 state,
absent authorization/auth/TTY/read boundary, ambiguous workflow run, lifecycle/
hostile failure, provenance/signer/subject drift, rebuild need, tag/OCI digest
change, authority-envelope drift/redaction, disabled immutability, nonrecoverable
publication state, provider tier without external evidence, tracked/Git scope
mutation, or need for another version/release. Before the first publication
mutation emit `BLOCKED(reason=RELEASE_AUTHORIZATION_ABSENT)`; after a partial
mutation report the exact tag/Release/OCI state and resume only its enumerated
recovery path. Never open a second implementation PR or mint a replacement
version.

## Maintenance notes

Plans 028 and 039 publish target-native Codex records; Plan 040 fans them into
the external Codex release closure consumed by Plan 019. Later provider evidence
and Plan 023 may publish a separate support manifest for adapters already in
this software release. None may edit Git, bump the version, move the tag, replace
assets, or publish another software release for this implementation attempt.
