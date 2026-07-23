# Plan 004: Add CI that runs the validator on every push and PR

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- scripts/validate-skills.ts`
> If the validator changed, confirm plan 003 is DONE in
> `advisor-plans/README.md` (this plan assumes its interface: exit 0 on
> success, `bun test scripts/validate-skills.test.ts` exists). If 003 is
> not DONE, STOP — dependency not met.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: advisor-plans/003-validator-hardening.md
- **Category**: dx
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

No `.github/` exists. The validator — the only automated gate — runs only
when a human remembers. A PR that breaks manifest version lockstep, drops
a skill from a catalog, or ships a broken reference link merges green.
One small workflow closes this permanently.

## Current state

- `.github/` does not exist (verified at `f2c4be5`).
- The gate to run: `bun run scripts/validate-skills.ts` (exit 0 =
  `Validated 14 skills.`), plus `bun test scripts/` once plan 003 lands.
- Repo has no package.json, no lockfile, no other lint/build steps —
  the honest CI scope is exactly these two commands.
- Main is PR-only (history shows squash-merged PRs, e.g. `f2c4be5 … (#2)`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validator | `bun run scripts/validate-skills.ts` | exit 0 |
| Validator tests | `bun test scripts/` | all pass |
| Workflow lint (optional) | `gh workflow view` after first push | workflow listed |

## Scope

**In scope**:
- `.github/workflows/validate.yml` (create)

**Out of scope**:
- Release automation, tagging, CHANGELOG (plan 010 documents the
  checklist; automating it is not requested).
- Eval-runner jobs (plan 013 is a design spike; wire its runner into CI
  only when it exists).
- Branch-protection settings (GitHub UI/API state, not repo files).

## Git workflow

- Branch: `advisor/004-ci-workflow`.
- Conventional Commits, DCO: `git commit -s -m "ci: run skill validator on push and PR"`.
  Main is PR-only; do NOT push or open a PR unless instructed.

## Steps

### Step 1: Write the workflow

Create `.github/workflows/validate.yml`:

```yaml
name: validate
on:
  push:
    branches: [main]
  pull_request:
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.14"
      - run: bun run scripts/validate-skills.ts
      - run: bun test scripts/
```

Pin `bun-version` to the Bun the repo standardizes on (1.3.14 is the pin
in `skills/tailrocks-tanstack-project-setup/templates/package.json`
`packageManager` — keep them aligned; if plan 010 added a root mise.toml
with a different pin, use that value).

**Verify**: `bun run scripts/validate-skills.ts && bun test scripts/` →
both exit 0 locally (same commands the workflow runs).

### Step 2: Sanity-check YAML

**Verify**: `bun -e 'Bun.YAML.parse(await Bun.file(".github/workflows/validate.yml").text()); console.log("ok")'`
→ `ok`.

## Test plan

The workflow is itself the test infrastructure. Local equivalence run in
step 1 is the pre-merge evidence; the first PR carrying this file shows
the check in GitHub's UI (operator confirms — see Maintenance).

## Done criteria

- [ ] `.github/workflows/validate.yml` exists, parses as YAML
- [ ] The two commands it runs exit 0 locally
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Plan 003 is not DONE (dependency: `bun test scripts/` target must exist).
- You are tempted to add more jobs (lint, release, evals) — out of scope;
  report the idea instead.

## Maintenance notes

- After merge, the operator should mark the `validate` check required in
  branch protection — repo-settings change outside this plan's file scope.
- When plan 013's eval runner lands, add its command as a third step here.
- Reviewer focus: the Bun version pin — drift between CI, root tooling
  docs (plan 010), and the tanstack template's `packageManager` should be
  caught in review.
