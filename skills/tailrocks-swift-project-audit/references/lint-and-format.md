# Formatting and lint

## The formatter ships with Xcode

`swift-format` has been bundled since Xcode 16 / Swift 6. Invoke it through
`xcrun` so the version matches the toolchain the editor uses:

```sh
xcrun swift-format --version
xcrun swift-format format -i -r -p Sources Tests UITests
xcrun swift-format lint --strict -r -p Sources Tests UITests
```

**Do not install a second copy.** A separately installed formatter will disagree
with the editor's built-in formatting action, and the two will fight over every
file.

Xcode's structure-formatting editor action is backed by the same formatter, so a
committed configuration also fixes what a person gets from the menu.

## The silent-failure trap

**Without `--strict`, the linter prints violations and exits successfully.**

A continuous-integration job that runs the linter without that flag is green on
every violation. This is verified behavior, not a misconfiguration, and it is the
most common reason a Swift repository has a formatting gate that has never once
failed.

Always `--strict` in the gate. Use the non-strict form only for interactive
inspection.

## Configuration

The configuration file is `.swift-format`, in JSON, discovered by walking upward
from the source directory. Seed it from the tool's own dump and then narrow:

```sh
xcrun swift-format dump-configuration > .swift-format
```

Copy canonical [`swift-format.json`](../../tailrocks-swift-project-setup/templates/swift-format.json)
for a starting policy. Keep one configuration
per repository; per-directory overrides make the editor's behavior depend on
which file is open.

## SwiftLint

The formatter enforces layout. The linter enforces the rules a formatter cannot
express — naming, complexity, force operations, cyclomatic limits.

```sh
swiftlint --strict
```

Same rule: strict in the gate.

Copy canonical [`swiftlint.yml`](../../tailrocks-swift-project-setup/templates/swiftlint.yml).
Two policy points worth stating explicitly in it:

- Force unwrapping, force casting, and force `try` remain errors in application
  code. Copy canonical
  [`Tests.swiftlint.yml`](../../tailrocks-swift-project-setup/templates/Tests.swiftlint.yml)
  as `Tests/.swiftlint.yml` and
  `UITests/.swiftlint.yml`; it disables those rules only in test trees where the
  failure is the assertion. Warning severity is forbidden because `--strict`
  promotes warnings to gate failures.
- Rules disabled for legacy debt carry a narrow path scope and a reason comment,
  never a repository-wide disable.

The project is volunteer-maintained and its package plugins live in a separate
repository from the tool itself; pin the version and record where the plugin
comes from if the build uses one.

## Dead code

Run a dead-code pass on a schedule, not on every change — it needs a full build
and is too slow for the inner loop.

```sh
periphery scan
```

Retained-by-default cases on this platform are large: anything reachable from a
storyboard, an interface builder outlet, an objective-C selector, or a dynamic
member lookup. Configure the retention rules once and treat unexplained findings
as real.

## Ordering in the gate

Cheapest and most deterministic first, so a failure is reported at the first
place a person can act on it:

```
generate → format check → lint → build → unit tests → UI tests → audit
```

A format failure should never require waiting for a build.

## What no tool covers

There is **no HIG linter and no Liquid Glass linter**, from Apple or anyone. No
static tool detects glass in the content layer, glass-on-glass nesting, a
hard-coded corner radius adjacent to a system container, or a toolbar action with
no menu-bar command.

Those are caught by the design rubric and by rendered review. Do not describe a
green lint run as design approval — it says nothing about design.
