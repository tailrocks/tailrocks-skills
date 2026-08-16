# Pull request conventions

Read by the tailrocks PR skills (`tailrocks-create-pr`, `tailrocks-refresh-pr`,
`tailrocks-merge-pr`). Every section is optional — delete what the defaults
already get right. Prose here binds the skill step the heading names.

## Base branch

PRs target `main`.

## Branching

Branches are `<type>/<short-kebab-summary>` where `<type>` is one of
`feat`, `fix`, `docs`, `chore`, `refactor`. Example: `fix/token-expiry-check`.

## Commits

Conventional Commits 1.0.0 subjects. Every commit carries DCO sign-off
(`git commit -s`). PR titles follow the same convention — squash writes them
into history.

## Body

Template: `.github/PULL_REQUEST_TEMPLATE.md` — the default the skills read
in every repository even without this section.
<!-- Or a generator; stdout is the body skeleton, stderr is a digest:
Generator: `cargo xtask pr body --base origin/main`
-->
Required sections: Summary, What ships, Verify locally.
Verify locally carries the exact commands a reviewer runs, selected by what
the diff touches.

## Checks

Before opening: `mise run lint` and `mise run test` must pass locally.
Before merging: every GitHub check green; no partial-green merges.

## Blast radius

High blast radius — explicit confirm before merge — when the diff touches:

- `.github/workflows/**`
- authentication or security surfaces
- release or versioning machinery

## Before merge

- Add a `CHANGELOG.md` entry under `<!-- next-header -->` when the change is
  user-visible.

## Merge

Squash-merge only. The squash title is the PR title and must end with the
`(#N)` PR number. Merge-commit body is a prose summary — no checklists.
Delete the branch after merge.
