# Current Bun and TanStack Stack Versions

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Verified 2026-08-21

| Component | Current stable | Primary source |
|---|---:|---|
| Bun | 1.4.0 | <https://bun.sh/blog> |
| TypeScript | 7.0.2 | <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/> |
| React / React DOM | 19.2.8 | <https://react.dev/versions> |
| Vite | 8.2.2 | <https://vite.dev/releases> |
| TanStack Start | 1.168.48 | <https://tanstack.com/start/latest> |
| TanStack Router | 1.170.31 | <https://tanstack.com/router/latest> |
| TanStack Router Devtools | 1.167.1 | <https://registry.npmjs.org/@tanstack/react-router-devtools/latest> |
| TanStack Query / Devtools | 5.101.4 | <https://tanstack.com/query/latest> |
| Tailwind CSS / Vite plugin | 4.3.3 | <https://tailwindcss.com/blog> |
| shadcn CLI | 4.18.0 | <https://ui.shadcn.com/docs/changelog> |
| Oxlint | 1.79.0 | <https://oxc.rs/releases> |
| Oxfmt | 0.64.0 | <https://oxc.rs/releases> |
| Dependency Cruiser | 18.2.0 | <https://github.com/sverweij/dependency-cruiser/releases> |
| Knip | 6.32.2 | <https://github.com/webpro-nl/knip/releases> |

Package versions are independent. Never force equal version numbers across
packages. Router Devtools `1.167.1` is its latest stable release and declares
Router `^1.170.0` as its peer contract, so it intentionally pairs with Router
`1.170.31`. Latest-per-package plus satisfied peer contracts is the invariant.

## Freshness gate

Before scaffolding or auditing:

1. Run
   `bun scripts/resolve-package-versions.ts --check-template templates/package.json`.
   It must report zero registry errors and zero stale direct pins. In an
   existing application, also run `bun outdated`.
2. Read migration/release notes for every major and TanStack pre-1/rapid minor
   transition.
3. Update `packageManager`, exact dependencies, this table, templates, and
   `bun.lock` together.
4. Run format, TS7, Oxc, architecture, Knip, Bun tests, and production build.
5. Stop and report exact peer/framework conflicts instead of downgrading.

Renovate detects updates continuously. Security updates target the highest fixed
version. No update auto-merges without the complete compatibility gate.
