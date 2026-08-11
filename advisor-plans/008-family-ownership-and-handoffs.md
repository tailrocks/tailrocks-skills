# Plan 008: One owner per rule, one name per artifact, working handoffs across the six-skill family

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills README.md AGENTS.md`
> Plans 005-007 are *expected* to have landed first — their changes are not
> drift. Compare excerpts below only for the specific lines this plan edits;
> if one was already restructured by an earlier plan, adapt the edit to the
> new location and note it; if a line's meaning changed, STOP.

## Status

- **Priority**: P1
- **Effort**: M–L
- **Risk**: MED — deletes router lines in two skills and reroutes terminology; several are eval-load-bearing; full family eval rerun required
- **Depends on**: 004 (eval net), 005, 006, 007 (so this plan's deletions don't collide with their corrections)
- **Category**: tech-debt
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The family's own governing rule — "Exactly one skill owns each responsibility. Never run two skills that both encode aesthetic taste" (`AGENTS.md:93-95`, `README.md:63-67`) — is violated by its members: the exemplar-app taste list lives in two routers, glass rules are restated in the design skill in words that already drift ("three conditions" that exist nowhere), the availability-guard rule is stated three ways with the strictest clause in only one, and "extract" names two different modes in two skills that both produce tokens. The pipeline diagram runs backwards (its entry point consumes artifacts produced two steps later), the family's central artifact has no named consumer, "acceptance" names four different things, and a required package artifact ("symbol map") does not exist. Every future Apple release currently requires synchronized edits in 2-3 files with no mechanism noticing a miss.

## Current state

Verified at `64df333`. Sibling cross-references across all six routers total four: `macos-design/SKILL.md:23-24`, `swift-best-practices/SKILL.md:13-15`, `macos-visual-qa/SKILL.md:17-18`, `sketch-handoff/SKILL.md:131`. Nothing names `tailrocks-sketch-handoff`; `swift-project-setup`'s router names no sibling at all.

**(a) Pipeline direction.** `README.md:52-59` diagram: `sketch-handoff ──► macos-design ──► liquid-glass ──► swift-best-practices` with `swift-project-setup` downstream of best-practices. But `sketch-handoff/SKILL.md:107` lists as package input "The experience brief and the native component map **from the design skill**" — the reverse arrow; and `swift-project-setup/SKILL.md:15` + `swift-best-practices/SKILL.md:13-14` make setup the *precondition* of code, not its consumer. `AGENTS.md:86` restates the wrong order ("from a design file through implementation").

**(b) Exemplar-app list, two owners.** `macos-design/SKILL.md:203-213` + its description own the exemplar corpus (`references/exemplars.md`, 398 lines). `liquid-glass/SKILL.md:144-148` + its description carry an independent list ("Music, Photos, and Podcasts … documented legibility failures … Safari, Freeform, Maps, Calendar, and Finder are the models"); `liquid-glass/references/apple-patterns.md:270` itself concedes ownership ("is `tailrocks-macos-design`'s exemplar reference"). Related: Finder is a model in `exemplars.md:17,:47` and a counter-example in `exemplars.md:320-322,:392-393` — the corpus supports either verdict on the same app.

**(c) Glass rules restated in the design skill.** `macos-design/SKILL.md:23` correctly delegates ("Material placement and glass APIs belong to `tailrocks-liquid-glass`"), then `:130-133` makes "glass content cards, nested glass" hard failures in its own words; `:200-201` restates the Reduce-Motion glass-morph rule; `references/rubric.md:116` restates six glass rules; `references/archetypes.md:148-150` requires "Clear glass **only** where its three conditions hold" — a framing that appears nowhere in liquid-glass (`layer-model.md:155-163` states one use plus a dimming obligation); `references/exemplars.md:245-257` teaches the `identity` variant that `liquid-glass/SKILL.md:150-155` owns. Meanwhile the *material owner's router* never states the nested/overlapping-glass rule (it exists only at `liquid-glass/references/verification.md:69`).

**(d) Availability-guard rule, three statements.** `liquid-glass/SKILL.md:132-133`; `swift-best-practices/SKILL.md:29-37` (only statement with "**mark every fallback with its removal condition**"); `swift-project-setup/SKILL.md:88-90`. The concentric-corner platform fact is stated in both `swift-best-practices/SKILL.md:33-36` and `liquid-glass/SKILL.md:105-109,123-126`.

**(e) `extract` collision.** `macos-design/SKILL.md:33`: "`extract`: turn an approved screen into reusable components, tokens, and rules" — no procedure, template, gate, or eval anywhere in the skill. `sketch-handoff/SKILL.md:36,83-84`: "`extract`: pull tokens out of the design file into committed code". Both produce tokens; no precedence stated; README's one-owner list has no tokens row.

**(f) "Acceptance" names four things; "symbol map" names nothing.** `sketch-handoff/SKILL.md:114` "The state matrix and the acceptance criteria"; `macos-design` "acceptance rubric"; `liquid-glass:163,173` "glass acceptance gate"; `macos-visual-qa:18` "the acceptance mechanism". `sketch-handoff/SKILL.md:110` requires "The design map **and the symbol map**" — exactly one artifact exists (`DESIGN_MAP.md`, whose own frontmatter calls it "the symbol-to-SwiftUI design map"). `sketch-handoff/SKILL.md:131` says compare against "approved exports" where `macos-visual-qa/SKILL.md:36` defines the mode against an "approved baseline".

**(g) State-list triplication.** Required render states exist in three places with drift: `macos-visual-qa/references/state-matrix.md:68-78` (7 groups; no Show Borders, no color profile), `liquid-glass/references/verification.md:14-40` (24 axes incl. 8b Show Borders and 23 sRGB/P3; no content-fixture states), `sketch-handoff/references/handoff-package.md:23,28` (requires both `StateMatrix.md` and `Acceptance/RequiredStates.md` — two artifacts, one list, no stated distinction; and the pre-implementation "state matrix" has no producer since visual-qa defines the term as *rendered captures*).

**(h) One-owner tables, three versions.** `README.md:63-65` (3 rows: material→liquid-glass, visual direction+acceptance→macos-design, verification→macos-visual-qa); `swift-project-setup/SKILL.md:108-109` (gate: "framework correctness, material policy, and visual direction … every external skill is pinned" — no verification row, and "external skill" misreads siblings); `swift-project-setup/references/agent-integration.md:53-59` (5 rows, owners named by role: "the Liquid Glass skill"). `agent-integration.md:97-100` "this collection never links to or vendors third-party skills" vs `:22-27` "Vendor the export into the repository" — "repository" means two different repos in the two sentences.

**(i) `/tmp` refusal duplicated.** `macos-visual-qa/SKILL.md:61-62` and `swift-project-setup/SKILL.md:158-161` state the same rule; neither names the other; only the setup side has an eval.

**(j) Vocabulary.** Inspection mode: `audit` (liquid-glass, setup, sketch-handoff) vs `review` (design) vs `verify` (visual-qa). `swift-best-practices` has no Modes section while README describes it with mode-like verbs. `CONTENT`/`FUNCTIONAL` is uppercase in the liquid-glass router body and `verification.md:53` but lowercase in its description, `agents/openai.yaml`, `evals.json:7`, `AGENTS.md:104`, `README.md:26` (the NATIVE triple is uppercase everywhere). Secrets boilerplate: `swift-best-practices:21-23` and `swift-project-setup:27-28` carry "Cite secret locations and types without copying values"; the four other routers — including the two that actually handle credentials-bearing artifacts (visual-qa screenshots, sketch-handoff `.sketch` parsing) — do not. `swift-project-setup:27` says "registry" where the family says "documentation".

**House constraints:** router budget (~200 lines; design router at 228 must not grow — deletions here help); a deleted router line whose eval depends on it must be replaced by a pointer that still satisfies the eval, or the eval extended (never weakened); full family eval rerun after this plan.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Family rerun | `for s in tailrocks-macos-design tailrocks-liquid-glass tailrocks-swift-best-practices tailrocks-swift-project-setup tailrocks-macos-visual-qa tailrocks-sketch-handoff; do bun scripts/run-evals.ts --skill $s --case <each> --runs 2; done` | all exit 0 |
| Cross-ref count | `grep -rn "tailrocks-sketch-handoff" skills/*/SKILL.md` | ≥1 match outside its own file |

## Scope

**In scope**: the six `skills/tailrocks-*/SKILL.md` routers, their `references/` files named above, their `evals/evals.json` (extensions only), `README.md` (family section), `AGENTS.md` (family section + `:86`).

**Out of scope**: `scripts/`, CI, manifests, INSTALL.md (plan 012); template *content* fixes (plans 006/007/009-011); frontmatter `description` fields **except** the two edits named in steps 2 and 7.

## Git workflow

- Branch: `advisor/008-family-ownership`; `git commit -s`; Conventional Commits (`refactor(skills): single-owner rules and handoff integrity`); PR via `gh pr create`. One commit per step is fine.

## Steps

### Step 1: Fix the pipeline diagram and prose

Redraw `README.md:52-59` in the order the routers actually define: `macos-design → sketch-handoff → {liquid-glass + swift-best-practices} → macos-visual-qa`, with `swift-project-setup` drawn as the precondition lane feeding implementation (not a consumer of best-practices). Fix `AGENTS.md:86` prose to match ("from an approved design through a design-file handoff to implementation and rendered, audited evidence").

**Verify**: the diagram's first node is `macos-design`; `grep -n "from a design file through" AGENTS.md` → no match.

### Step 2: Single-owner the exemplar list

In `liquid-glass/SKILL.md:144-148`: delete the app-verdict sentences; keep the two process rules (adopt-then-redesign; identity+interactive — as reworded by plan 005) and add one pointer: "App-level model/anti-model judgement is owned by `tailrocks-macos-design`'s exemplar corpus; consult it before copying any Apple app." Remove the "which Apple apps to model" clause from the liquid-glass frontmatter `description` (this is one of the two allowed description edits). In `macos-design/references/exemplars.md`: resolve Finder's double listing — keep it in the model list, convert `:320-322` to a scoped defect note ("one defect to avoid in an otherwise model app"), and align `:392-393`'s check instruction with that framing. Keep `apple-patterns.md`'s *mechanism* prose (it explains APIs, not taste).

**Verify**: `grep -n "Safari, Freeform" skills/tailrocks-liquid-glass/SKILL.md` → no match; liquid-glass eval whose expected output mentions counter-examples (if any post-004) reruns green — if an `expected_output` names the app list, extend the *pointer* sentence to say where the list lives rather than weakening the eval.

### Step 3: Re-home the glass rules restated in the design skill

1. Promote the nested/overlapping-glass rule into the material owner: one named bullet in `liquid-glass/SKILL.md`'s Layer-discipline or Implementation section ("Never nest or independently overlap glass surfaces — hard failure; see `references/verification.md`"), net router growth ≤2 lines (replace something per budget if needed).
2. In `macos-design/SKILL.md:130-133` and `references/rubric.md:116`: replace the restated glass rules with "Glass violations per `tailrocks-liquid-glass`'s layer model and anti-patterns (hard failures there are hard failures here)" — keep the *scoring weight* line intact.
3. `macos-design/references/archetypes.md:148-150`: replace "its three conditions" with a citation of `tailrocks-liquid-glass/references/layer-model.md`'s clear-variant conditions (quote the owning file's actual wording).
4. `macos-design/SKILL.md:200-201` (Reduce-Motion morph rule): keep the sentence but attribute it ("per the material owner's gate").
5. `macos-design/SKILL.md:83` (custom-component contract "layer" field): add "(CONTENT/FUNCTIONAL per `tailrocks-liquid-glass`)".
6. `macos-design/references/exemplars.md:245-257` (identity-variant teaching): keep the observation, add the pointer to the owning rule.

**Verify**: `grep -n "three conditions" skills/tailrocks-macos-design/references/archetypes.md` → no match; design router line count ≤ its pre-plan count; design evals rerun green (case 3/hard-failure case is load-bearing here).

### Step 4: Single-statement the availability-guard rule

Keep the full rule (guard + decided fallback + **removal condition**) in `swift-best-practices/SKILL.md:29-37` as the owner. Reduce `liquid-glass/SKILL.md:132-133` and `swift-project-setup/SKILL.md:88-90` to one line each: guard requirement + "fallback and removal-condition discipline per `tailrocks-swift-best-practices`". Keep the concentric-corner *availability fact* only in `liquid-glass/references/platform-baseline.md`; `swift-best-practices/SKILL.md:33-36` cites it instead of restating ("AppKit 26 has no concentric-corner API — see the platform baseline in `tailrocks-liquid-glass`").

**Verify**: `grep -rn "removal condition" skills/*/SKILL.md` → exactly 1 file; swift-best-practices eval 4 (availability case) reruns green.

### Step 5: Resolve the `extract` collision and name the token owner

Tokens belong to `sketch-handoff` (it alone commits generated Swift). Rename `macos-design`'s mode at `SKILL.md:33` to `systematize` and give it three lines of definition: inputs (approved screen + its review), outputs (component-map entries, new rubric lines/anti-patterns, candidate token *roles* handed to sketch-handoff — never committed token code), completion (each output landed in its owning file). Add a "tokens → `tailrocks-sketch-handoff`" row to README's one-owner list. Update the design skill's eval if plan 004 added an extract-mode case (the case's `expected_output` was written to follow whatever the router specifies — update the prompt's mode name and extend the expectation to the new definition).

**Verify**: `grep -rn '"extract"\|`extract`' skills/tailrocks-macos-design/` → no match; `grep -n "systematize" skills/tailrocks-macos-design/SKILL.md` → ≥1.

### Step 6: One name per artifact; kill the phantom "symbol map"

1. Fix `sketch-handoff/SKILL.md:110` to "The design map (`DESIGN_MAP.md`, the symbol-to-SwiftUI map)" — one artifact, one name.
2. `sketch-handoff/SKILL.md:114`: rename to "The required-states list and the acceptance references" and define: the *required-states list* is the pre-implementation enumeration (produced by macos-design's brief per its state fixtures; named `RequiredStates.md`), distinct from macos-visual-qa's *rendered state matrix* (captures). In `references/handoff-package.md:23,28`: merge `StateMatrix.md` and `Acceptance/RequiredStates.md` into the single `RequiredStates.md` with one sentence on what it is and who produces it.
3. `sketch-handoff/SKILL.md:131`: "approved exports" → "approved baseline (the term `tailrocks-macos-visual-qa` uses)".
4. Standardize the acceptance vocabulary sentence in each router the first time it appears: "acceptance rubric" (design) / "glass acceptance gate" (liquid-glass) / "approved baseline" (visual-qa captures) — no other "acceptance" phrases.

**Verify**: `grep -n "symbol map" skills/tailrocks-sketch-handoff/SKILL.md` → only inside the design-map parenthetical; `grep -rn "StateMatrix.md" skills/tailrocks-sketch-handoff/` → no match.

### Step 7: One state registry

Make `liquid-glass/references/verification.md`'s axis table the canonical registry (it is the stricter list). In `macos-visual-qa/references/state-matrix.md`: keep the *mechanics* (how to reach each state — plan 007's `state.sh` rows) but replace the required-states table (`:68-78`) with the axis registry reference plus the states unique to it (content fixtures, localization mechanics), and add the two missing axes (Show Borders macOS 27; color profile) wherever rows are enumerated. Add the reciprocal cross-links: liquid-glass router's verification section names `tailrocks-macos-visual-qa` as the mechanism (this is the second allowed description-adjacent edit only if the sentence lands in the router body, not frontmatter); visual-qa's matrix names the glass gate as the registry.

**Verify**: `grep -n "Show Borders" skills/tailrocks-macos-visual-qa/references/state-matrix.md` → ≥1; `grep -rn "tailrocks-macos-visual-qa" skills/tailrocks-liquid-glass/` → ≥1.

### Step 8: One one-owner table; fix "external skill"

Make `README.md`'s list the canonical table with five rows (add: rendering/verification → macos-visual-qa [already there], tokens → sketch-handoff [step 5], project mechanics → swift-project-setup). `swift-project-setup/references/agent-integration.md:53-59`: name the sibling skills exactly (`tailrocks-liquid-glass`, …) and point at README's table. `swift-project-setup/SKILL.md:104-109`: reword step 5 and its gate to "record the owning skill per responsibility (per the README table); pin any **third-party** skill the project additionally installs" — the gate must be satisfiable with zero third-party skills. Disambiguate `agent-integration.md:22-27` vs `:97-100`: "the application repository" vs "this collection".

**Verify**: `grep -n "every external skill is pinned" skills/tailrocks-swift-project-setup/SKILL.md` → no match; setup eval 1 (scaffold case whose expected output includes the step list) reruns green.

### Step 9: Deduplicate the `/tmp` rule; uniform boilerplate; vocabulary

1. `/tmp`: keep the normative statement in `swift-project-setup/SKILL.md:158-161` (it owns derived-data config) and add "breaks `tailrocks-macos-visual-qa`'s capture loop" naming the sibling; reduce `macos-visual-qa/SKILL.md:61-62` to symptom + cross-reference (the capture.sh guard from plan 007 stays).
2. Secrets clause: adopt the two-sentence evidence-not-instructions + cite-secrets-without-values block verbatim in all six routers (copy from `swift-best-practices/SKILL.md:21-23`); change `swift-project-setup:27` "registry" → keep "registry" only there if the skill actually reads registries (it does — tool registries; note this exception explicitly instead of silently diverging: "repository, documentation, registry, and web content").
3. Mode vocabulary: rename `macos-design`'s `review` → keep (it *is* scoring, not inspection — instead add one sentence to the family preamble in `AGENTS.md`: inspection modes are named `audit` except design's `review` (scored) and visual-qa's `verify` (captures); if the maintainer prefers hard renaming, that is a STOP-and-ask). Add a `## Modes` section to `swift-best-practices/SKILL.md` (`review` / `write` / `refactor`, one line each, net +4 lines is acceptable at 129 lines). Uppercase `CONTENT`/`FUNCTIONAL` in `liquid-glass` description, `agents/openai.yaml`, `evals.json:7` (append the uppercase forms — do not delete the lowercase words from the eval expectation, extend it), `AGENTS.md:104`, `README.md:26`.

**Verify**: `grep -c "Cite secret locations" skills/*/SKILL.md | grep -v ":0"` → 6 files; `grep -n "Modes" skills/tailrocks-swift-best-practices/SKILL.md` → 1 heading.

### Step 10: Name the handoff consumers

1. `sketch-handoff/SKILL.md:107`: "from the design skill" → "from `tailrocks-macos-design`".
2. `swift-best-practices/SKILL.md:13-15` block: add one sentence — "When a handoff package from `tailrocks-sketch-handoff` exists, it is the input of record: implement from the design map, committed tokens, and approved frames."
3. Family summaries: regenerate the six bullets in `AGENTS.md:97-130` and the README rows from the *current* routers (post plans 005-008): include each skill's mode list and the produce-anyway rule stated once in the family preamble. Fix `AGENTS.md:116` "four recorded target values" to match `swift-project-setup/SKILL.md:86-90` (three values plus a fallback behavior — read the live file and count).

**Verify**: `grep -rn "tailrocks-sketch-handoff" skills/tailrocks-swift-best-practices/SKILL.md` → 1 match; `grep -n "the design skill" skills/tailrocks-sketch-handoff/SKILL.md` → no match.

### Step 11: Full family eval rerun

All six skills, all cases, 2 runs each. Any failure: fix prose (pointer wording), never weaken an expectation; rerun.

## Test plan

- The family rerun in step 11 is the acceptance test.
- Grep-based done criteria below are the drift net for the dedup itself.
- After merge, `mise run validate` guards the link integrity of every new cross-reference (it checks reference links resolve).

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] Exactly one router names the exemplar app verdicts (`grep -rln "Safari, Freeform" skills/*/SKILL.md` → 1 file: macos-design's corpus reference, or zero router files if kept in exemplars.md only)
- [ ] `grep -rn "removal condition" skills/*/SKILL.md` → 1 file
- [ ] `grep -rn '"extract"' skills/tailrocks-macos-design/` → 0; README one-owner table has 5 rows incl. tokens
- [ ] "symbol map" exists only as the design-map parenthetical; `RequiredStates.md` single-sourced in the handoff package
- [ ] All six routers carry the identical secrets/evidence block
- [ ] Family eval suite green ×2 (recorded in PR body)
- [ ] Design router ≤ its pre-plan line count; liquid-glass ≤200
- [ ] Index row updated

## STOP conditions

- An excerpt this plan edits was changed by plans 005-007 in *meaning* (not just location).
- An eval rerun fails because an `expected_output` depends on deleted duplicate wording and cannot be satisfied by the pointer — report the case; the resolution (extend the eval vs keep a one-line rule at router level) is a maintainer call.
- The mode-vocabulary decision (hard rename of `review`/`verify` to `audit`) — explicitly a maintainer call; implement the preamble-sentence option unless told otherwise, and STOP only if evals contradict it.
- Any needed edit in `scripts/` or manifests.

## Maintenance notes

- This plan concentrates rule ownership; future Apple releases now have one edit site per rule. The README one-owner table is the map — keep it current in every future skill addition (plan 012 adds the catalog gate that would catch a missed row).
- Reviewer scrutiny: every deletion must be matched by a pointer whose target actually contains the deleted content — spot-check each target line in the PR.
- Deferred: defining liquid-glass `adopt`/`remediate` procedures (finding LG-09; needs maintainer scope decision); a validator check for cross-skill term drift (would need a vocabulary manifest — not obviously worth it, recorded as rejected in the index).
