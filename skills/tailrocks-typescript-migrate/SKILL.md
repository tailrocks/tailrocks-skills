---
name: tailrocks-typescript-migrate
description: >-
  Use only when the user explicitly requests this skill. Migrate TypeScript or JavaScript source contracts to strict TypeScript 7 semantics in compatibility-safe slices after Bun/TanStack project tooling is established. Preserve behavior and backend ownership.
argument-hint: "<TypeScript compatibility migration target>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TypeScript Migrate

Migrate source-level language contracts directly in never-broken slices. This
owner produces migrated code and proof, never a migration-plan artifact. It does
not own package manager, compiler/lint configuration, exact pins, locks, CI, or
application layout; route those changes to `tailrocks-tanstack-project-migrate`.

Apply [`runtime-trust.md`](references/runtime-trust.md) and
[`migration.md`](references/migration.md). Copied policy does not enlarge scope.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Migrate

1. **Prove the project prerequisite.** Require a Bun-owned TypeScript 7 baseline
   or completed project-migration slice. A foreign lockfile is blocker evidence,
   never permission to run npm, pnpm, or yarn. **Complete when:** source changes
   cannot compete for project-tooling ownership.
2. **Bind compatibility.** Record source/target contracts, allowed paths and
   preimages, public types, runtime outputs/errors, state transitions,
   rendering/accessibility, async effects, Rust/GraphQL boundaries, rollback
   boundary, and independent before/after oracle. **Complete when:** behavior and
   approved intentional deltas are explicit.
3. **Execute never-broken source slices.** Seal unsafe boundaries; introduce
   parsed presentation values; close state/failure unions; localize mutation and
   async ownership; migrate callers; remove a shim only after all consumers pass.
   Stage owner-only writes and compare-and-swap unchanged paths. **Complete when:**
   each slice is runnable and reversible.
4. **Prove and report each slice.** Run the same focused oracle and affected
   existing Bun gates with bounded time/output/processes and no inferred fetch or
   codegen. Restore only still-owned bytes on failure or retain named recovery
   evidence. Report slices, preserved flows, approved breaks, skips, and residual
   shims. **Complete when:** strict semantics pass without ownership drift.

## Final gate

No foreign toolchain execution, project-config ownership, hidden behavior change,
broad suppression, concurrent overwrite, migration-plan artifact, or duplicated
Rust business rule.
