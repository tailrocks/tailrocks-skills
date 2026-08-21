# Round report format

One file per round: `roadmap/<slug>/verification/NN-report.md`. It is read by
three audiences — the operator deciding what to do next, `tailrocks-reconcile`
deriving the item's Remaining, and `tailrocks-retrospect` turning it into skill
patches — so it is ordered for the first and structured for the other two.

## Order

1. **Header** — item, branch, SHA, date, and the feedback round this answers.
2. **Verdict on the reported statements** — every `U#`, first, because the
   person who reported them reads this before anything else.
3. **Blocking defects** — `B1`, `B2`, … each with its evidence block.
4. **Decision compliance** — every recorded decision, `HELD` / `VIOLATED` /
   `NOT VERIFIABLE`.
5. **Contract drift** — what runs but is not what was blessed or specified,
   including a decisions snapshot that predates the item's live section.
6. **Proof defects** — done criteria and gates that certified nothing.
7. **What holds up** — explicitly, by name.
8. **Recommended order** — with the gating relationships stated.
9. **What was not executed** — surfaces skipped, with the obstacle and the
   claims left unproven.

Blocking defects before decision compliance, and both before drift, because
that is descending order of "can a person use this at all, and does it honor
what the user settled". What holds up is never
omitted: a report that lists only failures is read as a verdict on the whole
delivery, and the parts that work are what the next round must not break.

## The statement verdict table

```markdown
| ID | Reported | Verdict | Evidence |
|----|----------|---------|----------|
| U1 | Sync state always reads "synced" | CONFIRMED | `B3` — every row hard-codes `Synced` at `list.rs:88` |
| U2 | Sidebar is empty | WIDER | `B1` — empty for every account, not only theirs |
| U3 | Refresh does nothing | REFUTED | Request observed at `net.rs:204`; the list does not re-render — recorded as `B4` |
```

`WIDER` is its own verdict for a reason: a user reporting a narrow case of a
broad defect is the most common shape, and recording it as `CONFIRMED` loses
the fact that the real defect is larger than the report.

`REFUTED` never means "the user was wrong to report it". It means the stated
cause did not hold — and the underlying complaint usually still produces a
finding, cross-referenced as above.

## The decision-compliance table

```markdown
| Decision | Verdict | Evidence |
|----------|---------|----------|
| 2026-08-02 — Sync is opt-in, never default | HELD | settings ship with sync off; `config.rs:41` default `false` |
| 2026-08-05 — No analytics without consent | VIOLATED | telemetry event fires at first launch — `main.rs:112`, before the consent screen |
```

One row per decision in the tested list (the package snapshot, or the item's
live section with the difference itself reported under drift). `VIOLATED`
rows are blocking: reconcile carries them into Remaining like any blocking
defect. `NOT VERIFIABLE` rows name what would settle them. An empty list
says "no decisions recorded" — the section is never omitted.

## Defect entries

Each carries: what it is in one sentence, the evidence block from
`execution-evidence.md`, where it lives as `file:line` when the cause is
located, and what the surface does instead of what it should. No fix — the
round proves, it does not design the repair, and a fix written here is one
nobody reviewed.

State the mechanism when the evidence shows it, not a guess: "returns a stored
value nothing ever assigns to" is mechanism; "probably a race" is a guess
wearing mechanism's clothes.

## Writing for reconcile

`tailrocks-reconcile` reads this file to rewrite the item's `## Remaining` and
to prune the plan. That works only when every blocking defect and every drift
item is phrased as an **observable statement** — what is not true yet, in
terms someone can check later — rather than as a task. "The console starts and
renders its first frame" reconciles cleanly; "fix the console" does not.

## Writing for retrospect

A defect that a skill's own contract should have prevented is worth marking:
name the skill and what it asked for that did not happen. `tailrocks-retrospect`
decides whether that becomes a skill patch, and it needs the pointer, not the
verdict. Keep it to a line per defect; a round is not a retrospective.

## Rounds accumulate, they do not overwrite

Round `NN` never edits round `NN-1`. Two rounds against the same SHA with
different results is itself a finding — a flake — and it is only visible when
both survive. The item's Remaining is current state; the rounds are how it got
there.
