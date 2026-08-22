# Security audit rubric

Audit assets, identities, trust boundaries, privileged operations, attacker
inputs, and recovery paths. Cover authentication and authorization, injection,
path traversal, request forgery, cross-site attacks, unsafe deserialization,
cryptographic misuse, dependency advisories, production configuration, data
minimization, logging, and secret lifecycle only where applicable.

A finding requires reachable input, missing or bypassable control, concrete
consequence, and 2–5 citations. Separate a theoretical hazard from an exploitable
path. Never execute payloads against external systems. A committed credential is
reported by location and type only and requires rotation before code cleanup.

Report `NOT_APPLICABLE` or a reasoned skip for absent surfaces. Lack of evidence
is `NOT_VERIFIED`, never a pass.
