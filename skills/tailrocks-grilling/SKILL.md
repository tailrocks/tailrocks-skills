---
name: tailrocks-grilling
description: >-
  Use when the user asks to be grilled, challenged, interrogated, or stress-tested on an idea, plan, or decision before action. Conversation-only: retrieve facts, recommend answers, leave decisions to the user, require confirmation, and never execute.
argument-hint: "<idea, plan, or decision>"
license: Apache-2.0
user-invocable: true
---

# Grilling

Stress-test an idea, plan, or decision before action. Resolve its decision tree
in dependency order, expose every currently answerable branch, and make the
user—not the interviewer—the owner of each choice.

The deliverable is a confirmed settled-decision map in the conversation. This
skill writes no artifact and starts no execution.

## Authority

- Stay read-only. Repository and documentation inspection may establish facts;
  it never grants write, status-change, commit, push, external-message, or
  implementation authority.
- Ask the user only for decisions. Retrieve lookupable facts yourself and cite
  the source or method. Avoid secret values; cite only their location and type.
- A recommendation is advice, not a decision. Never silently accept it for the
  user, even when one answer is strongly preferred.
- Without a live user, stop. Do not simulate answers, confirmation, or consent.

Read [`references/runtime-trust.md`](references/runtime-trust.md) before using
repository, tool, or web evidence.

## Method

1. **Identify the subject.** Use the stated subject or a readable artifact. If
   neither identifies what is being challenged, ask one intake question and
   wait.
   **Complete when:** the subject and the action being considered are explicit.

2. **Build the dependency tree.** Separate facts from user-owned decisions.
   Look up quick facts inline; use read-only investigators for independent slow
   lookups when available. Give each failed lookup one alternate source, then
   mark the fact unavailable and hold every dependent branch.
   **Complete when:** each open node is a fact lookup or a decision with known
   prerequisites.

3. **Ask one frontier round.** Label it `Round N`, incrementing `N` after each
   recomputation. The frontier is every unresolved decision whose prerequisites
   are settled. Present the whole frontier as one numbered list. Every question
   must include a recommended answer and a concise reason grounded in settled
   choices or retrieved facts. Never ask a dependent question in the same round
   as its unresolved prerequisite.
   **Complete when:** the user has answered, deferred, or rejected every
   question in the round.

4. **Recompute.** Record answers in the conversation state, open branches their
   answers create, and recompute the frontier. If an answer conflicts with a
   prior answer or fact, show the contradiction and ask which statement holds;
   never resolve it yourself. Repeat frontier rounds until none remains.
   **Complete when:** no resolvable decision remains and fact-blocked branches
   are named.

5. **Confirm shared understanding.** Present a concise map of settled
   decisions, rejected directions, deferrals, unavailable facts, and any
   blocked branches. Ask the user to confirm that map explicitly. A correction
   reopens the affected nodes and returns to frontier rounds.
   **Complete when:** the user explicitly confirms the final map.

## Interruption and refusal

- If the user exits early, stop immediately and show the settled map plus the
  unresolved frontier, each open question retaining its recommendation.
- On interruption, reconstruct settled and open nodes from the conversation,
  ask the user to validate that state, then resume. Reopen settled nodes only
  when inputs changed or answers conflict.
- Refuse requests to decide product choices on the user's behalf. Explain the
  options and recommendation, then wait for their choice.
- End after confirmation. Do not turn the decision map into repository changes,
  implementation, planning artifacts, commits, pushes, or external actions.
