# The delivery report — `REPORT.md` and `delivery/<slug>.md`

The ledger of verified accomplishment for the item. `##
Remaining` answers "the untrue facts". The report answers
"the proven facts". It is the one artifact that survives the
item. A retiring folder takes everything else into git
archaeology. This file moves to `delivery/<slug>.md` in the
tree.

## Two homes, one file

- **During the loop**: `roadmap/<slug>/REPORT.md`, writable
  by `tailrocks-reconcile` only. Created on the first pass
  with proven content to record. Absent before that, never a
  placeholder.
- **After retirement**: moved, not copied, to
  `delivery/<slug>.md` in the retiring commit. `delivery/`
  starts with the first retirement and never leaves the
  tree, even when the last item takes `roadmap/` with it.
  One file per delivered item, named by slug.

## The content

Only the proven facts of a verification round or a reconcile
pass, each entry with its evidence pointer. Three sources:

- A plan row whose done criteria re-ran green this session:
  the covered capability of the row, at its verified-at
  SHA.
- A blocking defect or reported statement from an earlier
  round that this pass re-tested and cleared. It leaves `##
  Remaining` and lands here, so the fix stands recorded,
  not only forgotten.
- A surface that the newest round proved working ("What
  holds up"), named with its evidence. It is the
  part that the next round never breaks.

Never in the report: attempts, partial progress, unverified
claims, REJECTED rows (the reason lives in the hub), and
process narration. The report is not a changelog of the loop.
It is the current proven state of the item.

## Format

Restated current each pass, never appended as a log. The
same discipline as Remaining, inverted:

```markdown
# Delivery report — <title>

- **Slug**: <slug> · **Status**: IN EXECUTION (DONE at retirement)
- **Last verified**: <YYYY-MM-DD> at `<short SHA>` (round NN / reconcile pass)

## Proven

- <the capability or behavior, as an observable statement> — verified
  <YYYY-MM-DD> at `<SHA>`: <the evidence pointer — round NN `B3` cleared,
  plan 004 criteria re-run, round NN "holds up">.

## Not proven

- <each claimed but unsettled fact of the item, one line each,
  or "nothing claimed remains unverified" at retirement>
```

Rules:

- Entries are **observable statements with dated SHAs**, like
  Remaining statements: "the console starts and renders its
  first frame", not "console work".
- Newer passes **restate**: a changed claim rewrites, and
  superseded evidence carries the newest SHA. The opened
  report is always the whole truth, not a diff against
  earlier rounds.
- At retirement the Status line flips to `DONE`. `Not proven`
  reads empty. An unverified claim is a Remaining statement,
  and Remaining is empty at retirement. The file moves to
  `delivery/<slug>.md` otherwise unchanged.
