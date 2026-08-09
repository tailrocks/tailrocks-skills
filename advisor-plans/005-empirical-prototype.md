# Plan 005: Route empirical uncertainty through isolated prototypes

> **Executor instructions**: Add one manual skill with one narrow write boundary.
> Prototype evidence informs a user decision; it never becomes production or
> READY intent automatically. Run every verification and stop on scope expansion.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- skills/tailrocks-prototype/ skills/tailrocks-{brainstorm,research,finalize}/ README.md AGENTS.md docs/pipeline-walkthrough.md .claude-plugin/ .codex-plugin/ .kimi-plugin/`
> Rebase onto plan 004 and update this baseline before work.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plan 004
- **Category**: feature
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 004

## Why this matters

Some product questions cannot be answered by interviews or web research: API
latency, rendering feasibility, native-client behavior, migration viability.
Guessing makes READY false; turning Research into a code-writing skill breaks its
boundary. A separate manual prototype skill keeps experiments isolated, retains
primary evidence, and requires an explicit user decision before intent changes.

## Current state

- Plan 004 makes `empirical_uncertainty` a READY blocker but intentionally does
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
rtk cargo test -p tailrocks-core source_store
rtk cargo test -p tailrocks-core ready_contract
rtk bun test scripts/
rtk mise run validate
```

Expected: all pass; validator reports 15 skills before this new skill.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Skill tests | `bun test scripts/` | exit 0 |
| Validate | `mise run validate` | exit 0, 16 skills after addition |
| Versions | `bun -e 'const fs=require("fs"); const p=[".claude-plugin/plugin.json",".codex-plugin/plugin.json",".kimi-plugin/plugin.json",".claude-plugin/marketplace.json"].map(x=>JSON.parse(fs.readFileSync(x,"utf8"))); if(new Set(p.map((x,i)=>i===3?x.plugins[0].version:x.version)).size!==1) process.exit(1)'` | exit 0 |
| Diff | `git diff --check` | exit 0 |

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

- Branch: `feat/empirical-prototype-skill`
- Commit subject: `feat(delivery): add empirical prototype route`.
- Use `git commit -s` and Codex co-author trailer. No push/PR without instruction.

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

If the question is normative (“which UX should we choose?”), route to Brainstorm
or Finalize. If documentary, route to Research. If it needs production data,
credentials, users, deploys, or irreversible effects without an approved owner,
stop.

**Verify**: `bun run scripts/validate-skills.ts` → exit 0 and 16 valid skills.

### Step 2: Isolate execution and retain primary evidence

The skill creates only the experiment folder and a disposable execution copy.
The harness may use the fixed Rust/Bun/TanStack house stack; no alternative
package manager/test runner/framework. Run exact commands with captured argv,
cwd, sanitized environment-variable names (never values), timestamps, exit
codes, stdout/stderr digests, tool versions, and input/output digests.

Retain raw results needed to reproduce or audit the observation. Large/sensitive
evidence stores a content digest and approved external pointer, never a secret.
Delete only derivable build/cache output. Prototype code is marked non-production
and is never copied into source automatically.

**Verify**: artifact-grounded eval case `isolation` passes: only the experiment
folder changes, expected raw evidence exists, and a production-path mutation
fails.

### Step 3: Classify result and require an explicit decision

`experiment.json` records `supported | refuted | inconclusive | invalid`, sample
description, raw evidence digests, limitations, and expiry/freshness triggers.
No majority hides a failed trial. Report each result and an appropriate interval
when sampling stochastic behavior.

Append the experiment result as an informative source through plan 004's source
store. Then ask one decision question: adopt, reject, run another bounded
experiment, or defer with reason. Only Record Decision/Finalize can turn that
answer into normative intent and recompile READY.

**Verify**: artifact-grounded eval cases cover supported, contradictory trials,
inconclusive, invalid harness, adoption, and deferral; an observation without a
user decision leaves READY blocked.

### Step 4: Wire state-derived routing without widening Research

Update Brainstorm to classify empirical uncertainty, Research to hand off only
when documents cannot answer it, and Finalize to require a prototype result or
sourced deferral before READY. Each skill names `tailrocks-prototype` explicitly;
none executes its harness on the user's behalf.

Keep `tailrocks-research` source-neutral and fact-oriented. Its only change is a
route/pointer and eval coverage; no runnable experiment procedure moves into it.

**Verify**: `bun test scripts/` → exit 0; routing fixtures produce exactly one
owner for documentary, empirical, and normative questions.

### Step 5: Catalog and version the skill

Add realistic normal, boundary, and safety evals. Add skill entries to README,
AGENTS, and walkthrough. Do not bump plugin versions here: version bumps are a
release action, decided once per release from live manifest values (plan 009
derives the next version; per-plan bumps produced the 0.12.0/0.13.0 arithmetic
contradiction this revision removed). The lockstep-equality check must still
pass unchanged; root `plugin.json` has no version field. Do not update pinned
release tags before an actual release.

**Verify**: version lockstep-equality command, `mise run validate`, and
`git diff --check` all exit 0; validator finds exactly 16 skills and
manual-invocation policy passes.

## Test plan

- One-question routing: documentary, normative, empirical, and mixed questions.
- Happy experiment with exact version/argv/input/output evidence.
- Production mutation, secret-bearing output, network/external effect, unbounded
  benchmark, unsupported toolchain, and cleanup safety refusals.
- Contradictory trials retained; no majority collapse.
- Supported/refuted/inconclusive/invalid classifications.
- READY stays stale until an explicit anchored user decision adopts/defers.

## Done criteria

- [ ] New skill is manual-only in every supporting client.
- [ ] It writes only one research experiment folder and source record.
- [ ] Every run is reproducible from retained non-secret primary evidence.
- [ ] Prototype output cannot silently enter production or normative intent.
- [ ] Empirical uncertainty has one available route before READY.
- [ ] 16 skills validate; all artifact evals and version-lockstep checks pass.

## STOP conditions

Stop if an experiment needs undeclared external effects, sensitive evidence
cannot be safely represented by digest/pointer, the result cannot be separated
from a product decision, the change would turn Research into an execution skill,
or version lockstep requires a release action not authorized by the operator.

## Maintenance notes

Plan 006 consumes only adopted decisions and evidence digests. Expired prototype
evidence invalidates requirements that explicitly depend on it; it does not
rewrite immutable experiment records.
