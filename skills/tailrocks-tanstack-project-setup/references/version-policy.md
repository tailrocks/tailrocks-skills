# Package Version Policy

Latest means the latest stable release and latest stable major available at the
time of work. Prereleases and repository branches are not stable releases. An
incompatible latest set is a blocker to report, not permission to retain an old
major silently.

## Sources of truth

`templates/package.json` is the only exact package-pin source for this skill.
It owns the Bun package-manager pin and every direct dependency pin that a
scaffold receives. Do not copy those versions into prose or another ledger.

The repository's `mise.toml` owns its tool pins. Bun and Oxfmt are shared with
the template, so their values stay mechanically synchronized with
`templates/package.json`; `mise.lock` records the selected tool versions and
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

Before scaffolding or auditing:

1. Run
   `bun scripts/resolve-package-versions.ts --check-template templates/package.json`.
   It must report zero registry errors and zero stale direct pins. In an
   existing application, also run `bun outdated`.
2. Read migration and release notes for every major and TanStack rapid-minor
   transition.
3. Update the exact pins only in `templates/package.json`; synchronize the
   shared Bun and Oxfmt values in `mise.toml`, then regenerate `mise.lock`.
4. Run format, TypeScript, Oxc, architecture, Knip, Bun tests, and production
   build.
5. Stop and report exact peer or framework conflicts instead of downgrading.

Renovate detects updates continuously. Security updates target the highest fixed
version. No update auto-merges without the complete compatibility gate.
