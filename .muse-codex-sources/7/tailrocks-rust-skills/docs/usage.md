# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The review skill shows the shape on
each client:

```text
/tailrocks-rust-skills:tailrocks-rust-review src/parser.rs
$tailrocks-rust-review src/parser.rs
/skill:tailrocks-rust-review src/parser.rs
/tailrocks-rust-review src/parser.rs
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. Amp has no slash invoke: ask the thread
for the exact qualified skill by name. OpenCode has no slash
picker either: request the skill by name in the prompt.

The ten user-only skills need an explicit human command on every
client. A model must not select them from task similarity.

## Skill owners

| Request | Owner |
| --- | --- |
| Write Rust behavior | `tailrocks-rust-best-practices` |
| Review Rust read-only | `tailrocks-rust-review` |
| Restructure Rust | `tailrocks-rust-refactor` |
| Scaffold a strict workspace | `tailrocks-rust-project-setup` |
| Audit a workspace read-only | `tailrocks-rust-project-audit` |
| Fix approved workspace gaps | `tailrocks-rust-project-remediate` |
| Build Axum HTTP adapters | `tailrocks-axum-best-practices` |
| Review Axum read-only | `tailrocks-axum-review` |
| Restructure Axum adapters | `tailrocks-axum-refactor` |
| Evolve the public GraphQL API | `tailrocks-graphql-best-practices` |
| Review GraphQL read-only | `tailrocks-graphql-review` |
| Evolve cross-service gRPC | `tailrocks-grpc-best-practices` |
| Review gRPC read-only | `tailrocks-grpc-review` |
| Design ratatui screens | `tailrocks-tui-design` |
| Audit terminal design read-only | `tailrocks-tui-design-audit` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-rust-review/SKILL.md`.

## Example: review a Rust module

Invoke the review owner with the module path:

```text
/tailrocks-rust-skills:tailrocks-rust-review src/parser.rs
```

The skill returns a report with findings and concrete evidence. Each
finding has a location, trigger, impact, violated contract, and
correction. The skill is read-only. It never edits. A review report
never authorizes mutation. To restructure the module, select the
refactor owner in a separate explicit command.

## Example: evolve the public GraphQL API

Invoke the GraphQL owner with the API change. The example uses the
Codex selector:

```text
$tailrocks-graphql-best-practices add cursor pagination to invoices
```

The skill shapes the contract, enforces server discipline, keeps the
client thin, and gates the change on the SDL snapshot and breaking
diff. The skill returns an evolution report with outcome, contract
changes, compatibility, verification, skipped gates, residual risk,
and route.

## Example: design terminal screens

Invoke the design owner with the feature. The example uses the Claude
Code selector:

```text
/tailrocks-rust-skills:tailrocks-tui-design design status board
```

The skill collects screens, builds the gallery, iterates frames with
the user, freezes the goldens, and wires the handoff. The user
blesses every frame. The skill returns one receipt: `FROZEN`,
`BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`.

## Ownership boundary

Public API work belongs to the GraphQL owners. Cross-service Rust
contracts belong to the gRPC owners. A gRPC review never becomes an
unrequested GraphQL migration. Terminal screens belong to the TUI
owners.

Gap discovery belongs to `tailrocks-rust-project-audit`. Approved
fixes belong to `tailrocks-rust-project-remediate`. A finding never
grants mutation authority. Each fix needs explicit approval with
exact gap IDs.

An inspection result never authorizes mutation. A review report never
authorizes a refactor. Each mutating owner needs its own explicit
selection.
