# Plan 009: Distribute and qualify the Codex runtime

> **Executor instructions**: Ship the binary and Codex integration as one
> coherent release candidate. Live credentials run only against protected code.
> Do not tag, publish, push, or create a release without operator authorization.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- .github/workflows/ integrations/codex/ scripts/provider-conformance* scripts/verify-release-artifacts* .claude-plugin/ .codex-plugin/ .kimi-plugin/ README.md INSTALL.md AGENTS.md CLAUDE.md docs/`
> Rebase onto plan 008, refresh the baseline/current version, and prove
> `mise run verify` is green.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: HIGH
- **Depends on**: plan 008
- **Category**: build, feature, docs
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 008

## Why this matters

Hooks that require an unavailable controller are not a feature. Users need a
version-matched, checksum-verifiable CLI before the plugin advertises native-goal
enforcement. Live Codex qualification must test the real TTY lifecycle without
giving provider credentials to PR-head-controlled code.

## Current state

- Plans 003–007 provide a development `tailrocks` binary and Codex integration.
- Plan 008 provides the complete offline gate and credential-free PR CI.
- No portable release assets, clean-prefix install smoke, or protected-code live
  provider workflow exists yet.
- Plan 005 is expected to have bumped plugin version to `0.12.0`; derive the live
  value before selecting the next version.
- The repo supports multiple clients/platforms. An untested target must remain
  unadvertised, not inferred from successful compilation.

## Preconditions

```sh
rtk mise run verify
rtk cargo build --workspace --release --locked
rtk bun scripts/provider-conformance.ts validate-research research/native-goal-control
```

Expected: offline verification/build pass; Codex feasibility evidence is current
and SUPPORTED.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Build | `cargo build --workspace --release --locked` | exit 0 |
| Artifact fixtures | `bun test scripts/verify-release-artifacts.test.ts` | exit 0 |
| Artifact verify | `bun scripts/verify-release-artifacts.ts --fixtures scripts/fixtures/release-artifacts` | exit 0 |
| Workflow lint | `bun scripts/validate-workflows.ts` | exit 0 |
| Live evidence | `bun scripts/provider-conformance.ts validate-release artifacts/provider-conformance/codex-current` | exit 0 |
| Full gate | `mise run verify` | exit 0 |

## Scope

**In scope**:

- `.github/workflows/provider-conformance.yml` (new)
- `.github/workflows/release-artifacts.yml` (new)
- `scripts/verify-release-artifacts.ts` and test/fixtures (new)
- `scripts/provider-conformance.ts` release validation only
- `integrations/codex/**`
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`
- `README.md`, `INSTALL.md`, `AGENTS.md`, `CLAUDE.md`
- `docs/deterministic-goal-*.md`, `docs/pipeline-walkthrough.md`

**Out of scope**:

- Grok/Claude (plan 010).
- Modifying acceptance invariants or offline ground truth.
- Credentials in PR jobs or execution of PR-head scripts/hooks with credentials.
- Autonomous external effects.
- Automatic installer execution, tag/release publication, push, or remote merge.
- Advertising a target/client whose live smoke did not pass.

## Git workflow

- Branch: `feat/codex-goal-distribution`
- Commit subject: `feat(goal): package verified Codex runtime`.
- DCO signoff and Codex co-author trailer required. No remote/release action
  without explicit instruction.

## Steps

### Step 1: Build and verify portable CLI artifacts

Add a native-runner matrix for:

```text
aarch64-apple-darwin, x86_64-apple-darwin,
x86_64-unknown-linux-gnu, aarch64-unknown-linux-gnu,
x86_64-pc-windows-msvc
```

Build locked release binaries, archive per target, emit SHA-256 manifest and
provenance metadata, install each into a clean prefix, run
`tailrocks --version` plus the offline tracer, uninstall, and prove no files
remain. Build success without a target-native smoke is not support.

`verify-release-artifacts.ts` validates names, platform/architecture, checksum,
version/contract compatibility, provenance fields, install layout, smoke result,
and uninstall result. No download executes automatically.

**Verify**: artifact test and fixture commands exit 0; wrong checksum/version,
missing target, cross-labeled binary, partial install, failed offline tracer, and
uninstall residue are rejected.

### Step 2: Enable Codex hooks only after binary preflight

Package the exact integration proven by plans 002/003. On goal start/resume,
preflight resolves one `tailrocks` binary, checks executable ownership/path,
version and digest against the supported release manifest, then enumerates the
complete effective Codex hook/config and execution-capability set from plans
002/003. Missing/wrong/conflicting state, external writable root, secret-bearing
environment, web/search, side-effecting tool, or agent-usable egress fails with
exact remediation.

Never auto-download, execute an unverified binary, bypass hook trust, or fall
back to transcript evaluation/custom loops. Document install/upgrade/uninstall
for every advertised platform and clean-prefix test each instruction.

**Verify**: integration tests cover missing/duplicate/wrong-version/wrong-digest
binary, PATH shadowing, hook/capability conflict or mutation, clean install,
upgrade, and uninstall. All advertised install commands match artifact fixtures.

### Step 3: Qualify live Codex only from protected code

`provider-conformance.yml` runs on protected default-branch
`workflow_dispatch`/schedule after merge, or an approved immutable release
candidate. It never executes PR-head code with provider credentials. Use an
approved environment, least-scoped provider identity, no repository write token,
and no remote in the executor fixture. Separate generation and verification jobs
so the verifier has no provider credential.

Run native Codex normal multi-slice, premature claim interception, resume and
compaction, budget exhaustion, sibling hook conflict/mutation, candidate/oracle/
scope tamper, outside-write/network-tool/environment-injection attempts, and
controller BLOCKED. Retain sanitized artifacts only.

Report separately:

- premature claims intercepted (control metric, may be nonzero);
- successful stop without current PASS (must be zero);
- accepted candidate failing blinded ground truth (must be zero);
- stochastic task success/consistency with intervals (not proof).

**Verify**: workflow lint proves safe trigger/permissions/data flow; downloaded
protected-run output at `artifacts/provider-conformance/codex-current` passes the
Live evidence command.

### Step 4: Publish exact Codex support docs and release readiness

Document trust modes, repository-only effects, supported platforms, manual
binary verification, hook preflight, native `/goal`, resume/recovery,
PASS/apply/retire separation, CI credential boundary, and explicit unsupported
behavior. State that local same-user filesystem read confidentiality is not
proven and sensitive hosts require a dedicated principal/container. Walk through
Idea to retirement using primary artifact pointers.

Bump the four plugin version fields together to the live-derived next feature
version (expected `0.13.0` after plan 005's `0.12.0`). Embed the compatible CLI
version/range in preflight and support docs. Update pinned tag examples only when
the operator authorizes that actual tag; otherwise leave a clearly marked
release checklist `READY, NOT PUBLISHED`.

**Verify**: `mise run verify`, artifact/workflow checks, docs links, version
lockstep, CLI/plugin compatibility, and clean-prefix install smoke all pass.

## Test plan

- Five target artifact identity/checksum/install/offline-smoke/uninstall cases.
- Binary discovery, PATH shadowing, digest/version mismatch, hook conflict/drift.
- Protected-code workflow trigger/permissions/credential separation fixtures.
- Native Codex normal, resume/compaction/budget, and trust-boundary attacks.
- Docs links, support matrix, version lockstep, clean-prefix instructions.

## Done criteria

- [ ] Every advertised target has a native install/offline-smoke/uninstall proof.
- [ ] Codex hooks cannot activate with missing/unverified/incompatible CLI.
- [ ] PR code never receives provider credentials.
- [ ] Protected-code live qualification has zero stop bypass/false acceptance.
- [ ] Stochastic results retain trials and intervals; never define invariants.
- [ ] Docs/version/CLI compatibility and `mise run verify` pass.
- [ ] Release is `READY, NOT PUBLISHED` unless operator separately authorizes it.

## STOP conditions

Stop if an advertised target cannot run its own smoke, plugin hooks can start
without a verified CLI, a credentialed workflow needs untrusted branch code,
live Codex violates stop/PASS behavior, or completion requires a tag/publish/push
not explicitly authorized.

## Maintenance notes

Codex support expires on client, binary, contract, or effective-hook digest
change. Requalify before widening documented version ranges.
