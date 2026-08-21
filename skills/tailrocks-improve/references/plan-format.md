# Plan format

One file per finding: `plans/NNN-<slug>.md`, numbered in recommended
execution order. The quality bar, applied to every plan:

> Could an agent that has never seen this repository execute this with
> only the plan file and the repository?

Three properties make that true: self-contained context, verification
gates the executor never has to judge, and hard boundaries with escape
hatches.

## Template

```markdown
> Executor: run every verification command in this plan and check the
> output against what the plan says it must print. Do not improvise. Drift
> check first: `git diff --stat <planned-at-sha>..HEAD -- <in-scope paths>`
> — any output means STOP and report back.

## Status

- Priority: P1 | P2 | P3
- Effort: S | M | L
- Risk: LOW | MED | HIGH
- Depends on: <plan numbers or none>
- Lane: <audit lane>
- Planned at: <commit SHA>, <date>

## Why this matters

Two to five sentences. This is what lets a correct judgment call happen
when a detail is off — the executor inherits the intent, not just steps.

## Current state

- The files involved and their roles.
- Current-code excerpts with `file:line` — from the planner's own reads,
  never from an investigator's report.
- The repository conventions that constrain the change, with one exemplar
  file to imitate.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|

Every command verified during recon — run, and its success output seen —
never guessed.

## Scope

In scope: the explicit file list. Out of scope: the adjacent files that
look related, each with the reason it must not be touched.

## Git workflow

Branch name, commit style matched to the repository's own history, no push
or pull request unless the user instructs it.

## Steps

Ordered so the repository is never broken between steps. Every step ends:

**Verify**: <command> → <expected output>

## Test plan

The new tests, where they live, and which existing test file they are
modeled after.

## Done criteria

A machine-checkable checklist, including the grep that proves the old
pattern is gone and a `git status` scope check. A criterion that requires
judgment instead of a command is rewritten until a command decides it.

## Stop conditions

The plan-specific escape hatches — what evidence means "stop and report
back instead of continuing." Not boilerplate: each names a concrete signal.

## Maintenance notes

What this change interacts with later, what a reviewer should focus on,
and follow-ups deliberately deferred.
```

## The index — `plans/README.md`

One table, one row per plan: number, title, priority, status (`TODO |
IN PROGRESS | DONE | BLOCKED | REJECTED`), depends-on. Below it:
dependency notes in prose, and the findings considered and rejected with
their one-line reasons. The index is the only status surface; a status
lives nowhere else.

## Rerun and reconcile rules

- Numbering is monotonic; a retired plan keeps its number and its
  `REJECTED` or `DONE` row — numbers are never recycled.
- Reconcile-don't-duplicate: a finding with a plan row is refreshed in
  place (excerpts and planned-at SHA re-stamped) or retired; it is never
  planned twice.
- An approach change is a new plan under a new number, with the old row
  marked `REJECTED` and pointing at its replacement.
- `DONE` rows get a cheap spot-check on the current HEAD during reconcile;
  one that fails moves back with the evidence.
