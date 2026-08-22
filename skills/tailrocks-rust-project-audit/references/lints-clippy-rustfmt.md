# Lints, Clippy, and Rustfmt

Load this reference when installing or changing compiler, Clippy, or formatter
policy. The templates are the source of truth.

## Policy shape

- Put workspace policy in `[workspace.lints]`; every member declares
  `[lints] workspace = true`.
- Deny Rust correctness, compatibility, unused, unsafe, and public-reachability
  problems in the manifest.
- Deny `clippy::all`; warn on `pedantic` and `cargo`; CI promotes warnings with
  `-D warnings`.
- Cherry-pick restriction lints. The complete `restriction` group is invalid
  policy because it contains contradictory and context-dependent rules.
- Let cargo-shear own unused dependency detection and cargo-deny own duplicate
  versions; avoid competing lints with target/feature false positives.

The house baseline forbids unsafe code, unchecked indexing/slicing, production
panic/unwrap/expect, blocking calls on runtime threads, ignored errors, wildcard
matching/imports, and hidden non-`Send` futures. Missing public docs and excessive
complexity are warnings and therefore CI failures.

## Suppression

Fix the design first. A genuine false positive uses `#[expect(lint, reason =
"...")]` at the smallest item or statement. The expectation must become stale
when the finding disappears. Crate-wide allows require a documented compatibility
boundary and removal condition.

## Ratchets

Measure current maxima before adoption. Set complexity thresholds just above the
clean baseline, then only lower them. A new violation is refactored or receives a
narrow expectation; thresholds never rise to accommodate one change.

## Formatter

Use stable rustfmt with edition and style edition 2024. Gate `cargo fmt --check`.
Nightly-only import/comment options belong in a separate explicitly pinned job,
never in the stable baseline.

## Completion check

Every member inherits policy, every enabled lint has one owner, every suppression
is narrow and reasoned, current code passes with `-D warnings`, and thresholds can
only ratchet downward.
