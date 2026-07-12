# tailrocks-skills

A cross-agent collection of Tailrocks engineering skills — packaged as one
Claude Code plugin and portable to Codex, Amp, OpenCode, and Kimi through the
shared `SKILL.md` standard.

The skills are source-neutral and encode one Tailrocks house stack: Rust 2024
with Axum/Tokio/Tower, and TypeScript 7 with Bun, TanStack Start, React,
shadcn/ui, Tailwind CSS v4, and Oxc. Alternative frameworks, package managers,
and component systems are outside scope.

## Skills

| Skill | Description |
|---|---|
| `tailrocks-rust-best-practices` | Write, review, and refactor Rust code: ownership, API design, errors, tests, docs, and readability. |
| `tailrocks-rust-project-setup` | Scaffold and enforce a strict, modern Rust project: workspace layout, `crates/` separation, workspace lint and Clippy tables, rustfmt, `rust-toolchain.toml`, mise, and cargo-deny/audit/shear/hack/nextest gates. |
| `tailrocks-axum-best-practices` | Build and review production Axum services: typed HTTP boundaries, Tower middleware, security, tracing, graceful shutdown, and tests. |
| `tailrocks-typescript-best-practices` | Write, review, and refactor strict Rust-inspired TypeScript 7 and React code using Bun-owned tooling. |
| `tailrocks-tanstack-project-setup` | Scaffold, migrate, and audit Bun-only TanStack Start projects with TypeScript 7, Oxc, Router, Query, shadcn/ui, Tailwind CSS v4, tests, and CI. |
| `tailrocks-code-health` | Establish measurable cross-stack health contracts: architecture gates, shrink-only ratchets, flake quarantine, defect-to-gate learning, verification lanes, and latest-version enforcement. |
| `tailrocks-propose` | Turn a rough idea into an enriched, evidence-backed proposal. Parallel analysis gathers prior art, codebase touchpoints, constraints, risks, and alternatives into a per-idea folder of findings. Read-only. |
| `tailrocks-research` | Take a confirmed proposal direction, run deep sourced research, and write incredibly detailed, self-contained handoff plans a zero-context executor can follow — in the same per-idea folder. |

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
/tailrocks-skills:tailrocks-rust-best-practices review this crate
/tailrocks-skills:tailrocks-rust-project-setup set up a strict workspace here
/tailrocks-skills:tailrocks-axum-best-practices review this Axum service
/tailrocks-skills:tailrocks-typescript-best-practices review this TypeScript module
/tailrocks-skills:tailrocks-tanstack-project-setup set up a strict Start app here
/tailrocks-skills:tailrocks-code-health establish code-health ratchets and gates
```

### Codex, Amp, OpenCode, Kimi

All four read `~/.agents/skills/`. Install the tree there once with the
[`skills`](https://www.npmjs.com/package/skills) CLI through Bun (per agent, since agent CLIs
are not auto-detected in every environment):

```sh
bunx --bun skills add "tailrocks/tailrocks-skills" -s '*' -a codex --global --yes
bunx --bun skills add "tailrocks/tailrocks-skills" -s '*' -a amp   --global --yes
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
│   ├── tailrocks-rust-best-practices/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-rust-project-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── templates/       # copy-ready Cargo.toml, clippy.toml, mise.toml, …
│   │   └── agents/
│   ├── tailrocks-axum-best-practices/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-typescript-best-practices/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-tanstack-project-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── templates/
│   │   └── agents/
│   ├── tailrocks-code-health/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── templates/
│   │   └── agents/
│   ├── tailrocks-propose/   # idea → enriched, evidence-backed proposal
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   └── tailrocks-research/  # confirmed direction → deep research + handoff plans
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
