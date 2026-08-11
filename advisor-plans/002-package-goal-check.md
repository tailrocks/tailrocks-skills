# Plan 002: Deterministic per-package goal check

> **Executor instructions**: Follow this plan exactly. Run preconditions first.
> Deliverable is one POSIX sh template, its test suite, and the GOAL.md
> template's machine-readable gate block. A STOP condition means stop and
> report.

## Status

- **Priority**: P0
- **Effort**: M; one session
- **Risk**: MED
- **Depends on**: 000
- **Covers**: O2, O3, O4
- **Guardrails**: M1, M2, M3, M5, M6
- **Research basis**: `advisor-plans/RESEARCH.md` F5-03, F5-07, F5-08
- **Trust label of result**: `deterministic_local`

## Why this matters

After Plan 000, acceptance is still model-mediated: the model reads the
condition, runs gates, and narrates the result. This plan makes acceptance a
deterministic function of the committed tree: one generated script per plan
package that checks tree cleanliness, plan drift, status rows, and gate exit
codes, then prints exactly one verdict line. Every `/goal` evaluator — Claude
Code's transcript judge, Codex's evaluator, or a human — reads the same line.
The script travels inside each generated package, so it reaches every target
project through the planning skill itself; no binary, registry, or release
channel exists to secure.

## Preconditions — run before anything else

```sh
test "$(rtk git branch --show-current)" != main
test -z "$(rtk git status --porcelain=v1)"
rtk bun test scripts/
rtk bun run scripts/validate-skills.ts
rtk rg -n 'BLOCKED \(budget exhausted\)' skills/tailrocks-plan/references/goal-handoff.md
```

Expected: clean feature branch; tests pass; validator prints
`Validated 15 skills.`; the last command matches (Plan 000 landed). A missing
match means Plan 000 is not merged — STOP.

## Spec contract

### Requirement O3: acceptance is a function of the committed tree

`skills/tailrocks-plan/templates/goal-check.sh` SHALL be POSIX sh, dependency-
free beyond `git` and standard utilities, copied into each generated package as
`plans/<slug>/goal-check.sh`. Run from the repository root it SHALL, in order:

1. Resolve `<slug>` from its own path; verify `plans/<slug>/README.md` and
   `plans/<slug>/GOAL.md` exist.
2. Require `git status --porcelain` empty, else verdict
   `TAILROCKS GOAL: BLOCKED dirty-tree`.
3. Read the generation SHA from GOAL.md's `Generated <date> at commit
   `<sha>`` line; require
   `git diff --quiet <sha>..HEAD -- plans/<slug> ':(exclude)plans/<slug>/README.md'`
   to pass, else `TAILROCKS GOAL: BLOCKED plan-drift`. (The hub README is the
   mutable status surface; plan files and GOAL.md are frozen at generation.)
4. Parse the hub README status table; if any row is TODO, STALE, BLOCKED, or
   IN PROGRESS, verdict `TAILROCKS GOAL: BLOCKED nonterminal-rows=<n>`;
   require at least one DONE row.
5. Execute each line of GOAL.md's ` ```sh gates ` fenced block in order; on
   the first nonzero exit, verdict
   `TAILROCKS GOAL: BLOCKED gate-failed=<command>`.
6. Otherwise print `TAILROCKS GOAL: PASS <head-sha>`.

Exit code SHALL be 0 only for PASS. The verdict SHALL be the final stdout
line. Any parse failure (missing SHA line, missing gates block, malformed
table) is `TAILROCKS GOAL: BLOCKED malformed=<what>`, never PASS.

### Requirement O4: oracle tampering is visible and blocking

Because gate commands live in GOAL.md and GOAL.md is inside the drift-checked
path set, weakening a gate after generation flips the check to
`BLOCKED plan-drift`. Regenerating the package (tailrocks-plan) is the only
sanctioned way to change gates, and it rewrites the generation SHA.

#### Scenario: executor weakens a gate

- **WHEN** any byte of `plans/<slug>/GOAL.md` or a plan file changes after the
  generation SHA without regeneration
- **THEN** the script reports `BLOCKED plan-drift` regardless of gate results.

#### Scenario: uncommitted work claims success

- **WHEN** the working tree is dirty
- **THEN** the script reports `BLOCKED dirty-tree` before running any gate.

## Must NOT

- **M1/M2**: no verdict other than the six defined; no budget, score, or
  narrative input can produce PASS.
- **M3**: the script never mutates the repository; it only reads and runs the
  declared gates.
- **M5**: the template stays a single file under 150 lines of sh; no config
  file, no flags beyond an optional explicit slug.
- **M6**: the script must not echo environment values; gate output passes
  through untouched but the script adds nothing.

## Honest trust statement

`deterministic_local` means: the verdict is a deterministic function of the
committed tree for a cooperating user. It is not adversary-resistant — a
user-privileged process can rewrite history, edit the script, or regenerate
the package. The human PR review and repository CI remain the trust boundary
for merged work. This label must appear verbatim in the goal-handoff wiring
(Plan 003).

## Starting state

- Plan 000 landed the gate-first condition; GOAL.md template has no
  machine-readable gates block yet — gate commands are inline prose in the
  condition text.
- `skills/tailrocks-plan/templates/` exists and ships copy-ready assets;
  generated packages already carry `README.md` (hub with status table) and
  `GOAL.md` with a `Generated <date> at commit` line.
- `examples/plan-package/plans/goal-live-status/` is the reference package.
- No goal-check script exists anywhere in the repository.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Template tests | `rtk bun test scripts/goal-check.test.ts` | exit 0, all scenarios |
| All script tests | `rtk bun test scripts/` | exit 0 |
| Skill validation | `rtk bun run scripts/validate-skills.ts` | `Validated 15 skills.` |
| Template lint | `sh -n skills/tailrocks-plan/templates/goal-check.sh` | exit 0 |
| Example check | `cd examples/plan-package && sh plans/goal-live-status/goal-check.sh; cd ../..` | prints one `TAILROCKS GOAL:` line |
| Whitespace | `rtk git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `skills/tailrocks-plan/templates/goal-check.sh` (new)
- `scripts/goal-check.test.ts` (new; builds throwaway git fixture repos under
  the test tmpdir and runs the template against them)
- `skills/tailrocks-plan/references/goal-handoff.md` — add the ` ```sh gates `
  block to the GOAL.md template and the instruction to copy the template into
  each package
- `skills/tailrocks-plan/SKILL.md` — one line adding the script to the
  generated-package inventory
- `examples/plan-package/plans/goal-live-status/` — add the script instance
  and the gates block so the example stays truthful

**Out of scope**: per-client wiring and reconcile integration (Plan 003),
containers, worktrees, journals, receipts, releases, any network access.

## Git workflow

Ordinary repository flow per `AGENTS.md`: feature branch, one commit,
`rtk git commit -s`, subject `feat(plan): deterministic per-package goal
check`, PR when complete.

## Steps

### Step 1: Write the template and its fixture harness first

Create `scripts/goal-check.test.ts` building minimal git repos per scenario:
happy path (all DONE, green gate), dirty tree, drifted plan file, drifted
GOAL.md gate line, nonterminal row, failing gate, missing generation SHA,
missing gates block. Then write `goal-check.sh` until all scenarios pass.
Failing scenarios assert the exact `TAILROCKS GOAL: BLOCKED <reason>` line and
exit 1; the happy path asserts `TAILROCKS GOAL: PASS <head-sha>` and exit 0.

**Verify**: Template tests and Template lint pass.

### Step 2: Add the gates block to the GOAL.md template

In goal-handoff.md, give GOAL.md a ` ```sh gates ` fenced block holding the
two gate commands (one per line), and rewrite the condition text to:
"`sh plans/<slug>/goal-check.sh` exits 0 and its final line starts with
`TAILROCKS GOAL: PASS`". Keep the block-1/block-2 paste structure intact.
Instruct tailrocks-plan to copy the template into the package at generation.

**Verify**: Skill validation passes;
`rtk rg -n 'goal-check.sh' skills/tailrocks-plan/references/goal-handoff.md`
matches in the condition and generation instructions.

### Step 3: True up the example package

Add `goal-check.sh` and the gates block to
`examples/plan-package/plans/goal-live-status/`, with a generation SHA line
matching the example's convention. The example's gates may be trivial
(`true`) but must be real commands.

**Verify**: Example check prints exactly one `TAILROCKS GOAL:` line; All
script tests pass.

## Done criteria

- [ ] All commands in "Commands you will need" produce expected results.
- [ ] Every defined BLOCKED reason and the PASS path have a passing test.
- [ ] Tampered-GOAL.md fixture yields `BLOCKED plan-drift`, not a gate run.
- [ ] The template is ≤150 lines of POSIX sh, `sh -n` clean.
- [ ] The honest trust statement appears in goal-handoff.md.
- [ ] `rtk git status --porcelain=v1` lists only in-scope paths before commit.

## STOP conditions

Stop if the GOAL.md template cannot carry a fenced gates block without
breaking existing eval fixtures, if POSIX sh cannot parse the status table
reliably (report the exact table shape that failed), or if any edit outside
Scope becomes necessary.
