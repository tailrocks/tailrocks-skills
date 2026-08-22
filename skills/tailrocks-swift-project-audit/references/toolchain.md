# Toolchain and the two-lane SDK strategy

## Freshness gate

Before changing any pin, resolve current releases from official sources —
`developer.apple.com/documentation/xcode-release-notes` and
`developer.apple.com/documentation/macos-release-notes` — and select the latest
compatible stable toolchain. Commit exact versions. If only a prerelease
satisfies a requirement, report that and require explicit approval.

## State of the platform as verified 2026-08-21

Re-verify before relying on these. The shipping column was re-checked on
2026-08-21 against `gdmf.apple.com/v2/pmv` and the installed toolchain; the
forward-validation column keeps its 2026-08-11 check, because Xcode 27 beta is
not installed on the machine that re-verified and a stamp nobody earned reads
as current when it is not.

| | Shipping | Forward validation |
|---|---|---|
| macOS | 26.6.2 "Tahoe" | 27 "Golden Gate" — beta, not shipping, "coming this fall" |
| Xcode | 26.6 (17F113) | 27 beta |
| Swift | 6.3.3 | 6.4 |
| SDK | macOS 26.5 | macOS 27 |
| Host requirement | macOS 26.2+ | macOS 26.4+ |

Xcode 27 is **Apple-silicon-only**. Standard architectures drop the Intel
architecture when the deployment target is 27.0 or later. Universal back-deploy
to macOS 12 and later remains supported.

## Declare four values, not one

A deployment target alone is insufficient. Every project records:

```
Minimum deployment target:
Shipping SDK / Xcode:
Forward-validation SDK / Xcode:
Behavior when a forward-only API is unavailable:
```

Put these in the project's agent instructions file, not only in build settings.
An agent that cannot see the target will write against the newest documentation
it finds, and Apple's documentation site renders declarations from the newest
published SDK.

## Why two lanes

The shipping lane is what people run. The forward lane catches the changes that
arrive without a recompile — and on this platform several do:

- Design refinements to the material land automatically on the new OS for apps
  already built against the previous one.
- A title bar accessory view controller is allowed to draw outside its bounds by
  default on macOS 27, **including for apps linked against macOS 26**. Clipping
  assumptions break silently.
- Menu symbol images are hidden by default on macOS 27; opting back in is a code
  change.

Run the forward lane on a schedule, not on every change, and never let a
forward-only symbol reach the shipping target without an availability guard.

## The compatibility key expires

`UIDesignRequiresCompatibility` opts an app out of the new design. The `UI`
prefix is correct on macOS; there is no platform-specific variant.

**The system ignores it when the app is built against the 27 SDK or later**, and
support for opting into the old design is being removed. Treat it as a migration
window with a dated exit recorded in the project, never as a strategy. An audit
must flag its presence with the date the window closes.

## Tool pinning

Pin every tool that can change the output. The formatter ships with Xcode, so it
is pinned by the Xcode version rather than separately — do **not** install a
second copy, which will disagree with the one the editor uses.

```toml
[tools]
swiftlint = "0.65.0"
xcodegen = "2.46.0"
xcbeautify = "3.2.1"
periphery = "3.8.0"
```

Replace with the current versions at execution time. Record why each tool exists;
a pinned tool nobody can justify is removed at the next audit.

## Tasks

Local and continuous-integration commands must resolve through the same
definitions, or the two drift and the pipeline stops predicting the local result.
The canonical task set is
[`mise.toml`](../../tailrocks-swift-project-setup/templates/mise.toml);
continuous integration invokes those task names without restating commands.

## Language mode

Target the current Swift language mode with strict concurrency. Record the
language mode explicitly in build settings rather than inheriting whatever the
toolchain defaults to, so a toolchain bump does not silently change the
diagnostics an agent sees.

`SWIFT_VERSION` is the language mode, not the compiler release. Legal values are
`4`, `4.2`, `5`, and `6`; never write a release such as `6.3` there.

The Xcode 26.6 build-settings reference exposes `SWIFT_STRICT_CONCURRENCY` but
does not expose build-setting keys for "default isolation" or "approachable
concurrency". The template therefore pins only the confirmed key. Do not invent
silent YAML keys; re-probe the build-settings reference when the toolchain lane
changes and record any newly shipping names before adding them.
