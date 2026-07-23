# tailrocks-skills

A cross-agent collection of Tailrocks engineering skills built on the portable
`SKILL.md` Agent Skills standard and packaged natively for **Claude Code,
Codex CLI, OpenCode, Grok Build, Kimi Code, the Antigravity CLI (Google
Gemini), and Amp** — one shared `skills/` tree, one manifest per client, no
duplicated listings.

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

One shared `skills/<name>/` source serves every agent; each agent gets exactly
**one** install channel so no skill is ever listed twice. The full verified
compatibility matrix, duplicate-avoidance rules, and the alternative
`~/.agents/skills/`-based profile live in [INSTALL.md](INSTALL.md).

| Agent | Install |
|---|---|
| Claude Code | `/plugin marketplace add tailrocks/tailrocks-skills` then `/plugin install tailrocks-skills@tailrocks-skills` |
| Codex CLI | `codex plugin marketplace add tailrocks/tailrocks-skills` then `codex plugin add tailrocks-skills` |
| OpenCode | copy `skills/*` to `~/.config/opencode/skills/` |
| Grok Build | nothing if Claude Code has the plugin (auto-ingested); else `grok plugin install tailrocks/tailrocks-skills --trust` |
| Kimi Code | `/plugins install https://github.com/tailrocks/tailrocks-skills` then `/plugins reload` |
| Antigravity CLI | `git clone … && agy plugin install ./tailrocks-skills` |
| Amp | `amp skill add tailrocks/tailrocks-skills --global` |

Pin to a release tag (`@vX.Y.Z`, `/tree/vX.Y.Z`, or a tagged clone) in
production.

Invoke skills explicitly:

```text
Claude Code   /tailrocks-skills:tailrocks-rust-best-practices review this crate
Codex CLI     $tailrocks-rust-best-practices  (type $ to pick, or /skills)
Grok Build    /tailrocks-rust-best-practices review this crate
Kimi Code     /skill:tailrocks-rust-best-practices review this crate
Antigravity   /tailrocks-rust-best-practices
OpenCode/Amp  ask for the skill by name ("use tailrocks-rust-best-practices …")
```

### Manual-only invocation policy

Claude Code, Grok Build, and Kimi Code honor `disable-model-invocation: true`;
Codex honors `policy.allow_implicit_invocation: false` in each skill's
`agents/openai.yaml`. OpenCode, Amp, and the Antigravity CLI do not read those
fields — there the guard sentence at the start of every `description` tells
the model to wait for an explicit request, and OpenCode users can hard-enforce
with `"permission": { "skill": { "tailrocks-*": "ask" } }`. Unknown
frontmatter fields are ignored by standards-based clients, so the shared
`SKILL.md` files stay portable: the contract is `name`, `description`,
relative bundled resources, and the agent-neutral Markdown body — never put
`$name`, `/name`, or plugin namespaces in a skill body.

### Local development

```sh
claude --plugin-dir .        # session-scoped Claude Code load
grok plugin validate .       # manifest + component check
bun run scripts/validate-skills.ts
```

## Repository layout

```text
tailrocks-skills/
├── .claude-plugin/
│   ├── plugin.json          # Claude Code plugin manifest
│   └── marketplace.json     # self-listing marketplace (Claude Code, Codex, Grok)
├── .codex-plugin/
│   └── plugin.json          # Codex plugin manifest ("skills": "./skills/")
├── .kimi-plugin/
│   └── plugin.json          # Kimi Code plugin manifest
├── plugin.json              # Antigravity CLI plugin manifest
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
├── scripts/
│   └── validate-skills.ts   # Bun-native structure and policy validation
├── AGENTS.md
├── CLAUDE.md
├── INSTALL.md               # verified cross-agent install + development guide
├── LICENSE
└── README.md
```

## Validation

```sh
bun run scripts/validate-skills.ts
```

## License

Apache-2.0
