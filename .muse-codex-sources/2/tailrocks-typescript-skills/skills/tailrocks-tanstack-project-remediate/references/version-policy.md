# Package Version Policy

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Sources of truth

[the canonical setup package template](../../tailrocks-tanstack-project-setup/assets/package.json)
is the only exact package-pin source for this family.
It owns the Bun package-manager pin and every direct dependency pin that a
scaffold receives. Do not copy those versions into prose or another ledger.

The canonical setup package template is also the only exact tool-pin source.
Its `packageManager` field selects the Bun release. Its `oxfmt` dependency pin
selects the formatter release. Keep repository tool configuration synchronized
with these two pins. Do not copy tool versions into prose or another ledger.

## Primary release sources

| Component | Primary source |
| --- | --- |
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
  existing CI records. Compare them with separately retrieved official release,
  migration, peer-contract, and security evidence. Never run the resolver,
  `bun outdated`, installs, writes, or repository gates from this reference. If
  exact current evidence is unavailable under the audit's trust and network
  boundary, report `BLOCKED`. Never infer freshness.
- **Authorized setup, migration, or remediation:** run the resolver
  from the setup skill directory:

  ```sh
  cd skills/tailrocks-tanstack-project-setup
  bun scripts/resolve-package-versions.ts --check-template assets/package.json
  ```

  Require zero registry errors and zero stale direct pins. Read migration/release
  notes for every major and TanStack rapid-minor transition. Only the canonical
  setup owner may update its package template and its tool pins. Existing-app
  owners update only approved application paths. Run the authority owner's
  complete affected gate set.

Every owner stops and reports exact peer or framework conflicts instead of
downgrading.

Security updates target the highest fixed version. No update auto-merges
without the complete compatibility gate.
