# Plan 022: Build the protected control plane

> **Executor instructions**: In one session, implement only deterministic
> dispatch/run correlation, attended authority envelopes, and protected
> environment/ref helpers. Do not implement policy or candidate workflows.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 034 has a current same-branch completion receipt
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 034
- **Covers**: G08, G14, G15
- **Guardrails**: N03, N05-N08, N11, N13, N16, N17
- **Research basis**: `advisor-plans/RESEARCH.md` F4-02, F4-16, F4-24,
  F4-27, F4-35-F4-41, F4-44, F4-46, F4-50
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

`gh workflow run` does not assign a shell run ID, workflow tokens cannot read
unredacted bypass actors, and an unsigned caller-provided envelope is forgeable
by any dispatcher. This slice creates one base-owned attended control plane with
independently pinned operator signatures, without claiming the workflow itself
reproduces admin-only state.

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
rtk git merge-base --is-ancestor <plan-034-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- .github/workflows/release-artifacts.yml scripts/protected-workflow.ts scripts/protected-workflow.test.ts scripts/protected-environment.ts scripts/protected-environment.test.ts scripts/validate-workflows.ts config/protected-authority-signers tests/fixtures/protected-control-plane schemas docs/deterministic-goal-distribution.md
rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/release-finalization
rtk mise run verify-kernel
```

Expected: exact clean plan-034 descendant; all four release purposes remain
green; control-plane-only scope reviewed.

## Spec contract

### Requirement G08/G14/G15: deterministic attended protected authority

A base-owned helper SHALL bind one protected-default workflow run/attempt to
full ref/SHA, actor, event, time window, nonce, workflow identity, exact closed
inputs/artifact, and an operator-generated, independently signed unredacted
authority envelope. Live
environment/main/tag authority SHALL be independently read before and after.
Admin-only claims remain `operator_attested` with explicit TOCTOU trust.

#### Scenario: workflow token cannot see bypass actors

- **WHEN** protected workflow receives an authority envelope it cannot
  independently reproduce
- **THEN** it verifies a domain-separated detached signature against the pinned
  operator public key, binds exact bytes/digest, and labels privileged facts
  operator-attested; it never claims a workflow proof of bypass settings.

## Must NOT

- **N03/N05**: candidate/repo input cannot select GH/API/Git/container argv.
- **N06/N07/N17**: candidate/PR/workflow receives no private signing/admin/
  release/provider credential; no self-hosted protected run.
- **N08/N13**: run URL/status/hash alone is not protected proof.
- **N11**: helper cannot merge/release/publish/apply or mutate environment unless
  explicit bootstrap subcommand/plan authorizes the exact setting.
- **N16**: workflows, inputs, API pages/polls, actors, outputs, files, and
  authority responses are closed/bounded.

## Inputs to provide

- Exact Ed25519 operator public key and signer ID to pin in
  `config/protected-authority-signers`; implementation tests use fixture keys.
- Later operations provide the matching mode-0600 private-key path only to
  base-owned controller-principal processes through
  `TAILROCKS_AUTHORITY_SIGNING_KEY`. Dispatch alone may open/use the key;
  `native-client-sandbox.ts` may receive the path only as an unreadable denial
  probe and must never open it or pass it to a client. Native/provider clients
  run through Plan 045's distinct unprivileged OS principal and cannot read that
  path, controller home, parent environment, or credential sockets. The public
  `TAILROCKS_AUTHORITY_SIGNER_ID` and detached signature intentionally enter the
  closed workflow inputs; private key bytes/path never do.
- Authenticated repository admin for unredacted attended reads when executing
  later operational plans. Implementation uses fixtures only.
- Exact approved reviewer specs only in plan 031.

## Starting state

- Plans 009/033/034 own release workflow semantics and four literal artifacts.
- No deterministic dispatch-to-run correlation or closed environment/ref helper
  exists.
- GitHub workflow tokens cannot reproduce unredacted ruleset bypass state.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Correlation | `rtk bun test scripts/protected-workflow.test.ts` | unique run/attempt and closed schema fixtures pass |
| Authority | `rtk bun test scripts/protected-environment.test.ts` | reviewer/environment/main/tag/immutability fixtures pass |
| Workflow | `rtk bun scripts/validate-workflows.ts --fixtures tests/fixtures/protected-control-plane` | exact release purpose mapping and future workflow schemas |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- `scripts/protected-workflow.ts` dispatch/watch/download/context/authority
- `scripts/protected-environment.ts` reviewer/environment/main/tag helpers
- pinned public `config/protected-authority-signers`; no private key
- release workflow's common signed-envelope validation step only; no build/
  package/qualification behavior change
- control-plane schemas/tests/fixtures and workflow static validator
- protected authority/trust documentation

**Out of scope**:

- `bootstrap-protected-verifier.yml`, `protected-candidate-verify.yml`.
- Policy/evidence validators/materializer/candidate launcher.
- Release workflow build/package/qualification semantics.
- Live environment/package/release/policy/candidate mutation.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): add protected control plane`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Correlate one dispatch to one exact run

Implement:

```text
dispatch --workflow <allowlisted> --dispatch-branch main --authority-ref refs/heads/main --authority-sha <sha> [--input key=value...] --out <new-json>
watch --dispatch <json>
download --dispatch <json> --artifact <allowlisted> --dir <new-dir>
verify-context --dispatch <json> --manifest <json> [--require-run-attempt 1]
verify-authority (--dispatch <json> | --context <json>) --require-current --out <new-json>
```

`dispatch` creates a 128-bit CSPRNG nonce, captures authenticated actor and
bounded start time, and obtains canonical authority bytes that bind nonce,
purpose, the digest of every closed mode input (excluding the derived envelope/
signature fields), repo/ref/SHA, issue/expiry, and live
admin state. It refuses absent/unpinned signer environment, signs those bytes
under SSH namespace `tailrocks-protected-authority-v1`, verifies its own
signature against the pinned public key, closes the key, and scrubs key path and
admin credentials from the `gh` child. It supplies envelope bytes/digest,
public signer ID, and base64 detached signature as closed workflow inputs, then
invokes `gh workflow run <file> --ref main --raw-field`.
The canonical envelope is at most 8,192 decoded bytes/10,924 base64 characters;
the helper permits at most 25 top-level inputs and computes the complete encoded
dispatch payload before sending, rejecting anything above GitHub's 65,535-
character limit.
then polls bounded runs. It accepts exactly one matching workflow ID/file,
`workflow_dispatch`, ref/head SHA, actor, creation window, run-name nonce, and
attempt. It queries the exact run REST endpoint to verify actor ID/login and
writes canonical `dispatch-v1.json`. No caller run ID exists.

Every allowlisted workflow validates the signature, signer ID, namespace,
envelope digest, authenticated actor ID/login, nonce, purpose, and closed-input
digest before any build,
registry, attestation, or publication step. Direct manual dispatch without the
private operator signature therefore cannot mint accepted protected output.

`watch`/`download` accept only that file. Download allows one purpose-specific
artifact and first validates its dispatch context byte-for-byte. Release mapping
is literal:

```text
package_preflight          -> package-preflight-operation
package_visibility_verify -> package-visibility-operation
release_candidate          -> release-operation
release_finalize           -> release-finalization
```

Bootstrap/candidate workflow schemas reserve their literal artifact names for
plans 035/036. Duplicate/zero match, rerun drift, unknown input/artifact,
symlink/pre-existing output, stale time, wrong actor/event/ref/SHA fails.

**Verify**: Correlation/Workflow commands mutate every identity, purpose/input/
artifact/run-name, actor REST field, nonce/time, attempt, output path, 25-input,
envelope-size, and aggregate 65,535-character bound.

### Step 2: Create honest authority envelopes and current checks

The admin helper reads environment ID/name, reviewer IDs,
`prevent_self_review=true`, zero wait, protected-branches-only; `.protected`
main plus complete active repository rulesets/conditions/rules/zero bypass; and
active all-tag nondelete/non-fast-forward zero-bypass authority. It emits
canonical bounded bytes, stable `authority_state_digest`, issue/expiry, actor,
repo/ref/SHA, and labels privileged fields `operator_attested`. Workflow binds
bytes/hash but does not claim it can see bypass actors.

`verify-authority --context` first verifies the pinned signature and accepts only
validated historical dispatch context.
Its envelope must have been valid at recorded dispatch time; it need not be
unexpired now. `--require-current` separately compares live stable state. Any
new external mutation requires a new unexpired dispatch such as finalize.

**Verify**: Authority fixtures reject missing/wrong/unpinned signer, altered
signature/namespace/nonce/purpose/input digest, replay into another workflow,
private-key child inheritance, redaction, missing/inactive/wrong target/bypass/
missing rule, envelope hash/schema/repo/ref/SHA/expiry drift, and any claim
stronger than operator-attested.

### Step 3: Implement bounded reviewer/environment operations

Implement `resolve-reviewers`, `render`, `bootstrap`, `read`, `verify`,
`verify-operational`, `verify-main-authority`, and `verify-tag-authority`.
`verify-main-authority` supports closed requirements for strict up-to-date
status checks, stale-review dismissal, last-push approval, enforced admins, and
zero bypass; Plan 043 uses that server-enforced base-movement guard.
Reviewer resolution uses bounded official user/team/repository-permission/member
endpoints, canonical numeric IDs, maximum six reviewers/100 team members, and
proves at least one eligible person distinct from dispatcher. Render accepts
only resolved manifest. Bootstrap is create-if-404 or exact-equality; conflicts
never overwrite. Operational verification independently re-reads live state.

**Verify**: Authority command covers user/team rename/ID/permission/membership,
self-only/duplicate/pagination, exact create/equal/conflict/concurrent state,
unknown/redacted/API error, main/tag drift, and no unrelated mutation.

## Test plan

- Dispatch/run/attempt/actor/nonce/time/input/artifact exactness.
- Historical versus current authority envelope semantics.
- Unredacted admin state and explicit operator-attested label.
- Reviewer resolution and create-if-absent/equal environment lifecycle.
- Main/tag ruleset full canonical digest and drift.

## Done criteria

- [ ] Every dispatch resolves exactly one run/attempt and closed artifact.
- [ ] Authority envelope/current read are distinct and honestly labeled.
- [ ] Release purpose-to-artifact mapping is literal and fixture-enforced.
- [ ] Reviewer/environment/main/tag helpers are bounded/fail-closed.
- [ ] No policy/candidate workflow, live external mutation, or broad credential.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on ambiguous run, admin redaction, unbounded API/poll, workflow-independent
bypass proof claim, broad token, release semantics change, policy/candidate
workflow work, external mutation, or work beyond one session.

## Maintenance notes

Plan 031 consumes the environment/ref helpers. Plan 035 adds released-policy
bootstrap; plan 036 adds candidate-as-data verification.
