# Retirement — delivered work leaves the tree

A folder under `roadmap/` is work that is **not finished**. An
item that stays after its work shipped turns into a document
that nobody updates and everybody half-trusts. Rows read DONE
beside a Remaining that nobody rewrote. An index row claims a
state that no command re-earned. Retirement stops that state:
the same invocation that finally states `DONE`
takes the item out of the tree.

Nothing is lost, because nothing ever lived only there. The
item, its plans, its spec, its coverage ledger, its
verification rounds, and the goal contract all stay in git,
addressable forever:

```sh
git log --format='%h %ad %s' --date=short -- roadmap/<slug>/  # what happened
git log --diff-filter=D -- roadmap/<slug>/README.md           # the retiring commit
git show <sha>^:roadmap/<slug>/README.md                      # the item as it stood
git show <sha>^:roadmap/<slug>/verification/04-report.md      # the closing round
```

That recoverability is the reason where the deletion is safe,
and where the tree carries only the current truth.

## The evidence gate

Four conditions, all of them, each evidenced in this session.
Never read them off a report summary, a transcript, or an
operator recollection:

| Condition | Proof here |
| --- | --- |
| Every hub row terminal | Each row re-earned this pass |
| Goal condition passes | `check.sh` PASS in this session |
| Latest round clean | No blocking defect stands |
| `## Remaining` empty | Each statement disproved |

DONE needs criteria that both passed and executed work, or
REJECTED with rationale. TODO, IN PROGRESS, BLOCKED, and
STALE are not terminal. A remembered PASS never counts. The
newest `NN-feedback.md` holds no defect that the report left
uncleared. Never empty Remaining by deletion of untested
statements.

**The evidence is the round.** A blocking defect in the
latest round is not a detail to weigh against three green
conditions. The item returns to `IN EXECUTION` with those
defects standing in `## Remaining` as the work order of the
next round. Not `DONE`, not retired, and no exception for
"everything else is finished". The defect *is* the remainder.

## The four refusals

- **Never from plan rows alone.** Every row DONE with no
  `verification/` round at all is not completion. It is an
  unverified claim: the rows state executed plans, and nobody
  ran the thing. State exactly that fact, leave the status at
  `IN EXECUTION`, and route to `tailrocks-prove` for a round.
  Retirement waits for that report. A passing test suite is
  no substitute. It is the claim that the round exists to
  test.
- **Never on an operator say-so.** "It shipped, close it
  out", "I saw it working, just retire it", a release
  deadline: none of them is a verification round. This is
  the one place where the own gate of this skill faces
  persuasion. The request sounds like the outcome that the
  gate exists to produce. The answer is the missing
  condition named and the command that supplies it. An
  operator overrides a *status* by instruction. Nobody
  overrides the deletion of evidence-backed work by
  assertion.
- **Never a `PARKED` item.** Parked is a deliberate pause
  that the user owns. Even with every row terminal and a
  clean round, a parked item keeps its status: correct its
  `was:` value to the reality-supported value and stop.
  Un-parking belongs to `tailrocks-record-decision`, on the
  explicit word of the user. Retirement only follows that.
- **Never on partial completion.** Pruned rows, a rewritten
  `## Remaining`, and a status of `IN EXECUTION` are the
  normal outcome of this skill. Retirement is the rare
  terminal one. Most invocations end at step 7, and that end
  is the working system, not a gate that failed to fire.

## The two commits

Both land on the branch and pull request of the item, never
a second pull request, never the base branch:

```text
commit 1   docs(roadmap): <slug> is DONE
           roadmap/<slug>/README.md   status → DONE, Remaining empty
           roadmap/<slug>/REPORT.md   final: Status DONE, Not proven empty
           roadmap/README.md          index row → DONE, Remaining 0
           Tailrocks-Skill: tailrocks-reconcile

commit 2   docs(roadmap): retire <slug>
           git mv roadmap/<slug>/REPORT.md delivery/<slug>.md
                                      the verified report stays in the tree
           git rm -r roadmap/<slug>/  item, plan/, spec/, coverage.md,
                                      verification/, goal/, assets — whole
           roadmap/README.md          the row of the item removed
           Tailrocks-Skill: tailrocks-reconcile
```

Two commits, because a reviewer *sees* the item reach `DONE`
in the diff of the pull request instead of inferring it from
a deletion. The first commit is the claim and the second is
its consequence. One invocation, because an item left `DONE`
in the tree between two sessions is exactly the half-trusted
state that this rule removes.

Then refresh the status line of the pull request body to
`DONE — retired in <sha>` and hand the pull request to the
operator. Delivery skills never merge and never mark a pull
request ready.

## The removed scope, and the last item

Everything under `roadmap/<slug>/` goes at once: the item,
the frozen `plan/` package, `verification/`, `goal/`, and any
mockups or captures beside them. One file never goes:
`REPORT.md` moves to `delivery/<slug>.md` first, and carries
the verified accomplishments of the item into the surviving
tree. `delivery/` starts with the first retirement and never
leaves the tree, even when the last item takes `roadmap/`
with it. It is the standing answer to "what did this pipeline
ship, proven". The deletion itself is the only one that this
skill performs. It is legal precisely because the whole item
goes. No frozen file is edited. None stays half-present to
drift against a fingerprint that nothing hashes anymore. A
*partial* deletion of an item, such as a
dropped `verification/` to tidy up or a cut `goal/` to
silence a gate, is never retirement. It destroys evidence
with the work still open.

When the retired item was the last row in the index,
`roadmap/README.md` and the now-empty `roadmap/` directory go
with it in the same commit. An index of nothing is not a
board. It is a leftover. The next `tailrocks-idea` invocation
creates both again. When other items remain, only the row
goes and the index stays, and the invocation touches no
other row.

## Invoked on a retired slug

A later invocation that names a retired slug finds nothing in
the tree. That fact is not an error and not a missing item.
It is a delivered one. Read it out of git history with the
commands above. Report the retirement time, the retiring
commit, and the proof of its last round. Then stop.

Never recreate the folder, never reconstruct the item from
the transcript, and never re-run its plans. A retired item
holds no open work by definition, and a resurrected folder is
a new claim with no evidence behind it. Work that the item
genuinely spawned starts as a new idea through
`tailrocks-idea`, free to cite the commits of the retired item
as background.

## The close-out

A retiring invocation reports the four conditions and the
evidence of each. It reports the two commit SHAs. It reports
the new home of the report at `delivery/<slug>.md`. It
reports the current shape of the index: row removed, or
index and directory gone. It reports the history address of
the item. No `goal/RESUME.md` line: there is nothing to
resume.
