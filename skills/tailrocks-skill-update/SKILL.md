---
name: tailrocks-skill-update
description: >-
  Use only when the user explicitly requests this skill. Improve an existing skill in place while preserving its responsibility and public contract. Includes applying selected audit findings; excludes split, merge, rename, and migration.
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

An update preserves the public contract: responsibility, name, semantic
trigger scope, arguments, outputs, side effects, authority, and failure policy.
A change to any of these routes to `tailrocks-skill-refactor`.

Use the design, testing, and house-wiring doctrine shipped with
`tailrocks-skill-audit`; working-repository conventions govern when present.

## Steps

1. **Baseline the failure.** Accept a current-behavior observation, field
   record, regression case, user feedback tied to an artifact, efficiency
   regression, or selected IDs from a current skill-audit report. Reopen audit
   evidence; a summary or stale finding is not evidence.
   **Complete when:** the failure is written down or the request is
   declined.

2. **Freeze the contract and scope the edit.** Read `SKILL.md`, every
   reference, `evals/evals.json`. Check the eval set for cases that
   depend on the lines you are about to touch *before* rewording a gate,
   a rejection rule, or a completion clause: those lines are
   load-bearing, and an eval-pinned line is not edited casually.
   Record its responsibility, triggers, arguments, outputs, side effects,
   authority, and failure policy. Every proposed semantic contract delta routes
   to refactor. **Complete when:** every line the edit touches is classified
   load-bearing or free, with the eval cases that pin it named.

3. **Apply the smallest strong form.** Strengthen an existing section
   over adding one — two sections gesturing at one obligation are weaker
   than one that states it. Depth goes to references, routed by when to
   read. Past the tree's router budget, replace rather than append. A
   load-bearing requirement gets a structural cue — named bullet,
   heading, labeled sentence — never a mid-paragraph clause. Every edit
   maps to the baseline; an edit that does not is dropped.
   **Complete when:** each surviving edit names the failure it fixes.

4. **Update the affected eval set for CI.** Add the regression case before the
   behavioral edit. Use explicit requirement-to-case coverage to select the
   target case and every preserved invariant it can affect; a router or trigger
   change selects the full suite. Compare the previous skill with the candidate.
   Eval execution is never run locally.
   **Complete when:** the target failure and affected preserved invariants have
   atomic assertions, and the contract snapshot is unchanged.

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
