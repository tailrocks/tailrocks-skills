# Rust Version Policy

Latest means latest stable release available now, including the latest stable
release series for pre-1.0 crates. Repository `main`, nightly, alpha, beta,
and RC builds are not newer stable versions. Use a prerelease only when
explicitly required and isolate it behind a documented upgrade trigger.

## Sources of truth

The collection baseline pins live only in the project-setup templates:

- [`rust-toolchain.toml`](../../tailrocks-rust-project-setup/assets/rust-toolchain.toml)
  owns the Rust channel.
- [`Cargo.toml`](../../tailrocks-rust-project-setup/assets/Cargo.toml) owns
  `workspace.package.rust-version` and every
  workspace dependency pin.
- [`clippy.toml`](../../tailrocks-rust-project-setup/assets/clippy.toml)
  owns `msrv`.
- [`mise.toml`](../../tailrocks-rust-project-setup/assets/mise.toml) owns every
  cargo tool version and the binstall pin.

After installation, the target project's committed artifacts own its installed
pins. Audit compares those artifacts with current stable evidence and the
collection baseline. Remediation updates the target artifacts and lockfiles
together without turning prose into another pin ledger.

**Do not copy those versions into prose or another ledger.** A second copy has
no reader and no gate, so it goes stale silently. It then contradicts the
artifact it claims to describe, which is worse than being absent, because it
reads as current. The channel, `rust-version`, and `msrv` say the same thing in
three files because three tools each need it in their own format. A check
asserts that they agree rather than trusting anyone to remember.

## Primary release sources

| Component | Primary source |
| --- | --- |
| Rust | <https://forge.rust-lang.org/> |
| Axum | <https://docs.rs/axum/latest/axum/> |
| Tokio | <https://crates.io/crates/tokio> |
| Tower | <https://crates.io/crates/tower> |
| tower-http | <https://crates.io/crates/tower-http> |
| cargo-nextest | <https://crates.io/crates/cargo-nextest> |
| cargo-deny | <https://crates.io/crates/cargo-deny> |
| cargo-audit | <https://crates.io/crates/cargo-audit> |
| cargo-shear | <https://crates.io/crates/cargo-shear> |
| cargo-hack | <https://crates.io/crates/cargo-hack> |
| cargo-llvm-cov | <https://crates.io/crates/cargo-llvm-cov> |
| cargo-semver-checks | <https://crates.io/crates/cargo-semver-checks> |
| cargo-vet | <https://crates.io/crates/cargo-vet> |
| cargo-mutants | <https://crates.io/crates/cargo-mutants> |
| cargo-careful | <https://crates.io/crates/cargo-careful> |
| cargo-dylint / dylint-link | <https://crates.io/crates/cargo-dylint> |
| cargo-binstall | <https://crates.io/crates/cargo-binstall> |

Resolve current stable releases with native registry queries. Query the
crates.io API for one crate at a time. Read its maximum stable version from
the response:

```sh
curl --fail --silent https://crates.io/api/v1/crates/serde
```

The scheduled refresh runs these queries and opens the bump as a reviewable
pull request.

## Freshness

Version drift is a fact about the day, not about the change under review, so it
is not a gate on your work. A scheduled refresh resolves current stable, rewrites
the template pins, and opens the bump as a reviewable pull request. What stays
yours:

1. Read release and migration notes for every major or pre-1.0 minor transition
   in that pull request. An automated bump proves that a version exists, never
   that it is compatible.
2. Run the full feature, lint, test, supply-chain, coverage, and semver matrix
   before accepting it.
3. Stop on an incompatible latest-stable set. Report the exact peer or MSRV
   conflict rather than silently retaining an older release.

When working on a project that is not this repository, the same rule applies to
its pins. Audit resolves current stable and compares it with target artifacts
without changing them. Setup and approved remediation replace artifact values
and generated lockfiles together. No role leaves a version in prose to be
maintained by hand.
