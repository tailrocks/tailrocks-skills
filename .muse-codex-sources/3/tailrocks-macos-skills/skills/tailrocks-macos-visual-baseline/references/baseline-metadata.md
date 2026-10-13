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
