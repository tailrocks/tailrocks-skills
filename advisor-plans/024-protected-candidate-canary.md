# Plan 024: Publish one synthetic untrusted candidate bundle

> **Executor instructions**: In one attended session, dispatch protected main
> exactly once to materialize Plan 036's sealed hostile fixture and publish one
> digest-addressed untrusted candidate-bundle OCI. This is a post-merge
> operation: create no tracked file, repository commit, branch, tag/Git ref,
> PR, or merge.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until the single atomic implementation PR is merged,
  plan 019 publishes its exact verifier-policy OCI, and an operator authorizes
  this exact protected dispatch and OCI publication
- **Effort**: S; one attended session, one workflow attempt
- **Risk**: HIGH
- **Depends on**: plan 019
- **Covers**: G08, G14, G15
- **Guardrails**: N03, N05-N08, N11, N13-N16, N18, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-27,
  F4-29
- **Planned at**: design baseline `1e809bd`; all live identities resolved exactly

## Atomic delivery invariant

Every tracked implementation, fixture, workflow, validator, test, and document
required by this operation SHALL already have landed on
`<single-implementation-branch>` through `<atomic-merge-pr-number>` and SHALL
have merged together at `<atomic-merge-sha>`. No follow-up implementation
branch or PR is permitted. This plan reads that detached tree and may create
only task-local synthetic Git objects/bundle bytes, one Actions run, and one
digest-addressed OCI subject. Synthetic objects in a new temporary object
database are candidate data, not repository commits or refs. An OCI digest URI
is not a Git ref.

## Why this matters

Plan 021 needs hostile candidate-shaped bytes without violating atomic delivery
by creating a later canary commit or PR. Plan 036 therefore seals one canonical
fixture in the atomic tree. Protected main packages those bytes as explicitly
untrusted data, preserving hostile authority-path markers and access probes
without executing them.

This operation proves deterministic fixture publication only. It provides no
evidence that a real PR head, fork object, branch, or moving ref can be acquired
safely.

## Preconditions — run before anything else

Resolve every placeholder from the atomic merge and prior operation receipts:

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
test "$TAILROCKS_POLICY_AUTHORITY_SHA" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_FIXTURE_LABEL='synthetic_candidate_fixture'
TAILROCKS_FIXTURE_DIGEST='<plan-036-sealed-fixture-digest>'
TAILROCKS_CONTRACT_DIGEST='<plan-036-contract-digest>'
TAILROCKS_FIXTURE_DIR='tests/fixtures/protected-candidate/synthetic-candidate-fixture'
TAILROCKS_FIXTURE_MANIFEST="$TAILROCKS_FIXTURE_DIR/manifest.json"
TAILROCKS_024_TMP="$(mktemp -d /tmp/tailrocks-synthetic-candidate.XXXXXX)"
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_024_TMP/ghcr-auth"
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
tailrocks_cleanup_024_auth() {
  (
    set +e
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  )
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_024_auth EXIT
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
  --output "$TAILROCKS_024_TMP/policy.json"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_POLICY_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/bootstrap-protected-verifier.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --signer-digest "$TAILROCKS_POLICY_AUTHORITY_SHA" \
  --deny-self-hosted-runners
test "$(jq -er .fixture_digest "$TAILROCKS_FIXTURE_MANIFEST")" = \
  "$TAILROCKS_FIXTURE_DIGEST"
test "$(jq -er .origin_label "$TAILROCKS_FIXTURE_MANIFEST")" = \
  "$TAILROCKS_FIXTURE_LABEL"
test "$(jq -er .contract_digest "$TAILROCKS_FIXTURE_MANIFEST")" = \
  "$TAILROCKS_CONTRACT_DIGEST"
```

Expected: HEAD, local and remote `origin/main`, policy signer, and merge-PR
readback all name the atomic merge; checkout is detached and clean; policy is
digest-only; Plan 036's fixture has the recorded digest and exact label. No
command fetches or creates a Git ref. Missing authorization remains BLOCKED.

## Spec contract

### Requirement G08/G14/G15: canonical hostile fixture as untrusted OCI data

One protected-default run SHALL read only the sealed Plan 036 fixture at the
atomic authority SHA, validate its recorded digest, construct a canonical
bounded standalone Git bundle containing one deterministic detached candidate
commit/tree, and publish it by OCI digest. Manifest and
attestation SHALL carry `origin_label=synthetic_candidate_fixture`,
`trust=untrusted_data`, and `real_pr_acquisition_proven=false`. Authority-path
markers, path attacks, environment probes, fixed public input, and expected
bounded output SHALL remain inert payload bytes.

#### Scenario: protected fixture publication

- **WHEN** fixture digest, label, authority SHA, policy digest, or canonical
  bundle bytes differ
- **THEN** the workflow fails before OCI publication.

#### Scenario: consumer asks for real-PR proof

- **WHEN** a consumer interprets this subject as proof of PR/fork/ref acquisition
- **THEN** the manifest and validator reject that claim; scope is synthetic
  fixture integrity and provenance only.

## Must NOT

- **N03**: fixture bytes cannot choose controller, Git, container, or verifier
  argv.
- **N05/N06**: no fixture byte executes on the host and no candidate payload
  receives a credential.
- **N07/N08**: OCI provenance does not mint protected PASS or trust candidate
  content.
- **N11**: no tracked write, repository commit, branch, tag/Git ref, PR, merge,
  release, policy, or environment mutation; only task-local detached candidate
  objects and the authorized candidate-bundle OCI.
- **N13-N15**: no PR number, head SHA, branch, archive URL, moving alias, shared
  cache, or future object reachability participates.
- **N16**: fixture files, paths, bytes, layers, outputs, API calls, and one run
  attempt are contract-bounded.
- **N18**: functional expectation is public and integrity-only; no hidden-oracle
  or confidentiality claim.
- **N19**: Plan 043's one branch/PR/merge is the only tracked delivery; this
  post-merge operation cannot create a corrective or evidence PR.

## Inputs to provide

- Exact atomic merge SHA, sole implementation branch, sole merged PR number/URL.
- Exact Plan 019 policy OCI digest, manifest identity, dispatch receipt, and
  authority SHA.
- Exact Plan 036 sealed fixture digest and protected-environment approval.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before GitHub or verifier children.
- Process-only GHCR read auth for independent verification. Workflow publication
  uses only protected workflow authority; credential values enter no input,
  log, bundle, or candidate environment.

## Starting state

- All tracked implementation is complete in the one atomic merge.
- Plan 036 implemented and sealed the canonical hostile fixture and publisher.
- Plan 019 published the released-verifier policy by exact OCI digest.
- No synthetic candidate exists in repository history, branch, Git ref, or PR;
  no candidate-bundle OCI exists for this fixture/policy tuple.

## Commands you will need

Dispatch exactly once:

```sh
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow protected-candidate-verify.yml \
  --dispatch-branch main \
  --authority-ref "$TAILROCKS_AUTHORITY_REF" \
  --authority-sha "$TAILROCKS_AUTHORITY_SHA" \
  --input 'purpose=publish_synthetic_candidate_fixture' \
  --input "fixture_id=$TAILROCKS_FIXTURE_LABEL" \
  --input "fixture_digest=$TAILROCKS_FIXTURE_DIGEST" \
  --input "contract_digest=$TAILROCKS_CONTRACT_DIGEST" \
  --input "policy_oci_ref=$TAILROCKS_POLICY_OCI_REF" \
  --out "$TAILROCKS_024_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch \
  --dispatch "$TAILROCKS_024_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_024_TMP/dispatch.json" \
  --artifact synthetic-candidate-operation \
  --dir "$TAILROCKS_024_TMP/artifacts"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_024_TMP/dispatch.json" \
  --manifest "$TAILROCKS_024_TMP/artifacts/dispatch-context.json" \
  --require-run-attempt 1
```

Expected: one `workflow_dispatch` run, attempt 1, exact nonce/actor/time,
`refs/heads/main`, atomic source/signer SHA, closed inputs, protected hosted
runner, and literal artifact. No rerun or replacement dispatch is allowed.

## Scope

**In scope**: protected dispatch and approval; deterministic packaging of
Plan 036's sealed fixture; one digest-addressed candidate-bundle OCI; independent
digest, schema, label, closure, and provenance verification.

**Out of scope**: tracked implementation; repository Git commits/branches/refs/
PRs; real PR/fork acquisition; candidate execution; PASS evidence; release,
tag, policy, environment, or support-matrix mutation.

## Git workflow

None. Checkout stays clean and detached at the atomic merge. This plan runs no
`git fetch`, `checkout`, `switch`, `commit`, `tag`, `push`, PR command, or
repository-writing helper. The sole implementation branch and PR are historical
readback inputs, not mutation targets.

## Steps

### Step 1: Re-establish atomic authority and sealed fixture identity

Run the entire Preconditions block. Confirm exact merge PR readback, detached
clean equality of HEAD/local `origin/main`/remote main, Plan 019 policy
provenance, and Plan 036 fixture digest. Treat fixture content as inert bytes;
do not invoke an entrypoint from it.

**Verify**: every precondition exits 0; `rtk git status
--porcelain=v1 --untracked-files=all` remains empty; merge PR remains the one
historical merged PR; no local/remote Git ref was created.

### Step 2: Dispatch one protected fixture publication

Run Commands exactly once. Protected main reads the fixture by allowlisted path,
checks label/digest before materialization, canonicalizes modes/paths/order/
timestamps and fixed commit metadata, bounds every file/layer/byte, and emits a
standalone bundle containing one detached synthetic commit/tree created only in
a fresh temporary object database. It creates no repository commit or ref and
performs no candidate process execution. Publication is the final workflow
action after all bundle checks pass.

**Verify**: context validation requires run attempt 1 and exact closed inputs.
Controller logs contain no fixture authority sentinel. Workflow artifact has
only `candidate.bundle`, `candidate-bundle-manifest.json`, and
`dispatch-context.json`. Any extra output or partial/moving OCI alias fails.
The manifest is the derived publication receipt and is excluded from the OCI
subject whose digest it records; the subject contains the bundle plus
deterministic non-self-referential metadata.

### Step 3: Verify the digest-addressed untrusted candidate OCI

```sh
TAILROCKS_CANDIDATE_BUNDLE="$TAILROCKS_024_TMP/artifacts/candidate.bundle"
TAILROCKS_CANDIDATE_MANIFEST="$TAILROCKS_024_TMP/artifacts/candidate-bundle-manifest.json"
TAILROCKS_CANDIDATE_MANIFEST_DIGEST="$(rtk bun scripts/release-version.ts \
  file-sha256 --input "$TAILROCKS_CANDIDATE_MANIFEST")"
test "${#TAILROCKS_CANDIDATE_MANIFEST_DIGEST}" = 64
case "$TAILROCKS_CANDIDATE_MANIFEST_DIGEST" in
  *[!0-9a-f]*) exit 1 ;;
esac
TAILROCKS_CANDIDATE_SHA="$(jq -er .candidate_sha "$TAILROCKS_CANDIDATE_MANIFEST")"
TAILROCKS_CANDIDATE_TREE_SHA="$(jq -er .candidate_tree_sha "$TAILROCKS_CANDIDATE_MANIFEST")"
TAILROCKS_CONTRACT_DIGEST="$(jq -er .contract_digest "$TAILROCKS_CANDIDATE_MANIFEST")"
TAILROCKS_CANDIDATE_BUNDLE_DIGEST="$(jq -er .oci_digest "$TAILROCKS_CANDIDATE_MANIFEST")"
TAILROCKS_CANDIDATE_BUNDLE_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_CANDIDATE_MANIFEST")"
test "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" = \
  "oci://ghcr.io/tailrocks/tailrocks-candidate-bundles@$TAILROCKS_CANDIDATE_BUNDLE_DIGEST"
case "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" in
  oci://ghcr.io/tailrocks/tailrocks-candidate-bundles@sha256:*) ;;
  *) exit 1 ;;
esac
test "$(jq -er .origin_label "$TAILROCKS_CANDIDATE_MANIFEST")" = \
  "$TAILROCKS_FIXTURE_LABEL"
rtk bun scripts/protected-workflow.ts verify-candidate-bundle \
  --bundle "$TAILROCKS_CANDIDATE_BUNDLE" \
  --manifest "$TAILROCKS_CANDIDATE_MANIFEST" \
  --candidate "$TAILROCKS_CANDIDATE_SHA" \
  --tree "$TAILROCKS_CANDIDATE_TREE_SHA" \
  --contract "$TAILROCKS_CONTRACT_DIGEST" \
  --fixture-digest "$TAILROCKS_FIXTURE_DIGEST" \
  --policy "$TAILROCKS_POLICY_OCI_REF" \
  --require-untrusted \
  --deny-real-pr-acquisition-claim
gh attestation verify "$TAILROCKS_CANDIDATE_BUNDLE" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --deny-self-hosted-runners
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" \
  gh attestation verify "$TAILROCKS_CANDIDATE_BUNDLE_OCI_REF" \
  --repo tailrocks/tailrocks-skills \
  --signer-workflow tailrocks/tailrocks-skills/.github/workflows/protected-candidate-verify.yml \
  --source-ref "$TAILROCKS_AUTHORITY_REF" \
  --source-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --signer-digest "$TAILROCKS_ATOMIC_MERGE_SHA" \
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
  --require-label synthetic_candidate_fixture \
  --require-untrusted \
  --deny-real-pr-acquisition-claim \
  --repull
tailrocks_cleanup_024_auth
trap - EXIT INT TERM
```

Record exact OCI URI, manifest digest, candidate commit/tree, contract and
fixture digests, dispatch run/attempt, and atomic authority SHA as Plan 021
inputs. Actions artifact is transfer only; durable OCI verification reconstructs
and re-hashes the same derived manifest after the artifact expires.

**Verify**: local and two digest repulls match every manifest/layer/payload
hash; standalone bundle reconstructs the exact detached candidate commit/tree;
direct file/OCI attestations pin protected workflow and atomic source/signer;
`trust=untrusted_data`, `origin_label=synthetic_candidate_fixture`, and
`real_pr_acquisition_proven=false` are exact. Final repository status remains
empty and no Git ref/PR exists.

## Test plan

- Atomic merge PR/SHA/branch readback and detached clean checkout.
- Sealed fixture label/digest, canonical path/mode/order/time, and size bounds.
- Hostile authority/path/environment/oracle bytes remain inert.
- Deterministic detached commit/tree exists only inside task-local/bundled data.
- One run attempt, direct protected provenance, exact policy binding.
- Digest repull and full candidate-bundle closure.
- Explicit rejection of any real-PR/fork/ref acquisition claim.
- Zero tracked file, repository commit, branch, tag/Git ref, PR, merge, or
  release mutation.

## Done criteria

- [ ] Atomic merge and Plan 019 policy identities verify exactly.
- [ ] Exactly one protected run attempt packages the sealed Plan 036 fixture.
- [ ] Digest-addressed OCI reconstructs the canonical hostile payload.
- [ ] OCI is labeled `synthetic_candidate_fixture` and `untrusted_data`.
- [ ] Manifest explicitly says no real-PR acquisition was proven.
- [ ] Checkout remains detached/clean; no tracked or Git/PR mutation occurred.

## STOP conditions

Stop on atomic SHA/PR/branch mismatch, attached or dirty checkout, stale/moving
policy, fixture digest/label drift, absent authorization, second dispatch or
rerun, candidate execution, noncanonical/partial OCI, provenance mismatch,
real-PR proof claim, credential exposure, or any repository/Git-ref/PR mutation.
No corrective implementation branch or PR is allowed by this delivery.

## Maintenance notes

Plan 021 may consume only the immutable candidate-bundle OCI digest. It must
preserve the synthetic-origin limitation. A future real-PR acquisition claim
requires a separately authorized program outside this atomic plan; this subject
cannot be relabeled.
