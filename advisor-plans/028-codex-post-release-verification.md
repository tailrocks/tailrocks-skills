# Plan 028: Publish macOS arm64 Codex release evidence

> **Executor instructions**: In one attended macOS arm64 session, verify the
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

Only a physical native host can observe the macOS arm64 install lifecycle. That
observation is not repository authority. This operation keeps it explicitly
`operator_attested`, then lets premerged protected-main code validate, wrap,
publish, and directly attest one immutable digest-addressed OCI record.

## Preconditions — run before anything else

```sh
TAILROCKS_ATOMIC_PR='<atomic-implementation-pr-number>'
TAILROCKS_ATOMIC_MERGE_SHA='<atomic-merge-sha>'
TAILROCKS_AUTHORITY_REF='refs/heads/main'
TAILROCKS_AUTHORITY_SIGNER_ID='<plan-022-pinned-operator-signer-id>'
TAILROCKS_AUTHORITY_SIGNING_KEY='<operator-owned-private-key-path>'
TAILROCKS_RELEASE_TAG='<plan-018-release-tag>'
TAILROCKS_VERIFY_TMP="$(mktemp -d /tmp/tailrocks-codex-macos.XXXXXX)"
test -z "$(rtk git status --porcelain=v1 --untracked-files=all)"
test -z "$(rtk git symbolic-ref -q --short HEAD || true)"
test "$(rtk git rev-parse HEAD)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(rtk git rev-parse origin/main)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
test "$(gh api repos/tailrocks/tailrocks-skills/git/ref/heads/main --jq .object.sha)" = "$TAILROCKS_ATOMIC_MERGE_SHA"
TAILROCKS_PR_READBACK="$(gh pr view "$TAILROCKS_ATOMIC_PR" --json state,baseRefName,mergeCommit,mergedAt --jq '[.state,.baseRefName,.mergeCommit.oid,(.mergedAt != null)] | @tsv')"
test "$TAILROCKS_PR_READBACK" = "$(printf 'MERGED\tmain\t%s\ttrue' "$TAILROCKS_ATOMIC_MERGE_SHA")"
test -r "$TAILROCKS_AUTHORITY_SIGNING_KEY"
test "$(uname -s)" = Darwin
test "$(uname -m)" = arm64
gh release verify "$TAILROCKS_RELEASE_TAG"
```

Expected: clean detached checkout at the sole atomic merge, exact merged-PR
readback, unchanged protected main, a physical native Darwin arm64 host, and one
complete immutable plan-018 release. Any mismatch blocks before provider or
workflow execution.

## Spec contract

### Requirement G06/G14/G15: native evidence without post-merge Git writes

The local record SHALL use the closed `codex-platform-evidence-v1` schema and
bind the atomic merge, PR, release/tag/manifest/qualification, exact file/index/
arm64-child digests, canonical `native-boundary-v1` object/SHA-256, host/client versions, lifecycle results, command exit
classes, and actual run date. Native-host identity and observations remain
`operator_attested`. `publish-goal-evidence.yml` SHALL accept only the canonical
JSON bytes plus their SHA-256, independently reverify every machine-checkable
release identity, publish exact canonical evidence to
`tailrocks-codex-platform-evidence`, and directly attest both file and OCI
subjects from protected main. Consumers use only the returned `oci://...@sha256`
URI; no tag or moving alias is authoritative.
`evidence-manifest.json` is a derived local publication receipt; it is not an
OCI payload and is never itself the published or attested OCI subject.

#### Scenario: submitted bytes or release drift

- **WHEN** submitted SHA-256, target, release identity, schema, bounds, source,
  signer, hosted-runner claim, or current main differs
- **THEN** the protected workflow publishes nothing and the operation remains
  BLOCKED.

## Must NOT

- **N06/N07**: no credential value enters JSON, CLI child, logs, or artifact.
- **N11**: no tracked write, commit, branch/tag/ref/PR/release edit, or moving OCI
  alias; only the authorized digest-addressed evidence publication is mutable.
- **N13**: evidence claims only observed native Darwin arm64 facts.
- **N16**: files, commands, output, JSON, dispatch input, time, and processes are
  bounded; oversized or unknown fields fail.
- **N19**: this external operation creates no tracked edit, commit, branch,
  tag/ref, PR, release, or later implementation attempt.

## Inputs to provide

- Exact atomic PR/merge SHA and plan-018 tag/qualification identities.
- Native macOS arm64 host and current Codex authentication in the task-only
  home of the distinct `tailrocks-native-client` principal. Values remain
  outside evidence and controller authority.
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
  purpose/schema validator, publication-manifest verifier, and static generic
  install documentation.
- Plan 018 published immutable release subjects from that same merge.
- No repository evidence file or post-release documentation edit is permitted.

## Commands you will need

```sh
gh release download "$TAILROCKS_RELEASE_TAG" --dir "$TAILROCKS_VERIFY_TMP/release"
rtk bun scripts/verify-release-artifacts.ts \
  --release-dir "$TAILROCKS_VERIFY_TMP/release" \
  --require-tag "$TAILROCKS_RELEASE_TAG"
TAILROCKS_NATIVE_BROKER="$TAILROCKS_VERIFY_TMP/release/tailrocks-native-client-broker-aarch64-apple-darwin"
TAILROCKS_NATIVE_BROKER_DIGEST="$(rtk bun scripts/release-version.ts file-sha256 --input "$TAILROCKS_NATIVE_BROKER")"
TAILROCKS_BOUNDARY_PLAN_DIR="$TAILROCKS_VERIFY_TMP/native-boundary-plan"
rtk bun scripts/install-native-client-boundary.ts render \
  --platform darwin --principal tailrocks-native-client \
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
  --target aarch64-apple-darwin \
  --tag "$TAILROCKS_RELEASE_TAG" \
  --release-dir "$TAILROCKS_VERIFY_TMP/release" \
  --output "$TAILROCKS_VERIFY_TMP/operator-evidence.json"
rtk bun scripts/native-client-sandbox.ts assert-quiescent \
  --principal tailrocks-native-client
test ! -e "$TAILROCKS_VERIFY_TMP/native-codex-home"
rtk bun scripts/verify-release-artifacts.ts validate-platform-evidence \
  --target aarch64-apple-darwin \
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
  --input 'target=aarch64-apple-darwin' \
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
  --target aarch64-apple-darwin \
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
tailrocks_cleanup_codex_macos_auth() {
  set +e
  if test -n "${TAILROCKS_GHCR_AUTH_CONFIG:-}"; then
    DOCKER_CONFIG="$TAILROCKS_GHCR_AUTH_CONFIG" rtk docker logout ghcr.io >/dev/null 2>&1
    rm -f -- "$TAILROCKS_GHCR_AUTH_CONFIG/config.json"
    rmdir -- "$TAILROCKS_GHCR_AUTH_CONFIG" 2>/dev/null || true
  fi
  unset TAILROCKS_GHCR_READ_TOKEN
}
trap tailrocks_cleanup_codex_macos_auth EXIT
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
  --target aarch64-apple-darwin \
  "$TAILROCKS_VERIFY_TMP/verified-oci/evidence.json"
tailrocks_cleanup_codex_macos_auth
trap - EXIT
```

Expected: one protected run emits `dispatch-context.json`, canonical
`evidence.json`, and `evidence-manifest.json`; the manifest names exactly one
digest-addressed `tailrocks-codex-platform-evidence` OCI subject.

## Scope

**In scope**: read-only release download/verification, bounded native lifecycle,
temporary canonical JSON, one protected evidence dispatch, exact OCI/file
attestation verification.

**Out of scope**: every tracked file, commit, branch, tag, ref, PR, release
mutation, docs/date/version change, Linux/provider claim, policy/candidate work.

## Git workflow

None. Stay detached at the atomic merge. Do not add, commit, push, create/edit a
PR, or create/delete/update any branch, tag, or ref.

## Steps

### Step 1: Verify exact released subjects and run native lifecycle

Download into the new task root; verify the immutable release and every closed
asset, release/file/OCI attestations, source/signer SHA, hosted runner, file
hashes, OCI index and arm64 child. Run clean install, version/pin, documented
upgrade/rollback behavior where a real predecessor exists, and uninstall. A
first release may record an explicitly schema-allowed `not_applicable:first_release`;
it may not fabricate upgrade success.

**Verify**: wrong/missing asset, non-native/emulated host, tag/source/signer/
child drift, ambient credential inheritance, failed lifecycle, or unsupported
upgrade claim makes the evidence validator fail before dispatch.

### Step 2: Submit only canonical operator-attested bytes

Validate the closed JSON, compute SHA-256, base64 encode it, enforce the dispatch
bound, and dispatch the exact bytes/digest to protected main. The workflow
decodes into a new task root, requires byte/digest equality, revalidates schema
and release identities, then publishes and directly attests file and OCI
subjects. It never upgrades operator observations into workflow-observed facts.

**Verify**: altered encoding/digest, unknown field, wrong target/release/main,
oversize, credential-like content, noncanonical JSON, or self-hosted signer
causes zero publication.

### Step 3: Verify immutable external closure and frozen Git

Read the exact OCI URI from the verified publication manifest. With task-private
registry auth, verify its digest, canonical evidence, direct file/OCI
attestations, workflow/source/signer SHA, source ref, and hosted runner. Remove
auth and temporary credentials. Re-read main and the atomic PR, then require the
same detached HEAD and a clean tree.

**Verify**: `gh attestation verify` uses `--repo tailrocks/tailrocks-skills`,
`--signer-workflow tailrocks/tailrocks-skills/.github/workflows/publish-goal-evidence.yml`,
`--source-ref refs/heads/main`, both `--source-digest` and `--signer-digest`
equal to the atomic merge SHA, and `--deny-self-hosted-runners`; OCI verification
runs under task-private authenticated `DOCKER_CONFIG`. Main/PR readback and
`rtk git status --porcelain=v1 --untracked-files=all` remain exact/empty.

## Test plan

- Canonical/oversized/unknown-field/credential-like submission fixtures.
- Wrong release/source/signer/runner/index/child/target and emulated-host cases.
- First-release versus real-predecessor lifecycle semantics.
- Direct file/OCI attestation and digest-only reference verification.
- Detached HEAD, atomic PR/main readback, and zero Git mutation.

## Done criteria

- [ ] Native macOS arm64 release lifecycle produced one bounded canonical record.
- [ ] Protected main revalidated and directly attested exact file/OCI bytes.
- [ ] Output is one immutable digest-addressed OCI URI; no moving alias exists.
- [ ] Main, atomic PR, detached HEAD, and clean tree remain unchanged.
- [ ] No tracked file, commit, branch/tag/ref/PR/release/docs mutation occurred.

## STOP conditions

Stop on merge/PR/main drift, attached or dirty checkout, non-native host,
incomplete/mutable release, provenance/lifecycle/schema failure, missing
approval/auth, publication/attestation mismatch, moving-only OCI reference,
credential residue, or any need for a repository mutation.

## Maintenance notes

Plan 040 consumes only this exact OCI URI and plan 039's independent Linux URI.
Static repository docs remain generic and resolve signed external closure at
use time; this operation never edits them.
