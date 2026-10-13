# Discovery procedure

Read this reference when step 3 discovers Git copies. Use
[repo-scan](https://github.com/tailrocks/repo-scan) as the scanner.
Never build a second general repository scanner in this package.

Scanner checked: version 0.1.0, commit
`13e534b5d2ad688a4d05901d36d5afc95bc454ce` (2026-10-03). No releases
or tags exist. Pin the commit and record `tool.source_commit` from
each report. Recheck the scanner docs when it updates.

Contents: setup, cheap pass, deep pass, exit codes, scope behavior,
session paths, ordering rules, performance record, upstream gaps.

## Setup

Reuse a suitable release binary where available. Otherwise build once
from a clean checkout. Never replace a dirty scanner checkout. Verify
the syntax against the installed build before use:

```sh
repo-scan --state-dir "$RUN_DIR/repo-scan" scan "$REPO_URL" \
  --scope machine --status metadata \
  --report "$RUN_DIR/repositories.json"
```

Use a fresh isolated state dir per run. One owner process holds one
state dir. Parallel scans need separate state dirs.

## Cheap pass

Run the cheap pass first with `--status metadata`. It collects
directory and repository metadata without status probes. Record wall
time and the exit code.

## Deep pass

Run a deep pass only when the cheap pass justifies it: same command
with `--status summary` (or `full`). If `coverage.status` is not
complete, rerun the deep pass with `--force-rescan`. The scanner never
narrows discovery by status. Unknown values stay null.

## Exit codes

- `0`: success. Zero matches is still success, not proof of complete
  coverage.
- `1`: operational failure.
- `2`: invalid arguments. `--scope roots` without `--root` exits 2.
- `3`: usable with gaps, no suitable catalog, or superseded resume.
  Triage `coverage.gaps`, root states, and errors.
- `130`: interrupted after a bounded save.

## Scope behavior

Machine scope seeds priority roots first (`/tmp`, `/private/tmp`,
`$HOME`, system temp, cargo home), then walks every mount-table root
round-robin. Nothing is excluded by directory name. Symlinks are never
followed. They are recorded as aliases. Denied or offline roots persist
as coverage gaps, never silent drops.

The scanner is single-threaded by design. Never claim parallel scanner
execution. The skill parallelizes only its own bounded candidate work,
with one mutation owner per Git common directory.

The scanner finds Git entities only: clones, worktrees, bare stores,
nested copies, detached states, submodules, alternates. It has no
file-level records. Loose files and session paths stay skill-side (see
[the loose-file procedure](loose-files.md)).

## Session paths

Resolve session paths with `realpath` (the scanner never follows
symlinks). Pass them as repeatable `--root` values for a fast scoped
pass. Merge that pass with the machine report on canonical URL and Git
path.

## Ordering rules

- Run one coordinated discovery process for the selected repository.
  Never scan the computer once per branch, agent, or subagent. Use one
  shared inventory.
- Collect cheap metadata first. Then inspect Git state for confirmed
  candidates. Then inspect loose files and session records.
- Never block discovery on remote requests or full working-tree hashes.
- Never call Git in every directory. Never begin with a full-disk
  content grep.
- Use session indexes and recorded paths before large content searches.
- Read large logs as streams. Hash content only when identity or
  preservation requires it. Avoid repeated archive extraction and
  repeated reads of large build trees.
- Inspect each shared object store once. Inspect each worktree's files
  and index separately.

## Performance record

Record discovery time, coverage, directories, files, bytes read, and
peak resources from the report (`scan.started_at/finished_at`,
`coverage`, `resources`, per-root states, errors). Report Git analysis
and network verification time separately. Never claim full-computer
speed from small fixture benchmarks.

Speed comes from batching, reuse, and correct ordering. It never comes
from hidden scope exclusions.

## Upstream gaps

If a required scanner capability is missing, report the exact gap.
Propose a small upstream change. Never expand this task into a scanner
rewrite. Known gaps as checked are three items. There is no isolated
first-result-latency record. Metadata-to-summary escalation reuse is not
fully documented. Bytes-of-content total is absent (use enumerated
entries plus directories complete).
