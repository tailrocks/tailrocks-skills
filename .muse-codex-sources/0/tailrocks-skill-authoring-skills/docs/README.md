# Skill authoring guides

This package holds four skills. The skills create, audit, update,
and refactor agent skills. Each skill keeps clear ownership, clear
contracts, and clear routing.

All four skills are manual-only and need an explicit human command:

- `tailrocks-skill-audit` audits one skill or the portfolio. It is
  read-only.
- `tailrocks-skill-create` makes a new skill for a new
  responsibility.
- `tailrocks-skill-update` fixes a skill in place. The public
  contract stays unchanged.
- `tailrocks-skill-refactor` splits, merges, or renames skills. The
  behavior stays preserved.

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
| `tailrocks-skill-audit` | Audit one skill or the portfolio. Read-only. |
| `tailrocks-skill-create` | Make a new skill for a new responsibility. |
| `tailrocks-skill-update` | Fix a skill in place. Contract unchanged. |
| `tailrocks-skill-refactor` | Split, merge, rename. Behavior preserved. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-skill-audit/SKILL.md` for one complete example.

## Requirements

Skill-authoring work needs a shell, a text editor, and Git. The
work needs no hosted service. Before install, vet the package: read
`plugin.json`, the host manifests, and the four files under
`skills/`.
