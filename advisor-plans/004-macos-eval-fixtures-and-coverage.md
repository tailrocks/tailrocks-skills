# Plan 004: Give the six macOS skills fixture-backed, coverage-complete eval suites

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-macos-design/evals skills/tailrocks-liquid-glass/evals skills/tailrocks-swift-best-practices/evals skills/tailrocks-swift-project-setup/evals skills/tailrocks-macos-visual-qa/evals skills/tailrocks-sketch-handoff/evals scripts/validate-skills.ts mise.toml AGENTS.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED (stricter grading will turn some currently-green cases red; that is signal, not breakage)
- **Depends on**: `advisor-plans/001-artifact-graded-evals.md` (the runner must preserve fixture paths and grade artifacts before fixtures are worth adding)
- **Category**: tests
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

All 24 eval cases across the six macOS skills carry `"files": []` while their prompts say "this window", "this table", "this screenshot" — so the suite grades whether a model can *recite* the router, never whether it can *detect* a violation in real code. Six of the family's 19 declared modes (liquid-glass `adopt`/`remediate`, swift-project-setup `remediate`, macos-design `extract`, sketch-handoff `audit`, macos-visual-qa `harness`), all six "Final gate" sections, and every cross-skill handoff have zero coverage. Nine non-macOS skills in this repo already ship fixtures, so this is a gap against house convention. The eval suite is the only behavioral check these skills have (they ship no compilable artifact), and AGENTS.md's router-budget rules make eval reruns the mechanism that protects load-bearing prose — protection that currently covers roughly half of each router.

## Current state

Files and roles:

- `scripts/run-evals.ts` — the runner. After plan 001 lands it stages fixtures path-preserving, feeds an artifact listing to the judge, retains failed workspaces, and exits 0 only when all runs pass. Invocation: `bun scripts/run-evals.ts --skill <name> --case <id> --runs <k>`; needs the `claude` CLI and spends up to $0.75/agent call (line 46: `--max-budget-usd 0.75`).
- `scripts/validate-skills.ts` — static validator. Lines 190-202 type-check each eval case (`id`, `prompt`, `expected_output`, `Array.isArray(files)`) but never resolve `files` entries against disk and never check id uniqueness.
- `skills/<name>/evals/evals.json` — 4 cases per macOS skill, all `"files": []`.
- Fixture convention exemplar: `skills/tailrocks-contribute/evals/evals.json` and `skills/tailrocks-axum-best-practices/evals/` use `evals/fixtures/<case>/...` paths in `files`. The runner resolves entries: prefix `skills/` → repo-root-relative, otherwise skill-dir-relative (`run-evals.ts:73`).
- `mise.toml` (repo root) — defines only `[tasks.validate]`. There is no documented way to run evals; `run-evals.ts` is named in exactly one file (`docs/eval-runner-design.md`).
- `AGENTS.md` "Router budget" section (lines ~248-268) — requires re-running a skill's eval cases after any router edit, without saying how.

Current liquid-glass suite, verbatim shape (all six files share it):

```json
// skills/tailrocks-liquid-glass/evals/evals.json:4-8
{
  "id": 1,
  "prompt": "Audit this macOS SwiftUI window for Liquid Glass violations. Do not edit anything.",
  "expected_output": "Produces a read-only violation report that classifies every region as content or functional, ...",
  "files": []
}
```

Coverage gaps to close, per skill (verified against each SKILL.md at `64df333`):

| Skill | Uncovered modes | Uncovered load-bearing router rules |
|---|---|---|
| tailrocks-liquid-glass | `adopt`, `remediate` (SKILL.md:31-34) | decision-order steps 2 & 4 (:53-62 — background deletion; `safeAreaBar` vs `overlay`), modifier order (:95-97), mutation-permission guard (:36-37), Final gate output (:175-182) |
| tailrocks-macos-design | `extract` (SKILL.md:33) | archetype naming gate (:50-61), Stage-4 selection/decision log (:118-123), motion criteria (:192-202), Preserve + caps in review output (references/rubric.md:168-204), never-edit-source (:22) |
| tailrocks-swift-best-practices | (no Modes section) | work-inside-`body` (:63-67), typed failure w/ recovery, accessibility semantics, keyboard/menu-bar parity (:110-122) |
| tailrocks-swift-project-setup | `remediate` (SKILL.md:32-34) | task-parity requirement (:111-121), freshness gate / never-stale-versions (:16-25) |
| tailrocks-macos-visual-qa | `harness` (SKILL.md:35) | failed-restore reporting (:96), missing Screen Recording grant, Automation permission in report (:122-125 — case 4 asserts only 2 of 3 permissions) |
| tailrocks-sketch-handoff | `audit` (SKILL.md:38) | NATIVE-row forbidden-column minimum, detached-kit-symbol finding |

Duplicate case: `tailrocks-macos-design` cases 1 and 3 both test structurally-distinct-alternatives (SKILL.md:104-116); repoint case 3.

House rules that bind this plan (from `AGENTS.md`):

- Never weaken an existing `expected_output` — extend only.
- Eval-load-bearing router lines are not reworded here; this plan adds cases and fixtures, it does not edit any `SKILL.md`.
- New material defaults to references/fixtures, not routers.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Script tests | `bun test scripts/` | exit 0 (7+ tests) |
| Run one eval | `bun scripts/run-evals.ts --skill tailrocks-liquid-glass --case 1 --runs 2` | JSON summary, exit 0, `passed: 2` |
| Fixture paths resolve | (added in step 1) `bun test scripts/` | includes new validator tests |

Note: `bun` is provisioned by `mise install` (pinned in `mise.toml`); if `bun` is not on PATH it lives under `~/.local/share/mise/installs/bun/*/bin/bun`.

## Scope

**In scope** (the only files you may modify/create):

- `scripts/validate-skills.ts` (extend eval checks) and `scripts/validate-skills.test.ts`
- `mise.toml` (add `[tasks.evals]`)
- `AGENTS.md` (one paragraph: how to run evals; fixtures expectation in "Adding a Skill" step 3)
- `skills/tailrocks-{macos-design,liquid-glass,swift-best-practices,swift-project-setup,macos-visual-qa,sketch-handoff}/evals/evals.json`
- `skills/tailrocks-{...same six...}/evals/fixtures/**` (new)

**Out of scope** (do NOT touch):

- Any `SKILL.md`, `references/`, or `templates/` file — content fixes belong to plans 005-011; if a new eval case fails because the router is wrong, record the failure and keep the case (the router fix is another plan's job).
- `scripts/run-evals.ts` — owned by plan 001.
- `.github/workflows/` — owned by plan 012.
- The other 15 skills' evals.

## Git workflow

- Branch: `advisor/004-macos-eval-fixtures`
- Conventional Commits with DCO: `git commit -s`, e.g. `test(evals): add fixture-backed cases for the macOS family`
- Main is PR-only; open a PR with `gh pr create` when the change set is complete. Do not push to main.

## Steps

### Step 1: Extend the validator's eval checks

In `scripts/validate-skills.ts` (eval loop at ~line 190):

1. Assert case ids are unique per file.
2. Resolve every `files` entry using the same rule as the runner (`skills/`-prefixed → repo root, else skill-relative) and assert the path exists. Extract this resolution into a small exported helper if plan 001 has not already shared one; if 001 landed a shared helper, import it instead of duplicating.
3. Add tests in `scripts/validate-skills.test.ts` following the existing test style there: one fixture-missing case, one duplicate-id case.

**Verify**: `bun test scripts/` → exit 0 with the two new tests listed; `mise run validate` → `Validated 21 skills.` exit 0.

### Step 2: Add `[tasks.evals]` and document the run command

In root `mise.toml`, add:

```toml
[tasks.evals]
description = "Run one skill eval case (needs the claude CLI; spends budget)"
run = "bun scripts/run-evals.ts"
```

In `AGENTS.md`, in the "Router budget" section right after the sentence requiring eval reruns, add two sentences naming the command (`mise run evals -- --skill <name> --case <id> --runs 2`) and stating it needs the `claude` CLI and spends budget, so it is run locally before tagging, not in PR CI. In "Adding a Skill" step 3, append: audit/review-shaped cases should reference fixtures under `evals/fixtures/<case>/`; refusal cases may stay fixture-free.

**Verify**: `mise tasks | grep evals` → row present; `grep -n "run-evals" AGENTS.md` → ≥1 match.

### Step 3: Author fixtures for the four audit/review-shaped existing cases

Create minimal fixtures (each ≤ ~60 lines) and reference them from the existing cases' `files` arrays — extend `expected_output` only by appending artifact-specific clauses (e.g. "...names the `glassEffect` on the row background at its file and line"):

1. `tailrocks-liquid-glass` case 1: `evals/fixtures/1/RecordsWindow.swift` — a SwiftUI window with (a) `.glassEffect` on a `List` row background, (b) a hard-coded `cornerRadius: 12` glass surface adjacent to a window edge outside any container, (c) `glassEffect` applied *before* `.padding`, (d) two tinted prominent toolbar actions; plus `evals/fixtures/1/project.yml` pinning `deploymentTarget macOS 26.0`.
2. `tailrocks-macos-design` case 2 (review): `evals/fixtures/2/DesignReview-input.md` — a filled component map + a capture manifest listing only light-mode captures (so the expected refusal/deferral of scoring without full rendered evidence becomes checkable). Do not fabricate a PNG; a manifest naming missing states is sufficient and text-diffable.
3. `tailrocks-swift-best-practices` case 1: `evals/fixtures/1/ListView.swift` — list rows keyed by array index (unstable identity) plus a `DateFormatter` created inside `body`.
4. `tailrocks-swift-project-setup` case 2 (audit): `evals/fixtures/2/project.yml` + `evals/fixtures/2/mise.toml` — a project missing `SWIFT_TREAT_WARNINGS_AS_ERRORS`, with derived data under `/tmp`, and a tool pin two majors old.

**Verify**: `mise run validate` → exit 0 (step 1's checks prove the paths resolve). Then run each modified case once: `bun scripts/run-evals.ts --skill <name> --case <id> --runs 1`; record pass/fail per case in the PR description. A failure whose judge notes show the subject *missed a seeded defect* is expected output of this plan — file it in the PR description as a finding for plans 005-010, do not edit the router.

### Step 4: Add the missing-mode and missing-gate cases

Append cases (ids continue from 4) per skill; each `expected_output` must quote the mode's or gate's completion clause from the current SKILL.md verbatim (open the file and copy — do not paraphrase):

- liquid-glass id 5 `adopt`: fixture = small app with a custom toolbar background; expected: ordered deletion of the custom background *before* any glass API, citing decision-order step 2. id 6 `remediate`: prompt includes an audit report but **no approval**; expected: refuses mutation, quotes the mutation-permission guard. id 7: prompt asks for an `overlay` + `.glassEffect` bottom bar; expected: `safeAreaBar(edge:)` named as the correct construction.
- macos-design id 5 `extract`-mode prompt; expected: either executes a defined extract procedure **or** states the mode is undefined and stops — copy whichever behavior SKILL.md specifies at execution time (if the mode is still undefined at `64df333`, the expected output is the refusal-with-reason; plan 008 may later define it — then this case gets updated by that plan, not this one).
- swift-best-practices id 5: icon-only control with no label (accessibility); id 6: `Task` spawned in `onAppear` with no owner/cancellation.
- swift-project-setup id 5 `remediate` without approval → refusal quoting the guard; id 6: user proposes pins while CI restates raw `xcodebuild` commands → expected names the task-parity rule.
- macos-visual-qa id 5: a run whose restore step failed → expected report states the failed restore explicitly (SKILL.md:96 wording); also extend case 4's `expected_output` to name all three permissions (Screen Recording, Accessibility, **Automation**).
- sketch-handoff id 5 `audit`: fixture = `evals/fixtures/5/DESIGN_MAP.md` with a NATIVE row whose forbidden column omits `blur` and a row referencing a detached kit symbol; expected: both found.

Repoint macos-design case 3 at the Stage-4 selection gate (SKILL.md:118-123) instead of duplicating case 1 — this changes its `prompt`, and its `expected_output` may be rewritten because the case's subject changes entirely (this is not a weakening of a kept case; note it in the PR).

**Verify**: `mise run validate` → exit 0. Spot-run at least the two refusal cases (`--runs 1` each): expected pass, since refusal behavior is already router-enforced.

### Step 5: Full-suite record

Run every case of all six skills once (`--runs 1`; 30+ cases ≈ up to ~$45 at the per-call cap — get operator confirmation before this step if budget matters). Produce `advisor-plans/004-run-record.md` with a table: skill, case, pass/fail, one-line judge note. Failures caused by router defects are expected; list each with the plan number (005-011) that owns the fix.

**Verify**: the record file exists and has one row per case; no case errored on infrastructure (fixture-not-found, JSON parse).

## Test plan

- The validator's two new negative tests (step 1) are the regression net for fixture rot.
- The eval cases themselves are the product; step 5's record is their acceptance evidence.
- Pattern to follow for validator tests: existing cases in `scripts/validate-skills.test.ts`.

## Done criteria

- [ ] `mise run validate` exits 0, `Validated 21 skills.`
- [ ] `bun test scripts/` exits 0, including ≥2 new validator tests
- [ ] `grep -rn '"files": \[\]' skills/tailrocks-liquid-glass/evals/ skills/tailrocks-swift-best-practices/evals/ skills/tailrocks-swift-project-setup/evals/` shows only refusal-shaped cases (each remaining empty-files case is one whose prompt references no artifact)
- [ ] Every macOS skill's evals.json has ≥6 cases; all ids unique; all fixture paths resolve
- [ ] `advisor-plans/004-run-record.md` exists with one row per case
- [ ] No `SKILL.md`, `references/`, or `templates/` file modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 001 has not landed (check: `grep -n "majority" scripts/run-evals.ts` still matches) — fixtures added before the runner grades artifacts would create false confidence.
- The runner's fixture-resolution rule differs from the one described here (drift in `run-evals.ts:73`).
- A new case cannot be written without changing router prose — that is another plan's scope.
- The `claude` CLI is unavailable or budget for step 5 is not confirmed — complete steps 1-4, mark step 5 BLOCKED in the index with the reason.

## Maintenance notes

- Plans 005-011 edit router prose; each instructs an eval rerun for its skill. This plan's fixtures make those reruns meaningful — land this first.
- When plan 008 defines or renames modes (`extract` collision), the mode cases here must be updated in the same PR as the router change.
- Reviewer scrutiny: check that no `expected_output` of a *kept* case lost a clause (append-only), and that fixtures contain no real credentials or personal data.
- Deferred: wiring evals into CI (needs `claude` CLI in CI + budget policy — see plan 012's scope note; deliberately not done here).
