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

Use a release tag for reproducible installs. See [INSTALL.md](INSTALL.md) for
pinning, upgrades, duplicate prevention, and the verified compatibility matrix.

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
| [`tailrocks-typescript-best-practices`](skills/tailrocks-typescript-best-practices/README.md) | Apply strict Rust-inspired TypeScript 7 contracts when writing, reviewing, refactoring, or migrating TypeScript. |

### Native macOS

Design to verified pixels; exactly one skill owns each responsibility.

| Skill | What it does |
|---|---|
| [`tailrocks-macos-design`](skills/tailrocks-macos-design/README.md) | Design a macOS feature to Apple-ecosystem quality before any production code is written. |
| [`tailrocks-sketch-handoff`](skills/tailrocks-sketch-handoff/README.md) | Turn a Sketch design into a handoff an agent can implement faithfully as a native macOS app. |
| [`tailrocks-liquid-glass`](skills/tailrocks-liquid-glass/README.md) | Apply, audit, or remediate Apple's Liquid Glass material in a native macOS app written in SwiftUI or AppKit. |
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/README.md) | Write, review, or refactor Swift and SwiftUI code for a native macOS app. |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/README.md) | Scaffold, audit, or remediate a strict native macOS Swift app baseline. |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/README.md) | Build, launch, capture, drive, and verify a native macOS app so an agent can see and critique its own interface. |

### Code quality and contribution

Debt that shrinks, defects that stop recurring, and work on repositories you do not own.

| Skill | What it does |
|---|---|
| [`tailrocks-code-health`](skills/tailrocks-code-health/README.md) | Establish, audit, or tighten measurable shrink-only code-health ratchets. |
| [`tailrocks-remediate`](skills/tailrocks-remediate/README.md) | Analyze or remediate a proven defect, inconsistency, violated invariant, or known-wrong state through correctness-first architectural redesign. |
| [`tailrocks-rethink`](skills/tailrocks-rethink/README.md) | Conceptually re-derive the design behind a reported bug, friction, or awkward implementation instead of patching it. |
| [`tailrocks-contribute`](skills/tailrocks-contribute/README.md) | Contribute to an external open-source project as a good citizen: discover its actual contribution contract, select the accepted venue, prepare a minimal evidenced change, submit only after explicit per-contribution human approval, and stay engaged through review. |

### Roadmap and delivery

An idea through shaping, planning, autonomous execution, and back to verified truth.

| Skill | What it does |
|---|---|
| [`tailrocks-idea`](skills/tailrocks-idea/README.md) | Capture a raw product or feature idea as a new roadmap item: derive a slug from the content, create roadmap/<slug>/README.md in DRAFT status from the item template, and register it in the roadmap index. |
| [`tailrocks-brainstorm`](skills/tailrocks-brainstorm/README.md) | Shape a DRAFT or SHAPING roadmap item through a relentless interview: one question at a time with a recommended answer, decisions asked while facts are looked up, every resolved answer written into the item immediately. |
| [`tailrocks-research`](skills/tailrocks-research/README.md) | Run deep, sourced research into a reusable topic folder under research/: either a specific question ("pure-Rust macOS app without Swift") or a roadmap item to extend — surfacing missed angles, directions, and evidence. |
| [`tailrocks-record-decision`](skills/tailrocks-record-decision/README.md) | Record one user decision on a roadmap item: validate it against settled ground, date it with its reason, propagate it through the item's sections, and flag everything it invalidates — including reopening READY/PLANNED items and marking stale plans. |
| [`tailrocks-finalize`](skills/tailrocks-finalize/README.md) | Finalize a SHAPING roadmap item through a closing interview: collect every screen and flow, resolve or classify every open question, verify the readiness checklist, and set the item READY for planning. |
| [`tailrocks-plan`](skills/tailrocks-plan/README.md) | Convert a READY roadmap item into the full implementation package under plans/<slug>/: coverage ledger, gap-filling research, an OpenSpec-grammar spec, one zero-context plan per work item — each written by its own subagent and cold-reviewed — plus a copy-pasteable GOAL.md for Claude Code and Codex goal execution or manual Grok prompting. |
| [`tailrocks-reconcile`](skills/tailrocks-reconcile/README.md) | True up an implementation package under plans/<slug>/ with execution reality: re-verify DONE rows by re-running their done criteria, reset or salvage IN PROGRESS rows left by dead sessions, investigate BLOCKED rows, drift-check TODO plans against HEAD, mark stale rows with reasons, and reconcile the roadmap item's status. |

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
