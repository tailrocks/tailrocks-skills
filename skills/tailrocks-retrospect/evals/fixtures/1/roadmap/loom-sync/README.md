# Loom sync

- **Status**: SHIPPED
- **Slug**: loom-sync
- **Created**: 2026-05-04 · **Updated**: 2026-05-11
- **Plan**: plans/loom-sync/

## Intent

One background service keeps every workspace's cached index in step with the
upstream store, so the CLI and the web client never disagree about what a
workspace contains.

## Vocabulary

- **Loom**: the background sync service. _Avoid_: worker, daemon.

## Decisions

- 2026-05-04 — **Sync runs as a separate long-lived process, not a task inside
  the API server.** Because a sync stall must never hold an HTTP worker.
- 2026-05-04 — **The queue is backed by Postgres advisory locks rather than a
  broker.** Because the deployment already runs Postgres and adding a broker
  would widen the operational surface.
- 2026-05-04 — **Retries use exponential backoff capped at ten minutes.**
  Because upstream rate limits recover within that window.
- 2026-05-09 — **The web client subscribes to sync state over the existing
  GraphQL subscription transport.** Because a second transport would need its
  own auth story.

## Capabilities

- Detect upstream changes per workspace and refresh the cached index.
- Expose per-workspace sync state: fresh, syncing, stale, failed.
- Retry failed syncs without operator action.

## Screens

### Workspace header

- **Purpose**: show the workspace's sync state beside its name.
- **States**: fresh / syncing / stale / failed.
- **Design**: —

## Flows

1. Upstream change → detection → refresh → state published → header updates.

## Data & integrations

- Postgres: queue table and advisory locks.
- Upstream store: read-only HTTP API.

## References

- The upstream store's public API documentation.

## Research

## Must not

- MUST NOT hold an HTTP worker while a sync runs — the API server never
  performs sync work inline.
- MUST NOT surface a sync state the service has not confirmed this session;
  an unknown state is shown as unknown, never as fresh.
- MUST NOT add a second cache of workspace contents outside the loom.

## Quality bar

- A stalled upstream leaves the CLI and the web client showing the same
  stale state within one refresh interval.

## Open questions

## Open research questions

## Deferred

- Per-workspace sync scheduling policy — revisit when a workspace exceeds
  ten thousand indexed items.

## Log

- 2026-05-04 — tailrocks-idea — created (DRAFT).
- 2026-05-04 — tailrocks-brainstorm — shaped; moved to SHAPING.
- 2026-05-09 — tailrocks-research — linked the advisory-lock and backoff
  chapters.
- 2026-05-09 — tailrocks-finalize — moved to READY.
- 2026-05-10 — tailrocks-plan — package written; moved to PLANNED.
- 2026-05-11 — execution — all plans DONE.
