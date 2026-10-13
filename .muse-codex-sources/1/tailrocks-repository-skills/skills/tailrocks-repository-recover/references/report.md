# Report procedure

Read this reference when step 8 opens PRs and when the run writes its
report. Use the existing create, refresh, and review skills. Never
implement another PR workflow.

Contents: findings PR, candidate PRs, four states, handoff, examples.

## Findings PR

Create one findings PR for the recovery report when publication is
authorized. Use a small report file in the repository's approved
documentation location. Include links to the Recovery branches and
Candidate PRs. Include excluded Findings, Blockers, and verification
results. Never put raw session databases, full transcripts, or build
output in this PR. Keep private recovery details in an appropriately
private record.

## Candidate PRs

Create focused Candidate PRs for useful Contributions. Prepare useful
changes separately from their original recovery snapshots. Reuse an
existing suitable PR when possible. Use draft status for incomplete or
unverified candidates. Never manufacture an empty code change to create
another PR. Review each candidate with `tailrocks-review-pr`.

## Four states

The report distinguishes:

- Preserved work.
- Proposed integration work.
- Reviewed integration work.
- Work actually merged.

## Handoff

This skill never merges its Candidate PRs. It never calls
`tailrocks-repository-merge` automatically. It finishes with a precise
human handoff. The handoff includes the published source list (branch
names, PR numbers, PR URLs), source-map locations, and Target verdicts.
It includes the exact merge command the human can run next.

## Reruns

Every run uses a new run ID and a new Run directory. A rerun reuses a
suitable existing Recovery branch or PR without rewriting it. It never
creates a needless duplicate branch or PR. It records prior run IDs in
its run header and re-verifies inherited state before it trusts it.
Report-only reruns stay safe: they change nothing outside their own Run
directory.

## Examples

Report-only recovery from the current repository:

```text
tailrocks-repository-recover
```

Recovery and publication for an explicit repository URL:

```text
tailrocks-repository-recover --repo https://github.com/OWNER/REPO --publish
```

Temporary-file cleanup with exactly one retained checkout and branch:

```text
tailrocks-repository-recover --repo OWNER/REPO --publish --cleanup temp --local-state one --keep-checkout /path/to/checkout --keep-branch work
```

Complete eligible local cleanup with no retained project Git copy:

```text
tailrocks-repository-recover --repo OWNER/REPO --publish --cleanup all --local-state none --session-data target-only --clean-run-dir
```

A separate user invocation of repository-merge using the published
source list:

```text
tailrocks-repository-merge --repo OWNER/REPO --target-branch main recovery/tailrocks-repository-recover/<run-id>/<source-id>
```

Translate each example through the client's supported manual selector.
Each client section in the package install docs shows the exact form.
