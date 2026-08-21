# Implementation record — ConnectionsBoard (2026-08-11)

Scratch app outside the repo (session scratchpad `w6/ConnectionsBoard`),
generated from the swift-project-setup templates (post-W3 fix). Sources:
`ConnectionsBoardApp.swift`, `Model.swift`, `WorkspaceView.swift`, unit tests
(Swift Testing) and one XCTest UI test with the scoped accessibility audit.

Structure follows the component map exactly: `NavigationSplitView` sidebar
`List`, sessions `Table`, `.inspector`, toolbar `Refresh` (primary action) +
`Inspector` toggle, menu-bar commands for every toolbar and cluster action
(View ▸ Refresh Sessions ⌘R, Show/Hide Inspector ⌘⌥I, Pause Live Feed ⌘P,
Clear Feed; Session ▸ Terminate ⌘⌫ with confirmation dialog), and the one
CUSTOM region: `LiveFeedCluster` — two `Glass.regular` surfaces in one
`GlassEffectContainer(spacing: 20)` with inner spacing 10, untinted, capsule
shapes, `Glass.identity` + opaque capsule under Reduce Transparency, symbol +
label state (never color alone).

Verification affordances (environment-driven, user settings untouched):
`CB_STATE` fixture scenarios, `CB_APPEARANCE` per-app appearance override,
`CB_FRAME` window sizing, `.canJoinAllSpaces` for busy-Space automation.

## Stalls and defects → skill commits

Every stall in the dogfood run was treated as a skill defect:

| # | Stall / defect | Where it bit | Skill fix (commit) |
|---|---|---|---|
| 1 | Test targets fail signing without `GENERATE_INFOPLIST_FILE` | first `mise run test` in W3 and again here | `templates/project.yml` (W3 commit a7574db) |
| 2 | Unscoped `performAccessibilityAudit` fails on system menu-bar/screen elements | first audit run | scoped issue-handler in `testing.md` + `interaction.md` (a7574db) |
| 3 | App foreground with zero AX windows when the user works on another Space | repeated UI-test failures | `.canJoinAllSpaces` mitigation documented in `interaction.md` (a7574db); applied here via `.onAppear` — note the AppDelegate's `applicationDidFinishLaunching` is too early, windows do not exist yet |
| 4 | Audit finding: container elements (Table, sidebar List) carried identifiers but no labels | ConnectionsBoard audit run | real accessibility fix in the app; the identifier-vs-label distinction was already documented in `accessibility.md` — no prose change needed |
| 5 | Brief predicted the inspector "auto-collapses" at minimum width; the platform presents it as a system overlay instead | minimum-width capture | brief corrected (native behavior wins over a written prediction); no skill defect — the skills' own rule resolved the conflict |

Defect 5 is the interesting one: the dogfood exercised the source-of-truth
order end-to-end — implementation surfaced platform behavior that overrode a
design assumption, and the correction flowed back into the design artifact.
That is the loop the family is built around: the running app outranks any
written or drawn prediction of it, and the artifact is what gets corrected.
