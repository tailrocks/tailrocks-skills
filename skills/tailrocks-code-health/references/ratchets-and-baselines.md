# Ratchets and Baselines

A baseline makes brownfield debt explicit without blessing growth. Two provider
types cover most enforcement:

- **Numeric:** key to upper bound. `measured > bound` fails growth;
  `measured < bound` fails stale policy and instructs tightening; equality passes.
- **Presence:** listed violations are existing debt; any unlisted violation fails;
  resolved entries must be deleted.

Useful providers include suppressions per lint/module, file-size outliers, public
surface size, dependency cycles/forbidden edges, flaky or skipped tests, unsafe
sites, direct dependency exceptions, unvalidated boundary casts, and docs/source
freshness violations.

Coverage and mutation scores become blocking only for named critical surfaces
after stable measurement. Repository-wide percentage targets are weak proxies and
encourage low-value tests.

Keep one ratchet file and one engine. Legacy allowlists/budget files become shims
or migrate into the unified schema. Each provider defines deterministic ordering,
repository-relative keys, exclusions, and a narrow rerun command.

Adoption sequence:

1. Measure without fixes.
2. Read representative findings and reject noisy/no-op metrics.
3. Freeze exact current debt.
4. Block unlisted growth.
5. Burn down in coherent changes.
6. Tighten automatically whenever measured debt falls.

Never import another repository's counts or thresholds. Borrow the shrink-only
mechanism; derive bounds from the current project.

Prior art: Jackin code-health branch
<https://github.com/jackin-project/jackin/tree/chore/rust-code-health-roadmap>.
