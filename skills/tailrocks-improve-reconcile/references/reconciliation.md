# Standalone backlog reconciliation

`plans/README.md` is the sole mutable truth surface. A plan body is immutable
history; changed intent requires a new numbered plan. Verify rows against current
Git evidence and commands before changing status. Fixed independently becomes
`RETIRED` with its fixing SHA. Stale evidence becomes `STALE`; a broken plan is
`BLOCKED`; neither is silently rewritten or declared complete.

Write the index atomically with a pre-write byte comparison. Conflict leaves the
index unchanged and returns the observed hash.
