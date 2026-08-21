# Roadmap

| Slug | Status | Summary |
|---|---|---|
| `report-export-csv` | DRAFT | Export the reporting table as CSV |

## Log

- 2026-07-14 — `tailrocks-audit`: dropped candidate "switch the ORM to a
  query-builder" (direction lane). Rejected: contradicts
  `docs/adr/0002-data-layer.md`, which decided the current data layer and
  its tradeoffs deliberately. Do not resurface without new evidence that
  contradicts that decision.
- 2026-07-14 — `tailrocks-audit`: dropped candidate "add a second HTTP
  framework for the admin routes" (agent-legibility lane). Rejected: the
  admin routes were folded into the existing service in commit `9c1f0ab`,
  so the evidence is stale.
