# Supply Chain and Testing

Load this reference when assigning quality gates and cadence.

## Every pull request

- `cargo fmt --check` and strict workspace Clippy.
- nextest plus separate doctests; nextest does not run doctests.
- cargo-deny license, ban, source, and advisory policy.
- cargo-audit for immediate RustSec lockfile review.
- cargo-shear for unused/misplaced dependencies and unlinked files.
- cargo-vet when the repository carries `supply-chain/` audits and exemptions.

Initialize cargo-vet once, commit `supply-chain/config.toml` and
`supply-chain/audits.toml`, and make new exemptions explicit review decisions.
Shrink exemptions over time; protect audit files with security code owners.

## Scheduled or pre-release

- cargo-hack over the feature powerset.
- cargo-llvm-cov through nextest; use coverage to find untested behavior, not as
  a substitute for assertions.
- cargo-semver-checks for every published library crate.
- cargo-mutants for critical domain logic; surviving mutants identify weak tests.
- cargo-fuzz for parsers, protocol inputs, and unsafe-sensitive boundaries.
- cargo-careful for extra standard-library debug assertions and runtime UB checks
  on code that Miri cannot execute.
- Miri on pure crates and unsafe-sensitive code, using multiple seeds where
  practical; Loom for small concurrency algorithms whose interleavings matter.
- Dylint only for a project invariant shipped lints cannot express. Keep its lint
  crate outside the stable workspace, pin its nightly, specify UI tests, start in
  an advisory lane, measure false positives, then promote.
- MSRV/latest dependency builds only when the project promises an older MSRV;
  the house default supports current stable only.

## Dependency policy

Keep crates.io as the only default registry, deny wildcard and unreviewed git
dependencies, allowlist licenses, ban unwanted native TLS, and ledger duplicate
versions. Cargo-deny answers policy/advisories; cargo-vet answers whether
third-party code has been reviewed to the required criteria. Both are required
for high-assurance services.

## Completion check

Every gate has one owner and cadence, every accepted advisory/exemption has a
reason and revisit condition, doctests run separately, and critical parsers and
domain rules receive generative, fuzz, coverage, or mutation evidence
proportionate to their risk.
