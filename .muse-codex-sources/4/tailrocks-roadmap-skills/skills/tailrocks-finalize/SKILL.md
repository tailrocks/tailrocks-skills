---
name: tailrocks-finalize
description: >-
  Closes the shaping interview on a SHAPING roadmap item: resolves
  every screen, flow, and open question, then grants READY. Use only
  when the user explicitly requests this skill with a live human. The
  only source of READY. Do not use on a raw DRAFT (tailrocks-brainstorm
  first) or without a live human.
argument-hint: "<roadmap-slug> [--batch]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Finalize

## Use this skill

This skill runs the closing interview. It drives the item shut:
every screen described or mocked, every flow walked, every open
question resolved, deferred with a reason, or reclassified as
researchable. The item ends fit for a planning agent to consume
without asking the user anything. READY is earned here, nowhere
else.

Use this skill only for a SHAPING item with a live human. Route
a DRAFT item to `tailrocks-brainstorm` first. Without a live
human, stop.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the closing-interview writes on the delivery branch of the
item.

Read these references before any question:

- [`readiness-and-grilling.md`](references/readiness-and-grilling.md)
  gives the interview mechanics, screen collection, and the
  readiness checklist.
- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections and the status values.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only `roadmap/<slug>/README.md`, the assets of that
folder, and the index row of the item. Never write its `plan/`,
`verification/`, or `goal/` siblings. Other skills own them,
and `goal/check.sh` fingerprints the frozen ones. Keep source,
configuration, and dependencies unchanged.

Ask one question at a time and wait. With `--batch`, ask one
numbered frontier round at a time. Every question carries a
recommended answer. Put only decisions to the user. Look up
facts under the house evidence standard. Never answer your own
questions. Without a live human, stop.

READY obeys a checklist, not a mood. Grant it only when the
readiness gate in the reference passes in full. A steered early
exit leaves the item `SHAPING` with every remaining gap
recorded. Decline pressure to mark READY anyway, with the gap
list as the reason.

Write each resolved answer into the item immediately. Capture
described screens as schematic mockups in the item. Confirm
each mockup back with the user before you move on. Never plan,
never size, never sequence implementation. Product completeness
is the deliverable. `tailrocks-plan` owns everything after it.

## Procedure

1. **Load and assess.** Read `roadmap/<slug>/README.md` fully
   and the readiness reference. Map the gap between the item
   and the readiness checklist into a decision tree. Never
   re-ask settled ground: Decisions, Vocabulary, Must not. On
   a `DRAFT` item, route to `tailrocks-brainstorm` and stop.
   On a `READY` item, preserve the status and stop. Refuse
   every later or mismatched state without mutation. Content
   richness never bypasses status ownership.

2. **Grill to closure.** Walk the frontier parent-first, one
   question at a time per the interview contract. Priority
   order: screens and flows first, the heaviest user input,
   then must-nots and quality bar, then the remaining open
   questions. Capture described screens as schematic mockups
   in the item and confirm each back. Write every resolution
   immediately. Represent the remaining interview as closed
   nodes with stable IDs, questions, recommendations,
   dependencies, and answers. Interactive mode presents one
   sorted ready node. Batch mode presents the complete
   current ready frontier. Both modes use the same readiness
   gate. Stop when the frontier is empty or the user steers
   out.

3. **Classify the remainder.** Every still-open question ends
   resolved, deferred, or reclassified. A resolved question
   holds its answer in its section. A deferred question holds
   reason and revisit trigger agreed by the user. A
   reclassified question is an open research question that
   the research pass of `tailrocks-plan` owns. Nothing
   stays a bare open decision.

4. **Run the readiness gate.** Check the item against every
   box of the checklist in the reference. Earn the planning
   dry run with fresh eyes per the reference, never by
   self-certification. Grant `READY` in the item and the
   index row only on a full pass. On pass, name the next
   step. Name the design stage for every screen with a
   visual surface and no blessed reference. Then name
   `tailrocks-plan <slug>`. When the item has no visual
   surface, name `tailrocks-plan <slug>` straight. Planning
   refuses a screen that reached it with neither blessing
   nor deferral. On a steered exit before pass, status
   stays `SHAPING`. Every remaining gap stands under Open
   questions. The close-out states the facts that a future
   session still collects.

5. **Commit and push.** Commit the closing-interview writes
   on the delivery branch of the item with the trailer
   `Tailrocks-Skill: tailrocks-finalize`. Push. Update the
   status line of the draft pull request body when the status
   of the item changed. One invocation ends with one marked
   commit. The commit that grants READY is the record that
   the gate passed, and its subject carries the reason.

## Result

Every session answer stands in the item. Every promised
screen holds a schematic with states. Open questions is empty,
or the item is honestly `SHAPING` with the remainder standing
under Open questions. READY stands granted only by the full
checklist. Nothing outside the item file, its assets, and its
index row changed.

## Completion checks

- Every session answer is in the item.
- Every promised screen holds a schematic and states.
- Open questions is empty, or the item is honestly `SHAPING`
  with the remainder recorded.
- READY was granted only by the full checklist.
- Nothing outside the item file, its assets, and its index
  row changed.
- The work sits committed with its `Tailrocks-Skill` trailer on
  the delivery branch of the item.

## References

- `references/readiness-and-grilling.md`: read it before step
  1. It gives the mechanics, screens, remainder, checklist,
  dry run, and stopping rules.
- `references/roadmap-item-format.md`: read it before step 1.
  It gives the sections and the status values.
- `references/delivery-git-contract.md`: read it before step 5.
  It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
