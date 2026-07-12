# Current Rust Stack Versions

Latest means latest stable release available now, including the latest stable
release series for pre-1.0 crates. Repository `main`, nightly, alpha, beta, and RC
builds are not newer stable versions. Use a prerelease only when explicitly
required and isolate it behind a documented upgrade trigger.

## Verified 2026-07-12

| Component | Current stable | Primary source |
|---|---:|---|
| Rust | 1.97.0 | <https://forge.rust-lang.org/> |
| Axum | 0.8.9 | <https://docs.rs/axum/latest/axum/> |
| Tokio | 1.52.3 | <https://crates.io/crates/tokio> |
| Tower | 0.5.3 | <https://crates.io/crates/tower> |
| tower-http | 0.7.0 | <https://crates.io/crates/tower-http> |
| cargo-nextest | 0.9.140 | <https://crates.io/crates/cargo-nextest> |
| cargo-deny | 0.20.2 | <https://crates.io/crates/cargo-deny> |
| cargo-audit | 0.22.2 | <https://crates.io/crates/cargo-audit> |
| cargo-shear | 1.13.1 | <https://crates.io/crates/cargo-shear> |
| cargo-hack | 0.6.45 | <https://crates.io/crates/cargo-hack> |
| cargo-llvm-cov | 0.8.7 | <https://crates.io/crates/cargo-llvm-cov> |
| cargo-semver-checks | 0.48.0 | <https://crates.io/crates/cargo-semver-checks> |
| cargo-vet | 0.10.2 | <https://crates.io/crates/cargo-vet> |
| cargo-mutants | 27.1.0 | <https://crates.io/crates/cargo-mutants> |
| cargo-careful | 0.4.10 | <https://crates.io/crates/cargo-careful> |
| cargo-dylint / dylint-link | 6.0.1 | <https://github.com/trailofbits/dylint> |

## Freshness gate

Before scaffolding or auditing:

1. Check Rust Forge and each crate's registry/docs release.
2. Replace stale values in `rust-toolchain.toml`, `Cargo.toml`, `clippy.toml`,
   `mise.toml`, this table, and generated lockfiles together.
3. Read release/migration notes for every major or pre-1.0 minor transition.
4. Run the full feature, lint, test, supply-chain, coverage, and semver matrix.
5. Stop on an incompatible latest-stable set; report the exact peer/MSRV conflict
   rather than silently retaining an older release.

Renovate tracks Rust toolchains natively. Use `config:best-practices`, pin the
toolchain, keep highest-version security fixes, and review all updates; automated
detection never replaces release-note and compatibility verification.
