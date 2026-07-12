# Toolchain and Mise

`rust-toolchain.toml` is the single Rust version source. The house baseline pins
current stable Rust 1.97.0 plus Clippy, rustfmt, and LLVM coverage tools. Keep
`workspace.package.rust-version` equal when only latest stable is supported.

Mise owns every cargo tool at an exact version. Commit `mise.toml` and
`mise.lock`; local and CI invoke the same `mise run` tasks. Upgrade the Rust pin,
Clippy policy, cargo tools, and lockfile deliberately in one tooling change.

The template provides these gates:

| Task | Contract |
|---|---|
| `check` | all targets/features compile from the lockfile |
| `lint` | rustfmt plus Clippy with warnings denied |
| `test` | nextest plus doctests |
| `supply-chain` | deny, audit, and vet |
| `hygiene` | unused dependencies/files |
| `features` | feature powerset compiles |
| `coverage` | LLVM coverage through nextest |
| `semver` | published library compatibility |
| `mutants` | tests kill behavior mutations |

Run feature, coverage, semver, and mutation tasks on scheduled/pre-release jobs
when they exceed PR latency. Every task remains reproducible locally.

**Complete when:** no tool uses `latest`, Rust is declared once, lockfiles are
committed, and CI calls only committed mise tasks.
