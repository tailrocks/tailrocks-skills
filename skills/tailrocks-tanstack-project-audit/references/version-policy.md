# Package Version Policy

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Sources of truth

[the canonical setup package template](../../tailrocks-tanstack-project-setup/templates/package.json)
is the only exact package-pin source for this family.
It owns the Bun package-manager pin and every direct dependency pin that a
scaffold receives. Do not copy those versions into prose or another ledger.

The repository's `mise.toml` owns its tool pins. Bun and Oxfmt are shared with
the template, so their values stay mechanically synchronized with the canonical
setup package template; `mise.lock` records the selected tool versions and
is regenerated with the lock command rather than edited by hand.

## Primary release sources

| Component | Primary source |
|---|---|
| Bun | <https://bun.sh/blog> |
| TypeScript | <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/> |
| React / React DOM | <https://react.dev/versions> |
| Vite | <https://vite.dev/releases> |
| TanStack Start | <https://tanstack.com/start/latest> |
| TanStack Router | <https://tanstack.com/router/latest> |
| TanStack Router Devtools | <https://registry.npmjs.org/@tanstack/react-router-devtools/latest> |
| TanStack Query / Devtools | <https://tanstack.com/query/latest> |
| Tailwind CSS / Vite plugin | <https://tailwindcss.com/blog> |
| shadcn CLI | <https://ui.shadcn.com/docs/changelog> |
| Oxlint / Oxfmt | <https://oxc.rs/releases> |
| Dependency Cruiser | <https://github.com/sverweij/dependency-cruiser/releases> |
| Knip | <https://github.com/webpro-nl/knip/releases> |

Package versions are independent. Never force equal version numbers across
packages. The invariant is latest stable per package plus satisfied peer
contracts.

## Freshness gate

Authority decides the evidence path:

- **Read-only audit:** inspect committed manifests, lockfiles, configuration, and
  existing CI receipts. Compare them with separately retrieved official release,
  migration, peer-contract, and security evidence. Never run the resolver,
  `bun outdated`, installs, writes, or repository gates from this reference. If
  exact current evidence is unavailable under the audit's trust and network
  boundary, report `BLOCKED`; never infer freshness.
- **Authorized setup, migration, or remediation:** run
  `bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts --check-template skills/tailrocks-tanstack-project-setup/templates/package.json`.
  Require zero registry errors and zero stale direct pins. Read migration/release
  notes for every major and TanStack rapid-minor transition. Only the canonical
  setup owner may update its package template and synchronize shared Bun/Oxfmt
  pins in `mise.toml` and `mise.lock`; existing-app owners update only approved
  application paths. Run the authority owner's complete affected gate set.

Every owner stops and reports exact peer or framework conflicts instead of
downgrading.

Renovate detects updates continuously. Security updates target the highest fixed
version. No update auto-merges without the complete compatibility gate.
