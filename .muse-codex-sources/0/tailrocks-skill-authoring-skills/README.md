# tailrocks-skill-authoring-skills

One portable package with four skills. The skills create, audit,
update, and refactor agent skills. Each skill keeps clear ownership,
clear contracts, and clear routing. All four skills are manual-only
and need an explicit human command.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-skill-audit`](skills/tailrocks-skill-audit/SKILL.md) | Audit one skill or the portfolio. Read-only. |
| [`tailrocks-skill-create`](skills/tailrocks-skill-create/SKILL.md) | Make a new skill for a new responsibility. |
| [`tailrocks-skill-update`](skills/tailrocks-skill-update/SKILL.md) | Fix a skill in place. Contract unchanged. |
| [`tailrocks-skill-refactor`](skills/tailrocks-skill-refactor/SKILL.md) | Split, merge, rename. Behavior preserved. |

Each skill body lives in its own directory. Read
[`skills/tailrocks-skill-audit/SKILL.md`](skills/tailrocks-skill-audit/SKILL.md)
for one complete example.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `tailrocks-skill-authoring-skills@tailrocks` wherever
the client accepts it. Each row links its full section in
`docs/installation.md`.

| Agent | Method |
| --- | --- |
| Claude Code | [Marketplace install](docs/installation.md#claude-code) |
| Codex | [Marketplace add](docs/installation.md#codex) |
| Amp | [Container add](docs/installation.md#amp) |
| Muse Code | [Marketplace install](docs/installation.md#muse-code) |
| OpenCode | [Skill-directory copy](docs/installation.md#opencode) |
| Antigravity | [Local-path install](docs/installation.md#antigravity) |
| Grok Build | [Marketplace install](docs/installation.md#grok-build) |
| Kimi Code | [In-session manager](docs/installation.md#kimi-code) |

Quick start on Claude Code (shell):

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-skill-authoring-skills@tailrocks --scope user
```

Before install, vet the package. Read `plugin.json`, the host
manifests, and the four files under `skills/`. This package ships
skills, references, and one authoring template. It adds no hooks and
no MCP servers.

## Use

Select the owner for the requested work. To audit one skill on
Claude Code (session):

```text
/tailrocks-skill-authoring-skills:tailrocks-skill-audit tailrocks-review-pr
```

The skill returns a report with findings, evidence, and named fixes.
The skill is read-only. It never edits the audited skill. See
`docs/usage.md` for every owner, more examples, and the lifecycle
boundary.

## Documentation

- `docs/README.md` indexes the guides.
- `docs/installation.md` installs the package on eight agents.
- `docs/usage.md` shows how to select each skill.
- `docs/compatibility.md` records each route result.
- `docs/maintenance.md` lists checks, policy, and release steps.
- `docs/troubleshooting.md` fixes common failures.

## Update and remove

Refresh the marketplace. Then refresh the plugin. When it is no
longer needed, remove the plugin. Commands per agent:

- On Claude Code, run `claude plugin update
  tailrocks-skill-authoring-skills@tailrocks` or `claude plugin
  marketplace update tailrocks`. Remove with `claude plugin
  uninstall tailrocks-skill-authoring-skills`.
- On Codex, run `codex plugin marketplace upgrade tailrocks`.
  Remove with `codex plugin remove
  tailrocks-skill-authoring-skills@tailrocks`.
- On Muse, run `muse plugins marketplace update tailrocks`, then
  the remove plus install sequence. Remove with `muse plugins
  remove tailrocks-skill-authoring-skills@tailrocks`.
- A Kimi session has no `update` subcommand. Remove with `/plugins
  remove tailrocks-skill-authoring-skills`. Then run `/reload`.
- Amp, OpenCode, Antigravity, Grok: see
  `docs/installation.md` for the exact steps.

## Contribute

Open an issue or a pull request on GitHub. Write all new and changed
prose in ASD-STE100 Simplified Technical English, Issue 9 rules. Before
the pull request, run `alint check`, the strict-JSON check, and the
frontmatter check. See `docs/maintenance.md` for the full
list. Never add evaluation content.

## License

Apache License, Version 2.0. See `LICENSE` for the full text.
