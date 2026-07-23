# Plan 013: Design spike — an eval runner for the 14 skills

> **Executor instructions**: This is a DESIGN SPIKE: the deliverable is a
> design document plus a walking-skeleton prototype, not a finished
> harness. Follow the steps; where the design demands a decision this
> plan doesn't settle, record it as an open question in the deliverable
> instead of improvising a resolution. When done, update this plan's
> status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- 'skills/*/evals/evals.json' scripts/`
> If plan 005 landed, fixtures exist — design against them; if not, note
> that the runner design targets the post-005 shape.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (LLM-judged evals are noisy; the spike's job is to find
  out whether a stable scoring contract is achievable before building)
- **Depends on**: advisor-plans/005 (soft — the fixture/`files`
  convention; design can precede, prototype needs it)
- **Category**: direction
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

47 structured eval cases exist and nothing can run them — the repo's
product is prompt text with zero behavioral regression signal. A runner
turns every future SKILL.md edit into a measurable change. The open
problems are real (judge stability, cost, agent-neutral execution), which
is why this is a spike, not a build-everything plan.

## Current state

- Eval schema (all 14 files): `{"skill_name", "evals": [{"id", "prompt",
  "expected_output", "files"}]}`; post-005: `files` lists fixture paths
  relative to the skill directory, `expected_output` is an enumerated
  must-include list.
- No runner, no package.json, no CI eval job. Validator checks shape
  only. CI (plan 004) runs validator + its tests.
- Available substrate: Bun scripts (house convention), `claude` CLI
  headless (`claude -p`, documented in
  `skills/tailrocks-plan/references/goal-handoff.md` Headless section)
  as one execution backend; other agents (Codex etc.) optional backends.
- House constraint: skills are manual-only; a runner must invoke the
  skill explicitly in its prompt (e.g. instruct the model to follow
  `skills/<name>/SKILL.md` read from disk) rather than rely on
  auto-triggering.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Prototype run | `bun scripts/run-evals.ts --skill tailrocks-idea --case 1` (shape per design) | JUDGE verdict JSON |
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |

Requires an Anthropic-capable CLI (`claude`) authenticated in the
environment; STOP if absent.

## Scope

**In scope** (create only):
- `docs/eval-runner-design.md`
- `scripts/run-evals.ts` (walking skeleton: one skill, one case,
  end-to-end)

**Out of scope**:
- Full 47-case implementation, CI wiring (follow-up after the spike's
  verdict), eval content edits (005), validator changes (003).

## Git workflow

- Branch: `advisor/013-eval-runner-spike`.
- Conventional Commits, DCO (`git commit -s`). Main PR-only; no push/PR
  unless instructed.

## Steps

### Step 1: Write the design doc

`docs/eval-runner-design.md` must decide and record:

- **Execution model**: subject-under-test = SKILL.md text injected into a
  fresh headless session (`claude -p` with the skill body + case prompt +
  fixtures staged in a temp dir), so results don't depend on plugin
  installation state. Agent-neutral note: same shape works for other
  CLIs later; v1 targets `claude -p` only.
- **Fixture staging**: copy the case's `files` into a temp working dir;
  the model runs there read-only-by-default (permission mode note).
- **Judge protocol**: second `claude -p` call, judge prompt = case
  `expected_output` (enumerated claims) + transcript/output; verdict JSON
  `{pass, per_claim: [{claim, met, evidence}], notes}`. Stability
  levers to evaluate: k-run majority (k=3) vs single-run with
  claim-level granularity; temperature 0 note; cost estimate per full
  sweep (47 cases × runs).
- **Safety-case semantics**: for decline-expected cases, the judge
  checks the model refused the mutation and said why.
- **Flake policy**: a case is red only if the same claim fails across
  the majority; borderline output → `investigate` status, never silent
  pass.
- **Open questions list**: whatever the prototype leaves unproven.

**Verify**: doc exists; contains sections for all six bullets
(`grep -c "^## " docs/eval-runner-design.md` → ≥ 6).

### Step 2: Build the walking skeleton

`scripts/run-evals.ts`: CLI args `--skill <name> [--case <id>]
[--runs <k>]`; loads the evals.json, stages fixtures, executes the
subject call, executes the judge call, prints verdict JSON, exit 0/1 on
pass/fail. Hardcode nothing skill-specific.

**Verify**: run it against `tailrocks-idea` case 1 (a no-fixture case:
capturing an idea into a temp dir) → a verdict JSON with `per_claim`
entries; run twice; record whether verdicts agree.

### Step 3: Spike verdict

Append to the design doc: prototype results (verdict stability across
≥ 3 runs of ≥ 2 cases, wall-clock + token cost), and the go/no-go
recommendation with the follow-up build scope if go.

**Verify**: "## Spike verdict" section present with measured numbers, not
estimates.

## Test plan

The prototype run IS the test. Machine artifacts: two verdict JSONs
committed into the design doc as fenced examples (values from real runs).

## Done criteria

- [ ] Design doc with the six decision sections + spike verdict with
      measured stability/cost numbers
- [ ] `scripts/run-evals.ts` runs one real case end-to-end, exit code
      reflects verdict
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated (note go/no-go in the
      row)

## STOP conditions

Stop and report back if:

- No authenticated `claude` CLI in the environment (prototype
  unrunnable) — deliver the design doc alone and say so.
- Judge verdicts flip across runs with no stable majority on 2/2 tested
  cases — that IS the spike result; write the no-go verdict, do not
  build workarounds.

## Maintenance notes

- If go: follow-up plan should wire `bun scripts/run-evals.ts --all`
  into plan 004's workflow as a scheduled (not per-PR) job — cost.
- The `files` staging convention must match what plan 005 chose
  (skill-directory-relative); the design doc restates it.
