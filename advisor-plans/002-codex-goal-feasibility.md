# Plan 002: Prove the provider-neutral verifier boundary

> **Executor instructions**: In one session, build only the verifier-feasibility
> harness and prove or falsify the real OCI confinement/resource boundary. Do
> not authenticate to Codex or infer native `/goal` behavior.

## Status

- **Priority**: P0
- **Dispatch**: BLOCKED until the one implementation branch/draft PR and frozen
  base are initialized; then recut exact dispatch/last-reviewed SHAs
- **Effort**: S; one session
- **Risk**: HIGH
- **Depends on**: none
- **Covers**: G08, G15
- **Guardrails**: N04-N07, N11, N13, N16, N17
- **Research basis**: `advisor-plans/RESEARCH.md` F4-01, F4-04, F4-18,
  F4-24, F4-28
- **Planned at**: design baseline `1e809bd`; current-root recut required

## Why this matters

The provider-free kernel can start only if arbitrary gate subprocesses actually
stay inside a measured OS boundary. Provider sandbox settings do not constrain
Docker children. This slice proves that boundary independently, so missing
Codex auth/native control cannot block the kernel tracer.

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
rtk git diff --stat <last-reviewed-sha>..HEAD -- scripts tests research/native-goal-control docs mise.toml
rtk --version
rtk bun --version
rtk docker version
rtk docker info
```

Expected: clean exact root, current Bun/Docker identities recorded, and scoped
drift reviewed. Missing Docker or unenforceable resource controls blocks this
plan; it is not replaced with unit-only evidence.

## Spec contract

### Requirement G08/G15: measured provider-neutral verifier backend

One fixed controller-owned launcher SHALL run candidate bytes only in a
digest-resolved image with non-root user, read-only root, no network/socket,
all capabilities dropped, no-new-privileges, bounded pids/memory/CPU/tmpfs/time/
output, read-only subject/dependencies, fresh scratch, and no shared writable
cache. Live inspection and hostile canaries SHALL prove applied controls.

#### Scenario: engine ignores a declared limit

- **WHEN** inspect/cgroup evidence shows a pids, memory, or CPU limit is absent
  or ineffective
- **THEN** `verifier_backend=FAILED`; schema/unit tests cannot upgrade it.

## Must NOT

- **N04/N05**: provider sandbox or clean clone is not subprocess confinement;
  candidate code never runs on the host.
- **N06/N07/N17**: no auth, secret, operator home, controller state, Docker
  socket, or same-user confidential path enters the worker.
- **N11/N13**: proof does not apply/publish anything and a tag/hash without live
  controls is not a verifier verdict.
- **N16**: image, mounts, paths, processes, resources, duration, and evidence are
  closed and bounded.

## Inputs to provide

- A local Docker engine whose topology/security/resource behavior can be
  inspected. No provider or registry credential is needed.
- One operator-owned host sentinel path outside every mount; record type/path
  only, never bytes.

## Starting state

- The repository has no implemented OS sandbox for arbitrary candidate gate
  subprocesses.
- Plan 003 needs only this provider-neutral backend result.
- Plan 032 separately owns Codex transport, Stop, and host-read feasibility.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit | `rtk bun test scripts/verifier-feasibility.test.ts` | exit 0 |
| Build | `rtk bun scripts/verifier-feasibility.ts build --output /tmp/tailrocks-verifier-feasibility` | immutable local image ID and closed fixture |
| Live | `rtk bun scripts/verifier-feasibility.ts run --root /tmp/tailrocks-verifier-feasibility --output /tmp/tailrocks-verifier-feasibility/evidence.json` | two clean live runs; all denied/allowed canaries exact |
| Validate | `rtk bun scripts/verifier-feasibility.ts validate --evidence /tmp/tailrocks-verifier-feasibility/evidence.json` | one terminal backend verdict |
| Research | `rtk bun scripts/verifier-feasibility.ts validate-research research/native-goal-control/evidence/verifier-backend-current.json` | current engine/image evidence |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `scripts/verifier-feasibility.ts` and its tests
- `tests/fixtures/verifier-feasibility/**`
- `research/native-goal-control/{README.md,sources.md}`
- `research/native-goal-control/evidence/verifier-backend-current.json`
- verifier-boundary documentation only

**Out of scope**:

- Codex/provider launch, auth, hooks, native state, broker transport, adapters.
- Production Rust controller, releases, remote registry, protected workflows.
- A daemon, queue, microVM, second backend, or confidential oracle claim.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(goal): prove verifier boundary`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Build the closed verifier harness

Create a new validated task root and minimal image/subject/dependency/oracle/
sentinel fixtures. Resolve the built tag immediately to full `sha256:<hex>` and
never execute by tag. The launcher owns one literal argv/profile; caller input
can select only fixture IDs. Evidence schema allowlists engine topology,
security options, image/child digest, effective mounts, cgroup/resource values,
canary outcomes, timing, and sanitized failure class.

**Verify**: Unit command rejects traversal/symlink roots, unknown fixture/field,
mutable image reference, extra mount/env/socket, caller argv, unbounded value,
and secret sentinel bytes.

### Step 2: Prove confinement and resources live

Run with `--pull never --network none --read-only --user 65532:65532
--cap-drop ALL --security-opt no-new-privileges=true`, exact pids/memory/swap/
CPU limits, read-only subject/deps, and bounded tmpfs scratch. Candidate canaries
attempt host/oracle/controller reads, root/subject/deps writes, DNS/TCP, env
secret lookup, symlink escape, process excess, memory/CPU excess, and Docker
access. Only fresh scratch writes may succeed. Inspect Docker HostConfig and
in-container cgroup state, then repeat from a clean container.

**Verify**: Live/Validate commands pass twice. Deliberately adding network,
socket, oracle mount, root user, writable subject, or ineffective limit makes
the corresponding mutation fail closed.

### Step 3: Publish one orthogonal backend verdict

Record exact retrieval dates, engine/image identities, commands, evidence
digest, daemon topology, limitations, and only:

```text
kernel_contract: FEASIBLE | BLOCKED
verifier_backend: PROVEN | FAILED
```

`kernel_contract=FEASIBLE` means the provider-neutral architecture is
implementable; it cannot override `verifier_backend=FAILED`.

**Verify**: Research/Repository commands pass; changing engine/image/profile or
removing any live limit makes retained evidence stale.

## Test plan

- Schema/path/allowlist/redaction and fixed-launcher mutation fixtures.
- Live filesystem/network/env/socket/symlink/process/resource canaries twice.
- Effective HostConfig/cgroup inspection and deliberately ignored-limit cases.
- Current evidence/version staleness and no provider/auth field acceptance.

## Done criteria

- [ ] One immutable local image/child and fixed launch profile bind.
- [ ] Every forbidden effect fails; scratch succeeds; resource limits enforce.
- [ ] Evidence is bounded/sanitized/current and says only PROVEN or FAILED.
- [ ] No candidate host process, provider auth, external mutation, or extra
  backend exists.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on missing Docker, mutable image, ignored control, host candidate process,
secret value, unbounded evidence, required second backend, unrelated drift, or
work beyond one session. Record FAILED when a live declared boundary fails; do
not relabel it INCONCLUSIVE.

## Maintenance notes

Plan 003 consumes only `verifier_backend=PROVEN`. Plan 032 extends the shared
schema for Codex-specific transport/host evidence without changing this result.
