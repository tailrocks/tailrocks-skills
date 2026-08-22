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

1. Install through your agent's channel: [INSTALL.md](INSTALL.md), or the
   [install guide](https://skills.tailrocks.com/docs/install) with per-client
   upgrade and pinning commands.
2. Name a manual-only skill explicitly with an action, scope, and constraint.
   Model-policy skills may load under their exact trigger when matching work is
   already in scope; selection adds no authority:

```text
Use tailrocks-typescript-best-practices in review mode on src/auth/.
Focus on runtime validation, typed failure, and async ownership. Do not edit.
```

Everything else lives in the documentation, once:

- [Choosing a skill](https://skills.tailrocks.com/docs/choosing) — which
  skill owns which job when several could apply.
- [The delivery pipeline](https://skills.tailrocks.com/docs/delivery) — an
  idea to verified truth, walked end to end for
  [a native macOS app](https://skills.tailrocks.com/docs/delivery/macos-app),
  [a TanStack feature on an Axum backend](https://skills.tailrocks.com/docs/delivery/tanstack-feature),
  and [a Rust service with gRPC and GraphQL](https://skills.tailrocks.com/docs/delivery/rust-backend).
- [Validating, repeatedly](https://skills.tailrocks.com/docs/validating) —
  the verification loop that proves shipped work, and the gates that prove
  this collection.
- [Self-improvement](https://skills.tailrocks.com/docs/self-improve) — how a
  shipped pull request, in this repository or any other, becomes skill
  patches through subagent analysis.

## Skills

Each row links to that skill's own README. The table is generated from the
skills themselves — edit a skill, never the table.

<!-- skills:start -->

### Rust and services

Repository mechanics, language-level policy, the HTTP boundary, and the two service contracts.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-rust-project-setup`](skills/tailrocks-rust-project-setup/README.md) | Scaffold a strict Rust workspace with layout, toolchains, lints, mise, dependency policy, and test gates. | Manual only |
| [`tailrocks-rust-project-audit`](skills/tailrocks-rust-project-audit/README.md) | Audit an existing Rust workspace against the strict project baseline and report exact gaps without changing files or installing tools. | Manual only |
| [`tailrocks-rust-project-remediate`](skills/tailrocks-rust-project-remediate/README.md) | Remediate user-approved gaps in an existing Rust workspace baseline while keeping every intermediate state buildable. | Manual only |
| [`tailrocks-rust-best-practices`](skills/tailrocks-rust-best-practices/README.md) | Apply Rust correctness contracts when in-scope work writes Rust behavior. | Model policy |
| [`tailrocks-rust-review`](skills/tailrocks-rust-review/README.md) | Review Rust source, APIs, unsafe code, tests, and performance evidence read-only. | Manual only |
| [`tailrocks-rust-refactor`](skills/tailrocks-rust-refactor/README.md) | Restructure Rust code while preserving observable behavior and public contracts. | Manual only |
| [`tailrocks-axum-best-practices`](skills/tailrocks-axum-best-practices/README.md) | Apply Axum policy when in-scope work builds or changes HTTP adapters, routers, handlers, extractors, Tower layers, lifecycle, or transport tests. | Model policy |
| [`tailrocks-axum-review`](skills/tailrocks-axum-review/README.md) | Review Axum HTTP adapters, extractors, Tower policy, lifecycle, and transport tests without editing. | Manual only |
| [`tailrocks-axum-refactor`](skills/tailrocks-axum-refactor/README.md) | Restructure Axum adapters or Tower composition while preserving HTTP behavior. | Manual only |
| [`tailrocks-graphql-best-practices`](skills/tailrocks-graphql-best-practices/README.md) | Apply public GraphQL API policy when in-scope work touches schema, Juniper resolvers, SDL, pagination, or generated GraphQL clients. | Model policy |
| [`tailrocks-grpc-best-practices`](skills/tailrocks-grpc-best-practices/README.md) | Apply cross-service gRPC policy when in-scope work touches proto or Buf contracts, tonic/prost services, status mapping, deadlines, streaming, health, or wire tests. | Model policy |

### TypeScript and TanStack

The Bun-only application baseline and strict TypeScript policy.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-tanstack-project-setup`](skills/tailrocks-tanstack-project-setup/README.md) | Scaffold, migrate, audit, or remediate the Tailrocks Bun/TanStack Start application baseline. | Manual only |
| [`tailrocks-typescript-best-practices`](skills/tailrocks-typescript-best-practices/README.md) | Apply strict TypeScript 7 language/UI policy when in-scope work touches TypeScript, TSX, React state, runtime validation, typed failure, readonly APIs, async ownership, or their tests. | Model policy |

### Native macOS

The Swift implementation stack: code-level policy and the agent-drivable project baseline.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/README.md) | Apply native Swift code policy when in-scope work touches Swift, SwiftUI, concurrency, state ownership, accessibility, availability, or narrow AppKit bridges. | Model policy |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/README.md) | Scaffold, audit, or remediate a strict native macOS Swift baseline: project generation, deployment targets and SDK lanes, local signing, format and lint gates, test wiring, mise tooling, Xcode agent integration. | Manual only |

### Design and prototypes

One design skill per platform — macOS, web, terminal — each producing a blessed reference rendered by the real substrate, plus the capture loops that freeze it.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-macos-design`](skills/tailrocks-macos-design/README.md) | Apply macOS visual-design and Liquid Glass policy when in-scope work touches native screen structure, material, component mapping, prototypes, or design review. | Model policy |
| [`tailrocks-web-design`](skills/tailrocks-web-design/README.md) | Apply web visual-design policy when in-scope work touches TanStack screens, design routes, shadcn/ui composition, visual fixtures, or design review. | Model policy |
| [`tailrocks-tui-design`](skills/tailrocks-tui-design/README.md) | Apply terminal visual-design policy when in-scope work touches ratatui screens, terminal UX, fixture galleries, golden frames, or design review. | Model policy |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/README.md) | Build, launch, capture, drive, and verify a native macOS app so an agent can see its own interface: window-ID capture, accessibility-tree driving, appearance and accessibility state matrix, audits, and pixel regression. | Manual only |
| [`tailrocks-web-visual-qa`](skills/tailrocks-web-visual-qa/README.md) | Freeze and regress Playwright screenshot baselines for TanStack design routes and pages: the capture matrix per state, theme, and viewport — only from a finalized, blessed design. | Manual only |

### Code quality and contribution

Debt that shrinks, defects that stop recurring, skills that improve from field evidence, and work on repositories you do not own.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-code-health`](skills/tailrocks-code-health/README.md) | Establish, audit, or tighten measurable shrink-only code-health ratchets for architecture, lint, dependency, flake, defect, documentation, or verification debt. | Manual only |
| [`tailrocks-improve`](skills/tailrocks-improve/README.md) | Audit any repository through parallel read-only investigators and turn verified findings into standalone, executor-ready implementation plans under plans/ — no roadmap required. | Manual only |
| [`tailrocks-agents-md`](skills/tailrocks-agents-md/README.md) | Apply agent-instruction topology policy when in-scope work touches AGENTS.md, client symlinks, instruction rules, or rule placement. | Model policy |
| [`tailrocks-retrospect`](skills/tailrocks-retrospect/README.md) | After a roadmap item ships, rebuild which skills ran from commit trailers, diff that against its Decisions, Must not, spec IDs, and verification rounds, and propose patches to the skills at fault. | Manual only |
| [`tailrocks-simplify`](skills/tailrocks-simplify/README.md) | Review a pull request or diff and remove code without changing behavior: dead paths, hand-rolled utilities the platform provides, indirection, needless branching. | Manual only |
| [`tailrocks-remediate`](skills/tailrocks-remediate/README.md) | Analyze or remediate a proven defect through correctness-first architectural redesign. | Manual only |
| [`tailrocks-rethink`](skills/tailrocks-rethink/README.md) | Re-derive the design behind a reported bug or friction instead of patching it; restructuring and breaking changes are expected and cost is excluded from the decision. | Manual only |
| [`tailrocks-contribute`](skills/tailrocks-contribute/README.md) | Contribute to an external open-source project: discover its contribution contract, prepare a minimal evidenced change, and submit only after explicit human approval. | Manual only |

### Decision support

Conversation-only challenge before action, with facts retrieved and choices left to the user.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-grilling`](skills/tailrocks-grilling/README.md) | Use when the user asks to be grilled, challenged, interrogated, or stress-tested on an idea, plan, or decision before action. | Model policy |

### Skill authoring

Create skills from target repository policy, update behavior under a frozen contract, audit read-only, and refactor structure without behavior change.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-skill-create`](skills/tailrocks-skill-create/README.md) | Create a new agent skill for an evidenced responsibility with no owner, using the target repository's policy. | Manual only |
| [`tailrocks-skill-update`](skills/tailrocks-skill-update/README.md) | Improve an existing skill in place while preserving its responsibility and public contract. | Manual only |
| [`tailrocks-skill-audit`](skills/tailrocks-skill-audit/README.md) | Inspect one skill or the portfolio and report behavioral, structural, efficiency, portability, security, evidence, and overlap defects. | Manual only |
| [`tailrocks-skill-refactor`](skills/tailrocks-skill-refactor/README.md) | Restructure skill ownership while preserving observable behavior and public contracts. | Manual only |

### Pull request lifecycle

Open, refresh, check out, and merge pull requests in any repository, extended by its .tailrocks/pr.md.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-create-pr`](skills/tailrocks-create-pr/README.md) | Open a pull request for the current change in any repository: branch, commit in the repo's convention, body from its template, render check. | Manual only |
| [`tailrocks-refresh-pr`](skills/tailrocks-refresh-pr/README.md) | Reconcile an open pull request's title and body against the current diff: drifted prose rewritten, accurate prose kept verbatim, template sections re-selected. | Manual only |
| [`tailrocks-checkout-pr`](skills/tailrocks-checkout-pr/README.md) | Compatibility alias for the deterministic pull-request checkout command. | Manual only |
| [`tailrocks-review-pr`](skills/tailrocks-review-pr/README.md) | Review a pull request, branch, or diff and report verified findings: adversarially validated bugs, structural regressions, triggered specialist lanes, and fixer routes. | Manual only |
| [`tailrocks-merge-pr`](skills/tailrocks-merge-pr/README.md) | Merge a pull request fail-closed in any repository: CI and documentation gates, blast-radius confirm, metadata reconcile, repo-selected merge method, the repo's pre-merge worklist from .tailrocks/pr.md. | Manual only |
| [`tailrocks-document`](skills/tailrocks-document/README.md) | Before a pull request merges, make the repository's own documentation the final source of truth for everything the diff changed — rewritten pages and new structures, never a changelog. | Manual only |
| [`tailrocks-pr-template`](skills/tailrocks-pr-template/README.md) | Generate a repository's .github/PULL_REQUEST_TEMPLATE.md: tailor this skill's base template to the repo's structure, gates, and merged-PR history so every section and verify block is earned. | Manual only |

### Roadmap and delivery

An idea through shaping, planning, autonomous execution, and back to verified truth.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-audit`](skills/tailrocks-audit/README.md) | Cold-start audit of a repository or branch with no backlog yet: verified findings, prioritized, seeded as roadmap items or plans. | Manual only |
| [`tailrocks-idea`](skills/tailrocks-idea/README.md) | Capture a raw product or feature idea as a new DRAFT roadmap item under roadmap/<slug>/ and register it in the index. | Manual only |
| [`tailrocks-brainstorm`](skills/tailrocks-brainstorm/README.md) | Shape a DRAFT or SHAPING roadmap item through a one-question-at-a-time interview, writing every answer into the item as it resolves. | Manual only |
| [`tailrocks-research`](skills/tailrocks-research/README.md) | Run deep, sourced research into a reusable topic under research/, for a question or to extend a roadmap item, using parallel investigators. | Manual only |
| [`tailrocks-record-decision`](skills/tailrocks-record-decision/README.md) | Record one user decision on a roadmap item: validate it against settled ground, date it with its reason, propagate it, and flag what it invalidates, including reopening READY or PLANNED work. | Manual only |
| [`tailrocks-finalize`](skills/tailrocks-finalize/README.md) | Close the shaping interview on a SHAPING roadmap item: resolve every screen, flow, and open question, then grant READY. | Manual only |
| [`tailrocks-plan`](skills/tailrocks-plan/README.md) | Convert a READY roadmap item into roadmap/<slug>/plan/ and goal/: coverage ledger, gap research, an OpenSpec-grammar spec, one zero-context plan per work item, and the goal handoff. | Manual only |
| [`tailrocks-record-feedback`](skills/tailrocks-record-feedback/README.md) | Capture what a user found wrong with a roadmap item's shipped work: their words verbatim, one statement per defect, reproduction as given. | Manual only |
| [`tailrocks-prove`](skills/tailrocks-prove/README.md) | Execute every surface a roadmap item claims to ship, confirm or refute each reported defect, and write the verification round — subagent fan-out, evidence per surface, vacuous-proof audit. | Manual only |
| [`tailrocks-reconcile`](skills/tailrocks-reconcile/README.md) | True up roadmap/<slug>/ with execution reality: re-run each plan row's done criteria, reject criteria that executed nothing, fold the newest verification round into the item's Remaining, and set the status reality supports. | Manual only |

<!-- skills:end -->

## Develop this repository

```sh
mise install
mise run lint
mise run docs
mise run test
claude --plugin-dir .
```

Skill READMEs, the documentation pages, and the table above are generated from
`SKILL.md` by `scripts/generate-docs.ts`; edit the skill, then run
`mise run docs`. Contribution and release rules live in
[AGENTS.md](AGENTS.md); installation internals in [INSTALL.md](INSTALL.md);
the documentation site in [docs/](docs/README.md). A saved prompt for
improving these skills from an external pull request lives in
[prompts/improve-from-pr.md](prompts/improve-from-pr.md).

## License

Apache-2.0
