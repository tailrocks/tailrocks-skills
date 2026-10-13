# Visual regression

Liquid Glass is not snapshottable from a detached view: glass surfaces render
transparent and Core Animation-backed chrome may be replaced or omitted. The
candidate must therefore be the running application captured by exact window
ID. A preview renderer, detached hosting view, rectangle capture, or file whose
window ownership is not proven is invalid evidence.

## Comparison

Compare declared dimensions first. A mismatch blocks as an incompatible
environment unless the baseline explicitly declares another size. Require the
recorded color profile and normalize only untagged inputs exactly as the
baseline says.

Run the baseline-recorded comparison tools under fixed paths, bounded time,
bounded output, and no network. Interpret numeric changed-pixel output against
the explicit per-region budget; a tool exit code by itself is not the gate.
Reject malformed output, missing tools, saturation, and decompression or pixel
bounds as `BLOCKED`, never zero change.

Native regions are structurally compared through the accessibility oracle.
Content and custom regions use their recorded pixel budgets. Glass comparisons
require the identical backdrop. A whole-window zero-diff across a prototype and
production binary is invalid because native chrome and binary identity differ.

## Meaning

A pixel diff answers only “did the pixels change?” It cannot answer “did the
experience improve?” A green regression is not design approval; visible and
material judgment belongs to current-render verification and independent design
review.

<!-- tailrocks-macos-baseline-metadata:start -->
# Baseline metadata

Every baseline package records the producing repository and prototype revision,
blessing and acceptance-review digests, binary identity and version, harness
source digest, macOS build, SDK, backing scale, color profile, appearance,
scenario, window size, backdrop, region class and oracle, explicit pixel budget,
every PNG and sidecar digest, producing user, and UTC time.

The manifest enumerates the complete blessed matrix with unique safe relative
paths and bounded dimensions, pixels, bytes, rows, and artifacts. A missing,
extra, duplicated, stale, symlinked, escaped, or digest-mismatched entry makes
the package invalid. Re-freeze after an OS, SDK, binary, harness, blessing, or
matrix change; never silently reinterpret old bytes under new metadata.
<!-- tailrocks-macos-baseline-metadata:end -->
