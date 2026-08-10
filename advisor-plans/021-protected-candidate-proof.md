# Plan 021: Prove the synthetic candidate bundle as untrusted data

> **Executor instructions**: In one attended session, dispatch protected main
> exactly once to consume Plan 024's digest-addressed candidate bundle under
> Plan 019's released policy and publish one proof-closed protected-evidence
> OCI. Create no tracked file, repository commit, branch, tag/Git ref, PR,
> merge, or PR/ref cleanup operation.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 024 publishes and independently verifies its
  exact candidate-bundle OCI and protected-environment approval is present
- **Effort**: M; one attended session, one workflow attempt
- **Risk**: HIGH
- **Depends on**: plan 024
- **Covers**: G08, G14, G15
- **Guardrails**: N01, N05-N08, N11, N13-N16, N18, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-19,
  F4-20, F4-27-F4-29
- **Planned at**: design baseline `1e809bd`; bundle/policy identities resolved live

## Atomic delivery invariant

All tracked implementation SHALL already be present in the single atomic merge
PR at `<atomic-merge-sha>`. This post-merge proof reads only that detached tree
and immutable OCI inputs. It may create task-local temporary bytes, one Actions
run, and one digest-addressed evidence OCI. It SHALL create no second
implementation branch/PR and no repository commit/ref of any kind.

## Why this matters

Protected authority must prove that hostile candidate-shaped bytes remain data
on the controller and execute only inside the released policy's fixed verifier.
Plan 024 supplies those bytes without a later repository commit or PR. This
operation binds their exact OCI closure to policy, isolated execution, receipt,
and durable protected provenance.

The proof covers only `synthetic_candidate_fixture`. It does not prove safe
acquisition of any real PR, fork, branch, ref, or Git object graph.

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

TAILROCKS_POLICY_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-verifier-policy@sha256:<plan-019-policy-digest>'
TAILROCKS_POLICY_AUTHORITY_SHA='<plan-019-authority-sha>'
TAILROCKS_CANDIDATE_BUNDLE_OCI_REF='oci://ghcr.io/tailrocks/tailrocks-candidate-bundles@sha256:<plan-024-candidate-bundle-digest>'
TAILROCKS_CANDIDATE_AUTHORITY_SHA='<plan-024-authority-sha>'
TAILROCKS_CANDIDATE_MANIFEST_DIGEST='<plan-024-candidate-manifest-sha256-hex>'
TAILROCKS_FIXTURE_DIGEST='<plan-024-fixture-digest>'
TAILROCKS_FIXTURE_LABEL='synthetic_candidate_fixture'
TAILROCKS_CANDIDATE_SHA='<plan-024-synthetic-candidate-sha>'
TAILROCKS_CANDIDATE_TREE_SHA='<plan-024-synthetic-tree-sha>'
TAILROCKS_CONTRACT_DIGEST='<plan-024-contract-digest>'
test "$TAILROCKS_POLICY_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$TAILROCKS_CANDIDATE_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_021_TMP="$(mktemp -d /tmp/tailrocks-protected-proof.XXXXXX)"
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_021_TMP/ghcr-auth"
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
tailrocks_cleanup_021_auth() {
  (
    set +e
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  )
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_021_auth EXIT
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
  rtk bun scripts/verify-protected-policy.ts \
  --oci-ref "$TAILROCKS_POLICY_OCI_REF" \
  --output "$TAILROCKS_021_TMP/policy.json"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_POLICY_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/bootstrap-protected-verifier.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/protected-workflow.ts verify-candidate-bundle \
  --oci-ref "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --candidate "$TAILROCKS_CANDIDATE_SHA" \
  --tree "$TAILROCKS_CANDIDATE_TREE_SHA" \
  --manifest-digest "$TAILROCKS_CANDIDATE_MANIFEST_DIGEST" \
  --contract "$TAILROCKS_CONTRACT_DIGEST" \
  --fixture-digest "$TAILROCKS_FIXTURE_DIGEST" \
  --policy "$TAILROCKS_POLICY_OCI_REF" \
  --require-label "$TAILROCKS_FIXTURE_LABEL" \
  --require-untrusted \
  --deny-real-pr-acquisition-claim \
  --repull
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_CANDIDATE_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_CANDIDATE_AUTHORITY_SHA" \
  --deny-self-hosted-runners
```

Expected: detached clean atomic authority and exact merged-PR readback; policy
and candidate bundle both verify by digest and direct protected provenance;
bundle says `synthetic_candidate_fixture`, `untrusted_data`, and no real-PR
acquisition proof. No payload is executed or selected as host argv.

## Spec contract

### Requirement G08/G14/G15: proof-closed synthetic candidate isolation

The protected-default workflow SHALL authenticate and read the candidate-bundle
OCI as bounded untrusted data, validate its full closure, select the verifier
only from Plan 019 policy, and run the fixed candidate entrypoint only inside
that released digest-pinned isolation. It SHALL publish a directly attested,
digest-addressed evidence OCI reconstructing every candidate, receipt, and
evidence byte.

Evidence SHALL preserve `origin_label=synthetic_candidate_fixture` and
`real_pr_acquisition_proven=false`. It SHALL not generalize fixture proof to a
real repository acquisition path.

#### Scenario: hostile authority bytes

- **WHEN** payload contains candidate workflow/helper markers and host-access
  probes
- **THEN** controller uses only atomic default-branch workflow/helper bytes;
  markers remain payload data and all prohibited accesses are denied.

#### Scenario: provenance overclaim

- **WHEN** evidence claims a PR/fork/ref source or safe real-PR acquisition
- **THEN** proof validation fails even if isolated functional output passed.

## Must NOT

- **N01/N08**: OCI existence, prior receipt, transcript, or candidate claim
  cannot PASS.
- **N05-N07**: no candidate byte executes on host; worker receives no GitHub,
  registry, policy, expected-value, provider, or repository credential.
- **N11**: no tracked write, repository commit, branch, tag/Git ref, PR, merge,
  cleanup, release, policy, or environment mutation; only exact evidence OCI
  publication.
- **N13-N15**: no PR/head/ref resolution, checkout, archive extraction, moving
  alias, shared cache, or future object reachability.
- **N16**: bundle layers/paths/bytes, worker resources, output, queries, API
  calls, and one workflow attempt are closed and bounded.
- **N18**: comparator is integrity-only with cumulative query cap; expected
  bytes are unmounted, not claimed confidential.
- **N19**: Plan 043's one branch/PR/merge is final; proof closure creates only
  its digest OCI and cannot create a corrective or evidence PR.

## Inputs to provide

- Exact atomic merge SHA/PR/branch readback.
- Exact Plan 019 policy OCI URI/digest, authority SHA, manifest, and receipt.
- Exact Plan 024 candidate-bundle OCI URI/digest, fixture digest, authority SHA,
  manifest, and dispatch receipt.
- Protected-environment approval and process-only GHCR read auth. Raw tokens
  enter no dispatch input, evidence, worker environment, or log.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before GitHub or verifier children.

## Starting state

- All workflow/helper/verifier/evidence implementation is in the atomic merge.
- Plan 019 policy selects the released verifier by immutable digest.
- Plan 024 published one untrusted synthetic candidate bundle and no repository
  commit/ref/PR.

## Commands you will need

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow protected-candidate-verify.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_AUTHORITY_SHA" \
  --input 'purpose=verify_candidate_bundle' \
  --input "candidate_bundle_oci_ref=$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --input "candidate_sha=$TAILROCKS_CANDIDATE_SHA" \
  --input "candidate_tree_sha=$TAILROCKS_CANDIDATE_TREE_SHA" \
  --input "candidate_manifest_digest=$TAILROCKS_CANDIDATE_MANIFEST_DIGEST" \
  --input "contract_digest=$TAILROCKS_CONTRACT_DIGEST" \
  --input "policy_oci_ref=$TAILROCKS_POLICY_OCI_REF" \
  --out "$TAILROCKS_021_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_021_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_021_TMP/dispatch.json" \
  --artifact protected-candidate-operation \
  --dir "$TAILROCKS_021_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_021_TMP/dispatch.json" \
  --manifest "$TAILROCKS_021_TMP/artifacts/dispatch-context.json" \
  --require-run-attempt 1
```

Expected: one run attempt uniquely matches workflow/ref, atomic authority,
nonce, actor, time, exact digest-only inputs, hosted runner, and literal
artifact. No rerun, replacement dispatch, or mutable candidate input is allowed.

## Scope

**In scope**: exact OCI/policy authentication; protected bundle-as-data
validation; released-verifier isolated execution; evidence closure, publication,
attestation, repull, and reconstruction.

**Out of scope**: tracked implementation; repository candidate commit/branch/
ref/PR; real-PR/fork acquisition proof; checkout or host candidate execution;
PR/ref cleanup; release/tag/policy/environment/provider-matrix mutation.

## Git workflow

None. Checkout stays detached and clean at the atomic merge. No Git write or PR
command exists in this plan. There is nothing to close or delete because Plan
024 created no branch, ref, or PR.

## Steps

### Step 1: Verify exact immutable inputs as data

Run Preconditions completely. The local controller verifies policy and
candidate-bundle manifests, OCI digests, direct attestations, fixture label, and
negative real-PR claim. It may parse bounded manifests but never invokes,
checks out, or maps payload bytes to host argv.

**Verify**: both OCI subjects survive two identical digest repulls; every
manifest/layer hash closes; source and signer equal the atomic merge; checkout
remains detached/clean; no Git ref or PR exists.

### Step 2: Execute the fixed candidate only under released policy

Run Commands exactly once. Protected workflow reauthenticates both OCI inputs,
validates candidate closure before materialization, removes registry auth, and
selects exact verifier index/child/profile from policy. Fixed launcher enforces
non-root, read-only root, no-new-privileges, cap drop, no network/socket, fresh
scratch, bounded CPU/memory/pids/time/output, read-only candidate mount, and
`--pull never`. Candidate receives one public input; expected bytes stay outside
worker. Require functional PASS and denial of every host/controller/network/
token/socket/cache/policy/oracle probe.

**Verify**: context records run attempt 1; applied-limit evidence matches policy;
worker environment has no credential; cumulative comparator queries equal one;
candidate authority sentinels never occur in controller events. Any malformed
output, stale receipt, access success, policy/image drift, or second attempt
fails.

### Step 3: Publish and independently close protected evidence

```sh
TAILROCKS_EVIDENCE_FILE="$TAILROCKS_021_TMP/artifacts/protected-evidence.json"
TAILROCKS_EVIDENCE_MANIFEST="$TAILROCKS_021_TMP/artifacts/evidence-manifest.json"
TAILROCKS_EVIDENCE_DIGEST="$(rtk bun scripts/verify-protected-evidence.ts \
  print-field --manifest "$TAILROCKS_EVIDENCE_MANIFEST" --field oci_digest)"
TAILROCKS_EVIDENCE_OCI_REF="oci://ghcr.io/tailrocks/tailrocks-protected-evidence@$TAILROCKS_EVIDENCE_DIGEST"
test "$(jq -er .candidate_bundle_oci_ref "$TAILROCKS_EVIDENCE_MANIFEST")" = \
  "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF"
test "$(jq -er .candidate_bundle_manifest_digest "$TAILROCKS_EVIDENCE_MANIFEST")" = \
  "$TAILROCKS_CANDIDATE_MANIFEST_DIGEST"
rtk bun scripts/verify-protected-evidence.ts \
  --bundle "$TAILROCKS_EVIDENCE_FILE" \
  --manifest "$TAILROCKS_EVIDENCE_MANIFEST" \
  --candidate "$TAILROCKS_CANDIDATE_SHA" \
  --candidate-bundle "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --policy "$TAILROCKS_POLICY_OCI_REF" \
  --require-origin-label "$TAILROCKS_FIXTURE_LABEL" \
  --deny-real-pr-acquisition-claim \
  --require-proof-closed
gh attestation verify "$TAILROCKS_EVIDENCE_FILE" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_EVIDENCE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  rtk bun scripts/verify-protected-evidence.ts \
  --oci-ref "$TAILROCKS_EVIDENCE_OCI_REF" \
  --candidate "$TAILROCKS_CANDIDATE_SHA" \
  --candidate-bundle "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --policy "$TAILROCKS_POLICY_OCI_REF" \
  --require-origin-label "$TAILROCKS_FIXTURE_LABEL" \
  --deny-real-pr-acquisition-claim \
  --require-proof-closed \
  --repull \
  --output "$TAILROCKS_021_TMP/reconstructed"
tailrocks_cleanup_021_auth
trap - EXIT INT TERM
```

Record exact evidence OCI URI/digest, candidate-bundle and policy digests,
atomic authority SHA, run ID/attempt, and manifest digest as Plan 023 inputs.
Actions artifact is transfer only. The evidence manifest containing its output
OCI digest is a derived receipt excluded from that OCI subject; durable
verification reconstructs it from canonical subject metadata and direct
attestations, so no self-referential hash exists.

**Verify**: repull reconstructs every evidence blob, standalone bundle, and
exact candidate commit/tree; evidence manifest binds
`$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF` and `$TAILROCKS_CONTRACT_DIGEST`;
file and OCI attestations pin direct protected signer and atomic SHA; manifest
retains `synthetic_candidate_fixture`, `untrusted_data`, and
`real_pr_acquisition_proven=false`. Final repository status is empty. No
PR/ref cleanup command ran.

## Test plan

- Atomic merge PR/SHA and detached-clean equality.
- Exact policy and candidate-bundle digest/provenance/repull closure.
- Candidate bytes never execute on controller; fixed released isolation only.
- Host/token/socket/network/cache/policy/oracle denial and applied bounds.
- One query, one workflow attempt, current exact receipt.
- Full evidence OCI reconstruction and direct protected attestation.
- Real-PR acquisition overclaim rejection and zero Git/PR cleanup.

## Done criteria

- [ ] Policy and synthetic candidate bundle verify by exact prior OCI digests.
- [ ] Exactly one protected run attempt executes candidate only in released OCI.
- [ ] Protected evidence OCI closes every input, receipt, and evidence blob.
- [ ] Evidence preserves synthetic origin and states no real-PR acquisition was
  proven.
- [ ] Direct file/OCI attestations pin atomic main authority.
- [ ] Checkout remains detached/clean; no tracked/Git/PR mutation occurred.

## STOP conditions

Stop on atomic merge/PR drift, attached/dirty checkout, policy or candidate OCI
drift, mutable alias, absent approval, second dispatch/rerun, controller
execution, credential exposure, failed isolation probe, stale/malformed PASS,
digest/provenance/closure mismatch, real-PR claim, repository mutation, or work
beyond the one attended session. No corrective implementation branch/PR is
allowed.

## Maintenance notes

Plan 023 consumes only this evidence OCI's immutable digest plus Plan 019
policy. No later plan may reinterpret it as real-PR acquisition evidence or
depend on an Actions artifact, branch, PR, or moving package alias.
