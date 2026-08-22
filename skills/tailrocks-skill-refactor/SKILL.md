---
name: tailrocks-skill-refactor
description: >-
  Use only when the user explicitly requests this skill. Change skill architecture or public contracts by splitting, merging, renaming, extracting, replacing, deprecating, or migrating responsibilities.
argument-hint: "<skill or skill family> <transformation>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Skill Refactor

Refactoring changes responsibility topology or a public contract while
preserving supported capability unless the user explicitly approves a breaking
change. Applying findings without such a change belongs to
`tailrocks-skill-update`. An audit report is useful evidence, not mandatory for
an intentional architecture migration.

Use the design, testing, and house-wiring doctrine shipped with
`tailrocks-skill-audit` for contract layers, comparative proof, and migration
wiring.

## Steps

1. **Establish the transformation basis.** Accept a current architecture
   finding or an explicit contract-change request. Inventory each source
   skill's responsibility, triggers, outputs, authority, side effects,
   references, scripts, and eval coverage. Reopen cited evidence and reject
   stale assumptions.
   **Complete when:** source contracts and requested transformation are explicit.

2. **Build the responsibility graph.** Split when responsibilities differ in
   intent, trigger population, output, authority, side effects, verification,
   or independent failure mode. Keep one skill when phases form one transaction
   with shared state and invariants. Line count alone never decides topology.
   **Complete when:** every source responsibility maps to exactly one target.

3. **Design target contracts and migration.** Record old-to-new invocation,
   responsibility, artifact, permission, and compatibility mappings; name any
   breaking change, deprecation period, rollback, and removal condition. Target
   contracts must neither overlap nor orphan supported journeys.
   **Complete when:** migration is reversible or its approved irreversibility is
   explicit, and every old journey has one target route.

4. **Implement beside the source, then prove composition.** Compare the old
   topology, each new direct invocation, and any composed flow. Prove capability
   coverage, unambiguous routing, authority containment, context reduction for
   direct paths, and no unacceptable handoff failures before removing sources.
   Update all wiring and migration surfaces.
   **Complete when:** old journey corpus passes through targets and validation is green.

5. **Verify independently.** Run a fresh portfolio-aware skill audit. The
   implementer does not approve its own topology.
   **Complete when:** independent audit finds no orphan, overlap, routing
   ambiguity, or unapproved contract loss.

## Red flags — STOP

- "Split it because it is long" — size is evidence to inspect, never a boundary.
- "Skip the re-audit, the fixes are obvious" — the implementer never
  self-verifies.
- "Delete the old skill after target files exist" — replacement is unproven
  until old journeys route and pass.
- An old invocation shaped as `<skill> <finding IDs>` — route contract-preserving
  findings to `tailrocks-skill-update`; refactor handles only topology or public-
  contract change.

## Final gate

Never split by size alone. Never lose or duplicate a responsibility silently.
Never remove a source before migration proof. Never self-verify. Never run the
eval harness locally. Report every approved contract change and skipped check.
