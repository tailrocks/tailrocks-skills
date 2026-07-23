# AGENTS.md

This repository publishes **tailrocks-skills**: a cross-agent collection of
reusable engineering skills over a shared `skills/` tree, packaged as native
plugins for Claude Code (`.claude-plugin/plugin.json` +
`.claude-plugin/marketplace.json`, the self-listing marketplace that Claude
Code, Codex, and Grok all consume), Codex (`.codex-plugin/plugin.json`), Kimi
Code (`.kimi-plugin/plugin.json`), and the Antigravity CLI (root
`plugin.json`).

One `skills/<name>/SKILL.md` source serves every supported agent — Claude
Code, Codex CLI, OpenCode, Grok Build, Kimi Code, Antigravity CLI, and Amp.
Keep skills source-neutral — no agent-specific instructions in `SKILL.md`
bodies. Installation, the verified per-client compatibility matrix, and the
duplicate-avoidance rules live in `INSTALL.md`.

The house stack is fixed: Rust 2024 with Axum/Tokio/Tower, and TypeScript 7 with
Bun, TanStack Start, React, shadcn/ui, Tailwind CSS v4, and Oxc. Skills deepen
this stack; they do not offer alternative frameworks, package managers, test
runners, or component systems. Every setup targets the latest stable release and
latest stable major available at execution time; older majors are unsupported.

Skills are manual-only where the client supports per-skill policy. Claude
Code, Grok Build, and Kimi Code honor `disable-model-invocation: true`
(`user-invocable: true` documents the explicit-invocation intent for clients
that read it); Codex uses `agents/openai.yaml` with
`policy.allow_implicit_invocation: false`. OpenCode, Amp, and the Antigravity
CLI ignore those fields — there the explicit-request guard sentence at the
start of every `description` is the control, and OpenCode users can enforce
it with `permission.skill` config.

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

### The delivery family — roadmap-driven pipeline

Seven skills drive an idea from capture through autonomous execution and
back to verified truth. Artifacts:
roadmap items in `roadmap/<slug>/README.md` (status machine: DRAFT → SHAPING
→ READY → PLANNED → IN EXECUTION → DONE, plus PARKED), standing research
topics in `research/<topic>/` (independent of items, many-to-many links),
implementation packages in `plans/<slug>/` (coverage ledger, OpenSpec-grammar
spec, zero-context plans, GOAL.md for the /goal command of Claude Code,
Codex, or Grok).

- **tailrocks-idea** — capture a raw idea as a DRAFT item with a
  content-derived slug and an index row. Capture only; gaps stay visibly
  empty. Definition: `skills/tailrocks-idea/SKILL.md`
- **tailrocks-brainstorm** — the shaping interview: decision-tree frontier,
  one question at a time (numbered rounds with `--batch`), recommended answer
  on every question, decisions asked while facts are looked up, every answer
  written into the item immediately. Sets SHAPING.
  Definition: `skills/tailrocks-brainstorm/SKILL.md`
- **tailrocks-research** — deep research into reusable `research/<topic>/`
  folders: parallel investigators write vetted sourced chapters; a question
  invocation answers it deeply, a roadmap-slug invocation sweeps the item
  outward (missed angles, candidate directions with trade-offs, no verdicts).
  Extends overlapping topics instead of forking.
  Definition: `skills/tailrocks-research/SKILL.md`
- **tailrocks-record-decision** — record one user decision: validate against settled
  ground, date it with its reason, propagate through the item, reopen
  READY/PLANNED items and mark stale plan rows when intent changes.
  Definition: `skills/tailrocks-record-decision/SKILL.md`
- **tailrocks-finalize** — the closing interview and the only source of
  READY: screens collected as confirmed schematic mockups, flows walked,
  every open question resolved, deferred with a reason, or reclassified as
  researchable; READY only when the full readiness checklist passes.
  Definition: `skills/tailrocks-finalize/SKILL.md`
- **tailrocks-plan** — READY item → `plans/<slug>/`: coverage ledger, gap
  research landed as reusable topics, OpenSpec-grammar spec with screen
  contracts and a must-not registry, one zero-context plan per manifest item
  (each written by its own subagent, cold-reviewed by fresh-context
  reviewers), and GOAL.md — machine-checkable bounded /goal condition plus
  kickoff and resume prompts. Sets PLANNED.
  Definition: `skills/tailrocks-plan/SKILL.md`
- **tailrocks-reconcile** — execution truth-sync: re-verify DONE rows by
  re-running their done criteria, reset dead-session rows, re-test
  BLOCKED reasons, drift-check TODO plans against HEAD, mark stale rows,
  and true up the item's status. Run it when a /goal loop finishes,
  stalls, or the repository moved on.
  Definition: `skills/tailrocks-reconcile/SKILL.md`

Grilling mechanics descend from Matt Pocock's `grilling` family; the plan
template and the reconcile stage descend from the shadcn `improve` skill.
All seven write only their own artifacts (`roadmap/`, `research/`,
`plans/`) and never touch source.

### tailrocks-contribute

Contribute to external open-source projects through project-contract recon,
hard-stop-aware proposal, gated preparation, explicit per-contribution
submission approval, and human-approved review response.

Skill definition: `skills/tailrocks-contribute/SKILL.md`

tailrocks-contribute descends from the tesslio `good-oss-citizen` plugin's
recon/propose/preflight structure, extended with submission approval,
review-response, and pacing.

### tailrocks-remediate

Analyze or remediate a proven defect, inconsistency, violated invariant, or
known-wrong state. Derives a greenfield architecture that prevents the complete
defect class and pursues that result without considering price, duration, effort,
implementation size, ROI, or sunk cost. Rejects speculative generality and
permits urgent containment without calling it complete remediation.

Skill definition: `skills/tailrocks-remediate/SKILL.md`

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with `name`, a trigger-rich, agent-neutral
   `description`, `disable-model-invocation: true`, and `user-invocable: true`
   in the frontmatter.
2. Add `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
3. Add `evals/evals.json` with realistic normal, boundary, and safety cases.
4. Put deep material under `skills/<name>/references/` and copy-ready assets under
   `skills/<name>/templates/`; keep `SKILL.md` a concise router.
5. Every plugin manifest auto-discovers the new skill from `skills/` — no
   manifest edit needed. Add the skill to the tables in `README.md` and this
   file.
6. Bump `version` in lockstep across `.claude-plugin/plugin.json`,
   `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and the
   `.claude-plugin/marketplace.json` entry, and tag the release so installs
   can pin.

## Validation

Requires Bun, pinned in `mise.toml`; `mise install` provisions it. Before
publishing changes, run the Bun-native skill and manifest validator:

```sh
bun run scripts/validate-skills.ts
# or
mise run validate
```

Load the plugin locally in Claude Code:

```sh
claude --plugin-dir .
```

## Contributing workflow

Main is protected and PR-only. Work on a feature branch (`feat/…`, `fix/…`,
or `advisor/…`), commit every completed change with DCO signoff
(`git commit -s`), and open a PR (`gh pr create`) when the change set is
complete. Never push to main directly. Do not leave finished work uncommitted
on the branch.

## Commit Messages

Commit every completed repository change unless the user explicitly requests
otherwise.

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

## Releasing

1. Run `mise run validate`; it must be green.
2. Bump `version` in `.claude-plugin/plugin.json`,
   `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and the
   `.claude-plugin/marketplace.json` entry in one commit.
3. Re-run the validator; it enforces version lockstep.
4. Update pinned-tag examples in INSTALL.md and README.md to the new tag.
5. Tag `vX.Y.Z` on the merge commit and push the tag.
6. Re-verify the INSTALL.md matrix commands against current client versions
   and refresh its verified date.
