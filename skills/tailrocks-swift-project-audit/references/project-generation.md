# Project generation

The goal is a project an agent can create, extend, build, and test without ever
opening the graphical editor, and whose diffs are reviewable.

## Options, evaluated

| Option | Verdict |
|---|---|
| **Declarative YAML generator** (XcodeGen) | **Recommended.** One YAML manifest, no compile step, the generated project file stays out of version control. Adding a source file produces zero project-file diff when the target uses a synchronized folder. Low upstream velocity, but zero lock-in — the output is a plain project. |
| Swift-manifest generator (Tuist) | Better funded and more active, but manifests are Swift that must compile, which makes them a worse edit target for an agent. Right choice at multi-module scale or when the hosted server is wanted. |
| Raw project file | Synchronized folders genuinely fix the churn problem — adding files needs no project-file edit. But an agent still cannot create targets or configurations without the graphical editor. Fallback for inherited projects. |
| Package manifest only | **Disqualified for an app.** The package description exposes only library, executable, and plugin product types. Building a SwiftUI app entry point produces a bare executable — no application bundle, no property list, no signature. No evolution proposal pursues this. |
| Third-party bundler | Produces a real signed bundle from a small manifest, but sits outside the vendor toolchain with a single maintainer. A bet, not a foundation. |

## Minimum working manifest

Copy the canonical [`project.yml`](../../tailrocks-swift-project-setup/templates/project.yml)
and replace the marked values. The shape below is
known to generate and build:

```yaml
name: App
options:
  bundleIdPrefix: com.example
  deploymentTarget:
    macOS: "26.0"
targets:
  App:
    type: application
    platform: macOS
    sources:
      - path: Sources
        type: syncedFolder
    info:
      path: Sources/Info.plist
      properties:
        CFBundleName: App
        CFBundlePackageType: APPL
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.example.App
        GENERATE_INFOPLIST_FILE: NO
        CODE_SIGN_IDENTITY: "-"
```

`type: syncedFolder` is the load-bearing line. Without it, every added file
mutates the generated project and the "no diff" property is lost.

## Version control

Commit the manifest. Ignore the generated project:

```gitignore
*.xcodeproj
*.xcworkspace
.build/
DerivedData/
```

Regenerate as the first step of every build task so a clean checkout is always
buildable. If a contributor needs the graphical editor, they generate first.

## Signing for local runs

Ad-hoc signing is sufficient for building, launching, capturing, and driving the
app locally. It needs no developer account and no team:

```
CODE_SIGN_IDENTITY = "-"
ENABLE_HARDENED_RUNTIME = NO
```

Verify with `codesign -dv`, which reports an ad-hoc signature. Real signing,
hardened runtime, entitlements, and notarization belong to the distribution
pipeline, not the development loop, and adding them early makes every local
iteration slower for no gain.

## Build invocation

```sh
xcodebuild -list -project App.xcodeproj -json

set -o pipefail
xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
  -derivedDataPath "$HOME/Library/Developer/AppBuild" build | xcbeautify
```

**The derived data path must not be under a temporary directory.** An application
bundle launched from `/tmp` or `/private/tmp` loses its windows within seconds,
which breaks every visual verification downstream and produces a confusing,
intermittent failure.

`set -o pipefail` is mandatory when piping through a formatter, or the pipeline
reports the formatter's exit status and every build appears to succeed.

Use `xcbeautify`. The older alternative is dormant and cannot parse the current
test framework's output at all.

## Structure

```
App/
├── project.yml
├── mise.toml
├── .swift-format
├── .swiftlint.yml
├── Sources/
│   ├── Info.plist
│   ├── App.swift
│   ├── Features/
│   └── Components/
├── Tests/
├── UITests/
├── Design/
└── Scripts/
    ├── window-id.swift
    └── capture.sh
```

`Design/` holds the artifacts produced by the design skill — brief, component
map, contracts, state matrix, approved captures. `Scripts/` holds the visual
verification harness. Both belong in the repository so an agent finds them
without being told.
