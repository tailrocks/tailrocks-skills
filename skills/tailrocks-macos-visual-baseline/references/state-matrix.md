# The rendered state matrix

A feature is not visually complete because its default light appearance looks
good at one window size.

**These commands change the user's real system settings.** Reach every automated
row through the installed macOS visual-QA state script, whose `with` mode
snapshots and trap-restores on every exit. Forced light or dark disables Auto
only inside that transaction; restoration writes both original appearance keys
back exactly. Report explicitly if restore fails and retain its recovery file.

## Appearance

The appearance toggle propagates live to running applications and is the most
reliable of the toggles.

```sh
osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to true'
osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to false'
```

Requires an **Automation ▸ System Events** permission, granted once through a
graphical prompt.

## Accessibility settings

```sh
defaults write com.apple.universalaccess increaseContrast -bool true
defaults write com.apple.universalaccess reduceTransparency -bool true
defaults write com.apple.universalaccess reduceMotion -bool true
defaults write com.apple.universalaccess differentiateWithoutColor -bool true
```

Never use a bare mutation or restore recipe. The with transaction records each
original value or `ABSENT`, records the applied state, and compare-checks the
current six-key registry before restoring. A concurrent change refuses instead
of being overwritten, and both owner-only recovery files remain for the recover
command. Every snapshot has a fixed schema, owner, mode, order, key, and type;
extra or duplicate preference rows refuse. Apply and restore read back every key.

Caveats:

- A TCC prompt or silent no-op is possible on first use; verify on first run.
  The script's read-back detects a no-op. **Live propagation to
  already-running applications is weaker than the appearance toggle**. Allow a
  second or two and re-capture, or relaunch the application.
- Auto appearance is preserved through both `AppleInterfaceStyle` and
  `AppleInterfaceStyleSwitchesAutomatically` in `NSGlobalDomain`; never pin an
  Auto user's machine to explicit light or dark.

## Settings with no programmatic control

These must be flipped by hand. Say so in the report rather than silently omitting
the row.

| Setting | Why |
|---|---|
| Liquid Glass appearance — clear or tinted (macOS 26.1+) | No `defaults` key and **no read API** in any framework |
| Liquid Glass slider — ultraclear to fully tinted (macOS 27) | No read API in the beta |
| System accent color and highlight color | Verify the full set including custom and multicolor |
| Sidebar icon size | User-controllable in General settings; row metrics must reflow |
| Scroll bar visibility | Affects whether the scroll edge effect appears |
| Display scale and dragging between displays | Corner radii and blurs must resolve on move |
| Wallpaper | Glass refracts it; test bright photo, dark photo, and solid |
| VoiceOver | System Settings ▸ Accessibility ▸ VoiceOver; interferes with AX driving |
| Full Keyboard Access | System Settings ▸ Accessibility ▸ Keyboard |

The absence of a read API for the Liquid Glass setting is not an inconvenience,
it is a design constraint: a custom glass surface **cannot** adapt
programmatically, so it must be visually verified under both looks.

## Required states

The canonical platform and material axis registry is
[`verification.md`](verification.md). Its full list applies,
including Show Borders on macOS 27 and sRGB/Display P3 color profiles. This file
owns how to reach and capture those states, not a second copy of the list.

Add product content fixtures: empty, loading, normal, very large data, long
strings, missing values, error, offline, permission denied, and destructive work
pending. Exercise localization with text expansion, RTL where relevant, long
dates and numbers, and mixed scripts. Also capture relevant hover, focus,
pressed, selected, disabled, context-menu, drag, rapid-input, and resize states.

Scale the matrix to the change. A one-line label edit does not need the full
grid; a new screen does. State which rows were skipped and why — a skipped row
recorded is information, a skipped row omitted is a false pass.
See examples/macos-screen/StateMatrix.md for a rejected run that records skipped
rows explicitly.

## Ordering the run

Flip the slowest-propagating settings least often. One efficient order:

1. For each appearance (light, dark): capture every geometry and content state.
2. Then enable Reduce Transparency and re-capture only the glass-bearing states.
3. Then Increase Contrast, same subset.
4. Then Differentiate Without Color, only the states where color carries meaning.
5. Then Reduce Motion, only the animated transitions.
6. Restore everything and verify the restore.

Capture into a directory named for the state so a reviewer can navigate without
opening files.
