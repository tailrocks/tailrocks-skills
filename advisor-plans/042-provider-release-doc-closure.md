# Plan 042: Publish the provider support-matrix closure

> **Executor instructions**: In one attended session, fan in exact macOS arm64
> and Linux x86_64 provider evidence OCI subjects against the exact plan-023
> provider qualification, then publish one directly attested support-matrix OCI
> closure. Change no tracked file, commit, branch, tag, ref, pull request,
> release, qualification, or static documentation.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 029 and 041 return verified digest-addressed
  OCI URIs, plan 023 qualification remains current, and protected-environment
  approval is available
- **Effort**: S; one attended session
- **Risk**: HIGH
- **Depends on**: plans 029 and 041
- **Covers**: G06, G14, G15
- **Guardrails**: N01, N06, N07, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-16, F4-17,
  F4-22, F4-28, F4-42
- **Planned at**: design baseline `1e809bd`; OCI inputs resolved live

## Why this matters

The repository is frozen after one atomic merge. Public support truth therefore
closes as a signed external object: protected main combines exactly two native
records, preserves every independent provider result and limitation, and emits
one immutable matrix consumers can resolve and verify at use time.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<atomic-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF='<plan-023-provider-qualification-oci-ref>'
TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF='<plan-029-oci-ref-with-digest>'
TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF='<plan-041-oci-ref-with-digest>'
TAILROCKS_MATRIX_TMP="$(mktemp -d /tmp/tailrocks-provider-matrix.XXXXXX)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
case "$TAILROCKS_PROVIDER_QUALIFICATION_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-qualification@sha256:*) ;; *) exit 1 ;; esac
case "$TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-platform-evidence@sha256:*) ;; *) exit 1 ;; esac
case "$TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-platform-evidence@sha256:*) ;; *) exit 1 ;; esac
test "$TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF" != "$TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF"
gh release verify "$TAILROCKS_RELEASE_TAG"
```

Expected: clean detached atomic merge, exact merged-PR/main readback, exact
release and qualification, and two distinct digest-only platform evidence URIs.

## Spec contract

### Requirement G06/G14/G15: evidence-derived external support matrix

`publish-goal-evidence.yml` SHALL implement purpose `provider_fanin`/schema
`provider-support-matrix-closure-v1`. It SHALL authenticate and pull the exact
two native evidence digests, derive their one shared exact qualification URI,
pull that transitive subject, verify every direct file/OCI attestation against
protected main and the atomic source/signer SHA, require the
target set `{aarch64-apple-darwin,x86_64-unknown-linux-musl}`, and validate exact
shared release/qualification/policy/proof/matrix/schema identities. Target/child/
physical host fields SHALL be distinct. Each support row SHALL remain
independent and no stronger than every applicable native result. The workflow
SHALL publish canonical closure bytes to `tailrocks-provider-support-matrix` and
directly attest both file and OCI subjects.
Its `evidence-manifest.json` is a derived local receipt, excluded from the OCI
payload and never treated as the published OCI subject.

#### Scenario: one platform/provider row regresses

- **WHEN** a native row is lower, failing, unavailable, stale, or bound to a
  different qualification/policy/proof/release
- **THEN** emit only the honest lower/unavailable row if the schema permits it,
  otherwise publish nothing; never average or hide the regression.

## Must NOT

- **N01/N12/N13**: no transcript, vote, prose, aggregate score, or stronger
  platform overrides a concrete row.
- **N06/N07/N17**: auth stays task/workflow private and absent from closure.
- **N11**: no Git/release/qualification/docs mutation or moving OCI alias.
- **N16/N18**: exactly two target inputs, closed provider rows, bounded evidence,
  integrity-only comparator/query labels, and one output.
- **N19**: this external operation creates no tracked edit, commit, branch,
  tag/ref, PR, release, or later implementation attempt.

## Inputs to provide

- Exact atomic PR/merge SHA and plan-018 release tag.
- Exact plan-023 qualification and plan-029/041 evidence OCI digest URIs.
- Process-only GHCR read auth and protected-environment approval.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before invoking GitHub.

## Starting state

- Static README/INSTALL/AGENTS/CLAUDE/CHANGELOG support prose was premerged in
  generic fail-closed form. It resolves and verifies external closure; it never
  receives post-merge rows, digests, or dates.
- Plans 029/041 published independent native records for the same plan-023
  qualification and plan-018 release.
- The atomic merge contains the fan-in/matrix validator and protected publisher.

## Commands you will need

```sh
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_MATRIX_TMP/ghcr-auth"
tailrocks_cleanup_provider_matrix_auth() {
  set +e
  if test -n "${TAILROCKS_GHCR_AUTH_CONFIG:-}"; then
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_provider_matrix_auth EXIT
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
  --output-dir "$TAILROCKS_MATRIX_TMP/qualification"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF" \
  --purpose provider_platform \
  --schema provider-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_MATRIX_TMP/macos"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF" \
  --purpose provider_platform \
  --schema provider-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_MATRIX_TMP/linux"
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow publish-goal-evidence.yml \
  --dispatch-branch main \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input 'purpose=provider_fanin' \
  --input 'schema=provider-support-matrix-closure-v1' \
  --input "macos_evidence_oci_ref=$TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF" \
  --input "linux_evidence_oci_ref=$TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF" \
  --out "$TAILROCKS_MATRIX_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch --dispatch "$TAILROCKS_MATRIX_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_MATRIX_TMP/dispatch.json" \
  --artifact provider_fanin-evidence-operation \
  --dir "$TAILROCKS_MATRIX_TMP/publication"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_MATRIX_TMP/dispatch.json" \
  --manifest "$TAILROCKS_MATRIX_TMP/publication/dispatch-context.json"
rtk bun scripts/protected-workflow.ts verify-evidence-publication \
  --operation-dir "$TAILROCKS_MATRIX_TMP/publication" \
  --purpose provider_fanin \
  --schema provider-support-matrix-closure-v1 \
  --input-oci-ref "$TAILROCKS_MACOS_PROVIDER_EVIDENCE_OCI_REF" \
  --input-oci-ref "$TAILROCKS_LINUX_PROVIDER_EVIDENCE_OCI_REF" \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_OUTPUT_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_MATRIX_TMP/publication/evidence-manifest.json")"
case "$TAILROCKS_OUTPUT_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-provider-support-matrix@sha256:*) ;; *) exit 1 ;; esac
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_OUTPUT_OCI_REF" \
  --purpose provider_fanin \
  --schema provider-support-matrix-closure-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_MATRIX_TMP/verified-matrix"
tailrocks_cleanup_provider_matrix_auth
trap - EXIT
```

Expected: one protected run emits context, canonical support matrix, and a
manifest naming exactly one
`oci://ghcr.io/tailrocks/tailrocks-provider-support-matrix@sha256:...` subject.

## Scope

**In scope**: exact input OCI/attestation verification, protected two-platform
matrix fan-in, one closure publication, final file/OCI verification.

**Out of scope**: every tracked file, commit, branch, tag, ref, PR, release,
qualification/version/date/docs edit, provider/native rerun, policy/proof change.

## Git workflow

None. Stay detached at the atomic merge. No Git or PR mutation is permitted.

## Steps

### Step 1: Verify exact qualification and platform subjects

Under task-private registry auth, pull all three digest refs. Verify closed
evidence payloads, locally derived receipt manifests, and direct file/OCI
attestations; require exact protected
workflow/main/atomic source+signer/hosted runner, release, qualification,
policy/proof, target, and native-host identities.

**Verify**: moving/wrong package, bad digest/attestation, duplicate target/host,
identity drift, auth residue, malformed row, or noncanonical evidence blocks.

### Step 2: Fan in independent rows under protected main

Dispatch only the two platform digest refs. Workflow derives their shared
release tag and qualification URI, repeats verification, binds both direct and
the transitive qualification URI/digests, preserves independent row evidence
and limitations, computes each cross-platform row as the applicable lower
bound, and directly attests canonical file/OCI closure.

**Verify**: input order is canonical; omitted/extra/duplicate target, averaged or
promoted tier, hidden unavailable row, mismatched policy/proof/release, false
confidentiality, stale/future date, or unknown field yields no invalid closure.

### Step 3: Verify output and frozen repository authority

Verify publication context/manifest, pull output by digest, validate exact
matrix against all three inputs, and verify direct file/OCI attestations. Log
out/remove auth. Re-read main/atomic PR and require detached clean HEAD.

**Verify**: output package/ref/schema/purpose/input set is exact; attestation pins
repository/workflow/main/atomic source+signer/hosted runner; final Git/PR/main
state equals preflight and static docs are byte-unchanged.

## Test plan

- Exact two-target/three-input fan-in, order independence, lower-bound rows.
- Missing/duplicate/third target, same host, qualification/policy/proof drift.
- Unavailable/regressed provider and no averaging/promotion.
- Moving OCI, direct-attestation failure, auth cleanup, zero repository mutation.

## Done criteria

- [ ] Qualification and both platform OCI subjects independently verify.
- [ ] One canonical matrix binds every exact input URI/digest and release fact.
- [ ] Every row is an honest applicable lower bound with retained limitations.
- [ ] File/OCI closure is directly attested and referenced only by digest.
- [ ] Static docs and all Git/PR/ref/release/qualification state remain unchanged.

## STOP conditions

Stop on merge/PR/main drift, dirty/attached checkout, missing/moving input,
attestation/schema/target/host/shared-field mismatch, hidden/lower provider row,
missing approval/auth, publication failure, credential residue, or any need to
edit Git, PR, release, qualification, or static docs.

## Maintenance notes

This digest-addressed OCI subject is the external provider-support terminal for
the exact release/qualification. Static docs resolve it and verify provenance at
use time. Any provider/version/origin/config/isolation/platform change creates
new native inputs and a new closure; prior subjects remain immutable.
