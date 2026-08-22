# macOS visual-QA harness

Install the hardened harness into a real project:

```sh
bun scripts/macos-visual-qa/install.ts --root /absolute/project
```

Run `bun run.ts capture -- APP.app OUT.png [--window-title TITLE] [-- APP_ARG...]`. It resolves the bundle's
real executable, terminates only exact executable owners, bounds launch and
window recovery to ten seconds each, binds windows to the exact PID, refuses
multiple matches, captures by window ID, and rechecks ownership before publishing
the PNG and JSON sidecar. Similar-name decoy applications are never selected.

Run appearance rows only through `bun run.ts state -- with STATE -- COMMAND ...`. The supervisor
emits one bounded terminal JSON receipt; the internal script
snapshots the four accessibility keys plus both appearance keys (including Auto),
restores each value on exit, retries restoration three times, and retains the
owner-only before/applied recovery pair if restoration fails. Bare mutation is
not exposed; recover accepts only the exact six-key typed registry.

`ax-drive.swift` accepts an exact PID only, caps traversal, and refuses duplicate
identifiers. `AuditTests.swift` runs the four macOS audit types and filters
system-owned elements from the app-scoped gate.

These commands need an interactive macOS GUI. Screen capture needs Screen
Recording; AX driving needs Accessibility; setting changes may need Automation.
Missing permission is a blocker, never a pass. The scripts never request grants.

Build two runnable local fixtures outside temporary storage:

```sh
scripts/macos-visual-qa/test-apps/build.sh "$HOME/Library/Caches/tailrocks-visual-qa-fixtures"
```

Launch `Fixture.app` normally for one window or pass `--two-windows` to its real
executable to prove ambiguity refusal. `DecoyFixture.app` has a similar identity
but a different real executable, proving exact ownership isolation.
