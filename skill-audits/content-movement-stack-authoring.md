# Exact content movement — stack, improvement, and authoring skills

- Source revision: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- `C-mode`: remove an old mode only after exact old-to-new routing, direct/composed evals, pinned evidence, regenerated catalog/docs, and an announced compatibility window pass.
- `C-retire`: apply `C-mode`, then delete the old skill directory/catalog entry; retain a rollback alias through the window.
- `C-ref`: remove an old reference/template path only when every consumer resolves the canonical target and link/package validation passes.
- New owners and aliases ship in `v0.28.0`; `C-mode`, `C-retire`, and remaining old-path deletion occur exactly in `v1.0.0`. Failed evidence delays `v1.0.0`; it never permits silent early removal.
- Current validation forbids links escaping a skill directory. Therefore “consume canonical” below always means: author once in the named repository-owned source, generate a skill-local packaged copy, and byte-validate it. No sibling skill links another sibling's private file.

## Cross-cutting surfaces

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Each retained base `SKILL.md:1-9` name | KEEP | Same fully qualified base `SKILL.md` path named in its section | Rewrite description and argument hint to only the retained outcome. Behavioral phrases move with their rows below. |
| Each split mode's source description/argument phrase | MOVE | New target `SKILL.md:1-9` named in that mode's row | New frontmatter is source-neutral, explicit-request guarded, and contains only its target outcome. |
| Each mixed final gate | MOVE | Clause-by-clause to the owner of the behavior named by the clause | The compatibility alias keeps only exact routing and zero-mutation gates. No outcome clause remains unassigned. |
| Runtime-trust/secrets paragraph in every affected router | MOVE | Authored `shared/references/runtime-trust.md` | Generated destinations are enumerated below; validator proves them byte-identical before any alias is removed. |
| Common latest-stable sentence in ecosystem version/toolchain references | MOVE | Authored `shared/references/version-policy.md` | Generated destinations are enumerated below; ecosystem-specific sources, resolution rules, and fallback facts remain with setup owners. |

### Generated shared-reference destinations

| Authored source | Op | Exact generated targets | Gate |
|---|---:|---|---|
| `shared/references/runtime-trust.md` | COPY | `skills/{tailrocks-rust-project-setup,tailrocks-rust-project-audit,tailrocks-rust-project-remediate,tailrocks-rust-best-practices,tailrocks-rust-review,tailrocks-rust-refactor,tailrocks-axum-best-practices,tailrocks-axum-review,tailrocks-axum-refactor,tailrocks-graphql-best-practices,tailrocks-graphql-review,tailrocks-grpc-best-practices,tailrocks-grpc-review,tailrocks-tanstack-project-setup,tailrocks-tanstack-project-audit,tailrocks-tanstack-project-migrate,tailrocks-tanstack-project-remediate,tailrocks-typescript-best-practices,tailrocks-typescript-review,tailrocks-typescript-refactor,tailrocks-typescript-migrate,tailrocks-swift-best-practices,tailrocks-swift-review,tailrocks-swift-refactor,tailrocks-swift-rust-core-boundary,tailrocks-swift-project-setup,tailrocks-swift-project-audit,tailrocks-swift-project-remediate,tailrocks-swift-agent-integration,tailrocks-swift-rust-core-setup,tailrocks-code-health,tailrocks-code-health-audit,tailrocks-improve,tailrocks-improve-deep,tailrocks-improve-security,tailrocks-improve-plan,tailrocks-improve-execution,tailrocks-improve-reconcile,tailrocks-seed-roadmap,tailrocks-agents-md,tailrocks-agents-md-audit,tailrocks-agents-md-sync,tailrocks-simplify,tailrocks-simplify-audit,tailrocks-root-cause,tailrocks-remediate,tailrocks-contribute-recon,tailrocks-contribute-propose,tailrocks-contribute-prepare,tailrocks-contribute-submit,tailrocks-contribute-respond,tailrocks-skill-refactor,tailrocks-skill-migration-plan,tailrocks-skill-migrate}/references/runtime-trust.md` | Generator manifest expands every path; byte equality and no extra local edits are validated. |
| `shared/references/version-policy.md` | COPY | `skills/{tailrocks-rust-project-setup,tailrocks-rust-project-audit,tailrocks-rust-project-remediate,tailrocks-tanstack-project-setup,tailrocks-tanstack-project-audit,tailrocks-tanstack-project-migrate,tailrocks-tanstack-project-remediate,tailrocks-swift-project-setup,tailrocks-swift-project-audit,tailrocks-swift-project-remediate,tailrocks-swift-rust-core-setup,tailrocks-code-health,tailrocks-code-health-audit}/references/shared-version-policy.md` | Distinct path cannot collide with ecosystem adapters; generator manifest expands every path and validates byte equality. |

## `tailrocks-rust-project-setup`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, `## Copy-ready baseline`, `## New workspace`, scaffold mode/gate | KEEP | `skills/tailrocks-rust-project-setup/SKILL.md` | Base becomes scaffold-only. |
| Audit mode and audit projection of `## Existing workspace audit and remediation` | MOVE | `skills/tailrocks-rust-project-audit/SKILL.md` | `C-mode`; old `audit` redirects. |
| Remediate mode, approved mutation half of existing-workspace section | MOVE | `skills/tailrocks-rust-project-remediate/SKILL.md` | `C-mode`; old `remediate` redirects. |
| Rust-specific parts of `references/{version-policy,workspace-and-layout,lints-clippy-rustfmt,toolchain-and-mise,supply-chain-and-testing}.md`, `templates/**`, `scripts/resolve-crate-versions.ts` | KEEP | Identical relative paths under `skills/tailrocks-rust-project-setup/` | Audit/remediate receive generated local copies; common version sentence follows cross-cutting row. |
| Those five retained Rust reference files | COPY | Same filenames under `skills/tailrocks-rust-project-audit/references/` and `skills/tailrocks-rust-project-remediate/references/` | Generate from retained source and byte-check. |
| Eval ID `1` + fixture `1/Cargo.toml` | MOVE | `skills/tailrocks-rust-project-audit/evals/evals.json` + `skills/tailrocks-rust-project-audit/evals/fixtures/1/Cargo.toml` | Keep legacy case through window. |
| Eval IDs `2-3` | KEEP | `skills/tailrocks-rust-project-setup/evals/evals.json` | Scaffold cases. |

## `tailrocks-rust-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, write clause, steps 2-6 mutation path, change report, final gate | KEEP | `skills/tailrocks-rust-best-practices/SKILL.md` | Base becomes write-only. |
| Review clauses in steps 1/3/6/7; `references/review-checklist.md` | MOVE | `skills/tailrocks-rust-review/SKILL.md` + `skills/tailrocks-rust-review/references/review-checklist.md` | `C-mode` and `C-ref`; old `review` redirects. |
| Refactor clauses in steps 1/5-7 and preservation oracle | MOVE | `skills/tailrocks-rust-refactor/SKILL.md` | `C-mode`; old `refactor` redirects. |
| `references/{ownership-performance,api-design,errors-testing-docs,readability-style-architecture,tooling-lints}.md` | KEEP | Identical fully qualified paths under `skills/tailrocks-rust-best-practices/references/` | New owners receive generated local copies. |
| Those five retained Rust language references | COPY | Same filenames under `skills/tailrocks-rust-review/references/` and `skills/tailrocks-rust-refactor/references/` | Generate from retained source and byte-check. |
| Eval IDs `1,4` | MOVE | `skills/tailrocks-rust-review/evals/evals.json` | Preserve old IDs as `legacy_id` through `C-mode`. |
| Fixture `skills/tailrocks-rust-best-practices/evals/fixtures/1/**` | KEEP | Same path | Required by retained ID 3 until it is rewritten or relocated. |
| Same fixture content for review IDs 1/4 | COPY | `skills/tailrocks-rust-review/evals/fixtures/1/**` | Delete the base copy only after ID 3 moves and `C-ref` passes. |
| Eval ID `2` + fixture `2/**` | MOVE | `skills/tailrocks-rust-refactor/evals/evals.json` + `skills/tailrocks-rust-refactor/evals/fixtures/2/**` | `C-mode`. |
| Eval ID `3` | KEEP | `skills/tailrocks-rust-best-practices/evals/evals.json` | Routing control. |

## `tailrocks-axum-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, build path, final gate | KEEP | `skills/tailrocks-axum-best-practices/SKILL.md` | Base becomes build-only. |
| Review clauses in steps 1/5/7 | MOVE | `skills/tailrocks-axum-review/SKILL.md` | Old review route until `C-mode`. |
| Refactor clause and preservation contract | MOVE | `skills/tailrocks-axum-refactor/SKILL.md` | Old refactor route until `C-mode`. |
| `references/{architecture-and-state,extractors-and-errors,middleware-and-security,lifecycle-and-testing}.md` | KEEP | Identical fully qualified paths under `skills/tailrocks-axum-best-practices/references/` | Review/refactor receive generated local copies. |
| Those four retained Axum references | COPY | Same filenames under `skills/tailrocks-axum-review/references/` and `skills/tailrocks-axum-refactor/references/` | Generate from retained source and byte-check. |
| Eval IDs `1,4` | MOVE | `skills/tailrocks-axum-review/evals/evals.json` | `C-mode`. |
| Fixture `skills/tailrocks-axum-best-practices/evals/fixtures/1/**` | COPY | `skills/tailrocks-axum-review/evals/fixtures/1/**` | Keep original while base ID 3 refers to it; delete only after rewrite and `C-ref`. |
| Eval ID `2` + fixture `2/**` | MOVE | `skills/tailrocks-axum-refactor/evals/evals.json` + `skills/tailrocks-axum-refactor/evals/fixtures/2/**` | `C-mode`. |
| Eval ID `3` | KEEP | `skills/tailrocks-axum-best-practices/evals/evals.json` | Non-Axum routing control. |

## `tailrocks-graphql-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, write path, API boundaries, write gate; all four references | KEEP | `skills/tailrocks-graphql-best-practices/SKILL.md` and current `references/` paths | Base owns public GraphQL evolution; review gets generated local reference copies. |
| `references/{schema-design,server-rust,client-tanstack,contract-gates}.md` | COPY | Same filenames under `skills/tailrocks-graphql-review/references/` | Generate from retained source and byte-check. |
| Review/audit clauses and read-only boundary | MOVE | `skills/tailrocks-graphql-review/SKILL.md` | Both old selectors redirect until `C-mode`. |
| Eval ID `1` + `fixtures/review-service/**` | MOVE | `skills/tailrocks-graphql-review/evals/evals.json` + `skills/tailrocks-graphql-review/evals/fixtures/review-service/**` | `C-mode`. |
| Eval IDs `2-4` | KEEP | `skills/tailrocks-graphql-best-practices/evals/evals.json` | Mutation/routing cases. |

## `tailrocks-grpc-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, write path, boundaries/gate; all three references | KEEP | `skills/tailrocks-grpc-best-practices/SKILL.md` and current `references/` paths | Base owns internal gRPC evolution; review gets generated local reference copies. |
| `references/{proto-contracts,tonic-server-client,operations}.md` | COPY | Same filenames under `skills/tailrocks-grpc-review/references/` | Generate from retained source and byte-check. |
| Review/audit clauses and read-only report | MOVE | `skills/tailrocks-grpc-review/SKILL.md` | Both selectors redirect until `C-mode`. |
| Eval ID `1` | MOVE | `skills/tailrocks-grpc-review/evals/evals.json` | `C-mode`. |
| Fixture `skills/tailrocks-grpc-best-practices/evals/fixtures/1/**` | COPY | `skills/tailrocks-grpc-review/evals/fixtures/1/**` | Keep original for retained ID 2 until rewritten; delete duplicate at `C-ref`. |
| Eval IDs `2-3` + fixture `3/**` | KEEP | `skills/tailrocks-grpc-best-practices/evals/evals.json` + `skills/tailrocks-grpc-best-practices/evals/fixtures/3/**` | — |

## `tailrocks-tanstack-project-setup`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, copy-ready baseline, scaffold mode/path/gate | KEEP | `skills/tailrocks-tanstack-project-setup/SKILL.md` | Base becomes scaffold-only. |
| Audit mode/read-only projection | MOVE | `skills/tailrocks-tanstack-project-audit/SKILL.md` | Old `audit` redirects until `C-mode`. |
| Migrate mode/existing-app transition | MOVE | `skills/tailrocks-tanstack-project-migrate/SKILL.md` | Old `migrate` redirects until `C-mode`. |
| Remediate mode/approved-gap mutation | MOVE | `skills/tailrocks-tanstack-project-remediate/SKILL.md` | Old `remediate` redirects until `C-mode`. |
| `references/migration-checklist.md` | MOVE | `skills/tailrocks-tanstack-project-migrate/references/migration-checklist.md` | `C-ref`. |
| TanStack-specific parts of `references/{version-policy,stack-and-layout,tooling-and-quality,boundaries-and-data,shadcn-ui}.md`, `templates/**`, `scripts/resolve-package-versions.ts` | KEEP | Identical relative paths under `skills/tailrocks-tanstack-project-setup/` | Other owners receive generated local copies; common version sentence follows cross-cutting row. |
| Those five retained TanStack references | COPY | Same filenames under `skills/tailrocks-tanstack-project-audit/references/`, `skills/tailrocks-tanstack-project-migrate/references/`, and `skills/tailrocks-tanstack-project-remediate/references/` | Generate from retained source and byte-check. |
| Eval ID `1` + fixture `1/package.json` | MOVE | `skills/tailrocks-tanstack-project-audit/evals/evals.json` + `skills/tailrocks-tanstack-project-audit/evals/fixtures/1/package.json` | `C-mode`. |
| Eval IDs `2-3` | KEEP | `skills/tailrocks-tanstack-project-setup/evals/evals.json` | Scaffold cases. |

## `tailrocks-typescript-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Language/UI introduction, write path, language gate | KEEP | `skills/tailrocks-typescript-best-practices/SKILL.md` | Base becomes write-only. |
| Review clause/order/reporting | MOVE | `skills/tailrocks-typescript-review/SKILL.md` | Old `review` redirects until `C-mode`. |
| Refactor clause/preservation path | MOVE | `skills/tailrocks-typescript-refactor/SKILL.md` | Old `refactor` redirects until `C-mode`. |
| Migrate clause, non-Bun blocker, migration-risk clauses | MOVE | `skills/tailrocks-typescript-migrate/SKILL.md` | Old `migrate` redirects until `C-mode`. |
| `references/compiler-lint-testing.md:1-47` | MOVE | Merge into `skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md` | Delete parallel copy at `C-ref`. |
| Same file lines 49-52 | MOVE | `skills/tailrocks-typescript-best-practices/references/testing.md` | `C-ref`. |
| Same file lines 54-64 | MOVE | `skills/tailrocks-typescript-migrate/references/migration.md` | `C-ref`. |
| `references/{state-and-errors,boundaries-and-domain-values,mutation-and-api-safety,react-and-async}.md` | KEEP | Identical fully qualified paths under `skills/tailrocks-typescript-best-practices/references/` | Review/refactor receive generated local copies. |
| Those four retained TypeScript references | COPY | Same filenames under `skills/tailrocks-typescript-review/references/` and `skills/tailrocks-typescript-refactor/references/` | Generate from retained source and byte-check. |
| Eval IDs `1,3` + fixture `1/**` | MOVE | `skills/tailrocks-typescript-review/evals/evals.json` + `skills/tailrocks-typescript-review/evals/fixtures/1/**` | `C-mode`. |
| Eval ID `2` + fixture `2/**` | MOVE | `skills/tailrocks-typescript-refactor/evals/evals.json` + `skills/tailrocks-typescript-refactor/evals/fixtures/2/**` | `C-mode`. |

## `tailrocks-swift-best-practices`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Write mode and implementation sections/gate | KEEP | `skills/tailrocks-swift-best-practices/SKILL.md` | Base becomes write-only. |
| Review mode/checklist except Rust-core bullet; audit/report clauses | MOVE | `skills/tailrocks-swift-review/SKILL.md` | Old `review` redirects until `C-mode`. |
| Refactor mode/preservation contract | MOVE | `skills/tailrocks-swift-refactor/SKILL.md` | Old `refactor` redirects until `C-mode`. |
| `## Rust core boundary`, its review bullet, `references/{rust-core-boundary,apple-platform-shell}.md` | MOVE | `skills/tailrocks-swift-rust-core-boundary/SKILL.md` + same filenames under its `references/` | Old boundary route until `C-mode`; refs at `C-ref`. |
| `references/{concurrency,swiftui,appkit-interop,errors-and-api,accessibility}.md` | KEEP | Identical fully qualified paths under `skills/tailrocks-swift-best-practices/references/` | Review/refactor receive generated local copies. |
| Those five retained Swift references | COPY | Same filenames under `skills/tailrocks-swift-review/references/` and `skills/tailrocks-swift-refactor/references/` | Generate from retained source and byte-check. |
| Eval IDs `1,5-6` + fixture `1/ListView.swift` | MOVE | `skills/tailrocks-swift-review/evals/evals.json` + `skills/tailrocks-swift-review/evals/fixtures/1/ListView.swift` | `C-mode`. |
| Eval ID `7` | MOVE | `skills/tailrocks-swift-rust-core-boundary/evals/evals.json` | `C-mode`. |
| Eval IDs `2-4` | KEEP | `skills/tailrocks-swift-best-practices/evals/evals.json` | Write cases. |

## `tailrocks-swift-project-setup`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Baseline/scaffold path, traps, scaffold gate | KEEP | `skills/tailrocks-swift-project-setup/SKILL.md` | Base becomes scaffold-only. |
| Audit mode/read-only existing-project projection | MOVE | `skills/tailrocks-swift-project-audit/SKILL.md` | Old `audit` redirects until `C-mode`. |
| Remediate mode/approved existing-project mutation | MOVE | `skills/tailrocks-swift-project-remediate/SKILL.md` | Old `remediate` redirects until `C-mode`. |
| New-project step 5 + `references/agent-integration.md` | MOVE | `skills/tailrocks-swift-agent-integration/SKILL.md` + `skills/tailrocks-swift-agent-integration/references/agent-integration.md` | Old setup route until `C-mode`; `C-ref`. |
| `## Rust-core lane` + `references/rust-core.md` | MOVE | `skills/tailrocks-swift-rust-core-setup/SKILL.md` + `skills/tailrocks-swift-rust-core-setup/references/rust-core.md` | Old setup route until `C-mode`; `C-ref`. |
| `references/{toolchain,project-generation,lint-and-format,testing}.md` and `templates/**` | KEEP | Identical relative paths under `skills/tailrocks-swift-project-setup/` | Audit/remediate receive generated local copies; common version rule follows cross-cutting row. |
| Those four retained Swift setup references | COPY | Same filenames under `skills/tailrocks-swift-project-audit/references/` and `skills/tailrocks-swift-project-remediate/references/` | Generate from retained source and byte-check. |
| Eval ID `2` + fixtures `2/{project.yml,mise.toml}` | MOVE | `skills/tailrocks-swift-project-audit/evals/evals.json` + matching paths under `skills/tailrocks-swift-project-audit/evals/fixtures/2/` | `C-mode`. |
| Eval ID `5` | MOVE | `skills/tailrocks-swift-project-remediate/evals/evals.json` | `C-mode`. |
| Eval ID `7` | MOVE | `skills/tailrocks-swift-rust-core-setup/evals/evals.json` | `C-mode`. |
| Eval IDs `1,3,4,6` | KEEP | `skills/tailrocks-swift-project-setup/evals/evals.json` | Scaffold/routing. |

## `tailrocks-code-health`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Establish/tighten path, copy-ready baseline, mutation steps/gate; `references/{architecture-and-docs,ratchets-and-baselines,defects-flakes-and-reports,verification-lanes}.md`; `templates/**` | KEEP | Identical paths under `skills/tailrocks-code-health/` | Own one approved ratchet mutation. |
| General latest-stable and supply-chain policy in `references/versions-and-dependencies.md` | MOVE | Authored `shared/references/version-policy.md` | One shared policy source; generated destination is assigned by the COPY row above. |
| Minimum-release-age rule at `references/versions-and-dependencies.md:27-29` | DELETE | Remove; it conflicts with the decided latest-stable policy | Validator prevents reintroduction. |
| Code-health-specific version ratchet adapter remaining in that file | KEEP | `skills/tailrocks-code-health/references/versions-and-dependencies.md` | Contains only monotonic measurement/enforcement mechanics. |
| Code-health audit projection of retained reference policy | COPY | Same filenames under `skills/tailrocks-code-health-audit/references/` | Generate only applicable read-only sections and byte-check each declared source slice. |
| Audit mode and read-only inventory/baseline/report projection | MOVE | `skills/tailrocks-code-health-audit/SKILL.md` | Old `audit` redirects until `C-mode`. |
| Eval ID `1` + fixture `1/flaky-tests.toml` | MOVE | `skills/tailrocks-code-health-audit/evals/evals.json` + `skills/tailrocks-code-health-audit/evals/fixtures/1/flaky-tests.toml` | `C-mode`. |
| Eval IDs `2-3` + fixture `2/architecture.json` | KEEP | `skills/tailrocks-code-health/evals/evals.json` + `skills/tailrocks-code-health/evals/fixtures/2/architecture.json` | Mutation cases. |

## `tailrocks-improve`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Frontmatter audit phrase, introduction's audit/evidence clauses, default/quick clauses after deleting plan promises, workflow steps 1-3, rank/report half of step 4, evidence/repository-data/repo-neutral/skill-authoring hard rules, findings-table output, audit-only final-gate clauses | KEEP | `skills/tailrocks-improve/SKILL.md` | Rewrite to terminate at one verified audit report. Quick folds into bounded default. Non-security focus, including direction, remains a filter of the same report oracle. |
| Every planning phrase in frontmatter/argument hint/introduction/default/quick; step 1's plan-gate projection; selection half of step 4; all step 5; plan-write hard rules; plan output rows; plan clauses of `## Final gate`; `references/plan-format.md` | MOVE | `skills/tailrocks-improve-plan/SKILL.md` + `skills/tailrocks-improve-plan/references/plan-format.md` | Old `plan` redirects until `C-mode`; no planning promise remains in base. |
| Deep clause/exhaustive fanout | MOVE | `skills/tailrocks-improve-deep/SKILL.md` | Old `deep` redirects until `C-mode`. |
| Security focus and security-only threat/rubric section of playbook | MOVE | `skills/tailrocks-improve-security/SKILL.md` + `skills/tailrocks-improve-security/references/security-rubric.md` | Old `security` redirects until `C-mode`; universal secret/runtime boundary follows the cross-cutting generated rule in every target. |
| Reconcile clause, step 6, index rules | MOVE | `skills/tailrocks-improve-reconcile/SKILL.md` | Old `reconcile` redirects until `C-mode`. |
| Execution refusal/handoff contract | COPY | `skills/tailrocks-improve-execution/SKILL.md` | Implementation mechanics come from retired audit executor; no old executable improve route. |
| Negative roadmap boundary in introduction/hard rules/final gate | KEEP | `skills/tailrocks-improve/SKILL.md` | Update stale `tailrocks-audit` route to: never seed here; explicitly hand verified report to `tailrocks-seed-roadmap`. Seed-roadmap's positive workflow comes only from the audit-retirement manifest. |
| Common non-security lane schema in `references/audit-playbook.md` | MOVE | Authored `shared/references/repository-audit-lanes.md`; generated copies at `skills/tailrocks-improve/references/repository-audit-lanes.md` and `skills/tailrocks-improve-deep/references/repository-audit-lanes.md` | Current cross-skill links are forbidden; generation/byte check required. |
| Eval ID `1` | MOVE | `skills/tailrocks-skill-migrate/evals/workflows/improve-audit-plan.json` | Delete compatibility case after direct split-route proof. |
| Eval ID `2` | MOVE | `skills/tailrocks-improve-plan/evals/evals.json` | `C-mode`. |
| Eval IDs `3-4`; fixture `1/**` | KEEP | `skills/tailrocks-improve/evals/evals.json` + `skills/tailrocks-improve/evals/fixtures/1/**` | Other target cases get explicit copies only when their fixture oracle differs. |
| Eval ID `5` | MOVE | `skills/tailrocks-improve-security/evals/evals.json` | `C-mode`. |
| Eval ID `6` | MOVE | `skills/tailrocks-improve-reconcile/evals/evals.json` | `C-mode`. |

## `tailrocks-agents-md`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Add mode, rule-writing path/output; non-delete `references/rule-writing.md`; owning-directory/create-file portion of `references/placement-and-topology.md` | KEEP | `skills/tailrocks-agents-md/SKILL.md` and those fully qualified reference paths | Base adds one rule. |
| Audit mode/read-only paths/output; `rule-writing.md ## Deleting`; topology audit prose | MOVE | `skills/tailrocks-agents-md-audit/SKILL.md`, `skills/tailrocks-agents-md-audit/references/deletion-evidence.md`, and `skills/tailrocks-agents-md-audit/references/topology-audit.md` | Old `audit` redirects until `C-mode`; refs at `C-ref`. |
| Sync mode/approved repair | MOVE | `skills/tailrocks-agents-md-sync/SKILL.md` | Old `sync` redirects until `C-mode`. |
| Exact symlink discovery/create/repair/verify mechanics | MOVE | `scripts/agents-md-topology.ts` | Skills consume typed plan/result after parity tests. |
| Eval IDs `1-2,4` + fixture `1/**` | KEEP | `skills/tailrocks-agents-md/evals/evals.json` + `skills/tailrocks-agents-md/evals/fixtures/1/**` | Add cases. |
| Eval ID `5` | MOVE | `skills/tailrocks-agents-md-audit/evals/evals.json` | `C-mode`. |
| Eval ID `3` | MOVE | `skills/tailrocks-agents-md-sync/evals/evals.json` | `C-mode`. |

## `tailrocks-simplify`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Audit/default mode, intro, steps 1-6, read-only output/gate; `simplification-ladder.md` | MOVE | `skills/tailrocks-simplify-audit/SKILL.md` + `skills/tailrocks-simplify-audit/references/simplification-ladder.md` | Old default/audit redirects until `C-mode`; ref at `C-ref`. |
| Apply mode, authorization, steps 7-8, mutation output/gate; `references/behavior-preservation.md` | KEEP | `skills/tailrocks-simplify/SKILL.md` + `skills/tailrocks-simplify/references/behavior-preservation.md` | Base becomes approved-removal executor. |
| Eval IDs `1-4` + fixture `1/**` | MOVE | `skills/tailrocks-simplify-audit/evals/evals.json` + `skills/tailrocks-simplify-audit/evals/fixtures/1/**` | `C-mode`. |
| Eval ID `5` | KEEP | `skills/tailrocks-simplify/evals/evals.json` | Apply case. |

## `tailrocks-remediate` and `tailrocks-rethink`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Remediate analyze mode, causal workflow steps/output, `principles-and-evidence.md` | MOVE | `skills/tailrocks-root-cause/SKILL.md` + `skills/tailrocks-root-cause/references/principles-and-evidence.md` | Old analyze route until `C-mode`; ref at `C-ref`. |
| Remediate fix mode, containment/execution/verification/gate | KEEP | `skills/tailrocks-remediate/SKILL.md` | Base becomes approved correction executor. |
| Remediate eval IDs `1-2,5` + fixture `1/**` | MOVE | `skills/tailrocks-root-cause/evals/evals.json` + `skills/tailrocks-root-cause/evals/fixtures/1/**` | `C-mode`. |
| Remediate eval IDs `3-4` | KEEP | `skills/tailrocks-remediate/evals/evals.json` | Fix cases. |
| Rethink frontmatter/introduction, audit mode, steps 1-7, audit half of step 8, audit output rows, final-gate lines 123-127, both references, eval IDs `1-3,5` + fixture `1/**` | MOVE | `skills/tailrocks-root-cause/SKILL.md`, same filenames under its `references/`, and `skills/tailrocks-root-cause/evals/` | Whole old skill aliases root-cause/remediate until `C-retire`. |
| Rethink rebuild argument/mode, authorization lines 41-46, rebuild half of step 8/output, final-gate line 128, eval ID `4` | MOVE | `skills/tailrocks-remediate/SKILL.md` + `skills/tailrocks-remediate/evals/evals.json` | Explicit rebuild redirect until `C-retire`. |
| `skills/tailrocks-rethink/{SKILL.md,agents/openai.yaml,README.md,evals/evals.json}` and old catalog/docs rows | DELETE | Remove those exact surfaces after `C-retire` | Alias package only during window. |

## `tailrocks-contribute`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Frontmatter name and argument dispatcher | KEEP | Temporary `skills/tailrocks-contribute/SKILL.md` alias | Split description/argument phrases into target frontmatter; alias only prints exact replacement command. |
| Introduction lines 11-15 and shared durable-handoff/trust boundary | MOVE | Authored `shared/references/contribution-handoff.md` | `C-ref`; no sibling-private links. |
| Shared contribution handoff | COPY | `skills/tailrocks-contribute-recon/references/contribution-handoff.md`, `skills/tailrocks-contribute-propose/references/contribution-handoff.md`, `skills/tailrocks-contribute-prepare/references/contribution-handoff.md`, `skills/tailrocks-contribute-submit/references/contribution-handoff.md`, `skills/tailrocks-contribute-respond/references/contribution-handoff.md` | Generate and byte-check against shared source. |
| `recon`; `project-contract.md`; `scripts/gh-recon.ts`; final-gate “recon is current” | MOVE | `skills/tailrocks-contribute-recon/SKILL.md`, `skills/tailrocks-contribute-recon/references/project-contract.md`, `skills/tailrocks-contribute-recon/scripts/gh-recon.ts` | Old selector until `C-retire`. |
| `propose`; hard stops; `etiquette-and-hard-stops.md`; final-gate named-artifact/alternatives clause | MOVE | `skills/tailrocks-contribute-propose/SKILL.md` + `skills/tailrocks-contribute-propose/references/etiquette-and-hard-stops.md` | Old selector until `C-retire`. |
| `prepare`; local mutation gate; `submission-gate.md:3-24`; final-gate `contrib/`-absent clause | MOVE | `skills/tailrocks-contribute-prepare/SKILL.md` + `skills/tailrocks-contribute-prepare/references/preparation-gate.md` | Old selector until `C-retire`. |
| `submit`; fresh approval/DCO/outward action; `submission-gate.md:26-35`; final-gate approval/disclosure clauses | MOVE | `skills/tailrocks-contribute-submit/SKILL.md` + `skills/tailrocks-contribute-submit/references/submission-protocol.md` | Old selector until `C-retire`. |
| `respond`; follow-through; `review-response.md`; final-gate latest-state log clause | MOVE | `skills/tailrocks-contribute-respond/SKILL.md` + `skills/tailrocks-contribute-respond/references/review-response.md` | Old selector until `C-retire`. |
| Eval ID `1` | MOVE | `skills/tailrocks-skill-migrate/evals/workflows/contribute-lifecycle.json` | Delete after composed-route proof. |
| Eval IDs `2-4` + fixtures `2-4/**` | MOVE | `skills/tailrocks-contribute-propose/evals/evals.json` + `skills/tailrocks-contribute-propose/evals/fixtures/{2,3,4}/**` | `C-retire`. |
| Eval IDs `5,7` | MOVE | `skills/tailrocks-contribute-submit/evals/evals.json` | `C-retire`. |
| Eval ID `6` | MOVE | `skills/tailrocks-contribute-prepare/evals/evals.json` | `C-retire`. |
| Eval ID `8` + fixture `8/review.json` | MOVE | `skills/tailrocks-contribute-respond/evals/evals.json` + `skills/tailrocks-contribute-respond/evals/fixtures/8/review.json` | `C-retire`. |
| `skills/tailrocks-contribute/{SKILL.md,agents/openai.yaml,README.md,evals/evals.json}` and old catalog/docs rows | DELETE | Remove those exact surfaces after `C-retire` | Compatibility dispatcher only. |

## `tailrocks-skill-refactor`

| Current surface | Op | Exact target | Gate |
|---|---:|---|---|
| Introduction, steps 1-2, contract-preserving branches, red flags, final gate | KEEP | `skills/tailrocks-skill-refactor/SKILL.md` | Behavior-preserving topology only. |
| `skills/tailrocks-skill-audit/references/design-doctrine.md` shared operational/topology/context doctrine | MOVE | Split by subject into `skill-authoring/references/{operational-contract,responsibility-topology,context-routing}.md` | Audit loses private doctrine ownership. |
| `skills/tailrocks-skill-audit/references/testing-doctrine.md` | MOVE | `skill-authoring/references/testing-reliability.md` | One authored reliability source. |
| `skills/tailrocks-skill-audit/references/house-wiring.md` | MOVE | `skill-authoring/references/house-wiring.md` | One authored wiring source. |
| Refactor's current doctrine dependencies | COPY | Generated `skills/tailrocks-skill-refactor/references/{operational-contract,responsibility-topology,testing-reliability,house-wiring}.md` | Source-hash and byte validation required; no audit-private dependency. |
| Contract-delta branch and durable handoff; `templates/migration-contract.md` | MOVE | `skills/tailrocks-skill-migration-plan/SKILL.md` + `skills/tailrocks-skill-migration-plan/templates/migration-contract.md` | Old contract-delta route until `C-mode`; template at `C-ref`. |
| Current stop/do-not-execute boundary | COPY | `skills/tailrocks-skill-migrate/SKILL.md` as inverse explicit authority | New owner executes approved migration; no old executable alias. |
| Eval IDs `1-3` + fixture `1/**` | MOVE | `skills/tailrocks-skill-update/evals/evals.json` + `skills/tailrocks-skill-update/evals/fixtures/1/**` | They test semantic DESC/RTR updates, not topology. |
| `skills/tailrocks-skill-refactor/evals/evals.json` after those moves | DELETE | Replace `skills/tailrocks-skill-refactor/evals/evals.json` with split/merge/extract, keep-together, and contract-delta-handoff cases | Must happen before portfolio migration uses refactor. |

## Generated surfaces

For every section above, retain the base metadata/generated README/catalog entry when the base remains. Generate each new skill's `agents/openai.yaml`, README/docs page, catalog/installation/choosing entry, and eval manifest. Remove old mode metadata only at `C-mode`; remove retired-skill surfaces only at `C-retire`.
