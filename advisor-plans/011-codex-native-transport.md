# Plan 011: Attach native Codex transport to the proven kernel

> **Executor instructions**: Finish this provider adapter in one session. Reuse
> plan 003 decisions byte-for-byte; only transport controller states through the
> exact Codex lifecycle proven by plan 032. Do not add acceptance logic, queues,
> provider-owned state, or fallback loops.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 003 and 032 have current same-branch
  completion receipts and Codex executor/Stop/host-read axes are PROVEN
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plans 003 and 032
- **Covers**: G06, G12
- **Guardrails**: N01, N03-N06, N08, N12, N13, N16-N18
- **Research basis**: `advisor-plans/RESEARCH.md` F4-03, F4-06, F4-09,
  F4-18, F4-22
- **Planned at**: design baseline `1e809bd`; dispatch only after dependency recut

## Why this matters

The kernel already decides PASS without a provider. This slice proves Codex can
carry `CONTINUE`, `NEXT`, `BLOCKED`, and `PASS` without becoming another
authority. Verification remains synchronous in the explicit checkpoint call;
Stop only reads committed state.

## Preconditions — run before anything else

After recutting from one shared-branch plan-003/032 integration head, run:

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
rtk git merge-base --is-ancestor <plan-003-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-032-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- crates/tailrocks-core/src/provider/codex crates/tailrocks-core/src/broker crates/tailrocks-cli/src integrations/codex scripts/provider-conformance.ts scripts/provider-conformance.test.ts examples/deterministic-goal/tracer/evidence/codex-current.json docs/deterministic-goal-trust.md
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS
rtk bun scripts/provider-conformance.ts validate-research research/native-goal-control --require executor_profile=PROVEN --require stop_control=PROVEN --require host_read_isolation=PROVEN
rtk cargo test --workspace --all-features
```

Expected: recorded integration commit matches; scripted tracer prints PASS;
Codex profile and Stop axes are current/PROVEN; tests pass. A merely
`operator_attested` native-goal origin is allowed but must remain labeled.

## Spec contract

### Requirement G06/G12: transport preserves kernel state

Codex SHALL receive a generated goal payload and SHALL map native lifecycle
events through one run-scoped broker to the existing checkpoint/status API. The
broker SHALL expose only idempotent `submit`, `checkpoint`, and `status` for the
controller-registered run/clone; requests contain no path, argv, oracle, Docker,
state-directory, or operator method. The adapter SHALL NOT alter contract,
journal, candidate, verifier evidence, budgets, or PASS. Stop executes only the
capability-scoped status client.

#### Scenario: normal progression

- **WHEN** checkpoint commits CONTINUE, NEXT, BLOCKED, then PASS across the
  fixture lifecycle
- **THEN** native Stop behavior exposes the same ordered outcomes and only
  current PASS releases.

#### Scenario: hook drift

- **WHEN** effective config/hook digest, session mapping, or journal result is
  absent/stale
- **THEN** the hook returns BLOCKED and never runs verification.

#### Scenario: privilege probing

- **WHEN** the executor replays requests or asks to attest/apply/retire, select a
  path/argv, access another run, Docker, or controller state
- **THEN** replay is idempotent/budgeted and every unauthorized request/access
  fails without exposing privileged handles.

## Must NOT

- **N01/N08**: native transcript/status/history cannot create PASS.
- **N03**: GOAL/repository text cannot choose hook argv.
- **N04/N05**: broker tools are the sole side-effecting tool exception;
  candidate workers never receive them or controller/Docker access.
- **N06**: no auth/config/transcript secret enters evidence or candidate.
- **N12**: Codex state cannot fork kernel state.
- **N13**: only the generated Tailrocks payload is hashed; ambient context stays
  explicitly unbound.
- **N16/N17**: broker requests/responses are strictly bounded and an autonomous
  run requires the proven dedicated host-read namespace.
- **N18**: a live provider session cannot receive a confidential comparator
  result or adaptively retry a confidential oracle.

## Inputs to provide

- Exact plan-003/032 completion checkpoints, frozen base, and shared head at recut.
- Operator-authenticated disposable Codex home prepared by plan 032. Operator
  performs login/TTY steps; no credential bytes enter repository evidence.
- Plan-002 evidence accepting exact Codex version/config with executor and Stop
  axes PROVEN.
- A dedicated OS principal/container or equivalently proven read namespace for
  every TIER 1/2 run. Ordinary same-user hosts remain `local_non_adversarial`
  and cannot carry sensitive-host support claims.

## Starting state

- Plan 003 provides the provider-free contract/journal/checkpoint/status API and
  scripted tracer.
- Plan 032 provides fresh isolated-home preparation, effective-hook discovery,
  lifecycle evidence schema, and hostile capability tests.
- No `integrations/codex/**` production adapter exists.
- Direct executor invocation cannot safely reach external SQLite/Docker. No
  broker exists; exposing those resources would violate the effect boundary.
- Codex Stop input does not expose a documented native-goal ID; the operator-run
  `/goal` origin therefore remains `operator_attested` unless current evidence
  exposes a stronger machine field.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Transport tests | `rtk cargo test -p tailrocks-core codex_transport` | exit 0 |
| Scripted baseline | `rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS` | exit 0 |
| Native evidence | `rtk bun scripts/provider-conformance.ts validate-native-tracer examples/deterministic-goal/tracer/evidence/codex-current.json` | exit 0; all four states match |
| Full Rust | `rtk cargo test --workspace --all-features` | exit 0 |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `crates/tailrocks-core/src/provider/codex/**` (new)
- `crates/tailrocks-core/src/broker/**` (new run-scoped protocol/server)
- `crates/tailrocks-cli/src/**` only for Codex launch/status transport
- `integrations/codex/**` (new, isolated-home integration)
- `scripts/provider-conformance.ts` native-tracer validation only
- `scripts/provider-conformance.test.ts` corresponding cases
- `examples/deterministic-goal/tracer/evidence/codex-current.json` (sanitized)
- `docs/deterministic-goal-trust.md` Codex transport section

**Out of scope**:

- Kernel acceptance, contract/journal/receipt semantics, new schemas.
- Multi-slice runtime, skill migration, distribution, Grok/Claude.
- Async queue/worker, general daemon/supervisor, hook-time gates, root/shared
  plugin hook, credentials, external effects, or headless substitution for
  native `/goal`.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(goal): connect native Codex transport`
- One green `rtk git commit -s` commit with
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Start one capability-scoped broker and fixed status hook

Generate the Tailrocks-controlled goal payload from sealed contract plus journal
state without committing prompt updates into candidate ancestry. Record only its
digest; label provider/system/tool/dynamic context unbound.

The controller launcher creates the run UUID, binds one immutable clone path,
and starts a synchronous per-run broker from controller-owned Codex MCP config
outside the repository. The model sees exactly three zero-path tools:
`tailrocks_submit`, `tailrocks_checkpoint`, and `tailrocks_status`. The closed
protocol accepts only a monotonic request ID; the broker selects registered
workspace, contract, argv, state, and Docker.
It has hard request/response/time caps, rejects unknown fields/methods, and
offers no approve/attest/apply/retire/admin endpoint.

The broker may return repeatable `integrity_only` results only when the sealed
contract fixes a cumulative query cap and labels the leakage channel. V1 has no
confidential oracle result. A requirement needing confidential expected data is
an unsupported external gate and therefore cannot produce native PASS.

Persist the Codex-session mapping externally and write the exact unprivileged
request/status argv into isolated controller-owned Codex home. Executor flow is:
edit allowed paths; request submit; synchronous request checkpoint; attempt
Stop. Stop requests status only. No repo text selects arguments; no gate runs in
the hook; no async work exists. Effective hook/config/session/broker-tool drift
is BLOCKED. Candidate OCI workers never receive the broker tools.

**Verify**: Transport tests pass for normal, resume, NEXT, BLOCKED, duplicate
Stop, missing mapping, sibling conflict, config mutation, stale result, timeout,
request replay/overflow, cross-run/path/argv/admin probing, direct state/Docker
access, candidate broker-tool absence, and repository-selected argv.

### Step 2: Run the real native lifecycle against the tracer

Use plan 032's harness-printed TTY sequence and actual `/goal`, not `codex exec`
or a normal prompt. Run the same candidate/oracle fixture as scripted mode.
Retain only closed-schema sanitized events. Controller decision sequence and
final receipt bytes must match scripted mode; provider metadata is separate.

**Verify**: Native evidence command exits 0 with ordered
CONTINUE/NEXT/BLOCKED/PASS, resume, current effective-hook digest, zero
stop-without-PASS, and `generation_trust=operator_attested` unless stronger
machine evidence exists.

## Test plan

- Fixed external hook argv and complete effective-hook conflict cases.
- Broker method/capability isolation, cross-run rejection, bounded ingress.
- Session/run mapping, resume, duplicate Stop, timeout, config mutation.
- Integrity-only cumulative query-cap enforcement and confidentiality rejection.
- Scripted/native decision and receipt equivalence.
- Sanitization: no token, auth file, home path, or unrelated transcript.

## Done criteria

- [ ] Recut records plan-003/032 completion and shared-branch integration SHAs.
- [ ] Exact Codex executor-profile, Stop-control, and host-read-isolation axes
  are current/PROVEN.
- [ ] Scripted and native decision sequences/receipt bytes match.
- [ ] Hook performs only bounded status read; no gate or queue path exists.
- [ ] Executor can reach only its broker methods; controller state/Docker/admin
  operations and protected oracle remain inaccessible.
- [ ] Broker exposes no confidential-oracle mode or stronger trust label.
- [ ] Evidence is sanitized and native-goal origin honestly labeled.
- [ ] All Commands, `rtk git diff --check`, and scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop if dependency/evidence is stale, executor or Stop axis is not PROVEN,
native `/goal` cannot be distinguished from prompt/exec mode, fixed hook state
is executor-writable, the provider cannot expose the closed broker tools without
broader host access, checkpoint must run asynchronously, sensitive-host read
isolation is absent for a claimed autonomous tier, or evidence requires
capturing credentials/unallowlisted transcript, or native progression requires
a confidential comparison channel.

## Maintenance notes

Plan 012 consumes this adapter unchanged for multi-slice execution. Plan 009
packages it. Any provider event/schema change requires new conformance evidence.
