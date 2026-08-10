# Plan 005: Route empirical uncertainty through bounded prototypes

> **Executor instructions**: Add one manual skill with one narrow write boundary.
> Prototype evidence informs a user decision; it never becomes production or
> READY intent automatically. Run every verification and stop on scope expansion.
>
> Recut from plan 016's exact same-branch checkpoint, then run the Preconditions
> ancestry and scoped-drift commands before editing.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 016 has a current same-branch completion
  receipt; recut at its exact checkpoint
- **Effort**: M; one session
- **Risk**: MED
- **Depends on**: plan 016
- **Covers**: G03
- **Guardrails**: N05, N06, N10-N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` proof boundary; F4-01,
  F4-05, F4-07
- **Planned at**: design baseline `1e809bd`; dispatch only from completed
  plan-016 shared-branch integration commit

## Why this matters

Some product questions cannot be answered by interviews or web research: API
latency, rendering feasibility, native-client behavior, migration viability.
Guessing makes READY false; turning Research into a code-writing skill breaks its
boundary. A separate manual prototype skill keeps experiments isolated, retains
primary evidence, and requires an explicit user decision before intent changes.

## Spec contract

### Requirement G03: evidence before empirical decision

One invocation SHALL answer one falsifiable empirical question with retained
inputs, exact commands/versions, raw results, limitations, and a user decision
route. Repository-local code SHALL execute only through the proven verifier
sandbox. Network/device/credential/deploy experiments SHALL be operator-run
external gates; the model may prepare but not execute them.

#### Scenario: repository-local experiment

- **WHEN** the question can be answered without external effects
- **THEN** the harness runs in the pinned verifier backend and retains evidence.

#### Scenario: external experiment

- **WHEN** the question needs network, credentials, production data, device, or
  irreversible effect
- **THEN** the skill stops before execution, emits an exact operator runbook,
  and later records the result as `operator_attested`.

## Must NOT

- **N05/N06**: candidate code must not run on the host or see secrets.
- **N10**: absent binary must not produce canonical source/READY records.
- **N11/N12**: experiment work must not deploy, adopt intent, or fork authority.
- **N13**: samples/digests must not be described as proof of a universal claim.
- **N16**: experiment inputs, resources, outputs, and retained evidence are
  bounded; overflow cannot pass through truncation.

## Inputs to provide

- **External-effect approval** — exact operator, target, command, credential
  location/type, cleanup, and evidence path. If absent, emit the runbook and
  remain `AWAITING_OPERATOR`; never execute or block unrelated planning.
- **Storage class for evidence** — use plan 004 classes. If sensitive, store an
  approved external reference only.

## Starting state

- Plan 016 makes `empirical_uncertainty` a READY blocker but intentionally does
  not own runnable experiments.
- `tailrocks-research` is fact-oriented and writes only `research/<topic>/`;
  preserve that scope.
- New skills must include manual-invocation frontmatter,
  `agents/openai.yaml`, evals, README/AGENTS catalog entries, and lockstep plugin
  versions. Current plugin version at planning time is `0.11.0`.
- The artifact-grounded runner from plan 001 can prove experiment-folder shape
  and absence of production mutations.

Target experiment shape:

```text
research/<topic>/experiments/<experiment-id>/
  README.md             # question, result, limitations, decision status
  experiment.json       # canonical reproducibility metadata
  inputs/               # retained non-secret inputs or digests/pointers
  harness/              # minimal disposable code/commands
  evidence/             # raw outputs, traces, screenshots, metrics
```

## Preconditions

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
rtk git merge-base --is-ancestor <plan-016-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- skills/tailrocks-prototype skills/tailrocks-brainstorm skills/tailrocks-research skills/tailrocks-finalize README.md AGENTS.md docs/pipeline-walkthrough.md .claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .kimi-plugin/plugin.json
rtk cargo test -p tailrocks-core source_store
rtk cargo test -p tailrocks-core ready_contract
rtk bun test scripts/
rtk mise run validate
```

Expected: recut replaced full SHAs; exact shared head contains plan 016;
scoped diff is empty; all gates pass and validator reports 15 skills before this
new skill.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Skill tests | `rtk bun test scripts/` | exit 0 |
| Validate | `rtk mise run validate` | exit 0, 16 skills after addition |
| Versions | `rtk bun -e 'const fs=require("fs"); const p=[".claude-plugin/plugin.json",".codex-plugin/plugin.json",".kimi-plugin/plugin.json",".claude-plugin/marketplace.json"].map(x=>JSON.parse(fs.readFileSync(x,"utf8"))); if(new Set(p.map((x,i)=>i===3?x.plugins[0].version:x.version)).size!==1) process.exit(1)'` | exit 0 |
| Diff | `rtk git diff --check` | exit 0 |

## Scope

**In scope**:

- `skills/tailrocks-prototype/**` (new)
- `skills/tailrocks-brainstorm/SKILL.md` and evals
- `skills/tailrocks-research/SKILL.md` and evals
- `skills/tailrocks-finalize/SKILL.md` and evals
- `README.md`, `AGENTS.md`, `docs/pipeline-walkthrough.md`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.codex-plugin/plugin.json`
- `.kimi-plugin/plugin.json`

**Out of scope**:

- Production source outside an experiment harness.
- Automatically adopting observations as requirements or decisions.
- Autonomous network, credential, deployment, database, device, or irreversible
  effects. Those require exact operator authorization and a human/external gate.
- Generic prototype frameworks, permanent services, or alternative house-stack
  tooling.
- Plan/runtime compiler changes.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(delivery): add empirical prototype route`.
- Use `rtk git commit -s` and the Codex co-author trailer for one checkpoint.
  Do not open or merge another PR; Plan 043 alone merges the shared PR.

## Steps

### Step 1: Define the one-question experiment contract

Create a lean `SKILL.md` router plus
`references/experiment-contract.md`. Frontmatter must say explicit requests only,
`disable-model-invocation: true`, and `user-invocable: true`; Codex policy must
set `allow_implicit_invocation: false`.

One invocation answers exactly one falsifiable empirical question. Before any
execution, record:

- linked roadmap uncertainty/source IDs and research topic;
- hypothesis and observable success/failure/invalid result;
- inputs, exact house-stack/tool versions, commands, repetition count, timeout;
- allowed write root and external-effect classification;
- cleanup policy and evidence-retention policy;
- what result would still not establish.
- maximum input files/bytes, per-file bytes, path length, run count, wall time,
  process/memory/CPU, stdout/stderr bytes, and retained-evidence files/bytes.

If the question is normative (“which UX should we choose?”), route to Brainstorm
or Finalize. If documentary, route to Research. If it needs production data,
credentials, users, deploys, or irreversible effects without an approved owner,
stop.

**Verify**: `rtk bun run scripts/validate-skills.ts` → exit 0 and 16 valid skills.

### Step 2: Constrain execution and retain primary evidence

The skill creates only the experiment folder and a disposable execution copy.
For repository-local/no-network experiments, run the harness through plan 003's
pinned OCI verifier with subject read-only and a disposable writable overlay.
For any external effect, generate an operator runbook and stop at
`AWAITING_OPERATOR`; never claim the experiment is isolated merely because its
files are in a disposable directory.

The harness may use the fixed Rust/Bun/TanStack house stack; no alternative
package manager/test runner/framework. Capture argv, cwd, allowlisted
environment-variable names (never values), timestamps, exit codes,
stdout/stderr digests, tool versions, verifier profile, and input/output digests.
Reject oversize input before execution; kill the sandbox on runtime/resource
overflow; fail evidence ingestion on overflow. Truncation is a failure, never a
passing observation. Use fresh per-run scratch and no writable shared cache.

Retain raw results needed to reproduce or audit the observation. Large/sensitive
evidence stores a content digest and approved external pointer, never a secret.
Delete only derivable build/cache output. Prototype code is marked non-production
and is never copied into source automatically.

**Verify**:

```sh
rtk bun scripts/run-evals.ts --skill tailrocks-prototype --case prototype-repository-bounded --runs 1 --driver replay --results /tmp/tailrocks-prototype-eval
```

Expected: exit 0; only the experiment folder changes, verifier evidence exists,
and host/production mutation or undeclared external execution fails.

### Step 3: Classify result and require an explicit decision

`experiment.json` records `supported | refuted | inconclusive | invalid`, sample
description, raw evidence digests, limitations, and expiry/freshness triggers.
No majority hides a failed trial. Report each result and an appropriate interval
when sampling stochastic behavior.

Append the experiment result as an informative source through plan 004's source
store. Then ask one decision question: adopt, reject, run another bounded
experiment, or defer with reason. Only Record Decision/Finalize can turn that
answer into normative intent and recompile READY.

**Verify**:

```sh
rtk bun scripts/run-evals.ts --skill tailrocks-prototype --case prototype-result-routing --runs 1 --driver replay --results /tmp/tailrocks-prototype-routing
```

Expected: exit 0; fixtures cover supported, contradictory, inconclusive,
invalid, adoption, and deferral; observation without a decision leaves READY
blocked.

### Step 4: Wire state-derived routing without widening Research

Update Brainstorm to classify empirical uncertainty, Research to hand off only
when documents cannot answer it, and Finalize to require a prototype result or
sourced deferral before READY. Each skill names `tailrocks-prototype` explicitly;
none executes its harness on the user's behalf.

Keep `tailrocks-research` source-neutral and fact-oriented. Its only change is a
route/pointer and eval coverage; no runnable experiment procedure moves into it.

**Verify**: `rtk bun test scripts/` → exit 0; routing fixtures produce exactly one
owner for documentary, empirical, and normative questions.

### Step 5: Catalog and version the skill

Add realistic normal, boundary, and safety evals. Add skill entries to README,
AGENTS, and walkthrough. Do not bump plugin versions here: version bumps are a
release action, decided once per release from live manifest values (plan 009
prepares artifacts and plan 017 derives the sole whole-stack version; per-plan
bumps produced the 0.12.0/0.13.0 arithmetic contradiction this revision removed).
The lockstep-equality check must still
pass unchanged; root `plugin.json` has no version field. Do not update pinned
release tags here; plan 017 owns permanently truthful premerged examples and
Plan 018 later publishes the exact tag without another tracked edit.

**Verify**: version lockstep-equality command, `rtk mise run validate`, and
`rtk git diff --check` all exit 0; validator finds exactly 16 skills and
manual-invocation policy passes.

## Test plan

- One-question routing: documentary, normative, empirical, and mixed questions.
- Happy experiment with exact version/argv/input/output evidence.
- Production/host mutation, secret-bearing output, unapproved network/external
  effect, input/output/evidence/resource overflow, unsupported toolchain, and
  cleanup refusals.
- Operator-run external gate stays AWAITING_OPERATOR until evidence is attached;
  its result is labeled `operator_attested`.
- Contradictory trials retained; no majority collapse.
- Supported/refuted/inconclusive/invalid classifications.
- READY stays stale until an explicit anchored user decision adopts/defers.

## Done criteria

- [ ] New skill is manual-only in every supporting client.
- [ ] It writes only one research experiment folder and source record.
- [ ] Every repository-local run uses the proven verifier; external runs are
  operator-attested and never model-executed.
- [ ] Every ingress, execution, and retained-evidence dimension is bounded;
  overflow fails closed without passing truncation.
- [ ] Every result is reproducible to the extent its retained non-secret primary
  evidence permits; limitations are explicit.
- [ ] Prototype output cannot silently enter production or normative intent.
- [ ] Empirical uncertainty has one available route before READY.
- [ ] 16 skills validate; all artifact evals and version-lockstep checks pass.

## STOP conditions

Stop execution if an experiment needs undeclared external effects, sensitive evidence
cannot be safely represented by digest/pointer, the result cannot be separated
from a product decision, the change would turn Research into an execution skill,
or version lockstep requires a release action not authorized by the operator.

## Maintenance notes

Plan 006 consumes only adopted decisions and evidence digests. Expired prototype
evidence invalidates requirements that explicitly depend on it; it does not
rewrite immutable experiment records.
