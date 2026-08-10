# Plan 009: Build the release-candidate artifact lane

> **Executor instructions**: In one session, implement only the protected
> `release_candidate` lane: deterministic native binaries, multi-arch verifier,
> complete provenance, and install/image lifecycle. Do not add package bootstrap,
> qualification/recovery, protected policy, or publish a release.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 027 and 045 have current same-branch
  completion receipts at one integration head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plans 027 and 045
- **Covers**: G06, G08, G14, G15
- **Guardrails**: N05-N08, N11, N13, N16, N17
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-06, F4-16,
  F4-22, F4-24, F4-27, F4-28, F4-37, F4-50
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

PR binaries and mutable image tags cannot become protected or released truth.
This slice makes one protected-default build lane whose exact files, index, and
platform children can be installed and verified without rebuild.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = "<integration-sha>"
test "$(rtk git rev-parse origin/main)" = "<frozen-base-sha>"
test "$(rtk git merge-base HEAD "<frozen-base-sha>")" = "<frozen-base-sha>"
rtk git merge-base --is-ancestor <plan-027-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-045-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/release-artifacts.yml scripts tests integrations/codex docs/deterministic-goal-distribution.md Cargo.toml Cargo.lock
rtk mise run verify-kernel
rtk mise run eval-all-replay
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/release-candidate-workflow
```

Expected: exact clean plan-027/045 fan-in, full offline gate, and reviewed
release/native-boundary scope. GHCR package creation/visibility is not exercised here;
plan 033 adds those modes and plan 030 performs the attended bootstrap.

## Spec contract

### Requirement G06/G08/G14/G15: immutable installable release subjects

A protected-default hosted workflow SHALL build raw
`aarch64-apple-darwin` and `x86_64-unknown-linux-musl` CLI binaries plus a
multi-arch OCI index with exact `linux/arm64` and `linux/amd64` children. Every
subject SHALL carry complete direct-workflow provenance and a closed manifest.
Install, upgrade, rollback, uninstall, digest pull, platform selection, and
repull SHALL preserve exact identity.

#### Scenario: mutable OCI tag

- **WHEN** runtime configuration names a tag, omits the index, or omits the
  selected child digest
- **THEN** preflight rejects it before worker creation.

#### Scenario: PR-built attestation

- **WHEN** a feature workflow exercises the lane
- **THEN** record `origin=pr_head` and `trust=pr_head_self_checked`; it cannot
  enter protected policy or release evidence.

## Must NOT

- **N05/N17**: candidate code never runs on host or sees registry/operator
  credentials; worker gets no network/socket/auth.
- **N06/N07**: only protected-default hosted workflow tokens sign/push; PR
  output stays self-checked.
- **N08/N13**: every final subject/digest is reverified; tag/hash alone is not
  semantic qualification.
- **N11**: no version tag, Git tag, GitHub Release, policy, or support claim.
- **N16**: actions, tools, subjects, children, paths, files, output, and registry
  operations are closed/bounded.

## Inputs to provide

- Exact protected source SHA when testing the workflow after merge.
- Process-only registry credentials only for fixture-registry/live protected
  operations; never repository/evidence/candidate input.

## Starting state

- Plan 027 provides honest credential-free PR self-check CI.
- Plan 045 provides the root-owned account/broker/UID-lease base protocol.
- No authenticated immutable OCI lifecycle or complete native artifact manifest
  exists.
- Plans 033/034 extend the same workflow with separately reviewed modes.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Binary | `rtk bun test scripts/verify-release-artifacts.test.ts` | exit 0 |
| OCI | `rtk bun test scripts/verify-oci-artifacts.test.ts scripts/oci-release.test.ts` | exit 0 |
| Native boundary | `rtk bun test scripts/native-client-sandbox.test.ts --test-name-pattern 'codex platform'` | distinct-principal mode exact |
| Installer | `rtk bun test scripts/install-tailrocks.test.ts` | exit 0 |
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/release-candidate-workflow` | release-candidate schema/permissions exact |
| Repository | `rtk mise run verify-kernel && rtk mise run eval-all-replay` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/release-artifacts.yml` with only `release_candidate`
- `scripts/verify-release-artifacts.ts`, `verify-oci-artifacts.ts`,
  `oci-release.ts`, Plan 045's `native-client-sandbox.ts` Codex-platform mode,
  installer and their fixtures
- deterministic CLI, Plan-045 broker, and image build inputs; manifest schemas;
  Codex installer/hook/image preflight assets; distribution design docs

**Out of scope**:

- `package_preflight`, `package_visibility_verify`, `release_finalize`.
- Qualification evidence/recovery bundle/publication state.
- Version bump/tag/release, policy/protected candidate/provider matrix.
- Reusable signer, self-hosted/emulated target, mutable runtime image tag.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `build(goal): add release candidate artifacts`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Build deterministic native, broker, and OCI subjects

Pin actions, base images, Buildx/builder, Rust/toolchain, and installer inputs by
full commit/digest. Use GitHub-hosted native runners and literal
`environment: tailrocks-protected-verifier`. Log in to GHCR only with
`${{ github.token }}`/`${{ github.actor }}` and require
`org.opencontainers.image.source=https://github.com/tailrocks/tailrocks-skills`.
The lane requires an already-public/source-linked verifier package, pushes one
unique request candidate tag, records the returned full index and two child
digests, and never treats the tag as subject identity.

Use distinct forms:

```text
OCI_ATTESTATION_SUBJECT=oci://ghcr.io/tailrocks/tailrocks-verifier@sha256:<hex>
OCI_IMAGE_REF=ghcr.io/tailrocks/tailrocks-verifier@sha256:<hex>
```

Build two CLI files plus matching `tailrocks-native-client-broker` files for
`aarch64-apple-darwin` and `x86_64-unknown-linux-musl` from Plan 045's exact
source. The broker files are standalone fixed-protocol executables; they are
not embedded, locally rebuilt, or fetched from another release. The closed
manifest binds version, purpose=`release_candidate`, source/workflow SHAs, all
four native target/file hashes and roles, OCI URI/index/children, schemas,
toolchain, build identities, `released=false`, and dispatch context. Reject
self-hosted or emulated subjects.

**Verify**: Binary/OCI/Workflow commands reject nondeterminism, floating pin,
wrong token/source link, private package, tag-only identity, missing child,
missing/swapped broker role, wrong platform, unexpected output, or broad
permissions.

### Step 2: Require full provenance and safe registry helpers

Direct top-level workflow attests every CLI, broker, index, and child.
Verification always
supplies repository, signer workflow, protected source ref, source SHA,
`job_workflow_sha` signer SHA, and deny-self-hosted; source and signer must equal
the exact authority SHA. Workflow permissions are exactly:

```yaml
permissions:
  contents: read
  packages: write
  id-token: write
  attestations: write
```

Implement closed OCI `inspect`, `verify`, `promote`, and `repull`. `promote`
copies exact manifest bytes to a version tag without rebuild and then checks
index/children unchanged; wrong/concurrent tag blocks. Implement
`require-registry-auth`, `require-no-registry-auth`, and
`require-child-env-clean`; all accept explicit task configs, reject ambient
credentials, never print values, and prove installed children cannot inherit
token/config paths. `require-registry-auth --config <dir> --repository
<host/path> --require-action <pull|push>` repeats bounded flags, follows the
registry Bearer challenge without uploading, and requires the issued token's
closed repository access claim to contain every requested action. Unknown or
broader repository/scope fails.

Extend Plan 045's fixed native-client launcher with one Codex-platform mode and
no caller-selected argv:

```text
native-client-sandbox.ts run-codex-platform --principal tailrocks-native-client
  --task-home <new-0700-dir> --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --target <closed-target> --tag <vX.Y.Z> --release-dir <verified-dir>
  --output <new-json>
native-client-sandbox.ts assert-quiescent --principal tailrocks-native-client
```

The launcher requires Plan 045's canonical `native-boundary-v1` live receipt,
including exact root-owned broker/account/policy identities, and a client UID
distinct from controller UID. It revalidates that receipt under the lease before
auth exposure and seals its canonical SHA-256 into output evidence. The broker atomically takes
the UID-wide system lock, proves no process/session/job/persistence/run dir,
then creates/populates the task home and exposes credentials; it holds the lock
through credential deletion, process-group/UID-wide reap, output validation and
copy-back, task-home/ACL cleanup, and final zero-process/job/dir proof. The
account has no sudo/Docker/admin group; GH/Git configuration and environment are
empty/allowlisted. Kernel probes must deny controller home, signing key, parent
environment, Git/GH stores/helpers, and SSH/GPG/agent/Docker sockets. Release
inputs are read-only and only the named output is copied back. Same UID, absent/
mutable broker, pre-existing/concurrent process, lock/ACL/persistence drift,
ambient `GH_TOKEN`/`GITHUB_TOKEN`/`CR_PAT`, inherited config/socket, unknown env,
missing/stale/mismatched boundary receipt, or unavailable enforcement fails
before auth exposure.

The manifest exposes a closed target-to-broker digest/file mapping consumed by
Plan 045's renderer. Install and `verify-live` accept only a broker file whose
direct attestation, source/signer workflow SHA, target, role, and SHA-256 match
that mapping.

**Verify**: provenance fixtures mutate each identity/runner/role claim; registry
fixtures cover auth absence, pull-only versus pull+push, cross-repository target,
concurrent tag, partial promotion, credential helper residue, and hostile child
environment.

### Step 3: Prove install and image lifecycle

Clean-install into an empty explicit prefix; verify mode, PATH resolution,
version, digest, provenance, hook/image preflight, and offline tracer. Upgrade
atomically from prior release; failed upgrade leaves prior binary usable.
Uninstall removes only managed files and preserves user data. Reject shadowing,
duplicates, partial install, wrong target/version/digest.

For OCI, authenticate only controller lookup, prove anonymous digest pull with
a separate empty config, pull index before worker creation, validate child, and
run `--pull never` under the fixed verifier profile. Remove/repull and repeat
benign/hostile canaries. Add closed `--release-dir` and
`verify-documented-installs` APIs for later post-release platform plans.

Implement and mutation-test this exact downstream evidence surface here:

```text
validate-platform-evidence --target <closed-target> <canonical-json>
run-platform-evidence --target <closed-target> --tag <vX.Y.Z>
  --release-dir <verified-release-dir> --client-principal tailrocks-native-client
  --client-task-home <new-0700-dir> --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --output <new-json>
fan-in-platform-evidence --input <json> --input <json>
  --require-tag <vX.Y.Z> --output <new-json>
verify-documented-installs --evidence <fan-in-json>
  --docs <closed-comma-separated-paths>
```

`run-platform-evidence` delegates its installed/Codex portion only through
`native-client-sandbox.ts run-codex-platform`, never as the controller UID. It
performs the target-native documented install/image lifecycle against the exact
verified release directory and emits, but does not validate by self-assertion,
one canonical operator record. Tests prove UID/ACL/home/parent-env/credential-
socket denial and post-run quiescence, not merely environment-variable removal.
Each platform record binds the canonical `native-boundary-v1` receipt SHA-256,
release tag/authority, immutable-release result,
release/profile/qualification/index/selected-child identities, native physical
host/target, install lifecycle, Codex version/tier, auth-clean result, run date,
and canonical digest. Fan-in accepts exactly one macOS arm64 and one Linux
x86_64 record with distinct non-emulated hosts and byte-equal shared fields.
Docs mode validates only claims derivable from that fan-in record.

**Verify**: Installer/OCI fixtures reject residue, rollback damage, PATH attack,
mutable tag, wrong child, auth inheritance, network, canary drift, and repull
identity change.

## Test plan

- Native deterministic artifacts and closed manifest/schema.
- Six provenance constraints for files/index/children.
- Public digest versus authenticated OCI attestation separation.
- Install/upgrade/rollback/uninstall/PATH lifecycle.
- Index/child resolution, fixed worker profile, promote/repull identity.
- Platform-evidence canonicalization, exact two-target fan-in, and
  evidence-derived documentation mutations.
- Closed permissions, no PR/protected trust confusion, bounded outputs.

## Done criteria

- [ ] Two CLI files, two platform broker files, and one two-child index are
  exact and directly attested.
- [ ] Release manifest/context and every provenance field are closed.
- [ ] Installer and image lifecycle/rollback/repull fixtures pass.
- [ ] Controller-only auth and hostile child-env tests pass.
- [ ] Later platform validate/fan-in/docs APIs are implemented and closed.
- [ ] No package bootstrap, qualification, release, policy, or support claim.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on missing deterministic target, public/source-link prerequisite drift,
floating identity, broader workflow permission, self-hosted/emulated output,
credential exposure, mutable runtime tag, rebuild during promote, external
publication, scope drift, or work beyond one session.

## Maintenance notes

Plan 033 adds package bootstrap modes without changing this lane. Plan 034 adds
qualification/recovery/finalization contracts. Only plans 018/023 publish.
