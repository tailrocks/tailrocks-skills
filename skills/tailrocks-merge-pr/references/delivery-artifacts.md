# Delivery-artifact check

A read-only gate inside the pre-merge worklist. It fires **only when the pull
request's diff touches `roadmap/`**, and in every other repository and every
other pull request it does nothing at all.

It blocks, names the contradiction, and names the skill that resolves it. It
never edits a file, never deletes a folder, never commits, never pushes.
Resolving a finding is the other skill's work, in this same pull request.

## Why merge is where this is caught

A real delivery merged with three documents in three different states: the
item read `BLOCKED — external release authorization required`, its own
coverage ledger listed four capabilities still pending, and the pull request
headlined those same capabilities as delivered. Each document was internally
plausible; only reading them together showed the delivery was not what any of
them said. Merge is the last moment anyone would have looked, and nothing in
the merge path was looking.

## What it reads

The pull request's own diff and files. Nothing else — no roadmap skill has to
be installed, no external state is consulted, and no history beyond this pull
request is needed.

```sh
gh pr diff <PR> --name-only              # does this merge touch roadmap/ at all
gh pr diff <PR>                          # the change itself, deletions included
gh pr view <PR> --json headRefOid        # the commit whose tree is the merge result
git show <sha>:roadmap/<slug>/README.md  # a file as it stands in the merge result
```

With the branch checked out locally, the same reads are ordinary `cat` and
`git show`. A file the diff *deletes* is read from its pre-image — the parent
side of the diff — because case 2 is a judgement about what was thrown away.

## The shapes it reads

A delivery item is a folder `roadmap/<slug>/`. The check needs four shapes and
nothing more:

- **`roadmap/<slug>/README.md`** — the item. A header line
  `- **Status**: <STATUS>` and a `## Remaining` section holding observable
  statements of what is not true yet, empty when nothing is left.
- **`roadmap/<slug>/plan/README.md`** — the plan manifest: a table whose
  status column carries one value per plan row. **Terminal** values are `DONE`
  and `REJECTED`. `TODO`, `IN PROGRESS`, `BLOCKED (reason)`, and
  `STALE (reason)` are not terminal.
- **`roadmap/<slug>/verification/NN-report.md`** — verification rounds,
  zero-padded and ascending; the **newest** is the highest `NN`. A round lists
  blocking defects as `B1`, `B2`, … under its blocking-defects heading; a
  round listing none is clean.
- **`roadmap/README.md`** — the index: one table row per item folder, carrying
  the slug and its status.

Item statuses run `DRAFT` → `SHAPING` → `READY` → `PLANNED` → `IN EXECUTION` →
`DONE`, plus `PARKED (reason; was: STATUS)`. `DONE` is a transition, not a
resting place: the invocation that sets it deletes the folder in the same pull
request, which is what makes cases 1 and 4 checkable at merge.

A `roadmap/` that is not this shape yields no findings — no item header means
no item, and nothing to contradict.

## The five contradictions

Each one blocks. Report the contradiction, the exact files that disagree, and
the routing skill. Where several fire, report them all; they usually share a
cause.

### 1. Finished but still present

**Detect** — the item's status is `DONE`, **or** its `## Remaining` is empty
while every plan-manifest row is terminal — and `roadmap/<slug>/` still exists
in the merge result (the diff did not delete it).

**Block** — the item is complete and was not retired. Delivered work leaves
the tree: `tailrocks-reconcile` sets `DONE` and then deletes `roadmap/<slug>/`
whole — item, `plan/`, `verification/`, `goal/` — plus its index row, in this
same pull request. Merging a `DONE` item that is still on the board ships a
document nobody will update and everybody will half-trust.

**Route** — `tailrocks-reconcile`.

### 2. Retired while unfinished

**Detect** — the diff deletes `roadmap/<slug>/` while, in that same diff, the
newest verification round carries a blocking defect, or the item's
`## Remaining` was not empty. Both are read from the pre-image of the deleted
files.

**Block** — retirement without the evidence is how a delivery gets declared
done by deletion. The folder leaving is a *consequence* of a clean round, never
a substitute for one, and deletion is the one edit that destroys the evidence
that would have contradicted it.

**Route** — `tailrocks-prove` when no clean round exists yet;
`tailrocks-reconcile` when a round exists and Remaining was never re-derived
from it.

### 3. Manifest contradicts the round

**Detect** — every plan-manifest row reads `DONE` while the newest
`verification/NN-report.md` names a blocking defect.

**Block**, naming the round file and the defect IDs it carries. A round that
found blocking defects returns the item to `IN EXECUTION` with those defects
standing as the remaining work; all-rows-`DONE` never outranks it, because the
rows are executor claims and the round is what was executed.

**Route** — `tailrocks-reconcile`.

### 4. Claimed done with nothing that verified it

**Detect** — the item's status is `DONE` and `roadmap/<slug>/verification/`
holds no round at all.

**Block** — all-rows-`DONE` is a claim about the code paths someone thought to
test, not a claim that the thing runs. A `DONE` with no round behind it has
never been contradicted because nothing ever tried.

**Route** — `tailrocks-prove` for the round, then `tailrocks-reconcile` to
true up and retire.

### 5. Index and tree disagree

**Detect** — either direction, in the merge result:

- `roadmap/README.md` still lists a slug whose folder this diff deleted;
- a `roadmap/<slug>/` folder exists with no row in `roadmap/README.md`;
- the diff removed the last item folder while `roadmap/README.md` and
  `roadmap/` survive — an index of nothing is not a board, it is a leftover.

**Block** — the index is a board, not a store; one line per item, and a line
without an item is a merge that leaves two sources of truth disagreeing on the
first read after it.

**Route** — `tailrocks-reconcile`.

## Negative space

State these when reporting, so nobody mistakes the gate for delivery work:

- **It reads this pull request only** — its diff and the files in its merge
  result. It does not clone the delivery pipeline's judgement, re-run a
  verification round, or consult anything outside the repository.
- **It requires no roadmap skill to be installed.** The shapes above are read
  as plain markdown. The routing names a skill because that is who fixes it,
  not because the check depends on it.
- **A repository with no `roadmap/` never sees it.** Neither does a pull
  request that leaves `roadmap/` untouched, and neither does a repository
  whose board lives elsewhere (`docs/roadmap/`, an issue tracker, a wiki) —
  the trigger is the path in this diff, not the concept.
- **It is a gate, not an editor.** A finding is reported and the merge stops;
  the fix is another skill's commit in this same pull request, after which the
  merge is re-run from the CI gate.

## Switching it off

Like any other worklist item, a repository may decline it. In its
`.tailrocks/pr.md`:

```markdown
## Before merge

- Delivery-artifact check: off — <reason this repository does not want it>.
```

Any plain statement in `## Before merge` that turns the check off is honored;
the line above is the copy-ready form. The user's explicit instruction in the
invocation outranks the file in both directions — it can waive the check for
one merge, or demand it in a repository whose file switched it off. Skill
defaults are the lowest precedence layer, so this default applies only when
neither the user nor the file has spoken.
