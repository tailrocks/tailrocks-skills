# Lints, Clippy, and rustfmt

Use this reference to configure or review the strict lint posture: the
`[workspace.lints.rust]` and `[workspace.lints.clippy]` tables, `clippy.toml`,
`rustfmt.toml`, the warnings policy, and suppression discipline. The full tables
are in `templates/Cargo.toml` and `templates/clippy.toml`; this file explains
what each choice buys and how to tune it.

## Contents

- Philosophy: deny first, allow with a reason
- The Rust lint table
- The Clippy lint table
- clippy.toml: thresholds and disallowed calls
- rustfmt
- Warnings policy
- Suppression discipline
- Canonical commands

## Philosophy: Deny First, Allow With a Reason

Start from the strictest posture that still ships, then carve out named
exceptions. This inverts the usual default: a lint is on until someone documents
why it is off, so strictness is the resting state and every relaxation is a
visible, reviewable decision. Silence individual lints — never whole groups —
and attach a reason.

## The Rust Lint Table

`[workspace.lints.rust]` (full table in `templates/Cargo.toml`). Broad groups set
a `deny` baseline at `priority = -1`; specific lints override.

| Entry | Level | Catches |
|---|---|---|
| `rust_2024_compatibility`, `future_incompatible` | deny | code that will break on a future compiler or edition |
| `rust_2018_idioms`, `nonstandard_style` | deny | dated idioms and off-convention names |
| `unused` (+ `unused_imports`, `unused_variables`, `unused_must_use`) | deny | dead inputs and ignored `#[must_use]` results |
| `dead_code`, `unreachable_pub` | deny | unreferenced items; `pub` wider than the crate needs |
| `unsafe_op_in_unsafe_fn`, `unsafe_attr_outside_unsafe`, `missing_unsafe_on_extern`, `never_type_fallback_flowing_into_unsafe` | deny | Rust 2024 unsafe-hygiene requirements |
| `unsafe_code` | **forbid** | any `unsafe`, anywhere (`forbid` cannot be locally overridden) |
| `unused_qualifications`, `unused_lifetimes`, `redundant_lifetimes`, `single_use_lifetimes` | deny | redundant paths and lifetimes |
| `trivial_casts`, `trivial_numeric_casts` | deny | casts that widen or no-op silently |
| `unnameable_types`, `unit_bindings`, `macro_use_extern_crate`, `meta_variable_misuse`, `let_underscore_drop` | deny | leaky/legacy/foot-gun constructs |
| `missing_debug_implementations` | warn | public types without `Debug` |
| `async_fn_in_trait` | allow | stable and idiomatic in edition 2024 |

`unsafe_code = "forbid"` is workspace-wide. If exactly one crate needs FFI or
low-level memory work, override it to `deny` **on that crate only**, and pair it
with `clippy::undocumented_unsafe_blocks = "deny"` so every block carries a
`// SAFETY:` note.

## The Clippy Lint Table

`[workspace.lints.clippy]`:

- `all = { level = "deny", priority = -1 }` — correctness, suspicious, style,
  complexity, and perf. The floor.
- `pedantic = { level = "warn", priority = -1 }` — valuable but opinionated and
  prone to false positives, so **warn, not deny**. Silence individual pedantic
  lints (the `allow` block in the template) rather than dropping the group.
- `cargo = { level = "warn", priority = -1 }` — manifest hygiene: metadata,
  feature names, duplicate dependencies.
- **Never-ship denies:** `dbg_macro`, `todo`, `unimplemented`, `panic`,
  `unwrap_used`, `expect_used`, `manual_assert`, `print_stdout`, `print_stderr`.
- **Layout/hygiene denies:** `mod_module_files` (enforces the no-`mod.rs` rule),
  `undocumented_unsafe_blocks`, `multiple_unsafe_ops_per_block`, `mem_forget`,
  `disallowed_methods` (configured in `clippy.toml`).
- **Maintainability warns:** `too_many_lines`, `cognitive_complexity`,
  `excessive_nesting`, `large_enum_variant`, `result_large_err`,
  `clone_on_ref_ptr`, `str_to_string`, `match_bool`, `manual_let_else`, and
  peers. Kept at `warn`; CI's `-D warnings` still fails on them, so they gate PRs
  without hard-erroring interactive builds.

Do **not** enable `clippy::nursery` or `clippy::restriction` wholesale.
`restriction` deliberately contains mutually contradictory lints and will fire on
perfectly good code; cherry-pick an individual restriction lint only when it
encodes a real local rule, with a reason.

## clippy.toml: Thresholds and Disallowed Calls

`templates/clippy.toml`:

- **Test ergonomics:** `allow-unwrap-in-tests`, `allow-expect-in-tests`,
  `allow-panic-in-tests`, `allow-print-in-tests` = `true`. Test code keeps its
  concise panicking helpers while production code cannot.
- **Complexity ceilings:** `too-many-lines-threshold`,
  `cognitive-complexity-threshold`, `excessive-nesting-threshold`,
  `too-many-arguments-threshold`. Set each just above your current maximum so
  nothing fires on adoption day, then **ratchet the numbers down** over time.
  Grandfather a stubborn case with a narrow `#[expect(clippy::too_many_lines,
  reason = "...")]`.
- **`disallowed-methods`:** ban thread-blocking calls (`std::thread::sleep`,
  `std::process::Command::output`, blocking file opens) so they cannot land on an
  async runtime or an event/render loop. Each entry carries the reason Clippy
  prints. A legitimate exception (startup, a build helper, an owned OS thread)
  uses a local `#[expect(clippy::disallowed_methods, reason = "...")]`.

## rustfmt

`templates/rustfmt.toml`. Formatting is mechanical and non-negotiable: run
`cargo fmt` before every commit; gate `cargo fmt --check` in CI.

- `edition = "2024"` and `style_edition = "2024"` — parse and format to the Rust
  2024 style guide (trailing commas, let-else indentation, updated chain and
  match formatting). Keep both in lockstep with the crate edition.
- Stricter import and comment hygiene — `imports_granularity = "Crate"`,
  `group_imports = "StdExternalCrate"`, `wrap_comments`,
  `format_code_in_doc_comments` — is **nightly-only** today. It is commented out
  in the template to keep `cargo fmt` working on the pinned stable toolchain.
  Enable it only if the project standardizes on `cargo +nightly fmt` in a
  dedicated CI job; that is the documented upgrade path when you want maximal
  import determinism.

## Warnings Policy

Enforce zero-warnings in **CI**, not in the manifest.

- Gate every check with `-D warnings` (see the commands below).
- Do **not** bake `#![deny(warnings)]` or `warnings = "deny"` into crates. A new
  compiler or Clippy release adds warnings; a manifest-level deny would then
  brick local builds the moment you bump the toolchain, for warnings you have not
  triaged yet. The CI flag fails PRs on warnings while letting the project ride
  each new stable toolchain safely.

## Suppression Discipline

- Fix the finding first. Suppress only when the lint is knowingly wrong or fights
  a clearer design.
- Prefer `#[expect(lint_name, reason = "...")]` over `#[allow(lint_name)]`.
  `expect` is itself linted when the underlying warning disappears, so stale
  suppressions get reported instead of accumulating.
- Suppress at the **smallest** scope — the item or statement, never the crate.
- A code path that is intentionally unused gets `#[expect(dead_code, reason =
  "...")]`, never a blanket crate-level `#[allow(dead_code)]`.
- Never add broad allows to make a check pass. If many warnings are genuinely
  acceptable for the project, encode that as a named entry in the central lint
  table with a comment.

## Canonical Commands

```bash
cargo fmt --check
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
```

- `--workspace --all-targets` covers every crate's libs, bins, tests, benches,
  and examples.
- `--all-features` when features are additive; adjust when a project has mutually
  exclusive features (then pair with `cargo hack`, see the supply-chain
  reference).
- `--locked` verifies `Cargo.lock` is current.
- `-D warnings` turns the whole strict posture into a hard gate without any
  manifest-level `deny(warnings)`.
