# Delivery Pipeline Walkthrough

One feature, `goal-live-status`, from raw thought to reconciled execution.
Invocations below are agent-neutral: explicitly invoke the named skill.

## 1. Capture with tailrocks-idea

Invoke tailrocks-idea with: “Show live status for running goal loops.”
It derives `goal-live-status`, copies the item shape, preserves only stated
intent, and leaves unknown sections visibly empty.

```text
+ roadmap/goal-live-status/README.md  Status: DRAFT
~ roadmap/README.md                   new index row
```

Status: DRAFT. Example:
[`roadmap item`](../examples/plan-package/roadmap/goal-live-status/README.md).

## 2. Shape with tailrocks-brainstorm

Invoke tailrocks-brainstorm for `goal-live-status`. The skill sets SHAPING,
looks up answerable facts, then asks one decision question at a time with a
recommendation. Answers immediately update Decisions, Vocabulary, screens,
flows, and must-nots.

```text
~ roadmap/goal-live-status/README.md  Status: SHAPING; Decisions/Vocabulary
~ roadmap/README.md                   SHAPING
```

Status: SHAPING.

## 3. Establish facts with tailrocks-research

Invoke tailrocks-research for the status-snapshot IPC question and link it to
the item. Independent investigators cite primary sources or `file:line`;
the orchestrator vets every citation and registers the reusable topic.

```text
+ research/goal-status-ipc/README.md
+ research/goal-status-ipc/01-status-sources.md
~ research/README.md
~ roadmap/goal-live-status/README.md  bidirectional link
```

Status stays SHAPING. Example:
[`research topic`](../examples/plan-package/research/goal-status-ipc/).

## 4. Record one decision with tailrocks-record-decision

Invoke tailrocks-record-decision with: “The viewer reads snapshots only; it
never controls execution.” The skill checks settled ground, records the dated
reason, propagates the choice, and adds the must-not.

```text
~ roadmap/goal-live-status/README.md  decision + propagated constraints
~ roadmap/README.md                   matching status/date
```

Status stays SHAPING. If this reversed a PLANNED item, it would return to
SHAPING and affected plan rows would become STALE.

## 5. Earn READY with tailrocks-finalize

Invoke tailrocks-finalize for the item. The closing interview confirms
schematic screens, walks the primary flow, and resolves, defers with reason,
or reclassifies every open question. Only the complete readiness checklist
grants READY.

```text
~ roadmap/goal-live-status/README.md  Status: READY; no open decisions
~ roadmap/README.md                   READY
```

Status: READY.

## 6. Package with tailrocks-plan

Invoke tailrocks-plan for `goal-live-status`. It inventories every normative
statement, closes research gaps, writes OpenSpec-grammar requirements, slices
the manifest baseline-first, writes/cold-reviews one zero-context plan per
row, then writes GOAL.md and commits the package.

```text
+ plans/goal-live-status/coverage.md
+ plans/goal-live-status/spec/
+ plans/goal-live-status/README.md
+ plans/goal-live-status/001-*.md ...
+ plans/goal-live-status/GOAL.md
~ roadmap/goal-live-status/README.md  Status: PLANNED; Plan link
```

The ledger includes `B#` quality statements; the must-not registry has plan
backlinks. Status: PLANNED. Worked
[`ledger`](../examples/plan-package/plans/goal-live-status/coverage.md),
[`spec`](../examples/plan-package/plans/goal-live-status/spec/),
[`hub`](../examples/plan-package/plans/goal-live-status/README.md), and
[`GOAL.md`](../examples/plan-package/plans/goal-live-status/GOAL.md).

## 7. Execute through the goal loop

Submit GOAL.md block 1 as the goal condition and block 2 as kickoff:

```text
Every row is DONE or REJECTED; none is STALE, BLOCKED, or IN PROGRESS;
both named repository gates exit 0. Or stop after the bounded turn count.
```

```text
Read plans/goal-live-status/README.md and follow Executor protocol:
one plan per iteration, preconditions first, every verification run,
protocol status writes committed with work, no improvisation around STOP.
```

The first slice sets item/index IN EXECUTION. Hub rows move TODO → IN
PROGRESS → DONE. When the terminal predicate and both gates pass, protocol
writes set item/index DONE with a Log entry.

## 8. Reconcile a stalled loop

Invoke tailrocks-reconcile for `goal-live-status`. It re-runs every DONE
criterion, resets abandoned IN PROGRESS rows, retests BLOCKED reasons and
`A#` assumptions, drift-checks TODO plans, and marks stale plans explicitly.

```text
~ plans/goal-live-status/README.md  evidence-backed statuses
~ roadmap/goal-live-status/README.md
~ roadmap/README.md
```

No plan or source file changes. Resume only from reconciled statuses.

## 9. Re-plan after changed intent

Invoke tailrocks-record-decision on the PLANNED/DONE item. A material intent
change returns it to SHAPING and marks affected rows STALE. Shape/finalize
again as needed, then invoke tailrocks-plan: it refreshes stale rows, records
spec deltas, keeps numbering monotonic, and regenerates GOAL.md last.

A falsified assumption follows the same owned route: executor names failed
`A#` → record-decision propagates → leaning plans STALE → plan refreshes.

## Common mistakes

- Planning a SHAPING item: finalize must earn READY first.
- Skipping finalization: unresolved decisions cannot become assumptions.
- Editing stale plans by hand: record the change and re-run tailrocks-plan.
- Trusting an interrupted loop: reconcile before resume.
- Treating PARKED as terminal: explicit resume restores its recorded `was:`
  state through tailrocks-record-decision.
