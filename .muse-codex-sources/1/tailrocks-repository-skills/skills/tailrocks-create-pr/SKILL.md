---
name: tailrocks-create-pr
description: >-
  Opens exactly one pull request for a branch, or reuses a suitable
  existing PR. Use this skill when the user says open, create, put up, or
  raise a PR. Also use it when the user says propose a change or
  convert a branch to a PR. Also use it when the user says draft PR, MR,
  change, or CL. This skill does not update
  PR metadata, review a PR, or merge a PR.
argument-hint: "[--branch <name>|--auto-branch] [--title <msg>] [--base <branch>] [--draft]"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User asks to put up a pull request for the current branch or ship a
  branch for review. User also asks to draft a PR or turn work into a
  merge request.
---

# Create PR

## Use this skill

This skill opens one pull request for a self-contained change. The skill uses
native Git and `gh` commands. The skill commits inline. No separate commit skill
exists.

Use this skill when the user asks to open, create, or raise a PR for a branch.
Do not use this skill to update PR metadata, review a PR, or merge a PR.

## Before you start

Obey the active user request first. If the request conflicts with a safety rule
in this skill, stop. Report the conflict.

Before any action, read `references/runtime-trust.md`. Resolve each relative
link against the directory that contains this SKILL.md file.

The conventions of the repository are the authority. This skill sequences them.
It never restates them. Take repository behavior from the files of the
repository: `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, agent
instruction files, branch protection and merge settings from `gh repo view`, and
live history. No separate conventions file exists.

This skill never commits to the target branch. This skill never force-pushes.
This skill never edits the branch of another person. If the run needs a
force-push or an edit to a foreign branch, stop. Ask the user for direction.

The invocation of this skill authorizes the push and `gh pr create`. That
authorization does not cover a force-push or an edit to the branch of another
person.

Use `--body-file` to write the body. Never use `--body "..."`.

The skill accepts these arguments:

- `--branch <name>` gives one explicit branch name.
- `--auto-branch`: the skill selects the branch name. No confirmation occurs.
- `--title <msg>` gives the commit subject and PR title. Without it, the skill
  derives the title from the diff.
- `--base <branch>` gives the target branch. Without it, the skill uses the
  default branch of the repository.
- `--draft`: the skill opens the PR as a draft.

## Procedure

1. **Resolve the repository and the target.** Run `gh repo view --json
   nameWithOwner,url`. Store the exact `nameWithOwner` as `REPO`. Pass `--repo
   "$REPO"` to each later `gh` command. Resolve the target branch. If `--base`
   is present, use its value. If `--base` is absent, use the default branch from
   `gh repo view --json defaultBranchRef`. Read the signals of the repository.
   Read the PR template, CONTRIBUTING, and agent instruction files. Read `git
   log --format=%s -20` for the live subject convention. Before step 2, state
   the branch scheme, the subject convention, and the body source for this
   repository.

2. **Select the branch.** If the current branch is the target branch, create a
   branch. Name the branch from the change in the scheme of the repository. The
   default prefixes are `fix/`, `feat/`, `docs/`, `chore/`, and `refactor/`. If
   neither `--auto-branch` nor `--branch` is present, suggest the name. Then
   confirm the name. Before you continue on an existing branch that already has
   a remote, confirm remote ownership. If a foreign party owns the branch, stop.
   Ask the user for direction. Before step 3, confirm that the current branch is
   not the target. Confirm that this work owns the branch and its remote.

3. **Commit.** If uncommitted changes exist, commit them inline. Write the
   subject in the convention of the repository. If the repository requires DCO,
   use `git commit -s`. That command signs the commit. If all changes are
   already committed, skip this step. Do not push in this step. Before step 4,
   confirm that the tree is clean and that the branch differs from the target.

4. **Build the body.** Read `references/pr-body.md`. Read the file
   `.github/PULL_REQUEST_TEMPLATE.md` from the working tree at runtime. Never
   read the template from memory. That path is the only template. No alternate
   locations exist. No generated skeletons exist. No fallback skeletons exist.
   If the file is missing and edits are authorized, use `tailrocks-pr-template`
   to create it. Include it in this branch. Examine the head again. If the file
   is missing and edits are not authorized, report the missing file. Stop. Write
   the prose from the actual diff. Select only the Verify-locally blocks that
   the diff earns. Add the real commands that a reviewer runs to them. Before
   step 5, confirm that each remaining section is filled and specific to this
   change.

5. **Reuse or create, then confirm.** List open PRs for this branch first:

   ```sh
   gh pr list --repo "$REPO" --head "$HEAD_BRANCH" --state open \
     --json number,title,baseRefName,headRefOid
   ```

   If exactly one suitable PR matches, reuse it. A suitable PR has the same base
   and the same scope. Push newly authorized commits to the reused PR. Use a normal
   fast-forward `git push`. If several conflicting PRs match, stop. Report the
   evidence for a user decision. If no suitable PR matches, use a normal
   fast-forward `git push`. If the remote rejects the push or the remote head is
   unexpected, stop the run. Never force-push to resolve the rejection. Then create
   exactly one PR. If the user requested a draft, include `--draft`:

   ```sh
   gh pr create --repo "$REPO" --base "$BASE" --head "$HEAD_BRANCH" \
     --title "$TITLE" --body-file "$BODY_FILE" --draft
   ```

   Without a draft request, omit `--draft` from the command. A pushed branch with
   no PR is the normal create case. It is not an error. Read the PR again. Use `gh
   pr view`. Require the number, head, base, title, and body to match the intent.
   After a timeout or a lost response, inspect remote state before a retry. Never
   create a duplicate. Before step 6, confirm that one open PR with verified
   identity covers this branch.

6. **Report.** Report the PR URL and the branch. Report the commands from the
   Verify-locally blocks of the body.

## Result

One open PR covers the branch. The PR body comes from the canonical template.
Each section is filled and specific to the change. The report gives the PR URL,
the branch, and the commands from the Verify-locally blocks.

## Completion checks

Before the report is complete, make sure that each item below is true:

- The branch is not the target.
- One open PR has a verified number, head, base, title, and body.
- The body came from the canonical template with no unfilled placeholder.
- The push was a normal fast-forward with no overwritten foreign head.
- If the user requested a draft, the create command included `--draft`.
- If the skill reused a PR, it pushed the newly authorized commits first.

## References

Read these references at the stated times:

- Read `references/pr-body.md` in step 4 for the body rules.
- Read `references/runtime-trust.md` before any action for the trust rules.
