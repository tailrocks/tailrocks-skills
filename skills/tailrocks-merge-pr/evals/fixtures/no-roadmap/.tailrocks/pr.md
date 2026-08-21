# Pull request conventions

## Blast radius

High blast radius — explicit confirm before merge — when the diff touches:

- `.github/workflows/**`
- `src/billing/**`

## Before merge

- Add a `CHANGELOG.md` entry under `<!-- next-header -->` when the change is
  user-visible.

## Merge

Squash-merge only. The squash title is the PR title and must end with the
`(#N)` PR number. Delete the branch after merge.
