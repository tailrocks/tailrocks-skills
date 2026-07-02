# tailrocks-skills

A cross-agent collection of Tailrocks engineering skills — packaged as one
Claude Code plugin and portable to Codex, Amp, OpenCode, and Kimi through the
shared `SKILL.md` standard.

The skills are source-neutral and strict by default: they encode the modern Rust
posture Tailrocks builds on (edition 2024, strict workspace lints, pinned
toolchains, mise, and supply-chain gates) rather than a lowest-common-denominator
default.

## Skills

| Skill | Description |
|---|---|
| `rust-best-practices` | Write, review, and refactor Rust code: ownership, API design, errors, tests, docs, and readability. |
| `rust-project-setup` | Scaffold and enforce a strict, modern Rust project: workspace layout, `crates/` separation, workspace lint and Clippy tables, rustfmt, `rust-toolchain.toml`, mise, and cargo-deny/audit/shear/hack/nextest gates. |
| `propose` | Turn a rough idea into an enriched, evidence-backed proposal. Parallel analysis gathers prior art, codebase touchpoints, constraints, risks, and alternatives into a per-idea folder of findings. Read-only. |
| `research` | Take a confirmed proposal direction, run deep sourced research, and write incredibly detailed, self-contained handoff plans a zero-context executor can follow — in the same per-idea folder. |

More skills land in `skills/` over time; the layout and install flow below are
built to grow.

## Installation

`SKILL.md` is a portable standard — one `skills/<name>/` source serves every
agent; only the install path differs.

### Claude Code

```text
/plugin marketplace add tailrocks/tailrocks-marketplace
/plugin install tailrocks-skills@tailrocks-marketplace
```

Then invoke a namespaced skill:

```text
/tailrocks-skills:rust-best-practices review this crate
/tailrocks-skills:rust-project-setup set up a strict workspace here
```

### Codex, Amp, OpenCode, Kimi

All four read `~/.agents/skills/`. Install the tree there once with the
[`skills`](https://www.npmjs.com/package/skills) CLI (per agent, since agent CLIs
are not auto-detected in every environment):

```sh
npx -y skills add "tailrocks/tailrocks-skills" -s '*' -a codex --global --yes
npx -y skills add "tailrocks/tailrocks-skills" -s '*' -a amp   --global --yes
```

`--global` writes the canonical `~/.agents/skills/<skill>/` tree, which OpenCode
and Kimi read from the same path. Codex additionally reads
`.codex-plugin/plugin.json` (the `/plugins` flow). Pin to a release tag in
production (`tailrocks/tailrocks-skills#vX.Y.Z`). See
[.codex/INSTALL.md](.codex/INSTALL.md) for symlink and copy alternatives.

### Local development

```sh
claude --plugin-dir .
```

## Repository layout

```text
tailrocks-skills/
├── .claude-plugin/
│   └── plugin.json          # Claude Code plugin manifest
├── .codex-plugin/
│   └── plugin.json          # Codex plugin manifest ("skills": "./skills/")
├── skills/
│   ├── rust-best-practices/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── rust-project-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── templates/       # copy-ready Cargo.toml, clippy.toml, mise.toml, …
│   │   └── agents/
│   ├── propose/             # idea → enriched, evidence-backed proposal
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   └── research/            # confirmed direction → deep research + handoff plans
│       ├── SKILL.md
│       ├── references/
│       └── agents/
├── .codex/
│   └── INSTALL.md
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
└── README.md
```

## License

Apache-2.0
