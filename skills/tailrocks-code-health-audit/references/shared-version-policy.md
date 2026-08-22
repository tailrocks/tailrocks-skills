# Version policy

Latest means the latest stable release and latest stable major available at the
time of work. For pre-1.0 packages, it means the latest stable release series.
Repository branches, nightly builds, alpha, beta, and release candidates do not
supersede a stable release. Use a prerelease only when explicitly required and
isolate it behind a documented upgrade trigger.

An incompatible latest-stable set is a blocker to report, not permission to
retain an older release or major silently. Resolve versions from the ecosystem's
primary release source, read release and migration notes for breaking
transitions, and prove peer, platform, and toolchain compatibility before
acceptance.

A minimum release age is forbidden.
Security advisories use the highest fixed version immediately; batching or
dependency-update delays never postpone a vulnerability fix.
