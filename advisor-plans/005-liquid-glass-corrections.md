# Plan 005: Remove the liquid-glass skill's self-contradictions and post-WWDC26 staleness

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-liquid-glass`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — several edits touch eval-load-bearing router lines; the full eval suite for this skill must be rerun (see Test plan)
- **Depends on**: `advisor-plans/004-macos-eval-fixtures-and-coverage.md` (so the rerun actually detects regressions). Content edits can start before 004 merges, but do not merge this before 004.
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The skill's own worked example demonstrates the exact defect its router calls "a bug, not a style"; its "never hard-code a corner radius" rule outlaws the only legal AppKit-26 form its own reference mandates; its completion gate accepts surfaces its verification gate fails; and several statements went stale after WWDC 2026 (an Apple-authored AppKit code listing now exists, the macOS 27 delta table misses the only deprecation in the glass-adjacent surface and a known-broken control). An `apply`-mode agent today can ship permanently-fused glass and pass its own audit; an `audit`-mode agent can flag Apple's own sample pattern as a violation.

## Current state

All paths relative to `skills/tailrocks-liquid-glass/`. Excerpts verified at `64df333`.

**(a) The AppKit example contradicts the router's spacing rule.**

`SKILL.md:103-105`:
> Container `spacing` larger than the interior stack spacing makes effects blend at rest. That is a bug, not a style.

`references/appkit-api.md:90-94` (the only AppKit container worked pattern):
```swift
        let row = NSStackView(views: glassViews)
        row.orientation = .horizontal
        row.spacing = 12

        container.spacing = 20   // merge distance ≥ row spacing, so neighbors fuse
```

**(b) "Never hard-code a corner radius" vs the AppKit-26 reality.**

`SKILL.md:106-109`: "Never hard-code a corner radius. … State which of the two cases applies; a numeric radius is wrong in both."

`references/appkit-api.md:42-47`:
> `cornerRadius` is a raw `CGFloat`. **AppKit on macOS 26 has no concentric-corner API at all.** … On macOS 26, either host the surface in SwiftUI to get `ConcentricRectangle`, or derive the radius explicitly and document that it must be revisited when the window corner radius changes …

Examples hard-code 16 (`appkit-api.md:34`) and 18 (`appkit-api.md:84`); `references/swiftui-api.md` documents that Apple's only shipped sample uses `.rect(cornerRadius:)`. `references/verification.md:71` scopes the hard failure correctly ("A hard-coded corner radius **adjacent to a system container**") — the router over-states it.

**(c) Availability heading contradicts its own table.**

`references/platform-baseline.md:38-40`:
```
## Every Liquid Glass symbol in the 26.x line is introduced at 26.0

Nothing was added or deprecated between 26.1 and 26.6 except three items:
```
followed by three rows introduced **at 26.1** (`NSScrollEdgeEffectStyle`, `preferredScrollEdgeEffectStyle`, `visibilityPriority(_:)`).

**(d) "soft is the default" — three-way disagreement.**

`references/apple-patterns.md:114`: heading "Scroll edge effects: soft is the default, hard is the Mac case". `references/swiftui-api.md` (§scroll edge) documents `.automatic (default)` and "Prefer `.automatic`."; the HIG quote in `references/layer-model.md` ("Prefer the automatic scroll edge effect style… If you use the soft scroll edge effect style instead, thoroughly test…") presupposes soft is not the default.

**(e) Non-compiling spelling in the classification table.**

`references/layer-model.md:87`: `| Detail form | CONTENT | `Form(.grouped)` | none |` — `Form` has no such initializer; the grouped style is `.formStyle(.grouped)` (stated correctly at `layer-model.md:221`).

**(f) Two spellings for `NSScrollEdgeEffectStyle` members.**

`references/appkit-api.md:217-218` lists `.automatic`, `.hard`, `.soft`; `:222` quotes Apple assigning `NSScrollEdgeEffectStyle.softStyle` with no note that the ObjC `…Style` suffix drops on Swift import. The worked pattern at `:237` uses `.hard`.

**(g) "Complete when" accepts what the gate fails.**

`SKILL.md:170-173` requires: justification, container, concentric-or-justified shape, availability guard, gate rows. `references/verification.md:46-62` additionally requires the variant choice (with a reason when `clear`) and the substitutions under Reduce Transparency and Reduce Motion, and says a surface "with no recorded substitution behavior, fails the gate regardless of how it looks."

**(h) Decision-order step 4 has no AppKit form.**

`SKILL.md:59-62` defines step 4 solely as SwiftUI `safeAreaBar(edge:...)`. AppKit system-supported bars exist in `references/appkit-api.md`: `NSTitlebarAccessoryViewController` (:234-238 worked pattern) and `NSSplitViewItemAccessoryViewController` / `topAlignedAccessoryViewControllers` / `bottomAlignedAccessoryViewControllers` (:256-258) — never tied to step 4.

**(i) Router blocklist promises "name the correct form" and twice doesn't.**

`SKILL.md:117`: "reject them on sight and name the correct form". `:129-130` (`prominentGlass`/`clearGlass` are UIKit) names no SwiftUI form though `.glassProminent` is macOS 26.0 (`references/swiftui-api.md:126-129`); `:123-126` (`containerConcentric`) omits that `.rect(corners: .concentric)` is valid macOS 26 API (`swiftui-api.md:248`).

**(j) Interactive glass stated three ways.**

`references/layer-model.md:69-70` attributes the "interactive-glass bounce" restraint note to macOS 27 without scoping it to AppKit; `references/swiftui-api.md:51` and `references/apple-patterns.md:28-31` record SwiftUI `Glass.interactive(_:)` as macOS 26.0 (probe-verified); `SKILL.md:127-128` says AppKit has none on 26; `SKILL.md:152-155` recommends `Glass.identity` + `.interactive()` unscoped. Additionally (web-verified 2026-08-11): WWDC26 session 269 frames the pointer-tuned click response as a macOS 27 refinement — the API exists on 26 but the tactile behavior should be verified on the deployment target, not promised.

**(k) Final gate strands reference rules.**

`SKILL.md:159-161` instructs checking "all ten entries" of `references/anti-patterns.md` — but that file's performance-framing block (after entry 10, ~:170-188: "any 'maximum N glass surfaces' figure is invented", profiling practice) sits outside the ten entries. `SKILL.md:175-182` (Final gate) omits three hard failures from `references/verification.md:75-77`: icon-only control with no accessibility label; toolbar item with no menu-bar command; no rendered evidence.

**(l) Tint-rule provenance conflict.**

`references/apple-patterns.md:110-112`: "Apple never publishes a numeric limit on tinted items; the practical rule stands at one per bar". `references/anti-patterns.md:81` and `references/layer-model.md:187-188` quote Apple's "Only specify one primary action". `references/verification.md:72` makes it a hard failure. Anchor the hard failure to the quoted HIG one-primary-action rule.

**(m) Post-cutoff currency (all web-verified against live Apple sources on 2026-08-11; re-verify at execution time — Apple doc pages are JS-rendered, use the DocC JSON API `https://developer.apple.com/tutorials/data/documentation/<path>.json` and take availability from `metadata.platforms`):**

1. `SKILL.md:89-92` and `references/appkit-api.md:3-14` claim "for AppKit there is prose and API reference only". Still true narrowly (no downloadable AppKit sample; no AppKit listing in the adoption guide), but WWDC26 session 289 "Modernize your AppKit app" ships an AppKit code listing (a `cornerConfiguration` override) — the generalization is stale.
2. `references/platform-baseline.md:29-31` names "Xcode 27 beta" with no ordinal; live pages are titled "macOS 27 Golden Gate **Beta 5**" / "Xcode 27 **Beta 5**". Beta claims are unfalsifiable without the ordinal. Also an SDK-pairing contradiction: this file and four compile claims in `appkit-api.md` (:69 et al.) say "macOS 26.5 SDK (Xcode 26.6)"; Apple's macOS 26.6 release notes say "The macOS 26.6 SDK … comes bundled with Xcode 26.6", while Xcode 26.6's own notes say 26.5. Record both citations and name `xcrun --show-sdk-version` as the tiebreaker.
3. `references/platform-baseline.md:89-91` (menu images): missing the AppKit opt-in `NSMenuItem.preferredImageVisibility` (macOS 27) and the scope split — apps **linked against the 27 SDK** hide both symbol and non-symbol images (Apple resolved issues 179374305/179936632).
4. `references/platform-baseline.md:76` lists `NSViewCornerRadius` members `.containerConcentric`, `.fixed(_:)` — DocC also declares `containerConcentric(_ CGFloat)` (minimum-radius form) and the factory `NSViewCornerConfiguration.uniformCorners(radius:)`, the spelling Apple demonstrates in WWDC26 289; availability also includes Mac Catalyst 27 beta.
5. macOS 27 delta table (`platform-baseline.md:68-96`) missing four rows: `toolbarMinimizationSafeAreaAdjustment(_:for:)`; TabView-in-inspector rebuild appearance change (auto `.tabs` picker, 170678002); `TextInputBorderShape` + `textInputBorderShape(_:)` with `.squareBorder`/`.roundedBorder` **soft-deprecated** → `.bordered` (173362083 — the only deprecation in the 26→27 glass-adjacent surface; the file records zero deprecations); `NSSegmentedCell` draws at the wrong location under the Liquid Glass appearance (168066807 — belongs in `verification.md` as a known-blocker row, so audits don't blame the app).
6. Coverage gaps: `windowResizeAnchor` absent everywhere (probe availability before adding); no blocklist row for `tabViewBottomAccessory` (sibling `tabBarMinimizeBehavior` is covered at `platform-baseline.md:122`); `references/appkit-api.md:290-301` has no `NSVisualEffectView`→glass migration decision for existing chrome; system presentation morphing (sheets/popovers from glass controls, free on standard presentations, lost on hand-rolled panels) exists only as abstraction in `layer-model.md:37,43`.
7. HIG anchor: Apple's design changelog records a 2026-06-08 revision touching Scroll views, Sidebars ("adaptable sidebar style" — vocabulary the skill never mentions), Menus, App icons, Design principles. The skill carries no HIG revision date. HIG pages are JS-rendered and have no DocC JSON — a browser read is required for this item.

**House constraints (from `AGENTS.md`, binding):** routers stay lean — new depth goes to `references/`; a load-bearing requirement gets a named bullet, not a mid-paragraph clause; never weaken the guard sentence, frontmatter, or an eval's `expected_output`; every `references/*.md` stays linked from `SKILL.md`; SKILL.md stays well under 500 lines (currently 182; do not exceed ~200 — prefer replacing over appending); re-run the skill's full eval suite after any router edit.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Router length | `wc -l skills/tailrocks-liquid-glass/SKILL.md` | ≤ 200 |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-liquid-glass --case <id> --runs 2` | exit 0 per case |
| DocC probe | `curl -s https://developer.apple.com/tutorials/data/documentation/appkit/nsviewcornerradius.json \| head -c 400` | JSON with `metadata` |

## Scope

**In scope**:
- `skills/tailrocks-liquid-glass/SKILL.md`
- `skills/tailrocks-liquid-glass/references/{platform-baseline,appkit-api,swiftui-api,layer-model,apple-patterns,anti-patterns,verification}.md`
- `skills/tailrocks-liquid-glass/references/adoption-sequence.md` (new)
- `skills/tailrocks-liquid-glass/evals/evals.json` — only if a case's `expected_output` must be *extended* to match corrected wording (never weakened)

**Out of scope**:
- Every other skill (ownership moves — e.g. the exemplar-app list duplication with `tailrocks-macos-design` — belong to plan 008; do not delete the router's app-verdict lines here even though plan 008 will).
- `scripts/`, `.github/`, manifests, README/AGENTS/INSTALL.
- Frontmatter (description trigger list edits belong to plan 008 if any).

## Git workflow

- Branch: `advisor/005-liquid-glass-corrections`
- Conventional Commits + DCO (`git commit -s`); suggested subjects: `fix(liquid-glass): correct spacing example and radius rule`, `docs(liquid-glass): macOS 27 beta-5 currency pass`
- Main is PR-only (`gh pr create`).

## Steps

### Step 1: Fix the AppKit container example (a)

In `references/appkit-api.md:90-94`: set `container.spacing = 12` (equal to row spacing) and rewrite the comment to state that merging happens during transitions/proximity animation, not at rest, citing the router rule. Keep the compile annotation only if you re-run the probe: extract the block and `swiftc -c -target arm64-apple-macos26.0 <file>` on a Mac with the pinned SDK; if no Mac/SDK is available, keep the code change and change the annotation to "not re-probed since edit" (STOP condition does not apply — this is a numeric literal change).

**Verify**: `grep -n "container.spacing" skills/tailrocks-liquid-glass/references/appkit-api.md` → value equals the row spacing; comment no longer says "so neighbors fuse".

### Step 2: Restate the radius rule as three cases (b)

In `SKILL.md:106-109`, replace the two-case rule with three named cases: (1) capsule default for free-floating clusters; (2) concentric derivation (`ConcentricRectangle` / `containerShape(_:)`, or `.rect(corners: .concentric)`) where a container corner is adjacent; (3) **documented numeric radius where no concentric API exists (AppKit on macOS 26)** — requiring the revisit note `references/appkit-api.md:43-47` already specifies. Keep the "state which case applies" obligation. Do not change `verification.md:71` (already correctly scoped).

**Verify**: `grep -n "wrong in both" skills/tailrocks-liquid-glass/SKILL.md` → no match; eval case 4 rerun (Test plan) passes.

### Step 3: Fix the availability heading and scroll-edge default (c, d, f)

- `platform-baseline.md:38-40`: retitle to "Almost every 26.x glass symbol is 26.0 — three exceptions" and fix the body to "after 26.0" scoping.
- `apple-patterns.md:114`: retitle to "Scroll edge effects: automatic is the default; hard is the Mac case"; if the soft nuance matters, phrase as "automatic commonly resolves soft".
- `appkit-api.md:217-223`: state the Swift member spellings once (`.automatic`, `.hard`, `.soft`) and add one sentence: Apple's quoted snippet uses the ObjC name `softStyle`; the `…Style` suffix drops on Swift import. (If a Mac with the SDK is available, confirm the Swift names compile; otherwise mark "spelling per Swift import convention — re-probe".)

**Verify**: `grep -n "soft is the default" skills/tailrocks-liquid-glass/references/apple-patterns.md` → no match; `grep -n "Every Liquid Glass symbol" skills/tailrocks-liquid-glass/references/platform-baseline.md` → no match.

### Step 4: Fix `Form(.grouped)` (e)

`layer-model.md:87`: change the Component cell to `` `Form` + `.formStyle(.grouped)` ``.

**Verify**: `grep -rn "Form(.grouped)" skills/` → no match.

### Step 5: Align "Complete when" with the per-surface record (g)

In `SKILL.md:170-173`, extend the clause to name the per-surface record in `references/verification.md` as the required artifact, explicitly adding: variant choice (reason required when `clear`) and the substitutions under Reduce Transparency and Reduce Motion. This is a load-bearing line — the full eval rerun in the Test plan is mandatory after this step.

**Verify**: `grep -n "Reduce Transparency" skills/tailrocks-liquid-glass/SKILL.md` → appears in the Complete-when block as well as the apply-mode block.

### Step 6: Give step 4 of the decision order an AppKit form (h)

In `SKILL.md:59-62`, add one clause naming the AppKit spellings: `NSTitlebarAccessoryViewController` (title-bar-attached bars) and `NSSplitViewItemAccessoryViewController` / `top-`/`bottomAlignedAccessoryViewControllers` (split-item-attached bars). Add a short "System-supported bars" block to `references/appkit-api.md` mapping bar position → API, next to the existing accessory material (:225-258), and keep the router clause to one sentence.

**Verify**: `grep -n "NSTitlebarAccessoryViewController" skills/tailrocks-liquid-glass/SKILL.md` → 1 match; router `wc -l` ≤ 200.

### Step 7: Complete the blocklist's correct forms (i)

`SKILL.md:129-130`: append "SwiftUI: `.buttonStyle(.glassProminent)` (macOS 26.0); AppKit: `NSToolbarItem.Style.prominent`." `SKILL.md:123-126`: append that `.rect(corners: .concentric)` is valid macOS 26 SwiftUI API alongside `ConcentricRectangle`. Load-bearing for eval case 4 — rerun required.

**Verify**: `grep -n "glassProminent" skills/tailrocks-liquid-glass/SKILL.md` → ≥1 match in the blocklist section.

### Step 8: Scope interactive glass (j)

- `layer-model.md:69-70`: attribute the macOS 27 bounce note to AppKit's arrival (`effectIsInteractive`), one clause.
- `SKILL.md:152-155`: mark the `identity` + `.interactive()` rule SwiftUI-only, with the AppKit fallback stated once (no interactive glass on AppKit 26), and add the behavior caveat: API is macOS 26.0; the pointer-tuned response is a macOS 27 refinement — verify the tactile response on the actual deployment target.

**Verify**: `grep -n "interactive" skills/tailrocks-liquid-glass/SKILL.md` → the recommendation names SwiftUI.

### Step 9: Point the router at stranded reference rules (k)

- `SKILL.md:159-161`: change "all ten entries" to "every entry **including the performance framing that follows them**".
- `SKILL.md:175-182` (Final gate): replace the re-enumerated subset's tail with a citation of `references/verification.md`'s hard-failure list, so the icon-label, menu-bar-command, and rendered-evidence failures are in force. Keep the gate section short — cite, don't copy.

**Verify**: `grep -n "verification.md" skills/tailrocks-liquid-glass/SKILL.md` → ≥2 matches (existing link + gate citation).

### Step 10: Anchor the tint rule (l)

`apple-patterns.md:110-112`: reword to — Apple publishes no numeric limit on *tint* while mandating a single *primary action* (quote at `anti-patterns.md:81`); the two are one rule. No change to `verification.md:72`.

**Verify**: `grep -n "practical rule stands" skills/tailrocks-liquid-glass/references/apple-patterns.md` → no match.

### Step 11: Currency pass (m) — re-verify each item live, then edit

For each item in (m): fetch the cited DocC JSON / release-notes page at execution time; if it still supports the change, apply it; if Apple has moved again, record the newer state instead (this plan's citations are from 2026-08-11 and macOS 27 is in beta — drift is expected).

1. Narrow the AppKit-sample claim in `SKILL.md:89-92` and `appkit-api.md:3-14`; cite WWDC26 289 (and WWDC25 310) as the Apple-authored AppKit code that exists.
2. `platform-baseline.md`: add a beta-ordinal row ("macOS 27 Golden Gate beta 5 / Xcode 27 beta 5, checked <date>"); footnote the 26.5-vs-26.6 SDK contradiction with both release-note citations and `xcrun --show-sdk-version` as tiebreaker (also update the four "26.5 SDK" compile annotations in `appkit-api.md` to reference the footnote).
3. Menu images: add `NSMenuItem.preferredImageVisibility` + the linked-against-26 vs linked-against-27 scope split.
4. Concentric API: add `containerConcentric(_ CGFloat)` and `NSViewCornerConfiguration.uniformCorners(radius:)` (+ Mac Catalyst 27 beta) to `platform-baseline.md:76` and the canonical snippet to `appkit-api.md` §42-47.
5. Restructure the 27 delta table into three sub-lists — new API (guard) / changes on rebuild against the 27 SDK / deprecations — and add the four missing rows; put the `NSSegmentedCell` defect into `verification.md` as a known-blocker row.
6. Gaps: add a `tabViewBottomAccessory` blocklist row (probe availability first); a short `NSVisualEffectView`→glass migration table in `appkit-api.md` keyed by surface (sidebar / toolbar accessory / floating panel / content); one sentence on system presentation morphing in `layer-model.md`'s transient plane; `windowResizeAnchor` only if a DocC probe confirms availability — otherwise skip and note why.
7. Browser-read the four revised HIG pages (Scroll views, Sidebars, Menus, Design principles); add "HIG revision checked: <date>" anchors to HIG-derived rule blocks; fold "adaptable sidebar style" into the decision order's step-1 examples if the HIG defines it as a standard component behavior.

**Verify**: each fetched URL recorded in the commit message or PR body with its check date; `mise run validate` exit 0; router `wc -l` ≤ 200.

## Test plan

After all steps: rerun the **entire** liquid-glass eval suite (all cases present after plan 004), 2 runs each:
`for c in 1 2 3 4 5 6 7; do bun scripts/run-evals.ts --skill tailrocks-liquid-glass --case $c --runs 2 || echo "CASE $c FAILED"; done`
Expected: all pass. A failure on case 4 after steps 2/7 means the reworded blocklist no longer supports the expected output — fix the wording (never the `expected_output`) and rerun.

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] `wc -l skills/tailrocks-liquid-glass/SKILL.md` ≤ 200
- [ ] Step-level greps all pass (no "wrong in both", no "soft is the default", no `Form(.grouped)`, blocklist names `.glassProminent`)
- [ ] Full eval suite green, 2 runs per case, recorded in PR body
- [ ] Every currency edit carries a source URL + check date in the PR body
- [ ] No file outside `skills/tailrocks-liquid-glass/` modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A "Current state" excerpt does not match the live file (drift since `64df333`).
- A live Apple source contradicts this plan's claimed direction *and* the current skill text (three-way disagreement) — report the URLs, do not guess.
- The eval rerun fails the same case twice after a wording fix.
- Any edit would push `SKILL.md` past 200 lines — per AGENTS.md the addition must replace something; if nothing can be replaced without weakening an eval-load-bearing line, stop.
- You find yourself wanting to edit another skill (e.g. the design skill's glass lines) — that is plan 008.

## Maintenance notes

- Plan 008 will *delete* the exemplar-app verdict lines from this router (one-owner rule); do not be surprised by a follow-up removing text this plan left intact.
- Plan 013/012 adds a staleness gate for the dated platform facts; the beta-ordinal row added here is what that gate will age-check.
- Reviewer scrutiny: diff of `SKILL.md` should be near-line-neutral; every removed clause should reappear as a reference citation.
- Deferred: `adopt`/`remediate` procedure (`references/adoption-sequence.md`) is deliberately **not** written here — it needs a maintainer decision on adoption ordering and is tracked as finding LG-09 in the index; if the maintainer approves, extend this plan or add a new one.
