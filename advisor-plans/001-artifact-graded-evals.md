# Plan 001: Grade retained artifacts, not transcripts; no majority pass

> **Executor instructions**: Follow this plan exactly. Run preconditions first.
> Modify only the eval runner, its new tests, and eval documentation. A STOP
> condition means stop and report.

## Status

- **Priority**: P1
- **Effort**: M; one session
- **Risk**: MED
- **Depends on**: none
- **Covers**: O1, O7
- **Guardrails**: M1, M5, M6
- **Research basis**: `advisor-plans/RESEARCH.md` "Primary repository
  evidence", F5-06
- **Trust label of result**: `local_non_adversarial`

## Why this matters

`scripts/run-evals.ts` currently judges `subject.text` — the model's own
summary of what it did — deletes the workspace before anyone can inspect it,
flattens fixture paths by basename, and exits 0 on a bare majority of runs.
A skill can therefore "pass" while its actual output files are wrong or
missing, and a concrete failing run is erased by two passing ones. Predictable
planning requires evals that measure retained artifacts and never let a
majority erase a concrete failure.

## Preconditions — run before anything else

```sh
test "$(rtk git branch --show-current)" != main
test -z "$(rtk git status --porcelain=v1)"
rtk bun test scripts/
rtk rg -n 'const majority = passed > runs / 2' scripts/run-evals.ts
rtk rg -n 'path.basename\(source\)' scripts/run-evals.ts
rtk rg -n 'await rm\(workspace' scripts/run-evals.ts
```

Expected: clean feature branch; tests pass; each `rg` finds exactly one match
(the three defects are present). If any defect is already absent, reconcile
this plan against the current file before editing — do not re-apply.

## Spec contract

### Requirement O7: artifact-grounded, failure-preserving verdicts

The eval runner SHALL, per run: preserve fixture-relative paths in the
workspace; after the subject completes, collect a bounded artifact listing
(relative path, size, and content up to a fixed per-file and total byte cap,
binary files listed but not inlined) and give the judge that listing alongside
the subject transcript; retain the workspace directory of every failed run and
print its path; delete only passing-run workspaces. The process SHALL exit 0
only when every run passes. Multi-run output SHALL report the pass count
without treating any majority as success.

#### Scenario: two of three runs pass

- **WHEN** `--runs 3` produces verdicts pass, pass, fail
- **THEN** the runner exits 1, reports `passed: 2/3`, and prints the retained
  workspace path of run 3.

#### Scenario: nested fixture

- **WHEN** a case lists `skills/x/templates/a/b.txt`
- **THEN** the workspace contains `templates/a/b.txt` (skill-relative), not a
  basename-flattened `b.txt`.

## Must NOT

- **M1**: no majority, score, or average may produce exit 0 over a failing run.
- **M5**: artifact collection is byte-capped; overflow truncates the listing
  with an explicit marker and never truncates into a false pass.
- **M6**: workspaces may hold fixture data only; the runner must not copy
  environment values or credentials into retained evidence.

## Starting state

- `scripts/run-evals.ts:72-76` copies fixtures to `path.basename(source)`.
- `scripts/run-evals.ts:90-130` builds the judge prompt from `subject.text`
  only.
- `scripts/run-evals.ts:132-140` removes the workspace in `finally` and exits
  on `passed > runs / 2`.
- `scripts/validate-skills.test.ts` exists; there is no test for run-evals.
- The runner shells out to a live model; grading logic is inline and untested.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Script tests | `rtk bun test scripts/` | exit 0, includes new run-evals cases |
| Skill validation | `rtk bun run scripts/validate-skills.ts` | `Validated 21 skills.` (count re-verified 2026-08-11 at `64df333`; was 15 when first written) |
| Majority gone | `rtk rg -n 'majority' scripts/run-evals.ts` | exit 1, no output |
| Whitespace | `rtk git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `scripts/run-evals.ts`
- `scripts/run-evals.test.ts` (new)
- eval documentation lines that describe the verdict rule, if any exist
  (`rtk rg -ln 'majority' AGENTS.md README.md skills/` to find them)

**Out of scope**: live-model invocation changes, new eval cases for skills,
CI workflow edits, the validator, any GOAL/handoff prose.

## Git workflow

Ordinary repository flow per `AGENTS.md`: feature branch, one commit,
`rtk git commit -s`, subject `fix(evals): grade retained artifacts and drop
majority verdicts`, PR when complete.

## Steps

### Step 1: Extract testable grading and workspace logic

Refactor `run-evals.ts` so fixture staging, artifact collection, verdict
aggregation, and workspace retention are exported pure-ish functions (live
model calls stay behind one boundary function). No behavior change yet beyond
the refactor.

**Verify**: `rtk bun test scripts/` still exits 0;
`rtk bun run scripts/validate-skills.ts` passes.

### Step 2: Fix staging, grading input, and retention

Implement the Spec contract: relative-path staging, bounded artifact listing
into the judge prompt, failed-run workspace retention with printed path,
passing-run cleanup.

**Verify**: new unit tests cover the nested-fixture scenario and the byte-cap
truncation marker; `rtk bun test scripts/` exits 0.

### Step 3: Replace majority with all-runs-pass

Exit 0 only when `passed === runs`. Report `passed`, `runs`, and retained
workspace paths in the JSON summary. Remove the `majority` field.

**Verify**: "Majority gone" exits 1; a unit test feeds verdicts [pass, pass,
fail] to the aggregator and asserts exit code 1 plus retention of run 3's
workspace path in the summary.

## Done criteria

- [ ] All commands in "Commands you will need" produce expected results.
- [ ] Judge input contains a workspace artifact listing, byte-capped.
- [ ] A failing run's workspace path is retained and reported; passing runs
  are cleaned up.
- [ ] `passed === runs` is the only exit-0 path.
- [ ] `rtk git status --porcelain=v1` lists only in-scope paths before commit.

## STOP conditions

Stop if grading cannot see workspace artifacts without exceeding the byte cap
design, if the refactor forces changes to live-model invocation semantics, or
if any edit outside Scope becomes necessary.
