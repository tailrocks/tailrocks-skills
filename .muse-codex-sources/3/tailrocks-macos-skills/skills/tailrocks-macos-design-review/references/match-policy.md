# The match policy

How the real implementation is held to the baseline
`tailrocks-macos-visual-baseline` freezes from the signed-off prototype after
finalization.
The policy is region-scoped because "1:1" means different things for
different region classes — and a single whole-window zero-diff across two
binaries is guaranteed false failure dressed as rigor.

## Region classes decide the mode

`Regions.md` walks the feature's component map and assigns every visible
region one mode:

| Class (from the component map) | Match mode | Why |
|---|---|---|
| `CUSTOM` and content regions | **Pixel, budgeted.** Crop both captures to the region's rect and diff with the visual-regression protocol; per-region changed-pixel budget declared in `Regions.md`. | These regions are the design's own drawing; the prototype is their truth. |
| `NATIVE` and `NATIVE-COMPOSED` | **Structural.** Component present, placed in the right region, correct role, label, and state — checked through the accessibility tree, not pixels. | Native internals belong to the OS and change under it; pixel-matching them rewards a hand-drawn fake over the correct dynamic control. |
| Glass and vibrancy surfaces | **Pixel only under the identical backdrop**, with the budget reflecting material noise; otherwise structural plus the material owner's acceptance gate. | Glass composites whatever is behind it; without the deterministic backdrop the diff measures the desktop, not the design. |

`Regions.md` format — one row per region, executable as written:

```markdown
| Region | Class | Rect (pt, from top-left) | Mode | Budget |
|---|---|---|---|---|
| Live feed cluster | CUSTOM | 24,612 → 328,668 | pixel | ≤ 400 px |
| Session table | NATIVE | 244,52 → 1180,600 | structural | — |
```

## Cross-binary rules

Comparing prototype captures against real-app captures adds constraints a
same-binary regression run never meets:

- Both binaries launch through the same contract: same `--tr-scenario`,
  same `--tr-window` size, same `--tr-backdrop`, same appearance. A size
  or backdrop mismatch invalidates the run before the first diff.
- The window title is chrome, not design: keep titles identical via the
  contract, or exclude the title bar from every pixel region.
- Capture metadata names the producing binary and its version alongside
  the baseline fields (OS build, SDK, scale, color profile, appearance).
  A baseline that cannot say which app produced it cannot anchor a
  cross-binary claim.
- Diff mechanics are the visual-regression protocol — dimension precheck, profile
  normalization, the two-tool compare — run per cropped region. No other
  tool.

## What the policy does not cover

Hover and pressed states, motion, VoiceOver traversal, keyboard paths,
and the real accessibility settings matrix are not provable by static
captures. They are verified in the current-render and UI-test lanes, and
`SIGNOFF.md` names where each landed — a region-green report that stays
silent about them is claiming more than it measured.
