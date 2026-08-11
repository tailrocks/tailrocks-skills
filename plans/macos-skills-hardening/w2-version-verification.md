# W2 — Version verification ledger (session 2026-08-11)

Files compared: `skills/tailrocks-liquid-glass/references/platform-baseline.md`
("State of the platform" table) and
`skills/tailrocks-swift-project-setup/references/toolchain.md`
("State of the platform" table).

## Fact-by-fact result

| Fact | Value in both files | Status | Source fetched this session |
|---|---|---|---|
| Latest shipping macOS | 26.6.1 "Tahoe" | VERIFIED | Apple software lookup service `https://gdmf.apple.com/v2/pmv` — PublicAssetSets macOS 26.6.1, posted 2026-08-06 (queried live this session) |
| macOS 27 | "Golden Gate", beta, not shipping, "coming this fall" | VERIFIED | `https://www.apple.com/os/macos/` — "macOS 27 Golden Gate coming this fall."; release-notes index lists "macOS 27 Golden Gate Beta 5 Release Notes" (`https://developer.apple.com/tutorials/data/documentation/macos-release-notes.json`) |
| Shipping Xcode | 26.6 | VERIFIED | `https://developer.apple.com/tutorials/data/documentation/xcode-release-notes.json` — newest stable entry "Xcode 26.6 Release Notes" |
| Shipping Swift | 6.3 | VERIFIED | `https://developer.apple.com/tutorials/data/documentation/xcode-release-notes/xcode-26_6-release-notes.json` — "Xcode 26.6 includes Swift 6.3" |
| Shipping SDK | macOS 26.5 | VERIFIED | same page — "SDKs for … macOS 26.5 …" |
| Shipping host requirement | macOS 26.2+ | VERIFIED | same page — "Xcode 26.6 requires a Mac running macOS Tahoe 26.2 or later." |
| Beta Xcode | 27 beta (beta 5) | VERIFIED | `https://developer.apple.com/tutorials/data/documentation/xcode-release-notes/xcode-27-release-notes.json` |
| Beta Swift | 6.4 | VERIFIED | same page — "Xcode 27 beta 5 includes Swift 6.4" |
| Beta SDK | macOS 27 | VERIFIED | same page — "SDKs for iOS 27, … macOS 27 …" |
| Beta host requirement | macOS 26.4+ | VERIFIED | same page — "Xcode 27 beta 5 requires a Mac running macOS Tahoe 26.4 or later." |
| Xcode 27 Apple-silicon-only | yes | VERIFIED | same page — "Xcode 27 will only install and run on Apple silicon Macs." (162138432) |
| `ARCHS_STANDARD` drops x86_64 at target ≥ 27.0 | yes | VERIFIED | same page — "`ARCHS_STANDARD` … will no longer include x86_64 when `MACOSX_DEPLOYMENT_TARGET` … >= 27.0" (161837535) |
| Universal back-deploy floor | macOS 12 | VERIFIED | same page — "supports back deploying Universal (Intel and Apple Silicon) apps to macOS 12 and later" |

## Cross-file diff

One divergence found and fixed: `toolchain.md` said Universal back-deploy "to
older macOS"; `platform-baseline.md` and Apple's note say macOS 12. Aligned
`toolchain.md` to "macOS 12 and later". After the fix, no fact row differs
between the two files.

Note: a third-party article claimed macOS 26.6.2 exists; Apple's own software
lookup service lists 26.6.1 as the newest public release, so 26.6.1 stands.
