# tailrocks-skills

Reusable engineering skills for Claude Code, Codex CLI, OpenCode, Grok Build,
Kimi Code, Antigravity CLI, and Amp. Every client receives the same skills from
one shared `skills/` tree.

The collection is opinionated: Rust 2024, Axum/Tokio/Tower, TypeScript 7,
Bun, TanStack Start, React, shadcn/ui, Tailwind CSS v4, Oxc, and native macOS
with SwiftUI-first architecture, narrow capability-only AppKit bridges, and
Liquid Glass.

Documentation: **<https://skills.tailrocks.com>**

## Quick start

1. Install the collection through exactly one channel for your agent.
2. Explicitly name the skill in your request; skills are manual-only.
3. Give the skill a concrete target, mode, and desired outcome.

| Agent | Install |
|---|---|
| Claude Code | `/plugin marketplace add tailrocks/tailrocks-skills`, then `/plugin install tailrocks-skills@tailrocks-skills` |
| Codex CLI | `codex plugin marketplace add tailrocks/tailrocks-skills`, then `codex plugin add tailrocks-skills` |
| OpenCode | Copy `skills/*` into `~/.config/opencode/skills/` |
| Grok Build | Reuse the Claude plugin, or run `grok plugin install tailrocks/tailrocks-skills --trust` |
| Kimi Code | `/plugins install https://github.com/tailrocks/tailrocks-skills`, then `/plugins reload` |
| Antigravity CLI | Clone the repository, then run `agy plugin install ./tailrocks-skills` |
| Amp | Reuse the installed Claude Code plugin; otherwise `amp skill add tailrocks/tailrocks-skills --global` |

These install the latest release. In Claude Code, turn on auto-update for the
marketplace once (`/plugin` → **Marketplaces** → **Enable auto-update**) and it
stays current on its own; the other clients upgrade with one command. Pin a tag
instead when a build must be reproducible. See [INSTALL.md](INSTALL.md) for
per-client upgrade and pinning commands, duplicate prevention, and the verified
compatibility matrix.

## Invoke a skill

```text
Claude Code   /tailrocks-skills:tailrocks-rust-best-practices review this crate
Codex CLI     $tailrocks-rust-best-practices review this crate
Grok Build    /tailrocks-rust-best-practices review this crate
Kimi Code     /skill:tailrocks-rust-best-practices review this crate
Antigravity   /tailrocks-rust-best-practices review this crate
OpenCode/Amp  Use tailrocks-rust-best-practices to review this crate
```

A strong request names the skill, action, scope, and constraint:

```text
Use tailrocks-typescript-best-practices in review mode on src/auth/.
Focus on runtime validation, typed failure, and async ownership. Do not edit.
```

## Skills

Each row links to that skill's own README. Which skill to reach for when several
could apply — family sequences, ownership boundaries, and the delivery
pipeline — is covered in
[choosing a skill](https://skills.tailrocks.com/docs/choosing).

<!-- skills:start -->

### Rust and services

Repository mechanics, language-level policy, and the HTTP boundary.

| Skill | What it does |
|---|---|
| [`tailrocks-rust-project-setup`](skills/tailrocks-rust-project-setup/README.md) | Scaffold, audit, or remediate a latest-compatible strict Rust workspace baseline. |
| [`tailrocks-rust-best-practices`](skills/tailrocks-rust-best-practices/README.md) | Apply strict idiomatic Rust contracts when writing, reviewing, or refactoring Rust code. |
| [`tailrocks-axum-best-practices`](skills/tailrocks-axum-best-practices/README.md) | Apply production Axum HTTP-adapter practices when building, reviewing, or refactoring routers, handlers, extractors, Tower middleware, lifecycle, and transport tests. |

### TypeScript and TanStack

The Bun-only application baseline and strict TypeScript policy.

| Skill | What it does |
|---|---|
| [`tailrocks-tanstack-project-setup`](skills/tailrocks-tanstack-project-setup/README.md) | Scaffold, migrate, audit, or remediate the Tailrocks Bun/TanStack Start application baseline. |
| [`tailrocks-typescript-best-practices`](skills/tailrocks-typescript-best-practices/README.md) | Apply strict Rust-inspired TypeScript 7 contracts when writing, reviewing, refactoring, or migrating TypeScript: state, typed failure, runtime validation, readonly APIs, async ownership, tests. |

### Native macOS

Design to verified pixels; exactly one skill owns each responsibility.

| Skill | What it does |
|---|---|
| [`tailrocks-macos-design`](skills/tailrocks-macos-design/README.md) | Design a macOS feature to Apple quality before any production code: experience brief, information architecture, native component map, alternatives, density and typography, and a scored rubric. |
| [`tailrocks-sketch-handoff`](skills/tailrocks-sketch-handoff/README.md) | Turn a Sketch design into an implementable native macOS handoff: Sketch MCP wiring, Apple's macOS UI kit, token extraction, the symbol-to-SwiftUI design map, and approved frame exports. |
| [`tailrocks-liquid-glass`](skills/tailrocks-liquid-glass/README.md) | Apply, audit, or remediate Apple's Liquid Glass material in a native macOS SwiftUI or AppKit app: layer split, glass APIs and availability, scroll edge effects, tint policy, and the accessibility gate. |
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/README.md) | Write, review, or refactor Swift and SwiftUI for macOS: strict concurrency and actor isolation, state ownership and view identity, AppKit interop boundaries, typed failure, availability guards, accessibility, and tests. |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/README.md) | Scaffold, audit, or remediate a strict native macOS Swift baseline: project generation, deployment targets and SDK lanes, local signing, format and lint gates, test wiring, mise tooling, Xcode agent integration. |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/README.md) | Build, launch, capture, drive, and verify a native macOS app so an agent can see its own interface: window-ID capture, accessibility-tree driving, appearance and accessibility state matrix, audits, and pixel regression. |

### Code quality and contribution

Debt that shrinks, defects that stop recurring, and work on repositories you do not own.

| Skill | What it does |
|---|---|
| [`tailrocks-code-health`](skills/tailrocks-code-health/README.md) | Establish, audit, or tighten measurable shrink-only code-health ratchets for architecture, lint, dependency, flake, defect, documentation, or verification debt. |
| [`tailrocks-agents-md`](skills/tailrocks-agents-md/README.md) | Add, place, audit, or repair agent instruction files. |
| [`tailrocks-simplify`](skills/tailrocks-simplify/README.md) | Review a pull request or diff and remove code without changing behavior: dead paths, hand-rolled utilities the platform provides, indirection, needless branching. |
| [`tailrocks-remediate`](skills/tailrocks-remediate/README.md) | Analyze or remediate a proven defect through correctness-first architectural redesign. |
| [`tailrocks-rethink`](skills/tailrocks-rethink/README.md) | Re-derive the design behind a reported bug or friction instead of patching it; restructuring and breaking changes are expected and cost is excluded from the decision. |
| [`tailrocks-contribute`](skills/tailrocks-contribute/README.md) | Contribute to an external open-source project: discover its contribution contract, prepare a minimal evidenced change, and submit only after explicit human approval. |

### Roadmap and delivery

An idea through shaping, planning, autonomous execution, and back to verified truth.

| Skill | What it does |
|---|---|
| [`tailrocks-idea`](skills/tailrocks-idea/README.md) | Capture a raw product or feature idea as a new DRAFT roadmap item under roadmap/<slug>/ and register it in the index. |
| [`tailrocks-brainstorm`](skills/tailrocks-brainstorm/README.md) | Shape a DRAFT or SHAPING roadmap item through a one-question-at-a-time interview, writing every answer into the item as it resolves. |
| [`tailrocks-research`](skills/tailrocks-research/README.md) | Run deep, sourced research into a reusable topic under research/, for a question or to extend a roadmap item, using parallel investigators. |
| [`tailrocks-record-decision`](skills/tailrocks-record-decision/README.md) | Record one user decision on a roadmap item: validate it against settled ground, date it with its reason, propagate it, and flag what it invalidates, including reopening READY or PLANNED work. |
| [`tailrocks-finalize`](skills/tailrocks-finalize/README.md) | Close the shaping interview on a SHAPING roadmap item: resolve every screen, flow, and open question, then grant READY. |
| [`tailrocks-plan`](skills/tailrocks-plan/README.md) | Convert a READY roadmap item into plans/<slug>/: coverage ledger, gap research, an OpenSpec-grammar spec, one zero-context plan per work item, and GOAL.md for goal execution. |
| [`tailrocks-reconcile`](skills/tailrocks-reconcile/README.md) | True up plans/<slug>/ with execution reality: re-verify DONE rows by re-running their criteria, reset dead IN PROGRESS rows, retest BLOCKED, drift-check TODO plans, and fix the item's status. |

<!-- skills:end -->

## Manual-only policy

All skills require explicit invocation. Claude Code, Grok Build, and Kimi Code
honor `disable-model-invocation: true`; Codex uses
`policy.allow_implicit_invocation: false`. OpenCode users can enforce the same
rule with:

```json
{ "permission": { "skill": { "tailrocks-*": "ask" } } }
```

## Develop this repository

Each skill lives in `skills/<name>/` with one portable `SKILL.md`, eval cases,
client policy, and optional references, templates, or scripts. Do not duplicate
skill bodies per agent.

```sh
mise install
mise run validate
mise run docs
bun test scripts/
claude --plugin-dir .
```

Skill READMEs, the documentation pages, and the table above are generated from
`SKILL.md` by `scripts/generate-docs.ts`; edit the skill, then run
`mise run docs`. The documentation site lives in [docs/](docs/README.md).

Contribution and release rules live in [AGENTS.md](AGENTS.md). Installation
internals and per-client verification live in [INSTALL.md](INSTALL.md).

## License

Apache-2.0
