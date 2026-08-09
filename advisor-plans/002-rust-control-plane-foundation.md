# Plan 002: Establish the typed Rust control-plane foundation

> **Executor instructions**: Follow every step and gate. This plan creates
> validation infrastructure only; it does not change execution ownership yet.
> Stop on any condition below rather than weakening types or accepting unknown
> fields. Update `advisor-plans/README.md` when complete.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED — introduces a Rust workspace and machine artifact versioning
- **Depends on**: `advisor-plans/001-artifact-grounded-evals.md`
- **Category**: architecture / correctness / tooling
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

Coverage, dependency order, statuses, assumptions, and completion currently
live in Markdown interpreted by the same stochastic actor that writes them.
`scripts/validate-skills.ts` validates skill packaging, not delivery-package
semantics. This plan creates the small trusted Rust layer needed by later plans:
strict schemas, stable IDs, canonical hashing, path safety, graph checks, and a
machine-readable validator.

## Current state

- `mise.toml:1-5` pins only Bun and exposes only `validate`.
- `scripts/validate-skills.ts:84-280` validates skill metadata, bundled links,
  eval shape, manifests, and catalogs; it never accepts a plan-package path.
- `skills/tailrocks-plan/references/coverage-ledger.md:36-84` defines coverage
  and assumptions as Markdown tables.
- `skills/tailrocks-plan/references/goal-handoff.md:19-27` defines manifest
  rows/statuses as Markdown.
- `skills/tailrocks-plan/references/spec-format.md:51-67` defines useful
  requirement grammar but no executable package parser.
- `examples/plan-package/` is the existing conformance fixture.
- House Rust conventions are already copy-ready under
  `skills/tailrocks-rust-project-setup/templates/`.

## Research basis

- [Thinking Machines: Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)
  distinguishes unstable generation from a controllable acceptance boundary.
  Tailrocks does not depend on identical tokens; it validates typed outcomes.
- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785)
  supplies a language-independent canonical byte contract instead of relying on
  one serializer's incidental ordering.
- [LangGraph durable execution](https://docs.langchain.com/oss/javascript/langgraph/functional-api)
  demonstrates the control-plane pattern: deterministic orchestration with
  non-deterministic operations isolated in checkpointed, idempotent tasks.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Existing baseline | `mise run validate` | `Validated 15 skills.` |
| Rust format | `cargo fmt --all -- --check` | exit 0 |
| Rust tests | `cargo nextest run --workspace` | all tests pass |
| Rust lint | `cargo clippy --workspace --all-targets --all-features -- -D warnings` | exit 0 |
| Package check | `cargo run -p tailrocks-cli -- check package examples/plan-package/plans/goal-live-status --json` | valid JSON; `valid: true` |
| Protocol version | `cargo run -p tailrocks-cli -- version --json` | CLI/build version plus supported schema/control-protocol ranges |

## Scope

**In scope**:

- root `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `rustfmt.toml`,
  `clippy.toml`, `deny.toml`
- `mise.toml`
- `crates/tailrocks-core/**` (create)
- `crates/tailrocks-cli/**` (create)
- `schemas/**` (create; versioned JSON Schemas)
- `examples/plan-package/plans/goal-live-status/*.json` minimal machine fixtures
- `scripts/validate-skills.ts` only to invoke/check schema fixture consistency
- `scripts/validate-skills.test.ts`
- `README.md` development commands and layout only

**Out of scope**:

- Changing delivery skills or current Markdown execution protocol.
- Generating contracts/manifests; plans 003 and 004 own compilation.
- Claims, receipts, hooks, or execution; plans 005 and 006 own them.
- Removing the Bun validator. It remains packaging validation.

## Git workflow

- Branch: `advisor/002-rust-control-plane-foundation`
- Use `tailrocks-rust-project-setup` and
  `tailrocks-rust-best-practices` if available.
- Conventional commits, for example `feat(core): validate plan packages`;
  `git commit -s` plus `Co-authored-by: Codex <codex@openai.com>`.
- Do not push or open a PR without operator instruction.

## Steps

### Step 1: Create a strict Rust 2024 workspace

Use the repository's Rust setup templates. Create `crates/tailrocks-core` as a
library and `crates/tailrocks-cli` as a thin binary. Pin the stable toolchain and
commit `Cargo.lock`. Extend, do not replace, Bun in `mise.toml`; add tasks for
format check, Clippy, nextest, and aggregate verification.

Resolve latest stable dependency releases once, record exact versions in
`Cargo.lock`, and do not re-resolve during later package execution. Use
`#![forbid(unsafe_code)]`, workspace lints, explicit error types, and no panics
on repository input.

**Verify**: `cargo fmt --all -- --check`, `cargo clippy --workspace
--all-targets --all-features -- -D warnings`, and `cargo nextest run
--workspace` all exit 0.

### Step 2: Define strict versioned artifact models

In `tailrocks-core`, define `#[serde(deny_unknown_fields)]` models and newtypes
for:

- `SourceId`, `RequirementId`, `GateId`, `PlanId`, `ReceiptId`;
- `ControlProtocolVersion` and supported schema-version ranges;
- contract metadata and hash references;
- package manifest rows and dependency edges;
- coverage edges among sources, requirements, gates, and plans;
- effect budgets;
- verification gate declarations;
- resolved environment/tool versions;
- receipt envelope fields reserved for plan 005.

Canonical machine artifacts use JSON. Human Markdown remains prose, but must not
be the machine source of state. Every artifact contains `schema_version` and
rejects unsupported versions.

Publish matching schemas under `schemas/v1/`. Generate schemas from Rust types
or test them against Rust serialization so they cannot silently drift.

**Verify**: unit tests round-trip every artifact, reject unknown fields and
wrong ID prefixes, and prove checked-in schemas accept the golden fixtures.

### Step 3: Specify canonical hashing

Use SHA-256 over domain-separated RFC 8785 JCS bytes. Restrict canonical values
to I-JSON: valid Unicode, no duplicate keys, no non-finite numbers, and no
integers outside the interoperable exact range. Represent timestamps, large
counters, and opaque identifiers as normalized strings. Define and test:

- UTF-8 requirement;
- RFC 8785 key ordering and ECMAScript-compatible number serialization;
- the explicit policy that Unicode strings are preserved rather than silently
  normalized;
- exclusion of self-referential hash fields;
- path normalization to repository-relative `/` separators;
- domain-separated hashes for `intent`, `contract`, `plan`, `oracle`, and
  `receipt`;
- algorithm/version embedded beside each digest.

Never hash arbitrary hand-formatted JSON bytes or serializer-default output.
Hash typed JCS values so independently implemented Rust/TypeScript validators
produce identical bytes. Check in language-neutral golden input, canonical-byte,
and digest vectors covering Unicode, escapes, numeric edges, path separators,
and every domain tag.

**Verify**: Rust and Bun consume the same golden vectors and produce identical
canonical bytes/digests; semantic field changes alter the digest; formatting/
key-order changes do not; non-I-JSON inputs fail with stable codes.

### Step 4: Implement deterministic package validation

Add `tailrocks check package <path> [--json]`. Initial checks:

- supported schema versions and all referenced files exist;
- IDs unique and correctly typed;
- dependency graph acyclic; every edge targets a plan;
- every normative requirement has at least one gate and plan;
- every gate maps to at least one requirement;
- every Must-NOT has an enforcement gate and affected-plan mapping;
- no empty status/coverage fields;
- paths are repository-relative and cannot escape through absolute paths,
  `..`, or symlinks;
- declared hashes match canonical content;
- Markdown projections, when present, are marked generated rather than treated
  as authority.

Return structured diagnostics with stable error codes and JSON pointers. Human
text may improve, but codes are API.

**Verify**: CLI integration tests cover valid fixture, cycle, orphan gate,
uncovered requirement, missing file, wrong hash, unknown field/version, and
path/symlink escape.

### Step 5: Add golden machine fixtures without changing live protocol

Add minimal v1 JSON artifacts beside the example package. They should model the
current example and pass `tailrocks check package`, but current skills continue
writing Markdown until plans 003–004 migrate them. Mark fixtures transitional
and generated from explicit test data.

Keep Bun packaging validation separate, but make the aggregate task build and
run the Rust validator unconditionally. Missing Rust/toolchain is a failed
prerequisite with the exact `mise install` remedy, never a silently skipped
package check. `mise run verify` must run both Bun and Rust gates.

**Verify**: `mise run verify` exits 0 and includes Bun validator/tests, Rust
format/lint/tests, and example package validation.

## Test plan

- Serialization: valid round trips, unknown fields, unsupported versions,
  stable newtype formatting.
- Hashes: cross-language JCS golden vectors, domain separation, Unicode and
  numeric rejection edges.
- Graph: valid DAG, self-cycle, multi-node cycle, missing dependency.
- Traceability: uncovered requirement, orphan gate, unassigned Must-NOT,
  duplicate IDs.
- Paths: absolute, `..`, symlink escape, platform separator normalization.
- CLI: stable JSON diagnostic codes and nonzero exit on invalid package.
- Bun/Rust integration: aggregate task fails when either validator fails.

## Done criteria

- [ ] `mise run validate` exits 0.
- [ ] `mise run verify` exits 0.
- [ ] Rust workspace is edition 2024, locked, formatted, lint-clean, and tested.
- [ ] Checked-in v1 schemas match strict Rust models.
- [ ] Canonical hashes have golden tests.
- [ ] Rust and Bun agree on every canonical-byte/digest vector; non-I-JSON is
      rejected.
- [ ] `tailrocks check package ... --json` rejects all named invalid fixtures
      and accepts the example fixture.
- [ ] No delivery skill behavior changed.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Existing Rust setup templates conflict with a current stable toolchain:
  resolve the conflict through the project setup skill and report; do not weaken
  lints or pin an unsupported old major silently.
- Canonicalization cannot be specified independently of serializer formatting:
  stop and implement the RFC 8785/I-JSON contract and cross-language vectors
  before hashing anything.
- A schema needs untyped extension maps to proceed: add a versioned enum or
  explicit field instead; never accept arbitrary unknown data.
- The package fixture cannot represent current semantics without changing
  delivery behavior; leave it transitional and report the gap for plan 004.

## Maintenance notes

Keep `tailrocks-core` provider-neutral and free of model SDKs. Later provider
adapters depend on this API; they must not leak into canonical contract types.
Schema changes require a version and migration tests. Stable diagnostic codes
are consumed by hooks, CI, and agents, so review them as public API.
