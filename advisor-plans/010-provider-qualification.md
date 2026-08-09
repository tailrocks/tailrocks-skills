# Plan 010: Qualify Grok, then Claude, without weakening acceptance

> **Executor instructions**: Qualification assigns the lowest tier the evidence
> proves — TIER 0 is a successful honest result, not a failure to route around.
> Do not add a fallback supervisor, silently reduce trust, or advertise one
> tier as another. Qualify Grok first, Claude second. Run all gates.
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
rtk cargo run -p tailrocks-cli -- provider preflight codex --require tier2
rtk grok --version
rtk claude --version
```

Expected: Codex remains TIER 2; exact Grok/Claude versions are printed. Lack
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

- `integrations/grok/**` (only at TIER 1+)
- `integrations/claude/**` (only at TIER 1+)
- provider-neutral adapter interfaces in `crates/**`
- `scripts/provider-conformance.ts` and fixtures/tests
- `research/native-goal-control/README.md`, sources, sanitized evidence
- `.github/workflows/provider-conformance.yml`
- client plugin/hook manifests only for a TIER 1+ integration
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
  `feat(goal): add verified Grok adapter`; TIER 0 example:
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

Conformance rows split into two orthogonal groups, because they fail
independently and gate different things:

- **Containment rows** (sandbox, writable roots, environment inheritance,
  web/search, MCP/apps/plugins/tools, additional directories, approvals,
  egress, hook-placement outside executor-writable roots): mandatory for ANY
  autonomous execution. A provider that cannot prove containment gets no
  autonomous tier at all — this is a trust boundary, never a UX preference.
- **Stop-control rows** (Stop interception, same-goal CONTINUE, current-PASS
  stop, durable budgets across resume, hook time budget): these decide whether
  completion interception is enforced or the operator must stay in the loop.

The verdict is a qualification tier, not a binary:

```text
TIER 0  kernel CLI only — no autonomous native goal. The human drives sessions
        (plan 000 prose loop or manual native goals); the kernel still owns
        claim/submit/checkpoint/PASS. Containment is the human. Available on
        every client that can run a shell command.
TIER 1  attended native goal — containment rows proven, stop-control weak or
        capped below the contract bound. The agent may stop early with a false
        nominal claim; the documented ritual is that completion is believed
        only from `tailrocks goal status`, never from the transcript. Honest
        limitation: false claims are surfaced, not intercepted in-session.
TIER 2  unattended native goal — containment and stop-control rows all proven
        on a pinned version. Stop without current PASS must be zero; this is
        the Codex release bar from plan 009 and the product's headline claim.
```

`UNSUPPORTED` remains the verdict for any tier a provider claims but cannot
prove, and `INCONCLUSIVE` names missing live evidence. No tier is advertised as
another; acceptance invariants (kernel-only PASS, scope, oracles, budgets,
clean-clone verification) are identical at every tier.

**Verify**: harness tests reject evidence missing any required row for the
claimed tier and accept Codex plan-009 golden evidence unchanged as TIER 2.

### Step 2: Discover and qualify Grok first

Use official docs, `grok --help`, plugin/skill listings, effective hook/config
inspection, and a real interactive session to identify the visible `/goal`
origin. Record `built_in | plugin | skill | unknown`, package/version/digest, and
whether its persistence belongs to the Grok client lifecycle.

Run CONTINUE→PASS, resume, conflict, cap/timeout, config drift, and adversarial
capability/outside-write/network-tool cases per the plan 009 operator runbook.
Assign the tier the evidence proves: no discoverable native `/goal` or no
containment proof → TIER 0 (kernel CLI plus the plan 000 prose loop — still
strictly better than today's Grok flow); containment proven but Stop hooks
notification-only or continuation unforceable → TIER 1; all rows proven →
TIER 2. Do not use `/loop` as a goal substitute or implement a supervisor at
any tier.

Only TIER 1 and above get an adapter: a thin translation of Grok-native events
to the same `checkpoint` API and effective hook/capability preflight. TIER 0
needs no provider code — that is the point. Canonical contracts, journal,
receipts, and routing remain provider-neutral.

**Verify**:

```sh
cargo test --workspace provider_grok
bun scripts/provider-conformance.ts validate-release --provider grok research/native-goal-control/evidence/grok-current
```

Expected: both exit 0 for one internally consistent tier (or `INCONCLUSIVE`)
conclusion; only TIER 1+ may install/advertise an adapter, and only at the
proven tier.

### Step 3: Discover and qualify Claude second

Record exact `/goal` and Stop-hook behavior. The controller, not Claude's
transcript evaluator, remains acceptance authority. Prove Stop block/continue,
PASS release, resume, compaction, sibling precedence, config mutation, and
malformed/timeout behavior.

Preflight must prove the effective consecutive-block limit is greater than or
equal to the contract's durable attempt/continuation bound plus one, or reject
the run. Resume never resets controller budgets. If the cap cannot be configured
and enforced, or another hook can force stop, Claude is TIER 2 only for packages
whose bound fits the proven capacity and TIER 1 beyond it — the preflight
decides per package, and the docs state the maximum enforceable bound.

Apply the same execution-capability contract as Codex. A provider unable to
disable external writes, secret-bearing environment, general network tools, or
side-effecting integrations gets no autonomous tier (TIER 0 only) — containment
is not negotiable per tier. Document same-user filesystem read confidentiality
separately.

At TIER 1+, implement only event/config translation and concise continuation.
Never send receipt authority to Claude's goal evaluator.

**Verify**:

```sh
cargo test --workspace provider_claude
bun scripts/provider-conformance.ts validate-release --provider claude research/native-goal-control/evidence/claude-current
```

Expected: both exit 0 for a consistent tier conclusion; any TIER 1+ policy records
the maximum enforceable continuation budget.

### Step 4: Re-run cross-provider equivalence attacks

For every TIER 1+ provider, run the same frozen package/candidate fixtures and
compare controller decisions, not model patches. Given identical frozen
evidence, Codex/Grok/Claude adapters must yield identical
CONTINUE/BLOCKED/PASS; provider metadata may differ. Test resume and Stop attacks
per client at its claimed tier.

If a provider cannot represent a controller result, downgrade its tier rather
than adding provider-specific canonical state.

**Verify**: `cargo test --workspace provider_equivalence` → exit 0; all TIER 1+
adapters agree on every golden decision and TIER 0 providers cannot start an
adapter.

### Step 5: Publish the honest support matrix

Update research evidence, README/INSTALL/docs, and plugin surfaces. For each
provider publish its tier, exact tested client range/version, `/goal` origin,
hook/budget constraints, trust mode, supported effects/platforms, last verified
date, and requalification command. TIER 0/1 rows state exactly what is lost
relative to TIER 2 (in-session interception; unattended completion) and what is
kept (all acceptance invariants). Inconclusive rows say why and offer no silent
alternative.

If at least one user-visible adapter is added, bump all four plugin versions to
one live-derived next release version and prepare but do not tag/publish. If both
land at TIER 0 and changes are documentation/evidence only, use the repository's
normal docs release decision; do not fabricate a feature bump.

**Verify**: `mise run verify` exits 0; support matrix is generated/checked against
evidence JSON and no above-tier adapter appears in manifests or hooks.

## Test plan

- Required conformance-schema closure and sanitized evidence.
- Grok command origin, Stop controllability, resume, conflict/timeout/config
  drift, capability containment, normal and adversarial candidate cases.
- Claude transcript-evaluator isolation, block-cap preflight, resume budget,
  conflict/timeout/config drift, capability containment, normal/adversarial cases.
- Cross-provider identical frozen-evidence decisions.
- A TIER 0 provider cannot install/start/advertise an adapter; no provider
  advertises above its proven tier.
- Docs/manifests/version/support-matrix consistency.

## Done criteria

- [ ] Grok qualification is completed before Claude qualification.
- [ ] Every provider has exact origin/version/evidence and one honest tier.
- [ ] TIER 2 means full frozen conformance; no tier is advertised as another,
  and containment gates every autonomous tier.
- [ ] No provider owns canonical contract/journal/receipt semantics.
- [ ] Controller budgets survive resume and respect provider Stop limits.
- [ ] Every TIER 1+ provider enforces the repository-only capability profile.
- [ ] Supported adapters agree on identical frozen-evidence decisions.
- [ ] Credentials never reach PR-head-controlled execution.
- [ ] All verification/docs/version checks pass; no release occurs unapproved.

## STOP conditions

Stop *adapter* implementation — the provider stays TIER 0, which is a valid
conclusion — if `/goal` origin is unknown, containment cannot be preflighted,
native continuation cannot be forced at the claimed tier, PASS cannot cleanly
release Stop, resume bypasses controller budgets, or evidence needs credentials
in the repository. Stop the plan entirely only if honoring a tier would require
a standalone loop or weaker acceptance.

## Maintenance notes

Support expires on client, command-origin, hook/config, controller-contract, or
plugin digest change. Requalify before expanding the version range.
