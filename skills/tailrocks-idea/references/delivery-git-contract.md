# The delivery git contract

Every delivery-family skill (`tailrocks-audit`, `tailrocks-idea`,
`tailrocks-brainstorm`, `tailrocks-research`, `tailrocks-record-decision`,
`tailrocks-finalize`, `tailrocks-plan`, `tailrocks-record-feedback`,
`tailrocks-prove`, `tailrocks-reconcile`) ends each invocation with a marked
commit, so an item's pull request becomes a legible record of which skill
produced what. `tailrocks-audit` is the one that can write without an item: a
directly-seeded `roadmap/<slug>/plan/` package commits on the base branch
under the same trailer, with no item branch and no draft pull request to open.
That record is what a later field audit reads to judge each skill's output and
improve it.

**The commit history is the history.** No artifact carries a log of what
happened to it — not the item, not the plan hub, not a verification round.
A status is the current value; how it got there is `git log`, and a
hand-written history line beside a commit that already says the same thing is
duplication that drifts and costs context on every read. Settled state stays
in the artifact — Decisions, Vocabulary, Must not are what the item *is*, not
what happened to it.

Reading an item's history:

```sh
git log --format='%h %ad %s %(trailers:key=Tailrocks-Skill,valueonly,separator=%x2C)' \
  --date=short -- roadmap/<slug>/
```

## One item, one branch, one pull request

`tailrocks-idea` opens the item's delivery branch at capture, and **every
later skill commits into that same branch and that same pull request**. No
delivery skill opens a second pull request for an item that already has one —
not for a plan, not for a verification round, not for a reconcile pass. An
item's whole life, from capture through execution and every verification
iteration, is one reviewable lane.

- Branch `roadmap/<slug>` off the repository's base branch. When
  `.tailrocks/pr.md` exists, its branch and base conventions govern; when
  repository law forbids feature branches, work on the default branch and say
  so in the invocation's commit message — every other rule below still
  applies.
- After the item file and index row are committed, push and open a **draft**
  pull request: title `docs(roadmap): <item title>`, body naming the slug, the
  status (`DRAFT`), and the next command. The PR ripens with the item — later
  skills push to the same branch and refresh the body's status line.

Later skills locate the branch by name (`roadmap/<slug>`) or by the item's
open PR head. A missing branch on an item that predates this contract is not
an error: create it from the current base, carry the existing artifacts over,
and open the draft PR then.

### Item-less research

A `tailrocks-research` question invocation with no linked roadmap item has no
`roadmap/<slug>` lane. It opens its own — branch `research/<topic-slug>`, draft
PR titled `docs(research): <topic>` — under every other rule here. That is one
subject in one lane, not a second lane for one item. A later invocation that
links the topic to an item keeps working on whichever of the two lanes is
still open.

### After the merge

Once the item's PR merged, its delivery branch is gone. A family skill invoked
on the item after that reopens the lane rather than pushing anywhere else:
recreate `roadmap/<slug>` off the current base, commit its writes there under
the same rules, push, and open a draft pull request titled
`docs(roadmap): <item title> — round <n>`. That reopened lane is again the
single lane for the item until it merges. The base branch is never pushed
directly, before or after the merge.

### Multi-item research

A research topic serving several items is committed on the lane of the item
(or standalone topic) that invoked it — never duplicated across branches.
Other linked items' branches wire their Research-section links when the topic
is visible from their base after the merge; link wiring is idempotent, so a
later invocation on those items completes it as ordinary artifact work.

## The commit, per invocation

One invocation, one commit (plus a push):

- Only the skill's own artifact writes are staged — `roadmap/` and `research/`
  paths; never source.
- Subject in the repository's commit convention, `docs(...)` scoped to the
  artifact area, e.g. `docs(roadmap): shape <slug> — round 3`,
  `docs(research): <topic> chapters 01-04`,
  `docs(roadmap): <slug> plan package`,
  `docs(roadmap): <slug> verification round 2`.
- Trailer, verbatim key, exactly one per commit:

  ```text
  Tailrocks-Skill: <invoked-skill-name>
  ```

  alongside whatever trailers the repository already requires (DCO sign-off
  and the like). The trailer is the machine-readable attribution and, with the
  commit message, the item's only history.
- When the invocation changed the item's status, update the draft PR body's
  status line in the same push.
- Sync before committing: fetch and rebase the delivery branch on its base so
  the shared indexes (`roadmap/README.md`, `research/README.md`) merge cleanly
  across concurrently open item PRs. Index edits stay confined to the
  invocation's own rows — one row per item or topic; touching another item's
  row is how two open PRs collide.

Uncommitted delivery artifacts at the end of an invocation are a contract
violation — finished work does not sit dirty on the branch.

### Crash recovery

A session that dies mid-invocation leaves artifact writes uncommitted; the
next family invocation on that lane must not fold them into its own marked
commit — that corrupts the attribution the trailer exists for. Before its own
work, it commits the inherited writes as a separate commit attributed to the
skill that produced them (readable from the paths and content — shaping
answers are `tailrocks-brainstorm`'s, chapters are `tailrocks-research`'s);
when the producer is genuinely undeterminable, the trailer value is
`recovered`. Then it proceeds normally with its own marked commit.

## Merge

Merging the roadmap PR is the operator's decision through the pull-request
family; the delivery skills never merge, never mark the PR ready, and never
push to the base branch directly. After a merge, the next invocation reopens
the lane as above, under the same trailer rule.
