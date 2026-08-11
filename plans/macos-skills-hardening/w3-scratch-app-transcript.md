# W3 — Scratch app exercise transcript (2026-08-11)

Scratch project: `GlassProbe`, generated outside the repo (session scratchpad)
from `tailrocks-swift-project-setup/templates/project.yml` +
`templates/mise.toml`, with `tailrocks-macos-visual-qa/templates/capture.sh`
and `window-id.swift` copied into `Scripts/`. Host: macOS 26.5.2, Xcode 26.6,
SDK 26.5. GUI session with Screen Recording, Accessibility, and Automation
granted (all exercised below).

## Steps and outcomes

1. **Template instantiation** — all `<marked>` values replaced; no residue.
2. **Tool pins** — `mise install` succeeded; every template pin is the current
   latest release verified via GitHub this session (swiftlint 0.65.0,
   xcodegen 2.46.0, xcbeautify 3.2.1, periphery 3.8.0).
3. **`xcodegen generate`** — "Created project … GlassProbe.xcodeproj".
4. **`mise run build`** — first run FAILED at test-target signing:
   "Cannot code sign because the target does not have an Info.plist file…".
   **Template defect → fixed**: `GENERATE_INFOPLIST_FILE: YES` added to both
   test targets in `templates/project.yml`. Regenerated → "Build Succeeded"
   (8.23s).
5. **`mise run test`** — unit suite (Swift Testing `MathSuite`) passed from
   the first complete run. UI target initially failed two ways, both
   converted into skill fixes:
   - `performAccessibilityAudit` unscoped fails on ANY app: the audit flags
     the system menu bar and screen containers ("Element has no description",
     element screenshots confirm) which the app cannot label. Fix recorded in
     `testing.md` and `interaction.md`: issue-handler scoping to app-owned
     (identifier-bearing) elements.
   - With the machine in active use on another Space, the app reports
     foreground with **zero windows** (tree dump: `windows=0 state=4`,
     menu bar only) — live confirmation of the build-and-launch.md claim.
     Mitigation recorded in `interaction.md`: app-side `.canJoinAllSpaces`
     for verification targets.
   Final full run: `mise run test` exit 0 — MathSuite passed,
   `AccessibilityAuditTests` passed including the scoped audit
   ("Executed 1 test, with 0 failures").
6. **`-only-testing` empirical check (Xcode 26.6)** — without trailing
   parentheses: "Executed 0 tests" + "** TEST SUCCEEDED **" (exit 0); with
   `addsNumbers()`: MathSuite ran and passed. Confirms the silent-failure
   trap exactly as documented.
7. **Launch + capture** — `capture.sh` compiled `window-id`, killed, launched
   from `$HOME/Library/Developer/AppBuild/...` (not /tmp), resolved the
   window ID, `screencapture -x -o -l` wrote `shot.png` (64.1K), exit 0.
8. **PNG inspected** (not merely written): correct GlassProbe window — native
   title bar, glass toolbar capsule with the Ping item trailing, centered
   content ("GlassProbe / Count: 0 / Increment"). Audit element screenshots
   were also visually inspected to identify the flagged system elements.

## Template/skill changes traced to failures

| Failure | Fix |
|---|---|
| Test-target signing failure | `templates/project.yml`: `GENERATE_INFOPLIST_FILE: YES` on `<App>Tests` and `<App>UITests` |
| Unscoped audit fails on system elements | scoped issue-handler added to `testing.md` and `interaction.md` samples |
| Zero-window automation flake on busy Spaces | `.canJoinAllSpaces` mitigation documented in `interaction.md` |
