# The delivery git contract

Every delivery-family skill (`tailrocks-audit`, `tailrocks-idea`,
`tailrocks-brainstorm`, `tailrocks-research`, `tailrocks-record-decision`,
`tailrocks-finalize`, `tailrocks-plan`, `tailrocks-reconcile`) ends each
invocation with a marked commit, so an item's pull request becomes a
legible record of which skill produced what. `tailrocks-audit` is the one
that can write without an item: a directly-seeded `plans/<slug>/` package
commits on the base branch under the same trailer, with no item branch and
no draft pull request to open. That record is what a later field audit reads
to judge each skill's output and improve it.

## The branch and the pull request

`tailrocks-idea` opens the item's delivery branch at capture:

- Branch `roadmap/<slug>` off the repository's base branch. When
  `.tailrocks/pr.md` exists, its branch and base conventions govern;
  when repository law forbids feature branches, work on the default
  branch and record that in the item's Log — every other rule below
  still applies.
- After the item file and index row are committed, push and open a
  **draft** pull request: title `docs(roadmap): <item title>`, body
  naming the slug, the status (`DRAFT`), and the next command. The PR
  ripens with the item — later skills push to the same branch.

Later skills locate the branch by name (`roadmap/<slug>`) or by the
item's open PR head. A missing branch on an item that predates this
contract is not an error: create it from the current base, carry the
existing artifacts over, and open the draft PR then.

### Item-less research

A `tailrocks-research` question invocation with no linked roadmap item
has no `roadmap/<slug>` lane. It opens its own: branch
`research/<topic-slug>` off the base branch, draft PR titled
`docs(research): <topic>`, and every other rule in this contract —
one marked commit per invocation, push, never the base branch
directly. A later invocation that links the topic to an item keeps
working on whichever of the two lanes is still open.

### After the merge

Once the item's PR merged, its delivery branch is gone. A family skill
invoked on the item after that (most often `tailrocks-reconcile`)
reopens the lane rather than pushing anywhere else: recreate
`roadmap/<slug>` off the current base, commit its writes there under
the same rules, push, and open a new draft PR titled
`docs(roadmap): <item title> — post-merge sync`. The base branch is
never pushed directly, before or after the merge.

### Multi-item research

A research topic serving several items is committed on the lane of the
item (or standalone topic) that invoked it — never duplicated across
branches. Other linked items' branches wire their Research-section
links when the topic is visible from their base after the merge; link
wiring is idempotent, so a later invocation on those items completes it
as ordinary artifact work.

## The commit, per invocation

One invocation, one commit (plus a push):

- Only the skill's own artifact writes are staged — `roadmap/`,
  `research/`, `plans/` paths; never source.
- Subject in the repository's commit convention, `docs(...)` scoped to
  the artifact area, e.g. `docs(roadmap): shape <slug> — round 3`,
  `docs(research): <topic> chapters 01-04`,
  `docs(plans): <slug> package`.
- Trailer, verbatim key, exactly one per commit:

  ```text
  Tailrocks-Skill: <invoked-skill-name>
  ```

  alongside whatever trailers the repository already requires (DCO
  sign-off and the like). The trailer is the machine-readable
  attribution: `git log --format='%h %(trailers:key=Tailrocks-Skill,valueonly)'`
  maps every delivery commit to the skill that produced it.
- When the invocation changed the item's status, update the draft PR
  body's status line in the same push.
- Sync before committing: fetch and rebase the delivery branch on its
  base so the shared indexes (`roadmap/README.md`,
  `research/README.md`) merge cleanly across concurrently open item
  PRs. Index edits stay confined to the invocation's own rows — one
  row per item or topic; touching another item's row is how two open
  PRs collide.

Uncommitted delivery artifacts at the end of an invocation are a
contract violation — finished work does not sit dirty on the branch.

### Crash recovery

A session that dies mid-invocation leaves artifact writes uncommitted;
the next family invocation on that lane must not fold them into its own
marked commit — that corrupts the attribution the trailer exists for.
Before its own work, it commits the inherited writes as a separate
commit attributed to the skill that produced them (readable from the
paths and content — shaping answers are `tailrocks-brainstorm`'s,
chapters are `tailrocks-research`'s); when the producer is genuinely
undeterminable, the trailer value is `recovered`. Then it proceeds
normally with its own marked commit.

## Merge

Merging the roadmap PR is the operator's decision through the
pull-request family; the delivery skills never merge, never mark the PR
ready, and never push to the base branch directly. After a merge,
`tailrocks-reconcile` commits its truth-sync writes wherever the
artifacts now live, under the same trailer rule.
