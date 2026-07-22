# tailrocks-skills

A cross-agent collection of Tailrocks engineering skills, packaged for Claude
Code, Codex, and Kimi Code and portable through the shared `SKILL.md` standard to Grok
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
| `tailrocks-remediate` | Derive the greenfield architecture that eliminates a proven defect class, then pursue the complete structural correction regardless of price, duration, effort, implementation size, or sunk cost. |
| `tailrocks-idea` | Capture a raw idea as a DRAFT roadmap item: content-derived slug, item template, index row. Capture only — no interviewing, no invention. |
| `tailrocks-brainstorm` | Shape a young roadmap item through a relentless interview: one question at a time with a recommended answer, decisions asked, facts looked up, every answer written into the item immediately. |
| `tailrocks-research` | Deep-research a specific question or a roadmap item into a reusable multi-page topic under `research/` — vetted sourced chapters, candidate directions with trade-offs, many-to-many links with roadmap items. |
| `tailrocks-record-decision` | Record one user decision on a roadmap item: validate against settled ground, date it with its reason, propagate through the item, reopen READY/PLANNED items and mark stale plans when intent changes. |
| `tailrocks-finalize` | The closing interview that earns READY: collect every screen and flow, resolve or classify every open question, pass the readiness checklist — the only skill that grants READY. |
| `tailrocks-plan` | Turn a READY roadmap item into `plans/<slug>/`: coverage ledger, gap research, OpenSpec-grammar spec, one cold-reviewed zero-context plan per work item (each written by its own subagent), and a copy-pasteable GOAL.md for the /goal command of Claude Code, Codex, or Grok. |
| `tailrocks-reconcile` | True up an executing implementation package with reality: re-verify DONE rows by re-running their done criteria, reset dead-session rows, drift-check TODO plans against HEAD, mark stale rows, and reconcile the roadmap item's status. |

More skills land in `skills/` over time; the layout and install flow below are
built to grow.

The Rust, Axum, TypeScript, TanStack, code-health, and remediation skills
form the engineering-policy family. The delivery family —
`tailrocks-idea`, `tailrocks-brainstorm`, `tailrocks-research`,
`tailrocks-record-decision`, `tailrocks-finalize`, `tailrocks-plan`, and
`tailrocks-reconcile` — is a roadmap-driven pipeline and does not define
stack policy:

```text
idea ──► brainstorm ──► finalize ──► plan ──► /goal executor ──► reconcile
 DRAFT     SHAPING    ▲   READY   ▲  PLANNED   IN EXECUTION → DONE
                      │           │
        research ◄────┘           └── record-decision
        (both usable at any stage; research/ topics are standing
        assets, many-to-many with items)
```

Roadmap items live in `roadmap/<slug>/README.md` with a status machine
(DRAFT → SHAPING → READY → PLANNED → IN EXECUTION → DONE, plus PARKED);
research topics live in `research/<topic>/` independent of items; plans live
in `plans/<slug>/` with a GOAL.md whose blocks paste directly into the
`/goal` command of Claude Code, Codex, or Grok. After execution,
`tailrocks-reconcile` re-earns every plan status with commands run now and
trues up the item — run it whenever a loop finishes, stalls, or the
repository moved on since planning.

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
Grok also reads Claude-compatible plugins and skills; Kimi Code supports the
native `.kimi-plugin/plugin.json` and additionally reads
`$KIMI_CODE_HOME/skills/`; Gemini additionally reads `.gemini/skills/`;
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
| Kimi Code | Native plugin, `.kimi-code/skills`, or `.agents/skills` | `/skill:<name>` | Yes, accepts `disable-model-invocation` |
| GitHub Copilot and VS Code | `.github/skills`, `.agents/skills`, or personal skills | `/<name>` | Yes, `disable-model-invocation` |
| Gemini CLI | `.gemini/skills` or `.agents/skills` | Skill activation with consent | No documented portable per-skill control |
| OpenCode | `.opencode/skills` or `.agents/skills` | Request the named skill | No documented per-skill control |
| Amp | `.agents/skills/` | Prompt Amp to use the named skill | Semantic explicit-intent guard only; current Amp has no manual skill command |


### Manual-only portability limit

Claude Code, Codex, Kimi Code, GitHub Copilot, and compatible Grok paths can honor client controls. Amp, OpenCode, Gemini CLI, and any client that ignores `disable-model-invocation` cannot provide identical hard enforcement. For those clients, explicitly request the skill by its frontmatter `name`; the description guard tells the model not to select it otherwise. Do not put `$name`, `/name`, or plugin namespaces in shared `SKILL.md` bodies.
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
├── .kimi-plugin/
│   └── plugin.json          # Kimi Code plugin manifest
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
│   ├── tailrocks-idea/          # raw idea → DRAFT roadmap item
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-brainstorm/    # shaping interview on a young item
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-research/      # question or item → reusable research topic
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-record-decision/      # record + propagate one decision
│   │   ├── SKILL.md
│   │   └── agents/
│   ├── tailrocks-finalize/ # closing interview → READY
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   ├── tailrocks-plan/          # READY item → plans + spec + GOAL.md
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── agents/
│   └── tailrocks-reconcile/     # execution truth-sync on plans + item
│       ├── SKILL.md
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
