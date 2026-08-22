<!-- tailrocks-code-health-audit:start -->
# Verification Lane Criteria

Checks are placed by measured feedback cost:

- **PR blocking:** formatting, compile/typecheck, strict lint, normal tests,
  architecture, unused dependency/code, lock integrity, supply-chain, docs, and
  short risk-earned parser fuzz smoke.
- **Merge readiness:** full workspace/build, doctests, feature powerset,
  production/SSR, semver, and environment-backed integration.
- **Scheduled advisory:** beta/nightly canaries, interpreters, careful execution,
  concurrency models, sanitizers/fuzzing, mutation/coverage trends, performance,
  custom rules, and dependency rehearsals.

Every lane has pinned tools/actions, timeout, local core command, structured
artifact/summary, owner, and correction path. Advisory failures remain visible.
Promotion or demotion requires measured runtime, near-zero false positives, a
named failure class, and an owner. Benchmark/profiling profiles never masquerade
as shipped behavior; nightly-dependent tools stay isolated from stable PR gates.
<!-- tailrocks-code-health-audit:end -->

## Mutation adapter

Establish places only the approved selected gate. Tighten may promote it only
after the required evidence; cadence changes never hide a current failure.
