# Plan 034: Add qualification and recoverable release finalization

> **Executor instructions**: In one session, add the sole Codex-release
> qualification profile, external provider-publication sealing, publication
> state machine, durable recovery JSON, and no-build `release_finalize` mode.
> Do not build/package anew or publish anything.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 033 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 033
- **Covers**: G06, G08, G14-G16
- **Guardrails**: N03, N05-N08, N11, N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-16, F4-22, F4-24,
  F4-27, F4-37, F4-41-F4-45, F4-47, F4-50
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Native Codex evidence is created after the release manifest, and attended
publication can fail after a tag/draft/asset mutation. A closed sibling
qualification plus first-write durable recovery artifact prevents both forward
hashing fiction and unrecoverable half-releases. Provider qualification is a
later external evidence subject against this same release, never another
release profile.

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
rtk git merge-base --is-ancestor <plan-033-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/release-artifacts.yml scripts/release-version.ts scripts/verify-release-artifacts.ts scripts/provider-conformance.ts scripts/native-client-sandbox.ts scripts/validate-workflows.ts tests/fixtures/release-recovery tests/fixtures/native-client-sandbox schemas docs/deterministic-goal-distribution.md
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/package-bootstrap
rtk mise run verify-kernel
```

Expected: exact clean plan-033 descendant; release/package lanes stay green;
only qualification/recovery/finalization scope changed.

## Spec contract

### Requirement G06/G08/G14-G16: one-release qualification and resumable publish

Codex qualification SHALL bind the earlier release manifest plus later
evidence, dispatch context, and notes without asking the earlier manifest to
predict a future digest. External provider-publication sealing SHALL bind the
already-published release, policy, and protected proof without creating a
release asset. Publication state SHALL fail closed yet resume exact tag/empty-
draft/recovery/draft/published states. A fresh protected no-build finalization
approval SHALL be required after envelope expiry.

#### Scenario: upload returns a starter asset

- **WHEN** GitHub leaves a draft asset in `state=starter`
- **THEN** only its exact REST asset ID may be deleted/reuploaded from the
  durable closure; uploaded or published bytes are immutable to the helper.

#### Scenario: original approval expired

- **WHEN** a later session recovers a valid draft
- **THEN** historical context proves original provenance, while a new
  `release_finalize` approval authorizes current mutation.

#### Scenario: a release writer replaces draft recovery bytes

- **WHEN** downloaded recovery JSON does not carry a valid domain-separated
  operator signature over its complete canonical generation subject
- **THEN** recovery/finalization fails before any asset, OCI, or release mutation;
  self-digests and draft-writer authority are insufficient.

## Must NOT

- **N03/N05**: caller data cannot choose Git/GH/registry/container argv; no
  candidate host code.
- **N06/N07/N17**: no secret in bundles/evidence/worker; protected mode remains
  base-owned and hosted.
- **N08/N13**: asset names/hash/history alone cannot replace full recovered
  closure and current authority.
- **N11**: implementation/tests make no tag/release/registry mutation outside
  fixture servers.
- **N16**: states, profiles, names, files, bytes, API pages, and retries bounded.
- **N18**: provider evidence stays integrity-only/operator-attested where exact.
- **N19**: only one Codex software-release profile exists; provider evidence has
  no version/tag/release/recovery path and requires no later repository PR.

## Inputs to provide

- None beyond local fixture services. Software-release authorization belongs
  only to plan 018; plan 023 later uses the external publication schema.
- Fixture Ed25519 signer keys prove the interface. Plan 022 later pins the live
  public signer; no private key is committed or used by implementation tests.

## Starting state

- Plans 009/033 own build and package-bootstrap lanes.
- No owner currently implements Codex qualification sealing, release-state
  recovery, or provider external-publication harness.
- One-shot release mutation can wedge after transient failure.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Qualification | `rtk bun test scripts/verify-release-artifacts.test.ts scripts/provider-conformance.test.ts` | Codex release/external provider forms exact |
| Native boundary | `rtk bun test scripts/native-client-sandbox.test.ts --test-name-pattern 'release mode'` | fixed Codex/provider modes exact |
| State | `rtk bun test scripts/release-version.test.ts` | all remote states/failures exact |
| Recovery | `rtk bun scripts/release-version.ts test-recovery --fixtures tests/fixtures/release-recovery` | canonical round trip and starter repair |
| Finalize | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/release-finalization` | no-build/no-publish lane exact |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- Codex `seal-qualification`/`verify-qualification` schema/tests
- Codex/provider `run-release`/`validate-release` plus provider
  `seal-publication` external-evidence mode
- fixed `native-client-sandbox.ts run-codex-release` and
  `run-provider-release` modes through Plan 045's closed extension registry
- `release-version.ts` current/print/digest/inspect/recovery/draft helpers
- `release_finalize` workflow mode/artifact/fixtures
- publication/recovery docs

**Out of scope**:

- Artifact/package build semantics, visibility operation, installer behavior.
- Actual tag/draft/asset/OCI/release mutation, version bump, policy activation.
- Grok/Claude support verdict or final published matrix docs.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): add release recovery closure`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Seal the one release profile and external provider submission

Implement Codex-only `seal-qualification` and `verify-qualification`. They bind exact
release-manifest SHA, evidence SHA, canonical `native-boundary-v1` bytes and
SHA-256, `dispatch-context.json`,
`release-notes.md`, qualification schema/profile, and their own canonical
digest. They reject provider/policy/protected-evidence fields.

Implement provider-conformance `run-release` and `validate-release` for Codex or
as a controller-only fan-in over the exact pending provider matrix. It records installed subject identities,
provider version/origin/config/host boundary, sanitized canonical
`native-boundary-v1` object and receipt SHA-256, lifecycle decisions/receipt,
sanitized failures, and one terminal tier. Every native client runs only through
Plan 045's fixed distinct-principal broker and extension registry: Codex uses
the named `run-codex-release` mode; other closed providers use the named
`run-provider-release` mode. This plan may add those two modes but may not alter
or bypass Plan 045's base lease, account, broker, policy, or cleanup logic. Require
kernel-enforced UID/ACL/controller-home/parent-environment/GitHub-Git-agent-
socket denial, the root-owned UID lease before task-home/auth creation,
pre/post zero-process/persistence proof, provider-only task-home auth, and
broker cleanup before the controller regains signing authority. Add
`seal-publication` for canonical
`provider-qualification-v1` operator bytes binding the immutable release
manifest, Codex release-closure OCI, policy OCI, protected-evidence OCI, atomic
authority SHA, evidence digest, and `trust=operator_attested`; it creates no
release profile/asset/state. Unknown/missing fields block.

The added release mode is exact and accepts no free-form child command:

```text
provider-conformance.ts run-release
  --provider codex --release-manifest <verified-json>
  --client-principal tailrocks-native-client --client-task-home <new-0700-dir>
  --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --output <new-json>
provider-conformance.ts run-release
  --provider-matrix <closed-json> --release-manifest <verified-json>
  --policy-oci-ref <digest-ref> --protected-evidence-oci-ref <digest-ref>
  --require-existing-release --client-principal tailrocks-native-client
  --client-task-root <new-controller-only-dir>
  --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --output <new-json>
native-client-sandbox.ts run-codex-release
  --principal tailrocks-native-client --task-home <new-0700-dir>
  --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --release-manifest <verified-json> --output <new-json>
native-client-sandbox.ts run-provider-release
  --provider <one-closed-provider> --principal tailrocks-native-client
  --task-home <new-provider-only-0700-dir>
  --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --release-manifest <verified-json>
  --policy-oci-ref <digest-ref> --protected-evidence-oci-ref <digest-ref>
  --require-existing-release --output <new-json>
```

The broker revalidates the receipt and exact live broker/account/policy state
while holding the UID lease and before task-home/auth creation. Qualification
and provider-publication schemas seal the receipt SHA-256; a changed, stale,
missing, or self-reported boundary cannot be substituted.

For matrix mode, the controller validates and enumerates the closed unique
provider IDs, then invokes `run-provider-release` exactly once per provider.
Each invocation receives a fresh absent task home containing only that
provider's credential. The broker deletes that credential, reaps the UID,
removes home/ACL state, proves quiescence, and releases the lease before the
controller may start the next provider. Only sanitized per-provider outputs are
aggregated. No broker mode accepts a provider matrix or sibling credential set.

**Verify**: Qualification command rejects omitted/swapped context/notes,
provider field in the Codex profile, stale subject, future-digest claim,
unbounded evidence, missing/mismatched boundary receipt, duplicate provider,
sibling credential/home visibility, missing inter-provider quiescence, provider result above
observations, or an external
submission missing/swapping release/closure/policy/proof authority.

### Step 2: Implement the fail-closed publication state machine

`current --format plain`, `print-field`, and `file-sha256` have closed scalar
output. `file-sha256` emits exactly 64 lowercase hexadecimal characters with
no `sha256:` prefix; OCI digest fields always include that prefix.
`inspect-publication --repo --remote --tag --authority-sha --profile
--output` uses bounded exact tag/release/asset/OCI queries and emits only:

```text
EMPTY
TAG_ONLY
DRAFT_EMPTY
DRAFT_RECOVERABLE
DRAFT_COMPLETE
PUBLISHED_PENDING_VERIFY
CONFLICT (nonzero)
```

The only profile is literal `codex`. It contains
`release-recovery-v1.json`, two native CLI binaries, two matching Plan-045
broker binaries, release manifest, dispatch context, qualification manifest,
release notes, `native-boundary-v1.json`, and `codex-qualification.json`. Provider evidence is never a
release asset. The manifest fixes every CLI/broker filename, target, role,
digest, and direct attestation identity.
For every state containing recovery bytes, inspection uses the fixed repository
`config/protected-authority-signers` and the profile's closed signer ID/
namespace; the caller cannot substitute an allowlist.

Exact tag target is mandatory. Draft-empty has no uploaded asset. Recoverable
draft has one canonically signed, pinned-operator recovery JSON plus an exact
subset; no other asset may precede it. Published state requires complete names
and immutable non-draft release.
Once recovery exists, title equals tag, target equals authority, prerelease is
false, and body bytes equal sealed notes. Operational/API ambiguity fails.

REST `state=starter` counts missing. Starter recovery is permitted only with no
uploaded asset; starter later asset only beside uploaded recovery. All other
states conflict.

**Verify**: State fixtures cover exact 404, every operational failure, wrong
tag/target/title/body/prerelease/immutability, unexpected/missing/duplicate/
starter assets, OCI without Git tag, wrong OCI digest, pagination, and races.

### Step 3: Make the first completed asset a full recovery closure

`seal-release-recovery` emits canonical `release-recovery-v1.json`: fixed key/
name order, base64 bytes, SHA-256, and size for every profile asset except
itself. It requires `--signer-id`, `--signing-key`, and `--allowed-signers`,
constructs a domain-separated `tailrocks-release-recovery-v1` generation
subject binding repository, atomic SHA, version/tag/profile, sealed-manifest
digest, and every ordered asset name/hash/size, signs it, verifies the signature
against the pinned public key, then embeds subject/signature/signer ID. No links/
devices/duplicates/unknown names. `recover-release` requires
`--allowed-signers` and `--require-signer-id`, verifies canonical bytes and the
signature before trusting any embedded asset, then validates all closure/
provenance/qualification/attestation fields before materializing regular files
into a new dir. A release writer cannot mint a second valid generation.

`upload-recovery-bundle` accepts only DRAFT_EMPTY; with explicit
`--repair-starter-assets`, it may delete only the exact still-starter REST ID,
then uploads recovery first. `reconcile-draft-assets` is read-only unless
`--upload-missing`; optional starter repair has the same exact-ID restriction.
No uploaded/published overwrite/delete/clobber path exists.

**Verify**: Recovery fixtures cover deterministic bytes, hostile names/base64/
sizes, wrong inner digest/profile/context/notes, missing/unknown/wrong signer,
signature/namespace/subject mutation, release-writer replacement, crash before/
during/after each asset, starter repair, concurrent replacement, and complete
redownload.

### Step 4: Add fresh no-build finalization approval

Add workflow purpose `release_finalize`, conditional exact
`recovery_bundle_digest`, literal artifact `release-finalization`, and same
run-name/envelope/least-permission rules. It builds/pushes/signs/publishes
nothing; it fetches exact existing tag/draft recovery bytes, validates closure
and authority, then emits fresh dispatch context/validation. Other modes reject
the input; finalization rejects build/package steps.

Historical context is valid only at its recorded run time. Live mutation also
requires this new unexpired context and unchanged stable authority-state digest.

**Verify**: Finalize fixtures reject expired current approval, wrong draft/tag/
bundle/state, build/push/sign/publish step, cross-purpose input/artifact, broader
permission, and authority drift.

## Test plan

- Codex release qualification; per-provider credential-isolated execution;
  external provider-submission mutations.
- Closed remote state/metadata/API error and race matrix.
- Canonical recovery JSON, hostile extraction/materialization, crash/starter
  recovery, no uploaded-byte clobber.
- Fresh finalization approval and historical-context semantics.
- Existing release/package lanes remain byte/fixture compatible.

## Done criteria

- [ ] The sole Codex qualification binds context/notes; provider submission
  binds the existing release/closure/policy/proof without release state.
- [ ] Every remote state is exact, resumable, or conflict; no fail-open 404.
- [ ] First completed draft asset reconstructs the original full generation.
- [ ] Starter repair can affect only an exact incomplete draft asset.
- [ ] Fresh finalization approval builds/publishes nothing.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on release/package lane drift, mutable/unbounded profile, noncanonical
bundle, uploaded-byte deletion need, unknown remote state, fail-open API,
finalize build/publish behavior, external mutation, or work beyond one session.

## Maintenance notes

Plan 022 consumes all four exact purpose/artifact schemas. Plans 017/018 consume
the one recovery profile. Plan 023 consumes only the external provider-
publication API and cannot implement alternate release logic.
