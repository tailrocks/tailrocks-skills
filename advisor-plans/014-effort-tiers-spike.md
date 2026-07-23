# Plan 014: Design spike — graduated effort tiers for tailrocks-plan and tailrocks-research

> **Executor instructions**: DESIGN SPIKE — deliverable is a design doc
> with a concrete SKILL.md diff proposal, NOT applied skill edits. Where
> a decision belongs to the maintainer, record it as an option pair with
> a recommendation. When done, update this plan's status row in
> `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-plan/SKILL.md skills/tailrocks-research/SKILL.md`
> Re-read both if changed (001/002/009 touched plan's); the proposal
> diffs against live text.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (a too-light tier undercuts the "enormously detailed"
  quality bar — the design must gate fan-out, never plan quality)
- **Depends on**: none (proposal targets post-001/002/009 text; run after
  them)
- **Category**: direction
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

tailrocks-plan is the heaviest skill (one writer subagent per manifest
item + fresh-context cold review per plan + gap-research fan-out) and
exposes only a binary `--deep`. A 2-plan READY item pays near-epic
orchestration cost. AGENTS.md:32 makes token usage a design criterion.
The benchmark improve skill ships quick/standard/deep with a per-tier
coverage table — the pattern to adapt, without ever compromising the
per-plan quality bar (self-contained, cold-reviewed, machine-checkable).

## Current state

Verified at `f2c4be5`:

- `skills/tailrocks-plan/SKILL.md:5`
  `argument-hint: "<roadmap-slug> [additional context] [--deep]"`; `:61`
  `--deep` = "add completeness-critic rounds" (009 aligns wording to
  research's reslice semantics).
- `skills/tailrocks-research/SKILL.md:5`
  `[--slug <topic-name>] [--for <roadmap-slug>] [--deep]`; playbook
  `--deep` (research-playbook.md:105-111): completeness critic until
  "nothing load-bearing", cap "two rounds add nothing".
- Cost drivers in plan's steps: step 2 research fan-out (investigators
  per topic), step 5 one subagent per manifest item, step 6 cold
  reviewers per plan + re-review after structural fixes.
- Benchmark tier table (improve skill): coverage / subagent count /
  breadth / findings volume per tier — the *shape* to adapt; categories
  differ here (research clusters, review passes — not audit categories).
- Non-negotiables (from the skill's own gates, must survive every tier):
  ledger completeness, spec coverage, per-plan template quality bar,
  cold review of every plan, traceability gate.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |

## Scope

**In scope** (create only):
- `docs/effort-tiers-design.md`

**Out of scope**:
- Applying any SKILL.md edit (the doc contains the proposed diff; a
  follow-up plan applies it after maintainer sign-off).

## Git workflow

- Branch: `advisor/014-effort-tiers-spike`.
- Conventional Commits, DCO (`git commit -s`). Main PR-only; no push/PR
  unless instructed.

## Steps

### Step 1: Define the tier semantics

Design doc sections:

- **Tier table** for tailrocks-plan — proposal to critique-and-refine:
  `light` (≤ 3 manifest items expected: research only for missing
  verification commands; writer subagents still one-per-plan; cold
  review single-pass; no completeness critic), `standard` (default:
  current behavior), `deep` (current `--deep`: critic rounds until
  nothing load-bearing). Explicit invariant line: "All tiers: every
  ledger gate, the full plan template, and cold review per plan — tiers
  scale investigation breadth and critic rounds, never plan quality or
  coverage gates."
- **Auto-sizing rule**: tier defaults from ledger size after step 1
  (e.g. ≤ N spec-bearing IDs → suggest light; user flag always wins) —
  or no auto-sizing (recommend: suggest, never auto-apply; the skill
  reports "this item sizes as light — proceeding standard unless
  --light").
- **Research tiers**: whether `--light` means "reuse linked topics only,
  research nothing new except verification commands" — and what happens
  when a ledger unknown then has no evidence (answer: named assumption
  `A#` or STOP; never silent).
- **Flag surface**: `--light`/`--deep` (absence = standard) for both
  skills; argument-hint updates.
- **Proposed diffs**: fenced current→proposed text for both SKILL.md
  files (argument-hint line, step 2, step 6, Re-runs note) — exact text
  a follow-up plan can apply verbatim.
- **Open questions** for the maintainer (e.g. does light skip screen
  contracts for screenless items? recommendation: that's not a tier
  question — screenless items already omit them).

**Verify**: `grep -c "^## " docs/effort-tiers-design.md` → ≥ 6; the
invariant line present verbatim
(`grep -n "never plan quality" docs/effort-tiers-design.md` → 1 hit).

### Step 2: Dry-run the tiers on paper

Apply the tier table to two scenarios: the `goal-live-status` example
item (plan 011, 3 plans) and a hypothetical 12-plan epic. Record the
orchestration delta (subagent invocations saved, review passes) per
tier in a table with honest estimates.

**Verify**: both scenario tables present with counts.

### Step 3: Validate repo untouched

**Verify**: `bun run scripts/validate-skills.ts` → exit 0;
`git status` shows only `docs/effort-tiers-design.md` +
`advisor-plans/README.md`.

## Test plan

Paper dry-runs (step 2) are the spike's evidence. No runtime.

## Done criteria

- [ ] Design doc: tier table, invariant line, auto-sizing rule
      (suggest-only), research-tier semantics, verbatim proposed diffs,
      open questions, two dry-run tables
- [ ] No skills/** modified
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The tier design cannot avoid weakening a ledger/spec/review gate for
  any realistic item — report that finding; the answer may be "no tiers,
  close the finding as not-worth-doing".

## Maintenance notes

- Follow-up (apply the diffs) should also update AGENTS.md/README skill
  descriptions and the argument-hints, and add a light/deep eval case
  each.
- Interaction: plan 013's runner could A/B tiers on the example item to
  measure quality delta empirically — note in the doc.
