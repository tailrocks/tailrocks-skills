# Pruning and Remaining — What the Next Round Reads

Rounds repeat: plan, execute, record feedback, prove, reconcile. Without a
pruning pass every round pays to re-derive state — which plans are really
finished, which defect is still open, what the last verification actually
proved. `## Remaining` in the item is that derivation, done once, in the
user's terms, backed by evidence gathered this pass.

## Pruning is by status, never by deletion

A finished row leaves the working set when it is marked terminal in the
writable hub (`roadmap/<slug>/plan/README.md`). It is never cut out of the
manifest:

- `goal/check.sh` counts hub rows. A manifest with no DONE row is
  `BLOCKED malformed=status-table`; a deleted row silently shrinks the
  coverage the gate measures.
- The coverage ledger points at plan numbers. Delete a row and the ledger's
  traceability dangles against a file the fingerprint still hashes.
- The plans themselves (`plan/NNN-*.md`) are frozen. Rows describe them; a row
  without its plan is a lie the gate cannot see.

What pruning actually buys is a cheaper next round: record the verified-at SHA
beside each confirmed row, and the next pass re-confirms it from an empty
`git diff --stat <verified-at SHA>..HEAD -- <in-scope paths>` instead of a full
criteria re-run. An in-scope change means the row is re-verified for real.
Only a row confirmed by this skill carries a verified-at SHA — an executor's
claim never earns one.

## Writing `## Remaining`

One line per open thing, written as an observable statement — what is not yet
true, from outside the code:

```markdown
## Remaining

- Sessions filtered by project still show archived sessions (round 3, blocking).
- Opening a session from the list does nothing when the CLI is not running.
- Plan 006 (preferences pane) is not started.
```

Sources, in order:

1. Blocking defects in the highest-numbered `verification/NN-report.md`.
2. Defects in the newest `verification/NN-feedback.md` that the report did not
   clear — a user-reported defect nobody has re-tested is still open.
3. Nonterminal hub rows, one statement each, naming the plan number.

Rules:

- **Delete what this pass disproved.** A statement whose defect no longer
  reproduces, or whose row just went DONE, comes out. Remaining that only
  grows is a changelog, and the item carries no history.
- Observable statements, not tasks. "Filter ignores archived sessions" is
  evidence; "fix the filter" is a plan, and plans are frozen elsewhere.
- No wishes. Improvements nobody committed to belong in the item's own
  sections or a new idea — never here.
- Every statement traces to something read this pass. Nothing enters Remaining
  from memory, from a transcript, or from a claim.
- The roadmap index's `Remaining` column is the count of these statements, or
  `—` when nothing has been verified yet.

## What Remaining means per status

- **`DONE`** — Remaining is empty, and that emptiness is the claim that
  nothing is left: every row terminal, the goal condition met this session,
  and the newest round finding no blocking defect. Only this skill sets it,
  and the same invocation retires the item out of the tree — the conditions,
  the refusals, and the two commits are in [`retirement.md`](retirement.md).
- **`IN EXECUTION`** — Remaining is the work order for the next round.
- **Any other status with an empty Remaining** — nobody has verified yet. That
  is not the same as nothing being left, and it is never read as DONE.
