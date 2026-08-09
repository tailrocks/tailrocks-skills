# Plan 001: Ground skill evals in artifacts, traces, and diffs

> **Executor instructions**: Follow this plan step by step. Run every gate and
> confirm its expected result. If a STOP condition occurs, stop and report;
> do not improvise. Update this plan's row in `advisor-plans/README.md` when
> complete.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED — changes all eval contracts and the model-backed runner
- **Depends on**: none
- **Category**: tests / correctness
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Current evals judge a model's summary of its behavior, not repository effects.
That permits false passes: the subject can claim it created/refused something
that the temporary workspace disproves. Fixture staging also strips directory
paths, so cases expecting `roadmap/...` do not receive that shape. This plan
makes deterministic evidence primary and leaves model judgment only for
criteria that cannot be expressed mechanically.

## Current state

- `scripts/run-evals.ts:5-10` defines `expected_output` as one free-form string
  and `files` as strings.
- `scripts/run-evals.ts:72-76` copies each fixture to
  `path.join(workspace, path.basename(source))`; nested source paths are lost.
- `scripts/run-evals.ts:90-103` asks the subject for a summary, then gives only
  that summary and `expected_output` to the judge.
- The runner performs one subject invocation. It cannot exercise Brainstorm or
  Finalize across user answers, interruption, resume, correction, or a clean
  no-op rerun, although existing cases require those behaviors.
- `scripts/run-evals.ts:132-134` deletes the workspace before any durable
  artifact/diff record is retained.
- `scripts/validate-skills.ts:174-203` validates only the old free-form eval
  shape.
- `docs/eval-runner-design.md:44-50` already identifies tool events,
  filesystem diffs, deterministic pre-judging, and retention as open work.
- `.github/workflows/validate.yml:16-18` runs structural validation and Bun
  tests, but never the behavior runner.
- Existing convention: standalone Bun TypeScript, `bun:test`, no package.json;
  `mise run validate` invokes the structural validator.

## Research basis

- [OpenAI: Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)
  recommends captured traces/artifacts and deterministic checks before model
  grading.
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  motivates repeated trials and outcome grading rather than agent claims.
- [Anthropic: Quantifying infrastructure noise](https://www.anthropic.com/engineering/infrastructure-noise)
  makes execution environment part of the recorded test system.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Baseline | `mise run validate` | `Validated 15 skills.` and exit 0 |
| Bun tests | `bun test scripts/` | all tests pass |
| One deterministic eval preflight | `bun scripts/run-evals.ts --skill tailrocks-idea --case 1 --preflight-only` | exit 0; contract, fixtures, rubrics, and assertion definitions validate without model calls |
| Model smoke | `bun scripts/run-evals.ts --skill tailrocks-idea --case 1 --runs 1 --retain` | exit 0 or explicit `investigate`; retained run contains trace, diff, artifacts, verdict |

## Scope

**In scope**:

- `scripts/run-evals.ts`
- `scripts/eval-contract.ts` (create)
- `scripts/eval-driver.ts` (create)
- `scripts/eval-assertions.ts` (create)
- `scripts/run-evals.test.ts` (create)
- `scripts/validate-skills.ts`
- `scripts/validate-skills.test.ts`
- every `skills/*/evals/evals.json`
- optional semantic rubrics under `skills/*/evals/rubrics/`
- `docs/eval-runner-design.md`
- `.gitignore` only if retained local eval output needs one narrow ignored path

**Out of scope**:

- Delivery skill behavior; later plans change it.
- CI cadence and provider matrix; plan 010 owns them.
- Rust control-plane schemas; plan 002 owns them.
- Any mutation outside disposable eval workspaces.

## Git workflow

- Branch: `advisor/001-artifact-grounded-evals`
- Commits: Conventional Commits, for example
  `test(evals): grade workspace artifacts`; use `git commit -s` and append
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not push or open a PR without operator instruction.

## Steps

### Step 1: Define eval contract v2

Create typed parsing in `scripts/eval-contract.ts`. Each case must contain:

```json
{
  "id": 1,
  "prompt": "...",
  "fixtures": [
    {"source": "evals/fixtures/roadmap/example/README.md", "destination": "roadmap/example/README.md"}
  ],
  "assertions": [
    {"type": "file_exists", "path": "roadmap/example/README.md"},
    {"type": "changed_paths", "allow": ["roadmap/example/README.md", "roadmap/README.md"]}
  ],
  "turns": [
    {"kind": "user", "content": "First answer"},
    {"kind": "interrupt", "trigger": {"type": "after_tool_event", "count": 1}},
    {"kind": "resume", "mode": "same_session"},
    {"kind": "user", "content": "Correction"}
  ]
}
```

`turns` is optional for one-turn cases. Interactive cases use an ordered event
script with `user`, triggered `interrupt`, `resume`, and `end` events plus
per-turn output and workspace assertions. Answers are released after an
assistant turn by event index, never by brittle exact-text matching. Interrupts
use a documented event/count or bounded-time trigger and retain the partial
trace. Assertions decide whether the agent asked one relevant question,
preserved prior answers, handled a correction, or resumed safely.

Supported deterministic assertion types in v2:

- `file_exists`, `file_absent`
- `content_contains`, `content_not_contains`
- `changed_paths` with exact allow/deny rules
- `state_transition` for roadmap/package state
- `command` with argv, cwd, exit code, and optional stdout/stderr matcher
- `semantic_rubric` only for remaining qualitative criteria

Reject unknown fields/types. Paths must be workspace-relative, normalized, and
must not escape through `..`, symlinks, or absolute paths. A case may contain no
semantic rubric. It may not contain only semantic rubrics when a filesystem or
state claim is mechanically observable.

**Verify**: `bun test scripts/run-evals.test.ts -t contract` exits 0 and covers
unknown types, traversal, duplicate IDs, empty assertion lists, and valid cases.

### Step 2: Preserve fixture destinations

Replace basename staging with explicit source/destination mapping. Resolve
`source` by the documented skill-relative convention; copy to the declared
workspace-relative `destination`. Preflight all fixtures before starting a
model call. Refuse collisions and missing sources.

Migrate every eval file from `files` to `fixtures`. The existing plan fixture
must explicitly land at `roadmap/macos-application/README.md`, not
`README.md`.

**Verify**: `bun test scripts/run-evals.test.ts -t fixtures` exits 0; a nested
fixture exists at its declared destination and traversal/collision cases fail.

### Step 3: Add a real multi-turn scenario driver

Implement `scripts/eval-driver.ts` behind a narrow provider-session interface.
It must:

- start one disposable workspace and provider session per trial;
- send scripted user turns only after the previous assistant turn ends;
- preserve provider session identity where documented;
- inject an actual interrupt and resume event for cases that declare them;
- snapshot output/state after every turn, not only at the end;
- enforce turn/time/tool bounds and record why a session stopped;
- mark `investigate` when the provider cannot prove same-session resume rather
  than silently replaying a transcript as if it were equivalent.

Migrate interactive Idea/Brainstorm/Finalize/Record Decision/Reconcile cases to
multi-turn scripts. Include correction, deferral, interruption, resume, and
no-op rerun cases. Keep the scenario format provider-neutral even if the first
driver adapter uses the currently installed Claude CLI.

**Verify**: `bun test scripts/run-evals.test.ts -t multi-turn` proves ordered
answers, stable workspace, distinct trials, real resume identity, interrupt
recovery, per-turn assertions, and unsupported-resume `investigate` behavior.

### Step 4: Capture actual run evidence

Before subject execution, snapshot workspace paths and content hashes. After
execution, capture:

- normalized before/after tree;
- unified text diff and binary/hash changes;
- subject stdout/stderr, exit code, duration, cost/token fields when exposed;
- provider, CLI version, model, OS, repository SHA, resource limits;
- structured CLI/tool events when the installed CLI documents a supported
  stream/event mode; otherwise record `trace_capability: unavailable` rather
  than fabricating one.

Retain runs under an explicit output directory only when `--retain` or
`--output <path>` is supplied. Default temporary cleanup remains. Redact
credential-like values from retained transcripts while preserving location and
type.

**Verify**: `bun test scripts/run-evals.test.ts -t evidence` exits 0; fixture
subject writes produce stable snapshots/diffs and cleanup/retention both work.

### Step 5: Run deterministic assertions before semantic judgment

Implement `scripts/eval-assertions.ts`. Failed deterministic assertions end in
`fail` and cannot be overridden by a model. `investigate` is first-class for
missing trace capability, judge disagreement, or infrastructure failure; it is
not counted as pass.

Run semantic judgment only after deterministic pass. Give judge the rubric,
actual diff, relevant final artifacts, and read-only trace—not the subject
summary alone. Cap artifact bytes and include hashes/paths for omitted large
files. Configure subject and judge models separately through CLI flags; record
both.

**Verify**: `bun test scripts/run-evals.test.ts -t assertions` exits 0; a lying
subject summary cannot pass a missing-file assertion; semantic judge cannot
override deterministic failure.

### Step 6: Migrate cases and strengthen validator

Convert all evals to v2. For every case, encode all observable expected effects
as deterministic assertions. Keep semantic rubrics narrow: intent preservation,
quality of a recommendation, or whether prose invents decisions. Add validator
checks for schema version, fixture safety, known assertion types, and rubric
existence.

Update `docs/eval-runner-design.md` from spike/open questions to implemented
contract, evidence envelope, trust boundaries, outcomes, and local usage.

**Verify**: `mise run validate` exits 0 and reports all 15 skills; `bun test
scripts/` passes.

### Step 7: Run one real smoke without making it the sole proof

Run `tailrocks-idea` case 1 once with retention. Inspect retained tree/diff and
confirm judge received actual artifacts. Record CLI/model/version and result in
the design doc without claiming reproducibility from one run.

**Verify**: retained JSON references a real workspace diff, deterministic
assertions, semantic verdict if present, provider/model versions, and final
outcome. Exit 0 only on pass; `investigate` and fail exit nonzero with distinct
codes.

## Test plan

- Contract parser: valid v2, unknown field, unknown assertion, empty list,
  duplicate case, path traversal.
- Fixture staging: nested destination, missing source, collision, symlink
  escape.
- Multi-turn driver: question/answer order, correction, interruption, resume,
  clean no-op rerun, per-turn state, unsupported provider capability.
- Snapshot/diff: add/modify/delete/binary, stable ordering, line-ending
  normalization policy.
- Assertions: positive/negative cases for every deterministic type.
- Trust rule: false subject claim cannot override filesystem evidence.
- Semantic judge: sees artifact/diff, never mutates workspace, never overrides
  deterministic failure.
- Retention/redaction: default cleanup; explicit retention; secrets not copied.

## Done criteria

- [ ] `mise run validate` exits 0.
- [ ] `bun test scripts/` exits 0.
- [ ] All eval cases use v2 typed fixtures/assertions; no `expected_output` or
      `files` fields remain.
- [ ] Nested fixtures retain declared destination paths.
- [ ] Interactive skill cases use scripted multi-turn scenarios and grade every
      turn's repository/output evidence.
- [ ] Every run grades actual filesystem/state evidence before model prose.
- [ ] Failed deterministic checks cannot be promoted by semantic judgment.
- [ ] Retained smoke output contains environment, trace capability, diff,
      artifacts, and separate subject/judge identities.
- [ ] No file outside Scope changed except `advisor-plans/README.md` status.

## STOP conditions

- Installed provider CLI has no documented structured event mode: implement
  snapshots/diffs, record trace capability unavailable, and stop before guessing
  an undocumented flag.
- A required observable claim cannot fit a typed assertion: add a narrowly
  documented assertion type; do not move it to semantic grading for convenience.
- Retained evidence would include unredacted credentials or private external
  data.
- Migration requires changing skill behavior rather than eval expectations.

## Maintenance notes

Keep deterministic assertions provider-neutral. Provider trace adapters may
differ, but they must emit one common evidence envelope. Every future skill
behavior change must update typed assertions first, so the eval becomes an
executable contract rather than a prose description of hoped-for behavior.
