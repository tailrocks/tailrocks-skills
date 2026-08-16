# tailrocks-skills

Reusable engineering skills for Claude Code, Codex CLI, OpenCode, Grok Build,
Kimi Code, Antigravity CLI, and Amp. Every client receives the same 21 skills
from one shared `skills/` tree.

The collection is opinionated: Rust 2024, Axum/Tokio/Tower, TypeScript 7,
Bun, TanStack Start, React, shadcn/ui, Tailwind CSS v4, Oxc, and native macOS
with SwiftUI-first architecture, narrow capability-only AppKit bridges, and
Liquid Glass.

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

## Choose the right skill

### Rust and services

| Skill | Use it for | Example request |
|---|---|---|
| `tailrocks-rust-best-practices` | Writing, reviewing, or refactoring Rust ownership, APIs, errors, unsafe code, tests, performance, and readability | “Use tailrocks-rust-best-practices to review this crate. Do not edit.” |
| `tailrocks-rust-project-setup` | Scaffolding, auditing, or fixing a strict Rust 2024 workspace, tooling, lints, dependencies, and CI gates | “Use tailrocks-rust-project-setup to scaffold a strict workspace under `crates/`.” |
| `tailrocks-axum-best-practices` | Axum routers, handlers, extractors, typed HTTP boundaries, Tower middleware, lifecycle, tracing, and transport tests | “Use tailrocks-axum-best-practices to implement this authenticated endpoint.” |

Use the project-setup skill for repository mechanics, Rust best practices for
language-level policy, and Axum best practices only where an HTTP boundary
exists.

### TypeScript and TanStack

| Skill | Use it for | Example request |
|---|---|---|
| `tailrocks-typescript-best-practices` | Strict TypeScript 7 or React code: state modeling, runtime validation, typed failure, readonly APIs, async ownership, and tests | “Use tailrocks-typescript-best-practices to refactor this state machine.” |
| `tailrocks-tanstack-project-setup` | Scaffolding, migrating, auditing, or fixing a Bun-only TanStack Start app with Router, Query, shadcn/ui, Tailwind v4, Oxc, tests, and CI | “Use tailrocks-tanstack-project-setup to audit this app and remediate every baseline violation.” |

### Native macOS

| Skill | Use it for | Example request |
|---|---|---|
| `tailrocks-macos-design` | Designing a feature before code: brief, information architecture, native component map, alternatives, fixtures, and scored review | “Use tailrocks-macos-design to design a connection manager. Stop for my alternative selection.” |
| `tailrocks-sketch-handoff` | Turning a Sketch file into tokens, a symbol-to-SwiftUI map, approved exports, and an implementable native handoff | “Use tailrocks-sketch-handoff on `Settings.sketch` and prepare the implementation package.” |
| `tailrocks-liquid-glass` | Applying, auditing, or remediating macOS Liquid Glass layer discipline, APIs, availability, accessibility, and rendering | “Use tailrocks-liquid-glass in audit mode on the toolbar. Do not edit.” |
| `tailrocks-swift-best-practices` | Swift and SwiftUI implementation or review: concurrency, state ownership, identity, AppKit bridges, failure, availability, accessibility, and tests | “Use tailrocks-swift-best-practices to refactor this AppKit screen toward SwiftUI-first architecture.” |
| `tailrocks-swift-project-setup` | Scaffolding, auditing, or fixing the native macOS project baseline, generation, signing, formatting, linting, testing, mise, and Xcode integration | “Use tailrocks-swift-project-setup to create a strict macOS app baseline.” |
| `tailrocks-macos-visual-qa` | Building, launching, driving, window-ID capturing, accessibility auditing, state-matrix verification, and pixel regression | “Use tailrocks-macos-visual-qa to verify this screen in light, dark, inactive, and accessibility states.” |

Typical sequence:

```text
macos-design → sketch-handoff → swift-best-practices + liquid-glass
             → swift-project-setup gates → macos-visual-qa
```

Each skill owns one responsibility. Do not ask multiple skills to make the
same aesthetic decision. See the completed, deliberately rejected dogfood
screen in [examples/macos-screen/](examples/macos-screen/).

### Code quality and contribution

| Skill | Use it for | Example request |
|---|---|---|
| `tailrocks-code-health` | Establishing or tightening measurable shrink-only architecture, lint, dependency, flake, defect, documentation, or verification ratchets | “Use tailrocks-code-health to make dependency debt monotonic and measurable.” |
| `tailrocks-remediate` | Eliminating a proven defect class through structural redesign instead of a symptom patch | “Use tailrocks-remediate in fix mode for this cross-request state leak.” |
| `tailrocks-rethink` | Re-deriving the ideal design behind a bug or friction, with heavy restructuring and breaking changes as ordinary outcomes | “Use tailrocks-rethink on this ordering bug and make the failure unrepresentable.” |
| `tailrocks-contribute` | Reconnaissance, proposal, preparation, approved submission, and review response for an external open-source contribution | “Use tailrocks-contribute to prepare—but not submit—a fix for owner/repo#42.” |

`tailrocks-remediate` requires a proven known-wrong state. Use ordinary best
practices for routine implementation and `tailrocks-contribute` only for
repositories the user does not own.

`tailrocks-remediate` and `tailrocks-rethink` share a refusal to price the
answer, and differ in posture. Remediate needs a proven defect, preserves
compatibility as a constraint, and migrates without ever breaking the system.
Rethink needs only a reported symptom or friction, treats internal
compatibility as work rather than a constraint, derives the ideal design before
reading the existing one, and expects breaking changes. Reach for remediate
when the system must keep its promises while it is corrected, and for rethink
when the current shape itself is the thing under review.

### Roadmap and delivery

| Skill | Use it for | Example request |
|---|---|---|
| `tailrocks-idea` | Capturing a raw idea as a DRAFT roadmap item without inventing missing detail | “Use tailrocks-idea: add offline editing with conflict recovery.” |
| `tailrocks-brainstorm` | Shaping a DRAFT or SHAPING item through a live, one-question-at-a-time interview | “Use tailrocks-brainstorm on `offline-editing`.” |
| `tailrocks-research` | Deep sourced research for a question or roadmap item, saved as reusable research topics | “Use tailrocks-research on `offline-editing` and investigate conflict-resolution models.” |
| `tailrocks-record-decision` | Recording and propagating one user decision, including reopening stale READY or PLANNED work | “Use tailrocks-record-decision on `offline-editing`: conflicts use explicit user resolution because data loss must stay visible.” |
| `tailrocks-finalize` | Closing the shaping interview, resolving every screen, flow, and open question, and granting READY | “Use tailrocks-finalize on `offline-editing`.” |
| `tailrocks-plan` | Converting a READY item into specifications, coverage, zero-context implementation plans, and `GOAL.md` | “Use tailrocks-plan on `offline-editing` with `--deep`.” |
| `tailrocks-reconcile` | Re-verifying execution status, blockers, drift, and DONE claims against the current repository | “Use tailrocks-reconcile on `offline-editing` after the goal loop finishes.” |

The delivery pipeline is:

```text
idea → brainstorm → finalize → plan → goal execution → reconcile
         ↕             ↕
      research    record-decision
```

Artifacts live in `roadmap/<slug>/`, `research/<topic>/`, and
`plans/<slug>/`. Research and decision recording may happen whenever needed;
only finalize grants READY, and plan requires READY. See
[examples/plan-package/](examples/plan-package/) and the
[pipeline walkthrough](docs/pipeline-walkthrough.md).

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
bun test scripts/
claude --plugin-dir .
```

Contribution and release rules live in [AGENTS.md](AGENTS.md). Installation
internals and per-client verification live in [INSTALL.md](INSTALL.md).

## License

Apache-2.0
