# Version ratchet criteria

The shared version policy is the comparison source. The
code-health provider records deterministic repository-relative
identities for committed toolchains, manifests, lockfiles, dated
tables, and visible incompatibility blockers.

Measurement resolves the current accepted version state. It
compares every owned pin and exception. It reports `current`,
`behind`, `blocked`, or `vulnerable` with primary-source evidence
and a narrow rerun. A previously resolved older-pin exception is
stale debt. A newly unlisted older pin is growth.

Security measurement resolves the highest fixed version of the
advisory. A lower resolved pin, a batching hold, or an update
delay that contradicts the recorded policy is a blocking
violation. The same semantic result drives human, JSON, and CI
output.
