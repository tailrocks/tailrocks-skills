<!-- tailrocks-code-health-audit:start -->
# Architecture and Documentation Criteria

The measurable contract starts with an inward dependency DAG. Every crate or
module has a tier, allowed dependencies, public entry points, owner, and narrow
verification command. Foundational domain code has no HTTP, UI, process, test,
generated, or adapter dependency.

For Rust, `cargo metadata` supplies the crate graph. For TypeScript, the selected
architecture provider exposes cycles, unresolved imports, reverse layer edges,
inward route dependencies, product-to-primitive inversions, production-to-test
imports, and feature implementation subpaths. Known violations have stable
repository-relative identities.

Every bounded module's local documentation states purpose, tier, allowed edges,
public surface, layout, and verification. Secondary indexes derive from those
sources. A code-to-doc map covers externally visible behavior; documented
commands, internal links, flags, routes, fields, and module paths remain current.

Generated files name their generator and reproduce cleanly from owned inputs.
The audit treats an unclassified edge, duplicated source of truth, stale doc
mapping, or edited generated output as a gap.
<!-- tailrocks-code-health-audit:end -->

## Mutation adapter

Establish writes the approved DAG, current presence baseline, and one provider
gate. Tighten only deletes resolved violations or narrows the approved surface;
it never reclassifies a forbidden edge to absorb a regression.
