# Project toolchain and audit ledger

This reference defines the Swift project baseline, the supported
lanes, and the audit gap ledger. The freshness gate at the top is
mandatory. No pinned release below replaces live resolution.

## Freshness gate

An audit, remediation, or setup run first finds the newest
stable releases. It records the release date and source. It
finds them again when SDK state changes. Without fresh releases,
it stops. No cached table approves a lane.

## Supported lanes

Keep two lanes: one shipping lane and one forward-validation lane.
The shipping lane uses the newest stable Xcode release. The
forward-validation lane uses the newest beta or release-candidate
build. Accept one beta lane per project at a time. Never accept
two concurrent beta lanes. Never accept a lane that cannot install,
complete signing, and run.

The lane gives the compiler release, the Swift language mode, the
SDK release, and the host version. The deployment target is
recorded per target alongside the lane. Keep the five values
separate.

Release one baseline per lane. It runs on old releases. Run the
baseline gates on every change. Run the forward lane at set times.
Never run it on every change.

## Record five values

Record five separate values for the project:

1. Deployment target: minimum deployment target per app and test
   target.
2. Compiler: exact compiler release in the lane.
3. Language mode: Swift 6.
4. SDK: SDK release per lane, shipping and forward.
5. Host: host version that runs the lane.

State target and lane for each check. Keep lanes separate in each
result.

## Pin concurrency settings

Pin the exact Swift strict-concurrency mode in
`assets/project.yml` with `SWIFT_VERSION` and
`SWIFT_STRICT_CONCURRENCY`. The template sets `complete` mode.

The Xcode build-settings reference also has
`SWIFT_DEFAULT_ACTOR_ISOLATION` and
`SWIFT_APPROACHABLE_CONCURRENCY`. The default-isolation key
controls default actor isolation for unannotated code. When set
to `MainActor`, the compiler uses `@MainActor` isolation by
default. The approachable-concurrency key adds the upcoming
features DisableOutwardActorInference,
GlobalActorIsolatedTypesUsability, InferIsolatedConformances,
InferSendableFromCaptures, and NonisolatedNonsendingByDefault.
The reference read this way on 2026-10-07. The template pins
neither key. Record both reference values at setup time.
Examine the reference again when the lane changes.

An audit identifies a missing concurrency pin as a gap under
`SWIFT-PROJECT-006`.

## Audit gap ledger

The audit writes the 16-row gap ledger with locked IDs. Exact ID,
set rule, current state, and gap make each row. IDs stay in the
same order and do not change. The IDs are `SWIFT-PROJECT-001`
through `SWIFT-PROJECT-016`:

| ID | Set rule |
| --- | --- |
| SWIFT-PROJECT-001 | Declarative generation only |
| SWIFT-PROJECT-002 | No committed generated project |
| SWIFT-PROJECT-003 | Synchronized sources only |
| SWIFT-PROJECT-004 | Signing identity set |
| SWIFT-PROJECT-005 | Zero warnings policy |
| SWIFT-PROJECT-006 | Exact tool pins, language mode, concurrency-setting pins, and freshness |
| SWIFT-PROJECT-007 | Lint and format gates complete |
| SWIFT-PROJECT-008 | TASKS.md parity |
| SWIFT-PROJECT-009 | Forward lane state recorded |
| SWIFT-PROJECT-010 | UI tests run in CI |
| SWIFT-PROJECT-011 | Contract tests for FFI |
| SWIFT-PROJECT-012 | AX identifiers added |
| SWIFT-PROJECT-013 | Release build examined |
| SWIFT-PROJECT-014 | Cache isolation holds |
| SWIFT-PROJECT-015 | No toolchains in the repository |
| SWIFT-PROJECT-016 | Thread and memory checks clean |

## Version source policy

Get versions from the declared source for each boundary
(Microsoft `winget`, Apple software update, project manifests).
The version tool pins exact releases for Xcode, Swift toolchain,
`mise`, `xcodegen`, `swiftlint`, `swiftformat`, and Rust stable.
Each lane keeps exact pins, a scheduled forward check, and a
dated removal condition. No tool keeps an older release. Record
each older release that stays.

The template pins exact tool releases. `mise` is the version
source for tools. The Cargo index is the version source for Rust
crates. The version tool pins every tool to the newest compatible
version. The source refreshes at set times.

## mise task parity

Each build, format, lint, test, and release task has one `mise`
task name. CI runs the same task names. This keeps local and
CI behavior the same. CI never duplicates commands.

## Freshness gate checks

| Check | Rule |
| --- | --- |
| Installed tools have pinned versions | Run at each gate |
| Pinned SDKs still install and run | Run at each gate |
| Swift toolchain lane state | Record shipping and forward state |
| Beta lane has authorization | One beta lane at a time, with user authorization |

## Forward lane

Never move a beta lane to shipping without an explicit user
decision. An audit must identify its presence. A beta toolchain,
SDK, or OS release can break the build. Use it as a migration
window with a dated exit, never as a strategy. Host requirements
for the bridge come from the installed Xcode, not from a cached
table.

## Cache isolation

Derived data, build caches, and test artifacts stay outside the
repository and outside the packaged app. Each lane uses separate
derived-data paths.

## No vendored toolchains

Keep toolchains out of the repository. Install them through the
version tool. Never stop the shipping lane for the newest release.
