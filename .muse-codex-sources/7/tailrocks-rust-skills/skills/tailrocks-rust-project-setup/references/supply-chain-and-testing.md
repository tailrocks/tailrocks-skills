# Supply Chain and Testing

Load this reference when assigning quality gates and cadence.

## Every pull request

- `cargo fmt --check` and strict workspace Clippy.
- Use nextest plus separate doctests. Nextest does not run doctests.
- cargo-deny for license, ban, and source policy only.
- cargo-audit for RustSec advisory, yanked, unmaintained, and unsound review.
- cargo-shear for unused/misplaced dependencies and unlinked files.
- cargo-vet when the repository carries `supply-chain/` audits and exemptions.

Cargo-deny and cargo-audit have distinct duties. Cargo-deny owns policy:
allowed licenses, banned crates, duplicate-version limits, and permitted
sources. Cargo-audit owns the RustSec database: advisories, yanked releases,
unmaintained crates, and unsound crates. Advisory exceptions live only in
`.cargo/audit.toml`. Never record one exception in two tools.

Initialize cargo-vet once, commit `supply-chain/config.toml` and
`supply-chain/audits.toml`, and make new exemptions explicit review decisions.
Shrink exemptions over time. Protect audit files with security code owners.

## Scheduled or pre-release

Select scheduled tools by risk. No change needs every tool below. Run
feature, coverage, semver, and mutation tasks on scheduled or pre-release
jobs when they exceed pull-request latency. Run fuzz, Miri, Loom, careful,
and Dylint only for code that earns them. Parsers, protocol inputs,
unsafe-sensitive boundaries, small concurrency algorithms, and inexpressible
invariants earn them. Routine changes do not.

- cargo-hack over the feature powerset.
- Run cargo-llvm-cov through nextest. Use coverage to find untested behavior,
  not as a substitute for assertions.
- cargo-semver-checks for every published library crate.
- Run cargo-mutants for critical domain logic. Surviving mutants identify weak
  tests.
- cargo-fuzz for parsers, protocol inputs, and unsafe-sensitive boundaries.
- cargo-careful for extra standard-library debug assertions and runtime UB checks
  on code that Miri cannot execute.
- Run Miri on pure crates and unsafe-sensitive code, using multiple seeds
  where practical. Run Loom for small concurrency algorithms whose
  interleavings matter.
- Dylint only for a project invariant shipped lints cannot express. Keep its lint
  crate outside the stable workspace, pin its nightly, specify UI tests, start in
  an advisory lane, measure false positives, then promote.
- Build MSRV/latest dependencies only when the project promises an older
  MSRV. The house default supports current stable only.

## Dependency policy

Keep crates.io as the only default registry, deny wildcard and unreviewed git
dependencies, allowlist licenses, ban unwanted native TLS, and ledger duplicate
versions. Cargo-deny answers policy. Cargo-audit answers advisories.
Cargo-vet answers whether third-party code has been reviewed to the
required criteria. Deny and audit run on every pull request. Vet runs when
the repository carries `supply-chain/` audits, and always for
high-assurance services.

## Completion check

Every gate has one owner and cadence, every accepted advisory or exemption
has a reason and revisit condition, and doctests run separately. Critical
parsers and domain rules receive generative, fuzz, coverage, or mutation
evidence proportionate to their risk. Routine changes need no heavy tool.
