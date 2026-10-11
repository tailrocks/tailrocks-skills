# tailrocks-rust-skills

One portable package with 15 skills. The skills cover strict Rust
engineering: project baselines, correctness, Axum HTTP services, public
GraphQL APIs, cross-service gRPC, and terminal UI design. Five skills are
model-selectable. Ten skills are user-only and need an explicit human
command.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-rust-best-practices`](skills/tailrocks-rust-best-practices/SKILL.md) | Write correct Rust behavior. |
| [`tailrocks-rust-review`](skills/tailrocks-rust-review/SKILL.md) | Review Rust read-only. User-only. |
| [`tailrocks-rust-refactor`](skills/tailrocks-rust-refactor/SKILL.md) | Restructure Rust safely. User-only. |
| [`tailrocks-rust-project-setup`](skills/tailrocks-rust-project-setup/SKILL.md) | Scaffold a strict workspace. User-only. |
| [`tailrocks-rust-project-audit`](skills/tailrocks-rust-project-audit/SKILL.md) | Audit a workspace read-only. User-only. |
| [`tailrocks-rust-project-remediate`](skills/tailrocks-rust-project-remediate/SKILL.md) | Fix approved gaps. User-only. |
| [`tailrocks-axum-best-practices`](skills/tailrocks-axum-best-practices/SKILL.md) | Build Axum HTTP adapters. |
| [`tailrocks-axum-review`](skills/tailrocks-axum-review/SKILL.md) | Review Axum read-only. User-only. |
| [`tailrocks-axum-refactor`](skills/tailrocks-axum-refactor/SKILL.md) | Restructure Axum safely. User-only. |
| [`tailrocks-graphql-best-practices`](skills/tailrocks-graphql-best-practices/SKILL.md) | Evolve the public GraphQL API. |
| [`tailrocks-graphql-review`](skills/tailrocks-graphql-review/SKILL.md) | Review GraphQL read-only. User-only. |
| [`tailrocks-grpc-best-practices`](skills/tailrocks-grpc-best-practices/SKILL.md) | Evolve cross-service gRPC. |
| [`tailrocks-grpc-review`](skills/tailrocks-grpc-review/SKILL.md) | Review gRPC read-only. User-only. |
| [`tailrocks-tui-design`](skills/tailrocks-tui-design/SKILL.md) | Design ratatui screens. |
| [`tailrocks-tui-design-audit`](skills/tailrocks-tui-design-audit/SKILL.md) | Audit terminal design read-only. User-only. |

Each skill body lives in its own directory. Read
`skills/tailrocks-rust-review/SKILL.md` for one complete example.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `tailrocks-rust-skills@tailrocks` wherever
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
claude plugin install tailrocks-rust-skills@tailrocks --scope user
```

Rust work needs the pinned toolchain plus the mise tools. GraphQL client
codegen needs Bun. Proto gates need Buf. See `docs/installation.md` for
the full requirements.

## Use

Select the owner for the requested work. To review a Rust module on
Claude Code (session):

```text
/tailrocks-rust-skills:tailrocks-rust-review src/parser.rs
```

The skill returns a report with findings and concrete evidence. The skill
is read-only. It never edits. See `docs/usage.md` for every owner, more
examples, and the ownership boundary.

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

- Claude Code: update with `claude plugin update
  tailrocks-rust-skills@tailrocks`, or refresh with `claude plugin
  marketplace update tailrocks`. Remove with `claude plugin
  uninstall tailrocks-rust-skills`.
- Codex: refresh with `codex plugin marketplace upgrade tailrocks`.
  Remove with `codex plugin remove tailrocks-rust-skills@tailrocks`.
- Muse: refresh with `muse plugins marketplace update tailrocks`,
  then use the remove plus install sequence. Remove with `muse plugins
  remove tailrocks-rust-skills@tailrocks`.
- Kimi session: no `update` subcommand exists. Remove with `/plugins
  remove tailrocks-rust-skills`, then run `/reload`.
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
