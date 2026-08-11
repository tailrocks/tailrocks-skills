# Build, launch, capture

## The failure this section exists to prevent

A SwiftUI `WindowGroup` window frequently ends up **not on the current Space**.
When that happens:

- the on-screen window list does not contain it,
- the accessibility API reports **zero windows** for the application,
- a rectangle capture grabs whatever else occupies that rectangle,
- and the application still reports one window, visible.

The result is a screenshot of something else, written to the expected path, with
no error. An agent then critiques the wrong image.

**Capture by window ID.** Enumerate with the all-windows option, match on owner
name and window name, and do not filter on the on-screen flag. Capture by ID
works even while the accessibility API reports zero windows — the pixel path and
the automation path fail independently.

## Build

```sh
xcodebuild -list -project App.xcodeproj -json

xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
  -derivedDataPath "$HOME/Library/Developer/AppBuild" build
```

**The derived data path must not be under `/tmp`, `/private/tmp`,
`/var/folders`, or `$TMPDIR`.** An app
bundle launched from a temporary directory loses its windows within seconds. This
is the single most expensive trap in the loop.

Pipe through a formatter and keep the real exit status:

```sh
set -o pipefail
xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
  -derivedDataPath "$HOME/Library/Developer/AppBuild" build | xcbeautify
```

Use `xcbeautify`, not `xcpretty` — the latter is dormant and cannot parse the
current test framework's output at all.

Ad-hoc signing is enough for a local run. No Apple ID and no team are required:

```
CODE_SIGN_IDENTITY = "-"
ENABLE_HARDENED_RUNTIME = NO
```

## The atomic loop

State does not survive reliably between separate agent tool calls. Run kill,
launch, wait, act, and capture as **one** invocation.

Use `templates/capture.sh`: canonicalize and guard
the app path, kill, launch, wait, re-activate, resolve the current window ID,
capture by ID, then verify file size and dimensions.

`-x` suppresses the capture sound, `-o` omits the window shadow, `-l` selects by
window ID.

`open` on an already-running application only reactivates it. A process that lost
its window will never regain one, so the kill is mandatory, not defensive.

## Resolving the window ID

A short helper is the whole harness. Enumerate every window, match owner name and
window title, print the ID. Do not filter on the on-screen flag.

Copy `templates/window-id.swift` from this skill. Compile it once and keep the
binary in the project's scripts directory:

```sh
swiftc -O Scripts/window-id.swift -o Scripts/window-id
```

## Why not the alternatives

| Approach | Verdict |
|---|---|
| `screencapture -R <rect>` | Silently wrong when the window is off the current Space |
| `screencapture -w` (interactive) | Requires a human click |
| Accessibility-only capture | Fails whenever the window list reports zero windows |
| Simulator tooling | macOS applications are not simulator applications; most agent tooling in this space is simulator-only and does not touch a Mac app |

## Permissions

- **Screen Recording** — required for capture.
- **Accessibility** — required for driving the interface.
- **Automation ▸ System Events** — required for the appearance toggle.

All three are granted to the *terminal application*, once, through a graphical
prompt. They cannot be granted headlessly. Running graphical code in a remote
shell with no graphical session does not work; an active user session or a login
agent is required.

State plainly which environment the verification ran in. A continuous-integration
run without those grants has not verified anything visual.
