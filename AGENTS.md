# AGENTS.md

This repository publishes **tailrocks-skills**: a cross-agent collection of
reusable engineering skills, packaged as one Claude Code plugin
(`.claude-plugin/plugin.json`) and one Codex plugin (`.codex-plugin/plugin.json`)
over a shared `skills/` tree.

One `skills/<name>/SKILL.md` source serves every agent (Claude Code, Codex, Amp,
OpenCode, Kimi). Keep skills source-neutral — no agent-specific instructions in
`SKILL.md` bodies.

All skills are **manual-only**: every `SKILL.md` sets `disable-model-invocation:
true`, so nothing auto-fires. Invoke each explicitly (in Claude Code,
`/tailrocks-skills:<name>`). The trigger-rich `description` is the fallback for
agents that lack that field.

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

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with `name`, a trigger-rich, agent-neutral
   `description`, and `disable-model-invocation: true` in the frontmatter.
2. Put deep material under `skills/<name>/references/` and copy-ready assets under
   `skills/<name>/templates/`; keep `SKILL.md` a concise router.
3. Both plugin manifests auto-discover the new skill from `skills/` — no manifest
   edit needed. Add the skill to the tables in `README.md` and this file.
4. List the skill in `tailrocks-marketplace` only if the plugin split changes;
   the marketplace references this whole plugin, not individual skills.

## Validation

Before publishing changes, validate both manifests parse:

```sh
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
```

Load the plugin locally in Claude Code:

```sh
claude --plugin-dir .
```

## Commit Messages

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
