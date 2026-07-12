# Versions and Dependencies

Support the latest stable major only. For pre-1.0 packages, support the latest
stable release series. Prereleases do not supersede stable versions. Refresh the
dated version tables in the Rust and TanStack setup skills on every tooling or
dependency change.

Install `templates/renovate.json`. Renovate detects Rust toolchains natively,
tracks Cargo/Bun lockfiles and manifests, pins frontend ranges, groups tightly
coupled ecosystems, proposes highest-version vulnerability fixes, and never
automerge without project gates.

Dependency selection requires canonical maintenance, active releases, explicit
license/security posture, smallest required feature set, and continuity with the
house stack. Prefer latest canonical libraries over hand-rolled protocols; never
add a second framework, runtime, package manager, test runner, or component system.

Freshness gate:

1. Detect newer stable releases continuously.
2. Read primary release and migration notes.
3. Update exact tool pins, manifests, dated references, and lockfiles together.
4. Run the full compatibility/architecture/test/security matrix.
5. Merge promptly or record a visible failing blocker with upstream issue and
   revisit condition.

An old major cannot become quiet policy. Minimum release age protects against
fresh supply-chain compromise; vulnerability alerts use the highest fixed
version and bypass normal batching urgency.
