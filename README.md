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
Use tailrocks-typescript-review on src/auth/.
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
| [`tailrocks-graphql-best-practices`](skills/tailrocks-graphql-best-practices/README.md) | Apply public GraphQL API policy when in-scope work evolves schema, Juniper resolvers, SDL, pagination, or generated clients. | Model policy |
| [`tailrocks-graphql-review`](skills/tailrocks-graphql-review/README.md) | Review a GraphQL diff or audit a public API surface without editing. | Manual only |
| [`tailrocks-grpc-best-practices`](skills/tailrocks-grpc-best-practices/README.md) | Apply cross-service gRPC policy when in-scope work evolves proto or Buf contracts, tonic/prost services, status mapping, deadlines, streaming, health, or wire tests. | Model policy |
| [`tailrocks-grpc-review`](skills/tailrocks-grpc-review/README.md) | Review a gRPC diff or audit a cross-service surface without editing. | Manual only |

### TypeScript and TanStack

The Bun-only application baseline and strict TypeScript policy.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-tanstack-project-setup`](skills/tailrocks-tanstack-project-setup/README.md) | Scaffold a new Bun-only TanStack Start application with TypeScript 7, Oxc, Router/Query, shadcn/ui, Tailwind CSS v4, tests, and CI. | Manual only |
| [`tailrocks-tanstack-project-audit`](skills/tailrocks-tanstack-project-audit/README.md) | Audit an existing Bun/TanStack Start application baseline read-only: layout, versions, tooling, boundaries, Router/Query ownership, shadcn/Tailwind, tests, and CI. | Manual only |
| [`tailrocks-tanstack-project-migrate`](skills/tailrocks-tanstack-project-migrate/README.md) | Migrate an existing frontend application to the Bun-only TanStack Start baseline in never-broken, rollback-safe slices while preserving observable behavior. | Manual only |
| [`tailrocks-tanstack-project-remediate`](skills/tailrocks-tanstack-project-remediate/README.md) | Close exact approved TANSTACK gap-ledger rows in an existing house-stack application, using canonical references and templates in verified transactional slices. | Manual only |
| [`tailrocks-typescript-best-practices`](skills/tailrocks-typescript-best-practices/README.md) | Apply strict TypeScript 7 and React language/UI policy when writing in-scope code involving state, runtime validation, typed failure, readonly APIs, or async ownership. | Model policy |
| [`tailrocks-typescript-review`](skills/tailrocks-typescript-review/README.md) | Review TypeScript 7 and React code read-only for invalid state, unvalidated input, hidden failure, unsafe mutation, async leaks, React contract defects, and duplicated Rust business logic. | Manual only |
| [`tailrocks-typescript-refactor`](skills/tailrocks-typescript-refactor/README.md) | Refactor TypeScript 7 and React code while preserving observable behavior, public types, errors, state transitions, rendering, accessibility, async effects, and Rust/GraphQL boundaries. | Manual only |
| [`tailrocks-typescript-migrate`](skills/tailrocks-typescript-migrate/README.md) | Migrate TypeScript or JavaScript source contracts to strict TypeScript 7 semantics in compatibility-safe slices after Bun/TanStack project tooling is established. | Manual only |

### Native macOS

The Swift implementation stack: code-level policy and the agent-drivable project baseline.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/README.md) | Apply Swift code policy when writing in-scope Swift, SwiftUI, concurrency, state ownership, accessibility, availability, or narrow AppKit bridges. | Model policy |
| [`tailrocks-swift-review`](skills/tailrocks-swift-review/README.md) | Review Swift, SwiftUI, concurrency, accessibility, availability, errors, and narrow AppKit bridges read-only. | Manual only |
| [`tailrocks-swift-refactor`](skills/tailrocks-swift-refactor/README.md) | Refactor Swift and SwiftUI code under a preservation oracle while retaining behavior, public API, isolation, cancellation, state identity, rendering, accessibility, errors, availability, and bridge lifecycles. | Manual only |
| [`tailrocks-swift-rust-core-boundary`](skills/tailrocks-swift-rust-core-boundary/README.md) | Design, implement, or review the thin SwiftUI platform shell over a Rust-owned application runtime: generated FFI, immutable view state, typed actions, durable Apple effects, and one main-actor store. | Manual only |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/README.md) | Scaffold a new strict native macOS Swift baseline: declarative generation, deployment and SDK lanes, local signing, strict format/lint gates, tests, and mise-owned command parity. | Manual only |
| [`tailrocks-swift-project-audit`](skills/tailrocks-swift-project-audit/README.md) | Audit an existing native macOS Swift project baseline read-only: generation, pins and SDK lanes, signing, strict gates, tests, derived data, and command parity. | Manual only |
| [`tailrocks-swift-project-remediate`](skills/tailrocks-swift-project-remediate/README.md) | Close exact approved SWIFT-PROJECT gap-ledger rows in an existing native macOS project using canonical references and templates in transactional buildable slices. | Manual only |
| [`tailrocks-swift-agent-integration`](skills/tailrocks-swift-agent-integration/README.md) | Wire a native Swift/Xcode project for agent-driven build, test, preview, and UI work while preserving one owner per responsibility and pinning third-party knowledge read-only. | Manual only |
| [`tailrocks-swift-rust-core-setup`](skills/tailrocks-swift-rust-core-setup/README.md) | Add the project-level Rust-core lane to a native Swift app: one-way generated bindings, isolated bridge packages, binding-drift proof, and Rust gates in the shared pipeline. | Manual only |

### Design and prototypes

One design skill per platform — macOS, web, terminal — each producing a blessed reference rendered by the real substrate, plus the capture loops that freeze it.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-macos-design`](skills/tailrocks-macos-design/README.md) | Apply macOS visual-design and Liquid Glass policy when in-scope work touches native screen structure, material, component mapping, or a runnable prototype. | Model policy |
| [`tailrocks-macos-design-review`](skills/tailrocks-macos-design-review/README.md) | Score an existing macOS screen, window, or prototype against the native-design and Liquid Glass contract. | Manual only |
| [`tailrocks-macos-design-systematize`](skills/tailrocks-macos-design-systematize/README.md) | Turn one user-approved macOS design and independent review into reusable product design-system records. | Manual only |
| [`tailrocks-web-design`](skills/tailrocks-web-design/README.md) | Apply web visual-design policy when in-scope work touches TanStack screens, design routes, shadcn/ui composition, or visual fixtures. | Model policy |
| [`tailrocks-web-design-audit`](skills/tailrocks-web-design-audit/README.md) | Audit an existing TanStack design-route package or shipped web screen against its blessed in-app reference. | Manual only |
| [`tailrocks-tui-design`](skills/tailrocks-tui-design/README.md) | Apply terminal visual-design policy when in-scope work touches ratatui screens, terminal UX, fixture galleries, or golden frames. | Model policy |
| [`tailrocks-tui-design-audit`](skills/tailrocks-tui-design-audit/README.md) | Audit a ratatui gallery, golden-frame package, or shipped terminal screen against its blessed contract. | Manual only |
| [`tailrocks-macos-visual-baseline`](skills/tailrocks-macos-visual-baseline/README.md) | Freeze or explicitly re-freeze one blessed native macOS prototype into a reproducible full-matrix baseline package. | Manual only |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/README.md) | Verify a native macOS app's current render through owned window-ID capture, accessibility-tree interaction, the restored state matrix, and app-scoped accessibility audit. | Manual only |
| [`tailrocks-macos-visual-regression`](skills/tailrocks-macos-visual-regression/README.md) | Compare current native macOS running-window captures against one approved baseline package with environment, structural-region, and pixel-budget gates. | Manual only |
| [`tailrocks-web-visual-qa`](skills/tailrocks-web-visual-qa/README.md) | Freeze and regress Playwright screenshot baselines for TanStack design routes and pages: the capture matrix per state, theme, and viewport — only from a finalized, blessed design. | Manual only |

### Code quality and contribution

Debt that shrinks, defects that stop recurring, skills that improve from field evidence, and work on repositories you do not own.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-code-health`](skills/tailrocks-code-health/README.md) | Establish or tighten one explicitly approved shrink-only code-health ratchet for architecture, lint, dependency, flake, defect, documentation, or verification debt. | Manual only |
| [`tailrocks-code-health-audit`](skills/tailrocks-code-health-audit/README.md) | Audit one code-health debt class read-only: inventory gates and exceptions, measure the baseline, evaluate shrink-only enforcement and verification placement, and emit fixed-ID evidence without installing or editing. | Manual only |
| [`tailrocks-improve`](skills/tailrocks-improve/README.md) | Audit a repository read-only with bounded parallel non-security lanes, adversarially verify every candidate, and return one evidence-ranked report. | Manual only |
| [`tailrocks-improve-deep`](skills/tailrocks-improve-deep/README.md) | Audit a whole repository or one non-security category exhaustively through read-only lanes and fresh independent refutation, returning one verified report and no artifacts. | Manual only |
| [`tailrocks-improve-security`](skills/tailrocks-improve-security/README.md) | Perform one read-only repository security audit with bounded threat analysis, secret-safe evidence, adversarial verification, and an optional deep fresh refutation pass. | Manual only |
| [`tailrocks-improve-plan`](skills/tailrocks-improve-plan/README.md) | Convert one selected verified finding or described change into one standalone executor-ready plan under plans/ and its index row. | Manual only |
| [`tailrocks-improve-execution`](skills/tailrocks-improve-execution/README.md) | Execute one approved standalone plans/ file in an isolated disposable worktree, re-run its criteria, independently review the diff, and return one verdict. | Manual only |
| [`tailrocks-improve-reconcile`](skills/tailrocks-improve-reconcile/README.md) | Reconcile the standalone plans/ backlog against current repository truth, optionally re-verifying every row, and update only plans/README.md. | Manual only |
| [`tailrocks-agents-md`](skills/tailrocks-agents-md/README.md) | Apply agent-instruction topology policy when in-scope work touches AGENTS.md, client symlinks, instruction rules, or rule placement. | Model policy |
| [`tailrocks-agents-md-audit`](skills/tailrocks-agents-md-audit/README.md) | Audit all repository instruction files read-only for placement, duplicate content, deletion evidence, topology, load cost, and enforceable-rule routing. | Manual only |
| [`tailrocks-agents-md-sync`](skills/tailrocks-agents-md-sync/README.md) | Apply one explicitly approved instruction-topology repair from a current audit: create or repair client symlinks, relocate or delete approved rules, and verify exact parity. | Manual only |
| [`tailrocks-retrospect`](skills/tailrocks-retrospect/README.md) | After a roadmap item ships, rebuild which skills ran from commit trailers, diff that against its Decisions, Must not, spec IDs, and verification rounds, and propose patches to the skills at fault. | Manual only |
| [`tailrocks-simplify`](skills/tailrocks-simplify/README.md) | Apply one explicitly approved set of measured code removals within a bound diff while preserving every observable behavior. | Manual only |
| [`tailrocks-simplify-audit`](skills/tailrocks-simplify-audit/README.md) | Audit one pull request, branch, or diff read-only for measured code removals whose observable behavior can be preserved. | Manual only |
| [`tailrocks-root-cause`](skills/tailrocks-root-cause/README.md) | Diagnose one proven defect, reported friction, or failed guarantee read-only; derive the bounded causal class and strongest feasible corrective design. | Manual only |
| [`tailrocks-remediate`](skills/tailrocks-remediate/README.md) | Apply one explicitly approved root-cause correction while preserving every unapproved behavior and proving instance and defect-class prevention. | Manual only |
| [`tailrocks-contribute-recon`](skills/tailrocks-contribute-recon/README.md) | Reconnoiter one external open-source project and write a current local contribution contract. | Manual only |
| [`tailrocks-contribute-propose`](skills/tailrocks-contribute-propose/README.md) | Turn one current contribution recon into a locally stored venue proposal or hard-stop redirect. | Manual only |
| [`tailrocks-contribute-prepare`](skills/tailrocks-contribute-prepare/README.md) | Implement one approved external contribution in the user's dedicated fork clone and produce a local submission package. | Manual only |
| [`tailrocks-contribute-submit`](skills/tailrocks-contribute-submit/README.md) | Submit one current prepared external contribution through exact separately approved legal, push, and PR actions. | Manual only |
| [`tailrocks-contribute-respond`](skills/tailrocks-contribute-respond/README.md) | Handle one submitted contribution's current review round through approved local fixes and separately approved remote actions. | Manual only |

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

Open, refresh, review, document, and merge pull requests in any repository, extended by its .tailrocks/pr.md.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-create-pr`](skills/tailrocks-create-pr/README.md) | Open a pull request for the current change in any repository: branch, commit in the repo's convention, body from its template, render check. | Manual only |
| [`tailrocks-refresh-pr`](skills/tailrocks-refresh-pr/README.md) | Reconcile an open pull request's title and body against the current diff: drifted prose rewritten, accurate prose kept verbatim, template sections re-selected. | Manual only |
| [`tailrocks-review-pr`](skills/tailrocks-review-pr/README.md) | Review a pull request, branch, or diff and report verified findings: adversarially validated bugs, structural regressions, triggered specialist lanes, and fixer routes. | Manual only |
| [`tailrocks-merge-pr`](skills/tailrocks-merge-pr/README.md) | Merge a pull request fail-closed in any repository: CI and documentation gates, blast-radius confirm, metadata reconcile, repo-selected merge method, the repo's pre-merge worklist from .tailrocks/pr.md. | Manual only |
| [`tailrocks-document`](skills/tailrocks-document/README.md) | Before a pull request merges, make the repository's own documentation the final source of truth for everything the diff changed — rewritten pages and new structures, never a changelog. | Manual only |
| [`tailrocks-pr-template`](skills/tailrocks-pr-template/README.md) | Generate a repository's .github/PULL_REQUEST_TEMPLATE.md: tailor this skill's base template to the repo's structure, gates, and merged-PR history so every section and verify block is earned. | Manual only |

### Roadmap and delivery

An idea through shaping, planning, autonomous execution, and back to verified truth.

| Skill | What it does | Invocation |
|---|---|---|
| [`tailrocks-audit`](skills/tailrocks-audit/README.md) | Cold-start audit of a repository or branch with no backlog yet: verified findings, prioritized, seeded as roadmap items or plans. | Manual only |
| [`tailrocks-seed-roadmap`](skills/tailrocks-seed-roadmap/README.md) | Convert one already-verified finding or approved standalone plan into one roadmap DRAFT item on its delivery branch and pull request. | Manual only |
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
