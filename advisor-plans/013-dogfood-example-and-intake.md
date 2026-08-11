# Plan 013: Ship the w6 dogfood as the family's worked example and land its orphaned learnings

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- plans/macos-skills-hardening/w6-dogfood examples skills/tailrocks-macos-design/references/rubric.md skills/tailrocks-liquid-glass/references/anti-patterns.md skills/tailrocks-macos-design/references/reference-corpus.md skills/tailrocks-macos-visual-qa/templates/capture.sh`
> Plans 005-007 touch two of these — expected. Meaning-level mismatch on
> this plan's specific targets = STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW–MED (one new anti-pattern entry and one rubric line touch eval-adjacent reference files; reruns required)
- **Depends on**: 006 (rubric edits land there first — avoid same-file collisions), 007 (capture.sh manifest hook)
- **Category**: direction
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The family's only completed design-to-verified-pixels loop — a filled experience brief, component map, custom-component contract, implementation notes, 9 rendered captures, and an independent design review that **rejected the screen at 57/100 with a per-finding disposition** — sits invisible inside a hardening plan directory, while installers get blank templates. A filled, rejected review is the strongest calibration artifact the repo owns. Worse, the run's own "Learned" section names three intake items the design skill's rule ("Every repeated rejection becomes either a documented anti-pattern or a rubric line — otherwise the same failure returns next feature", `skills/tailrocks-macos-design/SKILL.md:218-221`) requires landing — and none of the three landed; only the harness fix did.

## Current state

Verified at `64df333`.

**The artifact set** — `plans/macos-skills-hardening/w6-dogfood/`: `ExperienceBrief.md` (3.7K), `NativeComponentMap.md` (3.4K), `LiveFeedCluster-contract.md` (3.9K), `Alternatives.md` (1.5K), `Implementation.md` (2.9K), `StateMatrix.md` (2.3K, with recorded skips), `DesignReview.md` (15.7K, scored 57/100, two hard failures, findings in correction order), `ReviewDisposition.md` (2.8K, per-finding class + disposition), `captures/01…09*.png` (~3.7 MB total). `examples/` currently holds only `plan-package/` (the delivery family's example); the macOS family — marketed in `README.md:45-63` as a "design-to-verified-pixels loop" — ships no worked loop.

**The three orphaned learnings** — `plans/macos-skills-hardening/w6-dogfood/DesignReview.md:130-147` verbatim:

1. Anti-pattern (capture hygiene): "capturing evidence states with the window inactive — gray chrome silently invalidates appearance, selection, and enabled-state claims … every non-inactive capture must show colored traffic lights."
2. Anti-pattern (material): "GlassEffectContainer spacing tuned into the mid-merge band, leaving surfaces permanently half-fused at rest." (`skills/tailrocks-liquid-glass/references/anti-patterns.md` still has exactly ten entries; `grep -n "spacing" …/anti-patterns.md` → no match. The dogfood itself shipped this bug — `ReviewDisposition.md`: "container `spacing: 20` exceeds the inner 10pt spacing … the reviewer saw the seam in pixels".)
3. Rubric line: "a named capture must match its declared window size exactly (pixel dimensions = 2× declared logical size), and the reviewer must verify dimensions, not filenames." (`grep -n "dimension" skills/tailrocks-macos-design/references/rubric.md` → no such rule.)
4. Decision record: "on macOS 26, `.inspector` at narrow widths presents as a system overlay over content rather than collapsing; briefs must not promise 'auto-collapse', and minimum-usability claims must be validated with the inspector closed." (No design reference records it; the *intake path itself* is missing — `skills/tailrocks-macos-design/references/reference-corpus.md:136` "## Feeding the loop" covers *approved* features only, not rejected runs.)

**Router-budget constraint**: everything here lands in references, templates, and `examples/` — zero router growth. The design router (228 lines) and liquid-glass router must not grow.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Evals | `bun scripts/run-evals.ts --skill tailrocks-macos-design --case <id> --runs 2` (and liquid-glass) | exit 0 |
| Size check | `du -sh examples/macos-screen/` | ≤ ~4 MB |

## Scope

**In scope**:
- `examples/macos-screen/**` (new — copies from w6-dogfood; originals stay untouched as hardening evidence)
- `skills/tailrocks-liquid-glass/references/anti-patterns.md` (entry 11)
- `skills/tailrocks-macos-design/references/rubric.md` (capture-dimension line), `references/reference-corpus.md` (rejected-run intake), one decision-record file per that intake's convention
- `skills/tailrocks-macos-visual-qa/templates/capture.sh` (sidecar manifest emission — small append to plan 007's version)
- `README.md` (one line linking the example from the family section)

**Out of scope**:
- Deleting or editing anything under `plans/macos-skills-hardening/` — it is the hardening record; the example is a copy.
- Routers (`SKILL.md` files) — links to the example go in references only.
- The scratch app's source (not in the repo; the example is artifacts-only and says so).

## Git workflow

- Branch: `advisor/013-dogfood-example`; `git commit -s`; `docs(examples): ship the macOS dogfood loop` / `feat(liquid-glass): anti-pattern 11 — mid-merge container spacing`; PR via `gh pr create`.

## Steps

### Step 1: Publish the example

Create `examples/macos-screen/` containing: the eight markdown artifacts and the nine captures copied from `plans/macos-skills-hardening/w6-dogfood/`, plus a new `README.md` that states, in order: (1) **this screen was REJECTED at 57/100 — it is a worked example of the loop catching defects, not a model to imitate**; (2) the reading order (brief → map → contract → alternatives → implementation → state matrix → review → disposition); (3) that the scratch app's source is not included — the loop's deliverable is the evidence chain; (4) which skill produced each artifact. Do not edit the copied artifacts beyond nothing at all — byte-identical copies (provenance matters; the README carries all framing).

**Verify**: `diff -r` between each copied file and its w6 original → identical; `du -sh examples/macos-screen` ≤ ~4 MB; `mise run validate` exit 0.

### Step 2: Link it where reviewers look

Add one link line to `skills/tailrocks-macos-design/references/rubric.md` (near the scoring threshold: "A filled, rejected review with captures: `examples/macos-screen/`") and one to `skills/tailrocks-macos-visual-qa/references/state-matrix.md` (near the skip rule: the example's StateMatrix shows recorded skips done right). One line in `README.md`'s family section. No router edits.

**Verify**: `grep -rn "examples/macos-screen" skills/ README.md` → 3 matches, none in a SKILL.md.

### Step 3: Land anti-pattern 11 (mid-merge spacing)

Append entry 11 to `skills/tailrocks-liquid-glass/references/anti-patterns.md`, following the existing entries' structure (rule + mechanism): container `spacing` tuned into the mid-merge band leaves neighbors permanently half-fused at rest with a metaball seam; mechanism — merging is a proximity animation, a rest-state overlap is a misconfiguration, correct forms are `spacing` ≤ interior spacing (distinct surfaces) or an intentional single merged capsule; evidence pointer to `examples/macos-screen/captures/` and the disposition row. Update any "all ten entries" phrasing the router still carries after plan 005 ("every entry" wording landed there — if it says "ten", change the number).

**Verify**: `grep -c "^## " skills/tailrocks-liquid-glass/references/anti-patterns.md` (or the file's entry-heading pattern) → 11; liquid-glass eval case 1 rerun green ×2 (its expected output references anti-pattern checking).

### Step 4: Land the capture-dimension rubric line and the capture-hygiene rule

1. `rubric.md`: add the evidence-integrity line where the rendered-evidence requirements live: a capture must match its declared window size (pixels = scale × logical size, chrome height noted) and the reviewer verifies dimensions, not filenames. Coordinate with plan 006's step 3 layout (that plan restructures rubric anchors — land this after it).
2. The inactive-capture rule: plan 007 already re-activates in `capture.sh` and plan 006 added the Reduce-Motion/evidence rows — add the *review-side* check to the rubric's evidence line: "every non-inactive capture shows colored traffic lights."
3. `capture.sh`: append sidecar-manifest emission — after a successful capture, write `<OUT>.json` with window id, owner, window title, content vs frame size (from the helper's bounds), pixel dimensions (from `sips`), scale, and key/inactive status — so "verify dimensions, not filenames" is mechanical. Keep POSIX-sh; build on plan 007's version of the script.

**Verify**: `grep -n "dimensions, not filenames" skills/tailrocks-macos-design/references/rubric.md` → 1; `sh -n` on capture.sh → exit 0; run capture.sh against any app (Mac, GUI): `<OUT>.json` exists with the listed keys.

### Step 5: Open the rejected-run intake path and land the decision record

1. `skills/tailrocks-macos-design/references/reference-corpus.md` "Feeding the loop" section: add the rejected-run intake — every rejection's "Learned" block is dispositioned within the same run into: anti-pattern (owning skill's reference) / rubric line / decision record / harness fix, each landed or explicitly rejected with a reason; a Learned item with no disposition is an incomplete review.
2. Create the decision record for the inspector-overlay behavior per whatever convention `reference-corpus.md` establishes for decision records (read the file; if it has none, a short `references/decisions.md` in macos-design with this as the first dated entry): macOS 26 `.inspector` presents as an overlay at narrow widths; briefs must not promise auto-collapse; minimum-width claims validated with the inspector closed.

**Verify**: `grep -n "rejected" skills/tailrocks-macos-design/references/reference-corpus.md` → intake covers rejected runs; the decision record exists and is linked from a reference the validator accepts (`mise run validate` exit 0 — note: validator requires references/*.md linked from SKILL.md; if `decisions.md` is new, add its link to the router's existing reference list *replacing nothing* only if ≤228 lines holds, else link it from `reference-corpus.md` and keep it out of `references/` root — place it as `references/decision-log.md` linked from the router only if budget allows, otherwise inline the record into `reference-corpus.md` itself, which is already linked).

### Step 6: Rerun affected evals

macos-design + liquid-glass suites ×2.

## Test plan

- Byte-identical copy check (step 1), eval reruns (step 6), validator link integrity throughout.
- Manual: open `examples/macos-screen/README.md` cold and follow the reading order — every named file exists.

## Done criteria

- [ ] `examples/macos-screen/` complete, byte-identical copies + framing README labeled REJECTED
- [ ] Anti-pattern 11 exists with mechanism; rubric carries the dimension line; intake covers rejected runs; inspector decision recorded
- [ ] capture.sh emits the sidecar manifest
- [ ] 3 reference links to the example; zero router growth (`wc -l` on both routers unchanged)
- [ ] `mise run validate` exit 0; affected eval suites green ×2
- [ ] Index row updated

## STOP conditions

- Plans 006/007 not landed and their target lines conflict — sequence, don't merge-fight.
- The validator rejects the example layout (e.g. treats `examples/**` markdown as a skill) — report; do not restructure `examples/` conventions unilaterally.
- Adding the decision record forces router growth past budget in macos-design — use the reference-corpus inline placement and note it.

## Maintenance notes

- Every future dogfood run should terminate in the step-5 intake; the disposition table in `ReviewDisposition.md` is the shape to copy.
- The example will go stale as the skills evolve (its review used the pre-004 rubric). That is fine and should be *stated* in its README ("produced with the skills at `64df333`") — add that line during step 1.
- Reviewer scrutiny: anti-pattern 11's wording must not contradict the corrected spacing example from plan 005 (equal-spacing form) — read both in one sitting.
