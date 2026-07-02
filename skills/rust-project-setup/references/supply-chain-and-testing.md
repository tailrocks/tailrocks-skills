# Supply Chain and Testing

Use this reference to wire the supply-chain and test gates: cargo-deny,
cargo-audit, cargo-shear, cargo-hack, and cargo-nextest. All are installed
through mise (see `toolchain-and-mise.md`). Test *authoring* — what to assert,
error-path coverage, doc tests, snapshots — lives in the `rust-best-practices`
skill (`references/errors-testing-docs.md`); this file is about the runners and
policy gates.

## Contents

- cargo-nextest
- cargo-deny
- cargo-audit
- cargo-shear
- cargo-hack
- How the gates layer in CI

## cargo-nextest

The default test runner. Faster, clearer output, and per-test process isolation.

```bash
cargo nextest run --workspace --all-features --locked
```

- Config in `.config/nextest.toml` (`templates/.config/nextest.toml`): a
  `slow-timeout` to catch hung tests, `failure-output` for readable failures, and
  `test-groups` to serialize tests that share a port, container, or the
  filesystem.
- **nextest does not run doctests.** Always keep a separate step:

  ```bash
  cargo test --workspace --doc --locked
  ```

## cargo-deny

Deterministic policy over the dependency graph. Config in `deny.toml`
(`templates/deny.toml`).

```bash
cargo deny check advisories licenses bans sources
```

- **advisories** — RustSec vulnerability and yanked-crate check. `yanked =
  "deny"`. Accept a specific advisory only with a written reason and a revisit
  trigger.
- **licenses** — an **allowlist**: `["Apache-2.0", "MIT"]`. Anything else fails
  until you add a version-pinned exception with a comment. This keeps the license
  posture a deliberate ledger, not an accident of transitive deps.
- **bans** — deny unwanted crates (for example `openssl`, preferring
  rustls/aws-lc-rs), forbid `*` wildcard requirements, and warn on duplicate
  versions. Record existing duplicate debt as pinned `skip` entries so only *new*
  drift trips the gate.
- **sources** — crates.io is the only allowed registry; git and unknown sources
  are denied without an explicit allow.
- **workspace-dependencies** — `unused = "deny"` fails when a member declares a
  `path =` sibling it never consumes, keeping the crate graph honest.

## cargo-audit

A standalone RustSec advisory gate, run on every PR that changes `Cargo.lock`:

```bash
cargo audit
```

Running it **in addition to** `cargo deny check advisories` is deliberate: the PR
gate catches a newly introduced vulnerable dependency immediately, without
waiting for a scheduled hygiene job. Mirror any advisory `ignore` entries between
`deny.toml` and `.cargo/audit.toml`, with the same rationale comment in both, so
the two gates agree on accepted risk.

## cargo-shear

Detects unused dependencies and unlinked source files.

```bash
cargo shear                 # report
cargo shear --fix           # remove unused deps
```

Run it PR-blocking in CI. It covers the dead-dependency class more precisely than
the `unused_crate_dependencies` rustc lint (which has false positives across
Cargo targets), so keep that rustc lint off and let shear own this.

## cargo-hack

Verifies the crate compiles under real feature combinations, not just the
all-features build:

```bash
cargo hack check --workspace --feature-powerset --all-targets --locked
```

`--feature-powerset` builds every combination of features, catching the classic
bug where a type or import is only available under feature A but used under
feature B. It is heavier, so run it in a scheduled or pre-release job rather than
on every push.

## How the Gates Layer in CI

Split the checks by cost and cadence:

- **Every PR (fast):** `cargo fmt --check`; `cargo clippy ... -D warnings`;
  `cargo nextest run`; `cargo test --doc`; `cargo deny check licenses bans
  sources`; `cargo audit`; `cargo shear`.
- **Scheduled / pre-release (heavier):** `cargo deny check advisories` (so a new
  advisory against an unchanged lockfile is caught even with no PR); `cargo hack
  check --feature-powerset`; the MSRV-floor build.

Run every command through its `mise run` task so the CI invocation is identical
to the local one and any failure reproduces with a single command.
