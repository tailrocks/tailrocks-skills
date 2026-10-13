# Repository skills guides

This package holds seven skills. The skills coordinate repository work
and run the pull-request lifecycle: template, create, refresh, review,
and guarded merge.

Five skills are model-selectable. Two skills are user-only and need an
explicit human command:

- `tailrocks-repository-recover` finds and preserves local work.
- `tailrocks-repository-merge` integrates selected work into one exact
  target.

## Guides

- `installation.md` installs the package on eight coding agents.
- `usage.md` shows how to select each skill and what each skill
  returns.
- `compatibility.md` records the test result of each client route.
- `maintenance.md` lists the checks, the policy version, and the
  release procedure.
- `troubleshooting.md` fixes common install and selection failures.

## Skills

| Skill | Task |
| --- | --- |
| `tailrocks-repository-recover` | Preserve local work. User-only. |
| `tailrocks-repository-merge` | Integrate sources into one target. User-only. |
| `tailrocks-create-pr` | Open one pull request. |
| `tailrocks-refresh-pr` | Reconcile title and body. |
| `tailrocks-review-pr` | Review and report. Read-only. |
| `tailrocks-merge-pr` | Land under the guarded policy. |
| `tailrocks-pr-template` | Manage the PR template. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-review-pr/SKILL.md` for one complete example.

## Requirements

All repository workflows need Git and `gh`. Hosted pull-request
creation, refresh, review, and landing need an authenticated `gh`
session with access to the target repository. Only GitHub.com is
supported. GitHub Enterprise is unsupported. Read-only audits can run
without authentication.
