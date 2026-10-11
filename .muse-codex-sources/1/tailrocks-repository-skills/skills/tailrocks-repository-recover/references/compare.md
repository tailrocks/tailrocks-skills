# Comparison procedure

Read this reference when step 6 compares Contributions with the Target.

Fetch the exact current Target and record its full commit ID. List
relevant remote branches and PRs with complete pagination.

Use commit graphs and identical object IDs first. Use changed-file
groups and patch comparisons next. Read unique changes with their
callers, tests, and contracts. Avoid every possible pairwise
comparison.

Assign one verdict to each Contribution:

- Already present.
- Partly present.
- Useful and missing.
- Superseded.
- Reverted deliberately.
- Intended for another target.
- Incomplete or uncertain.

A shared patch ID is not sufficient proof of current behavior. A squash
merge can change commit ancestry. Check the current Target content and
relevant behavior. Never restore a deliberately removed feature without
a supported reason.

Preserve drafts before improvements. Prepare useful changes separately
from their original recovery snapshots. Record the relationship between
the Source and the Candidate. Send uncertain decisions to an independent
reviewer. Preserve unresolved work remotely when permitted. Never
pretend that unresolved work is suitable for merge.
