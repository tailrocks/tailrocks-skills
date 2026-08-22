# Audit migration execution plan

- Plan status: `ACTIVE`
- Audited source SHA: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- Last reconciled: `2026-08-22`
- Scope: skill contracts, ownership, invocation policy, deterministic tooling,
  compatibility aliases, documentation, and generated client surfaces
- Completion marker: `NOT COMPLETED`

This file is the sole execution and progress authority. The source reports
provide evidence only; they cannot add work, change ordering, or override an
exclusion:

- [portfolio responsibility map](portfolio-responsibility-map.md)
- [stack and authoring movement](content-movement-stack-authoring.md)
- [design and pull-request movement](content-movement-design-pr.md)
- [audit retirement movement](content-movement-audit-retirement.md)
- per-skill `tailrocks-*.md` reports in this directory

The earlier [invocation proposal](invocation-policy.md) is superseded wherever
it conflicts with the confirmed matrix below.

## Authority and exclusions

- Model selection of a skill grants no new write, mutation, blessing, commit,
  push, release, external-message, or external-system authority.
- The paths in [the immutable protected-path manifest](protected-paths.txt) are
  frozen at the audited source SHA. Do not create, edit, move, delete, run, or
  certify anything in them. Rows in linked reports that target those paths are
  excluded from this plan.
- Add a mechanical `protected-paths:check` in P01. It must read that manifest;
  it may not invent, narrow, or broaden the protected scope.
- Release publication, tags, pushes, pull requests, and deletion of legacy
  directories containing protected paths are outside this goal. Keep those
  directories as route-only compatibility surfaces. A later user-authorized
  plan may remove them.
- Preserve unrelated worktree changes. Never reset, overwrite, stash, or commit
  them.
- Do not commit, push, tag, publish, merge, or post externally unless the user
  separately grants that authority. If commit authority is later granted, use
  `git commit -s` and add `Co-authored-by: Codex <codex@openai.com>`.

## Confirmed invocation matrix

`MODEL_POLICY` means the model loads the skill under an exact trigger. The
skill remains constrained by the active task's authority. Direct-command
visibility is best-effort across clients; model discovery takes precedence
where one shared metadata file cannot guarantee both.

Current `MODEL_POLICY` owners:

- `tailrocks-rust-best-practices`
- `tailrocks-axum-best-practices`
- `tailrocks-graphql-best-practices`
- `tailrocks-grpc-best-practices`
- `tailrocks-typescript-best-practices`
- `tailrocks-swift-best-practices`
- `tailrocks-grilling`
- `tailrocks-agents-md`
- `tailrocks-macos-design`
- `tailrocks-web-design`
- `tailrocks-tui-design`

Exact trigger boundaries:

- Best-practice owners load only when their language, framework, or protocol is
  already in scope.
- `tailrocks-grilling` loads when the user asks to be grilled, challenged,
  interrogated, or stress-tested before action. It is conversation-only, finds
  facts itself, leaves decisions to the user, and never starts implementation.
- `tailrocks-agents-md` loads when instruction rules or instruction-file
  topology are in scope. Selection alone never authorizes add/sync mutation.
- The macOS, web, and terminal design owners load when their matching visual
  medium is in scope. Selection alone never authorizes blessing, freezing,
  capture, or production mutation.
- Visual-verification owners remain `MANUAL_ONLY`; they are not design owners.
- Every owner not named in the exact eleven-skill list above remains
  `MANUAL_ONLY`. New split descendants never inherit invocation class; each
  requires separate user confirmation before entering `MODEL_POLICY`.

## Progress protocol

Every actionable row has one stable ID and one status marker:

- `[ ] [TODO]` — ready when dependencies are complete.
- `[ ] [IN_PROGRESS]` — exactly one row may hold this status.
- `[ ] [BLOCKED: reason]` — evidence says work cannot proceed safely.
- `[ ] [STALE: reason]` — source drift invalidated the package.
- `[x] [COMPLETED]` — done condition passed and an evidence receipt is appended.

Execution loop:

1. Re-read this file, governing instruction files, `git status`, and the active
   row before every work period or resumed goal turn.
2. If one row is `[IN_PROGRESS]`, inspect its diff and receipt and resume that
   row. Multiple in-progress rows are invalid and stop execution.
3. Otherwise choose the first `[TODO]` row in strict order. Packages run
   P01→P11; numbered rows run in numeric order; each package gate depends on all
   numbered rows in that package; the next package depends on the prior gate.
   Change the selected row to `[IN_PROGRESS]` before implementation.
4. Use subagents for every skill analysis. Prefer bounded parallel subagents for
   independent read-only recon, disjoint implementation packages, and
   fresh-context review. The primary agent alone edits this plan and shared
   registry/catalog/generated surfaces.
5. Work only that row's scope. A discovered requirement is not silently added;
   record it as `[BLOCKED: scope decision required]` and ask the user.
6. Run the row's named deterministic checks. Empty or zero-work output is not
   proof.
7. Change the row to `[x] [COMPLETED]` only after appending an evidence receipt:
   changed paths, commands, nonzero counts, and reviewer verdict.
8. Run each package gate before entering the next package. Regenerate derived
   surfaces inside the package that changed their source, never in a distant
   cleanup pass.
9. On source drift, mark the active row `[STALE: reason]`, re-open its cited
   evidence, and reconcile before continuing.

The goal is finished only when no unchecked box or non-completed status remains,
all terminal checks pass, and the final literal marker is changed to
`AUDIT MIGRATION: COMPLETED`.

## P01 — Make the migration mechanically safe

- [x] [COMPLETED] P01.01 Add a fail-closed invocation registry with exactly two
  classes, `MANUAL_ONLY` and `MODEL_POLICY`; unknown owners, duplicates, and
  crossed client metadata fail validation.
  - Evidence receipt (2026-08-22): changed `invocation-registry.json`,
    `scripts/validate-skills.ts`, and `scripts/validate-skills.test.ts`.
    `rtk bun test scripts/validate-skills.test.ts` passed 36 tests with 49
    assertions; the non-protected root registry check proved 43 sorted,
    exhaustive `MANUAL_ONLY` owners; targeted Oxfmt and `rtk git diff --check`
    passed. Fresh subagent verdict: PASS after correction of fail-closed
    `MODEL_POLICY` Claude metadata handling. Protected paths unchanged; no evals
    run.
- [x] [COMPLETED] P01.02 Add `scripts/check-protected-paths.ts` and unit tests that
  detect tracked, staged, untracked, moved, or deleted protected paths against
  the audited source SHA.
  - Evidence receipt (2026-08-22): added `scripts/check-protected-paths.ts`,
    `scripts/check-protected-paths.test.ts`, and `mise.toml` task
    `protected-paths:check`. Targeted Bun tests passed 9 tests with 21
    assertions across committed, staged, worktree, cancellation, ignored
    untracked, move, delete, unsafe-index, manifest-lock, and per-pattern cases.
    Live receipt proved manifest SHA-256, 4 patterns, 183 source paths
    (`180+1+1+1`), and zero violations; Oxfmt and diff check passed. Fresh
    subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P01.03 Decouple ordinary skill validation, scaffolding, authoring
  doctrine, and generated-surface checks from mandatory files in the protected
  tree; preserve the existing tree byte-for-byte.
  - Evidence receipt (2026-08-22): ordinary validator, scaffold, authoring
    routers/doctrine, published guidance, test/CI/format entrypoints, and
    generated surfaces were detached from the frozen legacy runtime; the
    non-protected scaffold eval template was removed. `rtk mise run ci`
    validated 43 skills, checked 133 generated files, and passed 84 tests with
    294 assertions across 9 explicitly selected non-protected test files;
    Oxfmt checked 31 files and diff check passed. Live protection receipt
    proved all 183 source paths unchanged. Fresh subagent verdict: PASS. No
    evals run or protected contents inspected.
- [x] [COMPLETED] P01.04 Add `mise run migration-check`: protected-path check,
  ownership/invocation validation, documentation drift check, formatting, and
  deterministic Bun unit/integration tests outside the protected runtime.
  - Evidence receipt (2026-08-22): added ordered fail-closed
    `migration-check` plus `scripts/run-migration-tests.ts` and tests. The
    selector shares immutable-manifest validation, enumerates filenames only,
    excludes protected paths from the manifest, sorts, refuses zero, and emits
    its selected-file receipt. `rtk mise run migration-check` proved 4
    protected patterns/183 source paths/0 violations, 43 skills, 133 generated
    files, 33 formatted files, and 10 non-protected test files with 87 tests and
    297 assertions. Focused helper/checker tests passed 12 tests/24 assertions;
    diff check passed. Fresh subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P01.05 Add regression tests proving both invocation classes,
  description guards, Claude metadata, Codex metadata, OpenCode discovery/menu
  metadata, unknown registry entries, and accidental authority escalation.
  - Evidence receipt (2026-08-22): strengthened `scripts/validate-skills.ts` and
    `scripts/validate-skills.test.ts` with fail-closed class matrices for
    descriptions, Claude booleans, Codex booleans, stable OpenCode string-map
    metadata and unsupported discovery/menu claims, registry ownership, and
    zero-authority-gain. `MODEL_POLICY` rejects pre-approved tools, lifecycle
    hooks, inline dynamic commands, and fenced dynamic commands. Focused Bun
    validation passed 35 tests with 70 assertions; live validation covered 43
    skills; targeted Oxfmt and diff check passed. Protection proof covered 4
    patterns/183 source paths with zero violations. Fresh subagent verdict:
    PASS after correcting executable-hook/dynamic-command coverage and aligning
    OpenCode checks with the supported stable client. No evals run.
- [x] [COMPLETED] P01.06 Update the default authoring template and scaffold policy so
  manual-only stays fail-closed and a requested model-policy profile is explicit.
  - Evidence receipt (2026-08-22): updated the default authoring policy,
    create router/doctrine, scaffold implementation, focused tests, and 4
    generated documentation surfaces. Scaffolding defaults to parsed, exact
    `MANUAL_ONLY`; `MODEL_POLICY` requires the explicit invocation-class flag,
    exact convertible source, post-conversion verification, and zero executable
    or pre-approved authority. Optional registry wiring validates exact schema,
    updates owners in code-unit order, and shares a staged transaction with the
    catalog. Injected second-install failure proved byte-identical rollback,
    target removal, and no transaction leftovers. Focused scaffold/validator
    tests passed 43 tests with 212 assertions; live validation covered 43 skills;
    133 generated files checked; targeted Oxfmt and diff check passed.
    Protection proof covered 4 patterns/183 source paths with zero violations.
    Fresh subagent verdict: PASS after parser-spoof, unsafe-template,
    conversion, ordering, and partial-write corrections. No evals run.
- [x] [COMPLETED] P01.07 Add a plan-state checker that parses actionable rows only,
  rejects duplicate IDs or multiple in-progress rows, and implements the atomic
  P11 completion rule without matching explanatory status examples.
  - Evidence receipt (2026-08-22): added
    `scripts/check-audit-plan-state.ts`, 9 focused tests, and the ordered
    `audit-plan-state:check` migration phase. The checker fail-closes every
    visible top-level P-ID bullet into exact actionable grammar, ignores fenced
    and indented examples, owns receipts by row block, enforces unique IDs,
    checkbox/status parity, one active first-unresolved row, completed-prefix
    progress, exact pre-final state, and atomic P11.06/header/literal closure.
    All six partial closure permutations and malformed opener/checkbox/status/ID
    cases are covered. Focused tests passed 9 tests with 31 assertions; live
    progress proof parsed 121 actionable rows (7 completed with receipts, 114
    unchecked, 1 in progress) after this receipt; targeted Oxfmt and diff check
    passed. Protection proof covered 4 patterns/183 source paths with zero
    violations. Fresh subagent verdict: PASS after closing all malformed-row
    disappearance paths. No evals run.
- [x] [COMPLETED] P01.GATE Run `rtk mise run migration-check`; record command counts,
  protected-path proof, and a fresh subagent review.
  - Evidence receipt (2026-08-22): `rtk mise run migration-check` passed its
    ordered protected-path, plan-state, ownership/invocation, generated-doc,
    formatting, and deterministic non-protected test phases. It proved 4
    protected patterns, 183 frozen source paths, zero violations, 121 plan
    rows, 7 prior completed rows with receipts, 43 skills, 133 generated files,
    35 formatted files, and 11 selected non-protected test files with 108 tests
    and 493 assertions. `rtk git diff --check` passed. Fresh subagent verdict:
    PASS with no blocking architecture or receipt finding. Protected paths
    remained unchanged; no evals run.

## P02 — Establish direct migration authority and canonical doctrine

- [x] [COMPLETED] P02.01 Keep migration planning inside this execution plan; do
  not add a `tailrocks-skill-migration-plan` product skill.
  - Evidence receipt (2026-08-22): the user explicitly directed that every skill
    be migrated directly in this branch and pull request without a migration-plan
    skill. The uncommitted planner router, template, checker, evidence record,
    catalog/registry entry, and generated surfaces were removed; affected paths
    returned to the pushed P01 state. User verdict: direct migration required.
    Progress validation parsed 121 rows with 10 completed receipts and zero
    active rows after both direct-migration decisions. Fresh subagent verdict:
    PASS. Protected paths remained unchanged; no evals run.
- [x] [COMPLETED] P02.02 Keep migration execution in the ordered P02-P10 rows; do
  not add a `tailrocks-skill-migrate` product skill.
  - Evidence receipt (2026-08-22): the same explicit user direction authorizes
    this plan's primary agent to implement the listed skill migrations directly
    in the current branch and pull request. Strict row ordering, package gates,
    compatibility aliases, rollback-safe patches, receipts, commits, and pushes
    remain mandatory; no separate executor skill or migration artifact is
    created. User verdict: direct execution required. Fresh subagent verdict:
    PASS; strict next row is P02.03. Protected paths remained unchanged; no
    evals run.
- [x] [COMPLETED] P02.03 Create canonical authoring sources for operational contracts,
  responsibility topology, context routing, and house wiring.
  - Evidence receipt (2026-08-22): added the four authored authorities under
    `skill-authoring/references/` and changed the audit-local
    `design-doctrine.md` and `house-wiring.md` ownership claims to compatibility
    bundles without rewiring consumers early. Exact source sections preserve
    297 substantive doctrine lines across operational contract, responsibility
    topology, context routing, and house wiring. `rtk mise run migration-check`
    passed 108 tests with 493 assertions across 11 non-protected test files,
    validated 43 skills, checked 133 generated files, and checked 35 formatted
    files. Protection proof covered 4 patterns and 183 frozen source paths with
    zero violations; diff check passed. Fresh subagent preservation verdict:
    PASS with no blocking finding. No evals run.
- [x] [COMPLETED] P02.04 Create canonical shared sources for runtime trust, version
  policy, repository-audit lanes, design pipeline, contribution handoff, and
  pull-request conventions.
  - Evidence receipt (2026-08-22): added six authored policy sources under
    `shared/references/` with common policy separated from ecosystem, security,
    platform, stage, and owner-relative adapters. Added a deterministic source
    inventory/source-neutrality test; focused proof passed 3 tests with 33
    assertions. `rtk mise run migration-check` passed 111 tests with 526
    assertions across 12 non-protected test files, validated 43 skills, checked
    133 generated files, and checked 36 formatted files. Protection proof
    covered 4 patterns and 183 frozen source paths with zero violations; diff
    check passed. Fresh subagent scope/preservation verdict: PASS. No evals run.
- [x] [COMPLETED] P02.05 Add a generator manifest for every skill-local packaged copy
  and byte-validate each destination against its canonical source.
  - Evidence receipt (2026-08-22): added a strict 10-source manifest, ownership
    lock, and atomic generator/checker for 71 current skill-local destinations;
    raw-byte proof reported 71 byte-identical copies. Silent destination
    removal, malformed/case-colliding/escaping paths, symlinks, drift, partial
    installs, failed rollback, and failed cleanup are fail-closed with retained
    recovery backups. Generated-reference ownership now requires the full check
    before an unlinked packaged copy is accepted. Documentation generation and
    mandatory gates run the checker first. `rtk mise run migration-check`
    passed 120 tests with 556 assertions across 13 non-protected test files,
    validated 43 skills, checked 133 generated files, and checked 38 formatted
    files. Protection proof covered 4 patterns and 183 frozen source paths with
    zero violations; diff check passed. Fresh subagent verdict after blocker
    fixes: PASS. No evals run.
- [ ] [IN_PROGRESS] P02.06 Make skill creation decide placement before durable writes;
  make skill updates inspect sibling ownership; keep refactor behavior-preserving
  and route future contract deltas to an explicitly authorized direct migration.
- [ ] [TODO] P02.GATE Run `rtk mise run migration-check`; prove every canonical
  source has one owner and every generated copy is byte-identical. Evidence:
  pending.

## P03 — Ship the confirmed model-policy layer

- [ ] [TODO] P03.01 Encode the confirmed invocation matrix in the registry,
  validator, generator, docs, installation matrix, templates, and tests.
- [ ] [TODO] P03.02 Migrate the six confirmed best-practice owners to precise
  model-visible descriptions and matching Claude/Codex/OpenCode metadata.
- [ ] [TODO] P03.03 Migrate `tailrocks-agents-md` and the macOS/web/terminal
  design owners to `MODEL_POLICY`; preserve their human-authority boundaries.
- [ ] [TODO] P03.04 Create `tailrocks-grilling` from its recorded baseline:
  dependency-ordered frontier rounds, recommendation per question, agent-owned
  fact retrieval, user-owned decisions, explicit confirmation, no execution.
- [ ] [TODO] P03.05 Give `tailrocks-grilling` exclusive boundaries against
  roadmap shaping/readiness, reusable research, implementation planning, and
  medium-specific design.
- [ ] [TODO] P03.06 Reconcile `invocation-policy.md`, root doctrine, install
  guidance, choosing guide, context-budget decision, catalog, and generated
  skill pages with the confirmed matrix.
- [ ] [TODO] P03.GATE Run `rtk mise run migration-check`; prove the exact
  model-visible set, representative manual-only absence, trigger boundaries,
  and zero authority gain. Evidence: pending.

## P04 — Extract deterministic and security-sensitive seams

- [ ] [TODO] P04.01 Add deterministic audit-report identity and finding-ID
  reconciliation.
- [ ] [TODO] P04.02 Add `scripts/agents-md-topology.ts` with typed mutation
  receipts, exact symlink discovery/create/repair/verify behavior, and temporary
  directory tests.
- [ ] [TODO] P04.03 Add `scripts/checkout-pr.ts` with validated number/URL/branch,
  dirty-tree refusal, closed/no-match handling, and exact switch verification.
- [ ] [TODO] P04.04 Add `scripts/post-pr-review.ts`; require fresh posting
  authority, verify current HEAD, and deduplicate repeated receipts.
- [ ] [TODO] P04.05 Add `scripts/merge-preflight.ts`; use bounded polling,
  terminal pending output, machine-owned delivery/documentation predicates, and
  no merge authority.
- [ ] [TODO] P04.06 Add macOS launch/window/capture/accessibility/appearance
  scripts with exact process ownership, ambiguity refusal, bounded recovery, and
  runnable local test applications.
- [ ] [TODO] P04.07 Add web capture scripts that prove owned server revision and
  guard endpoint before capture; reject wrong-server reuse.
- [ ] [TODO] P04.08 Require every script to reject unmatched state, bound retries,
  restore recoverable state, and emit machine-readable receipts.
- [ ] [TODO] P04.GATE Run `rtk mise run migration-check`; record nonzero tests
  for every new script and a fresh security-focused subagent review. Evidence:
  pending.

## P05 — Split stack ownership

- [ ] [TODO] P05.01 Rust project setup → setup, project audit, project remediate.
- [ ] [TODO] P05.02 Rust best practices → write, review, refactor; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
- [ ] [TODO] P05.03 Axum best practices → build, review, refactor; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
- [ ] [TODO] P05.04 GraphQL best practices → public-API evolution and review;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval.
- [ ] [TODO] P05.05 gRPC best practices → service-contract evolution and review;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval.
- [ ] [TODO] P05.06 TanStack project setup → setup, audit, migrate, remediate.
- [ ] [TODO] P05.07 TypeScript best practices → write, review, refactor, migrate;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval, and keep project tooling with setup.
- [ ] [TODO] P05.08 Swift best practices → write, review, refactor, Rust-core
  boundary; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
- [ ] [TODO] P05.09 Swift project setup → setup, audit, remediate, agent
  integration, Rust-core setup.
- [ ] [TODO] P05.10 Code health → approved ratchet mutation and read-only audit;
  remove minimum-release-age policy while retaining latest-stable and
  vulnerability policy.
- [ ] [TODO] P05.GATE Prove one owner per old selector, exact compatibility
  routing, synchronized generated surfaces, and `rtk mise run migration-check`.
  Evidence: pending.

## P06 — Split improvement, instruction, and contribution ownership

- [ ] [TODO] P06.01 Improve → standard, deep, security, plan, execution,
  reconcile, and seed-roadmap owners with exclusive outputs.
- [ ] [TODO] P06.02 Agents MD → add, audit, sync; retain `MODEL_POLICY` only on
  the existing named owner pending descendant approval, while mutation remains
  task-authorized only.
- [ ] [TODO] P06.03 Simplify → read-only audit and approved apply owner.
- [ ] [TODO] P06.04 Remediate → root-cause diagnosis/design and approved
  correction; merge rethink analysis and keep the old name route-only.
- [ ] [TODO] P06.05 Contribute → recon, propose, prepare, submit, respond; keep
  fresh external-action approval at every outward boundary.
- [ ] [TODO] P06.06 Preserve skill-create as one evidence-to-wired-skill
  transaction; keep update and refactor exclusive from direct migration work.
- [ ] [TODO] P06.GATE Prove every selector has one owner, no implicit invocation
  adds authority, and `rtk mise run migration-check` passes. Evidence: pending.

## P07 — Split design and visual verification ownership

- [ ] [TODO] P07.01 macOS design → design/prototype/blessing, design review, and
  systematize; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
- [ ] [TODO] P07.02 Web design → design/blessing and design audit; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
- [ ] [TODO] P07.03 Terminal design → design/blessing/golden freeze and design
  audit; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
- [ ] [TODO] P07.04 macOS visual verification → current-render verification,
  baseline, and regression; all remain `MANUAL_ONLY`.
- [ ] [TODO] P07.05 Web visual verification → baseline and regression; both
  remain `MANUAL_ONLY`.
- [ ] [TODO] P07.06 Preserve human blessing, owned-process capture, appearance
  restoration, wrong-server refusal, and region-specific conformance rules.
- [ ] [TODO] P07.GATE Prove the exact eleven-skill model-policy set, manual
  descendant and visual-verification routing, one taste owner per medium, and
  `rtk mise run migration-check`.
  Evidence: pending.

## P08 — Rehome repository audit and preserve compatibility

- [ ] [TODO] P08.01 Encode every invocation row and modifier from
  `content-movement-audit-retirement.md` in a deterministic route schema.
- [ ] [TODO] P08.02 Route default/quick/category/batch to standard improve;
  whole-repository deep to improve-deep; security to improve-security.
- [ ] [TODO] P08.03 Route branch variants to PR review; next/ask variants to
  research; visual-conformance questions to the matching design owner.
- [ ] [TODO] P08.04 Route plan, seed, execute, plan-sweep, and roadmap-sweep to
  their exclusive owners, preserving deep and batch modifiers.
- [ ] [TODO] P08.05 Refuse `quick --deep`, malformed modes, and multiple primary
  modes deterministically.
- [ ] [TODO] P08.06 Convert pipeline-free planning to `plans/`; remove roadmap
  goal/fingerprint mechanics from improve-plan and avoid empty rejection commits.
- [ ] [TODO] P08.07 Keep `tailrocks-audit`, `tailrocks-checkout-pr`, review
  posting mode, and other protected-directory retirements as zero-mutation
  route-only aliases for this goal.
- [ ] [TODO] P08.GATE Table-test every route and refusal, synchronize generated
  surfaces, and run `rtk mise run migration-check`. Evidence: pending.

## P09 — Repair every retained public contract

- [ ] [TODO] P09.01 `tailrocks-agents-md`: deterministic add/audit/sync ownership
  and symlink parity tests.
- [ ] [TODO] P09.02 `tailrocks-axum-best-practices`: unique build/review/refactor
  routes, outputs, refusals, invocation, and argument hints.
- [ ] [TODO] P09.03 `tailrocks-brainstorm`: deterministic DRAFT/SHAPING and
  interactive/batch frontier transitions using temporary item trees.
- [ ] [TODO] P09.04 `tailrocks-checkout-pr`: temporary repositories and mocked
  hosting/Git receipts through the deterministic script.
- [ ] [TODO] P09.05 `tailrocks-code-health`: machine-owned version and ratchet
  predicates plus unique owner hints.
- [ ] [TODO] P09.06 `tailrocks-contribute`: five stage scripts with temporary
  repository state and mocked external receipts.
- [ ] [TODO] P09.07 `tailrocks-create-pr`: bounded non-vacuous pre-open gate and
  mocked remote receipts.
- [ ] [TODO] P09.08 `tailrocks-document`: deterministic final-order predicate and
  documentation discovery tests.
- [ ] [TODO] P09.09 `tailrocks-finalize`: machine-owned readiness/state
  transitions for DRAFT, SHAPING, READY, live, and batch paths.
- [ ] [TODO] P09.10 `tailrocks-graphql-best-practices`: unique evolution/review
  ownership, invocation, output, refusal, and hints.
- [ ] [TODO] P09.11 `tailrocks-grpc-best-practices`: unique evolution/review
  ownership, invocation, output, refusal, and hints.
- [ ] [TODO] P09.12 `tailrocks-idea`: atomic capture success/refusal/boundary
  tests using temporary repositories.
- [ ] [TODO] P09.13 `tailrocks-improve`: deterministic route selection,
  correctness-first ranking, rejected-finding handling, and typed receipts.
- [ ] [TODO] P09.14 `tailrocks-macos-design`: live-render requirement,
  bounded-baseline authority, exclusive review/systematize outputs.
- [ ] [TODO] P09.15 `tailrocks-macos-visual-qa`: owned-app ambiguity,
  permission, decoy, and restoration tests through the harness.
- [ ] [TODO] P09.16 `tailrocks-merge-pr`: temporary histories and mocked
  check/merge/documentation receipts.
- [ ] [TODO] P09.17 `tailrocks-plan`: runnable proof-producing commands,
  client-neutral handoff, research-gap manifest, and deterministic resume.
- [ ] [TODO] P09.18 `tailrocks-pr-template`: deterministic sole-target
  resolution across absent, existing, and alternate repository layouts.
- [ ] [TODO] P09.19 `tailrocks-prove`: capability drivers against local
  CLI/application/browser programs with machine-readable receipts.
- [ ] [TODO] P09.20 `tailrocks-reconcile`: deterministic frozen-package,
  closer, retirement, and partial-failure predicates.
- [ ] [TODO] P09.21 `tailrocks-record-decision`: manifest propagation and
  reopen behavior for READY and PLANNED items.
- [ ] [TODO] P09.22 `tailrocks-record-feedback`: static verbatim-capture and
  excluded-explanation contract.
- [ ] [TODO] P09.23 `tailrocks-refresh-pr`: deterministic command values,
  temporary-file lifecycle, prior-outcome checks, and recovery receipts.
- [ ] [TODO] P09.24 `tailrocks-remediate`/`tailrocks-rethink`: exclusive
  diagnosis versus approved correction, with rethink route-only.
- [ ] [TODO] P09.25 `tailrocks-research`: static question/sweep routing, chapter
  schema, and deterministic assembly against a local source corpus.
- [ ] [TODO] P09.26 `tailrocks-retrospect`: one closed patch-shape enum and
  validated typed consumers.
- [ ] [TODO] P09.27 `tailrocks-review-pr`: one evidence predicate, explicit
  exemptions, and report generation separated from posting.
- [ ] [TODO] P09.28 `tailrocks-rust-best-practices`: unique write/review/refactor
  ownership, invocation, outputs, refusals, and hints.
- [ ] [TODO] P09.29 `tailrocks-rust-project-setup`: temporary-workspace scaffold
  and remediation tests plus unique setup/audit/remediate hints.
- [ ] [TODO] P09.30 `tailrocks-simplify`: static audit/apply separation and
  characterized/no-change deterministic removal tests.
- [ ] [TODO] P09.31 `tailrocks-skill-audit`: static routes, owners, references,
  and deterministic report identity.
- [ ] [TODO] P09.32 `tailrocks-skill-create`: atomic placement, temporary skill
  trees, canonical doctrine, and generated-artifact checks.
- [ ] [TODO] P09.33 `tailrocks-skill-refactor`: behavior-preserving scope and
  deterministic split/keep/contract-delta routing.
- [ ] [TODO] P09.34 `tailrocks-skill-update`: sibling inventory, bounded change
  set, canonical doctrine, and affected/full deterministic gates.
- [ ] [TODO] P09.35 `tailrocks-swift-best-practices`: concise router,
  write/review/refactor ownership, and Rust-core boundary owner.
- [ ] [TODO] P09.36 `tailrocks-swift-project-setup`: generator, agent topology,
  Rust bridge, and setup/audit/remediate ownership tests.
- [ ] [TODO] P09.37 `tailrocks-tanstack-project-setup`: generator and migration
  scripts plus thin-UI and setup/audit/migrate/remediate boundaries.
- [ ] [TODO] P09.38 `tailrocks-tui-design`: design/audit separation and
  deterministic gallery/golden tooling with pinned tools.
- [ ] [TODO] P09.39 `tailrocks-typescript-best-practices`: unique
  write/review/refactor/migrate ownership; project configuration stays in setup.
- [ ] [TODO] P09.40 `tailrocks-web-design`: typed design-route boundary,
  MODEL_POLICY metadata, and rejection of screenshot ownership.
- [ ] [TODO] P09.41 `tailrocks-web-visual-qa`: owned-server baseline/regression
  harness and wrong-server refusal.
- [ ] [TODO] P09.42 `tailrocks-audit`: complete route-only compatibility matrix
  with no residual implementation ownership.
- [ ] [TODO] P09.43 `tailrocks-grilling`: exact natural-language trigger,
  dependency frontier, recommendations, fact/decision boundary, confirmation,
  and no-action authority.
- [ ] [TODO] P09.GATE Run `rtk mise run migration-check`; require all 43 current
  contracts plus grilling and all split owners to pass deterministic ownership,
  invocation, authority, and generated-surface validation. Evidence: pending.

## P10 — Reconcile exact movement and compatibility surfaces

- [ ] [TODO] P10.01 Add a receipt for every non-protected KEEP/MOVE/COPY/DELETE
  row in all three movement reports; every receipt names source, target,
  operation, checker, and result.
- [ ] [TODO] P10.02 Generate and byte-check every local copy from the canonical
  authoring, runtime-trust, version-policy, repository-audit, design-pipeline,
  contribution-handoff, and pull-request-conventions sources.
- [ ] [TODO] P10.03 Source-neutralize retained and moved prose while preserving
  the mechanism; shipped skill content names no external project, collection,
  or author as provenance.
- [ ] [TODO] P10.04 Regenerate root README rows, skill READMEs, documentation
  pages, catalog placement, INSTALL, choosing guide, root instructions, and
  every client sidecar inside each owning package.
- [ ] [TODO] P10.05 Prepare lockstep `v0.28.0` manifest versions and pinned
  documentation examples without tagging, publishing, pushing, or opening a PR.
- [ ] [TODO] P10.06 Keep protected-directory legacy names as documented
  route-only aliases; record their later removal prerequisite without adding it
  as work in this goal.
- [ ] [TODO] P10.GATE Prove every in-scope movement row has one successful
  receipt, every generated surface is synchronized, and `rtk mise run
  migration-check` passes. Evidence: pending.

## P11 — Terminal verification and closure

- [ ] [TODO] P11.01 Run `rtk mise run migration-check` from a clean command
  session; record every subcommand and nonzero test/check count.
- [ ] [TODO] P11.02 Run `rtk mise run docs:build` and `rtk git diff --check`.
- [ ] [TODO] P11.03 Run installed client/plugin validators. Record unavailable
  clients as not applicable with the exact command lookup evidence; do not
  weaken repository gates.
- [ ] [TODO] P11.04 Run a fresh subagent portfolio audit over ownership,
  invocation, authority, security, references, compatibility routing, protected
  paths, and generated surfaces. Require no blocking in-scope finding.
- [ ] [TODO] P11.05 Run the plan-state checker in pre-final mode: every row
  before P11.05 is completed with a receipt, and only P11.05/P11.06 remain
  unchecked. Mark P11.05 completed with that receipt.
- [ ] [TODO] P11.06 In one final patch, mark P11.06 `[x] [COMPLETED]`, change the
  header completion marker to `COMPLETED`, and change the final literal line
  below to `AUDIT MIGRATION: COMPLETED`; then run the plan-state checker in
  final mode and require zero unchecked or non-completed actionable rows.

AUDIT MIGRATION: NOT COMPLETED
