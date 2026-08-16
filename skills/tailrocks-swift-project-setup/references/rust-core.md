# Rust-core lane

Applies when the application keeps its behavior in a Rust core behind the
SwiftUI shell (the boundary contract itself is
`tailrocks-swift-best-practices`'s Rust core boundary; Rust workspace
mechanics are `tailrocks-rust-project-setup`'s). This lane adds what the
macOS baseline must additionally pin, generate, and gate.

## Layout

The Rust workspace and the Xcode project live in one repository; the app
project stays generated and uncommitted exactly as in
`project-generation.md`:

```text
app/
├── Cargo.toml               # workspace
├── rust-toolchain.toml
├── mise.toml                # one task set drives both halves
├── crates/
│   ├── domain/              # entities, invariants — no FFI knowledge
│   ├── application/         # actions, actor, state transitions
│   ├── infrastructure/      # HTTP, database, cache, logging
│   └── macos-ffi/           # the ONLY crate that knows the bridge
└── macos/
    ├── project.yml          # generated .xcodeproj stays ignored
    └── App/                 # SwiftUI shell sources
```

Only `macos-ffi` depends on the bridge generator; domain, application, and
infrastructure crates must not know Swift exists. Boundary records and
enums are defined in `macos-ffi`, not annotated onto domain types —
replacing the bridge is then a contained change.

## Pins

`mise.toml` remains the single tool authority. Pin, exactly:

- the Rust toolchain (`rust-toolchain.toml`, channel + components);
- the bridge crate version (workspace `Cargo.toml`, exact `=` requirement);
- the bridge CLI version (mise-managed, never a floating install).

Bridge generators are pre-1.0 and move fast; an unpinned CLI regenerating
different Swift on two machines is the supply-chain version of the
false-green trap.

## Packaging

The bridge CLI produces an XCFramework plus a generated local Swift
package; the Xcode project consumes that package as a **local** SwiftPM
dependency — never a registry fetch of your own bindings. The packaging
step is a mise task (for example `mise run bridge`), ordered before
`generate` in the task chain so a clean checkout builds with the standard
task sequence. Build both `arm64` and `x86_64` unless the project has
recorded an Apple-silicon-only decision.

## Gates

Two additions to the baseline gate set:

- **Binding-drift gate.** CI regenerates the bindings and fails when the
  generated Swift differs from what is committed (or, if generated output
  is intentionally uncommitted, when regeneration changes the package
  interface) without an intentional bridge change. Silent binding drift is
  how an action added in Rust ships unreachable from the UI.
- **Rust test lane.** The behavior tests live in the Rust workspace and run
  with the standard Rust gates — no Xcode required. The macOS CI job runs
  them alongside the Swift build so a domain regression fails the same
  pipeline that ships the shell.
