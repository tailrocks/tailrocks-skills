# W1 — Citation ledger (verified 2026-08-11)

Method: API signatures and availability were proven by `swiftc` probes against
the local macOS 26.5 SDK (Xcode 26.6) — the compiler's availability diagnostics
are Apple's own SDK annotations. Claims about the macOS 27 beta SDK, HIG
sentences, and doc prose were verified against the DocC JSON API
(`developer.apple.com/tutorials/data/<path>.json`) with `metadata.platforms`
as the availability source, plus Apple's release-notes pages and, where
Apple ships no document, corroborating primary reporting. Every row is
VERIFIED (claim stands, source cited), CORRECTED (file edited this session to
the sourced value), or DELETED (no sourced replacement existed).

Probe artifacts: scratchpad `w1/probe-*.swift`, `w1/neg.sh` (17 negative
probes), Landmarks sample zip (SHA-checked download from Apple).

Statuses: none unresolved.

## tailrocks-liquid-glass

### platform-baseline.md

| Claim | Source | Status |
|---|---|---|
| Latest shipping macOS 26.6.1 "Tahoe"; macOS 27 "Golden Gate" beta "coming this fall"; Xcode 26.6 / Swift 6.3 / SDK 26.5 / host 26.2+; Xcode 27 beta / Swift 6.4 / SDK 27 / host 26.4+; Apple-silicon-only; ARCHS_STANDARD drop; back-deploy macOS 12 | see `w2-version-verification.md` (13 rows, all Apple sources) | VERIFIED |
| `NSScrollEdgeEffectStyle` macOS 26.1, not 26.0 | swiftc probe: "only available in macOS 26.1 or newer" (SDK 26.5) | VERIFIED |
| `NSTitlebarAccessoryViewController.preferredScrollEdgeEffectStyle` macOS 26.1 | swiftc probe (26.1 diagnostic) + DocC appkit/nstitlebaraccessoryviewcontroller/preferredscrolledgeeffectstyle | VERIFIED |
| SwiftUI `ToolbarContent.visibilityPriority(_:)` macOS 26.1 | DocC swiftui/toolbarcontent/visibilitypriority(_:) — macOS 26.1, all other platforms 27.0 beta; **absent from SDK 26.5** (probe: "cannot find ToolbarItemVisibilityPriority in scope") | CORRECTED — noted 27-beta-SDK-only compile requirement in both files |
| Glass symbols in 26.x all introduced at 26.0 except the three 26.1 items | every glass probe emitted 26.0 except the two 26.1 AppKit symbols; visibilityPriority 26.1 per DocC | VERIFIED |
| macOS 26.4 fixed non-opaque-window glass backdrop while inactive | macos-26_4-release-notes DocC: "Fixed: On macOS, a non-opaque window that hosts glass content will correctly update the backdrop content behind the glass even if the window is inactive. (166828089)" | VERIFIED |
| 26.1 Appearance ▸ Liquid Glass Clear/Tinted setting; tinted increases opacity | macOS Tahoe 26.1 coverage (MacRumors 2025-11-03, OS X Daily) — System Settings ▸ Appearance ▸ Liquid Glass, Clear default / "Tinted increases opacity and adds more contrast" | VERIFIED |
| No API reads the Clear/Tinted setting; no `glassLook`/`liquidGlassAppearance`/`prefersTintedGlass` | negative probe n15 (no member on NSWorkspace); no such symbols resolve in SDK 26.5; no DocC page exists | VERIFIED |
| `Glass.regular`/`Glass.clear` author-side variants, exist 26.0 | positive probes p003/p004 | VERIFIED |
| macOS 27 additions table (`effectIsInteractive`, `cornerConfiguration`, `NSViewCornerRadius`, `effectiveCornerRadii`, `concentricCornerRadii`, `NSToolbarItemGroup.role`, `NSSegmentedControlRole.tabs`, `toolbarMinimizationBehavior`) | negative probes n06/n07/n08/n13/n14/n17 — all absent from SDK 26.5; macOS 27 release notes name `.tabs`/`TabsPickerStyle` | VERIFIED |
| Titlebar accessory draws outside bounds by default, affects apps linked against macOS 26 | macos-27-release-notes: "When an app is linked on macOS 26.0 or later, NSTitlebarAccessoryViewController is now allowed to draw outside its bounds by default…" (180962967) | VERIFIED |
| NSMenu hides menu item symbol images by default on 27; opt back in with `labelStyle(_:)`/`.titleAndIcon` | macos-27-release-notes, quoted verbatim | VERIFIED |
| macOS 27 no-recompile design changes: uniform toolbars, edge-to-edge sidebars, tighter corner radius, ultraclear→tinted slider, no read API | WWDC26 coverage (wccftech, aninews, thearvex — unified toolbar, sidebar to window edge, tighter corner radius, global glass slider); no slider API resolves in any SDK | VERIFIED |
| `UIDesignRequiresCompatibility` Boolean, `UI` prefix on macOS, iOS/iPadOS/macOS/tvOS 26.0; ignored when built against 27 SDK; support being removed | DocC bundleresources/…/uidesignrequirescompatibility (availability table + "The system ignores this key when you build for … macOS 27 or later"); WWDC25 SotU "We intend this option to be removed in the next major release" | VERIFIED |
| `glassBackgroundEffect` visionOS-only; `toolbarOverflowMenu`/`topBarPinnedTrailing` no macOS; UIKit `cornerConfiguration` iOS-only; no `prominentGlass`/`clearGlass` on AppKit; no Dynamic Type on macOS | negative probes n02/n04/n05/n08/n09/n10; HIG typography "macOS doesn't support Dynamic Type." | VERIFIED |
| `tabBarMinimizeBehavior` declares macOS 26.0 availability but treat as iOS behavior | probe n16 — compiles on macOS (declared); Adopting guide frames it as tab-bar (iOS) guidance | VERIFIED |

### swiftui-api.md

| Claim | Source | Status |
|---|---|---|
| `glassEffect(_:in:)` declaration + defaults, macOS 26.0; no `isEnabled:` overload | DocC swiftui/view/glasseffect(_:in:) (declaration verbatim) + probes p001/p002; negative n01 | VERIFIED |
| Material fills frame including padding | same page: "the material fills the entirety of the Text frame, which includes the padding" | VERIFIED |
| Modifier-order quote | swiftui/applying-liquid-glass-to-custom-views, verbatim | VERIFIED |
| `Glass` members table (.regular/.clear/.identity/tint/interactive), `DefaultGlassEffectShape` capsule | probes p003–p008; DocC "The default shape applied by glass effects, a capsule." | VERIFIED |
| `GlassEffectContainer` init, `glassEffectID`, `glassEffectUnion`, `glassEffectTransition` + no `isEnabled:`; `GlassEffectTransition` members | probes p009–p014; negative n11 | VERIFIED |
| Four container blockquotes | applying-liquid-glass-to-custom-views, all verbatim | VERIFIED |
| glassEffectUnion semantics | same page ("combines all effects with a similar shape, Liquid Glass effect, and ID into a single shape") | VERIFIED |
| Button styles .glass/.glassProminent/.glass(_:) 26.0 | probes p015–p017 | VERIFIED |
| Hover defect fixed in 27 | macos-27-release-notes: "Fixed: In macOS, buttons using the .glass and .glassProminent styles don't display a hover state when used outside of a toolbar. (158800693)" | VERIFIED |
| Scroll edge modifiers + style members + hard/soft descriptions | probes p018–p020; DocC scrolledgeeffectstyle (descriptions verbatim) | VERIFIED |
| `backgroundExtensionEffect()` behavior, discretion quote, clipping, placement rules | probes p021/p022; DocC view/backgroundextensioneffect(); quote extended to Apple's full sentence | CORRECTED (quote completed) |
| `safeAreaBar` | probe p023 + DocC — two overloads (HorizontalEdge and VerticalEdge); file documented only one | CORRECTED (both overloads now shown) |
| Toolbar table (ToolbarSpacer + platforms, SpacerSizing, sharedBackgroundVisibility, DefaultToolbarItem, hidden 15.0) | probes p024–p027 + DocC toolbarspacer (no tvOS/watchOS/visionOS) | VERIFIED |
| `visibilityPriority` row | as in platform-baseline | CORRECTED (SDK caveat + declaration added) |
| `toolbarMinimizationBehavior` 27 beta; `toolbarOverflowMenu`/`topBarPinnedTrailing` no macOS | negatives n04/n05/n06 | VERIFIED |
| Concentric shapes: `.rect(corner:.containerConcentric)` not SwiftUI; `ConcentricRectangle` inits; `Edge.Corner.Style` members incl. literals; `containerShape(some RoundedRectangularShape)` | negative n03; probes p029–p035; DocC concentricrectangle (three quotes verbatim, isUniform semantics) | VERIFIED |
| Presentations/windows table | probes p036–p042: presentationBackground(+Interaction) 13.3, containerBackground 14.0, windowToolbarStyle 11.0, MenuBarExtra ≤13.0 | CORRECTED — `.plain` is macOS 15.0 and `ContainerBackgroundPlacement.window` is macOS 15.0 (both had been folded under older rows) |
| Landmarks sample: native macOS target, `SUPPORTS_MACCATALYST = NO`, deployment 26.0, refreshed June 2026, four articles, exact glass API surface used | sample zip downloaded from Apple (docs-assets…LandmarksBuildingAnAppWithLiquidGlass.zip): pbxproj shows SUPPORTS_MACCATALYST = NO, MACOSX_DEPLOYMENT_TARGET = 26.0; all zip entries dated 2026-06; grep of sources matches the claimed API list exactly (incl. `.tint(.clear)`, no glassEffectUnion/Transition/scrollEdge/safeAreaBar/ConcentricRectangle/NSGlassEffect*) | VERIFIED |

### appkit-api.md

| Claim | Source | Status |
|---|---|---|
| No AppKit glass sample; Adopting guide has four listings, none AppKit | NSGlassEffectView DocC page: 0 sample references; AppKit framework page: no sample-code topic; adopting-liquid-glass JSON: exactly 4 codeListings (2 SwiftUI, 2 UIKit) | VERIFIED |
| `NSGlassEffectView` members + Style + 26.0; `effectIsInteractive` 27 beta | probe a01 (all 26.0), negative n07 | VERIFIED |
| No concentric-corner API in AppKit 26; `cornerConfiguration` 27 | negative n08 | VERIFIED |
| No interactive glass on AppKit 26 | negative n07 + no equivalent symbol in SDK | VERIFIED |
| `NSGlassEffectContainerView` members, merge mechanism, performance quote | probe a02; DocC nsglasseffectcontainerview — abstract and "reducing the number of passes" quote verbatim | VERIFIED |
| `NSBackgroundExtensionView` members 26.0 | probe a03 | VERIFIED |
| `BezelStyle.glass` 26.0; no prominentGlass/clearGlass; `extraLarge` 26.0; `prefersCompactControlSizeMetrics` 26.0 + macOS 15 compat wording | probes a04–a06, negatives n09/n10; DocC nsview/preferscompactcontrolsizemetrics abstract verbatim | VERIFIED |
| Toolbar item style/prominent/backgroundTintColor 26.0; spacers; `isHidden` (macOS 15.0); 27-beta group/segment roles | probes a07/a08, negatives n13/n14 | VERIFIED |
| Scroll edge availability 26.1 + `.softStyle` snippet | probes a09/a10 (26.1 diagnostics); DocC preferredscrolledgeeffectstyle page shows `NSScrollEdgeEffectStyle.softStyle` snippet | VERIFIED |
| `NSScrollView` no-visible-scrollers fix in 27 | macos-27-release-notes (159019809), verbatim | VERIFIED |
| Split view: inspector init availability | probe: "only available in macOS 11.0 or newer" | CORRECTED — was "(macOS 14)", now macOS 11.0 |
| 26.0 split accessories | probe a11 (26.0 diagnostics) | VERIFIED |
| Remove custom backgrounds from NSToolbar/NSSplitView | adopting-liquid-glass names both under the custom-backgrounds warning | VERIFIED |
| Windows: no new NSWindow glass/corner API in 26; 27 uniform radius; titlebar-accessory 27 change; `disableScreenCornerInteractions` 27 | negative n12; release notes + WWDC26 coverage | VERIFIED |
| NSWorkspace accessibility flags; high-contrast appearance names; materials/blending | probes a12–a14 | VERIFIED |
| No appearance/flag exposes Clear/Tinted | negative n15 + doc absence | VERIFIED |
| Popover: remove NSVisualEffectView from content view | adopting-liquid-glass "Audit the backgrounds of sheets and popovers…remove those custom background views" | VERIFIED |
| W5 worked patterns (4 code blocks) | compiled from the file verbatim, `swiftc -c -target arm64-apple-macos26.0`, SDK 26.5 | VERIFIED |

### layer-model.md

| Claim | Source | Status |
|---|---|---|
| Materials content-layer rule + transient exception | HIG materials, verbatim | VERIFIED |
| Adopting ▸ Navigation quote | adopting-liquid-glass, verbatim | VERIFIED |
| Extend content beneath sidebars/inspectors; check safe areas | adopting-liquid-glass ("Extend content beneath sidebars and inspectors", "Check content safe areas for sidebars and inspectors…") + HIG sidebars background-extension passage | VERIFIED |
| HIG Layout quotes (differentiate controls; extend content; bottom-of-window; camera housing + `NSPrefersDisplaySafeAreaCompatibilityMode`) | HIG layout, all verbatim | VERIFIED |
| Scroll edge quotes (decorative, one-per-view, prefer automatic) | HIG scroll-views | CORRECTED — two truncated quotes completed ("to maintain alignment", "…in a variety of contexts", ellipsis added) |
| Regular/Clear variant guidance + 35% dimming | HIG materials, verbatim | VERIFIED |
| HIG Color quotes (no inherent color; smaller/larger elements; apply sparingly; light+dark colors; no hard-coded values) | HIG color, all verbatim | VERIFIED |
| Toolbars: one primary action trailing prominent; label-vs-content color | HIG toolbars, verbatim | VERIFIED |
| Menu-bar command; no bezel; system overflow menu | HIG toolbars, verbatim | VERIFIED |
| Sidebar accent color / sizes / bottom warning | HIG sidebars, verbatim | VERIFIED |
| Window main/key/inactive | HIG windows | CORRECTED — "do not use materials" → "do not use vibrancy" per Apple's wording |
| Avoid custom window UI | HIG windows, verbatim | VERIFIED |
| Type scale Large Title 26/32, Caption 10/13, SF Pro; no Dynamic Type; NSFont dynamic variants | HIG typography (26/32, Caption 2 10/13, "SF Pro is the system font in macOS", "macOS doesn't support Dynamic Type"); NSFont probe compiles | VERIFIED |
| 26.0 surrounding changes (metrics grew; title-style headers; grouped forms; rounder corners; sheet/popover audit) | prefersCompactControlSizeMetrics doc; adopting-liquid-glass ("Windows adopt rounder corners…", sheets/popovers audit quote, generic capitalization/grouped-forms items) | VERIFIED |

### anti-patterns.md

| Claim | Source | Status |
|---|---|---|
| #1 rule quote + exception | HIG materials, verbatim | VERIFIED |
| #2 rule quote (overcrowding/layering) | adopting-liquid-glass: "avoid overcrowding or layering Liquid Glass elements on top of each other" | VERIFIED |
| #3 rule quotes | first quote verbatim (adopting); second quote "Reduce the use of toolbar backgrounds and tinted controls" — no Apple source found anywhere | CORRECTED — replaced with Apple's verbatim "Reduce your use of custom backgrounds in controls and navigation elements." |
| #4 ConcentricRectangle quote + custom-component concentric quote | DocC concentricrectangle + HIG toolbars ("If you need to create a custom component, ensure that its corner radius is also concentric with the bar's corners.") | VERIFIED |
| #5 color quotes | HIG color + HIG toolbars, verbatim | VERIFIED |
| #6 accessibility-testing quote + motion wording | adopting-liquid-glass ("Ensure you test your app's custom elements, colors, and animations with different configurations of these settings."); HIG-motion-derived reduced-motion phrasing | VERIFIED |
| #7 performance quotes | applying-liquid-glass-to-custom-views: "Creating too many Liquid Glass effect containers and applying too many effects to views outside of containers can degrade performance." + container quote; AppKit pass-reduction quote | VERIFIED |
| #8 availability list | probes/negatives as above; HIG typography; HIG toolbars | VERIFIED |
| #9 modifier order + overlay ordering | applying-liquid-glass + Landmarks background-extension article behavior | VERIFIED |
| #10 compatibility quote | DocC key page | CORRECTED — quote completed with "for the design in the latest SDKs." |
| Performance framing: no numeric budget published; "Limit the use of Liquid Glass effects onscreen at the same time." | no Apple numeric budget exists in any fetched doc; limit sentence now quoted verbatim from applying-liquid-glass | CORRECTED (wording aligned to Apple's sentence) |

### verification.md

| Claim | Source | Status |
|---|---|---|
| Axis read APIs (colorScheme, colorSchemeContrast, accessibilityReduceTransparency/Motion/DifferentiateWithoutColor, NSWorkspace flags, NSColor.controlAccentColor/selectedContentBackgroundColor/keyboardFocusIndicatorColor, NSAppearance high-contrast names) | probe-envs + probes a12/a13 all compile | VERIFIED |
| `accessibilityPrefersCrossFadeTransitions` as macOS read API | probe: not a macOS SwiftUI environment key (iOS-family only) | DELETED — removed from axis 9 |
| Axis 13 inactive-window wording | HIG windows (vibrancy) | CORRECTED |
| Axis 22 hover caveat | macos-27-release-notes fix entry | VERIFIED |
| Clear/Tinted axes (4/5/6) no read API; 26.1 setting; 27 slider | as platform-baseline rows | VERIFIED |
| 35% dimming (axis 17), system overflow (axis 19), menu-bar command / accessibility label hard failures | HIG materials/toolbars; accessibility-label rule is skill-voice policy (not attributed to Apple) | VERIFIED |

## tailrocks-swift-best-practices

| Claim | Source | Status |
|---|---|---|
| concurrency.md: continuation double-resume/no-resume semantics | Swift stdlib docs: UnsafeContinuation misuse is undefined behavior; CheckedContinuation traps on double-resume and logs a leaked continuation | CORRECTED — file had called both "undefined behavior"; now distinguishes checked vs unsafe |
| concurrency.md: default-isolation / approachable-concurrency modes exist and moved across releases | Swift 6.2 release notes (defaultIsolation, approachable concurrency build settings) | VERIFIED |
| swiftui.md: macOS 26 grew control metrics | DocC nsview/preferscompactcontrolsizemetrics ("compact metrics compatible with macOS 15.0 and earlier") | VERIFIED |
| swiftui.md: inactive-window wording | HIG windows (vibrancy, not materials) | CORRECTED |
| swiftui.md: every toolbar action needs a menu-bar command | HIG toolbars, verbatim | VERIFIED |
| swiftui.md: no supported headless preview-to-image path; glass does not render in detached snapshots | no Apple API exists; pointfreeco/swift-snapshot-testing issue #1029 "snapshot containing SwiftUI liquid glass effect is fully transparent" | VERIFIED |
| accessibility.md: label required on icon-only controls (Apple's rule) | HIG accessibility ("label interface elements appropriately", Voice Control/VoiceOver guidance) | VERIFIED |
| accessibility.md: settings table read APIs | probe-envs.swift — all environment keys and NSWorkspace flags compile; `accessibilityPrefersCrossFadeTransitions` does NOT exist on macOS | CORRECTED — replaced with NSWorkspace reduce-motion flag |
| accessibility.md: dynamic-type audit on macOS | probe: `XCUIAccessibilityAuditType.dynamicType` has no member on macOS; DocC dynamictype page lists no macOS | CORRECTED — "no dynamic-type audit to exclude on macOS" |
| accessibility.md: no Dynamic Type on macOS | HIG typography, verbatim | VERIFIED |
| appkit-interop.md: AppKit main-actor bound; glass content inside contentView; popover background removal; no concentric API before 27 | AppKit @MainActor annotations; DocC NSGlassEffectView; adopting-liquid-glass; negatives n08 | VERIFIED |
| appkit-interop.md: environment values do not cross NSHostingView boundary automatically | SwiftUI documented behavior (environment propagates within SwiftUI hierarchies; hosting requires explicit injection) | VERIFIED |
| errors-and-api.md: availability example | previous example assigned to read-only 27-beta `cornerConfiguration` (DocC shows `{ get }`) and used a non-existent factory | CORRECTED — replaced with the compiled macOS 26.1 scroll-edge guard |
| errors-and-api.md: os.Logger non-constant values private by default | Apple unified-logging documentation (dynamic strings redacted unless marked public) | VERIFIED |
| errors-and-api.md: docs render newest SDK declarations | Apple doc behavior, demonstrated by visibilityPriority (26.1 metadata, absent from SDK 26.5) | VERIFIED |

## tailrocks-swift-project-setup

| Claim | Source | Status |
|---|---|---|
| toolchain.md version tables | `w2-version-verification.md` | VERIFIED (W2) |
| lint-and-format.md: swift-format bundled since Xcode 16/Swift 6; xcrun invocation | `xcrun swift-format --version` → 6.3.0 on Xcode 26.6 (this session); Swift.org swift-format ships in toolchain | VERIFIED |
| lint-and-format.md: without `--strict` lint prints violations and exits 0 | empirical this session: violating file → 6 warnings, exit 0; `--strict` → exit 1 | VERIFIED |
| lint-and-format.md: `.swift-format` JSON config, `dump-configuration` | ran `xcrun swift-format dump-configuration` this session | VERIFIED |
| lint-and-format.md / interaction.md: no HIG linter, no Liquid Glass linter | negative claim; no such tool exists from Apple or community (searches this session surfaced none) | VERIFIED |
| project-generation.md: SwiftPM cannot produce an app bundle; no evolution proposal | Package.swift product types (library/executable/plugin); no accepted SE proposal for app bundles | VERIFIED |
| project-generation.md: xcodegen syncedFolder manifest generates and builds | empirical (W3): template generated GlassProbe.xcodeproj, built "Build Succeeded" via mise task | VERIFIED — template gained `GENERATE_INFOPLIST_FILE: YES` on test targets after the test build failed at signing (defect found and fixed in W3) |
| project-generation.md: ad-hoc signing sufficient locally | empirical: CODE_SIGN_IDENTITY "-" built, launched, captured | VERIFIED |
| testing.md: Swift Testing replaces XCTest for unit tests only; UI automation needs XCTest | Apple Swift Testing migration doc (no UI automation or performance APIs); empirical: XCTest UI target drove the app | VERIFIED |
| testing.md / interaction.md: `-only-testing` exact identifier; Swift Testing functions need trailing parentheses; omission = 0 tests + exit success | empirical this session (Xcode 26.6): without `()` → "Executed 0 tests" + "** TEST SUCCEEDED **" exit 0; with `()` → MathSuite ran and passed | VERIFIED |
| testing.md: dynamic-type audit wording | as accessibility.md | CORRECTED |
| testing.md: performAccessibilityAudit macOS 14+, four macOS-relevant audit types | DocC (macOS 14.0+, default .all) + probes | VERIFIED |
| mise.toml template pins are current | gh releases/latest this session: swiftlint 0.65.0, xcodegen 2.46.0, xcbeautify 3.2.1, periphery 3.8.0 — all exactly the template values | VERIFIED |
| agent-integration.md: Xcode bridge exposes build/file/preview tools, no screenshots/automation; export undocumented; exported set contains no Liquid Glass and no macOS skill | Xcode Intelligence documentation + W8 survey (anthropics/skills also lacks both) | VERIFIED |
| agent-integration.md: skills-evaluation study | SkillsBench, arXiv 2602.12670 — +16.6pp average, negative deltas on strong-prior tasks, self-generated no benefit | VERIFIED |
| agent-integration.md: skill-corpus security study (~quarter vulnerable; bundled scripts riskier) | arXiv 2601.10338 — 26.1% of 42,447 skills with ≥1 vulnerability pattern; script-bundling skills 2.12× likelier | VERIFIED |
| agent-integration.md: W8 external-skill ledger rows | each URL HTTP 200 + license read from GitHub API / raw LICENSE this session (see W8 row) | VERIFIED |

## tailrocks-macos-visual-qa

| Claim | Source | Status |
|---|---|---|
| build-and-launch.md: xcodebuild invocations, pipefail, xcbeautify | empirical (W3 build/test transcripts) | VERIFIED |
| build-and-launch.md: xcpretty dormant, cannot parse Swift Testing output | xcpretty GitHub: not archived but last push 2025-03, no Swift Testing support | VERIFIED |
| build-and-launch.md: ad-hoc signing block | empirical (W3) | VERIFIED |
| build-and-launch.md: screencapture -x -o -l semantics | `screencapture -h` this session — flags documented exactly as claimed | VERIFIED |
| build-and-launch.md: capture-by-window-ID works; atomic loop | empirical (W3): capture.sh compiled window-id, resolved WID, captured; PNG inspected and correct | VERIFIED |
| build-and-launch.md: /tmp-launched bundle loses windows | operational claim, encoded as a guard in capture.sh; not re-litigated (launch path in W3 was under $HOME) | VERIFIED as skill-operational guidance |
| build-and-launch.md: three permissions granted to terminal via GUI prompt | macOS TCC behavior; exercised implicitly (capture + automation worked in this session's GUI session) | VERIFIED |
| interaction.md: accessibility-identifier driving without a test target | SwiftUI `.accessibilityIdentifier` surfaces to AX; exercised via XCUITest identifiers in W3 | VERIFIED |
| interaction.md: audit types on macOS | probes: action/contrast/elementDetection/hitRegion/parentChild/sufficientElementDescription exist; dynamicType/textClipped/trait do not | CORRECTED — list now names the macOS set |
| interaction.md: glass button hover broken on 26, fixed in 27 | macos-27-release-notes (158800693), verbatim | VERIFIED |
| regression.md: glass snapshots fully transparent from detached views | swift-snapshot-testing issue #1029 | VERIFIED |
| regression.md: draw-in-key-window strategy is iOS-family only; no direct SwiftUI strategy on macOS (host in NSHostingController) | swift-snapshot-testing API surface | VERIFIED |
| regression.md: AppKit glass-bezel cacheDisplay defect | Apple Developer Forums thread 800776 (FB20272917): cacheDisplayInRect blank for NSBezelStyleGlass buttons | VERIFIED |
| regression.md: ImageRenderer renders only SwiftUI primitives, placeholder for CA-composited views | DocC swiftui/imagerenderer Important note, verbatim | VERIFIED |
| regression.md: magick compare / odiff flags and non-zero exit on diff | ImageMagick compare semantics; odiff README (`threshold`, `antialiasing` options) | VERIFIED |
| regression.md / anti-patterns.md: Apple publishes no numeric glass budget and no Liquid Glass Instruments template | negative claim; nothing in any fetched Apple doc, release note, or Instruments documentation names one | VERIFIED |
| state-matrix.md: osascript dark-mode toggle + Automation permission | standard System Events scripting; permission model per TCC | VERIFIED |
| state-matrix.md: com.apple.universalaccess defaults keys | community-standard keys (increaseContrast, reduceTransparency, reduceMotion, differentiateWithoutColor); machine check: domain present, keys unset by default — matching the delete-to-restore advice | VERIFIED |
| state-matrix.md: no defaults key / no read API for Liquid Glass appearance | `defaults find Glass` on macOS 26.5.2 this session: no such key in any domain; probe n15 | VERIFIED |
| state-matrix.md: macOS 27 slider has no read API in beta | no such API in any SDK or DocC page | VERIFIED |

## tailrocks-sketch-handoff

| Claim | Source | Status |
|---|---|---|
| apple-kit.md: kit offered in Sketch and Figma; Sketch is the only format on every platform | developer.apple.com/design/resources — macOS 27 kit in both; tvOS 18 lacks Figma; every platform has Sketch | VERIFIED |
| apple-kit.md: current kit is macOS 27; Tahoe kit no longer listed (replaced) | same page — only "macOS 27" listed | VERIFIED |
| apple-kit.md: June 2026 update (Liquid Glass updates, expanded components/states, naming aligned to code, resizing, dark mode) | Sketch share version created 2026-06-23; kit's own Change Log page: "Updated glass and tinted glass for light and dark modes", materials set expansion, "use Bordered Default to align with SwiftUI", "max corner radius feature", dark-mode additions | VERIFIED |
| apple-kit.md: .sketch is a ZIP of JSON, parseable offline | kit downloaded and unzipped this session: document.json, meta.json, pages/*.json | VERIFIED |
| apple-kit.md: kit measurements — 37 pages, 4,688 frames, 4,679 symbols, 110 colour variables, 285 layer styles, 67 text styles, sRGB | Sketch GraphQL API (pageCount 37, frameCount 4688, componentCount {symbol 4679, colorVar 110, layerStyle 285, textStyle 67}, colorspace sRGB) + direct file parse | VERIFIED |
| apple-kit.md: sample values (Light/8 Blue #0088FF, Dark/8 Blue #0091FF, Light/11 Pink #FF2D55; LargeTitle SFPro-Bold 26; Body SFPro-Semibold 13; Caption1 SFPro-Regular 10) | parsed from document.json — every value exact | VERIFIED |
| apple-kit.md: over-glass layer-style count | parsed: 98 styles under `Over-Glass/` (state taxonomy Idle/Clicked/Disabled confirmed) | CORRECTED — was 127, now 98 |
| apple-kit.md: Materials page with over-light/over-dark Liquid Glass artboards; recipes are static fill/blend/shadow; zero blur anywhere | parsed Materials page: artboards "Liquid Glass - Over Dark/Light Backgrounds"; light Large UI = #FFFFFF@0.7 blend 4 + #BFBFBF@0.1 blend 1 + shadow 48/18 #000000@0.25 + 8/-4 #272727 (file's example exact); blur isEnabled:true count = 0 on the page and 0 across all 285 layer styles | VERIFIED |
| apple-kit.md: public token export disabled, inspection enabled | Sketch GraphQL: publicTokenExport "DISABLED", publicInspectEnabled true | VERIFIED |
| apple-kit.md: icon guidance | HIG app-icons + Icon Composer doc (verbatim: system handles effects, four-group maximum, .icon replaces asset catalog) | VERIFIED |
| sketch-mcp.md: first-party MCP server, 2025.2.4+, non-MAS build, off by default, Local Network permission, localhost:31126/mcp, local-only, eight tools incl. run_code | sketch.com/docs/mcp-server + changelog — every detail verbatim | VERIFIED |
| sketch-mcp.md: official skills catalogue with no license | github.com/sketch-hq/agents — "Skills catalog for Sketch", license NONE | VERIFIED |
| token-extraction.md: schema packages archived | sketch-hq/sketch-document archived (2023), sketch-file-format-ts archived (2021), sketch-reference-files archived (2021) | VERIFIED |
| token-extraction.md / design-map.md: light/dark paired by name; naming renames break maps | parsed swatches `System Colors/Light|Dark/*`; kit change log rename entries | VERIFIED |
| design-map.md: SF Symbol names (plus, trash, sidebar.right, arrow.clockwise, magnifyingglass) | standard SF Symbols (resolve via NSImage(systemSymbolName:)) | VERIFIED |
| handoff-package.md | policy content; platform facts covered above | VERIFIED |

## tailrocks-macos-design

| Claim | Source | Status |
|---|---|---|
| macos-craft.md: toolbar/sidebar/window obligations | HIG toolbars/sidebars/windows — all quoted or paraphrased faithfully (see layer-model rows) | VERIFIED |
| macos-craft.md: inactive-window wording | HIG windows | CORRECTED (vibrancy) |
| macos-craft.md: control metrics, typography scale, no Dynamic Type, NSFont variants | probes + HIG typography | VERIFIED |
| macos-craft.md: section headers title-style capitalization as of macOS 26 | adopting-liquid-glass: "adopting title-style capitalization for section headers … no longer render entirely in capital letters" | VERIFIED |
| macos-craft.md: SF Symbols "over 7,000" | developer.apple.com/sf-symbols — "over 7,000 symbols" | VERIFIED |
| macos-craft.md: app icon (Icon Composer, six macOS appearances, 1024×1024, max four groups, no baked effects, .icon not an asset catalog entry) | HIG app-icons + Xcode Icon Composer doc, verbatim | VERIFIED |
| macos-craft.md: reduce-motion guidance | HIG accessibility, verbatim ("reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion"; fades for x/y/z transitions) | VERIFIED |
| native-component-map.md: API names (NavigationSplitView, Table, .inspector, .searchable, Settings scene, ToolbarItem placements) | standard SwiftUI APIs, all resolve in SDK 26.5 | VERIFIED |
| reference-corpus.md: Apple Design Award categories | apple.com/design/awards — interaction, visuals and graphics, inclusivity, innovation, delight and fun, social impact | VERIFIED |
| reference-corpus.md: skills-evaluation findings | SkillsBench, arXiv 2602.12670 (as agent-integration row) | VERIFIED |
| rubric.md, experience-brief.md, custom-component-contract.md | engineering policy in skill voice; the embedded platform facts (menu-bar command rule, inactive window, Reduce-* obligations) covered above | VERIFIED |
