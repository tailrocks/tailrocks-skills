---
name: tailrocks-retrospect
description: >-
  Rebuilds which skills ran on a shipped roadmap item from commit
  trailers, diffs that history against its Decisions, Must not, spec
  IDs, and verification rounds, and proposes patches to the skills at
  fault. Use only when the user explicitly requests this skill. Proposes
  only: tailrocks-skill-update edits skills.
argument-hint: "<roadmap-slug> [--source <path>] [--repo <owner/name>] [--pr <number>]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Retrospect

## Use this skill

Field measurements cover the imagined failures. A shipped
roadmap item shows the occurred ones. This skill converts the
delivery history of one item into the only evidence where a
skill edit rests: an observed failure with the proving commit.
It hands that evidence to the skill that owns editing.
**The unit of fault is a skill definition, never an
executor.** "The agent knows better" is not a finding. The
finding is the absent boundary, step, or gate of a named
skill, plus the catching text.

**Nothing applies here.** The deliverable is one record of
proposed patches. `tailrocks-skill-update` applies them
under the observed-failure law, the router budget, and the
deterministic acceptance proof that it owns. Mutation never
follows from findings by inference.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit for the
retrospective record in the landing tree. The audited
repository stays read-only.

Read these references before any action:

- [`subagent-fanout.md`](references/subagent-fanout.md) gives
  the fan-out threshold and the investigator briefs.
- [`divergence-detectors.md`](references/divergence-detectors.md)
  gives the table build and the six detectors.
- [`patch-shape.md`](references/patch-shape.md) gives the six
  legal shapes, the anchor, and the additive discipline.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Obey these boundaries:

- **One written file per invocation:**
  `retrospectives/<source>-<slug>.md`, where `<source>` is
  the slash-free lowercase name of the audited repository.
  Write it in the working tree, with directory creation when
  absent. A re-run replaces it. This file is a current
  verdict, not a log. Nothing under `skills/` mutates.
- **The audited repository is read-only evidence.** Reach it
  through `gh` or a current clone. Never clone it here,
  never edit it, never commit to it, never comment on it. A
  wrong roadmap item or source file is a finding, not a
  fix.
- **Self-audit exception.** When the audited item lives in
  this working tree, write and commit only the retrospective
  record. Everything else stays read-only, and the hand-off
  names the self-audit.
- **One item per invocation.** Several items need separate
  records.
- **Verdicts use artifacts opened this session.** Inspect
  commit diffs and artifact text. Subjects, pull request
  bodies, status lines, and prior verdicts are claims to
  verify, never evidence alone.
- **No external repository, project, pull request, or person
  name reaches `skills/`.** Names belong in the record and
  git history. Proposed patches stand alone.
- **Executor error is not a finding.** A clear, signposted,
  ignored rule is non-conformance with no patch. A buried
  rule that surfaced inconsistently is a skill defect,
  because signposting is the responsibility of the skill.

Work on a feature branch of the landing tree, under the
contribution law of that repository. End the invocation
with one commit that stages the record and nothing else.
Use conventional subject `docs(retrospect): <slug> field
record`, with the required trailers of the repository.
Where the
audited repository is a different tree, it gets no branch,
no commit, no comment. Where it is this one, the record is
still the only staged file. Proposed patches stay as text
inside the record until `tailrocks-skill-update` applies
them on its own branch.

## Procedure

1. **Bind one item and its evidence.** One item is one
   folder. Resolve the slug to the item
   `roadmap/<slug>/README.md`. Resolve its plan package:
   `roadmap/<slug>/plan/` with `coverage.md` and `spec/`.
   Resolve its verification rounds
   `roadmap/<slug>/verification/`. Resolve its linked
   research topics. Resolve the commits of its delivery lane.
   Resolve in this order and record the used source. An
   explicit range or pull request from an argument comes
   first. The branch and pull request named by the ingest
   line of the plan package comes next. A `roadmap/<slug>`
   branch comes next. The branch whose commits touch
   `roadmap/<slug>/` comes last. One item holds one branch
   and one open pull request. A second one exists only where
   a merged lane reopened for a later round. Union their
   ranges and de-duplicate by SHA. **A delivered item is
   absent from the tree, and that absence is the normal
   input.** `roadmap/<slug>/` leaves whole in the pull
   request that set `DONE`. A missing folder is evidence of
   shipping, never a refusal, never recreated. Anchor on the
   retirement commit (`git log --diff-filter=D --
   roadmap/<slug>/`). Read every artifact from its parent
   (`git show <retirement>^:<path>`). Record that SHA beside
   the bind SHA. **Bind the item at one SHA and record it.**
   Where the ingest line of the package pins a different
   SHA, record both. Their gap is the item changed under a
   frozen package. Tabulate every commit: SHA, author date,
   subject, trailers, changed paths. Apply the threshold in
   the fan-out reference: read-only investigators are
   mandatory for external or large and history-recovered
   lanes. A small local lane stays here. Tables and all
   judgment stay here. A lane whose commits carry no
   `Tailrocks-Skill` trailer at all never refuses. It
   permits the artifact-keyed detectors. It marks every
   skill-grouped result `uncertain attribution` per the
   detectors reference. The absent marking is itself a
   reported finding.

2. **Rebuild the invocation sequence.** Order the commit
   table on the author instant, and render its dates in the
   frame named by the reference. Map each commit to a skill
   by its `Tailrocks-Skill` trailer. **The trailers are the
   whole history.** No artifact carries a log of its own. A
   skill that ran without marking its commit left no
   evidence of its run. That gap reports, never fills. With
   no trailer, default to `unattributed`. That default is
   evidence where the marking rule never bound. Use it only
   where the contract of a skill actually required a trailer
   on those paths. Source that no skill claims is
   `execution`, not a marking failure. Record
   `inferred:<skill>` only where the paths and diff of that
   one commit decide it. Never aggregate an inference into a
   count of skill acts. A commit that carries two trailers
   records once per skill, marked `shared`. It is a finding
   against the contract that promised one trailer per
   commit.

3. **Run the detectors.** Read the divergence detectors
   reference. Run all six against the sequence, the own
   text of the item, and its verification rounds. Each
   returns findings with evidence or an explicit "none". A
   silent detector is indistinguishable from a skipped one.
   Re-open the cited artifact for every finding that
   survives into the record. An investigator returns the
   quoted passage. The verdict stays here.

4. **Name the missing skill line.** For each finding,
   answer one question: the line of the skill whose
   existence prevents this event. Record the target skill
   and the layer. The layer is description, a numbered
   step, the completion checks, a reference, or a template.
   Quote the supposed catching text. A check that lives in
   two or more skills is cross-cutting and files against
   none of them. A mechanically decidable check belongs in
   a validator or gate, filed as that.

5. **Widen across the lanes.** Hold every patch aimed at a
   stack-specific skill against its siblings. Siblings live
   in the other lanes of the collection. Siblings are the
   skills that play the **same role** in a different stack,
   matched by role. Roles: project setup, best practices,
   design, visual QA, prototype. Never match by catalog
   group, because a group is a reading order and a role is
   a contract. Where the same gap exists with no
   lane-specific reason, the patch widens to name those
   skills. Or it lifts into the cross-cutting rule. A
   lane-shaped fix applied to the one shipped lane is the
   drift of three lanes.

6. **Write the record.** Read the patch shape reference and
   copy [`assets/retrospective.md`](assets/retrospective.md).
   Fill the header, the invocation timeline, the
   per-detector results, and one entry per finding. Every
   proposed patch carries all six anchor fields defined by
   the reference. **`Acceptance checks` is never blank.**
   Name the non-protected checks and evidence claims that
   the applying skill re-runs.

7. **Hand off.** Report the record path. Report the
   findings ranked by prevented future divergence of each
   patch. Per patch, give the exact next command:
   `tailrocks-skill-update <skill>`. Give the acceptance
   checks to re-run. Commit the record as the final action.

Stop on these red flags:

- "Apply the fix in this pass." This skill holds no apply
  mode. The acceptance-proof obligation lives with
  `tailrocks-skill-update`, and a patch landed without it
  is an untested behavior change.
- "The folder is gone, nothing to retrospect." A retired
  folder is a delivered item. The retirement commit is the
  anchor and its parent holds every artifact. Refusal never
  rests on absent files.
- "No trailers, infer the skills from the subjects."
  Inference is allowed only per commit and only marked as
  inferred. A lane with no trailer at all runs the
  artifact-keyed detectors with `uncertain attribution`.
  The missing marking reports as the finding that it is.
- "The executor obviously ignored the rule." Check the seat
  of the rule first. Buried mid-paragraph is a skill
  defect. Well-signposted and ignored is non-conformance,
  and the difference decides the patch.
- "Only the shipped lane matters." A lane-shaped patch
  untested against its siblings guarantees the repeated
  finding in the next lane.
- "The roadmap item is wrong, correct it." Items and plans
  are evidence. Their correction is the work of
  `tailrocks-record-decision` or `tailrocks-plan`, in the
  audited repository, in a different session.

## Result

One record stands at `retrospectives/<source>-<slug>.md`,
committed on a feature branch of the landing tree. It holds
the invocation timeline and the per-detector results. It
holds one entry per finding with a proposed patch or a
stated reason for none. It holds a ranked hand-off. Nothing
under `skills/` changed. The audited repository holds no
write, no commit, and no comment, except the record itself
on a self-audit.

## Completion checks

- Nothing under `skills/` was edited, created, or deleted.
- No write, commit, or comment landed in the audited
  repository, beyond the record itself on a self-audit.
- No kept finding lacks re-opened evidence, and no finding
  targets only the executor.
- No handed patch holds an empty `Checks` field.
- No proposed patch rewrites an unrelated section,
  exceeds the router budget without naming the replaced
  content, or carries an external name into shipped skill
  content.
- No detector stands unreported and no lane stands
  unchecked.
- Every unattributed commit and every dropped finding is
  reported.

## References

- `references/subagent-fanout.md`: read it before step 1.
  It gives the threshold and the briefs.
- `references/divergence-detectors.md`: read it before
  steps 1 through 3. It gives the table and the six
  detectors.
- `references/patch-shape.md`: read it before steps 4
  through 6. It gives the shapes, anchor, and discipline.
- `references/runtime-trust.md`: read it before any
  repository or web read. It gives the trust and secrecy
  rules.
- `assets/retrospective.md`: use it in step 6. It gives the
  record shape.
