# Plan 041: Publish Linux x86_64 provider evidence

> **Executor instructions**: In one attended Linux x86_64 session, verify the
> exact plan-018 release and plan-023 provider-qualification OCI subject, run
> every applicable provider row, and submit one bounded operator-attested record
> to protected main. Change no tracked file, commit, branch, tag, ref, pull
> request, release, qualification, or static documentation.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until the atomic implementation PR is merged, plans 018
  and 023 are complete, and protected-environment approval is available
- **Effort**: S; one attended native/provider session
- **Risk**: HIGH
- **Depends on**: plan 023
- **Covers**: G06, G14, G15
- **Guardrails**: N01, N06, N07, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-16, F4-17,
  F4-22, F4-28, F4-42, F4-50
- **Planned at**: design baseline `1e809bd`; external identities resolved live

## Why this matters

Linux provider rows must reproduce against the exact released Linux binary and
OCI amd64 child. The physical-host observation remains `operator_attested`;
protected main validates its release/qualification closure and publishes one
directly attested digest-addressed OCI record without a post-merge Git write.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<atomic-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF='<plan-023-provider-qualification-oci-ref>'
TAILROCKS_PROVIDER_VERIFY_TMP="$(mktemp -d /tmp/tailrocks-provider-linux.XXXXXX)"
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
case "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-qualification@sha256:*) ;; *) exit 1 ;; esac
gh release verify "$TAILROCKS_RELEASE_TAG"
```

Expected: clean detached sole merge, exact merged-PR/main readback, native Linux
x86_64, one immutable plan-018 release, and one exact digest-only plan-023
qualification subject.

## Spec contract

### Requirement G06/G14/G15: native provider evidence outside Git

The `provider-platform-evidence-v1` record SHALL bind atomic merge/PR, release/
tag/manifest/index/amd64 child, canonical `native-boundary-v1` object/SHA-256,
provider-qualification OCI digest, its carried
policy/protected-proof identities, exact provider client/version/origin/config/
isolation, independent row verdicts, lifecycle/exit classes, trust labels, and
actual run date. Host/provider observations remain `operator_attested`.
`publish-goal-evidence.yml` SHALL reverify machine-checkable inputs, validate the
submitted bytes/digest, publish to `tailrocks-provider-platform-evidence`, and
directly attest file and OCI subjects from protected main.
`evidence-manifest.json` remains a derived local publication receipt, excluded
from the OCI payload and never treated as the published OCI subject.

#### Scenario: one Linux provider is unavailable or weaker

- **WHEN** auth/TTY/client/isolation is unavailable or current evidence is lower,
  failing, or inconclusive
- **THEN** preserve that exact result; plan 042 cannot emit the stronger row.

## Must NOT

- **N01/N12/N13**: transcript, vote, prose, or another provider cannot override a
  row; claims are exact lower bounds.
- **N06/N07/N17**: registry auth is removed before provider children; provider
  auth never enters evidence; autonomous tiers require recorded isolation.
- **N11**: no Git/release/qualification/docs mutation or moving OCI alias.
- **N16/N18**: tools, output, JSON, time, processes, and integrity-only query
  budget are bounded; no confidentiality claim.
- **N19**: this external operation creates no tracked edit, commit, branch,
  tag/ref, PR, release, or later implementation attempt.

## Inputs to provide

- Exact atomic PR/merge SHA, plan-018 tag, and plan-023 qualification OCI URI.
- Per-provider auth/TTY in the task-only home of the distinct
  `tailrocks-native-client` principal for claimed tiers.
- Exact directly attested released Plan-045 broker digest, reviewed rendered
  account-policy digest, and attended host-admin
  authority for create-if-absent/verify-equal installation on this host.
- Process-only GHCR read auth and protected-environment approval.
- Plan-022-pinned signer ID and controller-owned mode-0600 authority signing
  key; the native principal cannot read it, controller home/process environment,
  Git/GH credentials, Docker, or agent sockets.

## Starting state

- The atomic merge contains adapters/validators, generic static docs,
  `publish-goal-evidence.yml`, and the provider publication interface.
- Plan 023 published qualification metadata for the existing plan-018 release;
  it did not create another software version or tag.
- No platform evidence or support row is written to Git post-merge.

## Commands you will need

```sh
gh release download "$TAILROCKS_RELEASE_TAG" --dir "$TAILROCKS_PROVIDER_VERIFY_TMP/release"
rtk bun scripts/verify-release-artifacts.ts \
  --release-dir "$TAILROCKS_PROVIDER_VERIFY_TMP/release" \
  --require-tag "$TAILROCKS_RELEASE_TAG"
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_PROVIDER_VERIFY_TMP/ghcr-auth"
tailrocks_cleanup_provider_linux_auth() {
  set +e
  if test -n "${TAILROCKS_GHCR_AUTH_CONFIG:-}"; then
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_provider_linux_auth EXIT
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" \
  --purpose provider_qualification \
  --schema provider-qualification-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_PROVIDER_VERIFY_TMP/qualification"
rtk bun scripts/provider-conformance.ts validate-release \
  "$TAILROCKS_PROVIDER_VERIFY_TMP/qualification/evidence.json"
tailrocks_cleanup_provider_linux_auth
trap - EXIT
unset TAILROCKS_GHCR_AUTH_CONFIG
TAILROCKS_NATIVE_BROKER="$TAILROCKS_PROVIDER_VERIFY_TMP/release/tailrocks-native-client-broker-x86_64-unknown-linux-musl"
TAILROCKS_NATIVE_BROKER_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_NATIVE_BROKER")"
TAILROCKS_BOUNDARY_PLAN_DIR="$TAILROCKS_PROVIDER_VERIFY_TMP/native-boundary-plan"
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
  --output "$TAILROCKS_PROVIDER_VERIFY_TMP/native-boundary-install.json"
unset TAILROCKS_APPROVED_BOUNDARY_PLAN_DIGEST
TAILROCKS_NATIVE_BOUNDARY_RECEIPT="$TAILROCKS_PROVIDER_VERIFY_TMP/native-boundary-v1.json"
rtk bun scripts/install-native-client-boundary.ts verify-live \
  --principal tailrocks-native-client \
  --broker-digest "$TAILROCKS_NATIVE_BROKER_DIGEST" \
  --policy-digest "$TAILROCKS_NATIVE_POLICY_DIGEST" \
  --output "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT"
test ! -e "$TAILROCKS_PROVIDER_VERIFY_TMP/native-provider-runs"
rtk bun scripts/provider-conformance.ts run-platform-release \
  --client-principal tailrocks-native-client \
  --client-task-root "$TAILROCKS_PROVIDER_VERIFY_TMP/native-provider-runs" \
  --controller-signing-key "$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  --native-boundary-receipt "$TAILROCKS_NATIVE_BOUNDARY_RECEIPT" \
  --target x86_64-unknown-linux-musl \
  --release-dir "$TAILROCKS_PROVIDER_VERIFY_TMP/release" \
  --qualification "$TAILROCKS_PROVIDER_VERIFY_TMP/qualification/evidence.json" \
  --output "$TAILROCKS_PROVIDER_VERIFY_TMP/operator-evidence.json"
rtk bun scripts/native-client-sandbox.ts assert-quiescent \
  --principal tailrocks-native-client
test ! -e "$TAILROCKS_PROVIDER_VERIFY_TMP/native-provider-runs"
rtk bun scripts/provider-conformance.ts validate-platform-evidence \
  --target x86_64-unknown-linux-musl \
  "$TAILROCKS_PROVIDER_VERIFY_TMP/operator-evidence.json"
TAILROCKS_EVIDENCE_SHA256="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_PROVIDER_VERIFY_TMP/operator-evidence.json")"
test "$(wc -c < "$TAILROCKS_PROVIDER_VERIFY_TMP/operator-evidence.json" | tr -d ' ')" -le 32768
TAILROCKS_EVIDENCE_B64="$(base64 < "$TAILROCKS_PROVIDER_VERIFY_TMP/operator-evidence.json" | tr -d '\n')"
test "${#TAILROCKS_EVIDENCE_B64}" -le 43692
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow publish-goal-evidence.yml \
  --dispatch-branch main \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input 'purpose=provider_platform' \
  --input 'schema=provider-platform-evidence-v1' \
  --input 'target=x86_64-unknown-linux-musl' \
  --input "release_tag=$TAILROCKS_RELEASE_TAG" \
  --input "provider_qualification_oci_ref=$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" \
  --input "operator_evidence_sha256=$TAILROCKS_EVIDENCE_SHA256" \
  --input "operator_evidence_b64=$TAILROCKS_EVIDENCE_B64" \
  --out "$TAILROCKS_PROVIDER_VERIFY_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch --dispatch "$TAILROCKS_PROVIDER_VERIFY_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_PROVIDER_VERIFY_TMP/dispatch.json" \
  --artifact provider_platform-evidence-operation \
  --dir "$TAILROCKS_PROVIDER_VERIFY_TMP/publication"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_PROVIDER_VERIFY_TMP/dispatch.json" \
  --manifest "$TAILROCKS_PROVIDER_VERIFY_TMP/publication/dispatch-context.json"
rtk bun scripts/protected-workflow.ts verify-evidence-publication \
  --operation-dir "$TAILROCKS_PROVIDER_VERIFY_TMP/publication" \
  --purpose provider_platform \
  --schema provider-platform-evidence-v1 \
  --input-sha256 "$TAILROCKS_EVIDENCE_SHA256" \
  --input-oci-ref "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_OUTPUT_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_PROVIDER_VERIFY_TMP/publication/evidence-manifest.json")"
case "$TAILROCKS_OUTPUT_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-platform-evidence@sha256:*) ;; *) exit 1 ;; esac
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_PROVIDER_VERIFY_TMP/ghcr-post-auth"
trap tailrocks_cleanup_provider_linux_auth EXIT
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_READ_TOKEN:?re-supply GHCR read token after provider execution}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_OUTPUT_OCI_REF" \
  --purpose provider_platform \
  --schema provider-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_PROVIDER_VERIFY_TMP/verified-oci"
tailrocks_cleanup_provider_linux_auth
trap - EXIT
```

Expected: one protected run emits context, canonical evidence, and a manifest
naming one digest-addressed `tailrocks-provider-platform-evidence` OCI subject.

## Scope

**In scope**: read-only release/qualification verification, bounded native
provider runs, temporary canonical JSON, protected publication, attestation.

**Out of scope**: every tracked file, commit, branch, tag, ref, PR, release or
qualification mutation, docs/date/version edit, macOS fan-in, policy/proof work.

## Git workflow

None. Stay detached at the atomic merge. No Git or PR mutation is permitted.

## Steps

### Step 1: Verify immutable release and qualification inputs

Verify every release asset/provenance and exact qualification OCI/file
attestation under task-private registry auth. Materialize only canonical
qualification JSON, then log out/remove registry auth before provider children.

**Verify**: wrong release/package/digest/source/signer/runner, policy/proof drift,
moving alias, auth residue, or qualification mismatch blocks provider execution.

### Step 2: Run and validate native provider rows

Run every applicable exact provider client/config through the released binary
on the native host and recorded isolation boundary, one provider per fresh
broker lease/task home with full cleanup and quiescence before the next. Preserve independent tier or
INCONCLUSIVE result, lifecycle state, budget, origin, and limitation.

**Verify**: wrong target/child/client/origin/config/isolation, leaked auth,
unbounded output, tier promotion, hidden regression, or transcript-derived PASS
fails validation or records the honest lower result.

### Step 3: Publish exact external evidence and verify frozen Git

Submit canonical bytes/digest. Protected main repeats release/qualification/
schema/bound checks, preserves trust labels, and directly attests file/OCI
output. Re-authenticate only for digest pull/attestation, clean auth, then require
unchanged main/PR and detached clean HEAD.

**Verify**: publication binds purpose/schema/input digest/qualification/atomic
SHA; attestation pins repository/workflow/main/source+signer SHA/hosted runner.
Output is digest-only; final Git/PR/main state equals preflight.

## Test plan

- Qualification/release/package/direct-attestation mismatch and moving aliases.
- Provider row/version/origin/config/isolation/lifecycle regression semantics.
- Credential removal before children and redaction/size/query bounds.
- Protected publication and zero Git/PR/ref/docs mutation.

## Done criteria

- [ ] Every applicable Linux x86_64 provider row has an exact honest result.
- [ ] One canonical record binds release and qualification OCI identities.
- [ ] Protected main directly attested exact file/OCI evidence.
- [ ] Output is one digest-addressed provider-platform OCI URI.
- [ ] Repository, PR, refs, release, qualification, and docs remain unchanged.

## STOP conditions

Stop on atomic/main/PR drift, attached/dirty checkout, non-native host,
release/qualification/attestation failure, missing provider/auth/TTY/isolation,
credential residue, schema/publication failure, moving-only URI, or any need to
mutate repository, PR, ref, release, qualification, or docs.

## Maintenance notes

Plan 042 consumes this exact OCI URI with plan 029's independent macOS URI and
the same plan-023 qualification. Static provider docs stay generic and resolve
the signed external support-matrix closure at use time.
