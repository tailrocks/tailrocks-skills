# Pull request conventions

## Blast radius

High blast radius — explicit confirm before merge — when the diff touches:

- `.github/workflows/**`
- `src/auth/**`
- `migrations/**`

## Before merge

- Add a `CHANGELOG.md` entry under `<!-- next-header -->` when the change is
  user-visible.
- If the diff touches `docs/roadmap/`, move the item's row to the Completed
  table in `docs/roadmap/index.md`.

## Merge

Squash-merge only. The squash title is the PR title and must end with the
`(#N)` PR number. Merge-commit body is a prose summary — no checklists.
Delete the branch after merge.
