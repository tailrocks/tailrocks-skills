# Verification lane criteria

Place checks by measured feedback cost:

- **PR blocking:** formatting, compile and typecheck, strict
  lint, normal tests, architecture, unused dependency and code,
  lock integrity, supply-chain, docs, and short risk-earned
  parser fuzz smoke
- **Merge readiness:** full workspace and build, doctests,
  feature powerset, production and SSR, semver, and
  environment-backed integration
- **Scheduled advisory:** beta and nightly canaries,
  interpreters, careful execution, concurrency models,
  sanitizers and fuzzing, mutation and coverage trends,
  performance, custom rules, and dependency rehearsals.

Every lane has pinned tools and actions, a timeout, a local
core command, a structured artifact and summary, an owner, and
a correction path. Advisory failures stay visible. Promotion
or demotion needs measured runtime, near-zero false positives,
a named failure class, and an owner. Benchmark and profiling
profiles never masquerade as shipped behavior.
Nightly-dependent tools stay isolated from stable PR gates.
