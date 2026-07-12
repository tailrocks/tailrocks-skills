# Verification Lanes

Partition by feedback cost, not importance.

## PR blocking

Formatting, compile/typecheck, strict lints, focused/full normal tests,
architecture, unused dependency/code checks, lockfile integrity, supply-chain
policy, docs links/commands, and a short parser fuzz smoke where risk justifies it.

## Merge readiness

Full workspace/build, doctests, feature powerset, production build/SSR tests,
semver checks for published libraries, and environment-backed integration tests.

## Scheduled advisory

Latest beta/nightly compiler canaries, Miri, cargo-careful, Loom models,
sanitizer fuzzing, longer corpora, mutation testing, coverage trends, cold-start
and build-time benchmarks, Dylint, and dependency update rehearsals.

Each lane pins toolchain/actions, sets timeout, stores structured output/artifacts,
and has a local core command. Advisory failures stay visible and owned. Promotion
requires stable runtime, near-zero false positives, a named failure class, and a
documented correction path. Demotion requires the same evidence and an owner.

Use separate profiles for release, profiling, fast local tests, and minimal-size
experiments only when measurements show different compiler settings serve real
goals. Never let a benchmark profile masquerade as shipped behavior.

Custom Dylint/Oxc/architecture rules begin advisory with specification tests.
Nightly-dependent tools use dated pins and stay isolated from the stable PR path.
