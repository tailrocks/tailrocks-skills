---
name: tailrocks-typescript-refactor
description: >-
  Use only when the user explicitly requests this skill. Refactor TypeScript 7 and React code while preserving observable behavior, public types, errors, state transitions, rendering, accessibility, async effects, and Rust/GraphQL boundaries.
argument-hint: "<TypeScript refactor target and preserved behavior>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TypeScript Refactor

Restructure TypeScript/React code only after a preservation oracle exists. Refuse
new behavior, public-contract or expectation changes, review-only output, source
migration, dependency changes, and project-tooling changes.

Apply [`runtime-trust.md`](references/runtime-trust.md), then load only relevant
local language references. Copied policy does not enlarge the approved scope.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Refactor

1. **Freeze behavior.** Bind repository/revision, exact paths and preimages,
   public types, runtime outputs/errors, state transitions, rendered/accessibility
   behavior, async ordering/cancellation/effect lifetimes, storage, performance
   budgets, and current focused proof. Run the narrow oracle before editing.
   **Complete when:** regression is observable.
2. **Name the structural defect.** Identify duplicated ownership, mixed
   responsibilities, invalid representability, unsafe aliasing, or tangled async
   lifetime and the measure that disappears. **Complete when:** the change has one
   structural purpose and no behavior intent.
3. **Stage the minimum restructure.** Preserve public and serialized contracts,
   state/error variants, failure semantics, rendering, and Rust-owned behavior.
   Capture preimages; compare-and-swap only unchanged approved files; never
   overwrite concurrent bytes. **Complete when:** the named condition disappears.
4. **Prove preservation.** Re-run the identical oracle plus affected existing Bun
   gates under bounded time/output. On failure restore only still-owned bytes or
   retain named recovery evidence. Report changed structure, removed measure,
   proof, and residual risk. **Complete when:** unexplained drift is zero.

## Final gate

Same behavior, types, errors, rendering, accessibility, async ownership, and
backend boundary; less structural surface; no concurrent byte overwritten.
