# Plan 035: Add released-policy bootstrap verification

> **Executor instructions**: In one session, implement the base-owned released
> subject validator, policy schema, and bootstrap workflow. Do not dispatch it
> or add candidate verification.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 022 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 022
- **Covers**: G08, G14, G15
- **Guardrails**: N05-N08, N11, N13, N16-N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-24,
  F4-27, F4-37-F4-39, F4-44, F4-48
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Protected candidate verification needs a released verifier/policy adopted by
base authority. The workflow itself must verify immutable release/asset bytes
before publishing policy; an operator's later local check cannot repair an
unverified adoption.

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
rtk git merge-base --is-ancestor <plan-022-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/bootstrap-protected-verifier.yml scripts/verify-protected-policy.ts scripts/verify-protected-policy.test.ts scripts/validate-workflows.ts tests/fixtures/protected-policy schemas docs/deterministic-goal-distribution.md
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/protected-control-plane
rtk mise run verify-kernel
```

Expected: exact clean control-plane descendant; release workflows unchanged.

## Spec contract

### Requirement G08/G14/G15: base-owned adoption of exact released verifier

One protected hosted workflow SHALL verify an immutable release/tag/assets,
qualification closure, direct provenance, OCI index/children, and no-candidate
canaries before publishing/attesting canonical policy. Policy SHALL bind exact
verifier/profile/schema/caps/oracle semantics and remain private unless a later
explicit visibility policy says otherwise.

#### Scenario: qualification asset omitted

- **WHEN** any closed release asset is absent, mutable, or fails release/provenance
  verification
- **THEN** policy publication never starts.

## Must NOT

- **N05/N17**: no candidate code or same-user secret-dependent claim.
- **N06/N07**: only protected hosted token reads/publishes; no PR/operator token
  enters evidence.
- **N08/N13**: tag/hash/prior qualification alone cannot adopt policy.
- **N11**: coding plan dispatches/publishes nothing.
- **N16**: release assets, OCI subjects, policy fields/caps/output bounded.
- **N18**: policy says `integrity_only`, `confidentiality=false`, bounded queries.

## Inputs to provide

- None for implementation. Plan 019 later supplies exact released identities
  and protected approval.

## Starting state

- Plan 022 supplies correlation/authority helpers and environment schema.
- Plan 034 supplies qualification/recovery profiles.
- No protected workflow currently adopts released verifier bytes.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Policy | `rtk bun test scripts/verify-protected-policy.test.ts` | schema/materialization/compatibility fixtures pass |
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/protected-policy` | bootstrap workflow exact |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/bootstrap-protected-verifier.yml`
- protected policy schema/validator/materialization/compatibility APIs
- workflow/policy fixtures and docs

**Out of scope**:

- Candidate materialization/workflow/evidence.
- Live dispatch, release/tag/asset/package/policy mutation.
- Release workflow/environment/control-plane semantics.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `ci(goal): add protected policy bootstrap`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Define canonical policy and safe materialization

Implement validator for canonical `policy-v1.json` binding release tag/source,
release workflow/source/signer, qualification digest, native hashes, verifier
OCI URI/index/children, schema ranges, exact runtime profile/resource caps,
trusted comparator owner, `oracle_visibility=integrity_only`, cumulative query
cap, and `confidentiality=false`. Unknown/missing fields fail.

Implement these exact closed interfaces:

```text
verify-protected-policy --bundle <policy-file> --manifest <manifest-file>
verify-protected-policy --oci-ref <digest-ref> [--output <new-file>]
verify-protected-policy print-field --manifest <manifest-file>
  --field <allowlisted-scalar>
verify-protected-policy check-release-compatibility
  --policy-oci-ref <digest-ref>
  --protected-evidence-oci-ref <digest-ref>
  --release-manifest <file>
  --require-identical <closed-comma-separated-fields> --output <new-json>
verify-protected-policy verify-compatibility --record <json>
  --policy-oci-ref <digest-ref>
  --protected-evidence-oci-ref <digest-ref> --release-manifest <file>
```

The local form proves bundle/manifest hash and schema closure. The OCI form
requires task-scoped authenticated registry access, verifies direct bootstrap
workflow/protected source/signer/hosted provenance, bounds bytes, and, when
requested, atomically writes a new regular canonical file. It rejects output
collisions/symlinks/ambient auth. `print-field` exposes only literal scalars.
Compatibility JSON binds policy/proof/release URI+digest, schemas, and every
compared semantic field/value; both modes re-read the exact subjects.

**Verify**: Every listed form/flag is fixture-tested. Mutations cover each
identity/profile/cap/oracle field, auth path, provenance claim, local manifest,
output collision, size, compatibility field/value, and swapped subject.

### Step 2: Add the base-owned bootstrap workflow

Workflow inputs are exact authority SHA/nonce/envelope bytes+digest, pinned
signer ID and detached signature required by Plan 022, release
tag, and digest-addressed Plan-040 Codex release-closure OCI ref plus its
canonical manifest SHA-256. It uses literal
`environment: tailrocks-protected-verifier`, main-only dispatch, hosted runner,
direct signer, pinned actions, and exact permissions `contents: read`,
`packages: write`, `id-token: write`, `attestations: write`.

Before policy publication it requires immutable releases enabled; resolves tag
to source; runs `gh release verify`; downloads the exact Codex profile (recovery
JSON, two binaries, release manifest/context/evidence/qualification/notes); runs
`gh release verify-asset` for every asset; recovers/validates closure; verifies
binary/index/children attestations; then pulls the exact Codex closure OCI,
verifies direct `publish-goal-evidence.yml` protected-main signer/source/hosted
provenance, exact macOS+Linux subjects/trust labels, and the supplied canonical
manifest digest. Only then run pinned image no-candidate canaries.

Only then publish exact policy file/OCI subject to
`tailrocks-verifier-policy`, directly attest both, and emit literal
`protected-policy-operation` containing dispatch context, policy, manifest, and
all input identities. Candidate/PR bytes are absent.

The OCI subject contains canonical `policy-v1.json` and fixed annotations,
including the signed request nonce, workflow path, run ID, and run attempt known
before push, but not the derived `policy-manifest.json` that records its output
`oci_digest`/`oci_ref`. The operation artifact carries that receipt; OCI
and file/OCI attestation predicates repeat the same tuple. Verification
re-derives its fields and requires exactly one file/OCI attestation
pair whose operation tuple matches the embedded tuple. Nonmatching later
attestations do not make reconstruction ambiguous; multiple matching pairs fail.
Embedding the receipt in the subject would be a forbidden circular hash.

**Verify**: Workflow fixtures reject any omitted/reordered release/closure
check, mutable/extra asset, wrong tag/source/signer/runner/digest/target/trust,
candidate input, broader permission, unpinned action, publication before
verification, self-referential manifest, or wrong artifact/run-name.

## Test plan

- Policy schema/profile/caps/oracle and safe OCI materialization.
- Exact immutable release asset/qualification/provenance plus two-native-target
  Codex closure.
- No-candidate image canaries before policy publication.
- Direct signer/hosted runner/least permissions/environment/main authority.
- Compatibility record every-field binding.

## Done criteria

- [ ] Policy validator/materializer is closed, bounded, and provenance-aware.
- [ ] Workflow verifies every immutable release asset before publication.
- [ ] Policy binds exact image/children/profile/caps and honest oracle semantics.
- [ ] Candidate bytes cannot enter bootstrap.
- [ ] No live dispatch/publication or candidate workflow exists.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on control-plane/release profile drift, incomplete release verification,
ambient auth, unbounded materialization, candidate input, broader permission,
live external mutation, or work beyond one session.

## Maintenance notes

Plan 019 performs the attended bootstrap after platform release evidence closes.
Plan 036 consumes the exact policy API for candidate-as-data proof.
