---
name: tailrocks-review-pr
description: >-
  Reviews one pull request, branch, diff, or plan and reports findings
  with evidence and a Ready, Changes required, or Incomplete verdict. Use
  this skill when the user says review, look over, or audit a PR, diff,
  MR, change, CL, or plan. Also use it when the user says check a change
  or asks if a change is ready to merge. This skill never posts,
  approves, or merges.
argument-hint: "[PR | branch | range | plan] [--repo OWNER/REPO]"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User asks for a code review, feedback on a diff, or whether a change
  is safe to land.
---

# Review PR

## Use this skill

This skill finds defects and unnecessary complexity before merge. It protects
behavior, data, and maintainability. It recommends the smallest coherent
correction.

Use this skill when the user asks for a review of a PR, branch, diff, or plan.
Do not use this skill to fix, approve, or merge. Multi-source branch audits
belong to `tailrocks-repository-merge`.

## Before you start

Obey the active user request first. If the request conflicts with a safety rule
in this skill, stop. Report the conflict.

Before any review action, read `references/runtime-trust.md`. Resolve each
relative link against the directory that contains this SKILL.md file.

This skill is read-only by default. It never edits files. It never merges. It
posts review text only when the active request explicitly authorizes
publication. A review report never substitutes for required human approval or
CODEOWNERS approval.

If the user asks to fix, approve, or merge, refuse that action. Name the owning
skill. `tailrocks-merge-pr` owns landing. Still finish the review.

If the PR is closed or merged, report that state. Stop. This skill reviews open
work.

The skill accepts these arguments:

- `PR | branch | range | plan` names the target. Without it, the skill uses the
  PR of the current branch. Without a PR, it uses the working diff against the
  merge base. A plan target reviews proposed modules, interfaces, dependencies,
  and verification strategy.
- `--repo OWNER/REPO` names the canonical GitHub repository. Without it, the
  skill resolves the current repository once before any GitHub PR read.

## Procedure

1. **Bind the target and state intent.** For a PR target, resolve one canonical
   repository before any GitHub PR read. If `--repo` is present, run `gh repo
   view OWNER/REPO --json nameWithOwner,url`. If `--repo` is absent, run `gh
   repo view --json nameWithOwner,url` from the target repository. Store the
   exact `nameWithOwner` as `REPO`. Pass `--repo "$REPO"` to each `gh pr`
   command. Read `gh pr view` and `gh pr diff` for the title, body, and linked
   issues. Author intent guides each finding. For a branch or range target, use
   the local merge-base diff. Use no GitHub PR commands for that target. Record
   the exact reviewed head SHA. Before step 2, enumerate the reviewed set.
   Record the head. State the intended result in one or two sentences.

2. **Collect the governing rules.** For each changed file, collect the
   instruction files that share its path. Collect the root and nested
   `AGENTS.md` and `CLAUDE.md` files. Collect lint and format configuration and
   the applicable repository requirements. A rule is citable against a file only
   when its scope contains that file. Before step 3, give each changed file its
   rule set. Apply no rule outside its scope.

3. **Search before you accept new code.** For new logic, search for an existing
   implementation. Search functions, components, modules, configuration, and
   public tool commands. Read promising matches. Examine input contracts,
   failure behavior, ownership, and current consumers. Prefer the existing owner
   of a business rule or a small extension to suitable code. Name the exact path
   and symbol in each reuse finding. Never claim reuse from a name alone. Never
   force reuse that creates incorrect coupling. Before step 4, compare each
   substantial new behavior with existing code.

4. **Walk the checklist.** Apply `references/review-checklist.md`. Cover each
   area that applies to the diff. For a grouped PR, also cover group coverage.
   Apply language and framework rules only to relevant files. Before step 5,
   examine each applicable area. Give each skipped area a reason.

5. **Confirm before you report.** Re-derive significant findings from the actual
   code and contracts. When independent review is available, use it for
   important or ambiguous findings. If a candidate cannot be re-derived, drop
   it. List it as dropped. Never report it. Separate unknown evidence from
   confirmed defects. Never call an incomplete review clean. State each
   important area that you could not inspect. Before step 6, give each reported
   finding evidence. Give each dropped candidate a reason.

6. **Report.** Deliver the terminal report. Give each finding this shape:

   | Field | Required content |
   | --- | --- |
   | Severity | Blocker, Required, or Suggestion. |
   | Location | Path, line or symbol, and the reviewed revision. |
   | Evidence | The real failure state, broken contract, or structure cost. |
   | Impact | What goes wrong or becomes materially harder to maintain. |
   | Correction | The smallest coherent fix. |
   | Reuse | The existing path and symbol, when reuse is the remedy. |
   | Simplification | Removed rules, conditions, modes, or layers. |
   | Verification | A real test, command, or concrete code comparison. |

   A Blocker is a serious established defect or an unacceptable safety risk. A
   Required finding is an established in-scope defect, an important test gap, or
   a material design regression that must be fixed before merge. A Suggestion is
   an optional improvement with a clear benefit. Resolve Blocker and Required
   findings before merge. Give one final verdict: Ready, Changes required, or
   Incomplete. Ready means adequate evidence with no unresolved Blocker or
   Required finding. Incomplete means evidence gaps remain. Include the reviewed
   head, the scope, the executed checks, group coverage when applicable, and
   evidence gaps.

   Report in the terminal by default. Use native `gh pr review` only when the
   active request explicitly authorizes posting. Use `--comment`,
   `--request-changes`, or `--approve`. Add `--body-file`. Never give a false
   approval. Never approve through another identity. Never post independent
   review results as the decision of another reviewer.

## Result

The terminal shows the review report. Each finding has evidence, impact, a
correction, and verification. The verdict is Ready, Changes required, or
Incomplete. No outward action occurred beyond explicitly authorized posting.

## Completion checks

Before the report is complete, make sure that each item below is true:

- The skill reported no finding without evidence.
- The skill softened no verified Blocker into a suggestion.
- The skill edited no source.
- The skill posted nothing without explicit posting authorization.
- The skill approved nothing and merged nothing.
- The report names each skipped area, each dropped candidate, and each evidence
  gap.

## References

Read these references at the stated times:

- Read `references/review-checklist.md` in step 4 for the area checks.
- Read `references/runtime-trust.md` before any action for the trust rules.
