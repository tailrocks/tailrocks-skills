# asd-ste100-skill

One private package with one skill. The skill writes, rewrites,
checks, and explains technical English. It uses Practical clarity
by default. It uses Strict ASD-STE100 Issue 9 only on explicit
request.

This repository is private. It bundles reference material that
derives from an authorized ASD-STE100 Issue 9 copy. Keep the
package private and use authenticated access. See
`THIRD-PARTY-NOTICES.md` for trademarks and attributions.

## Skills

| Skill | Task |
| --- | --- |
| [`asd-ste100`](skills/asd-ste100/SKILL.md) | Write clear technical English. |

The skill body lives in its own directory. Read
[`skills/asd-ste100/SKILL.md`](skills/asd-ste100/SKILL.md) for the
complete procedure.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `asd-ste100-skill@tailrocks` wherever the client
accepts it. Each row links its full section in
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
claude plugin install asd-ste100-skill@tailrocks --scope user
```

All installs need authenticated access to the private repository.
A local package route exists for every agent. See
`docs/installation.md` for the exact steps.

## Use

Select the skill for the requested writing work. To rewrite a
procedure on Claude Code (session):

```text
/asd-ste100-skill:asd-ste100 Rewrite this server upgrade procedure.
```

The skill returns clear text in the requested profile. Practical
clarity is the default. Strict Issue 9 applies only on explicit
request. See `docs/usage.md` for profiles, actions, and more
examples.

## Documentation

- `docs/README.md` indexes the guides.
- `docs/installation.md` installs the package on eight agents.
- `docs/usage.md` shows profiles, actions, and examples.
- `docs/compatibility.md` records each route result.
- `docs/maintenance.md` lists checks, policy, and release steps.
- `docs/troubleshooting.md` fixes common failures.

## Update and remove

Refresh the marketplace, then the plugin. Remove the plugin when it
is no longer needed. Commands per agent:

- Claude Code: `claude plugin update
  asd-ste100-skill@tailrocks` or `claude plugin
  marketplace update tailrocks`. Remove with `claude plugin
  uninstall asd-ste100-skill`.
- Codex: `codex plugin marketplace upgrade tailrocks`. Remove with
  `codex plugin remove asd-ste100-skill@tailrocks`.
- Muse: `muse plugins marketplace update tailrocks`, then the
  remove plus install sequence. Remove with `muse plugins remove
  asd-ste100-skill@tailrocks`.
- Kimi session: no `update` subcommand. Remove with `/plugins
  remove asd-ste100-skill`, then `/reload`.
- Amp, OpenCode, Antigravity, Grok: see
  `docs/installation.md` for the exact steps.

## Contribute

Open an issue or a pull request on GitHub. Write all new and changed
prose in ASD-STE100 Simplified Technical English, Issue 9 rules. Run
`alint check`, the strict-JSON check, and the frontmatter check
before the pull request. See `docs/maintenance.md` for the full
list. Never add evaluation content.

## License

Apache License, Version 2.0. See `LICENSE` for the full text. See
`THIRD-PARTY-NOTICES.md` for trademarks and donor attributions.
