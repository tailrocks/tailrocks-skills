# Plan 010: Correct the coordinator-lifetime model and name the APIs the swift-best-practices rules depend on

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-swift-best-practices`
> On drift, compare excerpts; meaning-level mismatch = STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (reference prose; one eval expectation extension)
- **Depends on**: 004 (eval net). Coordinate two one-line touches with plan 009 (errors-and-api test-exemption sentence; concurrency.md settings list) — whichever lands second adapts.
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The skill's AppKit-interop reference teaches a wrong lifetime model — "the coordinator … its lifetime is the representable's lifetime" — when a representable is a value re-created on every update and the coordinator deliberately survives those re-creations; the eval grades the wrong model as the expected answer, so a *correct* reviewer fails the eval. Around it, the references state rules about specific APIs while naming almost none of them (zero accessibility authoring modifiers, no `throws(E)` in the typed-failure section, no Swift Testing symbols, an observation performance claim that conflates the deprecated-path behavior with the macro), which makes the review checklists unactionable from the references alone — in the one skill whose whole job is code-level policy.

## Current state

Paths relative to `skills/tailrocks-swift-best-practices/`. Verified at `64df333`.

**(a) Coordinator lifetime — wrong in three places.**

`references/appkit-interop.md:41-42`:
> The coordinator owns delegate conformance and any observation, and its lifetime is the representable's lifetime.

`SKILL.md:84-86` restates it as mandatory; `evals/evals.json:19` (case 3) grades on "a clear coordinator lifetime". Correct model: the representable struct is re-created on every SwiftUI update; `makeCoordinator()` runs once per *represented view*; the coordinator persists across re-created representable values for as long as the represented view keeps its identity; teardown belongs in `dismantleNSView(_:coordinator:)`.

**(b) Interop rules name no APIs.** `appkit-interop.md:33-44` mandates "the typed initializer and the update method", "a coordinator", "the sizing hooks" — never naming `makeNSView(context:)`, `updateNSView(_:context:)`, `makeCoordinator()`, `dismantleNSView(_:coordinator:)`, `sizeThatFits(_:nsView:context:)`. The reverse bridge (`:68-76`) discusses a hosting controller without naming `NSHostingView`, `NSHostingController`, or `sizingOptions`. The sibling house style names symbols exactly (see `skills/tailrocks-liquid-glass/references/platform-baseline.md`).

**(c) Typed failure omits typed throws.** `references/errors-and-api.md:4-21` teaches only `enum: Error`; never `throws(E)` (available since Swift 6.0; shipping lane is Swift 6.3 per `skills/tailrocks-swift-project-setup/references/toolchain.md:19`). `:26-29` requires "a localized description, a failure reason…, and a recovery suggestion" without naming `LocalizedError` or its properties.

**(d) Swift Testing surface** — `skills/tailrocks-swift-project-setup/references/testing.md` API-surface subsection is plan 009 step 1.4's deliverable; this plan only adds the *review-side* rule here: parallel-by-default execution vs `@MainActor`-isolated state, in `references/concurrency.md` (one short subsection).

**(e) Observation claim over-broad.** `references/swiftui.md:11-20` ownership rules name no property wrapper/macro; `:102-103` lists "Observation scoped too broadly, so an unrelated property invalidates a large subtree" as a top-three macOS performance cause — that is `ObservableObject`/`@Published` behavior; the `@Observable` macro tracks per-property access and largely removes it.

**(f) Accessibility reference authoring gap + elided name.**

`references/accessibility.md:12-20` requires label, value, role/traits, custom actions, identifier — naming zero modifiers. `:43`:
```
| Differentiate Without Color | `accessibilityDifferentiateWithoutColor`, `NSWorkspace.…` | No state communicated by color alone. |
```
— the one API name in the table left unwritten (`NSWorkspace.accessibilityDisplayShouldDifferentiateWithoutColor`). Also: "role" is AppKit vocabulary; SwiftUI has traits — the file mixes them without naming either.

**House constraints:** router at 129 lines (headroom small); depth goes to references; never weaken `expected_output` — case 3's expectation will be *corrected* because it currently encodes a false claim (see step 1's eval note); re-run the suite.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-swift-best-practices --case <id> --runs 2` | exit 0 |
| Spelling probe (Mac, optional) | `swiftc -parse` a scratch file using each named API | exit 0 |

## Scope

**In scope**: `references/{appkit-interop,errors-and-api,swiftui,accessibility,concurrency}.md`, `SKILL.md` (the interop bullet only), `evals/evals.json` (case 3 correction + extensions from plan 004).

**Out of scope**: `skills/tailrocks-swift-project-setup/**` (plan 009), all other skills, templates, scripts.

## Git workflow

- Branch: `advisor/010-best-practices-corrections`; `git commit -s`; `fix(swift-best-practices): correct coordinator lifetime; name the APIs`; PR via `gh pr create`.

## Steps

### Step 1: Fix the coordinator-lifetime model

Reword `appkit-interop.md:41-42` to: "The coordinator owns delegate conformance and any observation. It is created once by `makeCoordinator()` and outlives every re-created representable value for as long as the represented view keeps its identity; tear observation down in `dismantleNSView(_:coordinator:)`, never in `updateNSView`." Update `SKILL.md:84-86` to the same model in one sentence. Correct eval case 3's `expected_output`: replace the "coordinator lifetime" clause with "states that the coordinator is created once per represented view, survives representable re-creation, and is torn down in dismantle". **Note for the PR**: this is a correction of a factually wrong expectation, not a weakening — quote the old and new clause side-by-side in the PR body and cite Apple's `NSViewRepresentable.dismantleNSView(_:coordinator:)` documentation.

**Verify**: `grep -rn "lifetime is the representable" skills/` → no match; eval case 3 reruns green ×2.

### Step 2: Name the interop APIs

In `appkit-interop.md:33-44`, attach the owning API to each rule (initializer/`updateNSView(_:context:)` idempotence/`makeCoordinator()`/`sizeThatFits(_:nsView:context:)`), and in `:68-76` name `NSHostingView` vs `NSHostingController` (two-line choosing rule) and `sizingOptions` for intrinsic-size reporting. Keep prose rhythm; add names, not paragraphs.

**Verify**: `grep -c "makeNSView\|updateNSView\|makeCoordinator\|dismantleNSView\|sizeThatFits\|NSHostingView\|sizingOptions" skills/tailrocks-swift-best-practices/references/appkit-interop.md` → ≥6.

### Step 3: Add typed throws and the recovery protocol

In `errors-and-api.md` typed-failure section: a short subsection on `throws(E)` — when a single concrete error type is right (closed failure set at a module boundary), why a public escaping boundary may still choose `any Error`, interaction with `rethrows`/generic code; and one sentence naming `LocalizedError.errorDescription` / `failureReason` / `recoverySuggestion` as the conformance behind `:26-29`'s requirement.

**Verify**: `grep -n "throws(" skills/tailrocks-swift-best-practices/references/errors-and-api.md` → ≥1; `grep -n "LocalizedError" …` → 1.

### Step 4: Scope the observation claim and name the state APIs

In `swiftui.md:11-20`: attach the concrete API to each ownership rule (`@State` view-local, `@Binding` parent-owned, `@Observable` model, `@Environment` shared). Rewrite `:102-103`: the broad-invalidation failure is specific to `ObservableObject`/`@Published` (whole-object `objectWillChange`); the `@Observable` macro tracks per-property reads — the review question becomes "is this model still on the publisher-based protocol, and why?".

**Verify**: `grep -n "@Observable" skills/tailrocks-swift-best-practices/references/swiftui.md` → ≥2.

### Step 5: Accessibility authoring APIs; complete the elided name

In `accessibility.md:12-20`: name the SwiftUI authoring modifiers per semantic (`.accessibilityLabel(_:)`, `.accessibilityValue(_:)`, `.accessibilityAddTraits(_:)`, `.accessibilityIdentifier(_:)`, `.accessibilityElement(children:)`, `.accessibilityHidden(_:)`, `.accessibilityAction(named:_:)`), split SwiftUI *traits* from the AppKit *role* property (`NSAccessibilityProtocol` roles) in one sentence. Complete `:43` to `NSWorkspace.shared.accessibilityDisplayShouldDifferentiateWithoutColor`.

**Verify**: `grep -n "NSWorkspace\.…" skills/tailrocks-swift-best-practices/references/accessibility.md` → no match; `grep -c "accessibility" …/accessibility.md` increased only by API names (review diff).

### Step 6: Parallel-testing rule in concurrency.md

Add a short subsection: Swift Testing runs cases in parallel by default; suites touching main-actor-isolated UI state need `@MainActor` isolation or `.serialized`; name the failure signature (intermittent state bleed between cases). If plan 009 already landed its testing.md API subsection, cross-reference it; else keep this self-contained.

**Verify**: `grep -n "serialized" skills/tailrocks-swift-best-practices/references/concurrency.md` → ≥1.

### Step 7: Rerun evals

Full suite ×2 (incl. plan 004's added cases — the accessibility and work-in-`body` cases exercise steps 4-5's material).

## Test plan

- Eval rerun is the acceptance test.
- Optional (Mac): `swiftc -parse` a scratch file that uses every API name written in steps 2-5, so no misspelled symbol ships (the hardening pass probe-verified its API claims; hold the same bar).

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] "lifetime is the representable" absent repo-wide; corrected model in reference + router + eval
- [ ] Steps' greps all pass; no reference of this skill states a rule whose API it cannot name (spot-check the five files)
- [ ] Eval suite green ×2; PR body carries the case-3 correction rationale
- [ ] Only in-scope files modified; index row updated

## STOP conditions

- Excerpt mismatch vs live files.
- The case-3 rerun fails with the corrected expectation — the router sentence and the eval must be re-aligned; two failures = STOP and report both texts.
- A named API fails the `swiftc -parse` probe (misremembered symbol) — fix or drop the name; never ship an unverified spelling with a verified-looking citation.
- Anything requiring edits in swift-project-setup beyond reading (coordination case: plan 009 landed first and already edited `errors-and-api.md:45-46` — adapt, don't duplicate).

## Maintenance notes

- Step 1 changes a graded expectation; future eval archaeology should find the PR body's side-by-side quote — keep it verbose there.
- When Swift's default-isolation settings land in the setup templates (plan 009 step 3.6), `concurrency.md:86-94`'s checklist gains the setting names; these two plans converge on that file — second lander re-reads.
