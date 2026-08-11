# Plan 006: Make the macos-design templates carry everything the rubric and stages mandate

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-macos-design`
> On any in-scope change since `64df333`, compare "Current state" excerpts
> against the live files first; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW–MED (template edits are additive; two router edits touch eval-adjacent lines — rerun the suite)
- **Depends on**: `advisor-plans/004-macos-eval-fixtures-and-coverage.md` (rerun meaningfulness). Can be edited in parallel, merged after.
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The design skill's review template is the artifact reviews are actually filled into — and it silently drops the four highest-severity hard failures the rubric defines (including "a path by which a person can lose work", which the rubric says "outranks every visual finding"), the Preserve section, the score caps, and the evidence/verification columns of the finding format. The brief template has no slot for the archetype that Stage 1 gates on. A review or brief produced *through the mandated templates* therefore passes its stage while violating the reference that stage cites. The w6 dogfood only caught real defects because the reviewer worked from the rubric, not the template.

## Current state

All paths relative to `skills/tailrocks-macos-design/`. Verified at `64df333`.

**(a) Hard-failure table: rubric 18 rows, template 14.**

`references/rubric.md:143-166` lists 18 hard failures. Four are absent from the template's checklist at `templates/DesignReview.md:56-71`:

```
- **A path by which a person can lose work.** This outranks every visual finding
  in the list.                                            (rubric.md:157-158)
- **Window state not restored across quit and relaunch** — position, size,
  sidebar width, open documents.                          (rubric.md:159-160)
- A command reachable only through a command palette, with no menu equivalent.  (:161)
- A function reachable only by hover, or only by drag and drop.                 (:162)
```

`SKILL.md:129-135` carries a third, differently-abbreviated subset ("among them" — 10 of 18, also dropping lose-work and window-restore).

**(b) Preserve and caps missing from the template.**

`references/rubric.md:191-204` — "Every review includes a **Preserve** section" (five named bullet classes; without it "review drives churn"). `references/rubric.md:168-189` — the score-caps table (7 conditions; "Hard failures reject outright. Caps are the graded companion"). `templates/DesignReview.md` (88 lines) contains neither. The template's `## Learned` section (lines 84-88) exists — keep it.

**(c) Findings table drops the finding format.**

`references/rubric.md:36-51` mandates Evidence class / Location / Impact / Recommendation / Verification, with `:50-51` calling Verification "the one that is always omitted and the one that makes the finding actionable". `templates/DesignReview.md:75-77`:

```
| # | Severity rank | Finding | Correction |
```

**(d) Brief template lacks the archetype block Stage 1 gates on.**

`SKILL.md:50-61` — Stage 1 "Complete when: dominant archetype and the failure it attracts … are all written down and approved." `references/archetypes.md:189-197` specifies the exact block, "In the experience brief":

```
Dominant archetype:
Secondary archetypes, and which window or mode each owns:
Primary object of this window:
Why this archetype and not the adjacent one:
The failure this archetype attracts, and how the design avoids it:
```

`templates/ExperienceBrief.md` (98 lines: User / Primary job / Primary objects / Information hierarchy / Actions / Window model / Input / Recovery / Density / Window sizes …) has no archetype field; `references/experience-brief.md`'s Fields list also omits it.

**(e) Brief omits three more things the prose says "belong in the brief".**

`references/native-behavior.md:41-43` (continuity/restoration "belongs in the brief"), `:55-66` (latency targets table, "Design targets that belong in the brief"), `:238-248` ("the brief should say which [system integrations] are in scope"). None has a template slot. Window-state restore is hard failure `rubric.md:159-160`; latency failure "makes every other score irrelevant" per `rubric.md:133-137`.

**(f) Rendered-evidence matrix misses five states.**

`templates/DesignReview.md:9-28` — 15 rows ending "A missing row is a finding, not an omission". Missing vs `SKILL.md:113-116` (mandated fixtures) and `rubric.md:129-130,155`: Offline, Permission denied, Destructive-pending, Missing values, Reduce Motion.

**(g) Rubric scoring anchors absent.**

`references/rubric.md:66-90` — weights sum to 100, accept ≥90 total and ≥60% per category; `:92-141` — categories are open questions with no full/partial/failing band descriptors; latency and continuity float outside every weighted category (`:133-141`). Two auditors can differ 10–20 points across the accept line.

**(h) Small wording fixes (downgraded findings, one line each):**

- `rubric.md:168-172` — add one sentence making explicit: a hard failure voids acceptance; the capped score is still computed and reported for planning. (The mechanism is already implied; make it unambiguous.)
- `SKILL.md:186-189` + `references/design-principles.md:187-190` ("progressive disclosure … wrong on a Mac") vs `rubric.md:96` (scores disclosure as a positive) vs `native-behavior.md:227` (inspectors need disclosure): reconcile with one line in each place — fewer nested levels for *primary* content; disclosure reserved for advanced/rare controls — and reword `rubric.md:96` to "Is progressive disclosure limited to advanced or rare controls (nothing primary hidden)?"
- `references/macos-craft.md:54-60` — rename "`NSFont` dynamic variants" to "system control fonts"; state they track control metrics, not a user text-size setting; point semantic roles at `preferredFont(forTextStyle:)` / SwiftUI text styles.
- `SKILL.md:106-112` — the alternative-seed list contains near-duplicate pairs (compact professional / high-density; spacious editorial / content-immersive) adjacent to the "same component map = one option" rule; state the structural difference each seed must carry, and append "two seeds that yield the same component map count as one" to the stage's completion test.
- `templates/NativeComponentMap.md:12-14` — pre-fill the NATIVE rows' "Allowed customization" guidance ("semantic configuration only — no internal appearance values") so the blank column stops inviting what `references/native-component-map.md:16-27` forbids.
- `SKILL.md` Stage 3/Stage 5 — one sentence each: previews are built by an implementing agent and captured by `tailrocks-macos-visual-qa`; Stage 5 is deferred-not-waived until captures exist.
- `references/exemplars.md:3-6` claims "sources are listed inline" while quotes at `:58-59`, `:86-87`, `:312-319`, `:331-336` carry none and the whole skill contains zero URLs (`grep -c http` = 0 per file). Either add publication/URL per quote or mark each `unverified` and soften the blanket claim. (Finder's double listing — model at `:17,:47`, counter-example at `:320-322` — is plan 008's ownership call; leave it.)

**House constraints (AGENTS.md, binding):** SKILL.md is at 228 lines, already past the ~200 soft budget — router edits here must be net-negative or neutral in line count (the hard-failure list replacement in step 4 is the opportunity); load-bearing lines get named bullets; never weaken eval `expected_output`; re-run the skill's eval suite after router edits.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Router length | `wc -l skills/tailrocks-macos-design/SKILL.md` | ≤ 228 (must not grow) |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-macos-design --case <id> --runs 2` | exit 0 |

## Scope

**In scope**:
- `skills/tailrocks-macos-design/templates/{DesignReview,ExperienceBrief,NativeComponentMap}.md`
- `skills/tailrocks-macos-design/references/{rubric,experience-brief,macos-craft,design-principles,exemplars}.md`
- `skills/tailrocks-macos-design/SKILL.md`
- `skills/tailrocks-macos-design/evals/evals.json` (extend case 2's `expected_output` to require Preserve + caps — append only)

**Out of scope**:
- The glass-rule restatements in this skill (`SKILL.md:130-133`, `rubric.md:116`, `archetypes.md:148-150`) and the Finder/exemplar ownership conflict — plan 008 owns every cross-skill boundary; this plan must not touch lines whose fix is a *pointer to another skill*.
- `references/{native-component-map,native-behavior,archetypes,motion,reference-corpus}.md` except where a step names them.
- All other skills; `scripts/`; catalogs.

## Git workflow

- Branch: `advisor/006-design-template-alignment`
- `git commit -s`, Conventional Commits (`fix(macos-design): …`); PR via `gh pr create`; never push main.

## Steps

### Step 1: Complete the DesignReview template

In `templates/DesignReview.md`:
1. Add the four missing hard-failure rows (step (a) wording, in rubric order — lose-work row first among the four).
2. After the hard-failures table, add `## Score caps applied` — a 3-column table (Condition / Triggered? / Resulting cap) pre-filled with the seven conditions from `rubric.md:176-184`.
3. Add `## Preserve` with the five bullet classes from `rubric.md:195-199` as prompts.
4. Rework the findings table header to `| # | Severity rank | Finding | Evidence class | Location | Correction | Verification |` (evidence classes per `rubric.md:14-35`).
5. Add the five missing evidence-matrix rows: Offline, Permission denied, Destructive operation pending, Missing values, Reduce Motion.

**Verify**: `grep -c "lose work\|Preserve\|Score caps\|Reduce Motion" skills/tailrocks-macos-design/templates/DesignReview.md` → ≥4 distinct matches; template row count for hard failures = 18.

### Step 2: Complete the ExperienceBrief template and its field list

1. In `templates/ExperienceBrief.md`, insert `## Archetype` (directly after `## Primary job`) carrying the five lines from `archetypes.md:191-197` verbatim.
2. Add `## Continuity` (restore per window: position, size, sidebar width, selection, open documents — per `native-behavior.md:41-43` and the state list at `rubric.md:139-141`), `## Latency targets` (copy the target rows from `native-behavior.md:55-66`), and a `Services / system integrations in scope:` line under `## Input`.
3. Mirror the same additions in `references/experience-brief.md`'s Fields list so prose and template agree.

**Verify**: `grep -n "Dominant archetype" skills/tailrocks-macos-design/templates/ExperienceBrief.md` → 1 match; `grep -n "Latency" skills/tailrocks-macos-design/templates/ExperienceBrief.md` → ≥1.

### Step 3: Add scoring anchors to the rubric

For each of the eight categories in `rubric.md:92-141`: add a three-band anchor line (full / partial / failing) with one concrete example per band, ≤3 lines per category. Assign latency to "Interaction and motion" and continuity to "macOS nativeness" explicitly (replacing the floating note at `:133-141` with membership sentences). Add the one-sentence void-vs-cap clarification at `:168-172`.

**Verify**: `grep -c "Full:" skills/tailrocks-macos-design/references/rubric.md` → 8 (or the chosen band label, one per category).

### Step 4: Fix the router's hard-failure list without growing the router

Replace `SKILL.md:129-135`'s ten-item "among them" list with: the two or three failures worth router weight — lose-work first, window-state restore, rendered-evidence — plus one pointer sentence: "The authoritative enumeration is the 18-row table in `references/rubric.md`; the review template carries all 18." Net line change must be ≤0.

**Verify**: `wc -l skills/tailrocks-macos-design/SKILL.md` ≤ 228; `grep -n "lose work" skills/tailrocks-macos-design/SKILL.md` → 1 match.

### Step 5: Apply the (h) wording fixes

Each is a 1-3 line edit at the cited location; make them all, keeping diffs minimal.

**Verify**: `grep -n "dynamic variants" skills/tailrocks-macos-design/references/macos-craft.md` → no match; `grep -rn "http" skills/tailrocks-macos-design/references/exemplars.md` → ≥1 match **or** `grep -c "unverified" …/exemplars.md` ≥ 4.

### Step 6: Extend eval case 2 and rerun

Append to case 2's `expected_output` in `evals/evals.json`: "…and the review includes a Preserve section and the score-caps table." Then rerun the full macos-design suite (all cases post-004), 2 runs each.

**Verify**: all cases pass twice; failures traced to wording (not to a weakened expectation) are fixed in prose and rerun.

## Test plan

- Eval rerun as in step 6 — the suite is the only automated check for this skill.
- Manual check: fill the updated DesignReview template against the w6 dogfood artifacts (`plans/macos-skills-hardening/w6-dogfood/DesignReview.md`) — every hard failure recorded there must have a row in the new template. This is a read-only comparison; do not edit w6 files.

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] DesignReview template: 18 hard-failure rows, caps table, Preserve section, 7-column findings table, 20-row evidence matrix
- [ ] ExperienceBrief template: Archetype, Continuity, Latency targets sections present; `experience-brief.md` Fields list matches
- [ ] `rubric.md`: 8 categories × 3 anchored bands; latency/continuity owned by named categories
- [ ] `wc -l SKILL.md` ≤ 228
- [ ] Full eval suite green ×2, recorded in PR body
- [ ] No file outside scope modified (`git status`)
- [ ] `advisor-plans/README.md` row updated

## STOP conditions

- Excerpt mismatch vs live files (drift).
- Any step needs to grow `SKILL.md` and nothing in it can be replaced without weakening an eval-load-bearing line.
- The step-6 rerun fails the same case twice after prose fixes.
- You need to edit `rubric.md:116` (glass category) or any cross-skill pointer — that's plan 008; leave those lines byte-identical.

## Maintenance notes

- Plan 008 will convert this skill's glass restatements to pointers at `tailrocks-liquid-glass`; expect a follow-up diff in `rubric.md:116` and `SKILL.md:130-133`.
- Plan 014 (dogfood intake) adds a capture-dimension rubric line; coordinate if both run concurrently — same file (`rubric.md`).
- Reviewer scrutiny: the template additions must quote rubric wording, not paraphrase it — a third variant of a list is how this drift started.
