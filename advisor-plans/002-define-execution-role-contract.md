# Plan 002: Define the provider-neutral execution role contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `rtk git diff --stat 13a5ee5..HEAD -- skills/tailrocks-plan/SKILL.md skills/tailrocks-plan/references/plan-template.md skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-plan/references/execution-roles.md skills/tailrocks-plan/evals/evals.json examples/plan-package/plans/goal-live-status/GOAL.md examples/plan-package/plans/goal-live-status/README.md scripts/goal-check.test.ts scripts/plan-source-neutrality.test.ts scripts/run-evals.ts scripts/run-evals.test.ts`
> If any in-scope file changed, compare the current-state excerpts below with
> live code before proceeding. A load-bearing mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `13a5ee5`, 2026-08-20

## Why this matters

`tailrocks-plan` already produces zero-context implementation plans, but it
treats planner, writer, executor, verifier, and reviewer as generic agents.
That leaves no defensible boundary between work that needs frontier judgment
and work safe for a narrower route. The existing cold-review gate correctly
requires fresh context, but the package carries no explicit role or assurance
record that another host can audit. A provider-neutral role contract makes
bounded delegation and the already-required independence visible in artifacts.

## Current state

- Repository law in `AGENTS.md:11-15` requires one source-neutral `SKILL.md`
  body for every supported client.
- `skills/tailrocks-plan/SKILL.md:13-18` currently names Claude Code, Codex,
  and Grok in the shared body, despite seven supported clients.
- `skills/tailrocks-plan/SKILL.md:117-140` permits inline fallback for excerpt
  verification and the traceability gate when parallel agents are absent, but
  still requires fresh-context cold reviewers and requires every plan to pass
  cold review before completion. Preserve that fail-closed semantic-review
  behavior; do not claim it is a current defect.
- `skills/tailrocks-plan/SKILL.md:144-153` again names only Claude Code,
  Codex, and Grok as handoff clients.
- `skills/tailrocks-plan/references/plan-template.md:3-17` correctly constrains
  the executor to two files and says it is weak at filling gaps.
- `skills/tailrocks-plan/references/plan-template.md:254-310` defines generic
  writer, verifier, and cold-reviewer briefs without capability requirements,
  model provenance, degradation behavior, or escalation ownership.
- `skills/tailrocks-plan/references/goal-handoff.md:1-6,121-127,241-250`
  contains volatile client-specific goal facts for only three clients.
- `skills/tailrocks-plan/evals/evals.json` has five cases. Case 5 already proves
  fresh verification and cold review. None proves role selection, a bounded
  handoff, or an explicit assurance record.
- `examples/plan-package/plans/goal-live-status/GOAL.md:8-10` uses `true` as
  its only gate while lines 27-31 claim `mise run test` and `mise run lint`
  define done. The shipped `goal-check.sh` executes only fenced gates, so this
  example can claim PASS without running either claimed command.
- Fable 5 is documented for long-running, staged planning, delegation, and
  self-checking: <https://www.anthropic.com/claude/fable>. That evidence maps
  it to a role; it must not appear as a hard-coded requirement in shared skill
  prose.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Goal-check unit tests | `rtk bun test scripts/goal-check.test.ts` | all pass |
| Skill validator | `rtk mise run lint` | all skills valid |
| Script tests | `rtk mise run test` | all pass |
| Format check | `rtk mise run fmt` | exit 0 |
| Full CI contract | `rtk mise run ci` | exit 0 |
| Live plan eval | `rtk mise run evals -- --skill tailrocks-plan --case <id> --runs 2` | both repetitions match expected baseline/green phase |

## Suggested executor toolkit

- Invoke `tailrocks-skill-author` because this is a behavioral edit to an
  existing skill. Its red-bar and router-budget rules are binding.

## Scope

**In scope**:

- `skills/tailrocks-plan/SKILL.md`
- `skills/tailrocks-plan/references/plan-template.md`
- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/references/execution-roles.md` (create)
- `skills/tailrocks-plan/evals/evals.json`
- `examples/plan-package/plans/goal-live-status/GOAL.md`
- `examples/plan-package/plans/goal-live-status/README.md`
- `scripts/goal-check.test.ts`
- `scripts/plan-source-neutrality.test.ts` (create)
- `scripts/run-evals.ts`
- `scripts/run-evals.test.ts`
- `skills/tailrocks-plan/README.md` (generated)
- `docs/content/docs/skills/tailrocks-plan/index.mdx` (generated)
- `docs/content/docs/skills/tailrocks-plan/definition.mdx` (generated)
- `advisor-plans/README.md` status row

**Out of scope**:

- Provider names, model IDs, client commands, or price tables in shared skill
  files. Plan 003 owns adapter mappings.
- Automatic model invocation, route selection, adapter separation, judge
  hardening, or workflow-phase orchestration. Plan 004 owns those mechanics.
  This plan narrowly owns loading direct linked Markdown references into the
  existing generic eval subject because its new role contract otherwise cannot
  be exercised; that helper changes context construction for every skill and
  must therefore be verified across the full current skill tree.
- Changing the roadmap status vocabulary globally. A plan package records
  assurance separately and withholds `PLANNED` when the required gate cannot
  be established.
- Weakening zero-context plans to let an executor infer missing decisions.
- Changes to the other six delivery skills. Record follow-up evidence if the
  same independence defect is confirmed there; do not silently broaden scope.

## Git workflow

- Branch: `advisor/002-execution-role-contract` when executed separately.
- Commit message: `feat(plan): define execution capability roles`.
- Commit with `git commit -s`, add
  `Co-authored-by: Codex <codex@openai.com>`, and include
  `Tailrocks-Skill: tailrocks-skill-author` if that skill's execution contract
  requires attribution.
- Do not push or open a PR unless the operator requests it.

## Steps

### Step 1: Repair reference-aware eval context before the baseline

The unchanged runner embeds only `SKILL.md`; a live control cannot test current
or proposed reference guidance until that harness defect is repaired. This is
test infrastructure, not the behavioral skill edit. Complete it before adding
the new role guidance so control and guided variants use the same runner.

First add deterministic `scripts/run-evals.test.ts` regressions requiring
direct Markdown references linked by `SKILL.md` to be collected, bounded, and
included in subject context without permitting an absolute path or `..`
escape. Confirm they fail against the unchanged runner. Then add a narrow
exported helper to `scripts/run-evals.ts` that:

- extracts direct relative Markdown links from the selected `SKILL.md`;
- resolves them inside that skill directory only;
- rejects absolute paths, fragments that resolve outside the skill, and `..`
  escape;
- reads only linked `.md` files, sorts them by normalized relative path, and
  applies explicit per-file and total byte caps;
- embeds each path and content after `SKILL.md` in the subject prompt as
  binding skill material, not as workspace data;
- never follows links recursively.

Because this is shared eval infrastructure, add a deterministic corpus test
that enumerates every current `skills/*/SKILL.md`, collects its direct linked
Markdown references, and proves collection succeeds, ordering is stable,
every resolved path stays inside its owning skill, and the per-file/total caps
hold. The test does not call a model. Live convergence remains scoped to
`tailrocks-plan` because it is the only shipped skill behavior changed here;
plan 004 owns later cross-route/model matrices.

This is the minimum needed for existing live evals to exercise load-bearing
references. Plan 004 owns adapter separation, route selection, workflow phases,
and judge hardening.

**Verify**: `rtk bun test scripts/run-evals.test.ts` → the new assertions are
red before the runner edit, then linked-reference, full-tree corpus, ordering,
cap, and escape tests all pass after it.

### Step 2: Add and run the behavioral red bars

Append realistic eval cases before changing any `tailrocks-plan` skill or
reference file. The Step 1 runner is now fixed, but the skill guidance remains
the unchanged control.

These are contract-selection cases, not requests to mutate a real roadmap
repository. Each prompt says to return only the requested manifest/plan-hub
excerpt or routing decision and that no repository lookup is required. A stop
caused by an absent fixture is setup failure, not a red bar.

1. **Bounded delegation and assurance**: a READY item has exact decisions,
   paths, and gates. Ask for the manifest/profile/assurance portion of its
   completed package. Expected output records `frontier-judgment` for
   decomposition, `bounded-executor` for each self-contained plan,
   `frontier-judgment + independent-verifier` for semantic acceptance, STOP
   escalation back to the frontier owner, and one explicit Assurance record
   containing planned-at SHA, producing role, verification role, observed or
   `unknown` provider/model/version, eval evidence identifier, and `VERIFIED`.
2. **Unavailable fresh context**: ask for the exact plan-hub excerpt produced
   when no fresh reviewer/session exists. Expected output includes a literal
   structured Assurance record with `DEGRADED`, names the missing independence
   property, refuses `PLANNED`, and stops. The judge must not accept a prose
   synonym for the required record.
3. **Unresolved architecture**: a proposed plan still asks its executor to pick
   between two storage designs. Expected output refuses the
   `bounded-executor` label, keeps `frontier-judgment`, and names the unresolved
   decision. This proves that “bounded” is a predicate, not a synonym for
   small.

Add a unit regression in `scripts/goal-check.test.ts` that reads every checked
in example GOAL file, rejects a fenced gate consisting only of `true`, `:`, or
another no-op, and specifically requires the goal-live-status example to name
both `mise run test` and `mise run lint` in the fenced gate block.

Add `scripts/plan-source-neutrality.test.ts` before editing the skill. It scans
only `skills/tailrocks-plan/SKILL.md` and that skill's Markdown references for
the exact client/provider/model product names and lowercase client CLI commands
the plan removes. It must report the existing shared-body and goal-handoff
matches as the deterministic red bar. Keep this regression deliberately scoped
to `tailrocks-plan`: an unrelated shared skill currently contains a
client-specific setup command, and repairing the repository-wide invariant
requires its own red-barred plan rather than a hidden scope expansion.

Run the new live eval cases against the unchanged skill with the repaired
runner. Preserve reports outside the repository or in the implementation PR
description; do not add credential-bearing logs. All three cases must fail in
both repetitions on the missing role/profile/assurance contract, not unavailable
repository fixtures. Do not add a case that tests only refusal of inline cold
review: the unchanged skill already passes that behavior. Case 7 is red only
when its literal structured assurance record is absent; the already-correct
refusal is a preservation condition, not evidence for the edit. If the
CLI/model needed for the baseline is unavailable, STOP.

**Verify**:

```sh
rtk mise run evals -- --skill tailrocks-plan --case 6 --runs 2
rtk mise run evals -- --skill tailrocks-plan --case 7 --runs 2
rtk mise run evals -- --skill tailrocks-plan --case 8 --runs 2
rtk bun test scripts/goal-check.test.ts
rtk bun test scripts/plan-source-neutrality.test.ts
```

→ all live repetitions fail only on the missing role/profile/assurance
contract; the goal regression fails only on the no-op fenced gate; and the
neutrality regression fails only on the named current product/CLI matches. A
split live result is variance to inspect, not a valid red bar.

### Step 3: Define the capability vocabulary once

Create `skills/tailrocks-plan/references/execution-roles.md`. Define exactly
these roles and predicates:

- `human-decision`: unresolved user intent, irreversible authorization, or a
  choice the artifact cannot derive;
- `frontier-judgment`: ambiguous architecture, decomposition, risk/security
  classification, contradiction resolution, escalation, and final semantic
  acceptance;
- `bounded-executor`: one self-contained plan whose inputs, file scope,
  expected edits, commands, done criteria, and STOP conditions are explicit;
- `fast-mechanical`: read-only search, indexing, extraction, formatting, and
  deterministic transformations whose expected form is fully specified;
- `independent-verifier`: a fresh context blind to the producing agent's
  reasoning, read-only, with cited sources and a fixed finding schema. This is
  an independence property plus a review role: mechanical evidence checking
  may use a proven bounded route, but final semantic acceptance must combine
  `independent-verifier` with `frontier-judgment` capability;
- `deterministic-gate`: a local command/schema whose exit status proves only
  the mechanical claim it names.

For each role state: eligibility predicate, forbidden decisions, required
inputs, output/evidence record, escalation triggers, and whether a fresh
context is mandatory. Add the central selection rule:

> Choose the least-capable route whose representative eval is green for the
> exact task shape. Cost never makes a known-wrong route acceptable.

Do not mention Fable, GPT, Sonnet, Haiku, client names, prices, or CLI flags.

**Verify**:

```sh
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Anthropic|OpenAI|Gemini|Fable|Sonnet|Haiku|GPT|Terra|Luna' skills/tailrocks-plan/references/execution-roles.md
rtk rg -n -F '$' skills/tailrocks-plan/references/execution-roles.md
```

→ no matches except literal shell syntax required by an example, which should
normally be none.

### Step 4: Route planning and execution through the roles

Link the new reference from `skills/tailrocks-plan/SKILL.md` without bloating
the router. Update only load-bearing lines:

- the orchestrator owns `frontier-judgment` work;
- fact collection may use `fast-mechanical` workers, but the orchestrator vets
  and synthesizes;
- each generated implementation plan declares an `Execution profile`, usually
  `bounded-executor`; use `frontier-judgment` only when ambiguity cannot be
  removed from the plan;
- every bounded plan routes STOP conditions back to the frontier owner;
- semantic acceptance requires a fresh `independent-verifier` running a route
  qualified for `frontier-judgment`; a cheaper independent verifier may check
  citations/mechanical evidence but cannot issue final semantic acceptance;
  deterministic gates complement but do not replace either.

Remove client names from the introduction and completion text. Say “a
supported goal host” and “manual protocol consumer” instead. Keep the existing
manual-only policy and description within the 250-character post-guard budget.

**Verify**:

```sh
rtk mise run lint
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Anthropic|OpenAI|Gemini|Fable|Sonnet|Haiku|GPT|Terra|Luna' skills/tailrocks-plan/SKILL.md
```

→ lint exits 0 and the router has no client/model matches. The scoped
neutrality test remains red only on `goal-handoff.md` until Step 5 removes its
client-specific protocol. A broader
source-neutrality gate is outside this plan because existing unrelated skill
bodies contain client artifact names and one client-specific setup command;
silently widening scope would violate the red-bar and exact-scope rules.

### Step 5: Make the package carry routing evidence

Update `plan-template.md` and `goal-handoff.md`:

- Add `Execution profile` and `Acceptance profile` to each manifest row and
  plan Status section. Semantic `Acceptance profile` is the explicit
  conjunction `frontier-judgment + independent-verifier`.
- Default a plan to `bounded-executor` only when all bounded-role predicates
  are satisfied. Otherwise keep `frontier-judgment` and name the unresolved
  reason.
- The hub owns a single **Assurance record** containing planned-at SHA,
  producing role, verification role, provider/model/version when the host
  exposes them, eval route/evidence identifier, and `VERIFIED` or `DEGRADED`.
  Unknown runtime metadata stays `unknown`; never fabricate it.
- The executor reads only hub + plan, executes no planning decisions, and
  routes every STOP condition to the frontier owner.
- A semantic reviewer must be fresh-context, read-only, and qualified for
  `frontier-judgment`. Serial fresh sessions are valid; same-context inline
  review is not independent. A bounded fresh verifier may verify excerpts and
  commands, but its evidence still flows to the semantic reviewer.
- When fresh context is impossible, write `DEGRADED` with the missing property,
  do not say “cold reviewed,” do not mark the roadmap item `PLANNED`, and stop.
- Replace three-client goal instructions with one client-neutral kickoff,
  resume, status, and reconciliation protocol. Plan 003 documents how each
  client invokes it.

Keep package-invariant material in the hub; do not repeat it in every plan.

**Verify**:

```sh
rtk rg -n 'Execution profile|Acceptance profile|Assurance|DEGRADED' skills/tailrocks-plan/references/{plan-template,goal-handoff}.md
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Anthropic|OpenAI|Gemini|Fable|Sonnet|Haiku|GPT|Terra|Luna' skills/tailrocks-plan/references/{plan-template,goal-handoff}.md
rtk bun test scripts/plan-source-neutrality.test.ts
```

→ the first command finds all required contract terms; the second finds no
client/model names; the scoped neutrality regression now passes over the whole
plan skill/reference surface.

### Step 6: Correct the golden example

Update the example hub to the new manifest and assurance shape. Replace the
GOAL no-op gate with:

```sh
mise run test
mise run lint
```

Keep those same commands in the kickoff done condition. Set example provider,
model, and version metadata to explicit fixture values such as `example`, not
to a real current model. This package is instructional evidence, not a claim
that a live model ran it.

**Verify**: `rtk bun test scripts/goal-check.test.ts` → all pass, including the
no-op-gate regression.

### Step 7: Re-run the complete skill eval set

Run all eight `tailrocks-plan` eval cases after the edit. Use a
frontier-judgment route for the skill subject until plan 004 introduces formal
route selection. Each case must pass; preserve only redacted summaries.

**Verify**:

```sh
for case_id in 1 2 3 4 5 6 7 8; do
  rtk mise run evals -- --skill tailrocks-plan --case "$case_id" --runs 2 || exit 1
done
```

→ both repetitions of every case pass. If variability produces a failure,
inspect the retained
workspace, correct the contract rather than the expected output, then rerun the
full set.

### Step 8: Regenerate and run repository gates

Regenerate all derived docs after the `SKILL.md` edit, then run the repository
contract.

**Verify**:

```sh
rtk mise run docs
rtk mise run lint
rtk mise run test
rtk mise run fmt
rtk mise run ci
rtk git diff --check
```

→ all exit 0.

## Test plan

- Three new live eval cases prove bounded role selection, a literal degraded
  assurance record when independence is unavailable, and refusal to mislabel
  unresolved architecture as bounded.
- `scripts/run-evals.test.ts` proves every direct linked skill reference enters
  eval context under deterministic path, ordering, and byte-cap rules.
- Existing eval 5 continues proving citation verification and cold review; its
  expected output now names the role requirements and rejects inline fallback.
- `scripts/goal-check.test.ts` rejects no-op fenced gates in checked-in example
  packages and asserts the two real example gates.
- `scripts/plan-source-neutrality.test.ts` prevents product names and client
  commands from returning to the changed plan skill/reference surface.
- Full `tailrocks-plan` eval set runs after any router/reference change, as
  required by `tailrocks-skill-author`.

## Done criteria

- [ ] One linked provider-neutral reference defines all six roles and their
      eligibility, forbidden decisions, evidence, and escalation rules.
- [ ] Shared `tailrocks-plan` files contain no client or model names.
- [ ] A scoped deterministic regression prevents client/provider/model product
      names and client CLI commands from returning to the changed plan skill
      and its references.
- [ ] Every plan manifest/plan records execution and acceptance profiles.
- [ ] Every package records model/provider/version only when observed and
      records `DEGRADED` instead of inventing assurance.
- [ ] Same-context inline review cannot satisfy an independent-review gate.
- [ ] Final semantic acceptance requires both fresh independence and a route
      qualified for frontier judgment; a cheap verifier cannot self-qualify.
- [ ] Live skill evals load every direct linked reference, including the role
      contract, under path and byte caps.
- [ ] Missing fresh context prevents `PLANNED` certification.
- [ ] The example goal runs `mise run test` and `mise run lint`; no no-op gate
      can pass its regression test.
- [ ] All eight live skill eval cases pass after a recorded red baseline.
- [ ] `rtk mise run lint`, `test`, `fmt`, and `ci` exit 0.
- [ ] No file outside Scope changed, excluding generated files and the status
      row.
- [ ] `advisor-plans/README.md` marks plan 002 `DONE`.

## STOP conditions

- Required live baseline evals cannot run because the configured client/model
  is unavailable. Do not make the behavioral edit without the red bar.
- A role cannot be described without a provider/model name. The predicate is
  underspecified; fix the role abstraction first.
- The implementation tries to infer model quality from price alone.
- The host cannot provide a fresh context and the proposed code still marks the
  package fully reviewed or `PLANNED`.
- Adding the reference pushes the router over its enforced description or line
  budget; strengthen/replace existing prose instead of appending.
- Correcting the example requires changing application source outside the
  example package or the goal-check test.
- Any verification fails twice after a reasonable correction.

## Maintenance notes

- Reviewers should challenge every `bounded-executor` assignment: the plan must
  remove decisions, not merely call them “small.”
- Model mappings in plan 003 may change frequently; the role predicates should
  remain stable.
- Similar inline fallback language appears in research, brainstorm, finalize,
  and reconcile flows. This execution did not prove it creates false semantic
  acceptance there; audit each skill with its own red bar before changing it.
