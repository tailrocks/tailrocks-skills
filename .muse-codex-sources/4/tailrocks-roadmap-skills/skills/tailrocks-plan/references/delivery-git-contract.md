# The delivery git contract

Every delivery-family skill ends each invocation with a marked
commit. The family is `tailrocks-seed-roadmap`, `tailrocks-idea`,
`tailrocks-brainstorm`, `tailrocks-research`,
`tailrocks-record-decision`, `tailrocks-finalize`, `tailrocks-plan`,
`tailrocks-record-feedback`, `tailrocks-prove`, and
`tailrocks-reconcile`. The marked commits turn the item pull
request into a legible record of the skill that produced each
change. `tailrocks-seed-roadmap` creates the one item lane for
verified evidence, or reuses the lane in place. No delivery skill
writes a parentless plan. No delivery skill commits item work
directly on the base branch. A later field audit reads that record
to judge each skill output and improve it.

**The commit history is the history.** No artifact carries a log of
the changes made to it: not the item, not the plan hub, not a
verification round. A status is the current value. The command
history shows the path to the value. A hand-written history line
beside a commit that states the same fact is duplication. It drifts
and costs context on every read. Settled state stays in the
artifact. Decisions, Vocabulary, and Must not state the current
item, not the path to it.

Read the history of one item with these commands:

```sh
git log --date=short --format='%h %ad %s' -- roadmap/<slug>/
git log --format='%(trailers:key=Tailrocks-Skill)' -- roadmap/<slug>/
```

## One item, one branch, one pull request

`tailrocks-idea` opens the delivery branch of the item at capture.
Every later skill commits into that same branch and that same pull
request. No delivery skill opens a second pull request for an item
that already has one. This rule covers plans, verification
rounds, and reconcile passes. The whole life of one item, from
capture through execution and every verification round, is one
reviewable lane.

- Branch `roadmap/<slug>` off the base branch of the repository.
  The branch and base conventions of the repository govern. When
  repository law forbids feature branches, work on the default
  branch and state that fact in the commit message of the
  invocation. Every other rule below still applies.
- After the commit of the item file and the index row, push and
  open a **draft** pull request. Title the request
  `docs(roadmap): <item title>`. Name the slug, the status
  (`DRAFT`), and the next command in the body. The pull request
  ripens with the item. Later skills push to the same branch and
  refresh the status line of the body.

Later skills find the branch by name (`roadmap/<slug>`) or by the
head of the open pull request of the item. A missing branch on an
item that predates this contract is not an error. Create the branch
from the current base, carry the current artifacts over, and open
the draft pull request then.

### Item-less research

A `tailrocks-research` question invocation with no linked roadmap
item has no `roadmap/<slug>` lane. It opens its own lane: branch
`research/<topic-slug>` off the base, draft pull request titled
`docs(research): <topic>`, under every other rule here. That lane
holds one subject, not a second lane for one item. A later
invocation that links the topic to an item keeps work on the lane
of the two lanes that is still open.

### After the merge

After the merge of the item pull request, the delivery branch is
gone. A family skill invoked on the item after that merge reopens
the lane. It never pushes anywhere else. Recreate `roadmap/<slug>`
off the current base, commit its writes there under the same
rules, push, and open a draft pull request titled
`docs(roadmap): <item title> — round <n>`. That reopened lane is
again the single lane for the item until it merges. Never push the
base branch directly, before or after the merge.

### Multi-item research

Commit a research topic that serves several items on the lane of
the item or standalone topic that invoked it. Never duplicate the
topic across branches. The other linked items wire their
Research-section links on their own branches when the topic is
visible from their base after the merge. Link wiring is
idempotent, so a later invocation on those items completes it as
ordinary artifact work.

## The commit, per invocation

One invocation ends with one commit plus a push:

- Stage only the artifact writes of the skill: `roadmap/` and
  `research/` paths. Never stage source.
- Write the subject in the commit convention of the repository.
  Scope the subject to the artifact area with `docs(...)`. Examples
  are `docs(roadmap): shape <slug> — round 3`,
  `docs(research): <topic> chapters 01-04`,
  `docs(roadmap): <slug> plan package`, and
  `docs(roadmap): <slug> verification round 2`.
- Add the trailer with the verbatim key, exactly one per commit:

  ```text
  Tailrocks-Skill: <invoked-skill-name>
  ```

  Keep the trailers that the repository already requires beside it,
  such as DCO sign-off. The trailer is the machine-readable
  attribution. With the commit message, it is the only history of
  the item.
- When the invocation changed the status of the item, update the
  status line of the draft pull request body in the same push.
- Sync before the commit. Fetch and rebase the delivery branch on
  its base. Then the shared indexes (`roadmap/README.md`,
  `research/README.md`) merge cleanly across concurrently open item
  pull requests. Confine index edits to the rows of the invocation:
  one row per item or topic. A touch to the row of a different item
  is the collision of two open pull requests.

Uncommitted delivery artifacts at the end of an invocation break
this contract. Finished work never sits dirty on the branch.

### Crash recovery

A session that dies mid-invocation leaves artifact writes
uncommitted. The next family invocation on that lane must not fold
those writes into its own marked commit. That fold corrupts the
attribution that the trailer exists for. Before its own work, the
next invocation commits the inherited writes as a separate commit
attributed to the skill that produced them. The paths and the
content identify the producer: shaping answers belong to
`tailrocks-brainstorm`, chapters belong to `tailrocks-research`.
When the producer is genuinely undeterminable, the trailer value
is `recovered`. Then the invocation proceeds normally with its own
marked commit.

## Merge

Merge of the roadmap pull request is the decision of the operator
through the pull-request family. Delivery skills never merge, never
mark the pull request ready, and never push to the base branch
directly. After a merge, the next invocation reopens the lane as
stated above, under the same trailer rule.
