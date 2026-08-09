# Plan 000: Harden the existing prose goal loop before any kernel exists

> **Executor instructions**: This is a one-session mitigation, not the kernel.
> Change only prose protocol and one opt-in advisory hook snippet. Do not add
> Rust, SQLite, schemas, or new trust claims. Run every verification.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- skills/tailrocks-plan/references/goal-handoff.md skills/tailrocks-reconcile/ skills/tailrocks-plan/evals/`
> Empty output is expected before this plan starts.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug, security
- **Planned at**: commit `b629fb9`, 2026-08-10

## Why this matters

The diagnosed live defect — the executor writes its own `DONE` and the goal
condition partly greps those rows
(`skills/tailrocks-plan/references/goal-handoff.md:60-79`, `:111-116`) — is not
fixed until the kernel ships in plans 003-009, months away. Every real `/goal`
run in between keeps the known false-completion hole. Cheap prose-level
hardening does not close the hole (a transcript can still lie) but shrinks it:
gates become the primary condition, statuses become secondary, and an opt-in
advisory Stop hook makes the most common failure — stopping with red gates —
mechanically inconvenient. This plan must not be oversold: its trust label is
`advisory_prose`, strictly weaker than everything the kernel later provides.

## Scope

**In scope**:

- `skills/tailrocks-plan/references/goal-handoff.md`
- `skills/tailrocks-plan/evals/**` (only cases that encode the old ordering)
- `skills/tailrocks-reconcile/SKILL.md` (one cross-reference sentence)

**Out of scope**:

- Any binary, journal, receipt, contract, or new command.
- New trust claims; this remains a prose protocol the executor can violate.
- Plugin version bumps or releases.

## Git workflow

- Branch: `fix/goal-handoff-gate-first`
- Commit subject: `fix(plan): make gates primary in goal handoff`.
- `git commit -s` plus `Co-authored-by: Codex <codex@openai.com>`. No push/PR
  without operator instruction.

## Steps

### Step 1: Make gates primary and statuses derived in the handoff protocol

Edit the executor protocol and GOAL.md template so that:

- a row may flip to `DONE` only in the same message that quotes the fresh
  command output of that plan's done criteria from this session;
- the goal condition lists gate commands first and status rows second, and adds:
  "in the final iteration, re-run every gate command after the last status
  edit and quote the outputs";
- the final iteration must invoke `tailrocks-reconcile` on the package and quote
  its summary; a reconcile that changes any row restarts the final iteration.

**Verify**: `rtk bun run scripts/validate-skills.ts` exits 0; the rendered
handoff contains gate-first condition text and the reconcile requirement.

### Step 2: Add an opt-in advisory Stop-hook snippet

Add a short documented snippet (inline in `goal-handoff.md`, marked opt-in) that
users may paste into their client hook configuration: on Stop, re-run the
GOAL.md gate commands in the repository root and block the stop with the failing
command's last lines if any exits nonzero. State its limits explicitly: same
session, same user, no clean clone, no scope check — `advisory_prose` only, and
superseded by the plan 003+ kernel checkpoint.

**Verify**: snippet is self-contained, names its trust label, and the reference
renders without broken fences (`rtk bun run scripts/validate-skills.ts` exit 0).

### Step 3: Update encoded expectations

Update any tailrocks-plan eval fixture or reference text that asserts the old
status-first ordering, and add one sentence to `skills/tailrocks-reconcile/SKILL.md`
cross-referencing the handoff's final-iteration reconcile requirement.
`rtk bun test scripts/` must pass.

**Verify**: `rtk bun test scripts/` exit 0; `git diff --check` exit 0;
`git status --short` lists only in-scope files and the README row.

## Done criteria

- [ ] Gate commands are the primary goal condition; statuses secondary.
- [ ] DONE flips require quoted same-session command output.
- [ ] Final iteration requires a reconcile pass with quoted summary.
- [ ] Advisory hook snippet exists, labeled `advisory_prose` with stated limits.
- [ ] Validator, script tests, and diff checks pass.

## STOP conditions

Stop if the change would require new executable infrastructure, a new trust
claim beyond `advisory_prose`, or edits outside the three in-scope paths.

## Maintenance notes

Plans 003/006 replace this protocol's authority with the kernel checkpoint; the
prose hardening remains as the no-binary fallback path documented there.
