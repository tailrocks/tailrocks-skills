# Exact content movement — `tailrocks-audit` retirement

- Source revision: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- Assumption: `tailrocks-improve` owns audit/report only. Planning, execution, roadmap seeding, and backlog reconciliation are separate transactions. Pipeline-free plans live under `plans/`; parentless `roadmap/<slug>/plan/` packages cease to exist.
- Replacement skills and the route-only alias ship in `v0.28.0`; the alias is removed exactly in `v1.0.0` after the evidence conditions below pass.

## Invocation routing

| Old invocation | Exact target |
|---|---|
| default, `quick`, non-security `<category>`, `--batch` | `tailrocks-improve` |
| whole-repository `--deep` | `tailrocks-improve-deep` |
| `security` or `security --deep` | `tailrocks-improve-security` |
| non-security `<category> --deep` | `tailrocks-improve-deep <category>`; platform-design categories use their medium audit/review with `--deep` |
| `branch [category]` | `tailrocks-review-pr <branch/range> [aspects]` |
| `branch [category] --deep` | `tailrocks-review-pr <branch/range> [aspects] --deep`; same report oracle, exhaustive changed-package coverage and independent refutation |
| `next` | `tailrocks-research "What candidate product directions follow from this repository's evidence and history?"` |
| `next --deep` | Same research question with `--deep`; parallel investigators must return competing directions and trade-offs |
| `ask <question>` | `tailrocks-research <question>` |
| `ask <question> --deep` | `tailrocks-research <question> --deep` |
| design-conformance `ask` | `tailrocks-web-design-audit`, `tailrocks-tui-design-audit`, or `tailrocks-macos-design-review` |
| `plan <description>` | `tailrocks-improve-plan <description>` |
| `plan <description> --deep` | `tailrocks-improve-plan <description> --deep`; second cold reviewer required |
| seed selected finding into delivery | `tailrocks-seed-roadmap <finding>` |
| `execute <plan>` | `tailrocks-improve-execution <plan>` |
| `execute <plan> --deep` | `tailrocks-improve-execution <plan> --deep`; second independent diff review required |
| `sweep` over `plans/` | `tailrocks-improve-reconcile` |
| `sweep --deep` over `plans/` | `tailrocks-improve-reconcile --deep`; reverify every row |
| `sweep` over `roadmap/<slug>/` | `tailrocks-reconcile <slug>` |
| `sweep --deep` over `roadmap/<slug>/` | `tailrocks-reconcile <slug> --deep`; reverify every row |
| Any valid route plus `--batch` | Same target plus non-interactive selection; no downstream mutation beyond that target's authority |
| `quick --deep` | Refuse as mutually exclusive and print both valid alternatives |

## `SKILL.md`

| Current surface | Op | Exact target |
|---|---:|---|
| Frontmatter/name/arguments | KEEP | Temporary deprecated `skills/tailrocks-audit/SKILL.md` route-only alias |
| Introduction: cold recon, verified findings, leverage | MOVE | `skills/tailrocks-improve/SKILL.md` purpose/output |
| “seeded as roadmap items or plan packages” and combined execution routing | DELETE | Replaced by explicit improve-plan/seed-roadmap/execution handoffs |
| Source-write matrix | MOVE | Read-only audit → `skills/tailrocks-improve/SKILL.md`; roadmap write → `skills/tailrocks-seed-roadmap/SKILL.md`; disposable worktree → `skills/tailrocks-improve-execution/SKILL.md` |
| Default/quick/non-security-category modes | MOVE | `skills/tailrocks-improve/SKILL.md` arguments |
| Whole-repository `--deep` audit lane | MOVE | `skills/tailrocks-improve-deep/SKILL.md` |
| Security category/deep-security lane | MOVE | `skills/tailrocks-improve-security/SKILL.md` |
| `--deep` ask/plan/execute/sweep variants | MOVE | `skills/tailrocks-research/SKILL.md`, `skills/tailrocks-improve-plan/SKILL.md`, `skills/tailrocks-improve-execution/SKILL.md`, `skills/tailrocks-improve-reconcile/SKILL.md` respectively |
| `--batch` | MOVE | `skills/tailrocks-improve/SKILL.md` selection policy only; downstream writes require explicit skill |
| `branch`, `next`, `ask`, `plan`, `execute`, `sweep` | MOVE | Exact owners in invocation table |
| Read-only source boundary | MOVE | `skills/tailrocks-improve/SKILL.md` |
| Secret handling | COPY | `skills/tailrocks-improve/SKILL.md`, `skills/tailrocks-research/SKILL.md`, `skills/tailrocks-improve-plan/SKILL.md`, `skills/tailrocks-seed-roadmap/SKILL.md` |
| “Just implement” refusal | MOVE | `skills/tailrocks-improve/SKILL.md`, naming `skills/tailrocks-improve-execution/SKILL.md` handoff |
| Untrusted repository/finding chain | COPY | `skills/tailrocks-improve/SKILL.md`, `skills/tailrocks-improve-plan/SKILL.md`, `skills/tailrocks-seed-roadmap/SKILL.md` |
| Intent-document ingestion | COPY | `skills/tailrocks-improve/SKILL.md`, `skills/tailrocks-research/SKILL.md` |
| Step 1 recon | MOVE | `skills/tailrocks-improve/SKILL.md` |
| Proven-command requirement | COPY | `skills/tailrocks-improve-plan/SKILL.md` precondition |
| Generic lane work, adversarial re-read, prioritization, verified output gate | MOVE | `skills/tailrocks-improve/SKILL.md` + generated `skills/tailrocks-improve/references/repository-audit-lanes.md` |
| Direction exploration and direction/defect separation | MOVE | `skills/tailrocks-research/SKILL.md` |
| Web/TUI/macOS blessed-design judgment | MOVE | `skills/tailrocks-web-design-audit/SKILL.md`, `skills/tailrocks-tui-design-audit/SKILL.md`, `skills/tailrocks-macos-design-review/SKILL.md`, and corresponding visual-verification owners |
| `ask` special workflow | MOVE | `skills/tailrocks-research/SKILL.md`; remove audit-specific seeding |
| Fresh verifier under deep | COPY | `skills/tailrocks-improve-deep/SKILL.md` and `skills/tailrocks-improve-plan/SKILL.md` |
| Rejection storage as audit commits | DELETE | `plans/README.md` rejected-finding ledger; no empty audit commit |
| Batch routing decision | MOVE | `skills/tailrocks-improve/SKILL.md`; returns deterministic selection only |
| Size/risk destination decision | MOVE | `skills/tailrocks-improve/references/finding-routing.md`; writes go to `skills/tailrocks-improve-plan/SKILL.md` or `skills/tailrocks-seed-roadmap/SKILL.md` |
| Step 6 execute and executor done-criteria gate | MOVE | `skills/tailrocks-improve-execution/SKILL.md` |
| Item-backed sweep and independently fixed DRAFT retirement | MOVE | `skills/tailrocks-reconcile/SKILL.md` |
| Parentless sweep | MOVE | `skills/tailrocks-improve-reconcile/SKILL.md` after conversion to `plans/` |
| Delivery git contract/item branch/PR/trailer | MOVE | `skills/tailrocks-seed-roadmap/SKILL.md`; trailer becomes `Tailrocks-Skill: tailrocks-seed-roadmap` |
| Parentless base-branch package clause | DELETE | Improve-plan uses `plans/` and inherits improve no-commit contract |
| Execute worktree exception | MOVE | `skills/tailrocks-improve-execution/SKILL.md` |
| Roadmap write restriction | MOVE | `skills/tailrocks-seed-roadmap/SKILL.md` |
| `## Final gate` lines 192-199: verified-finding/skipped-lane/secret clauses | MOVE | `skills/tailrocks-improve/SKILL.md` |
| Same final gate: direction clauses | MOVE | `skills/tailrocks-research/SKILL.md` |
| Same final gate: roadmap writes | MOVE | `skills/tailrocks-seed-roadmap/SKILL.md` |
| Same final gate: executor criteria | MOVE | `skills/tailrocks-improve-execution/SKILL.md` |

## `references/audit-lanes.md`

| Current surface | Op | Exact target |
|---|---:|---|
| Introduction, lane brief, correctness/performance/tests/debt/dependencies/DX/docs, objective UX, agent legibility, candidate schema, re-read rule, prioritization | MOVE | Authored `shared/references/repository-audit-lanes.md`; generated local copy at `skills/tailrocks-improve/references/repository-audit-lanes.md` |
| Security lane | MOVE | `skills/tailrocks-improve-security/references/security-rubric.md` |
| Direction lane | MOVE | Generated `skills/tailrocks-research/references/repository-direction-lane.md`, sourced from `shared/references/repository-audit-lanes.md` |
| Secret/untrusted-text clauses | COPY | `skills/tailrocks-research/references/investigator-boundary.md`, `skills/tailrocks-improve-plan/references/artifact-boundary.md`, `skills/tailrocks-seed-roadmap/references/artifact-boundary.md` |
| Blessed web conformance | MOVE | `skills/tailrocks-web-design-audit/SKILL.md` and `skills/tailrocks-web-visual-qa/SKILL.md` |
| Terminal UI conformance | MOVE | `skills/tailrocks-tui-design-audit/SKILL.md` and `skills/tailrocks-tui-design/SKILL.md` golden verification |
| Liquid Glass conformance | MOVE | `skills/tailrocks-macos-design-review/SKILL.md` and `skills/tailrocks-macos-visual-qa/SKILL.md` |
| “Absent roadmap is not a defect” | COPY | `skills/tailrocks-seed-roadmap/references/duplicate-guard.md` and `skills/tailrocks-reconcile/references/retirement.md` |
| Quick/deep/category | MOVE | `skills/tailrocks-improve/SKILL.md`, `skills/tailrocks-improve-deep/SKILL.md`, or `skills/tailrocks-improve-security/SKILL.md` per invocation table |
| Branch | MOVE | `skills/tailrocks-review-pr/SKILL.md` route only; do not copy lane brief because review-pr already owns its method |
| Ask | MOVE | `skills/tailrocks-research/SKILL.md` |
| Fix-risk downstream routing | COPY | `skills/tailrocks-improve-plan/references/eligibility.md` and `skills/tailrocks-seed-roadmap/references/eligibility.md` |
| “Quoted content stays quoted” | COPY | Generated local boundary references in improve, improve-plan, and seed-roadmap |
| Audit-trailer rejection history | DELETE | Replace with improve-family rejected-finding ledger; no audit empty commits |

## `references/execution-loop.md`

| Current surface | Op | Exact target |
|---|---:|---|
| Entire file | MOVE | `skills/tailrocks-improve-execution/references/execution-loop.md` |
| Intro/prove boundary | MOVE | Preserve inside `skills/tailrocks-improve-execution/references/execution-loop.md`, rewriting plan source as `plans/NNN-*.md`; prove distinction remains only after roadmap seeding |
| Model routing, dispatch, tech-lead review, worktree hygiene | MOVE | `skills/tailrocks-improve-execution/references/execution-loop.md` |
| `tailrocks-plan` references and `goal/check.sh` requirement | DELETE | Use improve-plan stamped commit and deterministic done-criteria manifest |
| Blocked-plan routes | MOVE | Defective plan → `skills/tailrocks-improve-plan/SKILL.md`; status truth → `skills/tailrocks-improve-reconcile/SKILL.md` |

## `references/plan-seeding.md`

| Current surface | Op | Exact target |
|---|---:|---|
| Hybrid item-folder premise | DELETE | No parentless roadmap plan package |
| Size test and finding-to-fixer routing | MOVE | `skills/tailrocks-improve/references/finding-routing.md` |
| Low-risk mechanical route | MOVE | `skills/tailrocks-improve-plan/SKILL.md` |
| Product question/direction/high risk | MOVE | `skills/tailrocks-seed-roadmap/SKILL.md` |
| Direct parentless roadmap plan procedure | DELETE | Replace with current `plans/` format owned by improve-plan |
| Verified commands, out-of-scope, STOP, quoted starting evidence | COPY | `skills/tailrocks-improve-plan/references/plan-format.md` |
| `goal/`, fingerprint, proof syntax, parentless status substitutions | DELETE | Roadmap-only mechanics do not enter pipeline-free plans |
| Cold review | MOVE | `skills/tailrocks-improve-plan/SKILL.md` |
| Roadmap item seeding | MOVE | `skills/tailrocks-seed-roadmap/references/item-seeding.md` |
| “Absence is delivery” | COPY | `skills/tailrocks-seed-roadmap/references/duplicate-guard.md` and `skills/tailrocks-reconcile/references/retirement.md` |
| Fixed-independently DRAFT retirement | MOVE | `skills/tailrocks-reconcile/SKILL.md` |
| Blessed-screen routing | MOVE | `shared/references/design-pipeline.md`, generated into each medium owner |

## Eval and fixture movement

| Old ID | Op | Exact target | Fixture |
|---:|---:|---|---|
| 1 | MOVE | `skills/tailrocks-improve/evals/evals.json` generic audit/non-finding case | `skills/tailrocks-audit/evals/fixtures/1/src/orders.ts` → `skills/tailrocks-improve/evals/fixtures/audit-orders/src/orders.ts` |
| 2 | MOVE | `skills/tailrocks-improve-plan/evals/evals.json` low-risk finding case | `skills/tailrocks-audit/evals/fixtures/2/src/cache.ts` → `skills/tailrocks-improve-plan/evals/fixtures/cache-plan/src/cache.ts` |
| 3 | MOVE | `skills/tailrocks-seed-roadmap/evals/evals.json` direction-refusal case | Add target-owned fixture if state assertion is claimed |
| 4 | MOVE | `skills/tailrocks-improve-execution/evals/evals.json` dispatch/review/no-merge case | Add runnable plan/worktree fixture |
| 5 | MOVE | `skills/tailrocks-improve/evals/evals.json` prior-decision rejection | `skills/tailrocks-audit/evals/fixtures/5/{roadmap/README.md,audit-history.txt}` → `skills/tailrocks-improve/evals/fixtures/audit-history/` |
| 6 | MOVE | `skills/tailrocks-macos-design-review/evals/evals.json` Liquid Glass case | `skills/tailrocks-audit/evals/fixtures/6/Sources/SettingsWindow.swift` → `skills/tailrocks-macos-design-review/evals/fixtures/settings-window/Sources/SettingsWindow.swift` |
| 7 | MOVE | `skills/tailrocks-improve-security/evals/evals.json` secret/injection trap | `skills/tailrocks-audit/evals/fixtures/7/src/session.ts` → `skills/tailrocks-improve-security/evals/fixtures/security-session/src/session.ts` |
| 8 | MOVE | `skills/tailrocks-improve/evals/evals.json` agent-legibility case | `skills/tailrocks-audit/evals/fixtures/8/{package.json,src/svc.ts}` → `skills/tailrocks-improve/evals/fixtures/agent-legibility/` |
| 9 | MOVE | `skills/tailrocks-improve/evals/evals.json` fresh-taste routing case | No current fixture |
| 10 | MOVE | `skills/tailrocks-improve-deep/evals/evals.json` exhaustive named-lane case | Add multi-lane evidence fixture |
| 11 | COPY | Improve batch-selection and improve-plan hostile-evidence cases | Copy `skills/tailrocks-audit/evals/fixtures/11/src/retry.ts` to target-specific fixture trees; use different oracles |
| 12 | MOVE | `skills/tailrocks-improve-reconcile/evals/evals.json` parentless truth-sync | `skills/tailrocks-audit/evals/fixtures/12/**` → `skills/tailrocks-improve-reconcile/evals/fixtures/parentless-sweep/**` |
| 13 | COPY | Research direction/history and seed-roadmap delivered-slug cases | Copy `skills/tailrocks-audit/evals/fixtures/13/**` to both target fixture trees |
| 14 | MOVE | `skills/tailrocks-reconcile/evals/evals.json` fixed-independently DRAFT case | Add DRAFT item/index/history fixture |

Coverage added before removal: review-pr branch diff; generic research question; runnable improve-execution plan/worktree; reconcile DRAFT retirement.

## Alias and removal

The compatibility `tailrocks-audit` package contains only the invocation map and route-only evals for the complete valid mode/modifier matrix above: default/quick, every category class, bare deep, every valid `<mode> --deep`, every valid `branch <category> --deep`, and `--batch` composed with each route. Add refusal cases for `quick --deep` and malformed/multiple primary modes. Every case asserts one exact replacement command plus preserved deeper-operation clause and zero mutation. The alias reports that command and stops; it never reads the repository or silently invokes another manual skill.

| Alias surface | Op | Exact target/removal |
|---|---:|---|
| `skills/tailrocks-audit/SKILL.md` | KEEP | Deprecated route-only alias from `v0.28.0` through the last `v0.x` release |
| `skills/tailrocks-audit/evals/evals.json` | DELETE | Replace during window with route-only alias cases listed above |
| `skills/tailrocks-audit/agents/openai.yaml` | KEEP | During window display `Tailrocks: Audit (deprecated)` and prompt only for migration command |
| `skills/tailrocks-audit/README.md` and generated docs/catalog/install/choosing rows | KEEP | Regenerate as deprecated routing documentation during window |
| Entire `skills/tailrocks-audit/` directory and all generated/catalog rows | DELETE | Delete together in `v1.0.0` after the five removal conditions below |

Remove only when:

1. All 14 old behaviors have direct target coverage and the target-derived reliability gate passes.
2. The four coverage gaps above are closed.
3. At least one published `v0.28.x` release carried the alias.
4. `rtk rg -n "tailrocks-audit"` finds only alias/migration-history material.
5. No compatibility-period commit uses `Tailrocks-Skill: tailrocks-audit`.
