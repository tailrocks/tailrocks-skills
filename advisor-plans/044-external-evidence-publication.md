# Plan 044: Add protected publication for external evidence

> **Executor instructions**: On the shared implementation branch, add one
> protected-main workflow that validates bounded operator observations and
> publishes digest-addressed evidence OCI subjects. Do not run it or publish.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 020 and 022 have current same-branch
  completion receipts
- **Effort**: M; one session on the shared implementation branch
- **Risk**: HIGH
- **Depends on**: plans 020 and 022
- **Covers**: G06, G08, G14, G15, G16
- **Guardrails**: N01, N03, N05-N08, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-06, F4-16,
  F4-22, F4-27, F4-28, F4-41-F4-45, F4-48
- **Planned at**: design baseline `1e809bd`; same-branch recut required

## Why this matters

Native provider facts arise after the one repository merge. A later docs/evidence
commit would violate atomic delivery. This workflow turns small sanitized
operator observations into immutable, directly attested OCI evidence while
preserving the honest `operator_attested` observation label.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = '<implementation-branch>'
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = '<integration-sha>'
test "$(rtk git rev-parse origin/main)" = '<frozen-base-sha>'
test "$(rtk git merge-base HEAD '<frozen-base-sha>')" = '<frozen-base-sha>'
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = '<implementation-branch>'
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
rtk git merge-base --is-ancestor <plan-020-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-022-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/publish-goal-evidence.yml scripts/protected-workflow.ts scripts/verify-release-evidence.ts scripts/provider-conformance.ts scripts/validate-workflows.ts schemas tests/fixtures/external-evidence docs
rtk mise run verify
```

Expected: clean exact shared PR head descended from both same-branch receipts;
no second branch/PR and no live publication.

## Spec contract

### Requirement G06/G08/G14/G15/G16: immutable honest evidence after one merge

One protected-main hosted workflow SHALL accept only closed, bounded evidence
bytes or exact prior OCI references, validate subject/schema/provenance, publish
one digest-addressed OCI subject, and directly attest its file and OCI forms.
The attestation proves protected publication identity; supplied observations
remain `operator_attested`. No moving alias or repository write exists.

#### Scenario: operator report claims protected observation

- **WHEN** submitted JSON labels a native/provider observation
  `protected_verifier` or omits physical-host/auth-clean evidence
- **THEN** schema validation fails before publication.

## Must NOT

- **N01/N12/N13/N18**: operator/model assertions, attestation, digest, fan-in,
  or bounded comparisons cannot upgrade the observation or claim confidentiality.
- **N03/N05**: submitted bytes select no argv/path/workflow step; candidate code
  never runs in this publisher.
- **N06/N07/N17**: secret/credential/PR-head/self-hosted evidence cannot enter.
- **N08**: fan-in revalidates exact current subjects; no stale alias/result.
- **N11**: coding session performs no workflow dispatch/OCI/release mutation.
- **N16**: modes, bytes, JSON, refs, subjects, pages, output, retries bounded.
- **N19**: same implementation branch/PR only; no separate evidence/docs PR.

## Inputs to provide

None for implementation. Live plans later provide protected approval, exact
atomic merge/release/policy/proof identities, process-only registry auth, and
bounded sanitized evidence.

## Starting state

- Plan 020 owns provider platform/fan-in/support schemas.
- Plan 022 owns protected dispatch, authority envelopes, and run correlation.
- Static docs must discover/verify external support closure; they cannot embed
  a fact/date/digest unknowable before the one merge.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/external-evidence` | exact modes/permissions/context |
| Evidence | `rtk bun test scripts/verify-release-evidence.test.ts scripts/provider-conformance.test.ts` | canonical schemas/fan-in mutations pass |
| Repository | `rtk mise run verify` | exit 0 |

The protected helper interface implemented here is closed:

```text
protected-workflow.ts verify-evidence-publication
  --operation-dir <existing-dir> --purpose <literal> --schema <literal>
  --authority-ref refs/heads/main --authority-sha <atomic-merge-sha>
  [--input-sha256 <hex>] [--input-oci-ref <digest-ref>]...

protected-workflow.ts verify-evidence-oci
  --oci-ref <digest-ref> --purpose <literal> --schema <literal>
  --authority-ref refs/heads/main --authority-sha <atomic-merge-sha>
  --repull --output-dir <new-dir>
```

The first form requires the exact mode set: Codex platform = one SHA/no refs;
provider qualification = one SHA/three ordered refs; provider platform = one
SHA/one ref; either fan-in = no SHA/two ordered refs. The second authenticates
the registry, file attestation, OCI attestation, direct
workflow/source/signer SHA, GitHub-hosted runner, canonical annotations, and
materialized evidence before creating `evidence.json` and a validated
`evidence-manifest.json` in a new directory.

## Scope

**In scope**: `.github/workflows/publish-goal-evidence.yml`; protected dispatch
mapping; canonical external-evidence/fan-in validators, schemas, fixtures; static
evidence discovery/verification docs.

**Out of scope**: live provider/native run, OCI push, release/policy/candidate,
version, repository setting, second branch/PR.

## Git workflow

Checkpoint only on `<implementation-branch>` inside
`<implementation-pr-number>`:

```sh
rtk git commit -s -m 'ci(goal): publish external evidence safely' \
  -m 'Co-authored-by: Codex <codex@openai.com>'
```

Do not push another branch, open/merge a PR, or publish. Record the completion
SHA/plan digest/tests in the external attempt journal; Plan 043 reruns it.

## Steps

### Step 1: Close evidence ingestion and truth labels

Define literal purposes:

| Purpose | Evidence schema | Digest-only package | Closed mode inputs | Artifact |
|---|---|---|---|---|
| `codex_platform` | `codex-platform-evidence-v1` | `ghcr.io/tailrocks/tailrocks-codex-platform-evidence` | `target`, `release_tag`, `operator_evidence_sha256`, `operator_evidence_b64` | `codex_platform-evidence-operation` |
| `codex_fanin` | `codex-release-closure-v1` | `ghcr.io/tailrocks/tailrocks-codex-release-closure` | `macos_evidence_oci_ref`, `linux_evidence_oci_ref` | `codex_fanin-evidence-operation` |
| `provider_qualification` | `provider-qualification-v1` | `ghcr.io/tailrocks/tailrocks-provider-qualification` | `release_closure_oci_ref`, `policy_oci_ref`, `protected_evidence_oci_ref`, `operator_evidence_sha256`, `operator_evidence_b64` | `provider_qualification-evidence-operation` |
| `provider_platform` | `provider-platform-evidence-v1` | `ghcr.io/tailrocks/tailrocks-provider-platform-evidence` | `target`, `release_tag`, `provider_qualification_oci_ref`, `operator_evidence_sha256`, `operator_evidence_b64` | `provider_platform-evidence-operation` |
| `provider_fanin` | `provider-support-matrix-closure-v1` | `ghcr.io/tailrocks/tailrocks-provider-support-matrix` | `macos_evidence_oci_ref`, `linux_evidence_oci_ref` | `provider_fanin-evidence-operation` |

Every dispatch also has exactly `purpose`, its mapped `schema`, and helper-
injected `authority_ref=refs/heads/main`, `authority_sha`, and 128-bit
`request_nonce`. Unknown/omitted/extra input fails. Mode-specific scalar inputs
must equal the canonical evidence fields or pulled OCI subjects; purpose alone
selects package, artifact, validator, and schema.

Observation modes accept canonical base64 JSON plus SHA-256, maximum 32 KiB,
maximum 43,692 base64 characters, closed schema, release/source/target/
physical-host/client/config/isolation/date, auth-clean result, and
`trust=operator_attested`. Reject credential patterns, unknown fields, future
dates, emulation, unbounded text, stronger trust, or digest mismatch. Fan-in
modes accept exactly their named two digest OCI refs and no bytes. Qualification
accepts operator bytes only when all three named immutable prerequisites match
the sealed payload and independently verify.

**Verify**: Evidence tests mutate every field/trust/size/encoding/digest/secret/
date/host constraint and reject zero/duplicate/third fan-in input.

### Step 2: Publish only digest-addressed protected-main subjects

Workflow is `workflow_dispatch` on `main`, literal
`environment: tailrocks-protected-verifier`, GitHub-hosted, pinned actions,
direct signer, and exact permissions: `contents: read`, `packages: write`,
`id-token: write`, `attestations: write`. Closed run name/context binds purpose,
nonce, authority envelope, atomic merge SHA, and release/policy/proof inputs.
The workflow verifies Plan 022's pinned signer ID, detached envelope signature,
namespace, purpose, nonce, and closed-input digest before any registry access.

It validates submitted bytes or pulls/revalidates both exact input OCI subjects,
builds canonical closure, pushes no tag/alias, directly attests file and OCI,
repulls by digest, and emits the literal mapped artifact above. The artifact
contains exactly `dispatch-context.json`, canonical `evidence.json`, and
`evidence-manifest.json`.

The OCI subject contains the canonical evidence layer plus fixed media type and
annotations for purpose/schema/authority/payload digest and the signed request
nonce, workflow path, run ID, and run attempt known before push. It excludes
`evidence-manifest.json`; embedding the output OCI digest in that manifest would
create an impossible self-hash. Both direct attestation predicates repeat that
operation tuple. The operation
manifest is a derived receipt with closed fields:

```text
schema_version, purpose, evidence_schema, artifact_name, request_nonce,
authority_ref, authority_sha, evidence_sha256,
ordered_input_oci_refs, ordered_input_evidence_sha256,
oci_digest, oci_ref, workflow_path, source_sha, signer_sha,
run_id, run_attempt, hosted_runner, file_attestation_subject,
oci_attestation_subject
```

`oci_digest` is one full `sha256:<hex>`; `oci_ref` is exactly the mapped
`oci://ghcr.io/tailrocks/<package>@$oci_digest`. Durable verification repulls
the evidence and reconstructs a validated manifest from immutable OCI metadata
and exactly one file plus one OCI attestation whose workflow/run/attempt/nonce
tuple equals the embedded operation tuple. Nonmatching later attestations are
ignored; zero or multiple matching pairs fail. It never trusts an expired
Actions artifact. Each authorized operation therefore has one unambiguous
digest even when canonical evidence bytes repeat. Any divergent existing
subject fails.

**Verify**: Workflow fixtures reject PR/ref/self-hosted/reusable signer, broad
permission, mutable tag, unvalidated/extra input, secret, wrong purpose/schema/
package/artifact/run name, publish-before-validate, rebuild, digest drift,
self-referential manifest, unapproved entropy beyond the exact signed
nonce/workflow/run/attempt tuple, or missing repull/attestation. Fresh and
durable helper forms validate the same evidence,
purpose, authority, package, and attestation subjects.

### Step 3: Make static docs permanently truthful

Document exact commands to resolve a version's immutable release and verify a
provided digest-addressed evidence/support OCI plus signer/source/host label.
Static repository prose states support is pending/unqualified until that closure
exists; no static post-release date/row/digest is promised. Runtime/docs render
only verified closure fields and fail closed when absent.

**Verify**: Repository passes; fixtures reject moving alias, unattested/foreign
closure, static future release claim, embedded pending date, above-evidence row,
or fallback to prose/model assertion.

## Test plan

- Closed observation and exact two-subject fan-in schemas.
- Truth-label/secret/size/date/host mutations.
- Protected workflow authority, permissions, provenance, digest-only output.
- Static discovery/verification with absent/foreign/moving evidence.

## Done criteria

- [ ] Five purpose/schema/package/input/artifact mappings are literal and bounded.
- [ ] Direct attestation is separated from operator observation trust.
- [ ] Every output is digest-addressed, repulled, and has no mutable alias.
- [ ] Publication receipt is non-circular and durable OCI revalidation works
  after the Actions artifact expires.
- [ ] Static docs need no post-merge repository edit.
- [ ] One same-branch checkpoint and full tests pass; no publication/second PR.

## STOP conditions

Stop on control-plane/schema drift, evidence too large/secret, stronger trust
need, moving lookup, missing protected authority, live mutation, second branch/
PR, later docs commit requirement, or work beyond one session.

## Maintenance notes

Plans 028/039/040/023/029/041/042 consume this workflow only after Plan 043's
atomic merge. Their outputs never alter Git.
