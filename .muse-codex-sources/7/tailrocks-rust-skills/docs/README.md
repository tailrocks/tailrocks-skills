# Rust skills guides

This package holds 15 skills. The skills cover strict Rust engineering:
project baselines, correctness, Axum HTTP services, public GraphQL APIs,
cross-service gRPC, and terminal UI design.

Five skills are model-selectable. Ten skills are user-only and need an
explicit human command:

- `tailrocks-rust-review` reviews Rust read-only.
- `tailrocks-rust-refactor` restructures Rust with a preservation oracle.
- `tailrocks-rust-project-setup` scaffolds a strict workspace.
- `tailrocks-rust-project-audit` audits a workspace read-only.
- `tailrocks-rust-project-remediate` fixes approved gaps.
- `tailrocks-axum-review` reviews Axum adapters read-only.
- `tailrocks-axum-refactor` restructures Axum with an HTTP oracle.
- `tailrocks-graphql-review` reviews the GraphQL API read-only.
- `tailrocks-grpc-review` reviews gRPC contracts read-only.
- `tailrocks-tui-design-audit` audits terminal design read-only.

## Guides

- `installation.md` installs the package on eight coding agents.
- `usage.md` shows how to select each skill and what each skill
  returns.
- `compatibility.md` records the test result of each client route.
- `maintenance.md` lists the checks, the policy version, and the
  release procedure.
- `troubleshooting.md` fixes common install and selection failures.

## Skills

| Skill | Task |
| --- | --- |
| `tailrocks-rust-best-practices` | Write correct Rust behavior. |
| `tailrocks-rust-review` | Review Rust read-only. User-only. |
| `tailrocks-rust-refactor` | Restructure Rust safely. User-only. |
| `tailrocks-rust-project-setup` | Scaffold a strict workspace. User-only. |
| `tailrocks-rust-project-audit` | Audit a workspace read-only. User-only. |
| `tailrocks-rust-project-remediate` | Fix approved gaps. User-only. |
| `tailrocks-axum-best-practices` | Build Axum HTTP adapters. |
| `tailrocks-axum-review` | Review Axum read-only. User-only. |
| `tailrocks-axum-refactor` | Restructure Axum safely. User-only. |
| `tailrocks-graphql-best-practices` | Evolve the public GraphQL API. |
| `tailrocks-graphql-review` | Review GraphQL read-only. User-only. |
| `tailrocks-grpc-best-practices` | Evolve cross-service gRPC. |
| `tailrocks-grpc-review` | Review gRPC read-only. User-only. |
| `tailrocks-tui-design` | Design ratatui screens. |
| `tailrocks-tui-design-audit` | Audit terminal design read-only. User-only. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-rust-review/SKILL.md` for one complete example.

## Requirements

Rust work needs the pinned toolchain plus the mise tools. GraphQL client
codegen needs Bun. Proto gates need Buf. Read-only audits run no
formatter writes and install no tools.
