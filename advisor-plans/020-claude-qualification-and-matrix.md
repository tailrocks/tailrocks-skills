# Plan 020: Implement Claude qualification and support schemas

> **Executor instructions**: In one session on the shared implementation
> branch, add only evidence-bounded Claude translation and closed provider/
> platform/support schemas. Do not bump a version, publish support, or create a
> second branch/PR.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plans 010 and 045 have current same-branch completion receipts
- **Effort**: M; one session on the shared implementation branch
- **Risk**: HIGH
- **Depends on**: plans 010 and 045
- **Covers**: G06, G15, G16
- **Guardrails**: N01, N03-N08, N11-N13, N16-N19
- **Research basis**: `advisor-plans/RESEARCH.md` F4-06, F4-09, F4-16,
  F4-28, F4-45, F4-50
- **Planned at**: design baseline `1e809bd`; same-branch recut required

## Why this matters

Claude has provider-specific goal/Stop/resume limits. The implementation must
translate those events without using transcript evaluation as acceptance. It
also needs schemas that later external evidence can populate without a second
repository commit. Versioning remains solely Plan 017's final atomic-PR task.

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
rtk git merge-base --is-ancestor <plan-010-completion-sha> HEAD
rtk git merge-base --is-ancestor <plan-045-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- integrations/claude crates scripts/provider-conformance.ts scripts/provider-conformance.test.ts scripts/native-client-sandbox.ts tests/fixtures/native-client-sandbox research/native-goal-control README.md INSTALL.md AGENTS.md CLAUDE.md docs
rtk mise run verify
rtk claude --version
```

Expected: clean exact one-PR head, current Grok and native-principal checkpoint
ancestors, current Claude identity, no version/release/protected prerequisite.

## Spec contract

### Requirement G06/G15/G16: bounded Claude translation and future-proof support truth

Claude SHALL receive TIER 0/1/2/INCONCLUSIVE bound to exact version/config/
isolation/lifecycle. TIER 1/2 adapters preserve kernel decisions/budgets. Closed
schemas SHALL represent per-provider/per-native-target evidence and exact fan-in.
Static docs SHALL make no future release/support/date claim; they SHALL explain
verification of a later digest-addressed attested support closure.

#### Scenario: native counter resets on resume

- **WHEN** Claude resets a provider counter
- **THEN** external controller budget remains monotonic and preflight rejects
  packages above proven Stop capacity.

## Must NOT

- **N01/N03-N05**: transcript/mutable commands/host candidate code decide PASS.
- **N06/N07/N17**: credentialed PR evidence or same-user read supports no
  autonomous claim.
- **N08**: final exact-tree gates always rerun.
- **N11**: no version/tag/release/evidence publication.
- **N12/N13/N18**: provider/fan-in/digest cannot fork authority, average a
  failure, or claim confidential oracle truth.
- **N16**: runs/tools/output/evidence/docs fields bounded.
- **N19**: one implementation branch/PR; no later docs/evidence commit.

## Inputs to provide

- Interactive Claude auth/TTY and dedicated isolation for any TIER 1/2
  observation. Missing input yields INCONCLUSIVE/TIER 0.
- Exact shared branch/PR/attempt receipt identities.

## Starting state

- Plan 010 closes Grok implementation and shared provider verdict semantics.
- Protected release/support evidence does not yet exist.
- Plan 017, not this plan, will derive the only vNext in the final PR.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Claude | `rtk cargo test -p tailrocks-core provider_claude` | exit 0 |
| Evidence | `rtk bun scripts/provider-conformance.ts validate-premerge --provider claude research/native-goal-control/evidence/claude-current.json` | one honest verdict |
| Equivalence | `rtk cargo test -p tailrocks-core provider_equivalence` | exit 0 |
| Schemas | `rtk bun test scripts/provider-conformance.test.ts --test-name-pattern 'platform evidence|provider qualification|support fan-in'` | closed mutations pass |
| Native boundary | `rtk bun test scripts/native-client-sandbox.test.ts --test-name-pattern 'provider platform'` | fixed distinct-principal mode passes |
| Repository | `rtk mise run verify` | exit 0 |

## Scope

**In scope**: Claude adapter/fixtures/premerge evidence; provider qualification,
native-platform, two-target fan-in, and support-closure schemas/validators;
`native-client-sandbox.ts` fixed provider-platform mode registered through Plan
045's closed extension surface and fixtures; static
fail-closed support discovery docs.

**Out of scope**: version fields, release/policy/proof/workflows, live external
publication, post-release facts/dates, second branch/PR.

## Git workflow

Checkpoint only on `<implementation-branch>` in the existing PR:

```sh
rtk git commit -s -m 'feat(goal): add provider support schemas' \
  -m 'Co-authored-by: Codex <codex@openai.com>'
```

Do not open/merge/push another branch/PR. Record completion externally; Plan 043
reruns it at final head.

## Steps

### Step 1: Qualify Claude premerge without upgrading trust

Record exact origin/config/hooks/tools/isolation and lifecycle, false nominal
completion, resume/compaction, Stop cap, malformed/timeout/sibling conflict,
egress/outside reads/writes, and broker probing. Durable budget never resets.
Evidence is `operator_attested` from the implementation PR, not released truth.

**Verify**: Claude/Evidence reject cap overflow, transcript-only success,
same-user visibility, missing NEXT, secret, ambiguous origin, or protected/public
trust label.

### Step 2: Preserve kernel equivalence and fail closed

Run frozen fixtures through every implemented TIER 1/2 adapter. Compare kernel
decisions/receipt bytes, not transcript/patch. TIER 0/INCONCLUSIVE cannot start.
Runtime support resolution requires a verified external closure and otherwise
reports unqualified; no silent compiled-adapter fallback.

**Verify**: Equivalence/Repository reject forged/stale status, oracle/tool/
profile drift, later regression, budget exhaustion, or absent-closure enablement.

### Step 3: Implement exact external support schemas

Implement:

```text
validate-provider-qualification <canonical-json>
native-client-sandbox.ts run-provider-platform --principal tailrocks-native-client
  --provider <one-closed-provider>
  --task-home <new-0700-dir> --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --target <closed-target> --release-dir <verified-dir>
  --qualification <verified-json> --output <new-json>
run-platform-release --target <closed-target> --release-dir <verified-dir>
  --qualification <verified-provider-qualification-json>
  --client-principal tailrocks-native-client
  --client-task-root <new-controller-only-dir>
  --controller-signing-key <mode-0600-path>
  --native-boundary-receipt <verified-native-boundary-v1-json>
  --output <new-json>
validate-platform-evidence --target <closed-target> <canonical-json>
fan-in-platform-evidence --input <oci-ref> --input <oci-ref>
  --require-release <vX.Y.Z> --output <new-json>
verify-support-closure --oci-ref <digest-ref> --release <vX.Y.Z>
```

Qualification binds exact release/policy/proof/provider rows.
`run-platform-release` is a controller-only fan-in. It validates and enumerates
the closed provider set, then executes each documented target-native provider
lifecycle only after registry auth is destroyed and only through Plan 045's fixed
distinct-principal extension registry. Plan 020 adds only the named
`run-provider-platform` mode and may not alter or bypass Plan 045's base lease,
account, broker, policy, or cleanup logic. The Plan 020 extension selects
exactly one closed provider/target per broker invocation; it inherits the UID/ACL/controller-home/parent-
environment/credential-socket denial, root-owned UID lease, pre/post zero-
process/persistence proof, and broker-owned auth/home cleanup contract and
exposes only that provider's task-home credential. Before another provider,
the broker deletes credential/home/ACL state, reaps the UID, proves quiescence,
and releases the lease. No broker mode accepts a matrix or sibling credential
set. The controller aggregates only sanitized outputs into one operator
observation for independent `validate-platform-evidence`; it never upgrades its own trust.
The mode revalidates the exact canonical `native-boundary-v1` receipt under the
UID lease before auth exposure. Platform records embed that sanitized canonical
object and bind its SHA-256 plus native physical host/target, client origin/config/isolation/tier,
lifecycle/receipt/auth-clean/date. Fan-in accepts exactly macOS arm64 and Linux
x86_64 with identical shared identities and preserves weaker/failed rows.
Static docs explain digest/provenance verification and remain truthful when no
closure exists.

**Verify**: Schemas/Repository reject missing/duplicate/third/emulated target,
averaging, shared drift, sibling auth/home visibility, missing inter-provider
quiescence, auth leak, future date, moving alias, above-evidence
docs, static release date/digest, version edit, or evidence mutation.

## Test plan

- Claude lifecycle/cap/config/isolation/trust boundaries.
- Cross-provider exact kernel equivalence and fail-closed support resolution.
- Provider qualification/platform/fan-in/support schema mutations and
  per-provider credential isolation.
- Permanently truthful static docs with absent/foreign external closure.

## Done criteria

- [ ] Claude has one honest premerge verdict; adapter no stronger than evidence.
- [ ] Every adapter preserves kernel decisions/receipts.
- [ ] External qualification/platform/fan-in/support APIs are closed.
- [ ] No version/public support/post-merge-doc/second-PR change.
- [ ] Commands/scope/diff and same-branch signed checkpoint pass.

## STOP conditions

Stop adapter work on missing lifecycle/isolation/NEXT/cap/current-PASS Stop.
Stop on schema that averages failure, static future fact, version/release need,
second branch/PR, or work beyond one session.

## Maintenance notes

Plan 044 adds protected external evidence publication. Plan 017 later reserves
the one whole-stack version on the same PR; Plan 023 requalifies after release.
