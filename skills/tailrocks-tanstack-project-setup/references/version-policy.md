# Current Bun and TanStack Stack Versions

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Verified 2026-07-23

| Component | Current stable | Primary source |
|---|---:|---|
| Bun | 1.3.14 | <https://bun.sh/blog> |
| TypeScript | 7.0.2 | <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/> |
| React / React DOM | 19.2.8 | <https://react.dev/versions> |
| Vite | 8.1.5 | <https://vite.dev/releases> |
| TanStack Start | 1.168.32 | <https://tanstack.com/start/latest> |
| TanStack Router | 1.170.18 | <https://tanstack.com/router/latest> |
| TanStack Router Devtools | 1.167.0 | <https://registry.npmjs.org/@tanstack/react-router-devtools/latest> |
| TanStack Query / Devtools | 5.101.4 | <https://tanstack.com/query/latest> |
| Tailwind CSS / Vite plugin | 4.3.3 | <https://tailwindcss.com/blog> |
| shadcn CLI | 4.14.1 | <https://ui.shadcn.com/docs/changelog> |
| Oxlint | 1.75.0 | <https://oxc.rs/releases> |
| Oxfmt | 0.60.0 | <https://oxc.rs/releases> |
| Dependency Cruiser | 18.1.0 | <https://github.com/sverweij/dependency-cruiser/releases> |
| Knip | 6.29.0 | <https://github.com/webpro-nl/knip/releases> |

Package versions are independent. Never force equal version numbers across
packages. Router Devtools `1.167.0` is its latest stable release and declares
Router `^1.170.0` as its peer contract, so it intentionally pairs with Router
`1.170.18`. Latest-per-package plus satisfied peer contracts is the invariant.

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
