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
- [ ] [IN_PROGRESS] P05.07 TypeScript best practices → write, review, refactor, migrate;
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
