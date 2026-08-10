# Visual regression

## Liquid Glass is not snapshottable from a detached view

Glass views snapshot **fully transparent** in detached-view snapshot testing.
Capturing them requires an application test host and a draw-in-key-window path
that exists only on the iOS-family strategy. A related AppKit defect affects
caching the display of glass-bezel buttons.

**Consequence: if the interface uses Liquid Glass, detached-view snapshots are
worthless.** Screen-capture the running application instead. This is the single
most common way a macOS visual suite ends up asserting on blank rectangles while
reporting green.

## What detached snapshots are still good for

Content-layer views with no glass: rows, cells, charts, custom drawing. Wrap the
view in a hosting controller — there is no direct SwiftUI strategy on macOS:

```swift
let controller = NSHostingController(rootView: MyRowView(item: .fixture))
controller.view.frame = CGRect(x: 0, y: 0, width: 1024, height: 768)
assertSnapshot(of: controller, as: .image)
```

Render into a 1x bitmap representation without a window. A window silently
contributes its title bar height to the captured image, which then bakes into
every baseline.

## Rendering previews to images

There is **no official headless path from a preview to a PNG.** The SwiftUI image
renderer exists but Apple states it renders only SwiftUI primitives and
substitutes a placeholder for views composited by Core Animation layers — which
covers most real application chrome. It is not a substitute for capturing the
running app.

## Diffing

```sh
magick compare -metric AE -fuzz 2% baseline.png candidate.png diff.png
odiff baseline.png candidate.png diff.png --threshold=0.1 --antialiasing
```

Both report a non-zero exit on difference. The second is substantially faster on
large sets.

Tolerances matter more than usual here: glass composites against live content, so
a small tolerance and antialiasing awareness prevent a suite that fails on every
run and is therefore ignored.

## What a diff can and cannot tell you

A pixel diff answers **"did the pixels change?"** It is the right tool for
catching an accidental regression in a screen nobody touched.

It cannot answer **"did the experience improve?"** That requires the rubric and a
reviewer who is not the implementing agent. Do not present a green diff as design
approval.

## Baselines

- Store baselines per state, named for the state, so a failure names itself.
- Re-baseline deliberately and in a separate commit from the change, so the diff
  of the baselines is reviewable.
- Re-baseline everything after an OS or SDK update. Window corner radius, control
  metrics, and material rendering all changed between macOS releases and will
  change again; a suite that was not re-baselined reports noise and gets muted.
- Record the macOS version, the SDK, the display scale, and the appearance
  alongside each baseline set. A baseline without that metadata cannot be
  reproduced.

## Performance evidence

Apple publishes no numeric budget for glass and no Liquid Glass Instruments
template. Any per-surface maximum is invented; mark it as such if it appears in a
review.

The workflow Apple does point to: gather, measure, plan one change, implement,
observe. Capture a before and an after profile, and lock the fix in with a
performance test. Profile with the time profiler and the animation-hitch model on
the lowest-spec Apple silicon Mac you support, with an external display attached
— backdrop sampling cost scales with the sampled region.
