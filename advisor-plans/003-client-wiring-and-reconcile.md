# Plan 003: Wire the check into clients and reconcile, honestly

> **Executor instructions**: Follow this plan exactly. Run preconditions first.
> Prose, eval fixtures, and documentation only — the script itself is Plan
> 002's and must not change here. A STOP condition means stop and report.

## Status

- **Priority**: P1
- **Effort**: S; one session
- **Risk**: LOW
- **Depends on**: 002
- **Covers**: O5, O6
- **Guardrails**: M2, M3, M4, M5
- **Research basis**: `advisor-plans/RESEARCH.md` "Current provider
  evidence", F5-01
- **Trust label of result**: `advisory_prose` wiring around a
  `deterministic_local` check

## Why this matters

Plan 002's verdict line is only as useful as the loops that consume it. This
plan makes every client path read the same line: the executor protocol runs
the script before any DONE flip and at loop end; reconcile runs it as the
package-level truth; per-client wiring states exactly what each client
enforces and what it merely reads. No client is promised more than its
current, locally verified behavior.

## Preconditions — run before anything else

```sh
test "$(rtk git branch --show-current)" != main
test -z "$(rtk git status --porcelain=v1)"
rtk bun test scripts/
rtk bun run scripts/validate-skills.ts
test -f skills/tailrocks-plan/templates/goal-check.sh
rtk rg -n 'goal-check.sh' skills/tailrocks-plan/references/goal-handoff.md
```

Expected: clean feature branch; tests pass; validator prints
`Validated 15 skills.`; the template exists and the handoff references it
(Plan 002 landed). Otherwise STOP.

## Spec contract

### Requirement O5: resume and truth-sync run the same check

The executor protocol SHALL require running `sh plans/<slug>/goal-check.sh`
before flipping any row to DONE (the row's own criteria prove the row; the
script proves the package state is coherent) and as the final act before
claiming the goal. `tailrocks-reconcile` SHALL run the script first; a
BLOCKED verdict routes to the matching reconcile step (dirty-tree → stop and
report, plan-drift → mark package STALE for re-planning, nonterminal/gate →
continue row-by-row verification).

### Requirement O6: per-client wiring claims only verified behavior

goal-handoff.md SHALL carry one client table stating, per client, what was
verified locally, at which version, on which date:

- Claude Code (2.1.226, 2026-08-10): `/goal` blocks stopping until the
  condition holds; a small model judges the condition against the transcript.
  Wiring: the condition is "the final line of `sh plans/<slug>/goal-check.sh`
  output shown this turn starts with `TAILROCKS GOAL: PASS`" — the model must
  paste the command and its output each time it believes it is done.
- Codex (codex-cli 0.147.0, 2026-08-10): `/goal` is a durable objective whose
  model decides satisfaction; hooks are a guardrail, not enforcement. Wiring:
  same condition text inside the kickoff block; label the stop behavior
  model-judged.
- Grok (1.0, 2026-08-10): no native goal; blocks are manual prompts and the
  human runs the script.

Each row SHALL carry its trust label (`deterministic_local` for the verdict,
client enforcement labeled per row) and the instruction to re-verify the
client version at execution time.

## Must NOT

- **M2**: no wiring may reintroduce a budget alternative into success.
- **M3**: no client is described as enforcing what it only reads; the verdict
  comes from the script alone.
- **M4**: no claim about a client version other than the one locally
  inspected, dated; volatile facts carry their observation date.
- **M5**: one table, no per-client reference files.

## Starting state

- Plan 002 landed the script, template gates block, and condition text.
- `skills/tailrocks-reconcile/SKILL.md` steps 1-3 verify rows but never
  invoke a package-level check; "Executor claims are untrusted" is at `:29-50`.
- goal-handoff.md has the three-block paste structure and, after 000/002, the
  gate-first condition referencing the script.
- `docs/pipeline-walkthrough.md` may quote the old condition
  (`rtk rg -n 'Or stop after' docs/` to confirm).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Script tests | `rtk bun test scripts/` | exit 0 |
| Skill validation | `rtk bun run scripts/validate-skills.ts` | `Validated 15 skills.` |
| Reconcile wired | `rtk rg -n 'goal-check.sh' skills/tailrocks-reconcile/SKILL.md` | at least one match |
| Client table | `rtk rg -n 'deterministic_local' skills/tailrocks-plan/references/goal-handoff.md` | at least two matches |
| Stale walkthrough | `rtk rg -n 'Or stop after' docs/` | exit 1, no output |
| Whitespace | `rtk git diff --check` | exit 0, no output |

## Scope

**In scope**:

- `skills/tailrocks-plan/references/goal-handoff.md` — executor protocol,
  client table, kickoff/resume blocks
- `skills/tailrocks-reconcile/SKILL.md` — script-first step and BLOCKED
  routing
- `skills/tailrocks-plan/evals/**` and `skills/tailrocks-reconcile/evals/**`
  — fixtures asserting the wiring text
- `docs/pipeline-walkthrough.md` — only lines quoting the old condition
- `examples/plan-package/plans/goal-live-status/GOAL.md` — only if block text
  changed here
- `examples/plan-package/plans/goal-live-status/README.md` — only the frozen
  package fingerprint when GOAL.md changes

**Out of scope**: `goal-check.sh` itself, run-evals.ts, CI, manifests,
versions, hooks, any new executable.

## Git workflow

Ordinary repository flow per `AGENTS.md`: feature branch, one commit,
`rtk git commit -s`, subject `docs(plan): wire goal check into clients and
reconcile`, PR when complete.

## Steps

### Step 1: Executor protocol runs the script

In goal-handoff.md's executor protocol: before any DONE flip and at loop end,
run `sh plans/<slug>/goal-check.sh` and paste its final line; a BLOCKED line
means handle the named reason, never claim completion. Update kickoff and
resume blocks to match.

**Verify**: Skill validation passes; the kickoff block contains the script
command (`rtk rg -n 'goal-check.sh' skills/tailrocks-plan/references/goal-handoff.md`
matches inside the fenced kickoff text).

### Step 2: Add the honest client table

Add the O6 table with versions, dates, enforcement statements, trust labels,
and the execution-time re-verification instruction.

**Verify**: "Client table" command matches; no row claims enforcement for
Codex/Grok stop behavior.

### Step 3: Reconcile runs the script first

Add the script-first step to tailrocks-reconcile with the BLOCKED routing from
the Spec contract; cite, do not duplicate, the existing untrusted-claims rule.

**Verify**: "Reconcile wired" matches; Skill validation passes.

### Step 4: True up fixtures and the walkthrough

Update eval fixtures to assert: kickoff contains the script command; reconcile
mentions script-first; no success predicate lacks the verdict line. Fix any
old condition text in `docs/pipeline-walkthrough.md`.

**Verify**: Script tests exit 0; "Stale walkthrough" exits 1.

## Done criteria

- [ ] All commands in "Commands you will need" produce expected results.
- [ ] Executor protocol and reconcile both invoke the script by exact path.
- [ ] The client table names version, date, enforcement, and trust label per
  client, with no unverified claim.
- [ ] Eval fixtures fail if the script invocation is removed from kickoff.
- [ ] `rtk git status --porcelain=v1` lists only in-scope paths before commit.

## STOP conditions

Stop if current local client inspection contradicts a recorded version fact
(record the new evidence, do not guess), if wiring would require editing
`goal-check.sh`, or if any edit outside Scope becomes necessary.
