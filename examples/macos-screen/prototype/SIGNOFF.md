# ConnectionsBoard prototype sign-off

- **Design inputs**:
  - `Design/ExperienceBrief.md` — Status APPROVED, approved 2026-08-11
  - `Design/NativeComponentMap.md` — working-set revision consumed 2026-08-17
  - `Design/LiveFeedCluster-contract.md` — working-set revision consumed 2026-08-17
  - `Design/Alternatives.md` — decision A (sidebar-led), consumed 2026-08-17
- **Scenarios**:
  - `default` — normal state: mixed healthy/slow/blocked/idle sessions,
    blocked session selected, inspector open. Walked live in light and
    dark at 1100×700 through the launch contract.
  - `paused` — same fixture with the feed paused (cluster shows Resume).
    Walked live in light at 1100×700.
  - `empty` — no connection selected, guidance text. Render-verified
    through the launch contract.
  - `error` — connection unreachable, non-modal retry, cluster hidden.
    Render-verified through the launch contract.
- **Environment**: macOS 26.5.2 (25F84), Xcode 26.6 (17F113), Swift 6.3.3,
  SDK macosx26.5, display scale 2x, backdrop `standard` (neutral gray
  0.42/0.45/0.50 sRGB), binary ConnectionsBoardProto 0.1.0 staged at
  `~/Library/Caches/tailrocks-prototype/` (non-temporary, launch-safe).
- **Pending capture lane**: everything — screenshots are frozen only after
  finalization by `tailrocks-macos-visual-qa` driving this package through
  the launch contract: the scenario matrix per `Regions.md`, plus the
  real-settings state matrix (Reduce Transparency, Reduce Motion,
  Increase Contrast, Differentiate Without Color, real dark-mode setting);
  this run used only per-process `--tr-appearance` overrides, which
  preview but do not verify real settings.
- **Not proven live**: hover and pressed states (macOS 26 glass
  hover defect noted in the contract), pause/resume motion and its Reduce
  Motion crossfade, VoiceOver announcements and traversal, keyboard focus
  order (cluster after table) and focus rings, `--tr-reduce` substitution
  rendering, terminate confirmation dialog, context menu, minimum 720×440
  and wide 1500×900 sizes, 5,000-session lazy table, loading and read-only
  states (not yet fixtures), localization and RTL mirroring — routed to
  the visual-qa verify lane and the future UI-test target
  (accessibility-audit wiring included).
- **Blessed**: — *(draft — awaiting user review; the prototype binds
  nobody until this row is filled by the user)*

## Findings routed out of the prototype

Recorded here because the prototype never resolves design gaps ad hoc;
each needs its owner's ruling, and the blessing gate is asked to ratify
the interim reading.

1. **To tailrocks-macos-design — no concrete fixture dataset.** The
   approved package specifies states but ships no session/connection
   dataset. `Fixtures.swift` realizes the brief's States section
   mechanically (values traceable row-by-row to named states, frozen
   clock 2026-08-11T14:32:05Z). Ratify or replace at blessing.
2. **To tailrocks-macos-design — LiveFeedCluster error-state
   contradiction.** The contract states both "Disabled: while connection
   is in error state" and "Error: hidden (feed not live)". The prototype
   implements *hidden* (matches the component's floating-over-live-feed
   purpose); needs a ruling.
3. **To tailrocks-macos-design — toolbar persistence interpretation.**
   The brief marks Refresh as a constant toolbar action; the prototype
   keeps the toolbar present in empty/error states (inspector toggle
   disabled outside normal). Ratify.
4. **To the tailrocks-macos-prototype template (ProtoMain.swift).** Two
   defects verified on macOS 26.5 and fixed in this copy, deltas
   documented in the file header: (a) the readiness poll matched the
   backdrop window (visible at level normal − 1), clamping it and
   printing its number as TR-READY — the match now requires
   `level == .normal`; (b) a backdrop window created in
   `applicationDidFinishLaunching` suppresses SwiftUI's WindowGroup
   window creation entirely — the backdrop is now created on the poll
   tick that first finds the main window, still before TR-READY. Related
   harness note: a direct-exec'd SwiftUI app on macOS 26 does not create
   its window until activated; the package's `harness/capture.sh` keeps
   the stock harness's `open` re-activation for that reason.
