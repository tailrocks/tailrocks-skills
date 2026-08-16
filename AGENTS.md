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

The house stack is fixed: Rust 2024 with Axum/Tokio/Tower, TypeScript 7 with Bun,
TanStack Start, React, shadcn/ui, Tailwind CSS v4, and Oxc, and native macOS with
Swift, SwiftUI-first app and UI architecture, narrow capability-only AppKit
bridges, and Liquid Glass. Existing AppKit apps migrate toward that architecture.
Skills deepen this stack; they do not offer alternative frameworks, package managers, test
runners, or component systems. Every setup targets the latest stable release and
latest stable major available at execution time; older majors are unsupported.
Documentation sites are Fumadocs on TanStack Start with Bun — no other
documentation framework, runtime, or package manager.

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

### The macOS family — design to verified pixels

Six skills take a native macOS feature from an approved design through a
design-file handoff to implementation and rendered, audited evidence. They exist
because the ecosystem gap is real:
Apple's own exported agent skills contain no Liquid Glass skill and no macOS
skill, and the highest-traction design-taste skills are built for the web, where
their defaults (avoid system fonts, avoid neutral grays, avoid spring easing) are
reasonable and on Apple platforms are wrong.

Exactly one skill owns each responsibility. Never run two skills that both encode
aesthetic taste — they conflict, and the conflict surfaces as inconsistency
across features rather than as an error.

Inspection modes are named `audit`, except macOS design's scored `review` and
visual QA's capture-producing `verify`.

- **tailrocks-macos-design** — the taste authority. Experience brief,
  information architecture, and the native component map that classifies every
  region `NATIVE` / `NATIVE-COMPOSED` / `CUSTOM`; structurally different
  alternatives with realistic fixtures; macOS density, typography, colour, and
  iconography; the custom component contract; a weighted rubric with hard
  failures and a correction order. Writes design artifacts only, never source.
  Definition: `skills/tailrocks-macos-design/SKILL.md`
- **tailrocks-liquid-glass** — the material authority. `CONTENT`-versus-`FUNCTIONAL`
  layer split, the standard-component-first decision order, exact SwiftUI and
  AppKit API surface with per-symbol availability, ten anti-patterns each stating
  its mechanism, and the glass acceptance gate. Definition:
  `skills/tailrocks-liquid-glass/SKILL.md`
- **tailrocks-swift-best-practices** — code-level policy. Actor isolation as a
  design decision, state ownership and view identity, work kept out of `body`,
  narrow AppKit interop boundaries, typed failure, availability guards with
  decided fallbacks, accessibility as a code obligation. Definition:
  `skills/tailrocks-swift-best-practices/SKILL.md`
- **tailrocks-swift-project-setup** — the baseline an agent can drive from a
  terminal. Declarative project generation with a synchronized source folder, the
  three target values, a decided fallback behavior, and two SDK lanes, ad-hoc local signing, strict
  format and lint gates, test wiring, mise-pinned tooling, and Xcode agent
  integration with a one-owner-per-responsibility skill policy. Definition:
  `skills/tailrocks-swift-project-setup/SKILL.md`
- **tailrocks-macos-visual-qa** — the verification loop. The atomic
  kill-launch-capture invocation, capture by window ID rather than screen
  rectangle, accessibility-tree driving, the appearance and accessibility state
  matrix with restore, `performAccessibilityAudit`, and pixel regression on
  captures rather than detached snapshots. Definition:
  `skills/tailrocks-macos-visual-qa/SKILL.md`
- **tailrocks-sketch-handoff** — design file to implementable package. Sketch
  MCP wiring, Apple's official macOS UI kit, token extraction into committed
  code, the symbol-to-SwiftUI design map that replaces a formal design-to-code
  binding, and approved-frame exports. Definition:
  `skills/tailrocks-sketch-handoff/SKILL.md`

Two findings shape the whole family and are worth stating up front. Apple's own
UI kit contains **zero enabled blur effects** — Liquid Glass is baked there as
static fill, blend-mode, and shadow recipes — so no design file is authoritative
for the material; the operating system is. And Liquid Glass surfaces snapshot
**fully transparent** from a detached view, so any verification of glass chrome
must screen-capture the running app.

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
spec, zero-context plans, GOAL.md for Claude Code and Codex goal execution or
manual Grok prompting).

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
Mechanical walkthrough: `docs/design/pipeline-walkthrough.md`. The published
guide — why each stage exists, what it refuses, and two features taken end to
end (a native macOS app with a Rust core, and a TanStack feature on an Axum
backend) — lives in `docs/content/docs/delivery/` and explains how the delivery
skills hand work to the stack skills.

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

### tailrocks-simplify

Review a pull request or working diff and remove code from it without changing
behavior. Scope is the diff; untouched code stays untouched. Each added hunk
walks a ladder — need to exist, repository already does it, language does it,
platform does it, installed dependency does it, one expression — and every
finding carries a counted delta and a preservation argument. Protected
constructs (trust-boundary validation, authorization, failure paths, durability
and concurrency handling, accessibility, security limits) are never removed as
redundancy, and single-use extractions, two-occurrence abstractions, and
renames for taste are rejected by name.

Skill definition: `skills/tailrocks-simplify/SKILL.md`

The ladder descends from `DietrichGebert`'s ponytail, which applies it before
code is written; this skill applies it to code that already exists in a diff and
adds the obligation that nothing observable may change.

### tailrocks-rethink

Conceptually re-derive the design behind a reported bug, friction, or awkward
implementation. Derives two independent ideal designs before reading the
existing one, matches the problem shape to an established, externally sourced
engineering concept, and requires the reported failure to become
unrepresentable rather than guarded. Heavy restructuring, reimplementation, and
breaking changes are ordinary outcomes; internal compatibility is work, not a
constraint.

Skill definition: `skills/tailrocks-rethink/SKILL.md`

Three skills change existing code, ordered by how much they are allowed to
disturb. **tailrocks-simplify** changes nothing observable and stays inside the
diff. **tailrocks-remediate** corrects a proven defect while the system keeps
its promises. **tailrocks-rethink** treats the current shape as the subject and
expects to break things. Pick by what the change may disturb, not by how large
it feels.

tailrocks-remediate and tailrocks-rethink both refuse to price the answer, and
own different jobs. Remediate requires a proven defect, keeps compatibility as a
correctness constraint, and reaches the target through never-broken migration
slices. Rethink accepts a reported symptom or friction, treats internal
compatibility as work to be scheduled, and expects the destination to break
things. Two guards keep rethink from becoming licensed churn: it refuses a
request with no failed guarantee behind it, and it rejects a target design that
adds capability instead of subtracting a structural measure. Design notes, the
research basis, and the extension model: `docs/design/rethink-design.md`.

### tailrocks-agents-md

Add, place, audit, or repair agent instruction files. `AGENTS.md` is the only
file with content; `CLAUDE.md` and every other client name is a symlink to the
`AGENTS.md` beside it. Every rule goes to the directory that owns it — crate,
package, service, app, documentation site, infrastructure module, test suite,
any unit with conventions of its own — creating that `AGENTS.md` and its symlink
when the directory has none, because ancestor
files load on every request while nested files load only in their subtree. Keeps
a rule only when a competent agent would get it wrong without one, routes
anything enforceable to a gate, and proposes deletions on every pass.

Skill definition: `skills/tailrocks-agents-md/SKILL.md`

This repository is its own first customer: root `CLAUDE.md` is a symlink to
root `AGENTS.md`, and the documentation site's rules live in `docs/AGENTS.md`
with `docs/CLAUDE.md` symlinked beside them.

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with `name`, `license: Apache-2.0`, a
   trigger-rich, agent-neutral `description` starting exactly with “Use only
   when the user explicitly requests this skill.”, `disable-model-invocation:
   true`, and `user-invocable: true` in the frontmatter. Evidence belongs in
   artifacts and references, never disguised as instructions.
2. Add `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
3. Add `evals/evals.json` with realistic normal, boundary, and safety cases. Audit/review-shaped cases should reference fixtures under `evals/fixtures/<case>/`; refusal cases may stay fixture-free.
4. Put deep material under `skills/<name>/references/` and copy-ready assets under
   `skills/<name>/templates/`; keep `SKILL.md` a concise router.

## Router budget

**References are free. Descriptions and router lines are not.**

Three layers, three costs. A `description` loads on every request in any client
that ignores manual-only policy, and competes for a listing budget of 1% of the
context window that truncates on overflow. A `SKILL.md` body loads on invocation
and then stays in context for the rest of the session. Everything under
`references/` and `templates/` costs nothing until read.

**Descriptions are capped at 250 characters after the guard sentence**, enforced
by the validator. Carry the trigger and the do-not-use clause; leave the rest to
the router. The guard sentence itself is load-bearing and measured — the short
form fired on 7 of 8 tempting prompts where the full sentence fired on 0 of 8.
Evidence and method: `docs/design/skill-context-budget.md`.

A `SKILL.md` is loaded whole, every invocation, and every behavior it carries
competes for the model's attention with every other behavior in the same file.
Adding a section does not just add its own instruction — it dilutes the ones
already there. Reference files carry no such cost: they are read on demand and
their length is nearly free.

This is not a theory. Every substantive eval failure during the macOS family's
hardening was a router-dilution failure or a gate misread as permission to
produce nothing. None was a references problem.

Rules for changing a `SKILL.md`:

- New material defaults to `references/`. The router gets **when to read it** and
  at most one rule worth carrying at router level — not a summary of its
  contents. A router section that reads like a table of contents is dilution with
  no benefit; the reference already says all of it, better.
- Adding a section to a router is a change to **every** behavior in that file.
  Re-run that skill's eval cases, not only a case related to the new section.
  Run `mise run evals -- --skill <name> --case <id> --runs 2`. This needs the
  `claude` CLI and spends budget, so run it locally before tagging, not in PR CI.
- Prefer strengthening an existing section over adding one. Two sections that
  both gesture at the same obligation are weaker than one that states it.
- When a router grows past roughly 200 lines, the next addition should replace
  something rather than append.
- Load-bearing router lines — ones an eval case depends on — are not edited
  casually. Check `evals/evals.json` before rewording a gate, a rejection rule,
  or a "complete when" clause.
- **A load-bearing requirement gets a structural cue, not a mid-paragraph
  clause.** A requirement an eval depends on needs a named bullet, a heading, or
  its own sentence with a label. Buried as the third idea in a four-idea
  paragraph it competes with better-signposted ideas elsewhere in the file and
  surfaces only sometimes — which reads as a flaky eval rather than as the
  prose defect it is.

  The case: the content-layer *mechanism* argument sat mid-paragraph in
  `tailrocks-liquid-glass`, while layer classification and render-pass cost each
  had dedicated bullets. Subjects reliably produced the well-signposted two and
  intermittently omitted the third, even though its eval case demanded it
  specifically. Promoting rule / mechanism / exception to named bullets — with
  the wording unchanged — made it pass consecutively.

  Corollary for debugging: an eval that fails on one missing element while
  everything else is correct is usually a signposting defect, not a knowledge
  gap. Look at where the requirement sits in the file before rewriting what it
  says.
5. Every plugin manifest auto-discovers the new skill from `skills/` — no
   manifest edit needed. Place the skill in a `catalog.json` group; validation
   fails until exactly one group contains it. Run `mise run docs` to generate the skill's
   `README.md`, its documentation page, and the root `README.md` row; then add
   it by hand to `INSTALL.md`, this file, and — when it needs a boundary
   against a neighbouring skill — `docs/content/docs/choosing.mdx`.
6. Bump `version` in lockstep across `.claude-plugin/plugin.json`,
   `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and the
   `.claude-plugin/marketplace.json` entry, and tag the release so installs
   can pin.

## Toolchain

**Every tool comes from mise, everywhere — locally and in GitHub Actions.**
`mise.toml` is the only place a tool version is written. Workflows install with
`jdx/mise-action` and never carry their own version input; a second pin in a
workflow is drift waiting to happen. Do not add `setup-bun`, `setup-node`, or
any other per-tool action, and do not install a tool a job needs by hand.

**No alias tasks.** Every `mise` task does something no other task does. A task
that only re-runs another one makes `mise tasks` a worse map of the repository
and leaves two names to keep in step. Name the real task well instead.

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

## Documentation

<https://skills.tailrocks.com> is published from `docs/` — Fumadocs on TanStack
Start, built by Vite into a static bundle and deployed to GitHub Pages by
`.github/workflows/docs.yml`. Development commands and the deployment contract
live in `docs/README.md`.

**Skill grouping has one source: `catalog.json`.** It sets the group titles,
their one-line summaries, the order of the groups, and the order of skills
inside each — used by the root `README.md` table, the documentation skill
index, and the site sidebar. `scripts/validate-skills.ts` requires every
`skills/` directory to appear in exactly one group.

**Skill prose has one source: `SKILL.md`.** `scripts/generate-docs.ts` derives
each `skills/<name>/README.md`, each `docs/content/docs/skills/<name>.mdx`, the
skill index, `docs/content/docs/install.mdx`, and the root `README.md` table
from it. Never edit a generated file — edit the skill and run `mise run docs`.
CI runs `mise run docs:check` and fails when a generated file is stale.

Rules that belong to the site itself — which pages are generated, the MDX-only
requirement, what `design/` is — live in `docs/AGENTS.md`, next to the code they
govern.

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
5. Tag `vX.Y.Z` on the merge commit, push the tag, and publish the GitHub
   release (`gh release create vX.Y.Z --generate-notes --latest`). **A version
   bump without a tag and release breaks every pinned install and gives the
   auto-updating clients nothing to find** — the tag is the release, not the
   manifest edit.
6. Re-verify the INSTALL.md matrix commands against current client versions
   and refresh its verified date.
7. Re-verify macOS platform baselines against Apple DocC availability data and
   `gdmf.apple.com/v2/pmv`; rerun the macOS evals and refresh verification
   stamps. Use `examples/macos-screen/` as the rendered regression corpus.
