# tailrocks-contribution-skills

One portable package with five skills. The skills run the
contribution lifecycle for external projects: reconnaissance,
proposal, preparation, submission, and review response. All five
skills are user-only and need an explicit human command.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-contribute-recon`](skills/tailrocks-contribute-recon/SKILL.md) | Examine one project. User-only. |
| [`tailrocks-contribute-propose`](skills/tailrocks-contribute-propose/SKILL.md) | Draft one venue proposal. User-only. |
| [`tailrocks-contribute-prepare`](skills/tailrocks-contribute-prepare/SKILL.md) | Implement one proposal. User-only. |
| [`tailrocks-contribute-submit`](skills/tailrocks-contribute-submit/SKILL.md) | Publish one contribution. User-only. |
| [`tailrocks-contribute-respond`](skills/tailrocks-contribute-respond/SKILL.md) | Answer one review round. User-only. |

Each skill body lives in its own directory. Read
`skills/tailrocks-contribute-recon/SKILL.md` for one complete example.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `tailrocks-contribution-skills@tailrocks` wherever
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
claude plugin install tailrocks-contribution-skills@tailrocks --scope user
```

All contribution workflows need Git and `gh`. Fork and pull-request
work needs an authenticated `gh` session. Only GitHub.com is
supported.

## Use

Select the owner for the requested work. To examine one project on
Claude Code (session):

```text
/tailrocks-contribution-skills:tailrocks-contribute-recon OWNER/REPO
```

The skill returns a handoff with the contribution contract,
classifications, and one outcome: examined, blocked, or refused. The
skill is read-only. See `docs/usage.md` for every owner, more
examples, and the lifecycle boundary.

## Documentation

Read these guides:

- `docs/README.md` indexes the guides.
- `docs/installation.md` installs the package on eight agents.
- `docs/usage.md` shows how to select each skill.
- `docs/compatibility.md` records each route result.
- `docs/maintenance.md` lists checks, policy, and release steps.
- `docs/troubleshooting.md` fixes common failures.

## Update and remove

Refresh the marketplace. Then refresh the plugin. When the plugin is no longer
needed, remove it. Commands per agent:

- Claude Code: run `claude plugin update
  tailrocks-contribution-skills@tailrocks` or `claude plugin
  marketplace update tailrocks`. For removal, run `claude plugin
  uninstall tailrocks-contribution-skills`.
- Codex: run `codex plugin marketplace upgrade tailrocks`. For removal, run
  `codex plugin remove tailrocks-contribution-skills@tailrocks`.
- Muse: run `muse plugins marketplace update tailrocks`. Then run
  the remove-and-install sequence. For removal, run `muse plugins
  remove tailrocks-contribution-skills@tailrocks`.
- Kimi session: no `update` subcommand exists. For removal, run `/plugins
  remove tailrocks-contribution-skills`. Then run `/reload`.
- Amp, OpenCode, Antigravity, Grok: see
  `docs/installation.md` for the exact steps.

## Contribute

Open an issue or a pull request on GitHub. Write all new and changed prose in
ASD-STE100 Simplified Technical English, Issue 9 rules. Before the pull
request, run `alint check`, the strict-JSON check, and the frontmatter check.
See `docs/maintenance.md` for the full list. Never add evaluation content.

## License

Apache License, Version 2.0. See `LICENSE` for the full text.
