# Plan 010: Qualify Grok, then Claude, without weakening acceptance

> **Executor instructions**: Qualification may conclude `UNSUPPORTED`. That is a
> successful honest result; do not add a fallback supervisor, silently reduce
> trust, or advertise parity. Qualify Grok first, Claude second. Run all gates.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- integrations/ crates/ scripts/provider-conformance* research/native-goal-control/ .github/workflows/provider-conformance.yml .claude-plugin/ .codex-plugin/ .kimi-plugin/ README.md INSTALL.md AGENTS.md CLAUDE.md docs/`
> Rebase onto plan 009, update baseline/current provider versions/docs, and prove
> the Codex release path remains green.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: HIGH
- **Depends on**: plan 009
- **Category**: feature, compatibility
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 009

## Why this matters

The requested rollout is Codex, Grok, then Claude. Their commands and Stop
lifecycle are not equivalent. Current official Grok documentation does not list
a built-in `/goal`; Claude's `/goal` evaluator is transcript-only and Stop hooks
have provider-specific block limits. A shared contract is valuable only if each
adapter proves it can enforce the same decision without substituting a different
workflow.

## Current state

- Audit discovery on 2026-08-10 found Grok Build `1.0.0` and Claude Code
  `2.1.226`; refresh before execution.
- [Grok modes/commands](https://docs.x.ai/build/modes-and-commands) documents
  `/plan`, `/loop`, plugins, and skills, but no built-in `/goal`. The operator's
  visible `/goal` may be native, plugin-provided, or skill-provided; origin must
  be recorded.
- [Claude `/goal`](https://code.claude.com/docs/en/goal) evaluates from the
  conversation rather than independent repository access and restores its
  condition on resume while resetting native counters.
- [Claude hooks](https://code.claude.com/docs/en/hooks-guide) impose Stop-loop
  behavior/caps that can force termination if preflight and durable budgets do
  not align.
- Plan 009 supplies generic conformance evidence, trusted-workflow, binary, and
  metrics infrastructure. Extend it; do not create provider runtimes in Bun.

## Preconditions

```sh
rtk mise run verify
rtk cargo run -p tailrocks-cli -- provider preflight codex --require supported
rtk grok --version
rtk claude --version
```

Expected: Codex remains supported; exact Grok/Claude versions are printed. Lack
of provider authentication blocks only that provider's live qualification, not
truthful documentation of current static discovery.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Grok tests | `cargo test --workspace provider_grok` | exit 0 |
| Claude tests | `cargo test --workspace provider_claude` | exit 0 |
| Grok evidence | `bun scripts/provider-conformance.ts validate-release --provider grok research/native-goal-control/evidence/grok-current` | exit 0 |
| Claude evidence | `bun scripts/provider-conformance.ts validate-release --provider claude research/native-goal-control/evidence/claude-current` | exit 0 |
| All gates | `mise run verify` | exit 0 |

## Scope

**In scope**:

- `integrations/grok/**` (only if supported)
- `integrations/claude/**` (only if supported)
- provider-neutral adapter interfaces in `crates/**`
- `scripts/provider-conformance.ts` and fixtures/tests
- `research/native-goal-control/README.md`, sources, sanitized evidence
- `.github/workflows/provider-conformance.yml`
- client plugin/hook manifests only for a supported integration
- `README.md`, `INSTALL.md`, `AGENTS.md`, `CLAUDE.md`, relevant `docs/**`
- four lockstep plugin versions only if user-visible integration changes

**Out of scope**:

- Implementing a new Grok/Claude `/goal` command.
- Replacing missing native behavior with `/loop`, headless execution, a custom
  supervisor, or transcript confidence.
- Weakening final receipt, scope, oracle, budget, clean-clone, or external-effect
  invariants for provider parity.
- Treating a model's transcript evaluator as verifier access.
- Credentialed PR-head execution or checked-in session/config/secret data.

## Git workflow

- Branch: `feat/additional-goal-providers`
- Commit each provider conclusion separately. Supported example:
  `feat(goal): add verified Grok adapter`; unsupported example:
  `docs(goal): record Grok control limitation`.
- Use DCO/Codex co-author trailers. No push/PR/release without instruction.

## Steps

### Step 1: Freeze one provider conformance contract

Before provider-specific work, ensure the shared conformance schema requires:

- client/version/command origin and exact effective config/hook digests;
- native slash-goal identity distinct from ordinary prompt/loop/headless mode;
- Stop interception, same-goal CONTINUE, current-PASS stop, BLOCKED behavior;
- resume/compaction with controller budgets not reset;
- sibling-hook precedence, cap/timeout/malformed output, config mutation;
- effective sandbox, writable roots, environment inheritance, web/search,
  MCP/apps/plugins/tools, additional directories, approvals, and egress;
- provider event-to-controller result mapping;
- sanitized evidence and trust label;
- normal plus forged-status/oracle/scope/stale-receipt attacks.

A provider is `SUPPORTED` only if every required row passes on a pinned version.
`UNSUPPORTED` names exact failed capability; `INCONCLUSIVE` names missing live
evidence. No partial support is advertised as equivalent.

**Verify**: harness tests reject evidence missing any required row and accept
Codex plan-009 golden evidence unchanged.

### Step 2: Discover and qualify Grok first

Use official docs, `grok --help`, plugin/skill listings, effective hook/config
inspection, and a real interactive session to identify the visible `/goal`
origin. Record `built_in | plugin | skill | unknown`, package/version/digest, and
whether its persistence belongs to the Grok client lifecycle.

Run CONTINUE→PASS, resume, conflict, cap/timeout, config drift, and adversarial
capability/outside-write/network-tool cases in the protected credential
workflow. If current Grok Stop hooks are
notification-only or no command lifecycle can force continuation, conclude
UNSUPPORTED. Do not use `/loop` or implement a supervisor.

If and only if supported, add a thin adapter translating Grok-native events to
the same `checkpoint` API and effective hook/capability preflight. Canonical
contracts, journal, receipts, and routing remain provider-neutral.

**Verify**:

```sh
cargo test --workspace provider_grok
bun scripts/provider-conformance.ts validate-release --provider grok research/native-goal-control/evidence/grok-current
```

Expected: both exit 0 for one internally consistent `SUPPORTED`, `UNSUPPORTED`,
or `INCONCLUSIVE` conclusion; only SUPPORTED may install/advertise an adapter.

### Step 3: Discover and qualify Claude second

Record exact `/goal` and Stop-hook behavior. The controller, not Claude's
transcript evaluator, remains acceptance authority. Prove Stop block/continue,
PASS release, resume, compaction, sibling precedence, config mutation, and
malformed/timeout behavior.

Preflight must prove the effective consecutive-block limit is greater than or
equal to the contract's durable attempt/continuation bound plus one, or reject
the run. Resume never resets controller budgets. If the cap cannot be configured
and enforced, or another hook can force stop, conclude UNSUPPORTED for packages
whose bound exceeds proven capacity.

Apply the same execution-capability contract as Codex. A provider unable to
disable external writes, secret-bearing environment, general network tools, or
side-effecting integrations is UNSUPPORTED for autonomous local execution.
Document same-user filesystem read confidentiality separately.

If supported, implement only event/config translation and concise continuation.
Never send receipt authority to Claude's goal evaluator.

**Verify**:

```sh
cargo test --workspace provider_claude
bun scripts/provider-conformance.ts validate-release --provider claude research/native-goal-control/evidence/claude-current
```

Expected: both exit 0 for a consistent conclusion; any supported policy records
the maximum enforceable continuation budget.

### Step 4: Re-run cross-provider equivalence attacks

For every SUPPORTED row, run the same frozen package/candidate fixtures and
compare controller decisions, not model patches. Given identical frozen
evidence, Codex/Grok/Claude adapters must yield identical
CONTINUE/BLOCKED/PASS; provider metadata may differ. Test resume and Stop attacks
per client.

If a provider cannot represent a controller result, downgrade that provider to
UNSUPPORTED rather than adding provider-specific canonical state.

**Verify**: `cargo test --workspace provider_equivalence` → exit 0; all supported
adapters agree on every golden decision and unsupported adapters cannot start.

### Step 5: Publish the honest support matrix

Update research evidence, README/INSTALL/docs, and plugin surfaces. For each
provider publish exact tested client range/version, `/goal` origin, hook/budget
constraints, trust mode, supported effects/platforms, last verified date, and
requalification command. Unsupported/inconclusive rows say why and offer no
silent alternative.

If at least one user-visible adapter is added, bump all four plugin versions to
one live-derived next release version and prepare but do not tag/publish. If both
are unsupported and changes are documentation/evidence only, use the repository's
normal docs release decision; do not fabricate a feature bump.

**Verify**: `mise run verify` exits 0; support matrix is generated/checked against
evidence JSON and no unsupported adapter appears in manifests or hooks.

## Test plan

- Required conformance-schema closure and sanitized evidence.
- Grok command origin, Stop controllability, resume, conflict/timeout/config
  drift, capability containment, normal and adversarial candidate cases.
- Claude transcript-evaluator isolation, block-cap preflight, resume budget,
  conflict/timeout/config drift, capability containment, normal/adversarial cases.
- Cross-provider identical frozen-evidence decisions.
- Unsupported provider cannot install/start/advertise.
- Docs/manifests/version/support-matrix consistency.

## Done criteria

- [ ] Grok qualification is completed before Claude qualification.
- [ ] Every provider has exact origin/version/evidence and one honest status.
- [ ] SUPPORTED means full frozen conformance; partial parity is not advertised.
- [ ] No provider owns canonical contract/journal/receipt semantics.
- [ ] Controller budgets survive resume and respect provider Stop limits.
- [ ] Every supported provider enforces the repository-only capability profile.
- [ ] Supported adapters agree on identical frozen-evidence decisions.
- [ ] Credentials never reach PR-head-controlled execution.
- [ ] All verification/docs/version checks pass; no release occurs unapproved.

## STOP conditions

Stop provider implementation if `/goal` origin is unknown, native continuation
cannot be forced, PASS cannot cleanly release Stop, effective hooks/caps cannot be
preflighted, resume bypasses controller budgets, evidence needs credentials in
the repository, or parity would require a standalone loop or weaker acceptance.

## Maintenance notes

Support expires on client, command-origin, hook/config, controller-contract, or
plugin digest change. Requalify before expanding the version range.
