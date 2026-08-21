# Plan 002: Sync process, queue, and backoff

## Status

DONE.

## Spec contract

Covers F1 (detect upstream changes and refresh) and F3 (retry without
operator action), per `spec/sync.md`. Constrained by D1 (separate process),
D2 (Postgres advisory locks), and D3 (backoff capped at ten minutes).

## Must NOT

- N1 — no inline sync in an HTTP worker. The loop runs in the sync process
  only; an HTTP handler that performs a sync inline fails this plan.

## Scope

In: `crates/loom/**`.
Out: transport and subscription publishing (003), the workspace header (004),
any caching of workspace contents.

## Done criteria

`cargo test -p loom` passes, and a contended advisory lock yields rather than
spins.

## STOP conditions

Stop if the backoff ceiling has to exceed ten minutes — that reopens D3.
