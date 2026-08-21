# Worked Item-folder Example

> Format anchor only. The repository this item plans does not exist and its
> `example://` evidence is invented, so the gate commands cannot pass here —
> see [Running the gate](#running-the-gate). Run `tailrocks-plan` against a
> live item instead of copying this one.

One item, one folder. Everything about `goal-live-status` lives under
`roadmap/goal-live-status/`, and no artifact about it lives anywhere else:

```text
roadmap/README.md                      the index board — one row per item
roadmap/goal-live-status/
  README.md                            the item — intent, decisions, status   writable
  plan/
    README.md                          manifest hub + executor protocol       writable
    coverage.md                        the traceability ledger                FROZEN
    spec/                              requirements, screens, must-nots       FROZEN
    001-*.md 002-*.md 003-*.md         zero-context plans                     FROZEN
  verification/
    01-feedback.md                     what the user reported, verbatim       writable
    01-report.md                       what execution proved                  writable
  goal/
    START.md                           kickoff prompt, gates, goal condition  FROZEN
    RESUME.md                          resume prompt                          FROZEN
    check.sh                           the machine gate                       FROZEN
research/goal-status-ipc/              a standing topic, reusable by any item
```

`goal/check.sh` hashes every FROZEN file into the
`Frozen contract fingerprint` line in `plan/README.md` and returns
`BLOCKED plan-drift` when one changes, so the contract an executor was handed
cannot be edited to match what shipped. The item, the manifest's Status column,
and every verification round sit outside that hash by design — they are what
the loop has to move.

## Read it in pipeline order

1. [`roadmap/goal-live-status/README.md`](roadmap/goal-live-status/README.md)
   supplies settled intent — and, after a round, the Remaining section.
2. [`research/goal-status-ipc/`](research/goal-status-ipc/) supplies vetted
   example evidence, linked from the item and reusable by any other.
3. [`plan/coverage.md`](roadmap/goal-live-status/plan/coverage.md) inventories
   every normative statement in the item.
4. [`plan/spec/`](roadmap/goal-live-status/plan/spec/) turns them into
   contracts.
5. [`plan/README.md`](roadmap/goal-live-status/plan/README.md) orders three
   executable plans and carries the executor protocol.
6. [`goal/START.md`](roadmap/goal-live-status/goal/START.md) hands the contract
   to an autonomous loop; [`goal/RESUME.md`](roadmap/goal-live-status/goal/RESUME.md)
   picks it back up.
7. [`verification/01-feedback.md`](roadmap/goal-live-status/verification/01-feedback.md)
   and [`01-report.md`](roadmap/goal-live-status/verification/01-report.md)
   close the round: what the user reported, and what executing the shipped
   thing proved.

## The state this example is frozen in

Every plan row is `DONE` and the gate structure passes, and the item is
**IN EXECUTION**, not DONE. That is the point of the round: `check.sh` proves
the work ran, `verification/01-report.md` proves it misbehaves, and one
blocking defect stands in the item's Remaining section. `DONE` is written only
by `tailrocks-reconcile`, and only after a round with no blocking defect.

The loop from here: re-plan the defect, execute, run `tailrocks-record-feedback`
and `tailrocks-prove` again, reconcile — until Remaining is empty.

## What retirement would look like

A folder under `roadmap/` is work that is **not finished**, so this example
stops one round short of the end on purpose. If round 02 came back with no
blocking defect — every hub row terminal, `check.sh` green, Remaining empty —
`tailrocks-reconcile` would write `DONE` and then retire the item in the same
invocation, in two commits:

```text
commit 1  ~ roadmap/goal-live-status/README.md  Status: DONE, Remaining empty
          ~ roadmap/README.md                   DONE
commit 2  - roadmap/goal-live-status/           README.md, plan/, verification/, goal/
          ~ roadmap/README.md                   row removed
```

Everything above the `research/` line in the tree at the top of this file
would be gone: the item, the ledger, the spec, all three plans, the round, and
the goal package. `research/goal-status-ipc/` would stay — topics are standing
artifacts, reusable by any item, and never belong to one. If
`goal-live-status` were the board's last row, `roadmap/README.md` and
`roadmap/` would go too.

Two commits rather than one because the pull request has to show both halves:
that the item earned `DONE` on evidence, and that the folder then went. An
absence on its own looks the same as a mistaken deletion.

Nothing would be lost. After a retirement the item is read out of history:

```sh
git log --format='%h %ad %s' --date=short -- roadmap/goal-live-status/
git show <commit>^:roadmap/goal-live-status/README.md
```

The first lists every commit that touched the item, each carrying the
`Tailrocks-Skill` trailer of the skill that wrote it; the second prints any
artifact exactly as it stood before that commit — the item, a plan, a
verification round. `tailrocks-retrospect` reads a shipped item the same way.

This directory is not retired when that happens, because it is not delivery
work: it lives under `examples/`, it is a format anchor for the file shapes,
and nothing here is on anyone's board.

## Running the gate

```sh
cd examples/item-folder
sh roadmap/goal-live-status/goal/check.sh
```

The paths inside the fingerprint are relative to this directory, so the gate is
run from here. On a clean checkout it verifies the frozen contract, the status
table, and the gates block, then reaches the first gate command and stops with:

```text
TAILROCKS GOAL: BLOCKED gate-failed=mise run test
```

That is the correct verdict for an invented workspace — there is no Rust
project here to test. Everything before the gate commands is real and is
checked: tamper with any FROZEN file and the verdict becomes
`TAILROCKS GOAL: BLOCKED plan-drift` instead.

Both gate lines are written in the required `<command> ||| <proof>` form. The
proof prints how many units the command executed — test cases in the JUnit
report, targets clippy covered — because a gate that cannot tell "everything
passed" from "nothing ran" is not a gate. A proof that prints zero returns
`BLOCKED gate-vacuous`; a missing `|||` returns `BLOCKED gate-unproven`.
