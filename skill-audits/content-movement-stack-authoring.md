# Final content movement receipts — stack, improvement, and authoring

Source revision: `2626d51827747c3b3e0e76cd20a7d38363c82648`.

Final-state ledger, not migration plan. Mixed owners were split directly;
deprecated routes, migration-product owners, per-skill README files, and skill
eval trees were deleted.

| Source | Operation | Final target | Checker | Result |
|---|---|---|---|---|
| Rust project scaffold/audit/remediate | SPLIT | `skills/tailrocks-rust-project-{setup,audit,remediate}/SKILL.md` | `scripts/stack-ownership-routing.test.ts` | PASS: lifecycle authority exclusive |
| Rust code write/review/refactor | SPLIT | `skills/tailrocks-rust-best-practices/SKILL.md`; `skills/tailrocks-rust-{review,refactor}/SKILL.md` | `scripts/rust-language-ownership.test.ts` | PASS: selectors and consumers exclusive |
| Axum build/review/refactor | SPLIT | `skills/tailrocks-axum-best-practices/SKILL.md`; `skills/tailrocks-axum-{review,refactor}/SKILL.md` | `scripts/axum-ownership.test.ts` | PASS: three authorities exclusive |
| GraphQL build/review | SPLIT | `skills/tailrocks-graphql-best-practices/SKILL.md`; `skills/tailrocks-graphql-review/SKILL.md` | `scripts/graphql-ownership.test.ts` | PASS: build/review exclusive |
| gRPC build/review | SPLIT | `skills/tailrocks-grpc-best-practices/SKILL.md`; `skills/tailrocks-grpc-review/SKILL.md` | `scripts/grpc-ownership.test.ts` | PASS: build/review exclusive |
| TypeScript write/review/refactor/migrate | SPLIT | `skills/tailrocks-typescript-best-practices/SKILL.md`; `skills/tailrocks-typescript-{review,refactor,migrate}/SKILL.md` | `scripts/typescript-ownership.test.ts` | PASS: configuration stays with setup |
| TanStack setup/audit/migrate/remediate | SPLIT | `skills/tailrocks-tanstack-project-{setup,audit,migrate,remediate}/SKILL.md` | `scripts/tanstack-project-ownership.test.ts` | PASS: lifecycle selectors exclusive |
| Swift write/review/refactor/Rust boundary | SPLIT | `skills/tailrocks-swift-best-practices/SKILL.md`; `skills/tailrocks-swift-{review,refactor,rust-core-boundary}/SKILL.md` | `scripts/swift-language-ownership.test.ts` | PASS: language/Rust authorities exclusive |
| Swift setup/audit/remediate/Rust setup/agent integration | SPLIT | `skills/tailrocks-swift-project-{setup,audit,remediate}/SKILL.md`; `skills/tailrocks-swift-{rust-core-setup,agent-integration}/SKILL.md` | `scripts/swift-project-ownership.test.ts` | PASS: five authorities exclusive |
| Code-health establish/audit | SPLIT | `skills/tailrocks-code-health/SKILL.md`; `skills/tailrocks-code-health-audit/SKILL.md` | `scripts/code-health-ownership.test.ts`; `scripts/code-health-predicate.test.ts` | PASS: mutation/inspection separated |
| AGENTS add/audit/sync | SPLIT | `skills/tailrocks-agents-md/SKILL.md`; `skills/tailrocks-agents-md-{audit,sync}/SKILL.md` | `scripts/agents-md-ownership.test.ts`; `scripts/agents-md-topology.test.ts` | PASS: outputs and topology transactions exclusive |
| Defect diagnosis/correction | SPLIT | `skills/tailrocks-root-cause/SKILL.md`; `skills/tailrocks-remediate/SKILL.md` | `scripts/remediation-ownership.test.ts` | PASS: diagnosis read-only, correction approved |
| Simplification discovery/application | SPLIT | `skills/tailrocks-simplify-audit/SKILL.md`; `skills/tailrocks-simplify/SKILL.md` | `scripts/simplify-ownership.test.ts` | PASS: finding grants no write authority |
| Skill collection audit | KEEP | `skills/tailrocks-skill-audit/SKILL.md` | `scripts/audit-report-identity.test.ts` | PASS: deterministic identity/publication |
| Skill creation | MOVE | `skills/tailrocks-skill-create/SKILL.md` | `scripts/scaffold-skill.test.ts`; `scripts/skill-authoring-routing.test.ts` | PASS: atomic placement and creation |
| Skill behavior-preserving restructure | MOVE | `skills/tailrocks-skill-refactor/SKILL.md` | `scripts/skill-authoring-routing.test.ts` | PASS: contracts preserved, no migration plan |
| Skill bounded semantic update | MOVE | `skills/tailrocks-skill-update/SKILL.md` | `scripts/skill-authoring-routing.test.ts` | PASS: sibling inventory and gates required |
| Contribution lifecycle | SPLIT | `skills/tailrocks-contribute-{recon,propose,prepare,submit,respond}/SKILL.md` | `scripts/contribute-ownership.test.ts` | PASS: external mutations separately authorized |
| Shared runtime trust | MOVE | `shared/references/runtime-trust.md` and generated consumers | `scripts/generate-references.test.ts` | PASS: exhaustive byte equality |
| Shared latest-stable policy | MOVE | `shared/references/version-policy.md` and generated consumers | reference/version tests | PASS: doctrine and ecosystem pins agree |
| Obsolete migration-product owner and route | DELETE | Absent from packages, catalogs, docs | `scripts/skill-authoring-routing.test.ts`; `scripts/validate-skills.test.ts` | PASS: resurrection rejected |
| Deprecated aliases and redirects | DELETE | Absent from published routes | ownership tests; `scripts/validate-skills.test.ts` | PASS: only current owners discoverable |
| Per-skill README and eval surfaces | DELETE | Absent from every skill package | `scripts/validate-skills.test.ts`; `scripts/run-tests.test.ts` | PASS: forbidden and never selected |

Final proof: `rtk mise run migration-check` passed 602 tests and 6,255
assertions across 77 non-eval test files on 2026-08-23.
