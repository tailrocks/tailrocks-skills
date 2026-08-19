# Plan 002: Define the provider-neutral execution role contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **2026-08-20 continuation capsule**: the reusable control state is the
> detached worktree `/tmp/tailrocks-improve-exec.QAVFF2` at exact base
> `e7cba7a564d0e66d0a6a93c13f59f3733ca01bbb`. Before editing, run
> `rtk proxy git rev-parse HEAD`, `rtk proxy git status --short`, and
> `rtk proxy shasum -a 256 scripts/run-evals.ts scripts/run-evals.test.ts scripts/goal-check.test.ts scripts/plan-source-neutrality.test.ts skills/tailrocks-plan/evals/evals.json` there. The status must contain exactly four modified files plus the one
> untracked file named below, and the hashes must match the recorded values:
>
> ```text
>  M scripts/goal-check.test.ts
>  M scripts/run-evals.test.ts
>  M scripts/run-evals.ts
>  M skills/tailrocks-plan/evals/evals.json
> ?? scripts/plan-source-neutrality.test.ts
> f9a82ce2a521885c5103e2b03d41a08711bc5b5cd5c54d8cdc16c010e6b0ec26  scripts/run-evals.ts
> ccc4226d53540ec832266bb51b91a34c5b551f83ebd7f21d906575ddb2c837ab  scripts/run-evals.test.ts
> 55be1e1cb0dfc2bd7e125c7d84c092f67d985d50df9a9fbd631e01de73085882  scripts/goal-check.test.ts
> 1ee766bc532a7b39407fed77290b6358fb12509b52406743375877896c7cfab6  scripts/plan-source-neutrality.test.ts
> ed3517cde546961454535c7f0342aa186d37e5629d1949609d6daeef7e6e3c96  skills/tailrocks-plan/evals/evals.json
> ```
>
> These bytes produced the recorded case-7/case-8 controls. If the worktree,
> base, inventory, `scripts/run-evals.ts`, or eval prompts/expected outputs do
> not match, do not reset or overwrite it and do not reuse the counts. Create a
> fresh detached worktree at the exact base, repeat Steps 1-2 and all five
> controls, then continue there. Matching state must be preserved and extended,
> not recreated.
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

- Branch: remain on the operator's existing shared execution branch. The
  implementation worktree stays detached until its accepted commit is
  published onto that branch. Do not create another branch or PR.
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

The continuation currently replaced, rather than extended, the seven existing
`eval runner helpers` regressions. Before any skill/reference edit, restore
those seven baseline tests verbatim from
`e7cba7a564d0e66d0a6a93c13f59f3733ca01bbb:scripts/run-evals.test.ts` and keep
the four linked-material tests. No existing fixture-staging, escape,
artifact-truncation, aggregate-retention, or retry assertion may disappear.

The linked-material tests require
direct Markdown references linked by `SKILL.md` to be collected, bounded, and
included in subject context without permitting an absolute path or `..`
escape. On a fresh fallback worktree, confirm they fail against the unchanged
runner and then add the helper. On the exact matching continuation capsule, the
red and helper already exist: reuse that observed harness red/green, do not
overwrite `scripts/run-evals.ts`, and proceed directly to restoring/extending
the tests. The helper must:

- extracts direct relative Markdown links from the selected `SKILL.md`;
- resolves them inside that skill directory only;
- rejects absolute paths, fragments that resolve outside the skill, and `..`
  escape;
- reads only linked `.md` files, sorts them by normalized relative path, and
  applies explicit per-file and total byte caps;
- embeds each path and content after `SKILL.md` in the subject prompt as
  binding skill material, not as workspace data;
- never follows links recursively.

Because this is shared eval infrastructure, replace the self-referential corpus
assertion with an independent oracle: check in an
`EXPECTED_DIRECT_MARKDOWN_LINKS` map that lists every current skill and its
exact direct relative Markdown targets, including empty arrays. Assert the
globbed skill-name set exactly equals the map's keys; compare the collector's
paths exactly with each independently recorded sorted list. Then render each
skill's materials through the actual subject-context renderer and assert every
expected path has one binding-material block containing its collected content.
Also prove every resolved path stays inside its owner and both caps hold.
Returning `[]` for every skill, omitting a target, or collecting but not
rendering it must fail. The test does not call a model. Live convergence remains
scoped to `tailrocks-plan`; plan 004 owns later cross-route/model matrices.

This is the minimum needed for existing live evals to exercise load-bearing
references. Plan 004 owns adapter separation, route selection, workflow phases,
and judge hardening.

**Verify**: `rtk bun test scripts/run-evals.test.ts` → all seven preserved
baseline tests plus linked-reference, independent full-tree oracle/rendering,
ordering, cap, and escape tests pass. The output must report at least eleven
passing tests and zero failures; fewer means prior coverage was dropped.

### Step 2: Add and run the behavioral red bars

Append realistic eval cases before changing any `tailrocks-plan` skill or
reference file. The Step 1 runner is now fixed, but the skill guidance remains
the unchanged control.

These are contract-selection cases, not requests to mutate a real roadmap
repository. Each prompt says to return only the requested manifest/plan-hub
excerpt or routing decision and that no repository lookup is required. A stop
caused by an absent fixture is setup failure, not a red bar.

1. **Unavailable fresh context** (case 7): ask for the exact plan-hub excerpt produced
   when no fresh reviewer/session exists. Expected output includes a literal
   structured Assurance record with `DEGRADED`, names the missing independence
   property, refuses `PLANNED`, and stops. The judge must not accept a prose
   synonym for the required record.
2. **Unresolved architecture** (case 8): a proposed plan still asks its executor to pick
   between two storage designs. Expected output refuses the
   `bounded-executor` label, keeps `frontier-judgment`, and names the unresolved
   decision. This proves that “bounded” is a predicate, not a synonym for
   small.

The stopped 2026-08-20 control run also tested a normal bounded package as
temporary case 6. It passed unchanged guidance in both repetitions, so that
case is non-discriminating and must be removed rather than kept as evidence for
new guidance. Keep IDs 7 and 8 for the two earned cases; eval IDs need only be
unique, not contiguous. Add a deterministic assertion in
`scripts/run-evals.test.ts` that the ordered `tailrocks-plan` eval ID list is
exactly `[1, 2, 3, 4, 5, 7, 8]`. Run that single test first and observe it fail
with actual IDs `[1, 2, 3, 4, 5, 6, 7, 8]`; then delete only case 6 and rerun
the full runner suite green. Do not edit cases 7/8 before deciding whether the
recorded controls remain reusable.

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

Run five independent control repetitions per case against the unchanged skill
with the repaired runner; preserve only redacted summaries. The current
execution already recorded case 7 at 0/5 and case 8 at 4/5. Case 7 proves the
missing structured degraded-assurance behavior. Case 8 proves a convergence
defect: core rejection is already correct, but one control omitted the exact
auditable role assignment. Guidance must move both variants to 5/5 without
weakening the core STOP behavior. Reuse is permitted only after the continuation
capsule proves the exact base and byte identity. Restoring the seven deleted
unit tests does not affect the live corpus; any edit to `scripts/run-evals.ts`
or either case's prompt/expected output invalidates reuse and requires all five
controls again. If the CLI/model is unavailable, STOP.

**Verify**:

```sh
# Run the two live commands only when the continuation capsule did not match;
# a matching capsule reuses the recorded 0/5 and 4/5 controls.
rtk mise run evals -- --skill tailrocks-plan --case 7 --runs 5
rtk mise run evals -- --skill tailrocks-plan --case 8 --runs 5
rtk bun test scripts/run-evals.test.ts -t "keeps exactly the earned tailrocks-plan eval cases"
rtk bun test scripts/run-evals.test.ts
rtk bun test scripts/goal-check.test.ts
rtk bun test scripts/plan-source-neutrality.test.ts
```

→ case 7 is 0/5, case 8 records its exact pass/fail distribution, the runner
suite fails only because temporary case 6 is still present (then turns green
when case 6 is deleted), the goal
regression fails only on the no-op fenced gate, and the neutrality regression
fails only on named current product/CLI matches. The case-8 split is retained
as measured convergence evidence, not misreported as a universal failure.

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
Because this step adds one direct router link, update only the
`tailrocks-plan` entry in `EXPECTED_DIRECT_MARKDOWN_LINKS` with the sorted
`references/execution-roles.md` target and rerun the corpus/rendering test here.

**Verify**:

```sh
rtk mise run lint
rtk bun test scripts/run-evals.test.ts
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Anthropic|OpenAI|Gemini|Fable|Sonnet|Haiku|GPT|Terra|Luna' skills/tailrocks-plan/SKILL.md
```

→ lint and all runner tests pass, the independent oracle proves the newly
linked reference reaches rendered subject context, and the router has no
client/model matches. The scoped
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

### Step 7: Re-run convergence and the complete skill eval set

First run the two new variants five times each; both must converge at 5/5.
Then run all seven `tailrocks-plan` eval cases after the edit with the
repository-required two repetitions. Use a
frontier-judgment route for the skill subject until plan 004 introduces formal
route selection. Each case must pass; preserve only redacted summaries.

**Verify**:

```sh
rtk mise run evals -- --skill tailrocks-plan --case 7 --runs 5
rtk mise run evals -- --skill tailrocks-plan --case 8 --runs 5
for case_id in 1 2 3 4 5 7 8; do
  rtk mise run evals -- --skill tailrocks-plan --case "$case_id" --runs 2 || exit 1
done
```

→ cases 7/8 are 5/5 and both repetitions of every case pass. If variability
produces a failure, inspect the retained
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

- Two earned live eval cases prove a literal degraded assurance record when
  independence is unavailable and converge on refusal to mislabel unresolved
  architecture as bounded. The non-discriminating normal case is removed.
- `scripts/run-evals.test.ts` proves every direct linked skill reference enters
  eval context under deterministic path, ordering, and byte-cap rules.
- Existing eval 5 and its expected output remain unchanged, preserving citation
  verification and fresh cold-review behavior. Only cases 7/8 own the new
  auditable role/assurance expectations.
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
- [ ] All seven live skill eval cases pass twice after recorded controls, and
      the two new variants converge at 5/5.
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
