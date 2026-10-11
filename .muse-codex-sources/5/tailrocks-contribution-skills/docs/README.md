# Contribution skills guides

This package holds five skills. The skills run the contribution
lifecycle for external projects: reconnaissance, proposal,
preparation, submission, and review response.

All five skills are user-only and need an explicit human command:

- `tailrocks-contribute-recon` examines one project and records its
  contribution contract.
- `tailrocks-contribute-propose` drafts one venue proposal from
  current reconnaissance.
- `tailrocks-contribute-prepare` implements one authorized proposal in
  a dedicated fork clone.
- `tailrocks-contribute-submit` publishes one prepared contribution.
- `tailrocks-contribute-respond` advances one submitted contribution
  through one review round.

## Guides

Read these guides:

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
| `tailrocks-contribute-recon` | Examine one project. User-only. |
| `tailrocks-contribute-propose` | Draft one venue proposal. User-only. |
| `tailrocks-contribute-prepare` | Implement one proposal. User-only. |
| `tailrocks-contribute-submit` | Publish one contribution. User-only. |
| `tailrocks-contribute-respond` | Answer one review round. User-only. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-contribute-recon/SKILL.md` for one complete example.

## Requirements

All contribution workflows need Git and `gh`. Fork and pull-request
creation, submission, and review responses need an authenticated `gh`
session with access to the fork and the target project. Only
GitHub.com is supported. GitHub Enterprise is unsupported. Read-only
reconnaissance can run without authentication.
