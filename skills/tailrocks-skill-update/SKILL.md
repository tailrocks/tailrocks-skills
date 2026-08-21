---
name: tailrocks-skill-update
description: >-
  Use only when the user explicitly requests this skill. Update an existing skill in place without changing its invocation contract: baseline the failure, check its eval set before touching load-bearing lines, strengthen over append, update the full eval set for CI. Never runs evals locally.
argument-hint: "<skill name>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Skill Update

A behavioral edit is code: **no behavioral edit without the failure
observed first** — if you have not seen the skill's current text produce
the wrong behavior, you do not know the edit fixes it. And a router edit
is a change to *every* behavior in the file: each added line dilutes the
ones already there.

An update never changes how the skill is invoked or when it fires —
name, trigger surface, and arguments stay. A change that would alter
them is not an update; stop and say so.

The authoring doctrine — design, testing, and house wiring — is shipped
with `tailrocks-skill-audit`; this skill operationalizes it for edits.
When the working repository carries its own skill-tree conventions,
those govern.

## Steps

1. **Baseline the failure.** Write down what the skill's current text
   lets through — from the current conversation, a hand-run observation,
   or a field record with commit-level evidence behind it. A request
   with no observable failure behind it is refused, with the reason
   recorded.
   **Complete when:** the failure is written down or the request is
   declined.

2. **Scope the edit.** Read the skill whole — `SKILL.md`, every
   reference, `evals/evals.json`. Check the eval set for cases that
   depend on the lines you are about to touch *before* rewording a gate,
   a rejection rule, or a completion clause: those lines are
   load-bearing, and an eval-pinned line is not edited casually.
   **Complete when:** every line the edit touches is classified
   load-bearing or free, with the eval cases that pin it named.

3. **Apply the smallest strong form.** Strengthen an existing section
   over adding one — two sections gesturing at one obligation are weaker
   than one that states it. Depth goes to references, routed by when to
   read. Past the tree's router budget, replace rather than append. A
   load-bearing requirement gets a structural cue — named bullet,
   heading, labeled sentence — never a mid-paragraph clause. Every edit
   maps to the baseline; an edit that does not is dropped.
   **Complete when:** each surviving edit names the failure it fixes.

4. **Update the full eval set for CI.** Not only the case nearest the
   edit — a router change moves every behavior, so the whole set is
   reviewed and updated for CI to run once wired. Eval execution is
   never run locally.
   **Complete when:** the eval set covers the edit and every case still
   matches the text it pins.

5. **Validate.** Run the tree's validators until green and refresh the
   generated surface the house-wiring doctrine lists (docs, index,
   catalog where the edit changes them).
   **Complete when:** validation is green and no generated file is
   stale.

## Red flags — STOP

- "Just add a section" — additions dilute every existing behavior;
  strengthen or replace, then update the whole eval set for CI.
- "The evals pass, skip the baseline" — passing evals prove the old
  behaviors survive; they say nothing about the new one.
- "Rephrase the gates, it's just prose" — a gate an eval case depends on
  is load-bearing; check the eval set first.
- "Fire the trigger more often while you're at it" — that is a contract
  change, not an update.

## Final gate

Never ship a behavioral edit whose failure was not observed. Never
reword an eval-pinned line without checking the eval set. Never append
past the router budget. Never change the invocation contract in an
update. Never run the eval harness locally. Report every check skipped.
