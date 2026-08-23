<!-- tailrocks-code-health-audit:start -->
# Ratchet and Baseline Criteria

A baseline exposes brownfield debt without blessing growth:

- **Numeric:** `measured > bound` fails growth; `measured < bound` fails stale
  generous policy; equality passes.
- **Presence:** listed identities are existing debt; unlisted violations and
  stale resolved entries fail.

Providers use deterministic ordering, repository-relative keys, explicit
exclusions, and a narrow rerun. Useful measurements include lint suppressions,
file/public-surface size, dependency cycles/edges, flakes/skips, unsafe sites,
dependency exceptions, boundary casts, and docs/source freshness.

Coverage and mutation scores block only named critical surfaces after stable
measurement. Repository-wide percentage targets are weak proxies. The audit
rejects imported thresholds, unowned exceptions, non-deterministic identities,
growth that passes, or a lower measurement that leaves a stale bound green.
<!-- tailrocks-code-health-audit:end -->

## Mutation adapter

Establish measures without fixes, rejects noisy metrics, freezes exact current
debt, and blocks unlisted growth. Tighten lowers numeric bounds or deletes
resolved presence entries. It never raises a cap, adds an exception, changes the
oracle, or absorbs a regression.
