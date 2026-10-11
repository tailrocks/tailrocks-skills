# Architecture and documentation criteria

The measurable contract starts with an inward dependency DAG.
Every crate or module has a tier, allowed dependencies, public
entry points, an owner, and a narrow verification command.
Foundational domain code has no HTTP, UI, process, test,
generated, or adapter dependency.

For Rust, `cargo metadata` supplies the crate graph. For
TypeScript, the selected architecture provider exposes cycles,
unresolved imports, reverse layer edges, inward route
dependencies, product-to-primitive inversions,
production-to-test imports, and feature implementation
subpaths. Known violations have stable repository-relative
identities.

Every bounded module documents its purpose, tier, allowed edges,
public surface, layout, and verification in its local
documentation. Secondary indexes derive from those sources. A
code-to-doc map covers externally visible behavior. Documented
commands, internal links, flags, routes, fields, and module
paths stay current.

Generated files name their generator and reproduce cleanly from
owned inputs. The audit treats an unclassified edge, a
duplicated source of truth, a stale doc mapping, and edited
generated output as a gap.
