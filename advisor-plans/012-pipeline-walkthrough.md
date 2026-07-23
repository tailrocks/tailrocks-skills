# Plan 012: Write the end-to-end delivery-pipeline walkthrough

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- README.md AGENTS.md 'skills/tailrocks-idea' 'skills/tailrocks-brainstorm' 'skills/tailrocks-finalize' 'skills/tailrocks-plan' 'skills/tailrocks-reconcile'`
> Read any changed SKILL.md before describing its behavior; the
> walkthrough must match live skill text, not this plan's snapshot.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: advisor-plans/011 (soft — link its example; if 011 is
  not DONE, write the walkthrough with inline mini-snippets and note the
  links to add later)
- **Category**: docs
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

The delivery family is seven skills across six status transitions and
three artifact trees, documented only as an ASCII diagram
(README.md:43-59) and per-skill abstractions (AGENTS.md:92-143). No doc
walks one slug from idea to reconcile showing the command, the files
that appear, and the status flips. That absence is the repo's
highest-friction onboarding gap, and misuse it invites (planning a
SHAPING item) is literally an eval case
(`skills/tailrocks-plan/evals/evals.json` id 2).

## Current state

- README.md:43-59: pipeline diagram (idea → brainstorm → finalize →
  plan → /goal executor → reconcile; research + record-decision as side
  entries) and a prose paragraph on artifacts. Nothing narrative.
- The seven SKILL.md files define per-skill behavior (verified reads at
  `f2c4be5`; each has Steps + Final gate).
- Post-001/002 contract details (predicate wording, protocol writes,
  `B#` prefix) — the walkthrough must reflect them.
- Plan 011 (if DONE) provides `examples/plan-package/` to link per stage.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |

## Scope

**In scope**:
- `docs/pipeline-walkthrough.md` (create; `docs/` dir is new)
- `README.md` — one link line in the delivery-family section
- `AGENTS.md` — one link line in the delivery-family section

**Out of scope**:
- Any skills/** content.
- Restating the roadmap-item format or plan template (link, don't copy).

## Git workflow

- Branch: `advisor/012-pipeline-walkthrough`.
- Conventional Commits, DCO: `git commit -s -m "docs: add delivery-pipeline walkthrough"`.
  Main PR-only; no push/PR unless instructed.

## Steps

### Step 1: Write `docs/pipeline-walkthrough.md`

One invented feature ("live status board for /goal loops" — reuse plan
011's slug `goal-live-status` so the example package matches), walked in
nine scenes; per scene: the invocation (agent-neutral: "invoke
tailrocks-idea with …" — never `/name` or `$name` syntax, matching house
rule 2), 3–6 lines of what the skill does, the file tree delta
(`roadmap/goal-live-status/README.md` appears, status DRAFT, index row…),
and the status after. Scenes:

1. tailrocks-idea — capture; DRAFT.
2. tailrocks-brainstorm — the interview; SHAPING; what lands in
   Decisions/Vocabulary.
3. tailrocks-research — a topic under `research/`; item links.
4. tailrocks-record-decision — one decision; propagation shown.
5. tailrocks-finalize — readiness gate; READY.
6. tailrocks-plan — the package appears (ledger → spec → manifest →
   plans → GOAL.md); PLANNED. Link the example package per artifact
   (011).
7. /goal execution — paste block 1 + block 2; hub rows flip; IN
   EXECUTION → DONE; protocol writes (item + index) shown.
8. tailrocks-reconcile — a stalled-loop variant: what re-verification
   changes.
9. The re-plan loop — record-decision on a PLANNED item → SHAPING +
   STALE rows → tailrocks-plan re-run (the post-001 re-run path).

Close with a "common mistakes" list: planning a SHAPING item, skipping
finalize, editing plans by hand instead of re-running tailrocks-plan.
Target ≤ 250 lines.

**Verify**: `grep -c "^## " docs/pipeline-walkthrough.md` → ≥ 9;
`grep -n "tailrocks-plan" docs/pipeline-walkthrough.md` → present; no
client-specific invocation syntax:
`grep -nE '(/tailrocks-|\$tailrocks-)' docs/pipeline-walkthrough.md` → 0 hits.

### Step 2: Link it

Add one line each to README.md (after the pipeline diagram) and
AGENTS.md (end of delivery-family intro): "Worked walkthrough:
docs/pipeline-walkthrough.md."

**Verify**: `grep -n "pipeline-walkthrough" README.md AGENTS.md` → 1 hit
each; `bun run scripts/validate-skills.ts` → exit 0.

## Test plan

Machine: the greps. Human: someone who has never used the family reads
the walkthrough and states the command sequence for a new idea — should
match without opening a SKILL.md.

## Done criteria

- [ ] `docs/pipeline-walkthrough.md` exists, 9 scenes + mistakes list,
      agent-neutral invocations
- [ ] README + AGENTS link it
- [ ] Statuses/artifacts named per scene match the live SKILL.md texts
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A scene cannot be written without contradicting a SKILL.md — the skill
  text wins; report the ambiguity.
- Scope temptation: rewriting README's own pipeline section — link only.

## Maintenance notes

- The walkthrough describes behavior owned by seven SKILL.md files;
  skill edits (esp. by 001/002/009/016) can stale it — reviewers of
  future delivery-family PRs should check the walkthrough.
- If 011 was skipped, revisit to add example links when it lands.
