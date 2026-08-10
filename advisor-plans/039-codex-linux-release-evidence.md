# Plan 039: Publish Linux x86_64 Codex release evidence

> **Executor instructions**: In one attended Linux x86_64 session, verify the
> exact plan-018 release, create one bounded canonical operator-attested record,
> and submit it to the protected default-branch evidence publisher. Change no
> tracked file, commit, branch, tag, ref, pull request, or release.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until the one atomic implementation PR is merged, plan
  018 has a complete immutable release, and protected-environment approval is
  available
- **Effort**: S; one attended native session
- **Risk**: HIGH
- **Depends on**: plan 018
- **Covers**: G06, G14, G15
- **Guardrails**: N06, N07, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-16, F4-17,
  F4-28, F4-42, F4-50
- **Planned at**: design baseline `1e809bd`; merge/release identities resolved live

## Why this matters

The Linux binary and OCI amd64 child require evidence created on a physical
native Linux x86_64 host. The observation remains `operator_attested`; protected
main validates and publishes an exact, directly attested, digest-addressed OCI
record without writing the repository after its atomic merge.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<atomic-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_VERIFY_TMP="$(mktemp -d /tmp/tailrocks-codex-linux.XXXXXX)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
test "$(uname -s)" = Linux
test "$(uname -m)" = x86_64
gh release verify "$TAILROCKS_RELEASE_TAG"
```

Expected: clean detached checkout at the sole atomic merge, exact merged-PR
readback, unchanged protected main, a physical native Linux x86_64 host, and one
complete immutable plan-018 release.

## Spec contract

### Requirement G06/G14/G15: native evidence without post-merge Git writes

The local `codex-platform-evidence-v1` record SHALL bind atomic merge/PR,
release/tag/manifest/qualification, exact file/index/amd64-child digests,
canonical `native-boundary-v1` object/SHA-256, host/client versions, lifecycle results, exit classes, and actual run date.
Native-host identity and observations remain `operator_attested`.
`publish-goal-evidence.yml` SHALL accept only canonical JSON bytes plus SHA-256,
independently reverify machine-checkable release facts, publish exact evidence to
`tailrocks-codex-platform-evidence`, and directly attest file and OCI subjects
from protected main. Only its `oci://...@sha256` URI is authoritative.
`evidence-manifest.json` is a derived local publication receipt, excluded from
the OCI payload and never treated as the published OCI subject.

#### Scenario: Linux evidence claims an unobserved result

- **WHEN** target/host is emulated, a lifecycle step did not run, or any submitted
  identity/bound differs from protected revalidation
- **THEN** validation fails and no OCI subject is published.

## Must NOT

- **N06/N07**: no credential value enters JSON, CLI child, logs, or artifact.
- **N11**: no tracked write, commit, branch/tag/ref/PR/release edit, or moving OCI
  alias; only exact evidence OCI publication is authorized.
- **N13**: evidence claims only observed native Linux x86_64 facts.
- **N16**: files, commands, output, JSON, dispatch input, time, and processes are
  bounded; unknown/oversized data fails.
- **N19**: this external operation creates no tracked edit, commit, branch,
  tag/ref, PR, release, or later implementation attempt.

## Inputs to provide

- Exact atomic PR/merge SHA and plan-018 tag/qualification identities.
- Native Linux x86_64 host and current Codex authentication in the task-only
  home of the distinct `tailrocks-native-client` principal.
- Exact directly attested released Plan-045 broker digest, reviewed rendered
  account-policy digest, and attended host-admin
  authority for create-if-absent/verify-equal installation on this host.
- Protected-environment approval and process-only GHCR read authentication for
  final OCI verification.
- Plan-022-pinned signer ID and controller-owned mode-0600 authority signing
  key; the native principal cannot read it, controller home/process environment,
  Git/GH credentials, Docker, or agent sockets.

## Starting state

- The atomic merge already contains `publish-goal-evidence.yml`, its closed
  purpose/schema validator, publication verifier, and static generic docs.
- Plan 018 published immutable release subjects from the same merge.
- No repository evidence path is an output of this operation.

## Commands you will need

```sh
gh release download "$TAILROCKS_RELEASE_TAG" --dir "$TAILROCKS_VERIFY_TMP/release"
rtk bun scripts/verify-release-artifacts.ts \
  --release-dir "$TAILROCKS_VERIFY_TMP/release" \
  --require-tag "$TAILROCKS_RELEASE_TAG"
TAILROCKS_NATIVE_BROKER="$TAILROCKS_VERIFY_TMP/release/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
TAILROCKS_NATIVE_BROKER_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_NATIVE_BROKER")"
TAILROCKS_BOUNDARY_PLAN_DIR="$TAILROCKS_VERIFY_TMP/native-boundary-plan"
rtk bun scripts/install-native-client-boundary.ts render \
  --platform linux --principal tailrocks-native-client \
  --controller-user "$(id -un)" --broker "$TAILROCKS_NATIVE_BROKER" \
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
  --output "$TAILROCKS_VERIFY_TMP/native-boundary-install.json"
unset TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST
TAILROCKS_NATIVE_BOUNDARY_RECEIPT="$TAILROCKS_VERIFY_TMP/native-boundary-v1.json"
rtk bun scripts/install-native-client-boundary.ts verify-live \
  --principal tailrocks-native-client \
  --broker-digest "$TAILROCKS_NATIVE_BROKER_DIGEST" \
  --policy-digest "$TAILROCKS_NATIVE_POLICY_DIGEST" \
  --output "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT"
test ! -e "$TAILROCKS_VERIFY_TMP/native-codex-home"
rtk bun scripts/verify-release-artifacts.ts run-platform-evidence \
  --client-principal tailrocks-native-client \
  --client-task-home "$TAILROCKS_VERIFY_TMP/native-codex-home" \
  --controller-signing-key "$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --target x86_64-unknown-linux-musl \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --release-dir "$TAILROCKS_VERIFY_TMP/release" \
  --output "$TAILROCKS_VERIFY_TMP/operator-evidence.json"
rtk bun scripts/native-client-sandbox.ts assert-quiescent \
  --principal tailrocks-native-client
test ! -e "$TAILROCKS_VERIFY_TMP/native-codex-home"
rtk bun scripts/verify-release-artifacts.ts validate-platform-evidence \
  --target x86_64-unknown-linux-musl \
  "$TAILROCKS_VERIFY_TMP/operator-evidence.json"
TAILROCKS_EVIDENCE_SHA256="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_VERIFY_TMP/operator-evidence.json")"
test "$(wc -c < "$TAILROCKS_VERIFY_TMP/operator-evidence.json" | tr -d ' ')" -le 32768
TAILROCKS_EVIDENCE_B64="$(base64 < "$TAILROCKS_VERIFY_TMP/operator-evidence.json" | tr -d '\n')"
test "${#TAILROCKS_EVIDENCE_B64}" -le 43692
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow publish-goal-evidence.yml \
  --dispatch-branch main \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input 'purpose=codex_platform' \
  --input 'schema=codex-platform-evidence-v1' \
  --input 'target=x86_64-unknown-linux-musl' \
  --input "release_tag=$TAILROCKS_RELEASE_TAG" \
  --input "operator_evidence_sha256=$TAILROCKS_EVIDENCE_SHA256" \
  --input "operator_evidence_b64=$TAILROCKS_EVIDENCE_B64" \
  --out "$TAILROCKS_VERIFY_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch --dispatch "$TAILROCKS_VERIFY_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_VERIFY_TMP/dispatch.json" \
  --artifact codex_platform-evidence-operation \
  --dir "$TAILROCKS_VERIFY_TMP/publication"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_VERIFY_TMP/dispatch.json" \
  --manifest "$TAILROCKS_VERIFY_TMP/publication/dispatch-context.json"
rtk bun scripts/protected-workflow.ts verify-evidence-publication \
  --operation-dir "$TAILROCKS_VERIFY_TMP/publication" \
  --purpose codex_platform \
  --schema codex-platform-evidence-v1 \
  --input-sha256 "$TAILROCKS_EVIDENCE_SHA256" \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA"
cmp "$TAILROCKS_VERIFY_TMP/operator-evidence.json" "$TAILROCKS_VERIFY_TMP/publication/evidence.json"
rtk bun scripts/verify-release-artifacts.ts validate-platform-evidence \
  --target x86_64-unknown-linux-musl \
  "$TAILROCKS_VERIFY_TMP/publication/evidence.json"
gh attestation verify "$TAILROCKS_VERIFY_TMP/publication/evidence.json" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/publish-goal-evidence.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
TAILROCKS_OUTPUT_OCI_DIGEST="$(jq -er .oci_digest "$TAILROCKS_VERIFY_TMP/publication/evidence-manifest.json")"
TAILROCKS_OUTPUT_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_VERIFY_TMP/publication/evidence-manifest.json")"
test "$TAILROCKS_OUTPUT_OCI_REF" = "oci://ghcr.io/tailrocks/tailrocks-codex-platform-evidence@$TAILROCKS_OUTPUT_OCI_DIGEST"
case "$TAILROCKS_OUTPUT_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-codex-platform-evidence@sha256:*) ;; *) exit 1 ;; esac
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_VERIFY_TMP/ghcr-auth"
tailrocks_cleanup_codex_linux_auth() {
  set +e
  if test -n "${TAILROCKS_GHCR_AUTH_CONFIG:-}"; then
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_codex_linux_auth EXIT
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" gh attestation verify "$TAILROCKS_OUTPUT_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/publish-goal-evidence.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_OUTPUT_OCI_REF" \
  --purpose codex_platform \
  --schema codex-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_VERIFY_TMP/verified-oci"
cmp "$TAILROCKS_VERIFY_TMP/operator-evidence.json" "$TAILROCKS_VERIFY_TMP/verified-oci/evidence.json"
rtk bun scripts/verify-release-artifacts.ts validate-platform-evidence \
  --target x86_64-unknown-linux-musl \
  "$TAILROCKS_VERIFY_TMP/verified-oci/evidence.json"
tailrocks_cleanup_codex_linux_auth
trap - EXIT
```

Expected: one protected run emits context, canonical evidence, and publication
manifest naming exactly one digest-addressed
`tailrocks-codex-platform-evidence` OCI subject.

## Scope

**In scope**: read-only release verification, bounded native lifecycle,
temporary canonical JSON, protected evidence dispatch, file/OCI verification.

**Out of scope**: every tracked file, commit, branch, tag, ref, PR, release
mutation, docs/date/version change, macOS/provider/policy/candidate work.

## Git workflow

None. Stay detached at the atomic merge. Do not add, commit, push, create/edit a
PR, or create/delete/update any branch, tag, or ref.

## Steps

### Step 1: Verify exact released subjects and run native lifecycle

Verify every immutable release asset and attestation, source/signer SHA, hosted
runner, hashes, OCI index and amd64 child. Run clean install, version/pin,
documented upgrade/rollback when a real predecessor exists, and uninstall. A
first release may record only schema-allowed `not_applicable:first_release`.

**Verify**: wrong/partial release, non-native/emulated host, identity/child
drift, ambient credential inheritance, failed lifecycle, or fabricated upgrade
causes the evidence validator to fail before dispatch.

### Step 2: Submit only canonical operator-attested bytes

Hash, encode, and bound the validated JSON. Protected main requires exact
decode/digest equality, canonical schema, target, release identities, and clean
credential scan before publishing. It preserves the operator trust label and
directly attests both emitted subjects.

**Verify**: changed encoding/digest, wrong schema/target/release/main, unknown
field, oversize, credential-like content, or self-hosted signer yields no
publication.

### Step 3: Verify immutable external closure and frozen Git

Read the exact OCI URI from the verified manifest. Under task-private registry
auth, re-pull by digest and verify canonical evidence plus direct file/OCI
attestations. Remove auth, then re-read main and atomic PR; detached HEAD and
worktree remain unchanged.

**Verify**: `gh attestation verify` pins repository,
`publish-goal-evidence.yml`, `refs/heads/main`, atomic source/signer digest, and
`--deny-self-hosted-runners`; OCI verification uses authenticated task-private
`DOCKER_CONFIG`. Final PR/main/HEAD/status checks equal preflight.

## Test plan

- Canonical/oversized/unknown-field/credential-like submissions.
- Wrong release/source/signer/runner/index/child/target and emulated host.
- First-release versus real-predecessor lifecycle semantics.
- Direct file/OCI attestation and digest-only reference verification.
- Detached HEAD, atomic PR/main readback, and zero Git mutation.

## Done criteria

- [ ] Native Linux x86_64 lifecycle produced one bounded canonical record.
- [ ] Protected main revalidated and directly attested exact file/OCI bytes.
- [ ] Output is one immutable digest-addressed OCI URI; no moving alias exists.
- [ ] Main, atomic PR, detached HEAD, and clean tree remain unchanged.
- [ ] No tracked file, commit, branch/tag/ref/PR/release/docs mutation occurred.

## STOP conditions

Stop on merge/PR/main drift, attached/dirty checkout, non-native host,
incomplete/mutable release, provenance/lifecycle/schema failure, missing
approval/auth, publication/attestation mismatch, moving-only OCI reference,
credential residue, or any need for repository mutation.

## Maintenance notes

Plan 040 consumes only this exact OCI URI and plan 028's independent macOS URI.
Static repository docs remain generic and are never edited here.
