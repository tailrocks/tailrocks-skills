# Plan 045: Enforce the native-client OS-principal boundary

> **Executor instructions**: In one session on the shared implementation
> branch, turn Plan 032's measured dedicated-principal boundary into one fixed,
> least-privileged macOS/Linux broker. Implement account-policy rendering,
> global UID leasing, task-home/auth lifecycle, fixed-mode dispatch, and hostile
> integration fixtures. Do not add release/provider modes or execute live admin
> mutations.

## Status

- **Priority**: P0
- **Dispatch**: BLOCKED until plan 032 has a current same-branch completion
  receipt with a PROVEN dedicated-principal boundary; then recut at that head
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 032
- **Covers**: G06, G08, G15
- **Guardrails**: N03-N07, N13, N16, N17
- **Research basis**: `advisor-plans/RESEARCH.md` F4-04, F4-06, F4-18,
  F4-32, F4-50
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Removing credential variable names does not remove same-user filesystem,
process, helper, or socket authority. Reusing one client UID without an atomic
lease also lets a stale/concurrent process steal another run's task auth or race
its output. A root-owned capability broker must own the whole principal
lifecycle before any native Codex/provider evidence can be trustworthy.

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
rtk git merge-base --is-ancestor <plan-032-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-native-client-broker scripts/native-client-sandbox.ts scripts/native-client-sandbox.test.ts scripts/install-native-client-boundary.ts config/native-client-boundary tests/fixtures/native-client-sandbox docs/deterministic-goal-distribution.md
rtk mise run verify-kernel
```

Expected: exact clean one-PR head descended from the current Plan 032 proof,
unchanged frozen main, no second branch/PR, and only the declared broker scope.

## Spec contract

### Requirement G06/G08/G15: one exclusive least-privileged native-client capability

The controller SHALL reach native clients only through one root-owned broker
whose account, policy, executable digest, mode, owner, groups, and invocation
authority are exact. Every run SHALL acquire a system-wide numeric-UID lease and
prove zero pre-existing processes/persistence before creating or populating a
task home. The lease SHALL remain held through credential deletion, process
reap, output validation/handback, task-home/ACL removal, and final zero-process/
persistence proof. Broker modes and files SHALL be closed; caller argv is never
accepted.

#### Scenario: another process already uses the client UID

- **WHEN** any process, session, job, user service, linger state, scheduler
  entry, prior run directory, or lease exists for the client UID
- **THEN** fail before task-home creation or credential exposure; never kill an
  unclassified process and continue.

#### Scenario: broker or account is broader than declared

- **WHEN** account login/groups, broker owner/mode/digest, privilege policy,
  filesystem ACL, allowed mode, environment, input, output, or socket differs
- **THEN** fail closed; do not fall back to same-user execution or generic sudo.

## Must NOT

- **N03/N05**: repo/candidate bytes cannot choose root argv, mode, path, mount,
  UID, ACL, process target, or output; candidate code never runs as controller.
- **N04**: variable scrubbing or a clean home is not called OS isolation.
- **N06/N07/N17**: client cannot read controller home/key/process environment,
  Git/GH credential stores/helpers, agent/Docker sockets, or PR/admin tokens;
  same-UID execution proves no autonomous boundary.
- **N13**: broker digest/account checks prove containment only, not semantic PASS.
- **N16**: accounts, groups, locks, processes, jobs, dirs, ACLs, modes, inputs,
  outputs, time, and cleanup are bounded; overflow/unknown state fails.

## Inputs to provide

- Exact Plan 032 live positive-boundary evidence; sentinel type/path only.
- Fixture-only numeric UIDs/controller users for tests. Live account mutation is
  deferred to attended post-merge operations using the rendered exact plan.
- Exact directly attested platform broker artifact is built later by Plan 009
  from this checkpoint and carried by Plan 018's immutable release; no ambient
  or locally rebuilt broker may be installed.
- macOS and Linux integration hosts where account/process/ACL/job APIs can be
  exercised without storing real provider, GitHub, or signing credentials.

## Starting state

- Plan 032 proves that only a dedicated OS principal can support the host-read
  claim, but owns no reusable privileged boundary.
- No account bootstrap, root-owned broker, UID-wide lease, or task-home ACL/
  credential lifecycle exists.
- Plans 009/020/034 will add only named Codex/provider modes after this base.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit | `rtk cargo test -p tailrocks-native-client-broker && rtk bun test scripts/native-client-sandbox.test.ts` | closed broker/launcher fixtures pass |
| Render | `rtk bun scripts/install-native-client-boundary.ts test-render --fixtures tests/fixtures/native-client-sandbox/platforms` | exact macOS/Linux plans |
| Hostile | `rtk bun scripts/native-client-sandbox.ts test-boundary --fixtures tests/fixtures/native-client-sandbox/hostile` | every privilege/race fails closed |
| Repository | `rtk mise run verify-kernel && rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- tiny Rust `tailrocks-native-client-broker` with closed capability protocol
- `native-client-sandbox.ts` base client, lease, probes, reap, and handback
- attended macOS/Linux account/broker-policy renderer and live verifier
- root-owned policy templates, schemas, unit/integration/hostile fixtures, docs

**Out of scope**:

- Codex/provider/release/platform modes; real provider auth; live account/admin
  mutation; generic command execution; container verifier; protected workflow;
  release, policy, evidence, version, branch, PR, or merge mutation.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): isolate native client principal`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Render and verify one exact locked account/broker policy

Implement:

```text
install-native-client-boundary.ts render --platform <darwin|linux>
  --principal tailrocks-native-client --controller-user <exact-user>
  --broker <attested-binary> --output-dir <new-dir>
install-native-client-boundary.ts review --plan <canonical-json>
install-native-client-boundary.ts ensure-live --reviewed-plan <canonical-json>
  --approve-plan-sha256 <independently-supplied-sha256-hex> --output <new-json>
install-native-client-boundary.ts print-field --plan <canonical-json>
  --field <broker_sha256|policy_sha256|platform>
install-native-client-boundary.ts verify-live --principal tailrocks-native-client
  --broker-digest <sha256-hex> --policy-digest <sha256-hex>
  --output <new-native-boundary-v1-json>
```

macOS rendering creates one hidden locked non-login account with pinned UID,
primary group only, no admin/wheel/sudo/docker membership, no user LaunchAgent/
daemon authority, and false shell. Linux rendering creates one locked system
account with pinned UID, primary group only, no supplementary/sudo/docker
membership, no user manager/linger/cron, and nologin shell. Both install the
exact broker root-owned/non-writable at a fixed libexec path and one root-owned
policy granting the controller only the broker protocol—never shell, arbitrary
path/argv, account mutation, or generic sudo. Existing exact state is no-op;
absent state yields a reviewable attended plan; conflict fails.

`review` prints the complete bounded canonical plan plus SHA-256 to an attended
operator and performs no mutation. Execution stops there. A separate operator
action supplies that digest on resume; the executor must not derive, assign, or
copy the approval argument from its own render step. `ensure-live` is the sole
mutation interface. Its OS-native attended elevation
executes the directly attested platform broker artifact itself as root; no
persistent sudo rule or generic privileged helper is installed. It accepts only
canonical renderer output, requires the typed SHA-256 of those exact bytes,
recomputes every source/destination/policy/account field, and performs only
create-if-absent or verify-equal. It accepts no caller argv, shell, path, UID
outside the plan, overwrite, delete, or conflict repair. The reviewed plan pins
source artifact digest and attestation identity, destination, owner/mode,
principal UID/groups/shell/login flags, controller identity, policy bytes/
digest, and platform. Partial mutation produces a bounded journal and may only
resume the same plan.

`verify-live` emits canonical `native-boundary-v1` JSON containing schema,
platform, principal/numeric UID, controller identity, exact account flags and
groups, broker path/SHA-256/owner/mode/direct-attestation subject, policy path/
SHA-256/owner/mode/allowed controller, UID-lock namespace, persistence probes,
and verification result. It contains no timestamp, credential, home, or moving
alias. The caller hashes these canonical bytes. Every extension mode must
accept the receipt, acquire the UID lease, re-resolve every receipt field under
that lease before task-home/auth creation, and seal the receipt SHA-256 into its
named output.

**Verify**: Render/Unit mutate platform, UID, account flags, groups, scheduler,
login, broker owner/mode/digest/path, policy authority, absent/self-derived/
wrong approval digest, source
attestation, partial journal, receipt canonicality, output collision, and
pre-existing state. Exact `dscl`/launchd and `useradd`/systemd/policy fixtures
round-trip; only disposable integration hosts exercise mutation.

### Step 2: Hold one global UID lease across the complete secret lifecycle

The root broker creates a root-owned lock keyed by numeric UID and acquires it
before task-home creation/population. Under lock, enumerate bounded processes,
sessions, user services, linger, scheduled jobs, and prior run dirs; require
zero. Task home must be a nonexistent child of a validated controller-created
0700 temp root. Broker applies traverse-only parent ACL, creates a UID-owned
0700 child, imports only mode-specific client auth, and exposes only digest-
validated read-only inputs. On every exit/signal it deletes auth, kills/reaps
the complete broker-owned group plus checks UID-wide zero state, rejects
persistence, validates/copies only the named bounded output, removes home,
restores ACL, rechecks zero jobs/processes/dirs, then unlocks.

**Verify**: Hostile command races lock acquisition, pre-existing/concurrent UID
process, stale lock/run, login/session/job/linger/cron, auth-before-lock,
traverse/read ACL, output symlink/race, signal/crash, incomplete reap, persistent
child, ACL/home residue, and early unlock. No credential becomes readable in
any failing case.

### Step 3: Expose only a fixed extensible mode protocol

Implement base interfaces:

```text
native-client-sandbox.ts preflight --principal tailrocks-native-client
  --task-home <new-path> --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
native-client-sandbox.ts assert-quiescent --principal tailrocks-native-client
```

The controller wrapper may pass the signing-key path to the broker only as a
denial probe; neither wrapper nor broker opens it, and it never enters client
argv/env/home. Fixed protocol validates UID/account/broker/policy/lock plus
denial of controller home, signing key, parent environment, Git/GH configs and
credential helpers, SSH/GPG agents, Docker socket, and unknown env. Extension
registry accepts only separately implemented named modes with closed schemas;
no passthrough argv or path wildcard exists.

**Verify**: Unit/Hostile reject same UID, readable denial target, parent-env or
credential/socket access, unknown mode/field/path/env, arbitrary executable,
missing/stale/foreign live receipt, receipt drift after preflight, unsealed
receipt digest, overbroad file descriptor, output before validation, missing post-run
quiescence, and any extension that bypasses the lease/account policy.

## Test plan

- Exact macOS/Linux locked-account and root-owned broker-policy rendering.
- Atomic UID lock, pre/post zero process/job/persistence, crash/signal cleanup.
- Parent ACL/task auth/read-only input/named-output lifecycle and race attacks.
- Controller key/home/env/Git/GH/helper/agent/Docker denial.
- Closed extension registry with no free-form argv/path or live admin fixture.

## Done criteria

- [ ] Account/broker policy is exact, least-privileged, renderable, attended-
  installable from one attested artifact, and verifiable as `native-boundary-v1`.
- [ ] Global UID lease encloses every task-home/auth/process/output/cleanup step.
- [ ] Every pre-existing/concurrent/persistent process fails before auth exposure.
- [ ] Client cannot recover controller key/home/env/GitHub/Git/socket authority.
- [ ] Base protocol accepts only named closed future modes and bounded outputs.
- [ ] Commands, scope/diff, fixtures, and one signed/co-authored commit pass.

## STOP conditions

Stop on non-PROVEN Plan 032 boundary, missing OS enforcement API, generic sudo/
argv/path need, account/broker conflict, inability to lock/enumerate/reap the UID,
credential exposure before lock, cleanup uncertainty, live admin mutation,
release/provider mode work, second branch/PR, or work beyond one session.

## Maintenance notes

Plans 009, 020, and 034 may add only their named modes and must retain this
broker/account/lease protocol byte-for-byte. Every external native operation
downloads and directly verifies the released platform broker, renders and
attended-applies the exact plan if absent, runs `verify-live`, passes that
receipt into the named mode, and seals its canonical digest—not credentials.
