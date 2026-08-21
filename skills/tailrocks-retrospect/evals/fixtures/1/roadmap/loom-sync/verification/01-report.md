# Verification round 01 — loom-sync

- **Ran**: 2026-05-11
- **Against**: `plan/` 002, 003, 004, executed at `b7d7781`
- **Verdict**: BLOCKED

## What execution proved

- 002 sync process — ran with the upstream unreachable; the loop retried
  under the ceiling and yielded on a contended lock. PASS.
- 003 publish sync state — a state change reached a subscribed client
  carrying its observation timestamp. PASS.
- 004 workspace header — with the subscription dropped, the badge kept
  rendering the last known state as `fresh` and never fell back to unknown.
  FAIL.

## Blocking defects

- **V1 — the header presents an unconfirmed state as fresh** (S1, B1, and the
  ledger's N2). A dropped subscription leaves the badge
  asserting freshness the service has not confirmed this session, which is
  exactly what round 01's feedback reported. Blocking: yes.

## Non-blocking observations

- The retry ceiling is reached at eight minutes rather than ten; inside the
  backoff decision, recorded so a later round does not re-file it.
