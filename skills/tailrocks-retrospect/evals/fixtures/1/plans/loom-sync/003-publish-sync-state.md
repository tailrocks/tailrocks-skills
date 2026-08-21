# Plan 003: Publish sync state over the subscription

## Status

DONE.

## Spec contract

Covers F2 (expose per-workspace sync state), per `spec/state.md`.
Constrained by D4 (GraphQL subscription transport).

## Must NOT

- N2 — no unconfirmed state shown as fresh. A publish that cannot name its
  observation time is not published.
- N3 — no second workspace cache. The loom is the single authority for
  workspace contents; this plan reads state, it does not store contents.

## Scope

In: `crates/api/src/subscription/**`, `crates/loom/src/state.rs`.
Out: any store of workspace contents in the API crate, the workspace header
(004), the sync loop itself (002).

## Done criteria

A state change in the loom reaches a subscribed client, and the payload
carries the observation timestamp.

## STOP conditions

Stop if serving sync state requires the API to hold workspace contents —
that contradicts N3 and is a decision for the item, not this plan.
