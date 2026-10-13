# ASD-STE100 skill guides

This private package holds one skill. The skill writes, rewrites,
checks, and explains technical English. It uses Practical clarity
by default. It uses Strict ASD-STE100 Issue 9 only on explicit
request.

## Guides

- `installation.md` installs the package on eight coding agents.
- `usage.md` shows profiles, actions, and examples.
- `compatibility.md` records the test result of each client route.
- `maintenance.md` lists the checks, the policy version, and the
  release procedure.
- `troubleshooting.md` fixes common install and selection failures.

## Skills

| Skill | Task |
| --- | --- |
| `asd-ste100` | Write clear technical English. |

The skill body lives in its own directory under `skills/`. Read
`skills/asd-ste100/SKILL.md` for the complete procedure.

## Requirements

All installs need authenticated access to the private repository.
Use an authenticated `gh` session or an SSH key with read access.
The package ships skills and references only. It adds no hooks and
no MCP servers. No build step runs before use.
