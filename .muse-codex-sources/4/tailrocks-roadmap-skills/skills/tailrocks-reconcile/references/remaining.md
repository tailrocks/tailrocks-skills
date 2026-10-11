# Pruning and Remaining — the read of the next round

Rounds repeat: plan, execute, record feedback, prove,
reconcile. Without a pruning pass every round pays to
re-derive state: the truly finished plans, the still-open
defect, the actual proof of the last verification. `##
Remaining` in the item is that derivation, done once, in the
terms of the user, backed by evidence gathered this pass.

## Pruning is by status, never by deletion

A finished row leaves the working set when marked terminal in
the writable hub (`roadmap/<slug>/plan/README.md`). It never
leaves by a cut from the manifest:

- `goal/check.sh` counts hub rows. A manifest with no DONE
  row is `BLOCKED malformed=status-table`. A deleted row
  silently shrinks the coverage that the gate measures.
- The coverage ledger points at plan numbers. A deleted row
  dangles the traceability of the ledger against a file that
  the fingerprint still hashes.
- The plans themselves (`plan/NNN-*.md`) are frozen. Rows
  describe them. A row without its plan is a lie that the
  gate never sees.

Pruning buys a cheaper next round. Record the verified-at
SHA beside each confirmed row. The next pass re-confirms it
from an empty in-scope diff instead of a full criteria
re-run. An in-scope change means real re-verification of the
row. Only a row confirmed by this skill carries a
verified-at SHA. A claim of an executor never earns one.

## Writing `## Remaining`

One line per open fact, written as an observable statement:
the untrue fact, from outside the code:

```markdown
## Remaining

- Sessions filtered by project still show archived sessions (round 3, blocking).
- Opening a session from the list does nothing when the CLI is not running.
- Plan 006 (preferences pane) is not started.
```

Sources, in order:

1. Blocking defects in the highest-numbered
   `verification/NN-report.md`, with its `VIOLATED`
   decision rows, which are blocking.
2. Defects in the newest `verification/NN-feedback.md` that
   the report never cleared. A user-reported defect that
   nobody re-tested is still open.
3. Nonterminal hub rows, one statement each, with the plan
   number named.

Rules:

- **Delete the disproved facts.** A statement whose defect
  no longer reproduces, or whose row just went DONE, comes
  out and moves into `REPORT.md` with its evidence (format:
  [`delivery-report.md`](delivery-report.md)). A Remaining
  that only grows is a changelog, and the item carries no
  history. The report is the home of proven work.
- **Tag the unclosable facts.** A statement whose next act
  is not another execution round carries its back-edge in
  the line: `(needs-decision: <the unsettled user fact>)`
  routes to `tailrocks-record-decision`,
  `(needs-research: <the open fact>)` routes to
  `tailrocks-research`. An untaggable statement is execution
  work. A tagged one is the signal where the close-out names
  the right skill instead of re-running an unclosable loop.
- Observable statements, not tasks. "Filter ignores archived
  sessions" is evidence. "Fix the filter" is a plan, and
  plans are frozen elsewhere.
- No wishes. Uncommitted improvements belong in the own
  sections of the item or in a new idea, never here.
- Every statement traces to a read of this pass. Nothing
  enters Remaining from memory, from a transcript, or from a
  claim.
- The `Remaining` column of the roadmap index is the count
  of these statements, or `—` when nothing verified yet.

## The meaning of Remaining per status

- **`DONE`**: Remaining is empty, and that emptiness claims
  nothing left. Every row is terminal. The goal condition
  was met this session. The newest round holds no blocking
  defect. Only this skill sets it, and the same invocation
  retires the item out of the tree. The conditions, the
  refusals, and the two commits live in
  [`retirement.md`](retirement.md).
- **`IN EXECUTION`**: Remaining is the work order for the
  next round.
- **Any other status with an empty Remaining**: nobody
  verified yet. That fact differs from nothing left, and it
  never reads as DONE.
