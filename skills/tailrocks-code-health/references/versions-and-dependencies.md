<!-- tailrocks-code-health-audit:start -->
# Version Ratchet Criteria

The shared version policy is the comparison source. The code-health provider
records deterministic repository-relative identities for committed toolchains,
manifests, lockfiles, dated tables, and visible incompatibility blockers.

Measurement resolves the current accepted version state, compares every owned
pin and exception, and reports `current`, `behind`, `blocked`, or `vulnerable`
with primary-source evidence and a narrow rerun. A previously resolved older-pin
exception is stale debt. A newly unlisted older pin is growth.

Security measurement resolves the advisory's highest fixed version. Any lower
resolved pin, batching hold, or update-delay configuration is a blocking
violation. The same semantic result drives human, JSON, and CI output.
<!-- tailrocks-code-health-audit:end -->

## Mutation adapter

When version debt is approved, the canonical Renovate template supplies the
provider wiring and `vulnerabilityFixStrategy: highest`. Establish freezes exact
current version exceptions and adds continuous detection. Tighten updates exact
pins or deletes resolved exceptions; it never widens accepted lag or delays a
security fix.
