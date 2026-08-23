<!-- tailrocks-macos-harness-contract:start -->

# macOS visual-QA harness contract

Install the hardened harness into a real project:

```sh
bun scripts/macos-visual-qa/install.ts --root /absolute/project
```

Run `bun run.ts capture -- APP.app OUT.png [--window-title TITLE] [-- APP_ARG...]`. It resolves the bundle's
real executable and refuses when an exact owner already exists. A native
launcher returns the PID and launch token of one invocation-owned instance;
cleanup terminates only that identity. Launch and window recovery are bounded
to ten seconds each. Window selection binds to the exact PID, refuses multiple
matches, captures by window ID, and rechecks ownership before publishing the
PNG and JSON sidecar. Similar-name decoy applications are never selected.
Activation is best-effort evidence in the sidecar, never an ownership gate.

Run appearance rows only through `bun run.ts state -- with STATE -- COMMAND ...`. The supervisor
emits one bounded terminal JSON receipt; the internal script
snapshots the four accessibility keys plus both appearance keys (including Auto),
restores each value on exit, retries restoration three times, and retains the
owner-only before/applied recovery pair if restoration fails. Bare mutation is
not exposed; recover accepts only the exact six-key typed registry. The receipt
reports `restored` or `recovery-required` independently of capture outcome and
lists every attempted system mutation.

`ax-drive.swift` accepts an exact PID only, caps traversal, and refuses duplicate
identifiers. `AuditTests.swift` runs the four macOS audit types and filters
system-owned elements from the app-scoped gate.

These commands need an interactive macOS GUI. Screen capture needs Screen
Recording; AX driving needs Accessibility; setting changes may need Automation.
Run `bun run.ts preflight -- session|screen-recording|accessibility|automation-system-events`
for an explicit check. Capture and state commands run their required checks
before acquiring locks, launching an app, changing a setting, or creating
output. Missing permission returns a typed blocked receipt. The checks never
request grants.

Only the typed `run.ts preflight`, `run.ts capture`, and `run.ts state`
interfaces are public. Raw shell helpers are private implementation. The supervisor uses fixed system-tool
paths, a minimal allowlisted environment with secret-shaped names removed,
bounded time/output/process-group cleanup, one exact-executable capture lock,
and one global preference lock. Timeout overrides have hard maxima. Production
state execution accepts only the installed capture operation; arbitrary commands
and executable overrides are refused. Capture publication holds an anchored
output-parent identity and refuses replacement before publishing either PNG or
sidecar.

Build two runnable local fixtures outside temporary storage:

```sh
scripts/macos-visual-qa/test-apps/build.sh "$HOME/Library/Caches/tailrocks-visual-qa-fixtures"
```

Launch `Fixture.app` normally for one window or pass `--two-windows` to its real
executable to prove ambiguity refusal. `DecoyFixture.app` has a similar identity
but a different real executable, proving exact ownership isolation.
<!-- tailrocks-macos-harness-contract:end -->
