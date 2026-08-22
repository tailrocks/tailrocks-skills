# Harness contract

Resolve the installed skill's real directory, then derive the shared repository
script without searching the target project or trusting its metadata:

```sh
SKILL_DIR=/absolute/path/to/installed/skills/tailrocks-macos-visual-qa
INSTALLER=$(realpath "$SKILL_DIR/../../scripts/macos-visual-qa/install.ts")
bun "$INSTALLER" --root /absolute/project
```

Require the joined installer path itself to be non-symlink and its resolved
entrypoint to be regular. The installer refuses an existing destination; never
merge generated files into an unmatched harness.

Invoke capture only as `bun Scripts/TailrocksVisualQA/run.ts capture -- APP.app
OUT.png ...`; this public supervisor bounds the internal shell and emits one
terminal JSON receipt on success, refusal, timeout, or failure.

The installed capture script resolves Info.plist's exact executable, enumerates
running applications by the executable's canonical path, and signals only PIDs
that still carry that identity. It never matches names or regular expressions.
Launch and termination recovery are bounded. Similar-name decoy applications
must survive.

Window resolution uses the exact PID and all-window Core Graphics enumeration.
An exact title may narrow candidates, but zero candidates retries only to the
fixed bound and two candidates refuse immediately. Capture is by window ID,
publishes from a same-directory partial file only after PNG size and dimensions
pass, and rechecks process/window ownership before publication.

AX driving accepts an exact PID, caps traversal at 10,000 nodes and 64 levels,
and requires exactly one accessibility identifier. The UI-test audit runs the
four macOS audit types and ignores system-owned elements; it never turns a
system menu-bar issue into an app defect.

Appearance rows run only through `bun run.ts state -- with` mode. The bounded
supervisor emits the terminal receipt; the transaction records
the four accessibility preferences plus AppleInterfaceStyle and
AppleInterfaceStyleSwitchesAutomatically, verifies writes, restores every key
on all ordinary exits, retries restoration exactly three times, and retains the
owner-only before/applied recovery pair when exact restoration fails. Forged,
extra, duplicate, or wrong-typed registry rows refuse. Forced light/dark
disables Auto only for the transaction.

The scripts need a graphical login session. Screen Recording, Accessibility,
or Automation absence is a named blocker, never success. Build the shipped local
FixtureApp outside temporary storage; its one-window mode proves the normal path,
its two-window mode proves ambiguity refusal, and the separate decoy bundle
proves executable-path ownership.
