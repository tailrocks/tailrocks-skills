# Plan 001: Ground eval verdicts in retained workspace artifacts

> **Executor instructions**: Follow every step. Run each verification before
> continuing. Stop on a STOP condition; do not invent a replacement protocol.
> Update this plan's row in `advisor-plans/README.md` when complete.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- scripts/ skills/*/evals/ docs/eval-runner-design.md`
> Empty output is expected before this plan starts. If output is non-empty,
> reconcile the excerpts below with live code and refresh this plan first.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tests, bug
- **Planned at**: commit `b629fb9`, 2026-08-10

## Why this matters

The current runner asks one model for a summary, asks another model whether that
summary matches prose, deletes the workspace, then lets a majority determine
success. A false claim can pass without any artifact proof. This plan fixes the
enabling condition: deterministic workspace assertions decide first, every run
is retained, and a failing trial can never be hidden by an aggregate.

This is evaluation infrastructure only. It does not implement native `/goal`
sessions, resume, or provider adapters; those must drive one shared Rust adapter
after plans 003/006.

## Current state

- `scripts/run-evals.ts:8-13` accepts only `prompt`, `expected_output`, and a
  flat `files` list.
- `scripts/run-evals.ts:72-76` copies each fixture to
  `path.basename(source)`, destroying its relative destination.
- `scripts/run-evals.ts:90-130` grades only `subject.text`.
- `scripts/run-evals.ts:132-134` deletes the workspace before evidence can be
  inspected.
- `scripts/run-evals.ts:137-140` exits from majority pass/fail.
- `scripts/validate-skills.ts` validates catalog/frontmatter structure but has
  no executable eval-v2 schema.
- `skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md`
  is a nested fixture that exposes basename staging errors.

Required semantic distinction:

```text
PASS         = all deterministic assertions pass and every required semantic
               assertion passes
FAIL         = at least one concrete assertion/trial fails
INVESTIGATE  = infrastructure/provider failure; never counted as PASS
UNTRUSTED    = legacy summary-only case; never counted as PASS
```

## Preconditions

Run:

```sh
rtk --version
rtk bun test scripts/
rtk bun run scripts/validate-skills.ts
```

Expected: RTK prints a version; all seven current tests pass; validator reports
`Validated 15 skill(s).`

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `bun test scripts/` | exit 0, all tests pass |
| Validate | `bun run scripts/validate-skills.ts` | exit 0, 15 skills |
| Diff | `git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `scripts/run-evals.ts`
- `scripts/eval-types.ts` (new)
- `scripts/eval-workspace.ts` (new)
- `scripts/eval-assertions.ts` (new)
- `scripts/run-evals.test.ts` (new)
- `scripts/fixtures/eval-v2/**` (new)
- `scripts/validate-skills.ts`
- `scripts/validate-skills.test.ts`
- `skills/tailrocks-plan/evals/evals.json` and its fixtures
- `docs/eval-runner-design.md`

**Out of scope**:

- Native `/goal`, hooks, Rust provider adapters, or live multi-turn resume.
- Migrating every skill case; plan 008 owns full migration.
- Treating model-generated assertions as independent ground truth.
- Changing any skill's production procedure.

## Git workflow

- Branch: `fix/artifact-grounded-evals`
- Commit completed work with `git commit -s` and Conventional Commit subject
  `fix(evals): grade retained workspace artifacts`.
- Add `Co-authored-by: Codex <codex@openai.com>`.
- Do not push or open a PR without operator instruction.

## Steps

### Step 1: Define eval-v2 and explicit result states

Create `scripts/eval-types.ts`. Define a discriminated v2 case with:

- `schema_version: 2`, stable string `id`, `prompt`, and `fixtures` entries;
- every fixture has `source` and normalized relative `destination`;
- deterministic assertions for `file_exists`, `file_absent`, `file_contains`,
  `json_equals`, `command`, `git_diff_paths`, and `workspace_unchanged`;
- optional semantic assertions that name their deterministic evidence inputs;
- `ground_truth_owner` (`fixture`, `operator`, or `external`) and a digest;
- result enum `PASS | FAIL | INVESTIGATE | UNTRUSTED`.

Keep v1 parsing only to return `UNTRUSTED` with a migration reason. Reject
absolute paths, `..`, duplicate destinations, assertion commands containing
unexpanded placeholders, and result-directory paths inside the evaluated
workspace.

Add validator coverage for this schema. Do not introduce a package dependency;
use Bun/TypeScript and explicit parsing.

**Verify**: `bun test scripts/validate-skills.test.ts` → exit 0 with new valid,
path-traversal, duplicate-destination, and unknown-assertion cases passing.

### Step 2: Stage exact fixture destinations and retain evidence

Create `scripts/eval-workspace.ts`. Resolve fixture sources under the repository
or owning skill directory, copy to the declared destination, and prove both
source and destination remain within their roots after realpath resolution.

For each run, retain under the caller-supplied results directory:

```text
<results>/<case-id>/<run-id>/
  input.json
  workspace-before.json
  workspace-after.json
  diff.patch
  trace.jsonl
  stdout.txt
  stderr.txt
  verdict.json
```

Snapshots include sorted tracked and untracked paths plus SHA-256 content
digests. Results are written outside the subject workspace. Remove only the
temporary workspace after evidence files have closed successfully.

**Verify**: `bun test scripts/run-evals.test.ts --test-name-pattern fixture` →
exit 0; nested paths survive and traversal/collision fixtures fail closed.

### Step 3: Run deterministic assertions before any semantic grader

Create `scripts/eval-assertions.ts`. Commands run with a fixed timeout, explicit
working directory, sanitized environment, captured output, and no shell string
interpolation. Store each assertion's inputs, exit status, and evidence digest.

If any deterministic assertion fails, record `FAIL` and do not ask a semantic
grader. If infrastructure prevents an assertion from running, record
`INVESTIGATE`. Semantic grading receives only named retained evidence, never the
subject summary as sole proof.

**Verify**: `bun test scripts/run-evals.test.ts --test-name-pattern assertion`
→ exit 0; lying-summary, missing-file, timeout, and passing-artifact tests pass.

### Step 4: Preserve every trial and remove majority authority

Refactor `scripts/run-evals.ts` to use the modules above. Accept explicit
`--results <path>` and `--driver claude|replay`. `replay` consumes only checked-in
test transcripts/actions and exists to test the harness; it is not a provider
implementation.

Emit aggregate pass@1/pass^k counts and per-state counts for reporting. Exit:

- `0` only when every required trial is `PASS`;
- `1` when any trial is `FAIL`;
- `2` for invocation/schema error;
- `3` when any trial is `INVESTIGATE` or `UNTRUSTED` and none failed.

Never label majority as acceptance.

**Verify**: `bun test scripts/run-evals.test.ts --test-name-pattern aggregate`
→ exit 0; `[PASS, FAIL, PASS]` exits 1 and legacy v1 exits 3.

### Step 5: Migrate one representative delivery case end to end

Migrate `skills/tailrocks-plan/evals/evals.json` case `1` to v2. Preserve the
nested roadmap fixture destination. Assert the actual package tree, manifest
rows, dependency ordering, GOAL handoff, and absence of source-code mutations.
Use a checked-in replay fixture for deterministic CI; keep a live Claude run a
manual/credentialed diagnostic, not the sole proof.

Update `docs/eval-runner-design.md` with the result-state and exit-code contract,
retained artifact tree, trust labels, and migration rule.

**Verify**:

```sh
rm -rf /tmp/tailrocks-eval-plan-smoke
bun scripts/run-evals.ts --skill tailrocks-plan --case 1 --runs 1 --driver replay --results /tmp/tailrocks-eval-plan-smoke
test -f /tmp/tailrocks-eval-plan-smoke/1/1/verdict.json
```

Expected: all commands exit 0; `verdict.json` says `PASS` and cites workspace
artifacts, not only transcript prose. `/tmp/tailrocks-eval-plan-smoke` is
disposable local output and must not be committed.

## Test plan

`scripts/run-evals.test.ts` must cover:

- nested and colliding fixture destinations;
- absolute/parent/symlink escape attempts;
- retained before/after/diff/trace evidence;
- lying subject summary with failing workspace state;
- deterministic failure suppressing semantic judgment;
- assertion timeout/infrastructure error;
- v1 `UNTRUSTED`, v2 PASS/FAIL/INVESTIGATE, and exit-code matrix;
- a failing trial inside an otherwise passing three-run set;
- stable output ordering and digest reproducibility.

## Done criteria

- [ ] `bun test scripts/` exits 0.
- [ ] `bun run scripts/validate-skills.ts` reports 15 valid skills.
- [ ] Tailrocks Plan replay smoke exits 0 with retained artifact citations.
- [ ] No v1 case can produce PASS.
- [ ] No aggregate majority can override one FAIL.
- [ ] `git diff --check` exits 0.
- [ ] `git status --short` lists only in-scope files and the README row.

## STOP conditions

Stop and report if fixture destinations cannot be represented without changing
the eval schema, a deterministic assertion would need secrets/network access,
the runner would have to trust agent-authored expected values, or any current v1
case is silently treated as PASS.

## Maintenance notes

Plan 008 migrates remaining replay cases; plan 009 connects live qualification
to the Rust provider adapter. Keep the replay driver deliberately dumb; two
runtime provider implementations would recreate the drift this plan removes.
