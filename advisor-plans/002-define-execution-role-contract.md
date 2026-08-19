# Plan 002: Define the provider-neutral execution role contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `rtk git diff --stat 13a5ee5..HEAD -- skills/tailrocks-plan/SKILL.md skills/tailrocks-plan/references/plan-template.md skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-plan/references/execution-roles.md skills/tailrocks-plan/evals/evals.json examples/plan-package/plans/goal-live-status/GOAL.md examples/plan-package/plans/goal-live-status/README.md scripts/goal-check.test.ts scripts/run-evals.ts scripts/run-evals.test.ts`
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
and work safe for a lower-cost model. It also silently calls inline self-review
“fresh-context” review when delegation is unavailable. A provider-neutral role
contract makes bounded delegation auditable and makes missing independence a
visible failure instead of a false certification.

## Current state

- Repository law in `AGENTS.md:11-15` requires one source-neutral `SKILL.md`
  body for every supported client.
- `skills/tailrocks-plan/SKILL.md:13-18` currently names Claude Code, Codex,
  and Grok in the shared body, despite seven supported clients.
- `skills/tailrocks-plan/SKILL.md:117-140` requires fresh verification and
  cold review but permits both to run inline when parallel agents are absent.
  Inline work has the same reasoning context, so it does not preserve the
  asserted independence.
- `skills/tailrocks-plan/SKILL.md:144-153` again names only Claude Code,
  Codex, and Grok as handoff clients.
- `skills/tailrocks-plan/references/plan-template.md:3-17` correctly constrains
  the executor to two files and says it is weak at filling gaps.
- `skills/tailrocks-plan/references/plan-template.md:254-310` defines generic
  writer, verifier, and cold-reviewer briefs without capability requirements,
  model provenance, degradation behavior, or escalation ownership.
- `skills/tailrocks-plan/references/goal-handoff.md:1-6,121-127,241-250`
  contains volatile client-specific goal facts for only three clients.
- `skills/tailrocks-plan/evals/evals.json` has five cases. None proves role
  selection, bounded-executor handoff, or fail-closed behavior when a fresh
  verifier is unavailable.
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
| Live plan eval | `rtk mise run evals -- --skill tailrocks-plan --case <id> --runs 1` | exit matches expected baseline/green phase |

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
- `scripts/run-evals.ts`
- `scripts/run-evals.test.ts`
- `skills/tailrocks-plan/README.md` (generated)
- `docs/content/docs/skills/tailrocks-plan/index.mdx` (generated)
- `docs/content/docs/skills/tailrocks-plan/definition.mdx` (generated)
- `advisor-plans/README.md` status row

**Out of scope**:

- Provider names, model IDs, client commands, or price tables in shared skill
  files. Plan 003 owns adapter mappings.
- Automatic model invocation or runtime routing. This plan defines the
  artifact contract; plan 004 owns eval runner mechanics.
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

### Step 1: Add and run the behavioral red bars

Append realistic eval cases before changing the skill:

1. **Bounded delegation**: a READY item has exact decisions, paths, and gates;
   expected output records `frontier-judgment` for decomposition/acceptance,
   `bounded-executor` for each self-contained implementation plan, and STOP
   escalation back to the frontier owner.
2. **No independent context**: the host exposes no subagents or fresh session;
   expected output must not claim cold review or set the item `PLANNED`; it
   records degraded assurance and stops with the package still unblessed.
3. **Provider-neutral handoff**: request a GOAL package for an unnamed
   supported client; expected output is one generic protocol with no client or
   provider syntax.

Add a unit regression in `scripts/goal-check.test.ts` that reads every checked
in example GOAL file, rejects a fenced gate consisting only of `true`, `:`, or
another no-op, and specifically requires the goal-live-status example to name
both `mise run test` and `mise run lint` in the fenced gate block.

Add a deterministic `scripts/run-evals.test.ts` regression requiring direct
Markdown references linked by `SKILL.md` to be collected, bounded, and included
in subject context without permitting an absolute path or `..` escape. Current
code embeds only `SKILL.md`, so this assertion must be red before the edit.

Run the new live eval cases against the unchanged skill. Preserve the reports
outside the repository or in the implementation PR description; do not add
credential-bearing logs. At least the independence and provider-neutral cases
must fail for the expected current behavior. If the CLI/model needed for the
baseline is unavailable, STOP: repository doctrine forbids a behavioral edit
without the observed red bar.

**Verify**:

```sh
rtk mise run evals -- --skill tailrocks-plan --case 6 --runs 1
rtk mise run evals -- --skill tailrocks-plan --case 7 --runs 1
rtk mise run evals -- --skill tailrocks-plan --case 8 --runs 1
rtk bun test scripts/goal-check.test.ts
```

→ new cases/tests fail only on the missing role/degradation/gate behavior.

### Step 2: Make linked references available to skill evals

Before relying on the new role reference, add a narrow exported helper to
`scripts/run-evals.ts` that:

- extracts direct relative Markdown links from the selected `SKILL.md`;
- resolves them inside that skill directory only;
- rejects absolute paths, fragments that resolve outside the skill, and `..`
  escape;
- reads only linked `.md` files, sorts them by normalized relative path, and
  applies explicit per-file and total byte caps;
- embeds each path and content after `SKILL.md` in the subject prompt as
  binding skill material, not as workspace data;
- never follows links recursively.

This is the minimum needed for existing live evals to exercise load-bearing
references. Plan 004 owns adapter separation, route selection, workflow phases,
and judge hardening.

**Verify**: `rtk bun test scripts/run-evals.test.ts` → linked-reference,
ordering, cap, and escape tests all pass.

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
rtk rg -n 'Fable|GPT|Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity' skills/tailrocks-plan/references/execution-roles.md
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
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Fable|GPT' skills/tailrocks-plan/SKILL.md
```

→ lint exits 0; the shared body has no client/model matches.

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
rtk rg -n 'Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Fable|GPT' skills/tailrocks-plan/references/{plan-template,goal-handoff}.md
```

→ the first command finds all required contract terms; the second finds no
client/model names.

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
  rtk mise run evals -- --skill tailrocks-plan --case "$case_id" --runs 1 || exit 1
done
```

→ every run exits 0. If variability produces a failure, inspect the retained
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

- Three new live eval cases prove bounded role selection, fail-closed missing
  independence, and provider-neutral handoff.
- `scripts/run-evals.test.ts` proves every direct linked skill reference enters
  eval context under deterministic path, ordering, and byte-cap rules.
- Existing eval 5 continues proving citation verification and cold review; its
  expected output now names the role requirements and rejects inline fallback.
- `scripts/goal-check.test.ts` rejects no-op fenced gates in checked-in example
  packages and asserts the two real example gates.
- Full `tailrocks-plan` eval set runs after any router/reference change, as
  required by `tailrocks-skill-author`.

## Done criteria

- [ ] One linked provider-neutral reference defines all six roles and their
      eligibility, forbidden decisions, evidence, and escalation rules.
- [ ] Shared `tailrocks-plan` files contain no client or model names.
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
- The same inline-independence defect appears in research, brainstorm,
  finalize, and reconcile flows. Audit those skills against this contract in a
  later, separately red-barred change rather than broadening this implementation
  silently.
