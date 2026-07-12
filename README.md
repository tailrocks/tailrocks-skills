# tailrocks-skills

A cross-agent collection of Tailrocks engineering skills, packaged for Claude
Code and Codex and portable through the shared `SKILL.md` standard to Grok
Build, Kimi Code, OpenCode, Gemini CLI, GitHub Copilot, VS Code, Amp, and other
Agent Skills clients.

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
| `tailrocks-code-health` | Establish, audit, or tighten one measurable shrink-only debt ratchet using architecture, lint, dependency, flake, defect, documentation, or verification providers. |
| `tailrocks-propose` | Turn a rough idea into an enriched, evidence-backed proposal. Parallel analysis gathers prior art, codebase touchpoints, constraints, risks, and alternatives into a per-idea folder of findings. Read-only. |
| `tailrocks-research` | Take a substantial confirmed proposal direction, resolve material uncertainty, and write sufficient self-contained handoff plans a zero-context executor can follow. |

More skills land in `skills/` over time; the layout and install flow below are
built to grow.

The Rust, Axum, TypeScript, TanStack, and code-health skills form the stack-policy
family. `tailrocks-propose` and `tailrocks-research` form a separate delivery
workflow family; they do not define stack policy.

## Installation

`SKILL.md` is a portable standard; one `skills/<name>/` source serves every
agent. Invocation policy is client-specific. Claude Code is manual-only through
`disable-model-invocation: true`; Codex is manual-only through
`agents/openai.yaml`. Amp, OpenCode, and Kimi support explicit invocation but do
not all expose an equivalent portable per-skill auto-disable, so they may still
offer a skill to the model automatically.

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

### Shared Agent Skills install

Codex, Grok Build, Kimi Code, OpenCode, Gemini CLI, GitHub Copilot, VS Code,
and Amp discover the portable tree from `~/.agents/skills/` or their native
alias. Install with the [`skills`](https://www.npmjs.com/package/skills) CLI
through Bun, selecting the target agents presented by the installer:

```sh
bunx --bun skills add "tailrocks/tailrocks-skills" -s '*' --global
```

For deterministic manual installation, copy `skills/*` to
`~/.agents/skills/`. Codex additionally reads `.codex-plugin/plugin.json`;
Grok also reads Claude-compatible plugins and skills; Kimi Code additionally
reads `$KIMI_CODE_HOME/skills/`; Gemini additionally reads `.gemini/skills/`;
Copilot additionally reads `~/.copilot/skills/` and `.github/skills/`.

Pin the repository to a release tag in production. See
[.codex/INSTALL.md](.codex/INSTALL.md) for the complete compatibility and
invocation-policy matrix.

### Invocation policy by client

| Client | Discovery | Explicit invocation | Automatic invocation disabled |
|---|---|---|---|
| Claude Code | Plugin or `.claude/skills` | `/tailrocks-skills:<name>` | Yes, `disable-model-invocation` |
| Codex | Plugin or `.agents/skills` | `$<name>` | Yes, `agents/openai.yaml` policy |
| Grok Build | Claude-compatible plugin, `.grok/skills`, or `.agents/skills` | `/<name>` | Through its documented Claude-compatible skill surface |
| Kimi Code | `.kimi-code/skills` or `.agents/skills` | `/skill:<name>` | Yes, accepts `disable-model-invocation` |
| GitHub Copilot and VS Code | `.github/skills`, `.agents/skills`, or personal skills | `/<name>` | Yes, `disable-model-invocation` |
| Gemini CLI | `.gemini/skills` or `.agents/skills` | Skill activation with consent | No documented portable per-skill control |
| OpenCode | `.opencode/skills` or `.agents/skills` | Request the named skill | No documented per-skill control |
| Amp | `.agents/skills` | `skill: invoke` | No documented per-skill control |

Unknown extension fields are ignored by standards-based clients. The portable
contract remains `name`, `description`, relative bundled resources, and the
agent-neutral Markdown body.

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
├── scripts/
│   └── validate-skills.ts   # Bun-native structure and policy validation
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
└── README.md
```

## Validation

```sh
bun run scripts/validate-skills.ts
```

## License

Apache-2.0
