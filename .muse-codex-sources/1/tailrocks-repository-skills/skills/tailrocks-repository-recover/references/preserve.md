# Preservation procedure

Read this reference when step 7 preserves work. It needs `--publish`.

Contents: destination, sensitivity, branch naming, authorship,
recipes, LFS, push rules, grouping.

## Destination

Use the correct writable upstream when permitted. Otherwise use a
verified fork under the selected recovery owner. Verify repository
identity, fork relationship, visibility, and write authority. Never
bypass organization restrictions. Never publish confidential work
through a public fork. Never use a private repository as a substitute
for secure credential storage.

## Sensitivity

Scan newly published files and relevant history for sensitive data.
Preserve necessary sensitive data only through an existing authorized
secure route. Keep the Source and report a Blocker when that route is
unavailable. Never silently discard sensitive bytes to make cleanup
pass. Cite secret locations and types without copying values. Never add
`.env`, token, secret, or credential files to a preservation commit.
Prefer explicit pathspecs over blind `git add -A`.

## Branch naming

Reuse a suitable existing branch without rewriting it. If it points at
the same commit, reuse it and record that fact. If it points elsewhere,
never move it. Create a suffixed name instead. Never delete or rename
existing Recovery branches.

When no suitable branch exists, create a marked Recovery branch. Mark
every new branch made by this skill with its stable name:

- `recovery/tailrocks-repository-recover/<run-id>/<source-id>`
- `recover/tailrocks-repository-recover/<run-id>/<contribution>`
- `recovery-report/tailrocks-repository-recover/<run-id>`

Never put private absolute paths or secret values in branch names.

## Authorship

Preserve original authorship where available. Identify the skill as the
recovery mechanism, not the original author.

## Recipes

- Commit legitimate Source changes promptly. Work-in-progress commits
  are acceptable for preservation. Never wait for build success to
  preserve unfinished work. Never blindly stage an entire scratchpad.
- Preserve different index and working-tree versions when both contain
  unique work. A non-destructive split: resolve the stash commit with
  `git stash create` and branch at it instead of popping.
- Preserve stash entries without dropping them: resolve `git rev-parse
  stash@{n}` and create a branch at that commit. Never `stash pop`,
  `stash drop`, or `stash clear`.
- Preserve interrupted operations without aborting them. Branch at
  `HEAD`. Anchor each present `MERGE_HEAD`, `CHERRY_PICK_HEAD`, or
  `REBASE_HEAD` commit with its own ref. Copy `MERGE_MSG` into the
  manifest. Never `--abort`, `--continue`, or `--quit` to simplify.
- Anchor otherwise unreachable useful objects through suitable remote
  recovery refs. A ref makes them reachable. An unreferenced object
  stays exposed to garbage collection. Never run `gc --prune=now`.
- Use supplementary artifacts for state that a normal commit cannot
  preserve. Record each artifact hash in the manifest.

## LFS

Transfer required LFS data separately after the Git push: dry-run first
with `git lfs push --dry-run`, then push. Never accept an uploaded
pointer as proof of uploaded content. Account for hosting limits without
dropping oversized unique files.

## Push rules

Push with plain `git push <remote> <refspec>` only. Never `--force`,
`--force-with-lease`, `+refspec`, `--delete`, `--all`, `--tags`, or
`--mirror`. Never change protected branches.

## Grouping

Deduplicate verified identical content. Keep a source map for every
original location. Never create one branch per temporary file. Group
coherent Source states and Contributions without losing their identity.
Record the expected commit ID for every pushed ref before pushing.
