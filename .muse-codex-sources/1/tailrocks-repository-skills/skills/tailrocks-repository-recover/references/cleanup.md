# Cleanup contracts

Read this reference when step 10 deletes and step 11 scans finally.

Contents: permission, writers, recheck, dependencies, retention modes,
loose deletion, exact paths, shared stores, run directory, final scan,
truthful completion.

## Permission

Cleanup requires explicit options and completed preservation checks.
Never infer cleanup permission from a request to find or review work.
Every deletion below also needs its Source preserved and verified, or a
recorded reason why the Source is exempt.

## Writers

Before deletion, stop relevant writers safely. Let agents flush work
before termination. Never use broad process-name kill commands. Never
delete live lock files to defeat ownership checks. Never terminate the
current coordinator before its final records are safe. Keep the Source
when a writer cannot stop safely.

## Recheck

Recheck the exact path identity, refs, and file state immediately
before deletion. A new file or changed ref invalidates earlier deletion
approval. Repeat preservation for the changed Source.

## Dependencies

Complete the dependency inventory before deleting containing
directories or shared Git stores. Remove dependent worktrees before
their common Git store. Preserve nested repositories and submodules
before deleting their containers. Use Git worktree management where
applicable. Never use forced removal to bypass missing evidence.

## Retention modes

- `keep` retains every local Git copy. It deletes nothing.
- `one` retains exactly the named checkout and branch. Preserve every
  other local state before removal. Never reset a dirty retained
  checkout to make it look clean.
- `none` removes all verified project Git copies. Retain no main, no
  canonical clone, and no hidden backup clone. Include bare stores,
  detached worktrees, and copies created by this run.

## Loose deletion

- `none` deletes no loose Finding.
- `temp` deletes only verified temporary Findings.
- `all` also deletes other eligible loose project Findings.

A directory name, age, size, or ignore rule is not deletion proof.
Delete reproducible output only after checking that it contains no
unique work. Never upload reproducible build output just to justify its
deletion.

## Exact paths

Use exact validated paths. Never use broad removal globs or follow
unchecked symlinks. Never recursively remove a shared home,
application, or temporary root. Never uninstall tools or remove
credentials as project cleanup.

## Shared stores

For shared session storage, remove only supported target-specific
records. Keep unrelated records and required database structure. When
safe selective removal is unavailable, report the retained data as a
Blocker. Never claim that all traces are gone.

`target-only` permits removal of eligible project session records after
preservation. It never permits deletion of unrelated sessions or shared
credentials.

## Run directory

Remove the Run directory last when `--clean-run-dir` is set. First
verify the remote report, recovery map, and any useful run output.
Include verifier clones, exports, scanner state, and temporary
downloads. Never recreate local project storage after the final cleanup
check. Never uninstall the plugin as run cleanup.

## Final scan

Run a fresh discovery pass over the declared scope. Repeat
target-specific loose-file and session checks. Never rely only on the
initial catalog. Report inaccessible paths, offline volumes,
unsupported formats, and bounded-search gaps.

## Truthful completion

Never describe an incomplete search as a whole-computer proof. Never
claim forensic erasure from snapshots, swap, or inaccessible storage.

Check whether the current agent session is still recording
target-related data. If it is, never claim that no related local files
exist. Use a supported external finalizer only with explicit authority.
Otherwise report the exact remaining session data and completion limit.

Report the selected retention mode accurately. A one-checkout result is
not a zero-copy result. A retained report is still a local project
file. A file moved into local Trash is still a local copy.

A blocked Source must remain intact. Continue independent cleanup, but
report partial completion. Never delete data to obtain a better
completion count.
