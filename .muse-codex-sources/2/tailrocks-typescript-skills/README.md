# tailrocks-typescript-skills

One portable package with twelve skills. The skills write, review,
refactor, migrate, and audit TypeScript 7 and React code. They scaffold
and migrate TanStack Start applications on the Tailrocks baseline. They
also design web screens and verify them against frozen references. Two
skills are model-selectable. Ten skills are user-only and need an
explicit human command.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-tanstack-project-audit`](skills/tailrocks-tanstack-project-audit/SKILL.md) | Audit one app baseline. User-only. Read-only. |
| [`tailrocks-tanstack-project-migrate`](skills/tailrocks-tanstack-project-migrate/SKILL.md) | Migrate one app to the baseline. User-only. |
| [`tailrocks-tanstack-project-remediate`](skills/tailrocks-tanstack-project-remediate/SKILL.md) | Close approved baseline gaps. User-only. |
| [`tailrocks-tanstack-project-setup`](skills/tailrocks-tanstack-project-setup/SKILL.md) | Scaffold one new app. User-only. |
| [`tailrocks-typescript-best-practices`](skills/tailrocks-typescript-best-practices/SKILL.md) | Write strict TypeScript and React. |
| [`tailrocks-typescript-migrate`](skills/tailrocks-typescript-migrate/SKILL.md) | Migrate source contracts. User-only. |
| [`tailrocks-typescript-refactor`](skills/tailrocks-typescript-refactor/SKILL.md) | Restructure without behavior change. User-only. |
| [`tailrocks-typescript-review`](skills/tailrocks-typescript-review/SKILL.md) | Review and report. User-only. Read-only. |
| [`tailrocks-web-design`](skills/tailrocks-web-design/SKILL.md) | Design screens in the app. |
| [`tailrocks-web-design-audit`](skills/tailrocks-web-design-audit/SKILL.md) | Audit screens against the reference. User-only. Read-only. |
| [`tailrocks-web-visual-baseline`](skills/tailrocks-web-visual-baseline/SKILL.md) | Freeze screenshot baselines. User-only. |
| [`tailrocks-web-visual-regression`](skills/tailrocks-web-visual-regression/SKILL.md) | Compare screens with baselines. User-only. Read-only. |

Each skill body lives in its own directory. Read
`skills/tailrocks-typescript-review/SKILL.md` for one complete example.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `tailrocks-typescript-skills@tailrocks` wherever
the client accepts it. Each row links its full section in
`docs/installation.md`.

| Agent | Method |
| --- | --- |
| Claude Code | [Marketplace install](docs/installation.md#claude-code) |
| Codex | [Marketplace add](docs/installation.md#codex) |
| Amp | [Per-skill add](docs/installation.md#amp) |
| Muse Code | [Marketplace install](docs/installation.md#muse-code) |
| OpenCode | [Skill-directory copy](docs/installation.md#opencode) |
| Antigravity | [Local-path install](docs/installation.md#antigravity) |
| Grok Build | [Marketplace install](docs/installation.md#grok-build) |
| Kimi Code | [In-session manager](docs/installation.md#kimi-code) |

Quick start on Claude Code (shell):

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-typescript-skills@tailrocks --scope user
```

Project work needs Bun and Git. Visual skills need the pinned
Playwright browser. Directory-copy installs must copy the complete
package: the skills use helpers under `scripts/`. See
`docs/installation.md` for the exact requirement.

## Use

Select the owner for the requested work. To review one TypeScript
file on Claude Code (session):

```text
/tailrocks-typescript-skills:tailrocks-typescript-review src/auth/session.ts
```

The skill returns a report with findings, evidence, and narrow
corrections. The skill is read-only. See `docs/usage.md` for every
owner, more examples, and the family boundaries.

## Documentation

- `docs/README.md` indexes the guides.
- `docs/installation.md` installs the package on eight agents.
- `docs/usage.md` shows how to select each skill.
- `docs/compatibility.md` records each route result.
- `docs/maintenance.md` lists checks, policy, and release steps.
- `docs/troubleshooting.md` fixes common failures.

## Update and remove

Refresh the marketplace, then the plugin. Remove the plugin when it
is no longer needed. Commands per agent:

- Claude Code: `claude plugin update
  tailrocks-typescript-skills@tailrocks` or `claude plugin
  marketplace update tailrocks`. Remove with `claude plugin
  uninstall tailrocks-typescript-skills`.
- Codex: `codex plugin marketplace upgrade tailrocks`. Remove with
  `codex plugin remove tailrocks-typescript-skills@tailrocks`.
- Muse: `muse plugins marketplace update tailrocks`, then the
  remove plus install sequence. Remove with `muse plugins remove
  tailrocks-typescript-skills@tailrocks`.
- Kimi session: no `update` subcommand. Remove with `/plugins
  remove tailrocks-typescript-skills`, then `/reload`.
- Amp, OpenCode, Antigravity, Grok: see
  `docs/installation.md` for the exact steps.

## Contribute

Open an issue or a pull request on GitHub. Write all new and changed
prose in ASD-STE100 Simplified Technical English, Issue 9 rules. Run
`alint check`, the strict-JSON check, and the frontmatter check
before the pull request. See `docs/maintenance.md` for the full
list. Never add evaluation content.

## License

Apache License, Version 2.0. See `LICENSE` for the full text.
