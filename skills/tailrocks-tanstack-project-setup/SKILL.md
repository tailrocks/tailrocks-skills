---
name: tailrocks-tanstack-project-setup
description: >-
  Use only when the user explicitly requests this skill. Scaffold a new Bun-only TanStack Start application with TypeScript 7, Oxc, Router/Query, shadcn/ui, Tailwind CSS v4, tests, and CI. Refuse existing apps; use the audit, migrate, or remediate owner instead.
argument-hint: "<new application destination and requirements>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# TanStack Project Setup

Scaffold one new frontend stack: Bun, TypeScript 7, TanStack Start/Router/Query,
React, shadcn/ui, Tailwind CSS v4, and Oxc. This owner creates a new application;
it never audits, migrates, or repairs an existing tree.

The app is a thin UI over a Rust backend. Server routes/functions validate input,
call the backend through its GraphQL public API, and shape UI responses. Product
behavior stays in Rust.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Apply [`shared-version-policy.md`](references/shared-version-policy.md)
and [`version-policy.md`](references/version-policy.md) before resolving pins.
Copied policy narrows execution; it never enlarges this scaffold-only authority.

## Scaffold

1. **Bind an empty destination.** Resolve the canonical destination and refuse if
   it contains an application, lockfile, manifest, source, or concurrent user
   content. Existing apps route without inspection or mutation to
   `tailrocks-tanstack-project-audit`, `tailrocks-tanstack-project-migrate`, or
   `tailrocks-tanstack-project-remediate` according to the requested outcome.
   **Complete when:** destination identity and exclusive creation authority are explicit.
2. **Resolve the baseline.** Read
   [`stack-and-layout.md`](references/stack-and-layout.md),
   [`tooling-and-quality.md`](references/tooling-and-quality.md),
   [`boundaries-and-data.md`](references/boundaries-and-data.md), and
   [`shadcn-ui.md`](references/shadcn-ui.md). Resolve stable official releases
   through Bun with the local version resolver; verify peer and release
   compatibility and require its canonical-template check to pass.
   **Complete when:** every direct pin has current official evidence.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
3. **Stage the application.** Use the official TanStack Start generator through
   Bun in an owner-only temporary directory, then reconcile it against the
   canonical files under [`templates/`](templates/). Initialize shadcn through
   its pinned CLI. Bound network, retries, output, time, and child processes;
   send TERM then KILL on expiry. Do not publish partial output. **Complete
   when:** staged bytes have one owner and preserve generated route plumbing.
4. **Establish boundaries and ownership.** Validate server/client inputs,
   environment access, route/search params, forms, and external responses.
   Router owns route lifecycle; Query owns interactive or invalidated remote
   state through one shared query-options factory. **Complete when:** secrets
   cannot reach clients and every remote datum has one cache owner.
5. **Publish transactionally.** Re-prove the destination is absent and its parent
   identity is unchanged; publish with compare-and-swap semantics without
   replacing concurrent bytes. On failure, remove only bytes this invocation
   still owns and report retained recovery paths.
   **Complete when:** destination is complete or unchanged.
6. **Gate and report.** Run Bun install/CI, format check, TypeScript 7 check,
   type-aware Oxc lint, architecture and unused-code/dependency gates, Bun tests,
   and production build. Report created paths, exact versions, command/test counts,
   skips, and residual risk. **Complete when:** every applicable gate has evidence.

## Final gate

Prove Bun-only commands, exact compatible pins and lockfile, strict TypeScript 7
and Oxc/Oxfmt, generated routes, server/client separation, validated data, single
cache ownership, shadcn semantic composition, SSR safety, tests, build, and no
pre-existing or concurrent byte overwritten.
