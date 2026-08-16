# The delivery git contract

Every delivery-family skill (`tailrocks-idea`, `tailrocks-brainstorm`,
`tailrocks-research`, `tailrocks-record-decision`, `tailrocks-finalize`,
`tailrocks-plan`, `tailrocks-reconcile`) ends each invocation with a
marked commit, so an item's pull request becomes a legible record of
which skill produced what. That record is what a later field audit reads
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

Uncommitted delivery artifacts at the end of an invocation are a
contract violation — finished work does not sit dirty on the branch.

## Merge

Merging the roadmap PR is the operator's decision through the
pull-request family; the delivery skills never merge, never mark the PR
ready, and never push to the base branch directly. After a merge,
`tailrocks-reconcile` commits its truth-sync writes wherever the
artifacts now live, under the same trailer rule.
