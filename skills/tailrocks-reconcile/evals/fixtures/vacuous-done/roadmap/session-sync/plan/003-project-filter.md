# 003 — Project filter

Planned at commit `4c1a9d0`. Covers F2, S1. In-scope paths:
`crates/session-ui/src/filter.rs`, `crates/session-core/src/query.rs`.

## Done criteria

1. `cargo nextest run -E 'test(project_filter_hides_archived)'` exits 0.
2. `cargo nextest run -p session-filters` exits 0.
3. `cargo clippy --workspace -- -D warnings` exits 0.

## Starting state

`crates/session-ui/src/filter.rs` has no archived-session handling.
