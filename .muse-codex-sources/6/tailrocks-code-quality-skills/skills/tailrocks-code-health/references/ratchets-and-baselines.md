# Ratchet and baseline criteria

A baseline exposes brownfield debt without blessing growth:

- **Numeric:** `measured > bound` fails growth. `measured <
  bound` fails stale generous policy. Equality passes.
- **Presence:** listed identities are existing debt. Unlisted
  violations and stale resolved entries fail.

Providers use deterministic ordering, repository-relative keys,
explicit exclusions, and a narrow rerun. Useful measurements
include lint suppressions, file and public-surface size,
dependency cycles and edges, flakes and skips, unsafe sites,
dependency exceptions, boundary casts, and docs-to-source
freshness.

Coverage and mutation scores block only named critical surfaces
after stable measurement. Repository-wide percentage targets are
weak proxies. The audit rejects imported thresholds, unowned
exceptions, non-deterministic identities, growth that passes, and
a lower measurement that leaves a stale bound green.
