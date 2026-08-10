# Plan 023: Publish provider-matrix qualification evidence

> **Executor instructions**: In one attended session, qualify the provider
> matrix against Plan 018's already-published software release, Plan 019's
> policy OCI, and Plan 021's proof OCI; then dispatch protected
> `publish-goal-evidence.yml` exactly once to publish one attested
> provider-qualification OCI. Do not bump a version, build, rebuild, tag,
> create/edit a GitHub Release, or write the repository.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 021 publishes proof-closed evidence, all
  exact prior subjects verify, every required provider can run attended, and
  protected publication approval is present
- **Effort**: M; one attended session, one qualification generation, one
  workflow attempt
- **Risk**: HIGH
- **Depends on**: plan 021
- **Covers**: G06, G08, G14, G15
- **Guardrails**: N03-N08, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-06, F4-16,
  F4-22, F4-24, F4-27, F4-28, F4-37, F4-41-F4-44, F4-50
- **Planned at**: design baseline `1e809bd`; release/policy/proof identities
  resolved live

## Atomic delivery invariant

All tracked provider adapters, conformance code, matrix declarations, protected
publisher code, workflows, validators, tests, and docs SHALL already be in the
single implementation branch and single merged PR at `<atomic-merge-sha>`.
This plan is evidence-only. It may create task-local temporary files, one
Actions run, and one digest-addressed OCI subject. It SHALL create no tracked
file, commit, branch, tag/Git ref, PR, merge, release, or follow-up
implementation PR.

## Why this matters

Plan 018 already published the software. Rebuilding or cutting another release
would qualify different bytes and violate atomic delivery. Provider claims must
instead bind fresh attended execution of those exact installed release subjects
to the exact Plan 019 policy and Plan 021 proof. Protected publication makes
that canonical record durable and attestable without changing software,
version, Git, or release state.

The protected workflow attests validation, authority, and publication of the
record. Interactive provider-origin fields remain honestly
`operator_attested`; workflow provenance does not claim it independently drove
the operator's native TTY.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_ATOMIC_MERGE_PR='<atomic-merge-pr-number>'
TAILROCKS_ATOMIC_MERGE_PR_URL='<atomic-merge-pr-url>'
TAILROCKS_ATOMIC_BRANCH='<single-implementation-branch>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SHA="$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git ls-remote --refs origin refs/heads/main | cut -f1)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test -z "$(rtk git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
TAILROCKS_MERGE_PR_ROW="$(gh pr view "$TAILROCKS_ATOMIC_MERGE_PR" \
  --json state,isDraft,baseRefName,headRefName,mergeCommit,url \
  --jq '[.state,.isDraft,.baseRefName,.headRefName,.mergeCommit.oid,.url] | @tsv')"
test "$TAILROCKS_MERGE_PR_ROW" = "$(printf 'MERGED\tfalse\tmain\t%s\t%s\t%s' \
  "$TAILROCKS_ATOMIC_BRANCH" "$TAILROCKS_ATOMIC_MERGE_SHA" "$TAILROCKS_ATOMIC_MERGE_PR_URL")"
test "$(gh pr view "$TAILROCKS_ATOMIC_MERGE_PR" --json mergedAt --jq '.mergedAt != null')" = 'true'

TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_VERSION='<plan-018-version>'
TAILROCKS_RELEASE_SHA='<plan-018-authority-sha>'
TAILROCKS_RELEASE_MANIFEST_DIGEST='<plan-018-release-manifest-sha256-hex>'
TAILROCKS_RELEASE_OCI_INDEX_DIGEST='sha256:<plan-018-index-digest>'
TAILROCKS_RELEASE_OCI_AMD64_DIGEST='sha256:<plan-018-amd64-digest>'
TAILROCKS_RELEASE_OCI_ARM64_DIGEST='sha256:<plan-018-arm64-digest>'
test "$TAILROCKS_RELEASE_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git ls-remote --refs origin "refs/tags/$TAILROCKS_RELEASE_TAG" | cut -f1)" = "$TAILROCKS_RELEASE_SHA"
test "$(gh release view "$TAILROCKS_RELEASE_TAG" --json isDraft,tagName --jq '[.isDraft,.tagName] | @tsv')" = \
  "$(printf 'false\t%s' "$TAILROCKS_RELEASE_TAG")"
gh release verify "$TAILROCKS_RELEASE_TAG"

TAILROCKS_POLICY_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-verifier-policy@sha256:<plan-019-policy-digest>'
TAILROCKS_POLICY_AUTHORITY_SHA='<plan-019-authority-sha>'
TAILROCKS_RELEASE_CLOSURE_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-codex-release-closure@sha256:<plan-040-release-closure-digest>'
TAILROCKS_RELEASE_CLOSURE_AUTHORITY_SHA='<plan-040-authority-sha>'
TAILROCKS_PROTECTED_EVIDENCE_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-protected-evidence@sha256:<plan-021-protected-evidence-digest>'
TAILROCKS_PROOF_AUTHORITY_SHA='<plan-021-authority-sha>'
TAILROCKS_CANDIDATE_BUNDLE_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-candidate-bundles@sha256:<plan-024-candidate-bundle-digest>'
TAILROCKS_CANDIDATE_SHA='<plan-021-synthetic-candidate-sha>'
test "$TAILROCKS_POLICY_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$TAILROCKS_RELEASE_CLOSURE_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$TAILROCKS_PROOF_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"

TAILROCKS_023_TMP="$(mktemp -d /tmp/tailrocks-provider-qualification.XXXXXX)"
TAILROCKS_RELEASE_DIR="$TAILROCKS_023_TMP/release"
mkdir -m 700 "$TAILROCKS_RELEASE_DIR"
gh release download "$TAILROCKS_RELEASE_TAG" \
  --pattern release-recovery-v1.json \
  --pattern release-manifest.json \
  --pattern dispatch-context.json \
  --pattern codex-qualification.json \
  --pattern qualification-manifest.json \
  --pattern native-boundary-v1.json \
  --pattern release-notes.md \
  --pattern tailrocks-aarch64-apple-darwin \
  --pattern tailrocks-x86_64-unknown-linux-musl \
  --pattern tailrocks-native-client-broker-aarch64-apple-darwin \
  --pattern tailrocks-native-client-broker-x86_64-unknown-linux-musl \
  --dir "$TAILROCKS_RELEASE_DIR"
for TAILROCKS_RELEASE_ASSET in \
  "$TAILROCKS_RELEASE_DIR/release-recovery-v1.json" \
  "$TAILROCKS_RELEASE_DIR/release-manifest.json" \
  "$TAILROCKS_RELEASE_DIR/dispatch-context.json" \
  "$TAILROCKS_RELEASE_DIR/codex-qualification.json" \
  "$TAILROCKS_RELEASE_DIR/qualification-manifest.json" \
  "$TAILROCKS_RELEASE_DIR/native-boundary-v1.json" \
  "$TAILROCKS_RELEASE_DIR/release-notes.md" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-aarch64-apple-darwin" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-x86_64-unknown-linux-musl" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-aarch64-apple-darwin" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
do
  gh release verify-asset "$TAILROCKS_RELEASE_TAG" "$TAILROCKS_RELEASE_ASSET"
done
test "$(rtk bun scripts/release-version.ts file-sha256 \
  --input "$TAILROCKS_RELEASE_DIR/release-manifest.json")" = \
  "$TAILROCKS_RELEASE_MANIFEST_DIGEST"
rtk bun scripts/verify-release-artifacts.ts \
  --manifest "$TAILROCKS_RELEASE_DIR/release-manifest.json" \
  --require-source "$TAILROCKS_RELEASE_SHA" \
  --require-version "$TAILROCKS_VERSION"
rtk bun scripts/verify-oci-artifacts.ts \
  --manifest "$TAILROCKS_RELEASE_DIR/release-manifest.json" \
  --require-source "$TAILROCKS_RELEASE_SHA" \
  --require-index "$TAILROCKS_RELEASE_OCI_INDEX_DIGEST" \
  --require-child "linux/amd64=$TAILROCKS_RELEASE_OCI_AMD64_DIGEST" \
  --require-child "linux/arm64=$TAILROCKS_RELEASE_OCI_ARM64_DIGEST"
for TAILROCKS_RELEASE_BINARY in \
  "$TAILROCKS_RELEASE_DIR/tailrocks-aarch64-apple-darwin" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-x86_64-unknown-linux-musl" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-aarch64-apple-darwin" \
  "$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
do
  gh attestation verify "$TAILROCKS_RELEASE_BINARY" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_RELEASE_SHA" \
    --signer-digest "$TAILROCKS_RELEASE_SHA" \
    --deny-self-hosted-runners
done
for TAILROCKS_RELEASE_OCI_DIGEST in \
  "$TAILROCKS_RELEASE_OCI_INDEX_DIGEST" \
  "$TAILROCKS_RELEASE_OCI_AMD64_DIGEST" \
  "$TAILROCKS_RELEASE_OCI_ARM64_DIGEST"
do
  gh attestation verify \
    "oci://ghcr.io/tailrocks/tailrocks-verifier@$TAILROCKS_RELEASE_OCI_DIGEST" \
    --repo tailrocks/tailrocks-skills \
    --signer-workflow tailrocks/tailrocks-skills/.github/workflows/release-artifacts.yml \
    --source-ref "$TAILROCKS_AUTHORITY_REF" \
    --source-digest "$TAILROCKS_RELEASE_SHA" \
    --signer-digest "$TAILROCKS_RELEASE_SHA" \
    --deny-self-hosted-runners
done

TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_023_TMP/ghcr-auth"
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
tailrocks_cleanup_023_auth() {
  (
    set +e
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  )
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_023_auth EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
set +x
test -n "$TAILROCKS_GHCR_USER"
test -n "$TAILROCKS_GHCR_READ_TOKEN"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | \
  DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_RELEASE_CLOSURE_OCI_REF" \
  --purpose codex_fanin \
  --schema codex-release-closure-v1 \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_RELEASE_CLOSURE_AUTHORITY_SHA" \
  --repull \
  --output-dir "$TAILROCKS_023_TMP/release-closure"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/verify-protected-policy.ts \
  --oci-ref "$TAILROCKS_POLICY_OCI_REF" \
  --output "$TAILROCKS_023_TMP/policy.json"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/verify-protected-evidence.ts \
  --oci-ref "$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --candidate "$TAILROCKS_CANDIDATE_SHA" \
  --candidate-bundle "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --policy "$TAILROCKS_POLICY_OCI_REF" \
  --require-origin-label synthetic_candidate_fixture \
  --deny-real-pr-acquisition-claim \
  --require-proof-closed \
  --repull
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_POLICY_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/bootstrap-protected-verifier.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_PROOF_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_PROOF_AUTHORITY_SHA" \
  --deny-self-hosted-runners
tailrocks_cleanup_023_auth
trap - EXIT INT TERM
unset TAILROCKS_GHCR_AUTH_CONFIG
rtk bun scripts/verify-oci-artifacts.ts require-child-env-clean
```

Expected: atomic merge and sole PR read back exactly; checkout is detached and
clean; Plan 018 release is already published and immutable; downloaded software
manifest and OCI index/children match recorded digests; Plan 040 release
closure, Plan 019 policy, and Plan 021 proof repull and attest exactly. No
version/release/build/Git mutation occurs.

## Spec contract

### Requirement G06/G08/G14/G15: qualification of already-released subjects

One attended qualification generation SHALL exercise every advertised provider
against the exact installed Plan 018 binaries and OCI subjects. Canonical
`provider-qualification-v1` SHALL bind release tag/SHA/file/index/children,
Plan 040's exact Plan 018 release closure, provider version/origin/config/
isolation/tier/lifecycle/receipts, the canonical `native-boundary-v1` object and
SHA-256 revalidated under the UID lease, Plan 019 policy, and Plan 021 proof. Protected
`publish-goal-evidence.yml` SHALL validate that closed record and publish it
exactly as:

```text
oci://ghcr.io/tailrocks/tailrocks-provider-qualification@sha256:<digest>
```

The direct attestation SHALL pin `refs/heads/main` and the atomic merge SHA as
both source and signer. No software artifact is built, rebuilt, promoted, or
retagged.

#### Scenario: release/policy/proof drift

- **WHEN** any release asset, OCI child, policy, proof, schema, verifier profile,
  oracle policy, provider origin, or support row differs
- **THEN** qualification or protected publication fails; no weaker or rebuilt
  substitute is allowed.

#### Scenario: native provider origin

- **WHEN** protected workflow validates submitted attended evidence
- **THEN** publication provenance is protected, while native TTY origin remains
  explicitly `operator_attested` and never becomes workflow-observed.

## Must NOT

- **N03-N05/N17**: provider or repository data cannot choose controller argv;
  candidate proof cannot become a host gate; autonomous tiers require their
  documented host-read boundary.
- **N06/N07**: provider/candidate processes receive no GitHub, release, GHCR, or
  publication credential.
- **N08/N12/N13**: transcript, prior PASS, digest alone, moving tag, or averaged
  rows cannot replace exact installed subjects and current receipts.
- **N11**: no version bump, build/rebuild, tag/Git ref, GitHub Release
  create/edit, OCI software promotion, tracked write, commit, branch, PR, merge,
  policy, proof, docs, or environment mutation. Only the authorized
  provider-qualification OCI may publish.
- **N16**: providers, runs, tools, outputs, evidence bytes, workflow input,
  API calls, and one attempt are bounded.
- **N18**: comparisons are integrity-only with cumulative caps and no secret
  oracle/confidentiality claim.
- **N19**: Plan 043's one branch/PR/merge is the only tracked delivery;
  qualification/publication cannot create a later implementation, evidence, or
  documentation PR.

## Inputs to provide

- Exact atomic merge SHA/branch/PR readback.
- Exact Plan 018 published tag/version/source SHA, release manifest/file
  digests, qualification manifest, OCI index, and both child digests.
- Exact Plan 040 release-closure, Plan 019 policy, and Plan 021 proof OCI refs,
  authority SHAs, manifests, and receipts; exact Plan 024 candidate-bundle
  digest and synthetic candidate SHA carried by the proof.
- Interactive authenticated native TTY in a task-only home under the distinct
  unprivileged `tailrocks-native-client` principal for each advertised provider.
  Missing isolation/capability blocks publication rather than inflating or
  averaging a row.
- Exact directly attested released Plan-045 broker digest, reviewed rendered
  account-policy digest, and attended host-admin
  authority for its rendered create-if-absent/verify-equal boundary.
- Protected-environment approval and process-only read auth. Publication
  authority exists only inside `publish-goal-evidence.yml`.
- Plan-022-pinned signer ID and controller-owned mode-0600 signing key; the
  native principal cannot read it, controller home/process environment,
  Git/GH credentials, Docker, or agent sockets.

## Starting state

- One atomic merge contains all provider and protected-publisher implementation.
- Plan 018 already published the immutable software release at that source SHA.
- Plan 040 published the exact two-native-target Plan 018 release closure.
- Plan 019 published the released-verifier policy OCI.
- Plan 021 published proof-closed synthetic-candidate evidence OCI.
- No provider-qualification OCI for this exact tuple exists.

## Commands you will need

Local qualification writes only under the task temp directory:

```sh
TAILROCKS_PROVIDER_EVIDENCE="$TAILROCKS_023_TMP/provider-qualification.json"
TAILROCKS_PROVIDER_SUBMISSION="$TAILROCKS_023_TMP/provider-qualification-submission.json"
case "$(uname -s):$(uname -m)" in
  Darwin:arm64) TAILROCKS_NATIVE_BROKER="$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-aarch64-apple-darwin" ;;
  Linux:x86_64) TAILROCKS_NATIVE_BROKER="$TAILROCKS_RELEASE_DIR/tailrocks-native-client-broker-x86_64-unknown-linux-musl" ;;
  *) exit 1 ;;
esac
TAILROCKS_NATIVE_BROKER_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_NATIVE_BROKER")"
TAILROCKS_BOUNDARY_PLAN_DIR="$TAILROCKS_023_TMP/native-boundary-plan"
rtk bun scripts/install-native-client-boundary.ts render \
  --platform "$(uname -s | tr '[:upper:]' '[:lower:]')" \
  --principal tailrocks-native-client --controller-user "$(id -un)" \
  --broker "$TAILROCKS_NATIVE_BROKER" --output-dir "$TAILROCKS_BOUNDARY_PLAN_DIR"
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
  --output "$TAILROCKS_023_TMP/native-boundary-install.json"
unset TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST
TAILROCKS_NATIVE_BOUNDARY_RECEIPT="$TAILROCKS_023_TMP/native-boundary-v1.json"
rtk bun scripts/install-native-client-boundary.ts verify-live \
  --principal tailrocks-native-client \
  --broker-digest "$TAILROCKS_NATIVE_BROKER_DIGEST" \
  --policy-digest "$TAILROCKS_NATIVE_POLICY_DIGEST" \
  --output "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT"
test ! -e "$TAILROCKS_023_TMP/native-provider-runs"
rtk bun scripts/provider-conformance.ts run-release \
  --client-principal tailrocks-native-client \
  --client-task-root "$TAILROCKS_023_TMP/native-provider-runs" \
  --controller-signing-key "$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --provider-matrix research/native-goal-control/support-matrix.json \
  --release-manifest "$TAILROCKS_RELEASE_DIR/release-manifest.json" \
  --policy-oci-ref "$TAILROCKS_POLICY_OCI_REF" \
  --protected-evidence-oci-ref "$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --require-existing-release \
  --output "$TAILROCKS_PROVIDER_EVIDENCE"
rtk bun scripts/native-client-sandbox.ts assert-quiescent \
  --principal tailrocks-native-client
test ! -e "$TAILROCKS_023_TMP/native-provider-runs"
rtk bun scripts/provider-conformance.ts validate-release \
  "$TAILROCKS_PROVIDER_EVIDENCE"
rtk bun scripts/provider-conformance.ts seal-publication \
  --schema provider-qualification-v1 \
  --evidence "$TAILROCKS_PROVIDER_EVIDENCE" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --release-manifest "$TAILROCKS_RELEASE_DIR/release-manifest.json" \
  --release-closure-oci-ref "$TAILROCKS_RELEASE_CLOSURE_OCI_REF" \
  --policy-oci-ref "$TAILROCKS_POLICY_OCI_REF" \
  --protected-evidence-oci-ref "$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --output "$TAILROCKS_PROVIDER_SUBMISSION"
TAILROCKS_PROVIDER_SUBMISSION_DIGEST="$(rtk bun scripts/release-version.ts \
  file-sha256 --input "$TAILROCKS_PROVIDER_SUBMISSION")"
test "$(wc -c < "$TAILROCKS_PROVIDER_SUBMISSION" | tr -d ' ')" -le 32768
TAILROCKS_PROVIDER_SUBMISSION_B64="$(base64 < "$TAILROCKS_PROVIDER_SUBMISSION" | tr -d '\n')"
test "${#TAILROCKS_PROVIDER_SUBMISSION_B64}" -le 43692
```

Protected publication uses the bounded observation-input surface implemented
in the atomic merge. The dispatch helper supplies the exact authority SHA and
a fresh request nonce; the workflow receives only those fields plus purpose,
mapped schema, exact release-closure/policy/protected-evidence OCI refs,
canonical evidence SHA-256, and canonical base64 evidence:

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow publish-goal-evidence.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_AUTHORITY_SHA" \
  --input 'purpose=provider_qualification' \
  --input 'schema=provider-qualification-v1' \
  --input "release_closure_oci_ref=$TAILROCKS_RELEASE_CLOSURE_OCI_REF" \
  --input "policy_oci_ref=$TAILROCKS_POLICY_OCI_REF" \
  --input "protected_evidence_oci_ref=$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --input "operator_evidence_sha256=$TAILROCKS_PROVIDER_SUBMISSION_DIGEST" \
  --input "operator_evidence_b64=$TAILROCKS_PROVIDER_SUBMISSION_B64" \
  --out "$TAILROCKS_023_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_023_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_023_TMP/dispatch.json" \
  --artifact provider_qualification-evidence-operation \
  --dir "$TAILROCKS_023_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_023_TMP/dispatch.json" \
  --manifest "$TAILROCKS_023_TMP/artifacts/dispatch-context.json" \
  --require-run-attempt 1
```

Expected: one `provider_qualification` run, attempt 1, exact
`provider-qualification-v1` input digest and prior immutable refs, protected
hosted runner, atomic source/signer SHA, and literal
`provider_qualification-evidence-operation`. No retry, rebuild, release
workflow, or publication state machine exists here.

## Scope

**In scope**: readback and verification of Plan 018 release subjects; attended
installed provider qualification; compatibility with Plan 019 policy and Plan
021 proof; protected validation and one digest-addressed provider-qualification
OCI publication.

**Out of scope**: source/docs/version edits; build/rebuild; release candidate,
tag, GitHub Release, release asset, or software OCI mutation; policy/proof
mutation; native post-release fan-in; PR data.

## Git workflow

None. Checkout remains detached and clean. This plan runs no `git fetch`,
`checkout`, `switch`, `commit`, `tag`, `push`, PR mutation, or repository-writing
command. Plan 018's existing tag and Release are read-only inputs.

## Steps

### Step 1: Reverify the exact atomic authority and prior subjects

Run Preconditions. Verify exact merge PR, detached HEAD/main equality, Plan 018
release and attestations, Plan 019 policy, and Plan 021 proof. Verify both
release binaries and OCI index/children against direct Plan 018 signer/source
claims. Install, remove, reinstall, and repull only those downloaded/digest
subjects; never invoke a build.

**Verify**: every recorded file/index/child/policy/proof digest and attestation
matches; anonymous software OCI digest pull succeeds where Plan 018 promises
public visibility; no moving alias is an attestation subject; repository status
remains empty; release tag/body/assets and remote main remain unchanged.

### Step 2: Create one canonical attended qualification generation

Run local qualification Commands once as a controller fan-in. Exercise every advertised provider's
install/origin/config/isolation, CONTINUE/NEXT/BLOCKED/PASS, resume/budget,
stale receipt, false nominal completion, host-read/capability/egress, and exact
kernel decision/receipt. Each provider runs under a separate UID-lease
generation and fresh provider-only task home; credential deletion, UID reap/
quiescence, and home/ACL removal must finish before the next provider. TIER
0/INCONCLUSIVE starts no adapter and cannot support a stronger documented row.
Sanitize and aggregate only per-provider output before sealing. Remove registry
auth before any provider child; provider-specific authentication stays outside
the evidence and publication envelope.

**Verify**: `validate-release` and `seal-publication` pass; every advertised row
has current exact evidence and no averaged result; release/closure/policy/
proof/schema/verifier-profile/oracle-policy identities match; submission is
canonical, bounded, credential-free, and `operator_attested` only where
appropriate.
Repository status and Plan 018 release state remain unchanged.

### Step 3: Publish and independently verify protected qualification OCI

Run protected publication Commands exactly once. Workflow checks canonical
input bytes/digest, independently repulls and verifies Plan 018/040/019/021
subjects, validates support claims, then publishes only after all gates. The
artifact contains exactly `dispatch-context.json`, `evidence.json`, and
`evidence-manifest.json`.

`evidence-manifest.json` is a derived operation receipt and is excluded from
the OCI subject; otherwise its embedded output digest would create a circular
self-hash. The OCI subject contains canonical `evidence.json` plus the fixed
media type and purpose/schema/authority/payload-digest annotations and the exact
signed request-nonce/workflow-path/run-ID/run-attempt tuple required by Plan
044. Only wall-clock time and the derived manifest remain outside subject bytes.

```sh
TAILROCKS_PUBLISHED_EVIDENCE="$TAILROCKS_023_TMP/artifacts/evidence.json"
TAILROCKS_PUBLISHED_MANIFEST="$TAILROCKS_023_TMP/artifacts/evidence-manifest.json"
TAILROCKS_PROVIDER_OCI_DIGEST="$(jq -er .oci_digest "$TAILROCKS_PUBLISHED_MANIFEST")"
TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_PUBLISHED_MANIFEST")"
test "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" = \
  "oci://ghcr.io/tailrocks/tailrocks-provider-qualification@$TAILROCKS_PROVIDER_OCI_DIGEST"
case "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" in
  oci://ghcr.io/tailrocks/tailrocks-provider-qualification@sha256:*) ;;
  *) exit 1 ;;
esac
rtk bun scripts/protected-workflow.ts verify-evidence-publication \
  --operation-dir "$TAILROCKS_023_TMP/artifacts" \
  --purpose provider_qualification \
  --schema provider-qualification-v1 \
  --input-sha256 "$TAILROCKS_PROVIDER_SUBMISSION_DIGEST" \
  --input-oci-ref "$TAILROCKS_RELEASE_CLOSURE_OCI_REF" \
  --input-oci-ref "$TAILROCKS_POLICY_OCI_REF" \
  --input-oci-ref "$TAILROCKS_PROTECTED_EVIDENCE_OCI_REF" \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA"
cmp "$TAILROCKS_PROVIDER_SUBMISSION" "$TAILROCKS_PUBLISHED_EVIDENCE"
rtk bun scripts/provider-conformance.ts validate-release \
  "$TAILROCKS_PUBLISHED_EVIDENCE"
gh attestation verify "$TAILROCKS_PUBLISHED_EVIDENCE" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/publish-goal-evidence.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_023_TMP/ghcr-post-auth"
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
trap tailrocks_cleanup_023_auth EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
set +x
test -n "$TAILROCKS_GHCR_READ_TOKEN"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | \
  DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/publish-goal-evidence.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" \
  --purpose provider_qualification \
  --schema provider-qualification-v1 \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_023_TMP/verified-oci"
cmp "$TAILROCKS_PROVIDER_SUBMISSION" "$TAILROCKS_023_TMP/verified-oci/evidence.json"
rtk bun scripts/provider-conformance.ts validate-release \
  "$TAILROCKS_023_TMP/verified-oci/evidence.json"
tailrocks_cleanup_023_auth
trap - EXIT INT TERM
```

Record exact
`oci://ghcr.io/tailrocks/tailrocks-provider-qualification@sha256:<digest>`,
manifest digest, dispatch run/attempt, and all bound prior digests. Actions
artifact is transfer only.

**Verify**: local operation and two OCI digest pulls match exactly; file and OCI
attestations pin `publish-goal-evidence.yml`, protected main, atomic source and
signer SHA, and hosted runner; provider rows revalidate. Final checks prove
HEAD/main/merge PR, Plan 018 tag/Release/assets, versions, and repository status
unchanged. No build, tag, release edit, Git ref, or PR occurred.

## Test plan

- Atomic merge PR/SHA and detached clean authority.
- Plan 018 file/index/children release identity and installed lifecycle.
- Plan 040 release closure, Plan 019 policy, and Plan 021 proof digest/
  provenance/semantic compatibility.
- Every advertised provider's current origin/config/isolation/tier/receipt.
- Canonical bounded credential-free `provider-qualification-v1`.
- One protected publication attempt; exact artifact/schema/purpose/input refs.
- File/OCI direct attestations, digest repull, and full record revalidation.
- Zero version/build/tag/release/repository/Git-ref/PR mutation.

## Done criteria

- [ ] Exact Plan 018 released software/Plan 040 closure, Plan 019 policy, and
  Plan 021 proof bind.
- [ ] Every advertised provider row reproduces on installed released subjects.
- [ ] Exactly one protected workflow attempt publishes canonical qualification.
- [ ] Provider-qualification OCI is digest-addressed, proof-compatible, and
  directly attested by `publish-goal-evidence.yml`.
- [ ] Plan 018 version/tag/Release/software bytes remain unchanged.
- [ ] Checkout remains detached/clean; no tracked/Git/PR mutation occurred.

## STOP conditions

Stop on atomic PR/SHA mismatch, attached/dirty checkout, release/policy/proof
drift, missing native TTY/isolation, provider regression, auth leak,
noncanonical/oversized evidence, second qualification generation, second
dispatch/rerun, workflow/provenance mismatch, rebuild/version/tag/release
request, tracked/Git-ref/PR mutation, false confidentiality, or work beyond the
one attended session. No corrective implementation branch or PR is allowed.

## Maintenance notes

Plans 029/041 consume
`<plan-023-provider-qualification-oci-ref>` plus the unchanged Plan 018 tag.
Plan 042 alone may publish the later provider-support closure. None may rebuild
or relabel this qualification OCI.
