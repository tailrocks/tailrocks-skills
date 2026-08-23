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
- [x] [COMPLETED] P02.06 Make skill creation decide placement before durable writes;
  make skill updates inspect sibling ownership; keep refactor behavior-preserving
  and route future contract deltas to an explicitly authorized direct migration.
  - Evidence receipt (2026-08-22): canonical topology now requires read-only
    placement before create's first durable write, sibling-owner inventory
    before update mutation, and unchanged-tree refusal before contract-breaking
    work. Create, update, refactor, audit, root doctrine, and the choosing guide
    route future deltas only to separately scoped explicit direct migration in
    the named branch and pull request. Removed the obsolete migration-contract
    template; the validator rejects migration-plan artifacts. Five focused
    structural tests prove sequencing, ownership routing, preserved refactor
    contracts, packaged canonical references, and published direct-migration
    boundaries. `rtk mise run migration-check` passed 126 tests with 593
    assertions across 14 non-protected test files, validated 43 skills, checked
    10 canonical sources/71 byte-identical destinations, checked 133 generated
    files, and checked 39 formatted files. Protection proof covered 4 patterns
    and 183 frozen source paths with zero violations; diff check passed. Fresh
    subagent verdict after two boundary corrections: PASS. Skill-creator kept
    routers lean and routed shared doctrine; safe-refactor kept observable
    contracts frozen. No evals run.
- [x] [COMPLETED] P02.GATE Run `rtk mise run migration-check`; prove every canonical
  source has one owner and every generated copy is byte-identical. Evidence:
  - Evidence receipt (2026-08-22): focused ownership proof passed 16 tests with
    93 assertions. `rtk mise run migration-check` passed 126 tests with 593
    assertions across 14 non-protected test files; validated 43 skills, checked
    133 generated files, and checked 39 formatted files. Independent fresh
    review proved 10 canonical files equal 10 unique manifest sources with exact
    inventory coverage, plus 71 unique destinations and 71 byte-identical
    copies. The manifest/generator reject duplicate or case-colliding ownership,
    source/destination drift, symlinks, unsafe paths, silent removals, and
    incomplete runtime-trust coverage. Direct migration remains separately
    authorized in the named branch/pull request with no planner/executor product
    skill or artifact. Protection proof covered 4 patterns and 183 frozen source
    paths with zero violations. Fresh subagent verdict: PASS. No evals run.

## P03 — Ship the confirmed model-policy layer

- [x] [COMPLETED] P03.01 Encode the confirmed invocation matrix in the registry,
  validator, generator, docs, installation matrix, templates, and tests.
  - Evidence receipt (2026-08-22): retained the strict exhaustive v1 registry
    as the sole effective-state authority and added one shared parser consumed
    by validation and documentation generation. Generated README/site/index
    surfaces and installation/client doctrine now distinguish `MANUAL_ONLY`
    from `MODEL_POLICY`, state exact-trigger and zero-authority semantics, and
    retain direct invocation as best-effort. The scaffold/template path remains
    fail-closed manual by default and converts to the canonical model-policy
    tuple only under an explicit invocation-class request. No pending or dual
    registry state was introduced: all 43 effective rows remain manual until
    P03.02/P03.03 atomically change registry plus metadata, and P03.04 adds the
    eleventh owner. Focused parser, validator, generator, and scaffold proof
    passed 60 tests with 407 assertions. `rtk mise run migration-check` passed
    129 tests with 608 assertions across 15 non-protected files, validated 43
    skills, checked 133 generated files, and checked 41 formatted files.
    Protection proof covered 4 patterns and 183 frozen paths with zero
    violations; diff check passed. Fresh subagent verdict: PASS. Migration
    discipline preserved a reversible atomic owner-flip path. No evals run.
- [x] [COMPLETED] P03.02 Migrate the six confirmed best-practice owners to precise
  model-visible descriptions and matching Claude/Codex/OpenCode metadata.
  - Evidence receipt (2026-08-22): atomically migrated Rust, Axum, GraphQL,
    gRPC, TypeScript, and Swift best-practice owners to `MODEL_POLICY` in the
    registry, exact trigger-only descriptions, omitted Claude manual-disable
    metadata, retained explicit user invocation, and Codex implicit=true.
    Triggers are content-scoped and exclude workspace/project setup, unrelated
    Rust, cross-service/public protocol, backend business logic, or visual
    design as appropriate. No unsupported OpenCode discovery metadata or
    authority-bearing tools/hooks/dynamic commands were added. Exact-set and
    tuple proof passed 3 tests with 59 assertions, including a representative
    manual transaction owner. `rtk mise run migration-check` passed 132 tests
    with 667 assertions across 16 non-protected files, validated 43 skills,
    checked 133 generated files, and checked 42 formatted files. Protection
    proof covered 4 patterns and 183 frozen paths with zero violations; diff
    check passed. Fresh subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P03.03 Migrate `tailrocks-agents-md` and the macOS/web/terminal
  design owners to `MODEL_POLICY`; preserve their human-authority boundaries.
  - Evidence receipt (2026-08-22): atomically migrated instruction topology and
    macOS/web/terminal visual-design owners to the registry-matched model-policy
    tuple. Exact descriptions scope selection to instruction files or matching
    visual media. Structural selection boundaries and safe default prompts
    withhold add/sync and artifact writes, user blessing, freeze, capture, and
    production mutation unless the active task separately authorizes them;
    macOS/web visual-QA owners remain manual. Removed a stale web prompt and
    short description that claimed screenshot-baseline ownership. Exact matrix,
    zero-authority, prompt, human-decision, and representative-manual proof
    passed 4 tests with 109 assertions. `rtk mise run migration-check` passed
    133 tests with 717 assertions across 16 non-protected files, validated 43
    skills, checked 133 generated files, and checked 42 formatted files.
    Protection proof covered 4 patterns and 183 frozen paths with zero
    violations; diff check passed. Fresh subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P03.04 Create `tailrocks-grilling` from its recorded baseline:
  dependency-ordered frontier rounds, recommendation per question, agent-owned
  fact retrieval, user-owned decisions, explicit confirmation, no execution.
  - Evidence receipt (2026-08-22): created the conversation-only
    `tailrocks-grilling` model-policy owner with explicitly numbered
    dependency-frontier rounds, a grounded recommendation on every question,
    agent-owned fact retrieval with one alternate-source retry, user-owned
    choices, contradiction reopening, early-exit and resume state, live-human
    refusal, explicit final-map confirmation, and structural zero-write and
    zero-execution authority. Added sorted invocation, catalog, shared-runtime,
    root/install, Codex, generated documentation, and exact-matrix wiring.
    Focused proof passed 5 tests with 128 assertions. `rtk mise run
    migration-check` passed 134 tests with 739 assertions across 16
    non-protected files, validated 44 skills, checked 136 generated files and
    72 byte-identical shared-reference destinations, and checked 42 formatted
    files. Protection proof covered 4 patterns and 183 frozen source paths with
    zero violations; diff check passed. Fresh subagent verdict: PASS after its
    numbered-round blocker was fixed and statically guarded. No evals run.
- [x] [COMPLETED] P03.05 Give `tailrocks-grilling` exclusive boundaries against
  roadmap shaping/readiness, reusable research, implementation planning, and
  medium-specific design.
  - Evidence receipt (2026-08-22): added one exclusive ownership router to
    `tailrocks-grilling`: live conversation remains local; persisted roadmap
    shaping routes to `tailrocks-brainstorm`; only `tailrocks-finalize` grants
    READY; reusable sourced artifacts route to `tailrocks-research`; `plan/`
    and `goal/` packages route to `tailrocks-plan`; and platform design plus
    blessing route to the macOS, web, or terminal design owner. A handoff now
    explicitly grants neither invocation nor authority. Neighbor contracts
    already held those exclusive outputs, so none changed. Focused proof
    passed 6 tests with 143 assertions. `rtk mise run migration-check` passed
    135 tests with 754 assertions across 16 non-protected files, validated 44
    skills, checked 136 generated files and 72 byte-identical shared-reference
    destinations, and checked 42 formatted files. Protection proof covered 4
    patterns and 183 frozen source paths with zero violations; diff check
    passed. Fresh subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P03.06 Reconcile `invocation-policy.md`, root doctrine, install
  guidance, choosing guide, context-budget decision, catalog, and generated
  skill pages with the confirmed matrix.
  - Evidence receipt (2026-08-22): replaced the obsolete unconfirmed
    three-class proposal with implemented two-class doctrine and the exact
    eleven-owner matrix; reconciled root and install guidance, the choosing
    guide, decision-support ownership, and context-budget policy to 44 skills,
    11 model-policy owners, 33 manual owners, zero authority gain, and
    best-effort direct visibility. Current description measurements are 11,533
    full characters and 9,718 validator-counted body characters; the 1,815
    remainder is 1,782 guard characters plus 33 trimmed separators. Catalog and
    all generated pages already matched and were regenerated from their
    canonical sources. Focused doctrine and matrix proof passed 9 tests with
    181 assertions. `rtk mise run migration-check` passed 138 tests with 792
    assertions across 17 non-protected files, validated 44 skills, checked 136
    generated files and 72 byte-identical shared-reference destinations, and
    checked 43 formatted files. Protection proof covered 4 patterns and 183
    frozen source paths with zero violations; stale-claim and diff checks
    passed. Fresh subagent verdict: PASS after its stale measurement blocker was
    corrected and guarded. No evals run.
- [x] [COMPLETED] P03.GATE Run `rtk mise run migration-check`; prove the exact
  model-visible set, representative manual-only absence, trigger boundaries,
  and zero authority gain.
  - Evidence receipt (2026-08-22): on clean committed state, `rtk mise run
    migration-check` passed 138 tests with 792 assertions across 17
    non-protected files, validated 44 skills, checked 136 generated files and
    72 byte-identical shared-reference destinations, and checked 43 formatted
    files. Focused terminal proof passed 9 tests with 181 assertions: exact 11
    model-policy owners, representative manual transaction absence, canonical
    client tuples, trigger and human-authority boundaries, grilling ownership,
    two-class documentation, and zero authority gain. Protection proof covered
    4 patterns and 183 frozen source paths with zero violations; worktree and
    diff checks passed. P03.06 fresh subagent verdict remained PASS. No evals
    run.

## P04 — Extract deterministic and security-sensitive seams

- [x] [COMPLETED] P04.01 Add deterministic audit-report identity and finding-ID
  reconciliation.
  - Evidence receipt (2026-08-22): added the packaged
    `tailrocks-skill-audit/scripts/reconcile-report.ts` seam and routed report
    writes through it. It validates exact report/header identity, structured
    case-sensitive evidence identity plus legacy continuity, immediate-report
    preservation, committed Git history, retired-ID non-reuse, independent
    per-layer maxima, canonical allocation, corrupt-history collisions, exact
    output scope, and atomic UUID-owned installation with no unowned cleanup.
    The report format now gives semantic audit only `PREFIX-NEW` headings and
    typed tuple fields; software owns numeric IDs and the machine receipt.
    Focused temporary-repository proof passed 11 tests with 45 assertions,
    covering whitespace and line movement, draft reordering, returning retired
    tuples, six layer maxima, legacy continuity, identifier case and whitespace,
    malformed/duplicate/reused identity refusal, Git history, byte-preserving
    failure, and zero first-audit mutation. `rtk mise run migration-check`
    passed 149 tests with 837 assertions across 18 non-protected files,
    validated 44 skills, checked 136 generated files and 72 byte-identical
    shared-reference destinations, and checked 44 formatted files. Protection
    proof covered 4 patterns and 183 frozen source paths with zero violations;
    diff check passed. Fresh subagent verdict: PASS after a destructive temp
    cleanup blocker was fixed with UUID ownership tracking. No evals run.
- [x] [COMPLETED] P04.02 Add `scripts/agents-md-topology.ts` with typed mutation
  receipts, exact symlink discovery/create/repair/verify behavior, and temporary
  directory tests.
  - Evidence receipt (2026-08-22): added deterministic discovery and verification
    receipts plus no-clobber create and exact-observation repair. Mutations run
    from a directory-inode-bound child, use bigint device/inode ownership, move
    deletion candidates through UUID quarantines, restore mismatches, and retain
    named recovery artifacts when rollback cannot finish. The skill resolves the
    installed collection entrypoint, keeps semantic regular-file merges outside
    software mechanics, and routes audit through read-only modes. Focused proof
    passed 15 tests/70 assertions, including symlink loops, parent swaps,
    concurrent entry replacement, install/rollback failures, and post-success
    hook failures. `rtk mise run migration-check` passed 164 tests/907 assertions
    across 19 selected non-protected files, validated 44 skills, checked 136
    generated files, and passed formatting and diff checks. Protection proof
    covered 4 patterns/183 frozen source paths with zero violations. Fresh
    subagent verdict: PASS after descriptor anchoring and completion-state fixes.
    No evals run.
- [x] [COMPLETED] P04.03 Add `scripts/checkout-pr.ts` with validated number/URL/branch,
  dirty-tree refusal, closed/no-match handling, and exact switch verification.
  - Evidence receipt (2026-08-22): added the typed bounded checkout state
    machine, command README, `pr:checkout` task, and a zero-logic compatibility
    alias that invokes the verified installed script. Number, exact HTTPS URL,
    and Git-valid branch inputs resolve without shell interpolation; branch
    lookup prefers one exact open match and refuses zero, multiple, or saturated
    results. Closed confirmation is freshly re-queried and bound to the resolved
    PR number. Two clean-state guards precede one checkout call; success requires
    exact `headRefName` and `headRefOid`. Failed mutations recover a different
    branch normally or a same-name branch through detach plus CAS `update-ref`,
    then re-prove clean branch and HEAD; concurrent ref movement is never
    overwritten. Focused proof passed 22 tests/55 assertions across success,
    no-op, validation, ambiguity, truncation, dirty/raced state, closed authority,
    malformed hosting data, wrong branch/OID, typed CLI exits, and recovery.
    `rtk mise run migration-check` passed 186 tests/962 assertions across 20
    selected non-protected files, validated 44 skills, checked 136 generated
    files, and passed formatting and diff checks. Protection proof covered 4
    patterns/183 frozen source paths with zero violations. Fresh subagent
    verdict: PASS after exact commit proof, direct installed-script routing,
    saturated lookup refusal, typed CLI errors, and CAS same-branch recovery.
    No evals run.
- [x] [COMPLETED] P04.04 Add `scripts/post-pr-review.ts`; require fresh posting
  authority, verify current HEAD, and deduplicate repeated receipts.
  - Evidence receipt (2026-08-22): added a strict typed prepare/post state
    machine, command README, `pr:post-review` task, and migrated
    `tailrocks-review-pr` plus the root catalog to unconditional read-only
    review. Prepare binds an exact report digest to repository, PR, current
    40-character local/remote HEAD, open state, actor, and a five-minute
    owner-only one-use challenge without outward mutation. Post atomically
    claims authority, rechecks actor/target/HEAD/expiry immediately before each
    mutation, posts exact inline or clean payloads, proves API response body,
    HTTPS permalink, commit and full location, and re-verifies afterward.
    Same-actor deterministic markers make partial/uncertain runs resumable;
    other actors cannot suppress findings and saturated lookups refuse.
    Focused proof passed 19 tests/59 assertions across expiry equality and
    mid-flight expiry, replay/tamper, actor/target/head drift, schema and payload
    proof, multiline ranges, dedupe spoofing, partial resume, uncertain results,
    and typed CLI exits. `rtk mise run migration-check` passed 205 tests/1,021
    assertions across 21 selected non-protected files, validated 44 skills,
    checked 136 generated files, and passed formatting and diff checks.
    Protection proof covered 4 patterns/183 frozen source paths with zero
    violations. Fresh subagent verdict: PASS after closing root-instruction,
    schema-documentation, exact-expiry, and response-proof gaps. No evals run.
- [x] [COMPLETED] P04.05 Add `scripts/merge-preflight.ts`; use bounded polling,
  terminal pending output, machine-owned delivery/documentation predicates, and
  no merge authority.
  - Evidence receipt (2026-08-22): added a read-only typed preflight and shared
    documentation subcommand, command/contract documentation, four delivery
    fixtures, four commit-history fixtures, and the `pr:merge-preflight` task.
    The command binds the live repository, PR, local/remote head, base, and
    computed merge base; samples strict required-check identities at most 30
    times, exactly 10 seconds apart under a 300-second monotonic cap; returns
    terminal pending; and final-reverifies identity. Machine code now owns all
    six delivery contradictions and one ancestry-based documentation predicate
    shared by merge and document skills. Unknown paths stay doc-worthy, commit
    labels cannot suppress obligations, exact final trailers cover the whole
    required ancestry, docs-only history is `not_needed`, and later source or
    documentation stales coverage while later tests/CI/delivery artifacts do
    not. Raw blockers remain visible under policy waivers. The merge skill keeps
    fresh blast/admin/waiver/merge judgment, requires final preflight after all
    branch mutations, and atomically passes the receipt head through
    `--match-head-commit`; the script exposes no merge or metadata mutation.
    Focused proof passed 18 tests/48 assertions across green/fail/cancel/pending,
    exact polling/wall bounds, drift, static-waiver observation, all six
    contradictions, deletion preimages, malformed tables/indexes/checks,
    ancestry forks and stale docs, live documentation binding, and typed CLI
    exits. `rtk mise run migration-check` passed 223 tests/1,069 assertions
    across 22 selected non-protected files, validated 44 skills, checked 136
    generated files, and passed formatting and diff checks. Protection proof
    covered 4 patterns/183 frozen source paths with zero violations. Fresh
    subagent verdict: PASS after fixing docs-only semantics, live PR binding,
    receipt invalidation, atomic match-head merge, zero-path commits, required
    history fixtures, and generated Markdown integrity. No evals run.
- [x] [COMPLETED] P04.06 Add macOS launch/window/capture/accessibility/appearance
  scripts with exact process ownership, ambiguity refusal, bounded recovery, and
  runnable local test applications.
  - Evidence receipt (2026-08-22): moved the five legacy harness templates into
    a shared script package and added an atomic installer, exact process-owner
    helper, hardened capture/state/AX/audit templates, harness contract, and two
    runnable native fixture bundles. Capture canonicalizes every app-bundle
    boundary, binds actions to real executable plus PID plus launch token,
    bounds TERM/KILL/launch/window recovery, accepts scenario argv, refuses
    multiple exact-PID windows, captures by ID, compares pre/post window
    identity, and publishes through exclusive same-directory hard links. AX is
    PID-only, traversal-bounded, and identifier-unique; the audit scopes issues
    against actual app descendants. Appearance mutation exists only inside a
    strict owner-only six-key typed transaction: Auto is preserved, forged
    registries refuse, concurrent values conflict, retries resume partial
    restores, and failed recovery retains both snapshots. Focused proof passed
    9 tests/55 assertions, including real decoy survival, real two-window
    refusal with no output, launched-process cleanup, exact typed preference
    restoration, transient partial-restore convergence, and forged recovery
    refusal; shell syntax and four Swift compiler checks also passed.
    `rtk mise run migration-check` passed 232 tests/1,124 assertions across 25
    selected non-protected files, validated 44 skills, checked 136 generated
    files, and passed formatting and diff checks. Protection proof covered 4
    patterns/183 frozen source paths with zero violations. Fresh
    security-focused subagent verdict: PASS after closing canonical containment,
    PID-reuse, no-replace publication, post-capture identity, launch-argv,
    registry-forgery, partial-restore, audit-scope, and executable-proof gaps.
    No evals run.
- [x] [COMPLETED] P04.07 Add web capture scripts that prove owned server revision and
  guard endpoint before capture; reject wrong-server reuse.
  - Evidence receipt (2026-08-22): replaced the reusable-server templates with a
    shared transactional installer and owned-server capture supervisor. Capture
    binds the canonical Git root, HEAD plus every Git-visible source byte, exact
    project-local Vite entrypoint, strict loopback port, private 256-bit session,
    spawned PID, design-route flag, and exact no-cache guard schema. Existing or
    stale HTTP refuses before spawn; every test and the suite recheck guard and
    origin, source/HEAD drift refuses, service workers are blocked, and all child
    commands and TERM/KILL cleanup are bounded. Snapshot updates stage privately
    and publish only after final identity proof using stable source and target
    inode checks; concurrent replacement is preserved on refusal. Installer
    rollback likewise removes only inode-identical owned files. Focused proof
    passed 15 tests/54 assertions, including live stale-server refusal, HEAD
    drift, hung-child kill, staged publication, and adversarial installer and
    screenshot publication races. `rtk mise run migration-check` passed 247
    tests/1,178 assertions across 28 selected non-protected files, validated 44
    skills, checked 136 generated files, and passed formatting and diff checks.
    Protection proof covered 4 patterns/183 frozen source paths with zero
    violations. Fresh security-focused subagent verdict: PASS after closing
    repeated-HEAD, direct-baseline, CAS rollback, stale-server, hung-child, and
    staged-source publication-race gaps. No evals run.
- [x] [COMPLETED] P04.08 Require every script to reject unmatched state, bound retries,
  restore recoverable state, and emit machine-readable receipts.
  - Evidence receipt (2026-08-22): introduced shared hard-deadline command and
    fetch supervisors, strict terminal receipt envelopes, and no-replace
    multi-file transactions backed by persistent directory anchors. Migrated
    repository generators, resolvers, PR helpers, audit reconciliation, static
    docs scripts, and visual-QA installers/capture entrypoints to reject
    unmatched arguments, cap network/process/output work, preserve concurrent
    replacements, restore only owned state, and name retained recovery
    artifacts. The macOS harness now exposes one typed supervisor, installs its
    shell internals non-executable, validates exact capture/state grammar,
    kills and proves whole process groups dead, and preallocates recovery paths.
    Adversarial proof covers ignored aborts, TERM-resistant descendants,
    spawn errors, helper death, parent and destination swaps after staging,
    output saturation, CAS conflicts, ambiguous CLI state, and timeout recovery.
    The selected non-protected migration suite passed 270 tests/1,285
    assertions across 32 files. Fresh security-focused subagent verdict: PASS
    after closing descendant leaks, pathname-reopen races, shell bypass,
    unbounded Vite output, receipt gaps, and dead-helper rollback. No evals run.
- [x] [COMPLETED] P04.GATE Run `rtk mise run migration-check`; record nonzero tests
  for every new script and a fresh security-focused subagent review.
  - Evidence receipt (2026-08-22): `rtk mise run migration-check` passed 270
    tests/1,288 assertions across 32 selected non-protected files, validated 44
    skills, checked 136 generated documentation files and 72 packaged reference
    copies, found no formatting drift, and proved 4 protected patterns/183
    frozen source paths unchanged. Every new shared supervisor, resolver,
    transaction helper, and visual-QA entrypoint had nonzero focused proof.
    Fresh security-focused subagent verdict: PASS after adversarial review of
    process-group cleanup, request deadlines, bounded output, strict receipt
    paths, anchored rollback, helper death, destination swaps, and generated
    documentation consistency. No evals run.

## P05 — Split stack ownership

- [x] [COMPLETED] P05.01 Rust project setup → setup, project audit, project remediate.
  - Evidence receipt (2026-08-22): made `tailrocks-rust-project-setup`
    scaffold-only with a hard existing-workspace refusal; added manual-only
    `tailrocks-rust-project-audit` and `tailrocks-rust-project-remediate` owners
    with exclusive read/write authority, exact invocation hints, actionable
    canonical-template routing, and shared trust/freshness policy. Audit now
    proves repository bytes stable, permits only locked/frozen/offline
    check-only commands with external temporary state, and emits a fixed
    14-rule `PASS`/`GAP`/`BLOCKED` ledger; remediation requires the approved
    row/scope and never infers authority. The reference generator now admits
    exactly five setup-owned Rust sources, requires both descendant copies,
    rejects missing owners/generated-source promotion, and reports all 15
    sources truthfully; 86 destinations are byte-identical. Hand-authored and
    generated catalogs, install/choosing pages, invocation counts, context
    budget, READMEs, and 142 documentation files agree on 46 skills (35 manual,
    11 model-policy). Focused proof passed 71 tests/500 assertions; full
    `rtk mise run migration-check` passed 274 tests/1,329 assertions across 33
    selected non-protected files with formatting, generated-content, validator,
    plan-state, and protected-path gates green. Fresh subagent verdict: PASS
    after closing selector, stable-ID, read-only command, template ownership,
    generated-source completeness, and exact grammar defects. No evals run.
- [x] [COMPLETED] P05.02 Rust best practices → write, review, refactor; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
  - Evidence receipt (2026-08-22): made
    `tailrocks-rust-best-practices` the write-only Rust behavior owner with hard
    review/refactor refusals and retained its existing `MODEL_POLICY`; added
    manual-only `tailrocks-rust-review` and `tailrocks-rust-refactor` with
    exclusive read-only finding and preservation-oracle contracts. Review
    command execution now requires active-task authority plus an enforceable
    read-only repository, scrubbed secrets, disabled network, and bounded
    external state; repository policy cannot grant execution. Moved the review
    checklist byte-identically, generated five canonical language references to
    both descendants, and generalized the reference generator to declared owner
    families; all 20 sources produce 98 byte-identical destinations. Catalog,
    invocation registry, stack dispatch, install/choosing examples, generated
    docs, and context counts agree on 48 skills (37 manual, 11 model-policy).
    Focused proof passed 54 tests/201 assertions; final
    `rtk mise run migration-check` passed 278 tests/1,373 assertions across 34
    selected non-protected files with protection, formatting, generator,
    validator, and plan-state gates green. Fresh subagent re-review: PASS after
    closing command-authority and stale-trigger defects. No evals run.
- [x] [COMPLETED] P05.03 Axum best practices → build, review, refactor; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
  - Evidence receipt (2026-08-23): made
    `tailrocks-axum-best-practices` the build/change-only HTTP-adapter owner with
    hard review/refactor refusals and retained its existing `MODEL_POLICY`;
    added manual-only `tailrocks-axum-review` and
    `tailrocks-axum-refactor` with exclusive verified-finding and independent
    HTTP-preservation-oracle contracts. Review execution requires active-task
    authority, an enforceably read-only repository, scrubbed secrets, disabled
    network, locked inputs, and bounded external state. Generated four canonical
    Axum references to both descendants and expanded the declarative generator;
    all 24 sources produce 108 byte-identical destinations. Exact selectors,
    catalog/registry, install/choosing docs, stack routes, and context counts
    agree on 50 skills (39 manual, 11 model-policy). Whole-PR routing now consults
    the registry: manual specialists require explicit naming, while model-policy
    lanes retain exact-trigger eligibility without added authority. Focused proof
    passed 54 tests/213 assertions; final `rtk mise run migration-check` passed
    281 tests/1,416 assertions across 35 selected non-protected files with all
    protection, formatting, generator, validator, and plan-state gates green.
    Fresh subagent re-review: PASS after closing shorthand-selector and
    invocation-class portability defects. No evals run.
- [x] [COMPLETED] P05.04 GraphQL best practices → public-API evolution and review;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval.
  - Evidence receipt (2026-08-23): made
    `tailrocks-graphql-best-practices` the public-API evolution-only owner with
    hard review/audit and internal-gRPC refusals while retaining its existing
    `MODEL_POLICY`; added manual-only `tailrocks-graphql-review` for both diff
    review and whole-surface audit under one read-only findings oracle. Review
    binds exact revisions and SDL contracts, or the code-first schema, committed
    SDL, persisted-operation manifest, and generated client at one revision;
    command proof forbids installs, snapshot/codegen writes, unchanged
    artifact-writing schema tasks, network, secrets, and repository mutation.
    Generated four canonical GraphQL references to the review owner; all 28
    sources produce 113 byte-identical destinations. Exact selectors,
    catalog/registry, PR routing, install/choosing docs, and context counts agree
    on 51 skills (40 manual, 11 model-policy). Focused proof passed 50 tests/167
    assertions; final `rtk mise run migration-check` passed 284 tests/1,447
    assertions across 36 selected non-protected files with all protection,
    formatting, generator, validator, and plan-state gates green. Fresh subagent
    verdict: PASS. No evals run.
- [x] [COMPLETED] P05.05 gRPC best practices → service-contract evolution and review;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval.
  - Evidence receipt (2026-08-23): made
    `tailrocks-grpc-best-practices` the cross-service contract evolution-only
    owner with hard review/audit and public-GraphQL refusals while retaining its
    existing `MODEL_POLICY`; added manual-only `tailrocks-grpc-review` for diff
    review and whole-surface audit. Review binds exact revisions, proto and
    compiled descriptors, field-number history, and immutable Buf comparison
    commits; execution requires explicit authority, read-only bytes, scrubbed
    secrets, disabled network, bounded external caches/output, and controlled
    loopback, with installs/codegen and moving baselines refused. Generated three
    canonical gRPC references to review; all 31 sources produce 117 byte-identical
    destinations. Exact selectors, GraphQL/PR routes, catalog/registry,
    install/choosing docs, and counts agree on 52 skills (41 manual, 11
    model-policy). Focused proof passed 53 tests/189 assertions; final
    `rtk mise run migration-check` passed 287 tests/1,472 assertions across 37
    selected non-protected files with all gates green. Fresh subagent verdict:
    PASS. No evals run.
- [x] [COMPLETED] P05.06 TanStack project setup → setup, audit, migrate, remediate.
  - Evidence receipt (2026-08-23): made
    `tailrocks-tanstack-project-setup` scaffold-only with an empty-destination,
    bounded staging, parent-identity, compare-and-swap publication contract; added
    manual-only read-only audit, never-broken direct migration, and exact-approved
    gap remediation owners. Audit emits 15 stable `TANSTACK-*` rows and forbids
    installs, resolution, shared mutating guidance, networked target execution,
    and restoration; migration preserves routes, loaders/actions, cache,
    accessibility, and rendered behavior without producing a migration-plan
    artifact. Moved the checklist byte-identically only to migration. Generated
    five canonical TanStack references plus shared runtime/version policy to all
    owners; all 36 sources produce 138 byte-identical destinations. Version
    policy is copy-safe and authority-aware. Exact catalog/registry, PR routing,
    install/choosing/delivery docs, and context counts agree on 55 skills (44
    manual, 11 model-policy). Validator family-link proof admits only setup
    templates/resolver and rejects five adversarial boundaries. Focused proof
    passed 53 tests/225 assertions; final `rtk mise run migration-check` passed
    292 tests/1,559 assertions across 38 selected non-protected files with all
    protected-path, generator, validator, documentation, formatting, and
    plan-state gates green. Fresh subagent verdict: PASS. No evals run.
- [x] [COMPLETED] P05.07 TypeScript best practices → write, review, refactor, migrate;
  retain `MODEL_POLICY` only on the existing named owner pending descendant
  approval, and keep project tooling with setup.
  - Evidence receipt (2026-08-23): made
    `tailrocks-typescript-best-practices` a write-only language/UI owner that
    retains the sole family `MODEL_POLICY` without gaining mutation authority;
    added manual-only read-only review, preservation-oracle refactor, and direct
    compatibility-safe source migration owners. Source migration produces code
    and proof, never a migration-plan artifact, and routes package manager,
    compiler/lint configuration, pins, locks, CI, and layout to the TanStack
    project family. Moved testing semantics to writer-local `testing.md`,
    source-only migration semantics to migrate-local `migration.md`, merged exact
    project tooling policy into the canonical TanStack reference, and deleted the
    competing compiler/tooling reference. Generated four semantic references only
    to review/refactor plus runtime trust to all owners; all 40 sources produce
    149 byte-identical destinations. Replaced secret-bearing exhaustive-value
    stringification with a constant diagnostic. Catalog/registry, PR routing,
    install/choosing/delivery docs, and context counts agree on 58 skills (47
    manual, 11 model-policy). Focused proof passed 20 tests/296 assertions; final
    `rtk mise run migration-check` passed 296 tests/1,659 assertions across 39
    selected non-protected files with all gates green. Fresh subagent verdict:
    PASS, reconfirmed after final authority strengthening. No evals run.
- [x] [COMPLETED] P05.08 Swift best practices → write, review, refactor, Rust-core
  boundary; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
  - Evidence receipt (2026-08-23): made
    `tailrocks-swift-best-practices` a write-only native code owner retaining the
    sole family `MODEL_POLICY` without mutation authority; added manual-only
    read-only review, preservation-oracle refactor, and exclusive Rust-core/
    Apple-platform boundary owners. Moved `rust-core-boundary.md` and
    `apple-platform-shell.md` byte-identically only to the boundary owner;
    generated five canonical Swift code references only to review/refactor plus
    runtime trust to all four owners. All 45 sources produce 162 byte-identical
    destinations. The boundary enforces generated FFI, one main-actor store,
    immutable feature snapshots, semantic actions, lossy-notice reconciliation,
    and durable idempotent Apple effects; architecture/review are immutable and
    every edit requires explicit write authority. Both read-only owners require
    enforceably immutable target execution, frozen inputs, scrubbed secrets,
    disabled network, external owner-only output/cache, bounded process trees,
    and no install/generate/format-write. Catalog/registry, PR routing,
    install/choosing docs, and context counts agree on 61 skills (50 manual, 11
    model-policy). Focused proof passed 20 tests/256 assertions; final
    `rtk mise run migration-check` passed 300 tests/1,720 assertions across 40
    selected non-protected files with all gates green. Fresh subagent verdict:
    PASS after boundary authority/sandbox correction. No evals run.
- [x] [COMPLETED] P05.09 Swift project setup → setup, audit, remediate, agent
  integration, Rust-core setup.
  - Evidence receipt (2026-08-23): narrowed
    `tailrocks-swift-project-setup` to new-project scaffolding with absent-target
    CAS publication; added manual-only fixed-ledger read-only audit, exact-approved
    transactional remediation, human-authorized Xcode/agent integration, and
    add-only Rust-core project-lane owners. Moved `agent-integration.md` and
    `rust-core.md` exclusively to their specialist owners; retained four
    canonical setup references and generated eight byte-identical audit/remediate
    copies. All 49 sources produce 177 byte-identical destinations. Added
    supply-chain execution sandboxes, canonical-template sibling-link and symlink
    enforcement, fixed 16-row audit IDs, routes, catalogs, and generated docs.
    Registry/docs agree on 65 skills (54 manual, 11 model-policy), 16,958 total
    description characters, and 13,988 capped characters. Focused proof passed
    73 tests/596 assertions; final `rtk mise run migration-check` passed 306
    tests/1,794 assertions across 41 selected non-protected files. Fresh subagent
    verdict: PASS after verify-selector and generator-sandbox corrections. No
    migration-plan artifact added; no evals run.
- [x] [COMPLETED] P05.10 Code health → approved ratchet mutation and read-only audit;
  remove minimum-release-age policy while retaining latest-stable and
  vulnerability policy.
  - Evidence receipt (2026-08-23): narrowed `tailrocks-code-health` to one
    explicitly approved establish/tighten mutation with no-widen, exact
    precondition, command sandbox, atomic CAS, and recovery contracts; added the
    manual-only read-only `tailrocks-code-health-audit` with a fixed 12-row ledger
    and explicit provider `NOT_APPLICABLE` state. Extended reference generation
    with globally unique marker-validated source slices and exact extracted-byte
    locks; five canonical adapters now produce five self-contained audit-only
    projections. All 54 sources produce 184 byte-identical destinations. Moved
    latest-stable, no-delay, and immediate highest-fixed vulnerability doctrine
    to the shared version source; the code-health adapter retains only ratchet
    measurement/enforcement, and semantic JSON plus exact-line validation blocks
    release-delay policy and escaped-key/false-refusal bypasses. Registry/docs
    agree on 66 skills (55 manual, 11 model-policy), 17,252 total description
    characters, and 14,227 capped characters. Focused proof passed 77 tests/601
    assertions; final `rtk mise run migration-check` passed 315 tests/1,853
    assertions across 42 selected non-protected files. Fresh subagent verdict:
    PASS after slice, version-authority, and validator-bypass corrections. No
    migration-plan artifact added; no evals run.
- [x] [COMPLETED] P05.GATE Prove one owner per old selector, exact compatibility
  routing, synchronized generated surfaces, and `rtk mise run migration-check`.
  - Evidence receipt (2026-08-23): the ten package ownership suites passed 38
    tests/459 assertions; reference generation proved 54 sources and 184
    byte-identical destinations; skill validation covered 66 skills and generated
    documentation check covered 202 files. Final `rtk mise run migration-check`
    passed 315 tests/1,853 assertions across 42 selected non-protected files.
    No migration-plan artifact added; no evals run.

## P06 — Split improvement, instruction, and contribution ownership

- [x] [COMPLETED] P06.01 Improve → standard, deep, security, plan, execution,
  reconcile, and seed-roadmap owners with exclusive outputs.
  - Evidence receipt (2026-08-23): split repository improvement into seven
    manual-only owners with exclusive report, exhaustive report, security
    report, standalone plan/index, isolated worktree diff, plan-index truth, and
    DRAFT roadmap outputs. Moved common audit policy to the generated canonical
    source, made ranking correctness-first, preserved the full standalone plan
    schema, and added immutable command sandboxes, atomic CAS write boundaries,
    bounded executor supervision, secret safety, duplicate history, and outward
    authority guards. Registry/docs agree on 72 skills (61 manual, 11
    model-policy), 18,662 total description characters, and 15,307 capped
    characters. Focused ownership/docs/reference proof passed 18 tests/160
    assertions; 54 sources produced 191 byte-identical destinations and 220
    generated docs checked. Final `rtk mise run migration-check` passed 321
    tests/1,963 assertions across 43 selected non-protected files. Fresh
    subagent verdict: PASS after plan-schema, planner-sandbox, and bounded
    execution corrections. No migration-plan artifact added; no evals run.
- [x] [COMPLETED] P06.02 Agents MD → add, audit, sync; retain `MODEL_POLICY` only on
  the existing named owner pending descendant approval, while mutation remains
  task-authorized only.
  - Evidence receipt (2026-08-23): narrowed the existing model-policy owner to
    one task-authorized rule addition with exact legacy audit/sync handoffs and
    zero automatic mutation authority; added manual-only read-only audit and
    one-approved-repair sync owners. Moved deletion/topology evidence to audit,
    kept placement/rule writing with add, and retained the hardened installed
    topology script for typed create/repair/verify operations. Failed topology
    transactions now expose partial mutation and recovery paths; multi-path
    publication is honestly sequential/recoverable, and all owners bind the
    loader-provided skill path and reject unresolved symlinks before resolution.
    Registry/docs agree on 74 skills (63 manual, 11 model-policy), 19,121 total
    description characters, and 15,656 capped characters. Focused ownership,
    topology, invocation, reference, documentation, and validation proof passed
    99 tests/786 assertions; 54 sources produced 193 byte-identical destinations
    and 226 generated docs checked. Final `rtk mise run migration-check` passed
    327 tests/2,006 assertions across 44 selected non-protected files. Fresh
    subagent verdict: PASS after recovery-receipt, sequential-publication, and
    installed-entrypoint identity corrections. No migration-plan artifact added;
    no evals run.
- [x] [COMPLETED] P06.03 Simplify → read-only audit and approved apply owner.
  - Evidence receipt (2026-08-23): split simplification into a manual-only,
    read-only audit owner and an exact-approved-set apply owner. Moved the
    simplification ladder byte-identically to audit while retaining behavior
    preservation solely with apply; legacy default/audit use on the old name
    routes without mutation. Apply now requires a pre-edit oracle, sequential
    per-path expected-preimage-to-owned-postimage CAS with receipts, bounded
    immutable proof commands, owned rollback, and an explicit
    `RECOVERY_REQUIRED` terminal state for surviving mutations. Review and
    improvement routes distinguish discovery from approved application.
    Registry/docs agree on 75 skills (64 manual, 11 model-policy), 19,306 total
    description characters, and 15,786 capped characters. Focused ownership,
    invocation, reference, documentation, and validation proof passed 71
    tests/489 assertions; 54 sources produced 194 byte-identical destinations
    and 229 generated docs checked. Final `rtk mise run migration-check` passed
    332 tests/2,051 assertions across 45 selected non-protected files. Fresh
    subagent verdict: PASS after production-path CAS, rollback-state,
    preservation-reference, and routing-copy corrections. No migration-plan
    artifact added; no evals run.
- [x] [COMPLETED] P06.04 Remediate → root-cause diagnosis/design and approved
  correction; merge rethink analysis and remove the old public name.
  - Evidence receipt (2026-08-23): created manual-only `tailrocks-root-cause`
    as the sole read-only owner of failed-guarantee proof, occurrence/escape
    causality, bounded sibling analysis, greenfield alternatives, structural
    measures, recovered purpose, break inventory, and approval-ready design.
    Narrowed `tailrocks-remediate` to one exact current user-approved correction
    with pre-edit instance/class oracles, bounded commands, sequential per-path
    CAS, fresh irreversible-action approval, resumable data migration, owned
    recovery, and honest partial state. Moved and distilled all diagnosis/design
    doctrine into the new owner without external-source references. Removed the
    public rethink skill and, per the user's no-deprecated-route rule, the prior
    checkout compatibility skill; their frozen eval bytes remain untouched and
    tooling now discovers only directories containing `SKILL.md`. Registry/docs
    agree on 74 skills (63 manual, 11 model-policy), 19,075 total description
    characters, and 15,610 capped characters. Focused ownership, checkout-command,
    invocation, reference, documentation, and validation proof passed 100
    tests/698 assertions; 54 sources produced 193 byte-identical destinations
    and 226 generated docs checked. Final `rtk mise run migration-check` passed
    338 tests/2,104 assertions across 46 selected non-protected files. Fresh
    subagent verdict: PASS after removing the stale checkout catalog promise.
    No migration-plan artifact added; no evals run.
- [x] [COMPLETED] P06.05 Contribute → recon, propose, prepare, submit, respond; keep
  fresh external-action approval at every outward boundary.
  - Evidence receipt (2026-08-23): replaced the combined public contribution
    owner with five manual-only stage owners and removed its deprecated public
    skill, metadata, references, script, docs, catalog, registry, and routes;
    frozen eval bytes remain inactive and untouched. Recon is read-only and now
    uses a zero-network plan receipt whose SHA-256 binds canonical input, exact
    ordered GET endpoints, fixed host/method, and installed entrypoint plus
    bounded-runner identities; execution requires that approved hash and
    rechecks it immediately before the first GET. Public-repository preflight,
    bounded failure semantics, allowlisted/redacted response projection, and
    per-endpoint receipts fail closed. Propose drafts only; prepare permits only
    unsigned local fork commits with per-path CAS and owned rollback; submit and
    respond each require fresh action-specific approval for every legal or
    outward mutation. A canonical handoff contract generates byte-identically
    to all five owners. Registry/docs agree on 78 skills (67 manual, 11
    model-policy), 20,060 total description characters, and 16,375 capped
    characters; 54 sources produced 202 byte-identical destinations and 238
    generated docs checked. Focused final proof passed 18 tests/152 assertions;
    final `rtk mise run migration-check` passed 356 tests/2,268 assertions
    across 48 selected non-protected files. Fresh subagent verdict: PASS after
    local-only prepare, public-target, failure/redaction, endpoint-approval, and
    plan/runtime TOCTOU corrections. No migration-plan artifact added; no evals
    run.
- [x] [COMPLETED] P06.06 Preserve skill-create as one evidence-to-wired-skill
  transaction; keep update and refactor exclusive from direct migration work.
  - Evidence receipt (2026-08-23): retained the four-owner manual-only authoring
    family and made create's placement-through-evidence, scaffold, semantic
    content, deterministic proof, and complete wiring one indivisible outcome.
    Create now refuses replacement-derived names, renames, splits, merges,
    retirements, transfers, aliases, and compatibility routes even when separate
    direct-migration authority exists. Update and refactor stop under every
    selector on any public-contract delta, return conversation-only
    `DIRECT_MIGRATION_REQUIRED` evidence with zero mutations, and never inherit
    migration authority. Removed stale migration/evaluation product routes from
    active audit movement and responsibility records; validator, scaffold, and
    published-routing gates now forbid their names, pages, and wiring. Canonical
    topology generated byte-identically to all four consumers. Registry/docs
    remain 78 skills (67 manual, 11 model-policy), 20,060 total description
    characters, and 16,375 capped characters; 54 sources produced 202
    byte-identical destinations and 238 generated docs checked. Focused proof
    passed 74 tests/403 assertions; final `rtk mise run migration-check` passed
    362 tests/2,312 assertions across 48 selected non-protected files. Fresh
    subagent verdict: PASS. No migration-plan artifact added; no evals run.
- [x] [COMPLETED] P06.GATE Prove every selector has one owner, no implicit invocation
  adds authority, and `rtk mise run migration-check` passes.
  - Evidence receipt (2026-08-23): focused ownership and invocation proof passed
    83 tests/1,009 assertions across 19 non-protected files, covering exclusive
    selectors, exhaustive registry ownership, the exact two-class invocation
    matrix, manual transaction owners, and zero authority gain for the eleven
    model-policy owners. The final family gate `rtk mise run migration-check`
    passed 362 tests/2,312 assertions across all 48 selected non-protected files,
    with 78 skills validated, 54 canonical sources generating 202 byte-identical
    destinations, and 238 generated docs current. Protected paths remained
    unchanged. No evals run.

## P07 — Split design and visual verification ownership

- [x] [COMPLETED] P07.01 macOS design → design/prototype/blessing, design review, and
  systematize; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
  - Evidence receipt (2026-08-23): split the existing macOS design owner into
    exclusive `design|prototype`, manual preliminary/acceptance review, and
    manual systematize owners. The base owner alone retains `MODEL_POLICY`;
    both descendants are `MANUAL_ONLY`. Removed the base owner's retired public
    review/systematize routes and moved their doctrine, report template, and
    source-neutral learning corpus to exact canonical owners. Review now binds
    independent reviewer/session identity, uses live-render evidence, and must
    pass before blessing; systematize applies only user-accepted, preimage-bound
    ledger rows with CAS-safe rollback. Registry/docs cover 80 skills (69
    manual, 11 model-policy), 20,521 total description characters, and 16,726
    capped characters; 73 sources produced 225 byte-identical destinations and
    244 generated docs checked. Focused proof passed 80 tests/670 assertions;
    final `rtk mise run migration-check` passed 367 tests/2,379 assertions
    across 49 selected non-protected files. Fresh subagent verdict: PASS.
    Protected paths unchanged; no evals run.
- [x] [COMPLETED] P07.02 Web design → design/blessing and design audit; retain
  `MODEL_POLICY` only on the existing named owner pending descendant approval.
  - Evidence receipt (2026-08-23): split the existing web design owner into
    exclusive `design`/human-blessing and manual read-only audit owners. The
    base alone retains `MODEL_POLICY`; the audit descendant is `MANUAL_ONLY`,
    returns one conversation report, and has no templates, mutation, blessing,
    capture, freeze, or taste authority. Removed the base `audit` selector
    immediately with no alias or redirect. Three canonical design-contract
    references generate byte-identically to the audit owner, where authoring and
    commit imperatives are criteria only. Base design now binds a synthetic-only
    allowed write set, exact blessing hashes/matrix/user/date, and CAS-safe
    publication/rollback. Audit live rendering requires an enforceably read-only
    disposable exact-revision subject, external writable state, owned loopback
    identity, and rejection of tracked, ignored, or untracked writes. Registry
    and docs cover 81 skills (70 manual, 11 model-policy), 20,754 total
    description characters, and 16,904 capped characters; 76 sources produced
    229 byte-identical destinations and 247 generated docs checked. Focused
    proof passed 84 tests/662 assertions; final
    `rtk mise run migration-check` passed 372 tests/2,434 assertions across 50
    selected non-protected files. Fresh subagent verdict: PASS. Protected paths
    unchanged; no evals run.
- [x] [COMPLETED] P07.03 Terminal design → design/blessing/golden freeze and design
  audit; retain `MODEL_POLICY` only on the existing named owner pending
  descendant approval.
  - Evidence receipt (2026-08-23): split the existing terminal design owner into
    exclusive design/human-blessing/golden-freeze and manual read-only audit
    owners. The base alone retains `MODEL_POLICY`; the audit descendant is
    `MANUAL_ONLY`, emits one conversation report, and owns no authoring,
    blessing, freeze, or mutation authority. Removed the base `audit` selector
    immediately with no alias or redirect. Four canonical terminal-design
    references and the runtime-trust contract generate byte-identically to the
    audit owner as criteria only. The base now binds the complete registry,
    view, fixture, frame, style, revision, and matrix identities; validates a
    bounded exact registry; renders twice; and publishes the whole golden
    directory with OS atomic no-replace swaps, identity/content CAS, and
    quarantine-before-delete cleanup. Adversarial proof preserves concurrent
    absent targets, altered stages, and post-quarantine replacements. Audit
    execution is locked, offline, disposable, exact-revision, and enforceably
    read-only with all writable tool state outside the subject. Registry and
    docs cover 82 skills (71 manual, 11 model-policy), 20,989 total description
    characters, and 17,084 capped characters; 80 sources produced 234
    byte-identical destinations and 250 generated docs checked. Focused proof
    passed 69 tests/286 assertions; final `rtk mise run migration-check` passed
    385 tests/2,550 assertions across 52 selected non-protected files. Fresh
    subagent verdict: PASS. Protected paths unchanged; no evals run.
- [x] [COMPLETED] P07.04 macOS visual verification → current-render verification,
  baseline, and regression; all remain `MANUAL_ONLY`.
  - Evidence receipt (2026-08-23): split the prior combined macOS visual owner
    into exclusive manual current-render verification, durable baseline, and
    read-only regression owners. Removed the old baseline/regression selectors
    and references immediately with no alias or redirect. Canonical harness,
    state-matrix, launch, match, and verification contracts generate only to
    their exact consumers. Current-render capture writes only external temporary
    evidence; baseline alone binds human blessing and publishes a full matrix
    with atomic no-replace/CAS cleanup; regression cannot approve or rebaseline.
    The shared harness now locks exact applications and global preference state,
    strips ambient secrets, bounds processes/output/image dimensions, validates
    regular capture artifacts, and emits canonical encoded recovery records.
    Adversarial proof preserves concurrent outputs and foreign replacements
    across second-link and output-parent races, including recovery paths with
    spaces and control characters. Registry and docs cover 84 skills (73 manual,
    11 model-policy), 21,529 total description characters, and 17,514 capped
    characters; 86 sources produced 254 byte-identical destinations and 256
    generated docs checked. Focused proof passed 106 tests/886 assertions; final
    `rtk mise run migration-check` passed 394 tests/2,662 assertions across 53
    selected non-protected files. Fresh subagent verdict: PASS. Protected paths
    unchanged; no evals run.
- [x] [COMPLETED] P07.05 Web visual verification → baseline and regression; both
  remain `MANUAL_ONLY`.
  - Evidence receipt (2026-08-23): replaced the combined web visual owner with
    exclusive manual baseline and read-only regression owners. Removed the old
    skill, generated documentation, catalog/registry entry, selectors, and
    published routes immediately with no alias or redirect; the validator now
    forbids resurrection while frozen legacy bytes remain inactive. Baseline
    accepts only `baseline`, requires but never installs the canonical harness,
    and owns durable blessed-matrix publication. Regression accepts only
    `regress` and owns no source, baseline, blessing, or update authority. The
    baseline-owned matrix contract projects byte-identically to regression;
    the script-owned harness contract projects to both; runtime trust reaches
    both; design-pipeline doctrine reaches baseline only. The deterministic
    supervisor exposes exact `baseline|regress` operations, resolves pinned
    local Bun/Vite/Playwright entrypoints, strips ambient child state, uses
    external regression output, owns the server process group, applies an
    absolute readiness deadline, and rechecks source identity after baseline
    publication. Registry and docs cover 85 skills (74 manual, 11 model-policy),
    21,790 total description characters, and 17,720 capped characters; 88
    sources produced 259 byte-identical destinations and 259 generated docs
    checked. Focused proof passed 103 tests/774 assertions; final
    `rtk mise run migration-check` passed 400 tests/2,725 assertions across 54
    selected non-protected files. Fresh subagent verdict: PASS. Protected paths
    unchanged; no evals run.
- [x] [COMPLETED] P07.06 Preserve human blessing, owned-process capture, appearance
  restoration, wrong-server refusal, and region-specific conformance rules.
  - Evidence receipt (2026-08-23): added one cross-family executable invariant
    contract over both split visual stacks. Human blessing remains external:
    both baselines consume the canonical user-only design pipeline; macOS
    `SIGNOFF.md` now binds prototype revision/package hash and the independent
    acceptance-review path/hash/PASS/reviewer/live-session identity; the web
    manifest binds revision, component/fixture/registry hashes, and the complete
    state/theme/viewport matrix. macOS capture still binds the real executable,
    launch token, exact PID, and exact window ID; the six-key typed appearance
    transaction preserves Auto, detects restore conflicts, and restores on every
    exit. Web capture behaviorally refuses occupied and stale servers plus a
    replaced post-Playwright guard before baseline publication. Both macOS
    baseline/regression routers now explicitly consume the generated region
    oracle: native/native-composed regions are structural; custom/content
    regions are pixel-budgeted. Web masks and budgets remain recorded contract
    fields. Focused proof passed 57 tests/445 assertions; final
    `rtk mise run migration-check` passed 407 tests/2,781 assertions across 55
    selected non-protected files. Fresh subagent verdict: PASS. Protected paths
    unchanged; no evals run.
- [x] [COMPLETED] P07.GATE Prove the exact eleven-skill model-policy set, manual
  descendant and visual-verification routing, one taste owner per medium, and
  `rtk mise run migration-check`.
  - Evidence receipt (2026-08-23): the registry's exact 11 `MODEL_POLICY`
    owners remain agents-md, Axum, GraphQL, grilling, gRPC, macOS design, Rust,
    Swift, terminal design, TypeScript, and web design. Every macOS
    review/systematize, web/terminal audit descendant, and all five macOS/web
    visual verification/baseline/regression owners are `MANUAL_ONLY` with the
    canonical metadata tuple. macOS, web, and terminal each retain exactly one
    model-policy taste owner; all old combined selectors and retired visual
    routes are absent from published surfaces. Generated-reference ownership,
    locks, catalog, registry, and generated docs agree. During the gate, a
    repeatable GUI race exposed that window resolution accepted a transient
    first sample; the structural fix requires four identical bounded window
    samples before capture, so delayed second windows become ambiguity instead
    of capture drift. Focused proof passed 110 tests/973 assertions; final
    `rtk mise run migration-check` passed 407 tests/2,782 assertions across 55
    selected non-protected files. Fresh subagent verdict: PASS. Protected paths
    unchanged; no evals run.

## P08 — Rehome repository audit and preserve compatibility

- [x] [COMPLETED] P08.01 Encode every invocation row and modifier from
  `content-movement-audit-retirement.md` in a deterministic route schema.
  - Evidence receipt (2026-08-23): added one ordered typed route schema covering
    all 28 exact current-target rows, the closed 13-category vocabulary,
    disjoint standard/security/platform-design partitions, explicit design
    media and sweep contexts, target argument templates, distinct preserved
    deep-operation clauses, and target-only non-interactive `--batch` semantics
    on every valid route. The schema contains no deprecated target or bare
    `deep` spelling. Focused proof passed 7 tests/142 assertions; fresh subagent
    verdict: PASS. The non-eval migration gate passed every schema and ownership
    check but its unrelated macOS GUI integration lane repeatedly stopped at
    host application activation (412 pass, 2 fail); P08.GATE retains the clean
    full-gate obligation and P09.15 owns that harness. Protected paths unchanged;
    no evals run.
- [x] [COMPLETED] P08.02 Route default/quick/category/batch to standard improve;
  whole-repository deep to improve-deep; security to improve-security.
  - Evidence receipt (2026-08-23): `tailrocks-improve` now directly owns default,
    quick, and the exact twelve non-deep categories; its three platform
    categories are objective/non-taste audits. Whole-repository deep and the
    exact nine standard deep categories route to `tailrocks-improve-deep`
    without a redundant depth flag. Security and security-deep route directly
    to `tailrocks-improve-security`. Every covered route preserves `--batch` as
    deterministic non-interactive selection with unchanged coverage,
    refutation, report oracle, and authority. Generated READMEs/docs agree.
    Focused proof passed 14 tests/299 assertions; fresh subagent verdict: PASS.
    The non-eval migration gate passed all changed/schema/generated checks but
    the unrelated macOS GUI lane retained the host activation failure (413 pass,
    2 fail), deferred to its explicit P09.15 harness row. Protected paths
    unchanged; no evals run.
- [x] [COMPLETED] P08.03 Route branch variants to PR review; next/ask variants to
  research; visual-conformance questions to the matching design owner.
  - Evidence receipt (2026-08-23): branch review now accepts the closed
    thirteen-category focus set and direct normal/deep/batch contracts; deep
    exhausts every changed package/path group and independently refutes retained
    findings. Research owns the fixed repository-direction question and verbatim
    targeted questions with distinct deep semantics and authority-neutral batch.
    Web, terminal, and macOS conformance owners accept exact subjects plus
    deep/batch directly; macOS conformance is bound to acceptance, and none
    accepts an old `ask` selector or dispatches another manual skill. The schema
    now includes ordered deep conformance compositions. Generated READMEs/docs
    agree. Focused proof passed 15 tests/387 assertions; fresh subagent verdict:
    PASS. The non-eval migration gate passed all changed/schema/generated checks
    but the unrelated macOS GUI lane retained the host activation failure (414
    pass, 2 fail), deferred to P09.15. Protected paths unchanged; no evals run.
- [x] [COMPLETED] P08.04 Route plan, seed, execute, plan-sweep, and roadmap-sweep to
  their exclusive owners, preserving deep and batch modifiers.
  - Evidence receipt (2026-08-23): plan, roadmap seed, isolated execution,
    standalone-plan reconciliation, and roadmap reconciliation now accept their
    subjects directly and reject the retired selector tokens. Batch removes
    interaction without weakening evidence, CAS, authorization, isolation,
    frozen-contract, output, or retirement gates. Deep plan and execution add
    their second independent reviewers; deep plan sweep re-verifies every index
    row; deep roadmap sweep re-verifies every row, criterion, blocker, and
    assumption without sampling or unchanged/empty-diff shortcuts. Seed has no
    deep route. Generated READMEs/docs agree. Focused proof passed 16 tests/466
    assertions; fresh subagent verdict: PASS. The non-eval migration gate passed
    all changed/schema/generated checks but the unrelated macOS GUI lane retained
    the host activation failure (415 pass, 2 fail), deferred to P09.15. Protected
    paths unchanged; no evals run.
- [x] [COMPLETED] P08.05 Refuse `quick --deep`, malformed modes, and multiple primary
  modes deterministically.
  - Evidence receipt (2026-08-23): added a pure internal strict resolver from
    structured historical intent to one exact current owner/argv receipt. It
    covers every valid base/deep/batch composition and returns typed refusals for
    unknown or duplicate modifiers, multiple primaries, quick/deep conflict,
    context mismatches, unknown categories/media, missing or flag-shaped
    payloads, unsupported depth, invalid immutable ranges, and invalid roadmap
    slugs. Own-key, dense-array, cardinality, prototype, revoked-proxy, inherited
    field, and billion-length sparse-array guards make untrusted input total and
    bounded. Resolutions contain no placeholders, invoke nothing, mutate nothing,
    and preserve target-only authority. Focused proof passed 11 tests/1,616
    assertions; fresh subagent verdict: PASS. The non-eval migration gate passed
    all changed/schema/generated checks but the unrelated macOS GUI lane retained
    the host activation failure (419 pass, 2 fail), deferred to P09.15. Protected
    paths unchanged; no evals run.
- [x] [COMPLETED] P08.06 Convert pipeline-free planning to `plans/`; remove roadmap
  goal/fingerprint mechanics from improve-plan and avoid empty rejection commits.
  - Evidence receipt (2026-08-23): `tailrocks-improve-plan` now stages exactly one
    standalone `plans/NNN-*.md` plus canonical `plans/README.md` row, cold-reviews
    final bytes before an atomic CAS publication, and binds normal/deep PASS
    receipts to one exact unnormalized UTF-8 SHA-256 prefix. Rejections update
    only the canonical rejected-findings ledger or return typed no-change; changed
    bound evidence fails closed without rewriting history. Roadmap items, goals,
    handoffs, statuses, fingerprints, branches, and empty commits are forbidden.
    Reconciliation preserves and revalidates the rejection ledger. Changed paths:
    improve-plan skill/reference/generated definition, improve-reconcile reference,
    and ownership tests. Focused proof passed 10 tests/339 assertions; validator
    passed 85 skills; fresh subagent verdict: PASS. The non-eval migration gate
    passed 420 tests and all static/generated checks; only the unrelated two macOS
    GUI activation cases failed, deferred to P09.15. Protected paths unchanged;
    no evals run or inspected.
- [x] [COMPLETED] P08.07 Remove retired public skill and mode surfaces; keep any
  frozen protected bytes untouched but undiscoverable and unrouteable.
  - Evidence receipt (2026-08-23): deleted all seven non-eval package files and
    both generated pages for the retired combined audit owner; removed its
    catalog, invocation, generated-reference, root, install, design, choosing,
    delivery, and retained-skill routes. Current public paths route directly to
    the improve, review, plan, seed, execution, and reconciliation owners. Active
    counts are 84 skills: 73 MANUAL_ONLY and 11 MODEL_POLICY; delivery has 10;
    generated references have 88 sources/258 destinations; docs check has 256
    destinations. One canonical retired-name set now blocks validation and
    scaffolding, recursively scans every active package surface while skipping
    only top-level frozen `evals/`, and permits an eval-only retired remnant
    without reading it. Focused proof passed 93 tests/903 assertions; validator
    passed 84 skills; fresh subagent verdict: PASS. The non-eval migration gate
    passed 424 tests and every static/generated/protected-path check; only the
    unrelated two macOS GUI activation cases failed, deferred to P09.15. Frozen
    bytes unchanged and unrouteable; no evals run or inspected.
- [x] [COMPLETED] P08.GATE Table-test every route and refusal, synchronize generated
  surfaces, and run `rtk mise run migration-check`.
  - Evidence receipt (2026-08-23): the pure resolver now table-tests every valid
    schema route with and without batch, both orders for deep+batch, and canonical
    target argv. Every refusal code crosses its applicable empty/batch/deep/both
    modifier vectors; multiple primaries, quick/deep, seed/deep, duplicate
    batch/deep pairs and triples, unknown-plus-valid precedence, malformed
    bounded inputs, and mutation-free determinism are explicit. Focused route
    proof passed 23 tests/2,389 assertions; fresh subagent verdict: PASS.
    Generated references checked 88 sources/258 byte-identical destinations;
    generated docs checked 256 files; validator passed 84 skills; protected-path
    check passed all 183 frozen paths with zero changes. The full non-eval
    migration gate passed 425 tests/5,063 assertions and every static/generated
    check; only the unrelated two macOS GUI activation cases failed, deferred to
    P09.15. No evals run or inspected.

## P09 — Repair every retained public contract

- [x] [COMPLETED] P09.01 `tailrocks-agents-md`: deterministic add/audit/sync ownership
  and symlink parity tests.
  - Evidence receipt (2026-08-23): existing migrated contracts already satisfy
    the row without source churn. The MODEL_POLICY owner adds one authorized rule;
    manual audit is read-only; manual sync applies one approved repair. All three
    resolve the installed topology script by loader identity. Deterministic tests
    cover sorted discovery without mutation, missing/regular/wrong/broken/looped
    client parity, exact same-directory link creation, expected-target repair,
    stale and non-symlink refusal, CAS ownership, rollback/recovery artifacts,
    concurrent replacement, parent swap/escape, and typed CLI/nonzero verify
    receipts. A late fresh review exposed the final-cleanup race: repair now uses
    a post-cleanup identity check as its success linearization point and recreates
    the original restore artifact when an unowned client replacement forces
    refusal. The adversarial boundary test preserves both the foreign client and
    original raw-target recovery evidence. Focused proof passed 22 tests/112
    assertions; validator passed 84
    skills; references checked 88 sources/258 byte-identical destinations; docs
    checked 256 files; fresh subagent verdict: PASS. The non-eval migration gate
    passed 426 tests/5,067 assertions and every static/generated check; only the
    unrelated two macOS GUI activation cases failed, deferred to P09.15. No evals
    run or inspected.
- [x] [COMPLETED] P09.02 `tailrocks-axum-best-practices`: unique build/review/refactor
  routes, outputs, refusals, invocation, and argument hints.
  - Evidence receipt (2026-08-23): the MODEL_POLICY build owner, MANUAL_ONLY
    read-only review owner, and MANUAL_ONLY behavior-preserving refactor owner
    already hold exclusive contracts and byte-identical canonical Axum references.
    Strengthened family proof now locks every exact argument hint, the distinct
    build/findings/delta output, both invalid-selector handoffs per owner,
    refactor's findings-only refusal, registry classes, PR-review routing, and
    generated-reference topology. Focused proof passed 9 tests/189 assertions;
    validator passed 84 skills; references checked 88 sources/258 byte-identical
    destinations; docs checked 256 files; fresh subagent verdict: PASS. No evals
    run or inspected.
- [x] [COMPLETED] P09.03 `tailrocks-brainstorm`: deterministic DRAFT/SHAPING and
  interactive/batch frontier transitions using temporary item trees.
  - Evidence receipt (2026-08-23): added the installed `brainstorm-state.ts`
    state/frontier owner with exact `<roadmap-slug> [--batch]` parsing,
    canonical four-column roadmap-index parity, transactional DRAFT-to-SHAPING
    publication, SHAPING preservation, and zero-mutation refusal for missing,
    malformed, mismatched, READY-and-later, symlinked, raced, or deep-invalid
    input. Its closed typed turn protocol selects one stable ready node
    interactively or the whole current frontier in batch, defers dependencies
    until the next recorded round, publishes exact ordered answers against an
    item/index CAS read-set, rejects structural injection and invalid calendar
    dates, and never grants READY. Directory-identity-anchored reads, parent-swap
    tests, and a staged installed-layout entrypoint proof bind execution to the
    loader-derived non-symlink script rather than a repository lookalike.
    Focused proof passed 22 tests/239 assertions; validator passed 84 skills;
    references checked 88 sources/258 byte-identical destinations; docs checked
    256 files; fresh subagent verdict: PASS. The non-eval migration gate passed
    442 tests/5,166 assertions and every static/generated check; only the same
    two unrelated macOS GUI activation cases failed, owned by P09.15. No evals
    run or inspected.
- [x] [COMPLETED] P09.04 Checkout command: temporary repositories and mocked
  hosting/Git receipts through the deterministic script; no public skill alias.
  - Evidence receipt (2026-08-23): CLI/default-runner fixtures now create real
    temporary Git repositories with committed main and pull-request branches,
    then route exact argv through executable mocked Git and hosting commands.
    Success proves one checkout plus the real final branch/OID; dirty-tree and
    no-match receipts prove zero hosting mutation and preserve the real branch
    and HEAD. The retired checkout owner remains eval-only and inactive, while
    the centralized retired-name set now prevents its public owner or route from
    being recreated through validation or scaffolding. Focused proof passed 89
    tests/397 assertions; validator passed 84 skills; references checked 88
    sources/258 byte-identical destinations; docs checked 256 files; fresh
    subagent verdict: PASS. The non-eval migration gate passed 446 tests/5,187
    assertions and every static/generated check; only the same two unrelated
    macOS GUI activation cases failed, owned by P09.15. No evals run or
    inspected.
- [x] [COMPLETED] P09.05 `tailrocks-code-health`: machine-owned version and ratchet
  predicates plus unique owner hints.
  - Evidence receipt (2026-08-23): added one loader-derived, non-symlink
    `code-health-predicate.ts` entrypoint with closed numeric, presence, and
    semantic-version input schemas. Establishment freezes the exact measured
    bound/set and oracle; audit distinguishes growth from stale generosity;
    tightening accepts only the exact lower measured state with the same oracle.
    Version facts classify current, behind, prerelease, incompatible, vulnerable,
    and delayed states while refusing malformed, duplicate, overflowed, unstable,
    or contradictory latest/fixed facts. Bounded stdin, deterministic sorted
    identities, typed one-line receipts, no target mutation, and installed-layout
    trust tests close the executable boundary. Mutation and audit keep distinct
    exact hints/prompts, consume the same predicate, and retain exclusive write
    versus read-only authority. Focused proof passed 14 tests/81 assertions;
    validator passed 84 skills; references checked 88 sources/258 byte-identical
    destinations; docs checked 256 files; fresh subagent verdict: PASS. The
    non-eval migration gate passed 455 tests/5,230 assertions and every
    static/generated check; only the same two unrelated macOS GUI activation
    cases failed, owned by P09.15. No evals run or inspected.
- [x] [COMPLETED] P09.06 `tailrocks-contribute`: five stage scripts with temporary
  repository state and mocked external receipts.
  - Evidence receipt (2026-08-23): added five direct installed entrypoints over
    one closed stage-transition core; no umbrella dispatcher or deprecated route
    remains, and validation/scaffolding now forbid resurrecting the retired
    owner while preserving its five current descendants. Real temporary Git
    repositories prove the complete recon → propose → prepare → submit → respond
    chain against exact fork/target remotes, base ancestry, clean HEAD, sorted
    diff, and handoff separation. Local-only propose/prepare reject every action,
    approval, and receipt; outward stages bind canonical repository target,
    actor, credential scope, purpose, payload, before-state, five-minute unique
    approval, and immutable successful receipt. Fixed-system Git, scrubbed
    configuration, loader-owned pre-import bootstraps, complete copied-lookalike
    refusal, hashed runtime dependencies, incremental capped/deadlined stdin,
    exact producer-stage predecessors, successor-state refusal, empty recon,
    replay rejection, anchored predecessor read-sets, CAS rollback, and exact
    partial/recovery receipts close the trust and race boundaries. Focused proof
    passed 95 tests/641 assertions; validator passed 84 skills; references checked
    88 sources/258 byte-identical destinations; docs checked 256 files; fresh
    subagent verdict: PASS. The non-eval migration gate passed 468 tests/5,430
    assertions and every static/generated check; only the same two unrelated
    macOS GUI activation cases failed, owned by P09.15. No evals run or
    inspected.
- [x] [COMPLETED] P09.07 `tailrocks-create-pr`: bounded non-vacuous pre-open gate and
  mocked remote receipts.
  - Evidence receipt (2026-08-23): added the direct installed
    `scripts/create-pr.ts` entrypoint, focused integration and ownership tests,
    command documentation, updated source skill, and generated documentation.
    The closed input binds actor/head ownership, repository, exact local and
    remote base/head SHAs, immutable HTTPS push URL, title, draft state,
    required trailers, fatal-UTF-8 body digest, and bounded gate/proof argv.
    Gates run with scrubbed Git materialization in an exact disposable clone,
    network denial, secret scrubbing, and confined writes; failed or zero-unit
    gates reach no remote mutation. Remote receipts prove actor, base, absent
    existing PR, immutable SHA push, post-failure remote discovery, a final
    immediately-pre-create head check, immutable body stdin, and rendered PR
    identity. Adversarial tests cover mutation, network, secrets, global smudge
    config, local/remote races, body replacement, invalid UTF-8, partial push,
    and render mismatch. Focused proof passed 20 tests/66 assertions; validator
    passed 84 skills; references checked 88 sources/258 byte-identical
    destinations; docs checked 256 files; fresh subagent verdict: PASS. The
    non-eval migration gate passed 488 tests/5,496 assertions and every
    static/generated check; only the same two unrelated macOS GUI activation
    cases failed, owned by P09.15. No evals run or inspected.
- [x] [COMPLETED] P09.08 `tailrocks-document`: deterministic final-order predicate and
  documentation discovery tests.
  - Evidence receipt (2026-08-23): added the bounded typed
    `documentation-discovery.ts` tree inventory and made both the document-only
    check and full merge preflight consume it with the same ancestry predicate.
    Merge-base ∪ HEAD discovery retains deleted surfaces; covers nested README
    sets, docs and alternate content trees, API contracts, assets, navigation,
    every generator marker, governing rules, and command sources; exposes
    unmatched prose; and rejects unsafe paths, symlinks, submodules, duplicates,
    and saturation. Unknown paths remain doc-worthy. The shared predicate now
    validates unique history ending at exact HEAD before `not_needed`, and
    `--check` explicitly consumes it rather than using a weaker prose oracle.
    Real temporary Git histories prove byte-identical document/merge predicate
    fields for covered, stale, not-needed, and merge-graph cases. Updated the
    source skill, merge command documentation, generated documentation, and
    ownership tests; no deprecated route or alias was added. Focused proof
    passed 25 tests/89 assertions; validator passed 84 skills; references
    checked 88 sources/258 byte-identical destinations; docs checked 256 files;
    fresh subagent verdict: PASS. The non-eval migration gate passed 495
    tests/5,537 assertions and every static/generated check; only the same two
    unrelated macOS GUI activation cases failed, owned by P09.15. No evals run
    or inspected.
- [x] [COMPLETED] P09.09 `tailrocks-finalize`: machine-owned readiness/state
  transitions for DRAFT, SHAPING, READY, live, and batch paths.
  - Evidence receipt (2026-08-23): added the installed
    `finalize-state.ts` command as sole `SHAPING` → `READY` writer and extracted
    the shared anchored roadmap state primitive already used by brainstorming.
    Closed digest-bound input and terminal receipt schemas cover DRAFT routing,
    SHAPING assessment/publication, READY idempotence, later and mismatched
    refusal, deterministic interactive versus batch frontiers, exact live-human
    answer receipts, per-checklist live-section evidence, and exact planning
    inventories extracted from the bound item. Compare-and-swap publication
    changes only item and index statuses together; unsafe installed identities,
    symlinks, stale state, malformed sections, unconsumed prose, fabricated
    inventories, and directory replacement races fail closed. No deprecated
    route or alias was retained. Focused proof passed 27 tests/165 assertions;
    validator passed 84 skills; references checked 88 sources/258
    byte-identical destinations; docs checked 256 files; fresh subagent verdict:
    PASS. The non-eval migration gate passed 506 tests/5,609 assertions and
    every static/generated check; only the same two unrelated macOS GUI
    activation cases failed, owned by P09.15. No evals run or inspected.
- [x] [COMPLETED] P09.10 `tailrocks-graphql-best-practices`: unique evolution/review
  ownership, invocation, output, refusal, and hints.
  - Evidence receipt (2026-08-23): made public-API evolution and read-only
    findings terminal, mutually exclusive authorities. Review/audit, requested
    mutation, internal-service contracts, and unresolved targets now refuse
    without mutation and route to exactly one current GraphQL or gRPC owner.
    Added distinct closed `GraphQL Evolution Report` and `GraphQL Findings`
    output grammars, positive execution counts, honest skipped gates, exact
    argument hints, and tests covering invocation classes, prompts, catalog,
    choosing guide, PR dispatch, generated docs, and canonical references. No
    deprecated route or alias remains. Focused proof passed 4 tests/75
    assertions; validator passed 84 skills; references checked 88 sources/258
    byte-identical destinations; docs checked 256 files; fresh subagent verdict:
    PASS. The non-eval migration gate passed 507 tests/5,656 assertions and
    every static/generated check; only the same two unrelated macOS GUI
    activation cases failed, owned by P09.15. No evals run or inspected.
- [ ] [IN_PROGRESS] P09.11 `tailrocks-grpc-best-practices`: unique evolution/review
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
- [ ] [TODO] P09.24 `tailrocks-root-cause`/`tailrocks-remediate`: exclusive
  diagnosis versus approved correction, with no deprecated public route.
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
- [ ] [TODO] P09.42 `tailrocks-audit`: remove the retired public owner and prove
  any frozen protected bytes are undiscoverable.
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
- [ ] [TODO] P10.06 Prove retired public names and routes are absent while frozen
  protected bytes remain untouched and undiscoverable.
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
