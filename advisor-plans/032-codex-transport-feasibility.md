# Plan 032: Prove Codex transport and host-read feasibility

> **Executor instructions**: In one attended session, extend plan 002's harness
> only for Codex native `/goal`, run-scoped broker, resume, effective controls,
> and dedicated host-read boundary. Do not change the verifier backend.

## Status

- **Priority**: P0
- **Dispatch**: BLOCKED until plan 002 has a current same-branch completion receipt
- **Effort**: M; one session, attended
- **Risk**: HIGH
- **Depends on**: plan 002
- **Covers**: G06, G08
- **Guardrails**: N01, N03-N08, N12, N13, N16-N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-03, F4-04, F4-06,
  F4-09, F4-18, F4-19, F4-50
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Codex may expose native `/goal`, Stop hooks, resume, and a workspace sandbox,
but none alone proves a narrow controller capability or same-user secret
isolation. This slice measures those orthogonal axes without coupling them to
the provider-free tracer.

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
rtk git merge-base --is-ancestor <plan-002-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- scripts/provider-conformance.ts scripts/provider-conformance.test.ts tests/fixtures/provider-conformance research/native-goal-control integrations/codex docs
rtk bun scripts/verifier-feasibility.ts validate-research research/native-goal-control/evidence/verifier-backend-current.json
rtk codex --version
rtk docker version
```

Expected: clean exact plan-002 descendant, current proven backend, current
Codex/Docker identities, and reviewed scope. Missing interactive auth/TTY may
yield INCONCLUSIVE; it cannot fabricate PROVEN.

## Spec contract

### Requirement G06/G08: narrow native state transport with honest host boundary

One fresh isolated Codex home SHALL expose only a fixed Stop status hook and
three run-scoped broker methods. Live native `/goal` SHALL demonstrate ordered
CONTINUE/NEXT/BLOCKED/PASS plus resume. Effective tool/hook/workspace controls
and host-read isolation SHALL be independent verdicts. Only a dedicated OS
principal/container/read namespace whose mounts omit operator/controller/
credential paths may prove autonomous host-read isolation.

#### Scenario: same-user sandbox denies writes but permits reads

- **WHEN** executor cannot mutate controller state but reads an operator
  sentinel
- **THEN** executor profile may pass while `host_read_isolation=FAILED`.

## Must NOT

- **N01/N08**: transcript/model claims and old PASS never decide an axis.
- **N03-N05**: repo prose/config cannot choose hook/broker/controller argv;
  candidate subprocesses remain in plan-002 OCI.
- **N06/N07/N17**: no auth bytes in evidence/worker/PR; same-user process is not
  autonomous secret isolation.
- **N12/N13**: provider translates state only; hashes/config inventory are not
  semantics.
- **N16**: tools, events, paths, processes, output, time, and retries are bounded.
- **N18**: comparator observations are integrity-only, never confidential.

## Inputs to provide

- Interactive Codex auth/TTY and current official inspection surfaces.
- One dedicated-principal/container profile for the positive host-read case;
  if unavailable, record FAILED/INCONCLUSIVE and do not weaken the definition.
- Operator sentinel type/path only; never record its value.

## Starting state

- Plan 002 proves the provider-neutral verifier independently.
- Codex `--strict-config` rejects unknown keys but does not isolate user config;
  this plan uses a fresh inline `CODEX_HOME`.
- Current workspace-write policy includes `/tmp` unless both temp exclusions
  are set and proven live.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit | `rtk bun test scripts/provider-conformance.test.ts` | exit 0 |
| Native boundary | `rtk bun test scripts/native-client-sandbox.test.ts --test-name-pattern 'base boundary'` | UID/ACL/credential denial exact |
| Prepare | `rtk bun scripts/provider-conformance.ts prepare --provider codex --root /tmp/tailrocks-codex-goal-smoke` | fresh closed home/repo/controller fixture |
| Record | `rtk bun scripts/provider-conformance.ts record --provider codex --root /tmp/tailrocks-codex-goal-smoke` | bounded allowlisted evidence only |
| Validate | `rtk bun scripts/provider-conformance.ts validate --provider codex /tmp/tailrocks-codex-goal-smoke/evidence/codex.json` | exact axis verdicts |
| Research | `rtk bun scripts/provider-conformance.ts validate-research research/native-goal-control/evidence/codex-current.json` | current CLI/config/host evidence |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- Codex modes in `scripts/provider-conformance.ts` and tests/fixtures
- `research/native-goal-control/evidence/codex-current.json` and sources/docs
- disposable fixed mock broker/Stop-hook fixtures outside repository cwd

**Out of scope**:

- Production controller/broker, Rust runtime, verifier backend changes.
- Grok/Claude, adapters, manifests, versions, releases, protected workflows.
- Supervisor/daemon/queue, broad IPC, full transcript/config/auth capture.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `test(goal): prove Codex transport boundary`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Extend the harness with one isolated Codex home and broker

Create a collision-checked `/tmp/tailrocks-codex-goal-smoke` containing fresh
`codex-home`, writable fixture repo, controller/broker, and evidence dirs. The
fixed broker exposes only bounded `tailrocks_submit`, `tailrocks_checkpoint`,
and `tailrocks_status` for one run; no path/argv/state/Docker/admin primitive.
The fixed Stop hook calls status only and never reads repo commands. Fresh config
uses both `exclude_slash_tmp=true` and `exclude_tmpdir_env_var=true`, network
off, repo cwd as sole intended write root, and no inherited user profile.

**Verify**: Unit/Prepare reject symlink/collision, project hook, sibling bypass,
unknown tool/event, malformed/reordered event, broader broker capability,
secret sentinel, effective-home drift, and fake native-origin evidence.

### Step 2: Prove native state and resume live

Launch exactly:

```sh
CODEX_HOME=/tmp/tailrocks-codex-goal-smoke/codex-home rtk codex \
  -C /tmp/tailrocks-codex-goal-smoke/repo \
  --strict-config --sandbox workspace-write --ask-for-approval never
```

Invoke native `/goal` interactively. Exercise distinct CONTINUE, NEXT, BLOCKED,
and PASS paths; interrupt after CONTINUE, resume the exact session, and finish.
External controller budget/event order remains monotonic. Because the exposed
hook event lacks goal identity, record `native_goal_origin=operator_attested`
with only exposed session/turn IDs; normal prompt or `codex exec` cannot pass.

**Verify**: Record/Validate require ordered events, distinct blocked behavior,
fixed hook source, same-session resume, no budget reset, and explicit inability
to mark BLOCKED if current native behavior lacks it.

### Step 3: Measure effective controls and host reads independently

Enumerate effective hooks/tools/prompt inputs through current official surfaces.
Probe repo write success and writes to fresh home/controller/evidence, `/tmp`,
actual `$TMPDIR`, sibling runs, and arbitrary IPC. Probe shell reads, env,
web/search, MCP/apps/plugins, added dirs, approvals, and hosted tools. Run the
same-user negative sentinel then the dedicated-boundary positive sentinel.
Measure bounded synchronous status latency; timeout fails Stop control.

Record only:

```text
stop_control: PROVEN | FAILED | INCONCLUSIVE
executor_profile: PROVEN | FAILED | INCONCLUSIVE
host_read_isolation: PROVEN | FAILED | INCONCLUSIVE
native_goal_origin: operator_attested | unknown
```

**Verify**: any unreadable capability inventory, project mutation, sibling/
secret visibility, broad IPC, resume drift, or timeout downgrades only its exact
axis. Dedicated host-read PROVEN requires live UID/mount/namespace evidence;
Plan 045 turns that measured boundary into the fixed production broker.

## Test plan

- Fresh-home/hook/tool/broker schema and precedence mutations.
- Live native states, resume, timeout, normal-prompt/exec negative cases.
- Repo-write versus controller/temp write denial and same-user read failure.
- Dedicated-principal positive case; stale client/config evidence rejection.

## Done criteria

- [ ] Plan-002 verifier evidence remains unchanged and current.
- [ ] Native states/resume and exact effective hook/tool set are observed.
- [ ] Broker exposes exactly three bounded methods; controller authority stays
  outside executor.
- [ ] Stop/profile/host-read/origin axes are independent and honestly labeled.
- [ ] Commands, diff/scope checks, and one signed/co-authored commit pass.

## STOP conditions

Stop on unavailable auth/TTY with no honest INCONCLUSIVE path, inherited config,
mutable hook, broad IPC, controller exposure, unbounded evidence, secret value,
verifier change, or work beyond one session. A failed axis never blocks the
provider-free tracer unless its consumer explicitly requires that axis.

## Maintenance notes

Plan 011 requires this plan's current transport/profile/host evidence plus plan
003's provider-free tracer. Plan 045 alone turns the positive dedicated-
principal evidence into a privileged production broker. Provider support tiers
must quote the exact axes.
