# Invocation policy

- Status: **CONFIRMED AND IMPLEMENTED**
- Audited source SHA: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- Reconciled: `2026-08-22`
- Scope: all 58 published skills

`invocation-registry.json` is the executable authority. It has exactly two
classes and exactly one sorted row for every skill:

1. **MANUAL_ONLY** — a transaction or workflow the user must deliberately
   start. The model may recommend it but does not select it.
2. **MODEL_POLICY** — policy or conversation guidance selected only under its
   exact trigger. Selection grants no authority beyond the active task.

Direct invocation of model-policy owners remains available where the client
supports it. This repository guarantees discovery policy, not identical client
menus. There is no pending, dual, or inherited invocation class.

## Confirmed model-policy owners

| Skill | Exact trigger boundary |
|---|---|
| `tailrocks-agents-md` | Instruction rules or instruction-file topology is already in scope. |
| `tailrocks-axum-best-practices` | Building or changing Axum HTTP adapter behavior, Tower policy, lifecycle, or transport tests is already in scope. |
| `tailrocks-graphql-best-practices` | Evolving a public GraphQL schema, Juniper resolver, SDL contract, pagination, or generated web client is already in scope. |
| `tailrocks-grilling` | The user asks to be grilled, challenged, interrogated, or stress-tested before action. |
| `tailrocks-grpc-best-practices` | Evolving a cross-service proto, Buf contract, tonic/prost adapter, deadline, streaming, health, or wire test is already in scope. |
| `tailrocks-macos-design` | Native macOS screen structure, material, component mapping, prototype, or design review is already in scope. |
| `tailrocks-rust-best-practices` | Writing new or changing existing Rust behavior is already in scope. |
| `tailrocks-swift-best-practices` | Swift, SwiftUI, concurrency, accessibility, or a narrow AppKit bridge is already in scope. |
| `tailrocks-tui-design` | Ratatui screens, terminal UX, fixture galleries, golden frames, or terminal design review are already in scope. |
| `tailrocks-typescript-best-practices` | TypeScript, TSX, React state, validation, async ownership, or API work is already in scope. |
| `tailrocks-web-design` | TanStack screens, design routes, shadcn/ui composition, visual fixtures, or web design review is already in scope. |

Every other skill is `MANUAL_ONLY`. A new skill or split descendant defaults
manual and requires a separately confirmed exact trigger before entering model
policy.

## Authority boundaries

- Model selection never grants write, mutation, blessing, commit, push,
  release, publication, external-message, or external-system authority.
- The best-practice owners constrain work already authorized; they do not start
  setup, refactoring, review, or implementation on their own.
- Instruction-policy selection never authorizes add or sync mutation.
- Design-policy selection never authorizes artifact writes, human blessing,
  freeze, capture, or production mutation.
- Visual-verification owners remain manual-only and are not design owners.
- `tailrocks-grilling` is conversation-only. It retrieves facts, leaves choices
  to the user, requires explicit confirmation, and ends without executing.

## Client metadata contract

`MANUAL_ONLY` uses the full explicit-request description guard,
`disable-model-invocation: true`, `user-invocable: true`, and Codex
`policy.allow_implicit_invocation: false`.

`MODEL_POLICY` uses an exact trigger description, omits the Claude disable
field, retains `user-invocable: true`, and sets Codex
`policy.allow_implicit_invocation: true`. Neither class receives tools, hooks,
dynamic commands, or authority through metadata.

Clients that ignore per-skill policy rely on descriptions. Manual-only
descriptions retain the measured full guard sentence; model-policy descriptions
carry exact positive triggers and structural zero-authority boundaries in their
routers.

## Grilling ownership

`tailrocks-grilling` owns only a numbered, dependency-ordered conversation:
every frontier question carries a recommendation, lookupable facts are retrieved
by the agent, decisions remain with the user, and the final map requires explicit
confirmation. It writes no artifact and changes no status.

Durable roadmap shaping routes to `tailrocks-brainstorm`; only
`tailrocks-finalize` grants READY; reusable sourced research routes to
`tailrocks-research`; implementation packages route to `tailrocks-plan`; and
medium-specific design plus blessing route to the matching macOS, web, or
terminal design owner. A named handoff invokes nothing and grants no authority.
