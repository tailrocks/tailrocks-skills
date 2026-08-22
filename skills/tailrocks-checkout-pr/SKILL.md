---
name: tailrocks-checkout-pr
description: >-
  Use only when the user explicitly requests this skill. Switch the working repository onto a pull request's branch via gh pr checkout, guarding a dirty working tree first. Accepts a PR number, URL, or branch name. Do not use to create, refresh, or merge a PR.
argument-hint: "<PR number | URL | branch>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Checkout PR

Switch the working repository onto a PR's branch via `gh pr checkout`. Works
in any repository with an authenticated `gh`; needs nothing from
`.tailrocks/pr.md`.

## Steps

1. **Resolve to a PR.** Number or URL → pass to `gh pr checkout` directly.
   Branch name → query `gh pr list --head <branch> --state all` for number,
   state, and head repository. Prefer one exact open match. Zero or multiple
   matches → STOP and list candidates; never select `.[0]`. A closed or merged
   match still requires step 3 confirmation. Never fall back to raw `git checkout` — the
   point of the skill is landing on the PR, not on a similarly named branch.

2. **Guard the working tree.** `git status --porcelain` — if dirty, STOP and
   ask the operator to commit, stash, or discard first. Never auto-stash:
   a stash the operator does not know about is where work goes to die. Note
   `git branch --show-current` — the way back.

3. **Check the PR is open.** `gh pr view <N> --json state,headRefName`.
   `MERGED` or `CLOSED` → warn that the branch may be stale or deleted and
   confirm before proceeding.

4. **Switch.** `gh pr checkout <N>`. Verify `git branch --show-current`
   matches `headRefName`.

5. **Report.** Switched from `<old>` to `<headRefName>` (PR #N). Way back:
   `git switch <old>`.
