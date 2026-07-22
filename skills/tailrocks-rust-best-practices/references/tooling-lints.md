# Clippy, Docs, and Measurement (During Review and Authoring)

Read Clippy as a design signal, act on high-value lints, check docs, measure
performance claims, and suppress lints correctly.

**Configuration and CI setup live elsewhere.** The strict `[workspace.lints]`
tables, `clippy.toml`, `rustfmt.toml`, the toolchain, and the cargo-deny /
audit / shear / hack / nextest gates are owned by the
`tailrocks-rust-project-setup` skill. This file assumes that strict baseline is
already in place and focuses on working within it.

## Running the Checks

Prefer the project's `mise run` task wrappers so local and CI commands match.
The underlying commands:

```bash
cargo fmt --check
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
```

- `--workspace --all-targets` checks every crate's libraries, binaries, tests,
  benches, and examples.
- `--all-features` when features are additive; adjust when mutually exclusive
  (the project should have a `cargo hack` job for the matrix).
- `--locked` verifies the lockfile is current.
- `-D warnings` is the gate — it turns the whole strict posture into a hard
  failure without any manifest-level `deny(warnings)`.

## Reading Clippy as a Design Signal

The strict baseline runs `clippy::all` at deny and `pedantic`/`cargo` at warn.
Treat the output as a review to act on:

- A `warn` from `pedantic` is a prompt to look, not noise to silence. Fix it
  or record a deliberate `#[expect(..., reason = "...")]`.
- A denied lint (`unwrap_used`, `panic`, `dbg_macro`, `disallowed_methods`,
  `mod_module_files`) is a hard rule — restructure the code, do not reach for
  `#[allow]`.
- Complexity warnings (`too_many_lines`, `cognitive_complexity`,
  `excessive_nesting`) usually point at a function doing too much. Prefer
  splitting the responsibility over raising the threshold.

## High-Value Lints to Act On

Reliable signals of real improvement — fix rather than suppress:

- `redundant_clone`, `clone_on_copy`, `clone_on_ref_ptr` — avoidable
  allocation or a reference-count clone that should be explicit.
- `needless_borrow`, `needless_collect` — redundant work.
- `large_enum_variant`, `result_large_err` — a big variant inflates every
  value; box the large payload.
- `map_unwrap_or`, `manual_ok_or`, `unnecessary_wraps`, `manual_let_else` —
  clearer combinator or control-flow forms.
- `trivially_copy_pass_by_ref` — pass small `Copy` types by value.
- `str_to_string` — prefer `to_owned` / `String::from` for intent.

## Formatting

`cargo fmt` is mechanical and non-negotiable; run it before every commit and
never hand-format around it. If `cargo fmt --check` passes, formatting is
correct by definition — raise it in review only when it hides meaning.

## Rustdoc Checks

Run when public APIs or examples change:

```bash
cargo doc --no-deps
cargo test --workspace --doc --locked
```

- Act on `broken_intra_doc_links`, `missing_docs` (where the project opts in),
  `missing_panics_doc`, `missing_errors_doc`, and `missing_safety_doc`.
- Public docs tell users how to succeed and how failure behaves. Prefer
  examples that propagate errors with `?` over `unwrap`.

## Benchmarking and Profiling

- No performance claims without measurement, unless the change removes an
  obvious allocation, clone, lock, or repeated computation.
- Measure on optimized (release) builds. Use `cargo bench`, Criterion, or
  project-provided benchmarks; profile real workloads with `cargo flamegraph`,
  `samply`, or OS profilers rather than trusting a micro-benchmark alone.
- Confirm the delta exceeds benchmark noise and is relevant to the workload.
  Keep benchmark inputs deterministic.

## Suppression Policy

- Fix the finding before suppressing it.
- Suppress at the smallest scope — an item or statement, never the crate.
- Prefer `#[expect(lint_name, reason = "...")]` over `#[allow(lint_name)]`:
  `expect` is reported when the underlying warning disappears, so stale
  suppressions surface instead of lingering.
- Use `#[allow]` only when a lint is knowingly wrong or conflicts with a
  clearer design, and say why.
- Never add a broad crate-level allow to make a check pass. If many warnings
  are genuinely acceptable, that policy belongs in the central lint table
  (owned by `tailrocks-rust-project-setup`), with a comment — not scattered
  attributes.
