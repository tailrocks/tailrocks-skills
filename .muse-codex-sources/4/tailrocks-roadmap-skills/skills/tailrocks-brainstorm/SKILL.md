---
name: tailrocks-brainstorm
description: >-
  Shapes a DRAFT or SHAPING roadmap item through a one-question-at-a-time
  interview, and writes every answer into the item as it resolves. Use
  only when the user explicitly requests this skill with a live human.
  Do not use for final readiness (tailrocks-finalize), for a READY item,
  or without a live human.
argument-hint: "<roadmap-slug> [--batch]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Brainstorm

## Use this skill

This skill grills the user about a young roadmap item until its
shape is clear. The shape is the identity of the item, its
users, the chosen directions, and the dead ones. This
interview expands. Divergence
is welcome, new branches are progress, and the item leaves bigger
and rougher than a finalization pass allows.
`tailrocks-finalize` closes the item later. This skill opens it.

The deliverable is the updated item, not the conversation. Every
resolved answer lands in `roadmap/<slug>/README.md` the moment it
resolves.

Use this skill only for a DRAFT or SHAPING item with a live
human. Point a READY item at `tailrocks-record-decision` for a
targeted change or at `tailrocks-finalize` for a re-finalize.
Without a live human, stop and say so.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the shaping writes on the delivery branch of the item.

Read these references before any question:

- [`grilling-method.md`](references/grilling-method.md) gives the
  decision tree, the frontier, question craft, and the close
  check.
- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections and the status values.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only `roadmap/<slug>/README.md`, the assets of that folder,
and the index row of the item. Never write its `plan/`,
`verification/`, or `goal/` siblings. Other skills own them, and
`goal/check.sh` fingerprints the frozen ones. Keep source,
configuration, and dependencies unchanged.

Ask one question at a time and wait. With `--batch`, ask one
numbered frontier round at a time. Every question carries a
recommended answer. Put only decisions to the user. Look up the
facts that the repository, the web, or a referenced project can
answer, under the house evidence standard: URL, `file:line`, or
method. Cite the source in the item. Never answer your own
questions.

Record answers faithfully. Settled choices go to Decisions,
dated with reasons. Sharpened terms go to Vocabulary. Discovered
unknowns go to Open questions for decisions or to Open research
questions for facts. Nothing lives only in the chat. Never plan,
never design architecture, never write code. Direction is the
product.

## Procedure

1. **Enter SHAPING.** Read `roadmap/<slug>/README.md` fully:
   its Decisions, Vocabulary, and Must not are settled ground
   that this skill never re-asks. If the slug does not exist,
   list available items and stop. If the status is `READY` or
   later, state that the item is past brainstorming and point at
   `tailrocks-record-decision` or `tailrocks-finalize`. Change a
   `DRAFT` status to `SHAPING` in the item and the index row.
   Preserve a `SHAPING` status. Never grant `READY`. Only
   `tailrocks-finalize` owns that transition.

2. **Seed the tree.** Read the grilling method reference. Build
   the decision tree from the item. Use its empty sections,
   open questions, vague statements, and internal
   contradictions. Look up the facts that the environment
   answers before you ask anything. Send slow lookups to
   background read-only investigators per the method, and
   continue the interview during their run.

3. **Grill.** Walk the frontier per the method. Sort ready
   nodes by stable question ID. Present exactly the first
   ready node, or the entire current ready frontier with
   `--batch`. A node
   is ready only after every dependency has an answer.
   Recompute only after the presented round is recorded, so
   answers never pull dependent questions into the same round.
   Each question carries a recommended answer grounded in the
   looked-up facts. Write each resolved answer into its item
   section immediately. New branches that an answer spawns join
   the tree. Never chase them mid-question. Stop when the
   frontier is empty or the user steers out. On a steered exit,
   record every open decision in the item.

4. **Close the session.** Apply the status change and index-row
   update per the item format. The item has no Log. The
   close-out and the commit subject of the invocation carry the
   settled facts and the remainder. Emit the research agenda
   when Open research questions is non-empty. Group the
   questions into proposed `tailrocks-research` invocations.
   Give each a one-line brief. Name the next step: more
   research, targeted decisions, or finalization when Open
   questions looks thin. Run the close check from the method
   with fresh eyes before closing. Fix the missed writes, then
   close.

5. **Commit and push.** Commit the shaping writes on the
   delivery branch of the item with the trailer
   `Tailrocks-Skill: tailrocks-brainstorm`. Push. Update the
   status line of the draft pull request body when the status
   of the item changed. One invocation ends with one marked
   commit.

## Result

The item file holds every session answer: dated decisions with
reasons, sharpened vocabulary, and sourced facts. Every invented
but unanswered question stands recorded open. Status and index
row are consistent. No file outside the item file, its assets,
and its index row changed.

## Completion checks

- Every user answer from the session is in the item.
- Every unanswered invented question is recorded open.
- Status and index row are consistent.
- No file outside the item file, its assets, and its index row
  changed.
- The close check ran with fresh eyes.
- The work sits committed with its `Tailrocks-Skill` trailer on
  the delivery branch of the item.

## References

- `references/grilling-method.md`: read it before step 2. It
  gives the tree, frontier, batch, agenda, and close-check
  rules.
- `references/roadmap-item-format.md`: read it before step 1.
  It gives the sections and the status values.
- `references/delivery-git-contract.md`: read it before step 5.
  It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
