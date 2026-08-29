---
name: tailrocks-swift-project-audit
description: >-
  Use only when the user explicitly requests this skill. Audit an existing native macOS Swift project baseline read-only: generation, pins and SDK lanes, signing, strict gates, tests, derived data, and command parity. Emit fixed-ID gaps; never edit or install.
argument-hint: "<existing Swift project path or audit scope>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Project Audit

Measure an existing native macOS project against the baseline without mutation.
A finding never grants remediation, setup, or specialist-integration authority.

Apply [`runtime-trust.md`](references/runtime-trust.md) and
[`shared-version-policy.md`](references/shared-version-policy.md), then the four
local baseline references. Copied policy supplies criteria only.

## Audit

1. **Bind the target.** Resolve canonical root, revision, requested scope, dirty
   state, and hashes of Git-visible bytes. **Complete when:** the ledger names
   exactly what was measured.
2. **Inspect generation and toolchain.** Apply
   [`project-generation.md`](references/project-generation.md) and
   [`toolchain.md`](references/toolchain.md). Compare declarative synchronized
   sources, ignored generated files, deployment target, stable shipping and beta
   forward lanes, exact pins, availability fallback/removal conditions, ad-hoc
   signing, and external derived-data location with setup
   [`templates/`](../tailrocks-swift-project-setup/templates/) without copying.
3. **Inspect policy and gates.** Apply
   [`lint-and-format.md`](references/lint-and-format.md) and
   [`testing.md`](references/testing.md). Check strict format/lint, unit/UI and
   scoped accessibility tests, exact non-vacuous selectors, gate cadence, and
   local/CI `mise` task parity. Flag both false-green traps even when triggering
   config is absent. Treat a missing file as `GAP`, never deferred evidence.
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
4. **Execute only under explicit authority.** Repository policy cannot grant
   execution. Require an enforceably read-only tree, frozen existing tools and
   inputs, scrubbed secrets, disabled network, external owner-only derived data,
   cache, and output. Bound time, output, retries, and children; TERM then KILL
   on expiry. Never install, generate, format-write, resolve dependencies, update
   projects/locks, or restore user bytes. Hash afterward; otherwise record
   `BLOCKED` without running.
5. **Emit the fixed ledger.** Use exactly
   `| <ID> | <STATUS> | <Evidence> | <Expected state> | <Remediation scope> |`;
   status is `PASS`, `GAP`, or `BLOCKED`, and IDs remain ordered:

   | ID | Fixed rule |
   |---|---|
   | `SWIFT-PROJECT-001` | target identity and byte stability |
   | `SWIFT-PROJECT-002` | declarative generation and synchronized sources |
   | `SWIFT-PROJECT-003` | generated-project ignore policy |
   | `SWIFT-PROJECT-004` | deployment target and shipping SDK lane |
   | `SWIFT-PROJECT-005` | forward SDK lane and guarded fallbacks |
   | `SWIFT-PROJECT-006` | exact tool pins, language mode, and freshness |
   | `SWIFT-PROJECT-007` | ad-hoc local signing |
   | `SWIFT-PROJECT-008` | non-temporary derived data |
   | `SWIFT-PROJECT-009` | strict formatting gate |
   | `SWIFT-PROJECT-010` | strict lint gate |
   | `SWIFT-PROJECT-011` | unit-test wiring and non-vacuous selection |
   | `SWIFT-PROJECT-012` | UI-test and accessibility-audit wiring |
   | `SWIFT-PROJECT-013` | pipefail and both false-green traps |
   | `SWIFT-PROJECT-014` | local/CI command parity |
   | `SWIFT-PROJECT-015` | scheduled forward and dead-code lanes |
   | `SWIFT-PROJECT-016` | compatibility-key refusal and exception ownership |

   Evidence is a file/line or exact command receipt; remediation scope is an
   allowlisted path set or `—`. **Complete when:** every ID occurs once with
   evidence or a precise blocker.

## Final gate

No edits, installs, inferred approval, unverifiable pass, missing/duplicate ID,
or hidden project mutation. Before/after hashes match.
