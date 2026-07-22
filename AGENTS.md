# AGENTS.md

This repository publishes **tailrocks-skills**: a cross-agent collection of
reusable engineering skills, packaged as Claude Code, Codex, and Kimi Code
plugins (`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and
`.kimi-plugin/plugin.json`) over a shared `skills/` tree.

One `skills/<name>/SKILL.md` source serves every agent (Claude Code, Codex, Amp,
OpenCode, Kimi). Keep skills source-neutral — no agent-specific instructions in
`SKILL.md` bodies.

The house stack is fixed: Rust 2024 with Axum/Tokio/Tower, and TypeScript 7 with
Bun, TanStack Start, React, shadcn/ui, Tailwind CSS v4, and Oxc. Skills deepen
this stack; they do not offer alternative frameworks, package managers, test
runners, or component systems. Every setup targets the latest stable release and
latest stable major available at execution time; older majors are unsupported.

Skills are manual-only where the client supports per-skill policy. Claude Code,
Kimi Code, GitHub Copilot, and VS Code use `disable-model-invocation: true` and
`user-invocable: true`; Codex uses `agents/openai.yaml` with
`allow_implicit_invocation: false`; Grok consumes the Claude-compatible surface.
Gemini CLI, OpenCode, and Amp remain compatible but do not document the same
portable per-skill automatic-invocation control.

**Token usage is a design criterion.** Skills stay lean: scale effort (subagents,
depth) to the task, prefer pointers (`file:line`/URL) over copied blocks, skip
stages that add no value, and never produce an artifact that will not be read.

## Available Skills

### tailrocks-rust-best-practices

Write, review, or refactor Rust code. Covers ownership and borrowing, public API
design, error and panic policy, tests and doc tests, unsafe and thread-safety
review, performance discipline, and readability.

Skill definition: `skills/tailrocks-rust-best-practices/SKILL.md`

### tailrocks-rust-project-setup

Scaffold and enforce a strict, modern Rust project: edition 2024, `resolver = 3`,
`crates/` workspace layout, the strict `[workspace.lints]` tables, `clippy.toml`,
rustfmt, `rust-toolchain.toml`, mise-managed tooling, and the cargo-deny / audit
/ shear / hack / nextest gates. Ships copy-ready config under
`skills/tailrocks-rust-project-setup/templates/`.

Skill definition: `skills/tailrocks-rust-project-setup/SKILL.md`

### tailrocks-axum-best-practices

Build and review production Axum services with typed state and extractors,
stable error responses, ordered Tower middleware, security limits, tracing,
graceful shutdown, async task ownership, and contract tests.

Skill definition: `skills/tailrocks-axum-best-practices/SKILL.md`

### tailrocks-typescript-best-practices

Write, review, or refactor strict Rust-inspired TypeScript 7 and React code with
Bun-owned tooling:
exhaustive state, typed failure, runtime validation, domain values, readonly
mutation boundaries, async correctness, React rules, and tests.

Skill definition: `skills/tailrocks-typescript-best-practices/SKILL.md`

### tailrocks-tanstack-project-setup

Scaffold, migrate, and enforce strict Bun-only TanStack Start applications with
TypeScript 7, Vite, Oxc, React, Router, Query, shadcn/ui, Tailwind CSS v4,
validated server/client boundaries, Bun tests, exact versions, and CI gates.
Copy-ready configuration lives under
`skills/tailrocks-tanstack-project-setup/templates/`.

Skill definition: `skills/tailrocks-tanstack-project-setup/SKILL.md`

### tailrocks-code-health

Turn code quality into executable, monotonic contracts across the house stack:
architecture DAGs, measured baselines, shrink-only debt budgets, flake quarantine,
defect-to-gate learning, structured gate output, tiered verification, and
automated latest-version enforcement.

Skill definition: `skills/tailrocks-code-health/SKILL.md`

### tailrocks-propose

Turn a rough idea into an enriched, evidence-backed proposal. Recon plus parallel
subagents gather prior art, codebase touchpoints, constraints, risks, and
alternative directions into a per-idea folder (`proposals/<slug>/`) of sourced
findings, candidate directions, and open questions. Read-only advisor — never
writes code or the final plan; hands back for the human to choose a direction.

Skill definition: `skills/tailrocks-propose/SKILL.md`

### tailrocks-research

Take a confirmed proposal direction and produce the deliverable: deep, sourced
research plus incredibly detailed, self-contained handoff plans a zero-context
executor can follow. Writes `research/` evidence and `plans/NNN-*.md` (handoff
template) into the same per-idea folder; pauses for a human confirm on the
implementation shape before writing plans. Read-only on source.

Skill definition: `skills/tailrocks-research/SKILL.md`

The `tailrocks-propose → tailrocks-research` pair is a workflow: `tailrocks-propose`
enriches broadly and stops; you clarify direction in conversation;
`tailrocks-research` goes deep on the one direction and writes the plan. Both are
read-only advisors and manual-only.

### tailrocks-blueprint

Convert a human-authored concept document (.md/.mdx describing a feature or a
whole application, optionally with schematic screen mockups) into the full
handoff package: an ID-addressed coverage ledger, parallel-subagent research
chapters, an OpenSpec-grammar requirement spec with screen contracts and a
must-not registry, and one zero-context implementation plan per item — each plan
written by its own dedicated subagent, then cold-reviewed by fresh-context
reviewers. The standalone entry point of the delivery family: where
`tailrocks-propose`/`tailrocks-research` start from a rough idea and a chosen
direction, blueprint starts from the concept the human already wrote. Read-only
outside `blueprints/<slug>/`.

Skill definition: `skills/tailrocks-blueprint/SKILL.md`

### tailrocks-grill

Relentlessly interview the user about an idea, plan, or draft until every
material decision is resolved, writing each answer into a blueprint-ready
concept document the moment it lands. Mechanics: model the idea as a decision
tree, ask only the frontier, one question at a time (numbered frontier rounds
with `--batch`), every question with a recommended answer; decisions are asked,
facts are looked up with the house evidence standard; no question cap — the
user steers with words, and a steered wrap-up records open decisions instead of
assuming. Writes only the concept document. The
`tailrocks-grill → tailrocks-blueprint` chain is the idea-to-plans pipeline.

Skill definition: `skills/tailrocks-grill/SKILL.md`

### tailrocks-correctness-first

Analyze or remediate a proven defect, inconsistency, violated invariant, or
known-wrong state. Derives a greenfield architecture that prevents the complete
defect class and pursues that result without considering price, duration, effort,
implementation size, ROI, or sunk cost. Rejects speculative generality and
permits urgent containment without calling it complete remediation.

Skill definition: `skills/tailrocks-correctness-first/SKILL.md`

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with `name`, a trigger-rich, agent-neutral
   `description`, `disable-model-invocation: true`, and `user-invocable: true`
   in the frontmatter.
2. Add `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
3. Add `evals/evals.json` with realistic normal, boundary, and safety cases.
4. Put deep material under `skills/<name>/references/` and copy-ready assets under
   `skills/<name>/templates/`; keep `SKILL.md` a concise router.
5. Both plugin manifests auto-discover the new skill from `skills/` — no manifest
   edit needed. Add the skill to the tables in `README.md` and this file.
6. List the skill in `tailrocks-marketplace` only if the plugin split changes;
   the marketplace references this whole plugin, not individual skills.

## Validation

Before publishing changes, run the Bun-native skill and all three manifest validator:

```sh
bun run scripts/validate-skills.ts
```

Load the plugin locally in Claude Code:

```sh
claude --plugin-dir .
```

## Commit Messages

Commit and push every completed repository change. Do not leave finished work
uncommitted unless the user explicitly requests otherwise.

All commits in this repository should follow Conventional Commits 1.0.0.

Subject format: `<type>[optional scope][!]: <description>`

Allowed types:

| Type | Use for |
|---|---|
| `feat` | New user-visible feature (a new skill, a new rule) |
| `fix` | Bug fix (wrong guidance, broken template) |
| `docs` | Documentation-only change |
| `style` | Formatting, whitespace; no content change |
| `refactor` | Internal restructuring; no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system, tooling, dependencies |
| `ci` | CI configuration |
| `chore` | Routine maintenance |
| `revert` | Reverts a prior commit |

Breaking changes use `!` after the type or scope and include a `BREAKING CHANGE:`
footer in the body.
