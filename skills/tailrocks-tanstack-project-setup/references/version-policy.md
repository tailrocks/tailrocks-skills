# Current Bun and TanStack Stack Versions

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Verified 2026-07-12

| Component | Current stable | Primary source |
|---|---:|---|
| Bun | 1.3.14 | <https://bun.sh/blog> |
| TypeScript | 7.0.2 | <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/> |
| React / React DOM | 19.2.7 | <https://react.dev/versions> |
| Vite | 8.1.4 | <https://vite.dev/releases> |
| TanStack Start | 1.168.27 | <https://tanstack.com/start/latest> |
| TanStack Router | 1.170.17 | <https://tanstack.com/router/latest> |
| TanStack Query | 5.101.2 | <https://tanstack.com/query/latest> |
| Tailwind CSS / Vite plugin | 4.3.2 | <https://tailwindcss.com/blog> |
| shadcn CLI | 4.13.0 | <https://ui.shadcn.com/docs/changelog> |
| Oxlint | 1.73.0 | <https://oxc.rs/releases> |
| Oxfmt | 0.58.0 | <https://oxc.rs/releases> |
| Dependency Cruiser | 18.0.0 | <https://github.com/sverweij/dependency-cruiser/releases> |
| Knip | 6.26.0 | <https://github.com/webpro-nl/knip/releases> |

## Freshness gate

Before scaffolding or auditing:

1. Run `bun outdated` and query each package's current stable release.
2. Read migration/release notes for every major and TanStack pre-1/rapid minor
   transition.
3. Update `packageManager`, exact dependencies, this table, templates, and
   `bun.lock` together.
4. Run format, TS7, Oxc, architecture, Knip, Bun tests, and production build.
5. Stop and report exact peer/framework conflicts instead of downgrading.

Renovate detects updates continuously; the Bun minimum-release-age policy delays
newly published packages for review. Security updates target the highest fixed
version. No update auto-merges without the complete compatibility gate.
