---
name: tailrocks-record-decision
description: >-
  Records one user decision on a roadmap item: validates it against
  settled ground, dates it with its reason, propagates it, and flags
  what it invalidates, including the reopen of READY or PLANNED work.
  Use only when the user explicitly requests this skill with one stated
  decision. Never decides for the user.
argument-hint: "<roadmap-slug> <decision>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Record Decision

## Use this skill

This skill takes one decision that the user made and makes the
roadmap item true to it: record, then reconcile.

One invocation records one decision. When a message carries
several distinct decisions, ask which one to record first. Later
decisions need separate invocations, so each propagation and
each commit stays atomic.

A falsified planning assumption reported by an executor or by
reconcile records like a decision reversal. Date it. Strike
its premise wherever the item relied on it. Propagate it
through step 3. Mark plans that list that `A#` STALE with the
falsification as reason.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the decision writes on the delivery branch of the item.

Read these references before any action:

- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections, the status machine, and the stale
  rules.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only `roadmap/<slug>/README.md`, the assets of that
folder, and the index row of the item. When a plan package
exists, also write stale markers in the writable manifest
`roadmap/<slug>/plan/README.md`. Never write a `001-*.md`
plan,
`plan/spec/`, `plan/coverage.md`, or `goal/`. Those files are
frozen and fingerprinted, and a re-plan is the only path that
changes them. Keep source, configuration, and dependencies
unchanged. Commit the decision writes per the delivery contract
at the end of the invocation.

The decision belongs to the user. The consistency check belongs
to this skill. Never soften, reinterpret, or extend the
decision. Never record a decision that the user never stated.

Check evidence before lock-in. A decision that answers a
question that research or design must settle needs that
evidence linked, not asserted. Examples: platform facts,
integration seams, structural alternatives, component
classification. Before step 1, check whether the decision
depends on a fact class that the linked `research/` topics or
design artifacts of this item never produced. When it does
and no linked evidence exists, record the decision as
provisional. Use a `PROVISIONAL:` prefix and the reason
"evidence pending". Name the skill that owes the missing
evidence. Then stop. Never propagate a provisional decision
into capabilities, screens, or must-nots as settled. An
explicit "decide now, evidence later" from the user overrides
this gate and stands recorded as the reason. Preference and
scope decisions that the user simply chooses proceed
normally.

## Procedure

1. **Load and validate.** Read `roadmap/<slug>/README.md`
   fully. Check the decision against settled ground: prior
   Decisions, Vocabulary, Must not, and linked research
   conclusions. On conflict, state the contradicted fact and
   the cost of the change. Then ask one question: keep the
   old decision or adopt the new one. On harmony, proceed.

2. **Record.** Append the decision to Decisions: date, the
   decision in the terms of the user, and the reason. When the
   reason is absent and not inferable, ask for it in one
   question. A reversal strikes the old entry with a pointer to
   the new one. Never delete silently.

3. **Propagate.** Reconcile every section that the decision
   touches: capabilities, screens, flows, must-nots, quality
   bar, vocabulary. Strike invalidated content with a pointer
   to the new decision, or rewrite it with explicit
   supersedence. Never remove it silently. Add the directly
   implied facts, not the merely nice ones. Strike answered
   Open questions. New questions that the decision raises join
   Open questions for decisions or Open research questions for
   facts.

4. **Reconcile status.** Move `DRAFT` to `SHAPING`. When the
   item is `READY`, `PLANNED`, or `IN EXECUTION` and the
   decision changes product intent, move it back to
   `SHAPING`. When `roadmap/<slug>/plan/` exists, mark the
   affected rows `STALE` in `roadmap/<slug>/plan/README.md`
   with a one-line reason. Apply the status change and
   index-row update per the item format. A decision recorded
   on an item with a plan package also moves its
   Decisions body. It moves under the frozen snapshot.
   `check.sh` answers `BLOCKED decisions-drift` from then
   on, by design. The contract ground provably moved. State
   that fact when it applies and name the next step. A
   `tailrocks-plan` re-run re-stamps the snapshot and
   un-marks the rows that the decision never staled. An
   explicit user instruction to park or resume is
   recordable. Park per the format, or un-park to the
   recorded `was:` status through the reopen rule when
   intent changed.

5. **Commit and push.** Commit the decision and its
   propagation on the delivery branch of the item with the
   trailer `Tailrocks-Skill: tailrocks-record-decision`. Push.
   Update the status line of the draft pull request body when
   the status of the item changed. One invocation ends with
   one marked commit.

## Result

The decision stands dated with a reason. Every touched section
agrees with it. Invalidated content stands struck, never
silently deleted. Status transitions obey the machine of the
item format. A decision recorded without linked research or
design evidence carries the `PROVISIONAL:` marker and its
owing skill.

## Completion checks

- The decision is dated with a reason.
- Every touched section agrees with the decision.
- Invalidated content is struck, never silently deleted.
- Status, index row, and stale markers are consistent with
  the recorded decision.
- Nothing outside the item, its index row, and the stale
  markers of the plan manifest changed.
- The work sits committed with its `Tailrocks-Skill` trailer on
  the delivery branch of the item.

## References

- `references/roadmap-item-format.md`: read it before step 1.
  It gives the sections, the status machine, and the stale
  rules.
- `references/delivery-git-contract.md`: read it before step 5.
  It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
