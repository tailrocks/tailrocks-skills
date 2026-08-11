# Plan 014: Spikes — app-side state injection fidelity, and the icon/distribution gap

> **Executor instructions**: This is an investigation plan, not a build plan.
> Its deliverables are evidence tables and scope memos written into
> `advisor-plans/`, plus one small template fix. Follow the steps; STOP
> conditions apply. Update this plan's status row in
> `advisor-plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-macos-visual-qa skills/tailrocks-swift-project-setup/templates skills/tailrocks-sketch-handoff/references/handoff-package.md`
> Meaning-level mismatch on cited lines = STOP.
>
> **Environment**: Spike A needs a GUI Mac with Screen Recording, Accessibility,
> and Automation grants — the same requirements as the visual-qa skill itself.
> Without one, Spike A is BLOCKED (not skippable); Spike B and the icon fix
> proceed anywhere.

## Status

- **Priority**: P3
- **Effort**: M (Spike A) + S (Spike B memo) + S (icon fix)
- **Risk**: LOW (investigation + one inert-setting fix)
- **Depends on**: 007 (state.sh exists — Spike A compares against it)
- **Category**: direction
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The family's acceptance gate is currently unrunnable on any machine someone is using: the state matrix flips *real* system settings, and the one dogfood ever run (`plans/macos-skills-hardening/w6-dogfood/StateMatrix.md`) skipped every accessibility and glass-variant row for exactly that reason — those skips drove two categories under their 60% minimum and three "unverifiable" hard-failure rows in the 57/100 rejection. The dogfood *invented* an undocumented workaround (per-app launch-environment injection: `CB_APPEARANCE`, `CB_STATE`, `CB_FRAME` — `StateMatrix.md:4-6`) that the skill never teaches. Whether injection is *honest* per row is an open fidelity question — injected values prove the app's own substitution, not the framework's — so it needs a spike, not a doc edit. Separately, the setup templates point at an icon asset catalog and a "distribution pipeline" that don't exist (`templates/project.yml:49-54`, `references/project-generation.md:73-74`): the icon half is a small real fix; the notarization half is a large stage that cannot be dogfooded without a paid Developer ID and deserves a scope memo before anyone writes a skill.

## Current state

- `skills/tailrocks-macos-visual-qa/references/state-matrix.md:6`: "These commands change the user's real system settings." `SKILL.md:115-116` concedes: "Plan for this in continuous integration provisioning, or accept that visual verification is a development-machine capability."
- `plans/macos-skills-hardening/w6-dogfood/StateMatrix.md:4-6` (read-only evidence): appearance/content/frame states driven per-app via launch environment "so the user's system settings were never touched"; `:26-27`: Reduce Transparency, Increase Contrast, Reduce Motion, Differentiate Without Color, Liquid Glass Clear/Tinted, accent variants — all skipped, "machine was in active use by its owner".
- Fidelity constraint (the crux): system components substitute opaque treatments off the *real* setting (`skills/tailrocks-liquid-glass/references/verification.md:7-10`); SwiftUI environment overrides (`.environment(\.accessibilityReduceTransparency, true)` etc.) affect the app's own reads, and `NSApp.appearance` / `NSAppearance` override appearance per-app — but whether **system-drawn chrome inside the app** (toolbars, materials, glass) follows an injected value differs per row and must be measured, not assumed.
- Icon gap: `skills/tailrocks-swift-project-setup/templates/project.yml:54` sets `ASSETCATALOG_COMPILER_APPICON_NAME: <AppIcon>` with no catalog anywhere; `skills/tailrocks-macos-design/references/macos-craft.md:177-190` mandates Icon Composer and says "The `.icon` file is **not** an asset catalog entry"; `skills/tailrocks-sketch-handoff` package (`references/handoff-package.md:19-20` area) carries no icon-source row. Two shipped files contradict each other.
- Distribution gap: `references/project-generation.md:73-74` + `templates/project.yml:49-50`: "Real signing, hardened runtime, entitlements, and notarization belong to the distribution pipeline, not the development loop" — no skill, reference, or template anywhere mentions notarization, Developer ID, archiving, or DMG (`grep -rn "notariz" skills/` → only those two out-of-scope comments).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Spike A capture | `skills/tailrocks-macos-visual-qa/templates/capture.sh` (plan 007 version) | capture + sidecar manifest |
| Spike A states | `templates/state.sh with <state> -- …` (plan 007) | apply/restore verified |

## Scope

**In scope**:
- `advisor-plans/014a-injection-fidelity.md` (new — Spike A's evidence table)
- `advisor-plans/014b-distribution-scope.md` (new — Spike B's memo)
- `skills/tailrocks-swift-project-setup/templates/project.yml` + `references/project-generation.md` (icon setting fix only)
- `skills/tailrocks-macos-visual-qa/references/state-matrix.md` (ONLY if Spike A verdicts are clean enough to document — see step A3's gate)

**Out of scope**:
- Building a seventh skill or any notarization tooling (the memo decides *whether*; building is a future plan).
- `skills/tailrocks-sketch-handoff` edits (icon-source row is proposed in the memo, landed with the icon decision).
- Everything else.

## Git workflow

- Branch: `advisor/014-spikes`; `git commit -s`; `docs(advisor): injection-fidelity evidence and distribution scope memo`; PR via `gh pr create`.

## Steps

### Spike A — per-row fidelity of app-side state injection (GUI Mac)

**A1.** Build a minimal scratch app *outside the repo* (reuse plan 009's scratch or generate from the setup templates) whose one window shows: a toolbar (system glass), a sidebar (material), one custom `glassEffect` surface, one custom translucent panel (hand-rolled, no glass API), text in `secondaryLabelColor`, and a color-only status dot. Add debug-only launch-env hooks mirroring the dogfood's pattern (`CB_APPEARANCE` → `NSApp.appearance`; per-setting SwiftUI environment overrides for Reduce Transparency / Increase Contrast / Reduce Motion / Differentiate Without Color).

**A2.** For each matrix row in the table below, capture the same window twice — once with the **real** setting flipped via `state.sh` (snapshot/restore semantics), once with only the **injected** value — and diff the captures (plan 007's budgeted diff): dark appearance; Reduce Transparency; Increase Contrast; Reduce Motion (capture during a transition); Differentiate Without Color; accent color (if injectable at all); Liquid Glass clear/tinted (expected: **not injectable** — record as system-only).

**A3.** Write `advisor-plans/014a-injection-fidelity.md`: one row per state — injected-vs-real pixel diff count, verdict `system-faithful` (diff ≈ 0: injection honestly reproduces the row) / `app-level-only` (app content adapts, system chrome does not: injection proves the app's substitution only) / `not-injectable`, plus the capture pair paths. **Gate**: only if at least one row is `system-faithful` do you then document the injection pattern in `state-matrix.md` — as a per-row annotated alternative ("injection valid for rows X,Y; app-level-only for Z — real-setting capture remains the acceptance authority"), never as a wholesale replacement. If every row is `app-level-only`, the deliverable is the evidence table plus a one-paragraph "injection cannot green the gate" note in the same file — and `state-matrix.md` is not edited.

**Verify**: the evidence file has all 8 rows with numeric diffs and capture paths; restores verified (`state.sh` reports); `mise run validate` exit 0 if `state-matrix.md` was touched.

### Spike B — distribution scope memo (any machine)

Write `advisor-plans/014b-distribution-scope.md` answering, with sources cited and dated:

1. What can be *verified without a paid Developer ID*: ad-hoc `codesign` + `codesign --verify --deep --strict`, entitlements plists, `ENABLE_HARDENED_RUNTIME` build flag, `xcodebuild archive` + `-exportOptionsPlist` dry shapes, Gatekeeper's `spctl --assess` behavior on unsigned/ad-hoc apps.
2. What cannot: `notarytool submit/log` round-trip, stapling, Developer ID certificates, App Store Connect — each with the credential class it needs (named by type only — this repo's rule: cite credential locations/types, never values).
3. The recommendation with trade-offs: bounded `references/distribution.md` inside `tailrocks-swift-project-setup` covering the verifiable half + a clearly-labeled unverified checklist for the credentialed half, **versus** a seventh skill (would ship at a lower evidence grade than its W1-hardened siblings — say so explicitly). Include the maintainer decision line the memo needs answered.
4. The icon pipeline decision (see the fix below): where the `.icon` / Icon Composer source lives in the handoff package, and which skill owns the row (proposal: sketch-handoff carries the icon source; setup templates carry the build wiring).

**Verify**: memo exists, every claim carries a source URL + date or a "requires credentialed account — unverifiable here" tag.

### Icon fix (small, concrete, any machine)

In `templates/project.yml:54`: comment the setting — `# Inert until an asset catalog or .icon source exists; macOS 26+ icons come from Icon Composer (.icon), which is NOT an asset-catalog entry — see macos-craft.md and advisor-plans/014b.` In `references/project-generation.md`: one sentence in the structure section acknowledging the icon source is supplied by the design handoff, not scaffolded, and pointing at the memo's decision. (If the maintainer's answer to the memo lands quickly, a follow-up plan wires the real path; this step just stops the two shipped files from contradicting each other.)

**Verify**: `grep -n "Icon Composer" skills/tailrocks-swift-project-setup/templates/project.yml` → 1 match; `mise run validate` exit 0; a scratch `xcodegen generate` still succeeds (Mac; else note parse-only).

## Test plan

Spike deliverables are evidence; their "tests" are the Verify gates above. The icon fix is covered by validate + scratch generate.

## Done criteria

- [ ] `advisor-plans/014a-injection-fidelity.md` — 8 rows, numeric diffs, per-row verdicts, restore-verified (or BLOCKED with the machine requirement stated)
- [ ] `state-matrix.md` edited only under A3's gate, per-row annotated
- [ ] `advisor-plans/014b-distribution-scope.md` — the 4 questions answered, sourced/dated, with the explicit maintainer decision line
- [ ] project.yml icon setting no longer references a nonexistent catalog without explanation
- [ ] `mise run validate` exit 0; index row updated

## STOP conditions

- No GUI Mac with the three grants → Spike A BLOCKED (record; do B + icon fix).
- `state.sh` restore fails or a real setting is left flipped → stop everything, restore manually, report — this spike must not do the harm the skill warns about.
- Injection requires app-source patterns beyond debug-only launch-env reading (e.g. swizzling) → record `not-injectable` for that row; do not escalate the mechanism.
- The memo research finds Apple has shipped agent-facing notarization tooling that changes the calculus (post-cutoff possibility) → fold into the memo as a decision input, don't redesign mid-spike.

## Maintenance notes

- If A3 lands the injection annotations, plan 004's eval fixtures for visual-qa gain an honest CI-side story for a *subset* of rows — note which in the evidence file.
- The distribution decision (memo question 3) determines whether a future plan 015 exists. Keep the memo's maintainer-decision line answerable with one word.
- These spikes descend from findings DIR-02 and DIR-06; the considered-and-rejected alternatives (Figma parity, standalone dogfood skill, menu-bar/widget coverage) are recorded in `advisor-plans/README.md` — do not resurrect them here.
