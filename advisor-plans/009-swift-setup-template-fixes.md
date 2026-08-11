# Plan 009: Fix the swift-project-setup templates so scaffolded projects pass their own gates

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-swift-project-setup`
> On drift, compare excerpts before proceeding; meaning-level mismatch = STOP.
>
> **Environment**: most Verify gates need a Mac with the pinned toolchain
> (Xcode 26.6 lane per `references/toolchain.md`). Steps marked (Mac) are
> BLOCKED, not skipped, on other machines.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED (template changes were build-verified once by the hardening pass; every change here re-verifies on a scratch project)
- **Depends on**: 004 (eval rerun); independent of 005-008 except `swiftlint.yml`'s message fix (coordinate with 008's ownership language if concurrent)
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

The scaffolded baseline ships defects the skill's own prose forbids: the "full pull-request gate" runs UI tests that need a graphical session (so headless CI fails or the gate gets disabled); the mandated test-count assertion — the skill's own defense against its headline false-green trap — is not scaffolded; the `SWIFT_VERSION` replace-marker invites an invalid value; the force-operation "tests may force" exemption is stated in three files and implemented in none; and the gate task gives no ordering guarantee while two xcodebuild invocations share one derived-data path. Every project scaffolded from these templates inherits all of it.

## Current state

Paths relative to `skills/tailrocks-swift-project-setup/`. Verified at `64df333`.

**`templates/mise.toml`** (63 lines):
```toml
[tools]                       # :8-12 — markers on version pins
swiftlint = "<0.65.0>"
xcodegen = "<2.46.0>"
xcbeautify = "<3.2.1>"
periphery = "<3.8.0>"
…
[tasks.test]                  # :44-47 — runs ALL tests incl. UITests; no count assertion
run = "set -o pipefail && xcodebuild test -project $PROJECT -scheme $SCHEME -destination 'platform=macOS' -derivedDataPath $DERIVED_DATA | xcbeautify"
[tasks."build:next"]          # :49-52 — hardcoded beta path, no SDK proof
run = "set -o pipefail && DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer xcodebuild … -derivedDataPath $DERIVED_DATA-next build | xcbeautify"
[tasks.check]                 # :59-62 — parallel `depends`, shared $DERIVED_DATA
depends = ["format:check", "lint", "build", "test"]
run = "echo 'gates passed'"
```
Header `:2`: "Resolve current versions at execution time; the values below are examples." — vs `SKILL.md:19-25`: the same four versions are "the values this skill family verified on 2026-08-11 … record them as the committed baseline." The sibling `skills/tailrocks-rust-project-setup/templates/mise.toml` sequences its gate with a `run = [...]` array and uses bare pins.

**`templates/project.yml`** (95 lines):
```yaml
settings:
  base:
    SWIFT_VERSION: "<6.0>"        # :16 — marked for replacement; SKILL says "Replace marked project values" and names Swift 6.3 as current — but SWIFT_VERSION is the LANGUAGE MODE (4/4.2/5/6), not the compiler version
…
    ASSETCATALOG_COMPILER_APPICON_NAME: <AppIcon>   # :54 — no asset catalog exists anywhere in templates/ or the structure diagram
targets:
  <App>:
    sources:
      - path: Sources
        type: syncedFolder
    info:
      path: Sources/Info.plist   # :32-33 — generated plist inside the synced source folder
schemes:
  <App>:
    test:
      targets:
        - <App>Tests
        - <App>UITests           # :92-94 — one scheme, UI tests in the default test action
```
`references/testing.md:107-111` puts unit tests at pull-request tier and UI tests + accessibility audit at merge tier; `:113-118` says CI "cannot run the interactive parts without a graphical session and the Screen Recording, Accessibility, and Automation permissions." `SKILL.md:137` and `:170-171` require "a test-count assertion" (mechanism given nowhere; `references/testing.md:32-35` states the rule: "A gate that cannot distinguish 'all tests passed' from 'no tests ran' is not a gate"). `SKILL.md:48-49` orders `.gitignore` as scaffold step 2 with four entries, but `templates/` has no gitignore file and `SKILL.md:40` says "Copy from `templates/` rather than reconstructing policy."

**`templates/swiftlint.yml`** (122 lines):
```yaml
opt_in_rules:            # :19-65 — includes 9 layout rules …
  - attributes
  - closure_end_indentation
  - closure_spacing
  - collection_alignment
  - literal_expression_end_indentation
  - multiline_arguments
  - multiline_parameters
  - operator_usage_whitespace
  - vertical_parameter_alignment_on_call
disabled_rules:          # :67-70 — … while this comment says layout is swift-format's
  # swift-format owns layout. Leaving both to argue about it produces churn.
  - line_length
  - trailing_comma
# :72-77 — comment promises a test exemption that nothing implements
# Force operations are errors in application code. Tests may force where the
# failure IS the assertion.
force_cast: error
force_try: error
force_unwrapping: error
implicitly_unwrapped_optional: error     # :77 — bare-severity shorthand; this rule's config takes severity+mode keys — verify it parses
included: [Sources, Tests, UITests]      # :5-8 — so the "exemption" cannot exist
custom_rules:
  hardcoded_corner_radius:
    regex: "cornerRadius:\\s*[0-9]"      # :109 — misses `layer.cornerRadius = 12` and `.cornerRadius(12)`
    message: "… See the Liquid Glass rules."   # :110 — dangling pointer in a user's repo
```
`templates/swift-format.json` sets `lineLength: 100`, `respectsExistingLineBreaks: true`, `lineBreakBeforeEachArgument: false` — the formatter packs arguments; `multiline_arguments`/`multiline_parameters` reject partial-multiline: a `mise run format && mise run lint --strict` fixed point is not guaranteed.

**`references/toolchain.md:91-111`** — a second, already-drifted copy of the task set: its `test` omits `-derivedDataPath` (mandatory per `templates/mise.toml:47`, `references/testing.md:42,48-50`, `SKILL.md:158-161`), hardcodes `App` names, has no `[env]`, and omits `build:next`/`deadcode`/`check`.

**Prose gaps bound to these templates:** `references/toolchain.md:113-118` says to record concurrency-relevant build settings so a toolchain bump doesn't change diagnostics, but only `SWIFT_STRICT_CONCURRENCY: complete` is pinned and no setting is named (default isolation / approachable concurrency); `references/testing.md` never names a Swift Testing symbol (`@Test`, `@Suite`, `#expect`, `#require`, traits) though `SKILL.md:55-56` mandates "One Swift Testing unit test" (this prose half is plan 010's scope where it lives in swift-best-practices; the testing.md API-surface subsection belongs here).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Scratch scaffold (Mac) | copy templates to `~/scaffold-test/<App>` with markers filled, then `mise install && mise run generate && mise run check` | exit 0 |
| Lint fixed point (Mac) | `mise run format && mise run lint` on the scratch project incl. a long multi-arg call site | exit 0, no violations |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-swift-project-setup --case <id> --runs 2` | exit 0 |

## Scope

**In scope**:
- `templates/{mise.toml,project.yml,swiftlint.yml,swift-format.json}` (swift-format.json only if the step-2 fixed-point test demands a change)
- `templates/gitignore` (new), `templates/Tests.swiftlint.yml` (new nested config — final name per step 2)
- `references/{toolchain,lint-and-format,testing,project-generation}.md`
- `SKILL.md` (marker-instruction and templates-table lines only)

**Out of scope**:
- `references/agent-integration.md` (plan 008 owns it), evals content beyond reruns (004), all other skills, `scripts/`, CI.

## Git workflow

- Branch: `advisor/009-setup-template-fixes`; `git commit -s`; `fix(swift-project-setup): …`; PR via `gh pr create`.

## Steps

### Step 1: Split the test tiers and scaffold the count assertion

1. `templates/mise.toml`: change `[tasks.test]` to unit-only (`-skip-testing:<App>UITests`), add `[tasks."test:ui"]` (UI tests + note: needs GUI session and the three permissions), and add the count assertion to `[tasks.test]`: run with `-resultBundlePath $DERIVED_DATA/TestResults.xcresult` (delete stale bundle first), then a follow-up line reading `xcrun xcresulttool get test-results summary --path … --format json` and failing when `totalTestCount` < `$MIN_TESTS` (new `[env] MIN_TESTS = "2"` with a comment: raise as the suite grows; the scaffold ships 2 tests).
2. `[tasks.check]`: replace `depends` with an ordered `run = ["mise run format:check", "mise run lint", "mise run build", "mise run test"]` (the rust sibling's pattern), keeping the cheapest-first order from `references/lint-and-format.md:82-90`; add that ordering sentence as a comment.
3. `[tasks."build:next"]`: prefix with an existence check on the beta `DEVELOPER_DIR` and an SDK proof (`xcodebuild -version && xcodebuild -showsdks | grep -q macosx27`) so a missing/wrong toolchain fails loudly instead of building the shipping SDK twice. (Adjust the grep target to the current beta major at execution time.)
4. `references/testing.md:107-118`: name which task each tier invokes (`test` at PR, `test:ui` at merge); add a short "API surface" subsection naming `@Test`, `@Suite`, `#expect`, `#require`, `withKnownIssue`, `.disabled`, `.tags`, `.timeLimit`, `.serialized`, one paragraph on parallel-by-default vs `@MainActor`/`.serialized`, and that the selector's middle component (`AppTests/MathSuite/addsNumbers()`) is the suite type name. Verify each spelling against the pinned toolchain's docs before writing (Mac).
5. `references/toolchain.md:91-111`: delete the duplicated `[tasks]` block; replace with two lines of prose + a link to `templates/mise.toml`, keeping only the local/CI parity rule.

**Verify (Mac)**: scratch project — `mise run test` passes and prints the count check; temporarily rename the test file's `@Test` off and confirm `mise run test` **fails** on count, restore; `mise run check` runs the four gates in order (observe output order); `grep -n "derivedDataPath" skills/tailrocks-swift-project-setup/references/toolchain.md` → no stale task block.

### Step 2: Implement the test force-op exemption; reconcile layout rules

1. Add `templates/Tests.swiftlint.yml` — a nested config to copy into `Tests/` and `UITests/` re-scoping `force_cast`/`force_try`/`force_unwrapping`/`implicitly_unwrapped_optional` to `warning`; reference it from the templates table and from `references/lint-and-format.md:59-61` so prose and mechanism agree (also fix the same claim in `skills/tailrocks-swift-best-practices/references/errors-and-api.md:45-46` — one-sentence edit; this is the single allowed out-of-skill touch, coordinate with plan 010).
2. `swiftlint.yml:77`: expand `implicitly_unwrapped_optional` to nested form (`severity: error`, explicit `mode`) after confirming on the pinned SwiftLint whether the bare form parses — if it parses cleanly with no config warning, leave it and note that in the PR.
3. Layout conflict: on the scratch project, write one file with a long multi-argument call formatted by `mise run format`, then `mise run lint`. For every layout opt-in rule that fires on formatter output (`attributes`, `closure_end_indentation`, `closure_spacing`, `collection_alignment`, `literal_expression_end_indentation`, `multiline_arguments`, `multiline_parameters`, `operator_usage_whitespace`, `vertical_parameter_alignment_on_call`), move it to `disabled_rules` under the existing "swift-format owns layout" comment. Keep any that provably never conflict.
4. `swiftlint.yml:107-113`: widen the custom rule regex to `cornerRadius\s*[:=(]\s*[0-9]` plus an alternative for `cornerRadii`, and rewrite the message to be self-contained: "Derive the radius concentrically from the containing system surface; a numeric radius adjacent to a system container is a hard failure." (no cross-document pointer). Re-run swiftlint on a fixture containing all three spellings (`cornerRadius: 12`, `layer.cornerRadius = 12`, `.cornerRadius(12)`) — all three flagged, `…Tests…` path still excluded.

**Verify (Mac)**: format→lint fixed point holds (`mise run format && mise run lint` → exit 0 twice in a row); `swiftlint --strict` on a Swift Testing file containing `try!` inside `Tests/` → passes with the nested config, fails without it.

### Step 3: Fix the marker traps and ship the missing scaffold files

1. `project.yml:16`: change to `SWIFT_VERSION: "6"` (unmarked) with the comment: "Language mode, not the compiler version — legal values 4, 4.2, 5, 6. Do not write the Swift release (e.g. 6.3) here." Add the legal-values sentence to `references/toolchain.md`'s language-mode section (:113-118).
2. `templates/mise.toml:1-2` + `:8-12`: keep the `<…>` markers (they force resolve-at-execution, which matches the repo's latest-versions policy) but fix the contradiction: replace ":2 the values below are examples" with "Replace each `<pin>` with the latest stable version resolved now (`mise ls-remote <tool>` or the registry); the bracketed values are the 2026-08-11 verified baseline, shown so you can detect a registry regression. Never scaffold with older versions." Make `SKILL.md`'s marker instruction (:67 area) say version markers are resolved-then-unbracketed, not copied.
3. Add `templates/gitignore` with the four entries `SKILL.md:48-49` names (read the live SKILL.md list and copy exactly), add it to the templates table (`SKILL.md:58-65`).
4. `project.yml:54`: either ship `templates/Assets.xcassets/AppIcon.appiconset/Contents.json` (minimal empty icon set) and add it to the structure diagram in `references/project-generation.md:100-118`, or comment the setting `# inert until an asset catalog exists — see the icon pipeline decision in advisor-plans/013`. Choose the comment unless plan 013's icon decision already landed.
5. `project.yml:32-33`: move the plist out of the synced source tree — `info.path: Supporting/Info.plist` — and update the structure diagram. **First verify the defect on the scratch build** (Mac): `ls <DerivedData>/…/<App>.app/Contents/Resources/ | grep Info.plist` — if the synced folder does *not* duplicate the plist into Resources, skip this item and record "not reproducible on XcodeGen <version>/Xcode <version>" in the PR.
6. Pin the concurrency settings `references/toolchain.md:113-118` alludes to: on the pinned Xcode, read the current names (default isolation / approachable concurrency — e.g. `SWIFT_DEFAULT_ACTOR_ISOLATION`, `SWIFT_APPROACHABLE_CONCURRENCY`; confirm exact spellings in the Xcode build-settings reference before writing), add them to `project.yml` `settings.base` with a one-line comment each stating the chosen value and why, and name them in `references/toolchain.md` and in `skills/tailrocks-swift-best-practices/references/concurrency.md:86-94`'s "confirm the settings" list (second allowed out-of-skill touch — one line, coordinate with plan 010).

**Verify (Mac)**: `xcodegen generate` on the scratch copy → exit 0; full `mise run check` → exit 0; `grep -n "SWIFT_VERSION" skills/tailrocks-swift-project-setup/templates/project.yml` → `"6"` unmarked with the comment.

### Step 4: Rerun evals

Full swift-project-setup suite ×2 (post-004 cases include the freshness-gate and parity cases whose expectations these steps satisfy).

**Verify**: all green; record in PR body.

## Test plan

- The scratch-project scaffold (step 1/2/3 verifies) is the integration test — it re-runs the W3 hardening exercise against the changed templates. Keep the scratch project outside the repo (`~/scaffold-test/`), never commit it.
- Negative tests: count-assertion failure (step 1), `try!`-in-tests with/without nested config (step 2), three-spelling corner-radius fixture (step 2).
- Eval rerun (step 4).

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] Scratch project: `mise install`, `mise run generate`, `mise run check` all exit 0; `mise run test` fails when the test count drops below `MIN_TESTS`
- [ ] `mise run format && mise run lint` reaches a fixed point (run twice, second run clean)
- [ ] `templates/gitignore` + `templates/Tests.swiftlint.yml` exist and are in the templates table
- [ ] No `<…>` marker remains that a legal substitution would break (`SWIFT_VERSION` unmarked; version pins carry the resolve instruction)
- [ ] `swiftlint.yml` custom rule catches all three radius spellings; message self-contained
- [ ] toolchain.md has no duplicated task block
- [ ] Eval suite green ×2; only in-scope files modified; index row updated

## STOP conditions

- No Mac with the pinned toolchain lane available → complete the text-only items (3.1-3.4, marker prose, gitignore, message rewrite), mark every (Mac) verify BLOCKED in the index with the machine requirement; do not claim the build-verified state.
- The layout-rule test (step 2.3) shows swift-format output that *violates a non-layout rule* — that's a formatter-config question; report, don't loosen non-layout rules.
- The concurrency build-setting names cannot be confirmed on the pinned Xcode — write nothing speculative; record the item BLOCKED (a wrong setting name silently pins nothing).
- Scheme/scheme-split alternative (separate `<App>-UI` scheme) turns out to be needed because `-skip-testing` doesn't compose with the single scheme — allowed, but note the deviation in the PR.

## Maintenance notes

- The `MIN_TESTS` floor is deliberately low (2); the code-health skill's monotonic-contract machinery is the right home for ratcheting it — out of scope here.
- When macOS 27 ships GA, `build:next`'s SDK grep target and the toolchain tables change together — plan 013's staleness gate ages the dated rows.
- Reviewer scrutiny: the mise `check` ordering change swaps parallel `depends` for sequential `run` — confirm no task relies on the previous dedup behavior (`generate` now runs inside `build` and `test` both; mise dedups within one invocation — verify on the scratch run that generate executes twice at most harmlessly).
