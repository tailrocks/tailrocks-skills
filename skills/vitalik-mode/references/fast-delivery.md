# Fast delivery

## Diagnose the delay

Inspect the queue, job duration, cache behavior, recent failures, and source
changes.
Distinguish slow compilation from a failed assertion or a deployment failure.
Compare related jobs before attributing failures to shared infrastructure.
Include deployment coupling when a merge can trigger publication automatically.

Use observations to estimate the normal critical path.
Compare it with batch integration and expected repair.
Do not copy the user's illustrative timings into the plan as measured facts.

## Merge before green CI

Use supported administrator merge operations when the current authority permits
them.
Preserve the repository and target selected for the goal.
Resolve each selected PR's current head before its merge.
Use an atomic expected-head condition when the merge interface supports it.
If that condition fails, inspect the new head before retrying.
If no atomic condition exists, disclose the race and inspect the merged revision
before extending the batch.
If its contents changed after analysis, inspect the change before including it.
Read dependency ordering and overlapping edits before selecting a batch.

Choose batch boundaries that reduce total integration time.
A batch can be large when evidence supports its independence and recovery cost.
Do not merge unrelated or unexamined work merely because it is available.
Do not wait for pending compilation solely because the normal process requires
green CI.

Record which signals the decision used and which checks remain pending.
Do not fabricate passing checks or alter check results.
If the platform denies the supported merge operation, report the actual blocker.
Replan with available operations without bypassing access controls.

GitHub CLI supports `--match-head-commit` with an authorized `--admin` merge.
GitHub's merge API accepts an expected head SHA.
Use the exact head that the analysis covered.
[GitHub CLI merge](https://cli.github.com/manual/gh_pr_merge) documents the
command options.

## Release CI capacity

Identify runs by repository, workflow, event, source revision, and current
purpose.
Cancel runs that are superseded, duplicated, or unnecessary for the selected
plan.
Consider lost coverage and any teardown or deployment work before cancellation.
Keep a useful latest integrated run when it provides information needed for
recovery.
Do not cancel a run merely because it contains inconvenient evidence.
Record canceled runs separately from passing or failing checks.

## Work with a red main branch

Treat temporary red main as an allowed intermediate state.
Before merging, name the expected failure and the proposed repair when known.
For uncertain integration failures, name the first diagnostic step and a
credible recovery option.
Keep the primary agent responsible for recovery.

After the batch, inspect the integrated branch and relevant failures.
Fix shared causes before repeating per-PR work.
Use focused checks to decide the next action.
Choose forward repair or rollback by expected total delivery time.

Use the plan's next observation point to detect a deteriorating approach.
If scope, failure type, or recovery time changes materially, request a revised
plan.
Do not extend a failing batch on the strength of the original estimate alone.

## Alternative release paths

Use a custom or manual release route when the goal authorizes publication.
Identify the exact source revision, version, destination, and required artifact.
Inspect the actual published result after the release.
Retain enough source and artifact information to repair the release if
necessary.

Report delivery and CI status as separate facts.
A delivered artifact can have pending checks.
A green check does not by itself prove that the requested artifact was
delivered.
