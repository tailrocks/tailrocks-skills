# Standalone backlog reconciliation

`plans/README.md` is the sole mutable truth surface. A plan
body is immutable history. Changed intent needs a new
numbered plan. Verify rows against current Git evidence and
commands before changing status. A finding fixed
independently becomes `RETIRED` with its fixing SHA. Stale
evidence becomes `STALE`. A broken plan is `BLOCKED`.
Neither is silently rewritten or declared complete.

Write the index atomically with a pre-write byte comparison.
A conflict leaves the index unchanged and returns the
observed hash.

Preserve the canonical `## Rejected findings` table.
Revalidate the stable identity, reason, secret-safe evidence
locators, observed SHA and date, and next owner of each row.
An exact live row stays. Changed bound evidence returns the
typed `stale_rejection_evidence` refusal without mutation.
Only planning adds a new stable identity after re-deriving
the finding. An identity collision or malformed table blocks
the whole compare-and-swap. Rejections have no plan status.
They never create a plan file or empty commit.
