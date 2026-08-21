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
2. Name the skill explicitly — every skill is manual-only — with an action,
   a scope, and a constraint:

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

| Skill | What it does |
|---|---|
| [`tailrocks-rust-project-setup`](skills/tailrocks-rust-project-setup/README.md) | Scaffold, audit, or remediate a latest-compatible strict Rust workspace baseline. |
| [`tailrocks-rust-best-practices`](skills/tailrocks-rust-best-practices/README.md) | Apply strict idiomatic Rust contracts when writing, reviewing, or refactoring Rust code. |
| [`tailrocks-axum-best-practices`](skills/tailrocks-axum-best-practices/README.md) | Apply production Axum HTTP-adapter practices when building, reviewing, or refactoring routers, handlers, extractors, Tower middleware, lifecycle, and transport tests. |
| [`tailrocks-graphql-best-practices`](skills/tailrocks-graphql-best-practices/README.md) | Design, build, review, or audit the public GraphQL API of a backend service: schema and pagination shape, Juniper on Axum, generated TanStack clients, and committed-SDL contract gates. |
| [`tailrocks-grpc-best-practices`](skills/tailrocks-grpc-best-practices/README.md) | Apply cross-service gRPC practices for Rust services: buf-governed proto contracts, tonic servers and clients, status mapping, deadlines, streaming, health, and wire contract tests. |

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
| [`tailrocks-macos-prototype`](skills/tailrocks-macos-prototype/README.md) | Build the runnable Liquid Glass prototype proving an approved macOS design before implementation: standard launch contract, fixture scenarios, live sign-off, region match policy. |
| [`tailrocks-liquid-glass`](skills/tailrocks-liquid-glass/README.md) | Apply, audit, or remediate Apple's Liquid Glass material in a native macOS SwiftUI or AppKit app: layer split, glass APIs and availability, scroll edge effects, tint policy, and the accessibility gate. |
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/README.md) | Write, review, or refactor Swift and SwiftUI for macOS: strict concurrency and actor isolation, state ownership and view identity, AppKit interop boundaries, typed failure, availability guards, accessibility, and tests. |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/README.md) | Scaffold, audit, or remediate a strict native macOS Swift baseline: project generation, deployment targets and SDK lanes, local signing, format and lint gates, test wiring, mise tooling, Xcode agent integration. |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/README.md) | Build, launch, capture, drive, and verify a native macOS app so an agent can see its own interface: window-ID capture, accessibility-tree driving, appearance and accessibility state matrix, audits, and pixel regression. |

### Design references

Renderable screen targets the implementation must match: fixture-rendered, user-blessed, mechanically compared.

| Skill | What it does |
|---|---|
| [`tailrocks-tui-design`](skills/tailrocks-tui-design/README.md) | Design terminal UI screens for Rust ratatui apps as blessed golden frames: fixture-rendered gallery crate, byte-exact frame contract, screen states, TUI craft. |
| [`tailrocks-web-design`](skills/tailrocks-web-design/README.md) | Design TanStack screens as blessed in-app design routes: installed shadcn/ui components with fixtures, states and themes, iterated live. |
| [`tailrocks-web-visual-qa`](skills/tailrocks-web-visual-qa/README.md) | Freeze and regress Playwright screenshot baselines for TanStack design routes and pages: the capture matrix per state, theme, and viewport — only from a finalized, blessed design. |

### Code quality and contribution

Debt that shrinks, defects that stop recurring, skills that improve from field evidence, and work on repositories you do not own.

| Skill | What it does |
|---|---|
| [`tailrocks-code-health`](skills/tailrocks-code-health/README.md) | Establish, audit, or tighten measurable shrink-only code-health ratchets for architecture, lint, dependency, flake, defect, documentation, or verification debt. |
| [`tailrocks-improve`](skills/tailrocks-improve/README.md) | Audit any repository through parallel read-only investigators and turn verified findings into standalone, executor-ready implementation plans under plans/ — no roadmap required. |
| [`tailrocks-agents-md`](skills/tailrocks-agents-md/README.md) | Add, place, audit, or repair agent instruction files. |
| [`tailrocks-retrospect`](skills/tailrocks-retrospect/README.md) | After a roadmap item ships, rebuild which skills ran from commit trailers, diff that against its Decisions, Must not, spec IDs, and verification rounds, and propose patches to the skills at fault. |
| [`tailrocks-simplify`](skills/tailrocks-simplify/README.md) | Review a pull request or diff and remove code without changing behavior: dead paths, hand-rolled utilities the platform provides, indirection, needless branching. |
| [`tailrocks-remediate`](skills/tailrocks-remediate/README.md) | Analyze or remediate a proven defect through correctness-first architectural redesign. |
| [`tailrocks-rethink`](skills/tailrocks-rethink/README.md) | Re-derive the design behind a reported bug or friction instead of patching it; restructuring and breaking changes are expected and cost is excluded from the decision. |
| [`tailrocks-contribute`](skills/tailrocks-contribute/README.md) | Contribute to an external open-source project: discover its contribution contract, prepare a minimal evidenced change, and submit only after explicit human approval. |

### Skill authoring

Create, update, audit, and refactor agent skills under the observed-failure law and the context-window budget.

| Skill | What it does |
|---|---|
| [`tailrocks-skill-create`](skills/tailrocks-skill-create/README.md) | Create a new agent skill from an observed failure: baseline first, placement decided before writing, guidance form matched to the failure type, lean router with deep references, trigger-only description, baselined eval cases, full repository wiring. |
| [`tailrocks-skill-update`](skills/tailrocks-skill-update/README.md) | Update an existing skill in place without changing its invocation contract: baseline the failure, check its eval set before touching load-bearing lines, strengthen over append, update the full eval set for CI. |
| [`tailrocks-skill-audit`](skills/tailrocks-skill-audit/README.md) | Audit one skill or every skill in the repository against the authoring doctrine. |
| [`tailrocks-skill-refactor`](skills/tailrocks-skill-refactor/README.md) | Apply user-selected findings, by ID, from a skill-audit report to a skill: fix descriptions, routers, references, and evals per doctrine while preserving the invocation contract. |

### Pull request lifecycle

Open, refresh, check out, and merge pull requests in any repository, extended by its .tailrocks/pr.md.

| Skill | What it does |
|---|---|
| [`tailrocks-create-pr`](skills/tailrocks-create-pr/README.md) | Open a pull request for the current change in any repository: branch, commit in the repo's convention, body from its template, render check. |
| [`tailrocks-refresh-pr`](skills/tailrocks-refresh-pr/README.md) | Reconcile an open pull request's title and body against the current diff: drifted prose rewritten, accurate prose kept verbatim, template sections re-selected. |
| [`tailrocks-checkout-pr`](skills/tailrocks-checkout-pr/README.md) | Switch the working repository onto a pull request's branch via gh pr checkout, guarding a dirty working tree first. |
| [`tailrocks-review-pr`](skills/tailrocks-review-pr/README.md) | Review a pull request, branch, or diff and report verified findings: adversarially validated bugs, structural regressions, content-triggered specialist lanes, house-skill routing. |
| [`tailrocks-merge-pr`](skills/tailrocks-merge-pr/README.md) | Merge a pull request fail-closed in any repository: CI gate, blast-radius confirm, metadata reconcile, repo-selected merge method, the repo's pre-merge worklist from .tailrocks/pr.md. |
| [`tailrocks-pr-template`](skills/tailrocks-pr-template/README.md) | Generate a repository's .github/PULL_REQUEST_TEMPLATE.md: tailor this skill's base template to the repo's structure, gates, and merged-PR history so every section and verify block is earned. |

### Roadmap and delivery

An idea through shaping, planning, autonomous execution, and back to verified truth.

| Skill | What it does |
|---|---|
| [`tailrocks-audit`](skills/tailrocks-audit/README.md) | Cold-start audit of a repository or branch with no backlog yet: verified findings, prioritized, seeded as roadmap items or plans. |
| [`tailrocks-idea`](skills/tailrocks-idea/README.md) | Capture a raw product or feature idea as a new DRAFT roadmap item under roadmap/<slug>/ and register it in the index. |
| [`tailrocks-brainstorm`](skills/tailrocks-brainstorm/README.md) | Shape a DRAFT or SHAPING roadmap item through a one-question-at-a-time interview, writing every answer into the item as it resolves. |
| [`tailrocks-research`](skills/tailrocks-research/README.md) | Run deep, sourced research into a reusable topic under research/, for a question or to extend a roadmap item, using parallel investigators. |
| [`tailrocks-record-decision`](skills/tailrocks-record-decision/README.md) | Record one user decision on a roadmap item: validate it against settled ground, date it with its reason, propagate it, and flag what it invalidates, including reopening READY or PLANNED work. |
| [`tailrocks-finalize`](skills/tailrocks-finalize/README.md) | Close the shaping interview on a SHAPING roadmap item: resolve every screen, flow, and open question, then grant READY. |
| [`tailrocks-plan`](skills/tailrocks-plan/README.md) | Convert a READY roadmap item into roadmap/<slug>/plan/ and goal/: coverage ledger, gap research, an OpenSpec-grammar spec, one zero-context plan per work item, and the goal handoff. |
| [`tailrocks-record-feedback`](skills/tailrocks-record-feedback/README.md) | Capture what a user found wrong with a roadmap item's shipped work: their words verbatim, one statement per defect, reproduction as given. |
| [`tailrocks-prove`](skills/tailrocks-prove/README.md) | Execute every surface a roadmap item claims to ship, confirm or refute each reported defect, and write the verification round — subagent fan-out, evidence per surface, vacuous-proof audit. |
| [`tailrocks-reconcile`](skills/tailrocks-reconcile/README.md) | True up roadmap/<slug>/ with execution reality: re-run each plan row's done criteria, reject criteria that executed nothing, fold the newest verification round into the item's Remaining, and set the status reality supports. |

<!-- skills:end -->

## Develop this repository

```sh
mise install
mise run lint
mise run docs
bun test scripts/
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
