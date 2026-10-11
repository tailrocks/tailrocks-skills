# Security audit rubric

Audit assets, identities, trust boundaries, privileged operations,
attacker inputs, and recovery paths. Cover each area below only
where it applies:

- Authentication and authorization
- Injection and path traversal
- Request forgery and cross-site attacks
- Unsafe deserialization
- Cryptographic misuse
- Dependency advisories
- Production configuration
- Data minimization and logging
- Secret lifecycle.

A finding needs reachable input, a missing or bypassable control,
a concrete consequence, and two to five citations. Separate a
theoretical hazard from an exploitable path. Never execute payloads
against external systems. Report a committed credential by location
and type only. It needs rotation before code cleanup.

Report `NOT_APPLICABLE` or a reasoned skip for absent surfaces.
Lack of evidence is `NOT_VERIFIED`, never a pass.
