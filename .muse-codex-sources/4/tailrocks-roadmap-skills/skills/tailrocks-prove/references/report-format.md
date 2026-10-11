# Round report format

One file per round: `roadmap/<slug>/verification/NN-report.md`.
Three audiences read it. The operator decides the next act.
`tailrocks-reconcile` derives the Remaining of the item.
`tailrocks-retrospect` turns it into skill patches. The order
serves the first audience, the structure serves the other
two.

## Order

1. **Header**: item, branch, SHA, date, and the answered
   feedback round.
2. **Verdict on the reported statements**: every `U#` first,
   because the reporting person reads it before anything
   else.
3. **Blocking defects**: `B1`, `B2`, and so on, each with its
   evidence block.
4. **Decision compliance**: every recorded decision, `HELD`,
   `VIOLATED`, or `NOT VERIFIABLE`.
5. **Contract drift**: the running result that is not the
   blessed or specified result, with a decisions snapshot
   that predates the live section of the item.
6. **Proof defects**: done criteria and gates that certified
   nothing.
7. **The holding parts**: explicitly, by name.
8. **Recommended order**: with the gating relations stated.
9. **The unexecuted parts**: skipped surfaces, with the
   obstacle and the unproven claims.
10. **Execution evidence**: the run log of every surface
    row: command, exit, duration, decisive line, and
    artifacts.

Blocking defects precede decision compliance. Both
precede drift. That order descends by "does a person
use this at all, and does it honor the settled choices of
the user". The holding parts never drop. A report that lists
only failures reads as a verdict on the whole delivery. The
working parts are the parts that the next round never
breaks.

## The statement verdict table

```markdown
| ID | Reported | Verdict | Evidence |
|----|----------|---------|----------|
| U1 | Always reads "synced" | CONFIRMED | `B3` — hard-codes `Synced` |
| U2 | Sidebar is empty | WIDER | `B1` — empty for all accounts |
| U3 | Refresh does nothing | REFUTED | Request seen, no re-render — `B4` |
```

`WIDER` is its own verdict for a reason. A user that reports
a narrow case of a broad defect is the most common shape. A
`CONFIRMED` record loses the fact that the real defect
exceeds the report.

`REFUTED` never means "the user wrongly reported it". It
means the stated cause never held, and the underlying
complaint usually still produces a finding, cross-referenced
as above.

## The decision-compliance table

```markdown
| Decision | Verdict | Evidence |
|----------|---------|----------|
| 2026-08-02 — Sync is opt-in | HELD | ships off; `config.rs:41` |
| 2026-08-05 — No silent analytics | VIOLATED | launch event — `main.rs:112` |
```

One row per decision in the tested list: the package
snapshot, or the live section of the item with the
difference itself reported under drift. `VIOLATED` rows are
blocking: reconcile carries them into Remaining like any
blocking defect. `NOT VERIFIABLE` rows name the settling
sign. An empty list states "no decisions recorded". The
section never drops.

## Defect entries

Each entry carries one sentence on the defect. It carries
the evidence block from `execution-evidence.md`. It carries
the `file:line` home when the cause is located. It carries
the actual behavior of the surface against the expected one.
No fix. The round proves, never designs the repair, and a
fix written here is one that nobody reviewed.

State the mechanism when the evidence shows it, not a guess.
"Returns a stored value that nothing ever assigns" states a
mechanism. "Probably a race" is a guess in mechanism
clothes.

Every execution block cites its run: command, exit,
duration, decisive line, artifacts. When prose and output
disagree, the output wins and the round is invalid until the
prose is corrected. Never edit the evidence to fit a
verdict.

## Writing for reconcile

`tailrocks-reconcile` reads this file to rewrite the `##
Remaining` of the item and to prune the plan. That read works
only when every blocking defect and every drift item is
phrased as an **observable statement**. An observable
statement is the untrue fact in terms that someone checks
later, not a task. "The console starts and renders its first
frame" reconciles cleanly. "Fix the console" never does.

## Writing for retrospect

Mark a defect that the own contract of a skill prevents:
name the skill and the unmet requirement. `tailrocks-retrospect`
decides on a skill patch, and it needs the pointer, not the
verdict. Keep it to one line per defect. A round is not a
retrospective.

## Rounds accumulate, never overwrite

Round `NN` never edits round `NN-1`. Two rounds against one
SHA with different results are themselves a finding, a
flake, and it stays visible only when both survive. The
Remaining of the item is current state. The rounds are the
path there.
