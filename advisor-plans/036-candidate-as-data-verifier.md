# Plan 036: Add candidate-as-data protected verification

> **Executor instructions**: In one session, implement candidate materialization,
> fixed local canary launcher, proof-closure validator, and protected candidate
> workflow. Do not dispatch it or create a canary PR.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 035 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 035
- **Covers**: G08, G14, G15
- **Guardrails**: N01, N03-N08, N11, N13-N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-02, F4-16,
  F4-19, F4-20, F4-27-F4-29, F4-48
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

A protected workflow is trustworthy only if PR workflow/helper bytes remain
inert data and candidate code runs exclusively in the released verifier. Raw
Git materialization, fixed launcher, and durable proof closure are one vertical
seam.

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
rtk git merge-base --is-ancestor <plan-035-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/protected-candidate-verify.yml scripts/protected-workflow.ts scripts/verify-protected-evidence.ts tests/fixtures/protected-candidate schemas docs/deterministic-goal-distribution.md
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/protected-policy
rtk mise run verify-kernel
```

Expected: exact clean policy-bootstrap descendant; policy workflow/validator
unchanged; candidate-only scope reviewed.

## Spec contract

### Requirement G08/G14/G15: base-owned exact candidate proof closure

Protected main SHALL acquire one full candidate SHA as raw Git objects, validate
and materialize it without candidate-controlled Git behavior, run candidate
processes only in policy-pinned OCI, compare outside the worker, and publish a
directly attested evidence OCI closure reconstructing evidence and exact
candidate tree independently of Actions/ref retention.

#### Scenario: candidate replaces workflow/helper

- **WHEN** candidate tree contains valid modified authority paths
- **THEN** those bytes remain inert; only default workflow/helper executes and
  candidate sentinels appear only inside isolated evidence.

## Must NOT

- **N01/N08**: PR status/transcript/old receipt cannot PASS.
- **N03-N05**: candidate cannot select Git/container/verifier argv and never
  executes on host.
- **N06/N07/N17**: candidate sees no token/policy secret/socket/host path;
  protected signer is base-owned hosted workflow.
- **N11**: coding plan dispatches, applies, merges, publishes, or cleans no PR.
- **N13-N15**: no moving ref/archive extraction/shared cache/future reachability.
- **N16**: Git objects/tree/files/bytes/process/resources/output/evidence bounded.
- **N18**: expected bytes unmounted; black-box result is integrity-only with one
  cumulative query and no secrecy claim.

## Inputs to provide

- None for implementation. Plans 024/021 later provide exact policy/candidate
  identities and protected approval.

## Starting state

- Plan 035 provides policy materialization/bootstrap implementation; live policy
  exists only after atomic merge and release.
- Plan 022 provides control-plane dispatch/context/authority.
- No base-owned candidate materializer/workflow/proof validator exists.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Git/materializer | `rtk bun test scripts/protected-workflow.test.ts --filter candidate` | hostile Git/path fixtures pass |
| Evidence | `rtk bun test scripts/verify-protected-evidence.test.ts` | full closure/provenance fixtures pass |
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/protected-candidate` | candidate workflow exact |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/protected-candidate-verify.yml`
- base-owned candidate Git/materializer/canary launcher helper modes
- one sealed tracked hostile synthetic-candidate fixture
- protected evidence schema/validator/reconstruction fixtures
- candidate isolation/proof-closure docs

**Out of scope**:

- Live dispatch, policy/release/environment/package mutation.
- Live candidate publication/proof operation (plans 024/021) or any branch/PR.
- Apply/merge/cleanup/provider matrix.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `ci(goal): verify candidates as data`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Materialize hostile candidates with base-owned Git

Implement base-only commands:

```text
validate-canary-worktree --repository <path> --base <sha>
prepare-canary-subject --repository <path> --base <sha> --candidate <sha> --output <new-bundle>
validate-canary --repository <path> --base <sha> --candidate <sha>
run-canary-subject --bundle <file> --policy <json> --image <digest-ref> --output <new-json>
seal-synthetic-candidate --fixture <tracked-fixture-dir> --base <sha>
  --output <new-bundle> --manifest <new-json>
verify-candidate-bundle --bundle <file> --manifest <json>
  --candidate <sha> --tree <sha> --contract <digest>
  --fixture-digest <hex> --policy <digest-ref> --require-untrusted
  --deny-real-pr-acquisition-claim
verify-candidate-bundle --oci-ref <digest-ref> --candidate <sha> --tree <sha>
  --manifest-digest <hex> --contract <digest> --fixture-digest <hex>
  --policy <digest-ref> --require-label synthetic_candidate_fixture
  --require-untrusted --deny-real-pr-acquisition-claim --repull
```

They must run from a separately validated clean authority worktree. Sanitized
Git disables hooks, filters, fsmonitor, prompts, alternates, candidate config,
and unsafe protocols. Fetch exact raw objects to a new bare store; walk tree and
bound modes/paths/symlinks/gitlinks/file count/bytes before materialization.
Never checkout candidate or extract candidate archive. Standalone Git bundle
must reconstruct exact commit/tree.

`seal-synthetic-candidate` is the one-PR bootstrap path: from literal sealed
hostile fixture bytes already reviewed in the implementation PR, create a
detached commit/tree in a new temporary object database and a standalone bundle.
Its origin/trust is exactly `synthetic_candidate_fixture`; it proves no live PR
or repository-ref acquisition. Production repository-candidate mode remains
implemented and fixture-tested but cannot claim live proof until a future
ordinary PR supplies it.

Candidate OCI contains the bundle and deterministic subject metadata binding
bundle/commit/tree/contract/fixture/policy digests plus the signed dispatch
nonce, workflow path, run ID, and run attempt known before publication, but
never its own output OCI digest. `candidate-bundle-manifest.json` is a derived
operation receipt excluded from the OCI subject; it may contain
`oci_digest`/`oci_ref`; both direct attestation predicates repeat the embedded
operation tuple. The authenticated OCI verifier reconstructs that
canonical receipt from immutable annotations and requires exactly one file and
one OCI attestation whose operation tuple matches those embedded fields; later
re-attestations are nonmatching and multiple matching attestations fail. It then
checks the caller-supplied manifest SHA-256. This avoids both self-reference and
ambiguous reconstruction after Actions-artifact expiry.

`run-canary-subject` accepts no arbitrary argv. It enforces policy-selected
child, non-root, read-only root, no-new-privileges, cap drop, no network/socket,
bounded pids/memory/CPU/tmpfs/time/output, read-only bundle/deps, fresh scratch,
and post-run applied-limit inspection.

**Verify**: materializer fixtures reject fork/unreachable/moving SHA, traversal,
symlink/gitlink, filter/hook/alternate, duplicate/case collision, oversized tree,
archive shortcut, extra mount/env/argv, and ineffective container limit.

### Step 2: Define complete protected evidence closure

Canonical evidence binds candidate commit/tree/base/contract, policy file/OCI,
verifier CLI/index/child/profile, authority workflow/source/signer, dispatch
context, exact receipt, comparator query/leakage label, sanitized evidence blobs,
and standalone candidate Git bundle. Implement these exact interfaces:

```text
verify-protected-evidence --bundle <evidence-file> --manifest <manifest-file>
  --candidate <sha> --candidate-bundle <digest-ref> --policy <digest-ref>
  --require-proof-closed --require-origin-label synthetic_candidate_fixture
  --deny-real-pr-acquisition-claim
verify-protected-evidence --oci-ref <digest-ref> --candidate <sha>
  --candidate-bundle <digest-ref> --policy <digest-ref>
  --require-proof-closed --require-origin-label synthetic_candidate_fixture
  --deny-real-pr-acquisition-claim [--repull]
  [--output <new-dir>]
verify-protected-evidence print-field --manifest <manifest-file>
  --field <allowlisted-scalar>
```

The local form proves manifest/file/blob/Git-bundle closure. The authenticated
OCI form additionally verifies direct candidate workflow/protected source/
signer/hosted provenance and, with `--repull`, two identical digest fetches.
`print-field` is bounded. `--output` materializes only into a new directory with
regular bounded paths, then reconstructs the Git bundle into a distinct new
directory and rechecks candidate commit/tree.

Protected-evidence OCI likewise contains canonical evidence/blobs/bundle and
fixed subject metadata including its signed nonce/workflow/run tuple, not the
derived operation manifest holding its own `oci_digest`/`oci_ref`. OCI
and file/OCI attestation predicates repeat the tuple. Verification reconstructs
that receipt and requires exactly one matching file/
OCI attestation pair. Neither manifest participates in the digest it records.

**Verify**: Every listed form/flag is fixture-tested. Mutations cover each
identity/blob/bundle/receipt/query/visibility field, local manifest, OCI auth/
provenance, repull drift, output collision/path/size/count, reconstruction,
self-reference, and an operation receipt smuggled into its subject.

### Step 3: Add the base-owned protected candidate workflow

The workflow has a closed `purpose` enum:

```text
publish_synthetic_candidate_fixture -> synthetic-candidate-operation
verify_candidate_bundle             -> protected-candidate-operation
verify_repository_candidate          -> protected-candidate-operation
```

All modes verify and bind authority SHA/nonce/envelope bytes+digest, pinned
signer ID/detached signature, contract digest, and
immutable policy OCI ref. Synthetic publication accepts only the literal
tracked fixture ID/digest, builds the detached bundle through the base-owned
helper, publishes it by digest to `tailrocks-candidate-bundles`, directly
attests file/OCI, and records `synthetic_candidate_fixture`. Bundle verification
accepts only that exact OCI ref/commit/tree/manifest. Repository mode accepts an
exact candidate SHA and uses sanitized raw-object acquisition; it is not
exercised or claimed by bootstrap plans.

Use literal protected environment, main-only hosted runner, pinned actions,
direct signer, and exact least permissions. Authenticate/materialize policy and
candidate bundle, pull exact verifier child, then remove registry auth before
worker. Run `--pull never`; expected bytes stay outside worker; cumulative query
cap one.

Require functional PASS plus hostile denial of host/controller/network/token/
socket/cache/policy/oracle access and absence of candidate authority sentinels
from controller events. Publish/directly attest evidence file and OCI subject to
`tailrocks-protected-evidence`; emit literal `protected-candidate-operation`.

**Verify**: Workflow fixtures reject cross-purpose input/artifact, synthetic
input not equal tracked fixture, stronger/live-PR label, candidate checkout/host
command, PR helper/workflow execution, credential mount/env, policy/image/child
drift, expected mount, query overflow, false confidentiality, self-hosted/broad
permission, incomplete Git/evidence closure, or publication before all gates.

## Test plan

- Hostile Git acquisition/materialization and candidate authority markers.
- Deterministic sealed synthetic fixture/bundle and honest non-PR trust label.
- Fixed policy-bound OCI launcher with applied resource limits.
- Integrity-only outside comparator and cumulative query cap.
- Complete evidence/blob/Git-bundle closure/fresh reconstruction.
- Direct protected provenance and exact workflow input/artifact authority.

## Done criteria

- [ ] Candidate authority paths can exist only as inert tree bytes.
- [ ] No candidate code runs outside released policy-pinned OCI.
- [ ] Evidence OCI reconstructs every blob and exact candidate commit/tree.
- [ ] Bootstrap canary uses no branch/ref/PR and claims only synthetic fixture.
- [ ] Workflow is base-owned, hosted, least-authority, and proof-closed.
- [ ] No live dispatch, candidate PR, apply, merge, or cleanup occurs.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on policy/control-plane drift, unsafe Git/materialization, host candidate
execution, broader container/credential access, confidential oracle need,
incomplete closure, live external mutation, or work beyond one session.

## Maintenance notes

Plan 024 creates the inert canary candidate only after this base authority is
merged. Plan 021 runs and retains the proof.
