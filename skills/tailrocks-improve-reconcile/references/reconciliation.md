# Standalone backlog reconciliation

`plans/README.md` is the sole mutable truth surface. A plan body is immutable
history; changed intent requires a new numbered plan. Verify rows against current
Git evidence and commands before changing status. Fixed independently becomes
`RETIRED` with its fixing SHA. Stale evidence becomes `STALE`; a broken plan is
`BLOCKED`; neither is silently rewritten or declared complete.

Write the index atomically with a pre-write byte comparison. Conflict leaves the
index unchanged and returns the observed hash.

Preserve the canonical `## Rejected findings` table. Revalidate each row's
stable identity, reason, secret-safe evidence locators, observed SHA/date, and
next owner. An exact live row stays. Changed bound evidence returns the typed
`stale_rejection_evidence` refusal without mutation; only planning may add a new
stable identity after re-deriving the finding. An identity collision or malformed
table blocks the whole CAS. Rejections have no plan status and never create a
plan file or empty commit.
