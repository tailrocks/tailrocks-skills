# Plan 010: Implement honest Grok qualification on the shared branch

> **Executor instructions**: In one session on the one implementation branch,
> close Grok discovery/fixtures and add only a proven adapter. TIER 0 is valid.
> Do not publish support, create another branch/PR, or require protected proof
> that can exist only after the atomic merge.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 012 has a current same-branch completion receipt
- **Effort**: M; one session on the shared implementation branch
- **Risk**: HIGH
- **Depends on**: plan 012
- **Covers**: G06, G15, G16
- **Guardrails**: N01, N03-N08, N12, N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-09, F4-16,
  F4-19, F4-22, F4-26, F4-28, F4-45
- **Planned at**: design baseline `1e809bd`; same-branch recut required

## Why this matters

Grok exposes `/plan` and `/loop`, not a proven built-in durable `/goal`; local
goal-named skills can shadow command origin. This slice implements honest
discovery and thin translation before the single merge. Its live observation is
only operator-attested/candidate evidence; post-merge Plan 023 alone may publish
a release-bound qualification.

## Preconditions — run before anything else

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = '<implementation-branch>'
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = '<integration-sha>'
test "$(rtk git rev-parse origin/main)" = '<frozen-base-sha>'
test "$(rtk git merge-base HEAD '<frozen-base-sha>')" = '<frozen-base-sha>'
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = '<implementation-branch>'
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
rtk git merge-base --is-ancestor <plan-012-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- integrations/grok crates scripts/provider-conformance.ts scripts/provider-conformance.test.ts research/native-goal-control docs
rtk mise run verify
rtk grok --version
rtk grok inspect --json
```

Expected: clean exact single-PR head descended from plan 012; current client/
sanitized inventory captured; no protected-policy/release prerequisite or second
branch exists.

## Spec contract

### Requirement G06/G15/G16: honest premerge Grok adapter implementation

One closed record SHALL bind client/version, command origin, effective config,
hooks/tools, host isolation, and CONTINUE/NEXT/BLOCKED/PASS/resume observations.
Verdict is TIER 0/1/2/INCONCLUSIVE. Only proven native lifecycle plus dedicated
isolation may compile/install an adapter. Premerge evidence SHALL carry
`origin=implementation_pr` and `trust=operator_attested`; it cannot become a
public support claim.

#### Scenario: goal-named skill shadows native command

- **WHEN** effective inspection finds a skill/plugin but clean discovery has no
  built-in durable `/goal`
- **THEN** preserve origins and TIER 0; add no hook/adapter substitute.

## Must NOT

- **N01/N03**: transcript or repository command decides acceptance/control.
- **N04/N05/N17**: clean home/same user is not autonomous containment.
- **N06/N07**: auth never enters Git/evidence/PR jobs; PR head mints no
  protected evidence.
- **N08**: provider translation never bypasses final exact-tree rerun.
- **N12/N13/N18**: provider owns no authority; inventory/hash/comparison is not
  semantics or confidential oracle evidence.
- **N16**: discovery/process/time/output/evidence bounded.
- **N19**: same implementation branch/PR only; no merge/support publication.

## Inputs to provide

- Interactive Grok auth/TTY and exact dedicated isolation profile. Missing
  either yields INCONCLUSIVE/TIER 0 and no adapter.
- Existing single branch/PR/attempt receipt identities.

## Starting state

- Plan 012 provides the shared runtime/broker/receipt semantics.
- Current evidence says Grok 1.0 lacks proven native durable `/goal`.
- Protected release/policy/proof do not exist yet and are not prerequisites for
  implementing a fail-closed adapter on the atomic PR.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Grok | `rtk cargo test -p tailrocks-core provider_grok` | exit 0 |
| Evidence | `rtk bun scripts/provider-conformance.ts validate-premerge --provider grok research/native-goal-control/evidence/grok-current.json` | one honest verdict |
| Equivalence | `rtk cargo test -p tailrocks-core provider_equivalence_grok` | exit 0 |
| Repository | `rtk mise run verify` | exit 0 |

## Scope

**In scope**: Grok conformance schema/fixtures/evidence; `integrations/grok/**`
only for TIER 1/2; necessary provider-neutral glue; non-public design docs.

**Out of scope**: Claude/support publication/version/release/policy/proof,
implementing `/goal`, substituting `/loop`, supervisor, second branch/PR.

## Git workflow

Checkpoint only on `<implementation-branch>` in the existing PR:

```sh
rtk git commit -s -m 'feat(goal): add honest Grok qualification' \
  -m 'Co-authored-by: Codex <codex@openai.com>'
```

Do not open/merge/push another branch/PR. Record completion externally; Plan 043
reruns this plan at final head.

## Steps

### Step 1: Close discovery and verdict schema

Require clean-home/effective-host origins, exact client/config/hooks/tools,
executor/host-read profile, native Stop/lifecycle/resume budgets, and sanitized
bounded evidence. TIER 1 requires containment plus limited native control; TIER
2 requires all lifecycle states and no stop without current PASS.

**Verify**: Grok/Evidence reject missing NEXT, ambiguous/shadowed origin,
same-user visibility, unknown fields/verdict, secret/path, or stronger trust.

### Step 2: Exercise exact client without inventing transport

Inspect current docs/help and both inventories. Only if a durable built-in goal
and blocking event exist, run lifecycle/resume/malformed/timeout/hook-conflict/
capability/egress/read/write cases. Preserve only canonical sanitized evidence.

**Verify**: Evidence returns one internally consistent premerge verdict; origin,
version, config, lifecycle, isolation, or trust mutation makes it stale/fail.

### Step 3: Add only proven translation

At TIER 1/2, translate events into existing broker; at TIER 0/INCONCLUSIVE add
no runtime surface. Compare kernel decisions/receipt bytes with frozen Codex
fixtures. Public support resolver remains fail-closed until Plan 023/042 OCI.

**Verify**: Equivalence/Repository pass; manifests expose no adapter above
evidence and static docs make no released/current support claim.

## Test plan

- Clean versus effective origin/shadow fixtures.
- Lifecycle/resume/capability/isolation for any native claim.
- TIER 0 no adapter; higher tiers exact kernel equivalence.
- Secret/trust/version/config staleness and final-head replay.

## Done criteria

- [ ] One exact premerge verdict; current missing control stays TIER 0.
- [ ] Any adapter is no stronger than observed isolation/lifecycle.
- [ ] No public/protected/release claim or second branch/PR.
- [ ] Commands/scope/diff and same-branch signed checkpoint pass.

## STOP conditions

Stop adapter work on missing origin/native lifecycle/isolation/NEXT/resume/current-
PASS Stop, or need for a supervisor/weaker kernel. Stop the whole attempt on a
second branch/PR or work beyond one session.

## Maintenance notes

Plan 020 adds Claude and shared support schemas on the same PR. Post-merge Plan
023 requalifies exact released subjects; this premerge record never substitutes.
