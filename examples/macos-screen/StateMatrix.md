# Rendered state matrix — ConnectionsBoard (2026-08-11)

Host: macOS 26.5.2, Xcode 26.6, SDK 26.5. All captures by window ID
(`screencapture -x -o -l`) from the running app; appearance and content states
driven per-app via launch environment (`CB_APPEARANCE`, `CB_STATE`,
`CB_FRAME`) so the user's system settings were never touched.

## Captured

| State | File |
|---|---|
| Typical 1100×700, light | captures/01-typical-light.png |
| Typical 1100×700, dark | captures/02-typical-dark.png |
| Minimum 720×440, light | captures/03-minimum-light.png |
| Wide 1500×900, light | captures/04-wide-light.png |
| Empty (no connection), light | captures/05-empty-light.png |
| Error (unreachable), light | captures/06-error-light.png |
| Large dataset (5,000 rows), light | captures/07-large-light.png |
| Long strings (German expansion fixture), dark | captures/08-longstrings-dark.png |
| Inactive window, light | captures/09-inactive-light.png |

## Skipped, with reasons (recorded, not omitted)

| State | Reason |
|---|---|
| Reduce Transparency / Increase Contrast / Reduce Motion / Differentiate Without Color | `defaults write com.apple.universalaccess …` changes the person's real system settings; this machine was in active use by its owner during the run. The cluster's Reduce Transparency substitution is implemented (`Glass.identity` + opaque capsule) and covered by unit-level state, but not visually verified this run. |
| Liquid Glass Clear vs Tinted | No programmatic control exists (verified in W1); requires a hand flip on a machine in active use. |
| Accent / highlight color variants | Same shared-machine constraint. |
| VoiceOver walk | Requires interactive narration session. |
| Hover states | Pointer-position-dependent; also macOS 26 glass hover outside toolbars is a known platform defect (fixed in 27) — verify, do not assume. |
| RTL / full localization | Fixture covers text expansion only (08); no localized build in scratch scope. |

## Interaction driven (UI test, green)

- Launch, wait, click `pauseFeedButton` (cluster), toggle inspector — all via
  accessibility identifiers.
- `performAccessibilityAudit` (contrast, element detection, hit region,
  sufficient element description) scoped to app-owned elements: **pass** after
  two real findings were fixed (missing labels on Table and sidebar List).
