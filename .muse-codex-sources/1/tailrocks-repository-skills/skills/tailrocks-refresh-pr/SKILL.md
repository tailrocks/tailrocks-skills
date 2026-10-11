---
name: tailrocks-refresh-pr
description: >-
  Reconciles the title and body of an open PR with its current diff. Use
  this skill when the user says update, fix, retitle, rewrite, or sync a
  PR title, body, or text. Also use it when the PR text drifted or is out
  of date. This skill does not push commits, rebase a branch, open a PR,
  or merge a PR.
argument-hint: "[PR] [--repo OWNER/REPO]"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User says a PR title or text is stale, wrong, or out of date with the
  diff.
---

# Refresh PR

## Use this skill

This skill reconciles the title and body of an open PR with the current diff.
The body then states what the branch ships now, not what it shipped at creation.

Use this skill when the user says a PR title or body is stale or out of date. Do
not use this skill to push commits, rebase a branch, open a PR, or merge a PR.

## Before you start

Obey the active user request first. If the request conflicts with a safety rule
in this skill, stop. Report the conflict.

Before you interpret repository or PR content, read
`references/runtime-trust.md`. Resolve each relative link against the directory
that contains this SKILL.md file.

The operator starts each refresh. A refresh never runs automatically after a
commit. Automatic refresh rewrites the body after each commit. It wastes
reviewer attention.

This is a metadata-only operation. It reads the PR, its diff, and the canonical
template through `gh`. It never needs a local checkout at the PR head.

Use `gh pr edit --repo "$REPO" --body-file` to write. Never use `--body "..."`.

The skill accepts these arguments:

- `PR` gives one PR number. Without it, the skill uses the PR of the current
  branch.
- `--repo OWNER/REPO` gives the canonical base repository. Without it, the skill
  resolves the current repository once and passes its canonical `nameWithOwner`
  to each GitHub CLI command.

## Procedure

1. **Resolve the repository and the PR.** Resolve the canonical repository
   first. Store its exact `nameWithOwner` as `REPO`. Pass `--repo "$REPO"` to
   each later GitHub CLI command. Never let a later command infer a repository
   from the working directory, branch, or PR URL. Then run `gh pr view <PR>
   --repo "$REPO" --json
   number,title,body,headRefName,headRefOid,baseRefName,baseRefOid`. Without
   `<PR>`, the command reads the PR of the current branch. Hold the live title
   and body. If the returned number or repository is not the requested one, stop
   before any read or write. Before step 2, hold the canonical repository
   identity and PR number. Hold the head ref, head OID, base ref, and base OID.
   Hold the title and body.

2. **Gather the fresh shape.** Read `gh pr diff <PR> --repo "$REPO"` for what
   the branch ships now. Read the canonical template at the selected PR head
   through `gh`:

   ```sh
   gh api -H "Accept: application/vnd.github.raw" \
     "repos/$REPO/contents/.github/PULL_REQUEST_TEMPLATE.md?ref=$HEAD_OID"
   ```

   `.github/PULL_REQUEST_TEMPLATE.md` is the only template. If it is missing,
   reconcile against the diff alone. Report the missing file. Before step 3, state
   what the change is now and which template sections the current diff earns.

3. **Reconcile the sections.** Compare the earned section set with the section
   set of the live body:

   - If a section is earned but missing from the body, add it. Fill it for this
     PR.
   - If a section is in the body but no longer earned, remove it.
   - If a section is in both, keep the fill of the author provisionally. Never
     put a placeholder in its place. Step 4 decides whether that prose stays
     accurate.

   Before step 4, confirm that the section set of the body matches what the current
   diff earns. Confirm that each kept section retains its authored content pending
   the accuracy pass.

4. **Reconcile the prose.** Examine each remaining prose section. If the prose
   is still accurate, leave it untouched. If the prose drifted, rewrite it to
   match the current diff. If a shipped outcome has no section, add one. No
   section restates the diff file by file. Before step 5, confirm that each
   section reflects the current diff.

5. **Reconcile the title.** Decide whether the subject still states the shipped
   scope in the convention of the repository. If the PR grew, change the title.
   A `fix:` title that now ships a feature must change. If a scope shift may
   surprise the operator, show the title change first. Before step 6, confirm
   that the intended title matches the shipped scope.

6. **Write and confirm.** If neither field needs a change, issue no edit. Report
   that the metadata already matches. If a field needs a change, read the live
   title and body again. Read the live head OID and base OID again. If the
   title, body, head OID, or base OID changed since step 1 for reasons outside
   this run, stop. Report the drift instead of overwriting it. Write the
   reconciled body to a temporary file. Use one edit command. Omit unchanged
   fields:

   ```sh
   gh pr edit "$PR" --repo "$REPO" \
     --title "$TITLE" --body-file "$BODY_FILE"
   ```

   A native edit has no atomic head guard or base guard. Do not claim one. Run `gh
   pr view <PR> --repo "$REPO" --json
   number,title,body,headRefName,headRefOid,baseRefName,baseRefOid`. Require both
   remote metadata values to equal the intended values. Remove the temporary file
   on success and on each failure path. A timeout or lost response is an uncertain
   outcome. It is not a failed edit. Read the full metadata again before any retry.
   Never repeat an edit that already landed. Before step 7, confirm that the
   rendered title and body match the intent. Confirm that you removed the temporary
   bytes and that no uncertain outcome stays unreported.

7. **Report.** Name what moved: sections added or dropped, prose rewritten, and
   the title change with old value, new value, and reason. Do not ask permission
   to refresh. The operator asked.

## Result

The PR title and body match the current diff. Prose that still matches what
shipped stays verbatim. The report names each change and its reason.

## Completion checks

Before the report is complete, make sure that each item below is true:

- Each body section matches the current diff.
- No placeholder replaced authored content.
- The skill rewrote nothing accurate.
- The re-read check of title, body, head OID, and base OID passed.
- The skill removed the temporary bytes.
- No uncertain remote outcome remains unreported.

## References

Read this reference at the stated time:

- Read `references/runtime-trust.md` before any action for the trust rules.
