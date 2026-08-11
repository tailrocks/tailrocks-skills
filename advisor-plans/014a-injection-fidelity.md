# Injection-fidelity spike

Checked 2026-08-11 on macOS 26.6.1, Xcode 26.6, SDK 26.5. The scratch app had a
system toolbar, sidebar, custom `glassEffect`, hand-rolled translucent panel,
semantic secondary text, and color-only status dot. Real settings ran through
`state.sh with`, whose output confirmed restoration of all six managed keys.
Captures and sidecars are retained under `/tmp/advisor-014a/` on the executor.

Pixel counts compare RGB pixels whose largest channel delta exceeds 5. ImageMagick
was unavailable, so the same count was computed read-only with Pillow 11.3.0.

| State | Real capture | Injected capture | Different pixels | Verdict |
|---|---|---|---:|---|
| Dark appearance | `dark-real.png` | `dark-injected.png` | 338913 | app-level-only — `preferredColorScheme` does not reproduce the global appearance path |
| Reduce Transparency | `reduce-transparency-real.png` | `reduce-transparency-injected.png` | 241678 | app-level-only — debug state changed the app panel, not system chrome |
| Increase Contrast | `increase-contrast-real.png` | `increase-contrast-injected.png` | 1449098 | not-injectable — SwiftUI accessibility value is read-only |
| Reduce Motion | `reduce-motion-real.png` | `reduce-motion-injected.png` | 267584 | not-injectable — SwiftUI accessibility value is read-only; a static capture also cannot prove transition fidelity |
| Differentiate Without Color | `differentiate-without-color-real.png` | `differentiate-without-color-injected.png` | 481 | not-injectable — SwiftUI accessibility value is read-only |
| Accent color | `accent-real-unavailable.png` | `accent-injected.png` | 0 | not-injectable — no supported per-app override was found |
| Liquid Glass clear | `liquid-glass-clear-real-unavailable.png` | `liquid-glass-clear-injected.png` | 262662 | not-injectable — no read or injection API exists |
| Liquid Glass tinted | `liquid-glass-tinted-real-unavailable.png` | `liquid-glass-tinted-injected.png` | 0 | not-injectable — no read or injection API exists |

No row was system-faithful. Injection cannot green the acceptance gate, so
`state-matrix.md` is intentionally unchanged. Debug injection may test an app's
own fallback branch, but real-setting capture remains the authority.

Operational finding: the original `state.sh with` trap replaced a failed child
status with the restore command's success. The harness now preserves the child
status while still making restore failure fatal; a forced child exit 7 returned
7 after all restore lines passed.
