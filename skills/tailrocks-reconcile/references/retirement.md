# Retirement — Delivered Work Leaves the Tree

A folder under `roadmap/` is work that is **not finished**. An item that stays
after its work shipped becomes a document nobody updates and everybody
half-trusts: rows reading DONE beside a Remaining nobody rewrote, an index row
claiming a state no command has re-earned. Retirement is how this skill stops
producing that state — the same invocation that can finally say `DONE` takes
the item out of the tree.

Nothing is lost, because nothing was ever stored only there. The item, its
plans, its spec, its coverage ledger, its verification rounds, and the goal
contract are all in git, addressable forever:

```sh
git log --format='%h %ad %s' --date=short -- roadmap/<slug>/  # what happened
git log --diff-filter=D -- roadmap/<slug>/README.md           # the retiring commit
git show <sha>^:roadmap/<slug>/README.md                      # the item as it stood
git show <sha>^:roadmap/<slug>/verification/04-report.md      # the round that closed it
```

That recoverability is *why* the deletion is safe, and why the tree is allowed
to carry only what is still true.

## The evidence gate

Four conditions, all of them, each evidenced in this session — never read off a
report's summary, a transcript, or an operator's recollection:

| Condition | What proves it here |
|---|---|
| Every hub row terminal | Each row re-earned by this pass: DONE confirmed by criteria that both passed and executed work, or REJECTED with its rationale. `TODO`, `IN PROGRESS`, `BLOCKED`, and `STALE` are not terminal. |
| The goal condition passes | `sh roadmap/<slug>/goal/check.sh` printing its PASS verdict in this session — not a PASS remembered from the loop that just ended. |
| The latest round is clean | The highest-numbered `verification/NN-report.md` names no blocking defect, and the newest `NN-feedback.md` holds no reported defect that report left uncleared. |
| `## Remaining` is empty | After step 6's rewrite, emptied because each statement was disproved — never by deleting statements this pass could not re-test. |

**The evidence is the round.** A blocking defect in the latest round is not a
detail to weigh against three green conditions: the item goes back to
`IN EXECUTION` with those defects standing in `## Remaining` as the next
round's work order. Not `DONE`, not retired, and no exception for "everything
else is finished" — the defect *is* what is left.

## The four refusals

- **Never from plan rows alone.** Every row DONE with no `verification/` round
  at all is not completion, it is an unverified claim: the rows say the plans
  were executed and nobody has run the thing. Say exactly that, leave the
  status at `IN EXECUTION`, and route to `tailrocks-prove` for a round.
  Retirement waits for that report. A passing test suite is not a substitute —
  it is the claim the round exists to test.
- **Never on an operator's say-so.** "It shipped, close it out", "I saw it
  working, just retire it", a release deadline — none of them is a verification
  round, and this is the one place this skill's own gate would be talked past,
  because the request sounds like the outcome the gate exists to produce. The
  answer is the missing condition named and the command that would supply it.
  An operator can override a *status* by instruction; nobody overrides the
  deletion of evidence-backed work by assertion.
- **Never a `PARKED` item.** Parked is a deliberate pause the user owns. Even
  with every row terminal and a clean round, a parked item keeps its status:
  correct its `was:` value to what reality supports and stop. Un-parking is
  `tailrocks-record-decision`'s, on the user's explicit word; retirement can
  only follow that.
- **Never on partial completion.** Pruned rows, a rewritten `## Remaining`, and
  a status of `IN EXECUTION` are the normal outcome of this skill. Retirement
  is the rare terminal one. Most invocations end at step 7 and that is the
  system working, not a gate that failed to fire.

## The two commits

Both land on the item's existing branch and pull request — never a second PR,
never the base branch:

```text
commit 1   docs(roadmap): <slug> is DONE
           roadmap/<slug>/README.md   status → DONE, Remaining empty
           roadmap/README.md          index row → DONE, Remaining 0
           Tailrocks-Skill: tailrocks-reconcile

commit 2   docs(roadmap): retire <slug>
           git rm -r roadmap/<slug>/  item, plan/, spec/, coverage.md,
                                      verification/, goal/, assets — whole
           roadmap/README.md          the item's row removed
           Tailrocks-Skill: tailrocks-reconcile
```

Two commits, because a reviewer must *see* the item reach `DONE` in the pull
request's diff rather than infer it from a deletion; the first commit is the
claim and the second is its consequence. And one invocation, because an item
left `DONE` in the tree between two sessions is exactly the half-trusted state
this rule removes — `tailrocks-merge-pr` refuses to merge a pull request whose
item says `DONE` while the folder is still there.

Then refresh the pull request body's status line to `DONE — retired in <sha>`
and hand the PR to the operator. Delivery skills never merge and never mark a
PR ready.

## What goes, and the last item

Everything under `roadmap/<slug>/` goes at once — the item, the frozen
`plan/` package, `verification/`, `goal/`, and any mockups or captures beside
them. This is the only deletion this skill performs, and it is legal precisely
because the whole item goes: no frozen file is edited, and none is left
half-present to drift against a fingerprint nothing hashes any more. Deleting
*part* of an item — dropping `verification/` to tidy up, cutting `goal/` to
silence a gate — is never retirement; it is destroying evidence while the work
is still open.

When the retired item was the last row in the index, `roadmap/README.md` and
the now-empty `roadmap/` directory go with it in the same commit. An index of
nothing is not a board, it is a leftover; the next `tailrocks-idea` invocation
creates both again. When other items remain, only the row goes and the index
stays — and the invocation touches no other item's row.

## Invoked on a retired slug

A later invocation naming a retired slug finds nothing in the tree. That is not
an error and not a missing item — it is a delivered one. Read it out of git
history with the commands above, report when it retired, in which commit, and
what its last round proved, and stop.

Never recreate the folder, never reconstruct the item from the transcript, and
never re-run its plans: a retired item has no open work by definition, and a
resurrected folder would be a new claim with no evidence behind it. Work the
item genuinely spawned starts as a new idea through `tailrocks-idea`, which is
free to cite the retired item's commits as background.

## The close-out

A retiring invocation reports: the four conditions and the evidence for each,
the two commit SHAs, what the index now looks like (row removed, or index and
directory gone), and where the item is readable in history. No `goal/RESUME.md`
line — there is nothing to resume.
