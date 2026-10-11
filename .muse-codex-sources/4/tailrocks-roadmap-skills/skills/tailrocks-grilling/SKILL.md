---
name: tailrocks-grilling
description: >-
  Stress-tests an idea, plan, or decision through a challenge
  conversation before action. Use when the user asks to be grilled,
  challenged, interrogated, or stress-tested. Conversation-only: the
  skill retrieves facts, recommends answers, leaves decisions to the
  user, requires confirmation, and never executes or writes artifacts.
argument-hint: "<idea, plan, or decision>"
license: Apache-2.0
user-invocable: true
---

# Grilling

## Use this skill

This skill stress-tests an idea, plan, or decision before action.
It resolves the decision tree in dependency order. It exposes
every currently answerable branch. It keeps the user, not the
interviewer, as the owner of each choice.

The deliverable is a confirmed settled-decision map in the
conversation. This skill writes no artifact and starts no
execution. Route durable work to its exclusive owner.
`tailrocks-brainstorm` owns DRAFT or SHAPING answers.
`tailrocks-finalize` owns closing readiness. `tailrocks-research`
owns sourced findings. `tailrocks-plan` owns implementation
packages. The design skills own screens and prototypes. A
handoff names the owner. It never invokes that owner and never
grants its authority.

## Before you start

This skill is model-selectable, but it stays read-only.
Repository and documentation inspection establishes facts. It
never grants write, status-change, commit, push,
external-message, or implementation authority.

Read [`runtime-trust.md`](references/runtime-trust.md) before
you use repository, tool, or web evidence. Resolve every
relative link in this file against the directory that contains
this SKILL.md file.

Ask the user only for decisions. Retrieve lookupable facts
directly and cite the source or method. Avoid secret values.
Cite only their location and type. A recommendation is advice,
not a decision. Never silently accept it for the user, even
when one answer is strongly preferred. Without a live user,
stop. Never simulate answers, confirmation, or consent.

## Procedure

1. **Identify the subject.** Use the stated subject or a
   readable artifact. If neither identifies the challenged work,
   ask one intake question and wait.

2. **Build the dependency tree.** Separate facts from
   user-owned decisions. Look up quick facts inline. Use
   read-only investigators for independent slow lookups when
   available. Give each failed lookup one alternate source.
   Then mark the fact unavailable and hold every dependent
   branch.

3. **Ask one frontier round.** Label the round `Round N` and
   increment `N` after each recomputation. The frontier is
   every unresolved decision whose prerequisites are settled.
   Present the whole frontier as one numbered list. Every
   question includes a recommended answer and a concise reason
   grounded in settled choices or retrieved facts. Never ask a
   dependent question in the same round as its unresolved
   prerequisite.

4. **Recompute.** Record answers in the conversation state.
   Open the branches that their answers create. Recompute the
   frontier. If an answer conflicts with a prior answer or
   fact, show the contradiction and ask which statement holds.
   Never resolve it directly. Repeat frontier rounds until none
   remains.

5. **Confirm shared understanding.** Present a concise map of
   settled decisions, rejected directions, deferrals,
   unavailable facts, and blocked branches. Ask the user to
   confirm that map explicitly. A correction reopens the
   affected nodes and returns to frontier rounds.

Handle interruption and refusal as follows. If the user exits
early, stop immediately. Show the settled map plus the
unresolved frontier. Show each open question with its
recommendation. On interruption, reconstruct settled and open
nodes from the conversation, ask the user to validate that
state, then resume. Reopen settled nodes only when inputs
changed or answers conflict. Refuse requests to decide product
choices on behalf of the user: explain the options and the
recommendation, then wait. End after confirmation. Never turn
the decision map into repository changes, implementation,
planning artifacts, commits, pushes, or external actions.

## Result

The user explicitly confirmed a decision map: settled choices,
rejected directions, deferrals, unavailable facts, and blocked
branches. No file changed. No execution started.

## Completion checks

- Every frontier question carried a recommendation.
- No dependent question shared a round with its unresolved
  prerequisite.
- Every contradiction went back to the user.
- The user explicitly confirmed the final map.
- No artifact, commit, or external action resulted.

## References

- `references/runtime-trust.md`: read it before any repository
  or web read. It gives the trust and secrecy rules.
