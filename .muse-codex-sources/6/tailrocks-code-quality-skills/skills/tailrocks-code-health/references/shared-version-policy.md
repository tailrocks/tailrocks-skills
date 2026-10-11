# Version policy

Latest means the latest stable release and the latest stable major
available at the time of work. For pre-1.0 packages, it means the
latest stable release series. Repository branches, nightly builds,
alpha, beta, and release candidates never supersede a stable
release. Use a prerelease only when explicitly required. Isolate
it behind a documented upgrade trigger.

An incompatible latest-stable set is a blocker to report. It never
permits silent retention of an older release or major. Resolve
versions from the primary release source of the ecosystem. Read
release and migration notes for breaking transitions. Prove peer,
platform, and toolchain compatibility before acceptance.

A release-age delay is a documented supply-chain control, not a
forbidden practice. Renovate `minimumReleaseAge` holds each new
release until the configured age passes, so researchers and tools
can detect malicious packages first. A delay slows updates and
reduces supply-chain risk. No delay speeds updates and accepts
that risk. Security updates bypass the delay and land as soon as
Renovate detects them. Apply the highest fixed version
immediately. Never present one delay value as a universal best
practice. Record the selected value with its reason.

The source is the Renovate minimum-release-age guide, retrieved
2026-10-07.
