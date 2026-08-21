# Coverage Ledger — loom-sync

Item: roadmap/loom-sync/README.md at commit `4b1c9de`, ingested 2026-05-10.

## Screens
| ID | Screen | Item anchor | Spec | Plans | Status |
|----|--------|-------------|------|-------|--------|
| S1 | Workspace header | §Screens/"Workspace header" | spec/state.md | 004 | covered |

## Capabilities
| ID | Capability | Item anchor | Spec | Plans | Status |
|----|------------|-------------|------|-------|--------|
| F1 | Detect upstream changes and refresh | §Capabilities | spec/sync.md | 002 | covered |
| F2 | Expose per-workspace sync state | §Capabilities | spec/state.md | 003 | covered |
| F3 | Retry without operator action | §Capabilities | spec/sync.md | 002 | covered |

## Flows
| ID | Flow | Screens touched | Spec | Plans | Status |
|----|------|-----------------|------|-------|--------|
| W1 | Change to header update | S1 | spec/state.md | 004 | covered |

## Must-not anchors
| ID | Statement | Reason | Registry |
|----|-----------|--------|----------|
| N1 | No inline sync in an HTTP worker | Worker starvation | spec/README.md |
| N2 | No unconfirmed state shown as fresh | Truthfulness | spec/README.md |
| N3 | No second workspace cache | Single authority | spec/README.md |

## Quality bar
| ID | Statement anchor | Spec scenario(s) | Status |
|----|------------------|------------------|--------|
| B1 | §Quality bar | spec/state.md#stale-agreement | covered |

## Decisions (constraints)
| ID | Decision | Dated | Constrains |
|----|----------|-------|------------|
| D1 | Separate process | 2026-05-04 | 002 |
| D2 | Postgres advisory locks | 2026-05-04 | 002 |
| D3 | Backoff capped at ten minutes | 2026-05-04 | 002 |
| D4 | GraphQL subscription transport | 2026-05-09 | 003, 004 |

## Research questions
| ID | Question | Research topic | Status |
|----|----------|----------------|--------|
| Q1 | Advisory-lock queue behavior under contention | research/postgres-queueing/ | closed |
