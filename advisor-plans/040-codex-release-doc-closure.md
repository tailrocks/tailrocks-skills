# Plan 040: Publish the Codex release closure

> **Executor instructions**: In one attended session, fan in the exact macOS
> arm64 and Linux x86_64 Codex evidence OCI subjects through protected main and
> publish one directly attested release-closure OCI subject. Change no tracked
> file, commit, branch, tag, ref, pull request, release, or static documentation.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 028 and 039 each return one verified exact
  digest-addressed OCI URI and protected-environment approval is available
- **Effort**: S; one attended session
- **Risk**: HIGH
- **Depends on**: plans 028 and 039
- **Covers**: G06, G14, G15
- **Guardrails**: N06, N07, N11, N13, N16, N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-16, F4-17,
  F4-28, F4-42
- **Planned at**: design baseline `1e809bd`; OCI inputs resolved live

## Why this matters

Two native observations must agree before Codex release support closes. The
atomic repository is already frozen, so closure is an immutable external fact:
protected main pulls exact attested platform subjects, validates their shared
and distinct fields, and publishes one canonical digest-addressed fan-in.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<atomic-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_MACOS_EVIDENCE_OCI_REF='<plan-028-oci-ref-with-digest>'
TAILROCKS_LINUX_EVIDENCE_OCI_REF='<plan-039-oci-ref-with-digest>'
TAILROCKS_CLOSURE_TMP="$(mktemp -d /tmp/tailrocks-codex-closure.XXXXXX)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
case "$TAILROCKS_MACOS_EVIDENCE_OCI_REF" in oci://*@sha256:*) ;; *) exit 1 ;; esac
case "$TAILROCKS_LINUX_EVIDENCE_OCI_REF" in oci://*@sha256:*) ;; *) exit 1 ;; esac
test "$TAILROCKS_MACOS_EVIDENCE_OCI_REF" != "$TAILROCKS_LINUX_EVIDENCE_OCI_REF"
gh release verify "$TAILROCKS_RELEASE_TAG"
```

Expected: clean detached atomic merge, exact merged-PR/main readback, one
immutable plan-018 release, and two distinct digest-only platform evidence URIs.

## Spec contract

### Requirement G06/G14/G15: exact two-target external fan-in

`publish-goal-evidence.yml` SHALL implement purpose `codex_fanin`/schema
`codex-release-closure-v1`. It SHALL authenticate,
pull both exact OCI digests, verify their direct file/OCI attestations against
the same protected workflow and atomic source/signer SHA, validate each closed
platform schema, and require the exact target set
`{aarch64-apple-darwin,x86_64-unknown-linux-musl}`. Shared release/tag/source/
manifest/index/qualification/Codex version/tier/schema fields and the released
broker/account-policy receipt schema SHALL be byte-equal;
target, child, native host, and operator-attested observations SHALL be distinct.
It SHALL publish canonical fan-in bytes to
`tailrocks-codex-release-closure` and directly attest file and OCI subjects.
The operation's `evidence-manifest.json` is a derived local receipt, excluded
from the OCI payload and never treated as an OCI subject.

#### Scenario: platform records disagree

- **WHEN** either input is missing/mutable/moving, target set or native-host
  independence fails, or any required shared field differs
- **THEN** no closure is published; never choose one record or average claims.

## Must NOT

- **N06/N07**: registry credentials remain task/workflow private and absent from
  closure/logs/artifacts.
- **N11**: no Git/release/docs mutation and no moving OCI alias; only exact
  closure OCI publication is authorized.
- **N13**: closure claims no platform/tier/lifecycle stronger than both records.
- **N16**: exactly two inputs, two targets, one bounded fan-in, one output.
- **N19**: this external operation creates no tracked edit, commit, branch,
  tag/ref, PR, release, or later implementation attempt.

## Inputs to provide

- Atomic PR/merge SHA, plan-018 release tag, and exact plan-028/039 OCI URIs.
- Process-only GHCR read authentication and protected-environment approval.
- Plan-022-pinned signer ID and matching process-only authority signing key;
  dispatch sends only the public ID/signature and scrubs the private key path
  and admin credentials before invoking GitHub.

## Starting state

- Static README/INSTALL/CHANGELOG distribution prose was merged once in generic,
  fail-closed form and resolves signed external closure at use time.
- Plans 028/039 published operator-attested native evidence through protected
  main; no platform record exists in Git.
- The atomic merge contains the fan-in validator and
  `publish-goal-evidence.yml`; this operation implements nothing.

## Commands you will need

```sh
TAILROCKS_GHCR_AUTH_CONFIG="$TAILROCKS_CLOSURE_TMP/ghcr-auth"
tailrocks_cleanup_codex_closure_auth() {
  set +e
  if test -n "${TAILROCKS_GHCR_AUTH_CONFIG:-}"; then
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_codex_closure_auth EXIT
install -d -m 700 "$TAILROCKS_GHCR_AUTH_CONFIG"
set +x
test -n "${TAILROCKS_GHCR_USER:?missing GHCR user}"
test -n "${TAILROCKS_GHCR_READ_TOKEN:?missing GHCR read token}"
printf '%s' "$TAILROCKS_GHCR_READ_TOKEN" | DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker login ghcr.io --username "$TAILROCKS_GHCR_USER" --password-stdin
unset TAILROCKS_GHCR_READ_TOKEN
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_MACOS_EVIDENCE_OCI_REF" \
  --purpose codex_platform \
  --schema codex-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_CLOSURE_TMP/macos"
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_LINUX_EVIDENCE_OCI_REF" \
  --purpose codex_platform \
  --schema codex-platform-evidence-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_CLOSURE_TMP/linux"
TAILROCKS_AUTHORITY_SIGNER_ID="$TAILROCKS_AUTHORITY_SIGNER_ID" \
TAILROCKS_AUTHORITY_SIGNING_KEY="$TAILROCKS_AUTHORITY_SIGNING_KEY" \
  rtk bun scripts/protected-workflow.ts dispatch \
  --workflow publish-goal-evidence.yml \
  --dispatch-branch main \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --input 'purpose=codex_fanin' \
  --input 'schema=codex-release-closure-v1' \
  --input "macos_evidence_oci_ref=$TAILROCKS_MACOS_EVIDENCE_OCI_REF" \
  --input "linux_evidence_oci_ref=$TAILROCKS_LINUX_EVIDENCE_OCI_REF" \
  --out "$TAILROCKS_CLOSURE_TMP/dispatch.json"
unset TAILROCKS_AUTHORITY_SIGNING_KEY TAILROCKS_AUTHORITY_SIGNER_ID
rtk bun scripts/protected-workflow.ts watch --dispatch "$TAILROCKS_CLOSURE_TMP/dispatch.json"
rtk bun scripts/protected-workflow.ts download \
  --dispatch "$TAILROCKS_CLOSURE_TMP/dispatch.json" \
  --artifact codex_fanin-evidence-operation \
  --dir "$TAILROCKS_CLOSURE_TMP/publication"
rtk bun scripts/protected-workflow.ts verify-context \
  --dispatch "$TAILROCKS_CLOSURE_TMP/dispatch.json" \
  --manifest "$TAILROCKS_CLOSURE_TMP/publication/dispatch-context.json"
rtk bun scripts/protected-workflow.ts verify-evidence-publication \
  --operation-dir "$TAILROCKS_CLOSURE_TMP/publication" \
  --purpose codex_fanin \
  --schema codex-release-closure-v1 \
  --input-oci-ref "$TAILROCKS_MACOS_EVIDENCE_OCI_REF" \
  --input-oci-ref "$TAILROCKS_LINUX_EVIDENCE_OCI_REF" \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_OUTPUT_OCI_REF="$(jq -er .oci_ref "$TAILROCKS_CLOSURE_TMP/publication/evidence-manifest.json")"
case "$TAILROCKS_OUTPUT_OCI_REF" in oci://ghcr.io/tailrocks/tailrocks-codex-release-closure@sha256:*) ;; *) exit 1 ;; esac
DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk bun scripts/protected-workflow.ts verify-evidence-oci \
  --oci-ref "$TAILROCKS_OUTPUT_OCI_REF" \
  --purpose codex_fanin \
  --schema codex-release-closure-v1 \
  --authority-ref refs/heads/main \
  --authority-sha "$TAILROCKS_ATOMIC_MERGE_SHA" \
  --repull \
  --output-dir "$TAILROCKS_CLOSURE_TMP/verified-closure"
tailrocks_cleanup_codex_closure_auth
trap - EXIT
```

Expected: one protected run emits context, canonical two-target closure, and a
manifest naming one `oci://ghcr.io/tailrocks/tailrocks-codex-release-closure@sha256:...`
subject.

## Scope

**In scope**: exact OCI input/attestation verification, protected two-record
fan-in, one closure publication, final file/OCI verification.

**Out of scope**: every tracked file, commit, branch, tag, ref, PR, release,
version/date/docs edit, native provider run, policy/candidate work.

## Git workflow

None. Stay detached at the atomic merge. No Git or PR mutation is permitted.

## Steps

### Step 1: Verify both immutable platform subjects

Authenticate in a task-private Docker config. Pull both digest refs, verify
direct attestations, canonical evidence, and locally derived receipt manifests;
require exact workflow/
source/signer/runner identity, release tag, target, and platform schema.

**Verify**: moving ref, absent auth, wrong package/digest/workflow/source/signer/
runner, duplicate target/host, malformed evidence, or release drift blocks before
dispatch.

### Step 2: Fan in under protected main and publish one closure

Dispatch only the two digest refs. The workflow derives and requires their one
shared release tag, repeats all input checks, computes the exact shared/distinct-
field join, binds both input URIs and evidence digests, preserves trust labels,
and publishes canonical closure bytes with direct file/OCI attestations.

**Verify**: input reorder produces the same canonical closure; omission,
addition, duplicate target, disagreement, lower/failing lifecycle, stale/future
date, or trust-label promotion produces no publication.

### Step 3: Verify output and unchanged repository authority

Verify publication manifest/context, pull the output by digest, validate closure
against both exact inputs/release, and verify direct file/OCI attestations. Log
out/remove task auth. Re-read main and the merged PR; require detached clean HEAD.

**Verify**: output OCI URI is digest-addressed in the exact closure package;
attestation pins repository/workflow/main/atomic source+signer SHA/hosted runner;
final main/PR/HEAD/status equal preflight.

## Test plan

- Exact two-target shared/distinct-field fan-in and order independence.
- Missing/duplicate/third target, same host, identity/tier/lifecycle/date drift.
- Moving/tag-only/wrong-package OCI and bad direct attestation rejection.
- Credential cleanup and zero repository/PR/ref mutation.

## Done criteria

- [ ] Both exact platform OCI subjects independently verify.
- [ ] One canonical closure binds both URIs/digests and exact release identity.
- [ ] File and OCI subjects are directly attested by protected main.
- [ ] Output is a digest-only Codex release-closure OCI URI.
- [ ] Static docs and all Git/PR/ref/release state remain unchanged.

## STOP conditions

Stop on merge/PR/main drift, dirty/attached checkout, missing/moving input,
attestation/schema/target/host/shared-field mismatch, missing approval/auth,
publication verification failure, credential residue, or any need to edit Git,
PR, release, or static documentation.

## Maintenance notes

Plan 019 consumes this exact closure OCI subject plus the base-owned policy
bootstrap implementation. A later platform/client/release change creates new
native subjects and a new closure digest; it never rewrites this one.
