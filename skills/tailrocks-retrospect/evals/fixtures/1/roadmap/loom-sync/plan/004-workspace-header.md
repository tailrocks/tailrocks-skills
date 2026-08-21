# Plan 004: Workspace header sync badge

## Status

DONE.

## Spec contract

Covers S1 (workspace header), W1 (change to header update), and B1, per
`spec/state.md`. Constrained by D4 (GraphQL subscription transport).

## Must NOT

- N2 — no unconfirmed state shown as fresh. A stale badge reads as stale.

## Scope

In: `web/src/**`.
Out: API and loom changes (002, 003).

## Done criteria

The badge reflects a sync state change without a reload, and a stale state
renders as stale.

## STOP conditions

Stop if the header needs a field the subscription does not publish.
