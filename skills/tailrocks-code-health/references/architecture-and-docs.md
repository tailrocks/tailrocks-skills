# Architecture and Documentation Gates

Declare an inward dependency DAG before checking it.

For Rust, derive the crate graph from `cargo metadata`; assign every crate a tier
and allowed dependencies. Foundational domain crates depend on no HTTP/UI/process
adapter. Axum and binaries sit outward. Expose implementation through each
crate/module entry point; keep tests and generated/lint crates outside production
edges.

For TypeScript, use Dependency Cruiser with TS7 paths to reject cycles,
unresolved imports, reverse layer edges, route imports from inward modules,
product dependencies from shadcn primitives, production-to-test imports, and
feature implementation subpaths. Use its baseline reporter for known brownfield
violations and ratchet them.

Each bounded module/crate owns a concise README or equivalent containing purpose,
tier, allowed dependencies, public entry points, layout, and verification command.
A structural change updates that source in the same commit. Generate secondary
indexes from these local sources rather than duplicating prose.

Maintain a code-to-doc map for externally visible behavior. Execute or parse
documented commands in CI, check internal links, and fail stale references to
removed flags, routes, config fields, or modules.

Generated files declare their generator and are checked for clean regeneration.
Agents edit inputs, never generated outputs.

**Completion:** every dependency edge and structural/doc ownership rule is
machine-checkable, produces file-level diagnostics, and points to its narrow fix.
