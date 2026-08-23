# The delivery report — `REPORT.md` and `delivery/<slug>.md`

The item's ledger of verified accomplishment. `## Remaining` answers "what is
not true yet"; the report answers "what is proven true" — and it is the one
artifact that survives the item, because a retiring folder takes everything
else into git archaeology while this moves to `delivery/<slug>.md` in the
tree.

## Two homes, one file

- **During the loop**: `roadmap/<slug>/REPORT.md`, writable by
  `tailrocks-reconcile` only. Created on the first pass that has something
  proven to record; absent before that, never a placeholder.
- **After retirement**: moved (not copied) to `delivery/<slug>.md` in the
  retiring commit. `delivery/` is created by the first retirement and never
  deleted, even when the last item takes `roadmap/` with it. One file per
  delivered item, named by slug.

## What goes in

Only what a verification round or a reconcile pass **proved**, each entry
carrying its evidence pointer. Three sources:

- A plan row whose done criteria re-ran green this session (step 2's
  confirmed rows) — the capability the row covered, at its verified-at SHA.
- A blocking defect or reported statement from an earlier round that this
  pass re-tested and cleared — it leaves `## Remaining` and lands here, so
  the fix is recorded, not just forgotten.
- A surface the newest round proved working (`What holds up`) — named with
  its evidence, because it is what the next round must not break.

What never goes in: attempts, partial progress, unverified claims, REJECTED
rows (the reason lives in the hub), and process narration. The report is not
a changelog of the loop — it is the item's current proven state.

## Format

Restated current each pass, never appended as a log — the same discipline as
Remaining, inverted:

```markdown
# Delivery report — <title>

- **Slug**: <slug> · **Status**: IN EXECUTION (DONE at retirement)
- **Last verified**: <YYYY-MM-DD> at `<short SHA>` (round NN / reconcile pass)

## Proven

- <the capability or behavior, as an observable statement> — verified
  <YYYY-MM-DD> at `<SHA>`: <the evidence pointer — round NN `B3` cleared,
  plan 004 criteria re-run, round NN "holds up">.

## Not proven

- <anything the item claims that no round has settled yet — one line each,
  or "nothing claimed remains unverified" at retirement>
```

Rules:

- Entries are **observable statements with dated SHAs**, like Remaining
  statements — "the console starts and renders its first frame", not
  "console work".
- Newer passes **restate**: an entry whose claim changed is rewritten, one
  whose evidence was superseded carries the newest SHA. The report a reader
  opens is always the whole truth, not a diff against earlier rounds.
- At retirement the Status line flips to `DONE`, `Not proven` must read
  empty (a claim left unverified is a Remaining statement, and Remaining
  must be empty to retire), and the file moves to `delivery/<slug>.md`
  unchanged otherwise.
