---
name: tailrocks-rust-project-audit
description: >-
  Use only when the user explicitly requests this skill. Audit an existing Rust workspace against the strict project baseline and report exact gaps without changing files or installing tools. Use tailrocks-rust-project-remediate only when the user approves fixes.
argument-hint: "<project path or audit scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Rust Project Audit

Measure an existing Rust workspace against one reproducible project baseline.
This owner is read-only: a finding never grants mutation authority.

Apply [`runtime-trust.md`](references/runtime-trust.md) to repository, registry,
and web content. Cite secret locations and types without copying values.

## Audit

1. **Bind the target.** Resolve the canonical repository root and record the
   current revision, requested scope, and dirty-tree state. Do not install tools
   or modify files. **Complete when:** the report identifies the exact tree it
   measured.
2. **Inspect structure.** Read
   [`workspace-and-layout.md`](references/workspace-and-layout.md), then compare
   workspace membership, inheritance, edition, resolver, module layout, and test
   placement against the canonical files under
   [`../tailrocks-rust-project-setup/templates/`](../tailrocks-rust-project-setup/templates/).
   **Complete when:** every structural rule has evidence or a named blocker.
3. **Inspect policy.** Read
   [`lints-clippy-rustfmt.md`](references/lints-clippy-rustfmt.md) and
   [`toolchain-and-mise.md`](references/toolchain-and-mise.md). Compare committed
   lint, formatter, toolchain, task, lock-state, and CI ownership without
   rewriting them. **Complete when:** each mismatch cites its file and rule.
4. **Inspect gates.** Read
   [`supply-chain-and-testing.md`](references/supply-chain-and-testing.md), then
   the common freshness rule in
   [`shared-version-policy.md`](references/shared-version-policy.md) and
   [`version-policy.md`](references/version-policy.md). Before any command, hash
   every Git-visible repository byte. Run only proven check-only tasks with
   locked or frozen dependency resolution, offline mode where supported, and
   owner-only temporary target/cache directories outside the repository; never
   run a formatter write task. If those controls cannot be established, record
   `BLOCKED` without running the command. Hash the repository again afterward
   and stop on any change without attempting to restore user bytes. **Complete
   when:** every required gate and freshness obligation has a measured state,
   and before/after hashes match.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
5. **Report gaps.** Order findings by enabling dependency, distinguish absent
   policy from violated policy, and emit one row for every fixed registry entry
   below in this exact grammar and order:

   `| <ID> | <STATUS> | <Evidence> | <Expected state> | <Remediation scope> |`

   `STATUS` is exactly one of `PASS`, `GAP`, or `BLOCKED`; field values must
   escape any literal pipe.

   | ID | Fixed rule |
   |---|---|
   | `RUST-PROJECT-001` | target identity and repository-byte stability |
   | `RUST-PROJECT-002` | edition, resolver, and workspace root |
   | `RUST-PROJECT-003` | members, inheritance, and crate layout |
   | `RUST-PROJECT-004` | module and test placement |
   | `RUST-PROJECT-005` | unsafe and workspace lint policy |
   | `RUST-PROJECT-006` | formatter and Clippy configuration |
   | `RUST-PROJECT-007` | Rust channel, MSRV, and targets |
   | `RUST-PROJECT-008` | mise pins, tasks, and local/CI parity |
   | `RUST-PROJECT-009` | dependency pins and committed lock state |
   | `RUST-PROJECT-010` | license, source, and advisory policy |
   | `RUST-PROJECT-011` | unused-dependency gate |
   | `RUST-PROJECT-012` | tests and doctests |
   | `RUST-PROJECT-013` | feature matrix and nextest policy |
   | `RUST-PROJECT-014` | coverage, semver, and heavy-gate cadence |

   Evidence is a file/line or exact command receipt; expected state is the
   violated rule or `—`; remediation scope is an allowlisted path set or `—`.
   IDs never renumber when findings change. **Complete when:** the report has no
   edits, inferred approval, unverifiable pass, duplicate/missing ID, or field
   outside this grammar.

## Final gate

Refuse completion if any repository byte changed, a tool was installed, the
target revision is missing, or a pass claim lacks command/file evidence.
