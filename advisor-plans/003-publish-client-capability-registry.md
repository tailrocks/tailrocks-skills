# Plan 003: Publish the seven-client capability registry and model-routing guide

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `rtk git diff --stat 13a5ee5..HEAD -- clients.json INSTALL.md docs/AGENTS.md docs/src/lib/agents.ts docs/src/generated/clients.ts docs/src/components/client-routing-matrix.tsx docs/content/docs/delivery/index.mdx docs/content/docs/delivery/meta.json docs/content/docs/delivery/model-routing.mdx scripts/validate-skills.ts scripts/validate-skills.test.ts scripts/generate-docs.ts scripts/generate-docs.test.ts docs/content/docs/install.mdx`
> If any in-scope file changed, compare the current-state excerpts below with
> live code before proceeding. A load-bearing mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans 001 and 002
- **Category**: docs
- **Planned at**: commit `13a5ee5`, 2026-08-20

## Why this matters

The repository advertises seven clients, but invocation facts live in both
`INSTALL.md` and `docs/src/lib/agents.ts`, while goal/model guidance names only
three clients inside shared skill material. A checked capability registry makes
static facts mechanically consistent and gives volatile model mappings an
explicit verification date. The guide can recommend Fable where frontier
judgment fits and a bounded lower-cost route where evals support it, without
polluting shared skill bodies or pretending every host has the same delegation
features.

## Current state

- `INSTALL.md:1-8` says client behavior was verified in August 2026 and must be
  re-verified at every release.
- `INSTALL.md:365-382` contains a hand-written seven-client compatibility
  matrix.
- `docs/src/lib/agents.ts:20-27` separately hard-codes the same seven IDs,
  labels, and invocation functions:

  ```ts
  { id: "claude", label: "Claude Code", invoke: slash("/tailrocks-skills:") }
  { id: "codex", label: "Codex CLI", invoke: slash("$") }
  // ... five more rows
  ```

- `scripts/validate-skills.ts:354-365` checks that catalog documents mention
  every skill, but does not compare client IDs, invocation syntax, manifests,
  manual-only policy, or routing capability across these surfaces.
- `docs/AGENTS.md:19-30` says adding a client requires editing
  `docs/src/lib/agents.ts`, while `INSTALL.md` contains additional client facts.
- The supported clients and locally observed versions at planning time were:
  Claude Code 2.1.233, Codex CLI 0.148.0, OpenCode 1.18.15, Grok Build 1.0.4,
  Kimi Code 0.36.1, Antigravity CLI 1.1.13, and Amp build
  `0.0.1786824065`. These are evidence to re-check, not pins.
- Current official capability evidence:
  - Fable 5: frontier, long-running planning/orchestration:
    <https://www.anthropic.com/claude/fable>.
  - Claude Code: per-subagent model selection and fast-model delegation:
    <https://code.claude.com/docs/en/sub-agents>.
  - Codex/OpenAI: Sol/Terra/Luna capability tiers:
    <https://developers.openai.com/api/docs/guides/latest-model> and
    <https://learn.chatgpt.com/docs/agent-configuration/subagents>.
  - OpenCode: per-agent `model` and primary/subagent modes:
    <https://opencode.ai/docs/agents>.
  - Kimi: optional per-invocation subagent model override; the current page
    does not establish a separate primary/secondary tier contract:
    <https://moonshotai.github.io/kimi-cli/en/customization/agents.html>.
  - Antigravity: `inherit`, `flash`, and `pro` subagent tiers:
    <https://antigravity.google/docs/subagents>.
  - Amp: current managed Low/Medium/High/Ultra routes and custom-agent model
    support: <https://ampcode.com/modes>.
  - Grok: top-level custom model selection is documented, but no verified
    heterogeneous per-subagent mapping was found:
    <https://docs.x.ai/build/overview>.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Installed versions | Run each client version command separately through `rtk proxy` | each available client prints a version; missing client is recorded |
| Static client discovery | `rtk proxy grok inspect --json` | discovered Tailrocks plugin/skills shown, no writes |
| Amp skill discovery | `rtk proxy amp skill list` | canonical `tailrocks-*` names shown |
| Targeted tests | `rtk bun test scripts/validate-skills.test.ts scripts/generate-docs.test.ts` | all pass |
| Regenerate docs | `rtk mise run docs` | exit 0 |
| Docs build | `rtk mise run docs:build` | static build exits 0 |
| Repository gates | Run `rtk mise run lint`, `test`, `fmt`, and `ci` separately | all exit 0 |

## Suggested executor toolkit

- Use Context7 for any client CLI syntax if available. If unavailable, use only
  the official sources listed above and say so in release evidence.
- Use client `--help`, inspect, or list commands as empirical confirmation.
  Never expose credentials or user configuration values in committed output.

## Scope

**In scope**:

- `clients.json` (create; canonical static registry)
- `INSTALL.md`
- `docs/AGENTS.md`
- `docs/src/lib/agents.ts`
- `docs/src/generated/clients.ts` (generated public projection; create)
- `docs/src/components/client-routing-matrix.tsx` (create)
- `docs/content/docs/delivery/index.mdx`
- `docs/content/docs/delivery/meta.json`
- `docs/content/docs/delivery/model-routing.mdx` (create)
- `scripts/validate-skills.ts`
- `scripts/validate-skills.test.ts`
- `scripts/generate-docs.ts`
- `scripts/generate-docs.test.ts`
- Generated `docs/content/docs/install.mdx`
- `advisor-plans/README.md` status row

**Out of scope**:

- Any `SKILL.md` provider/model syntax. Plan 002 removes such syntax.
- Installing, upgrading, or configuring the user's clients or credentials.
- Claiming live behavior for a client that cannot be run and inspected.
- Hard-pinning model aliases in skill logic. Registry mappings are dated
  release evidence and must fail visibly when stale.
- Building seven duplicate execution skills or seven bespoke GOAL formats.
- Adding a task alias in `mise.toml`; repository law forbids aliases.

## Git workflow

- Branch: `advisor/003-client-capability-registry` when executed separately.
- Commit message: `docs(clients): publish model routing matrix`.
- Commit with `git commit -s` and add
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not push or open a PR unless the operator requests it.

## Steps

### Step 1: Establish the registry red bars

Before creating `clients.json`, add tests that expect:

- exactly these IDs in order: `claude`, `codex`, `opencode`, `grok`, `kimi`,
  `antigravity`, `amp`;
- every client to have a label, invocation adapter, install/manifest source,
  manual-only mechanism, goal mode, delegation mode, all four model-backed
  route mappings, verified version/date, and safe local verification commands;
- every docs-facing agent ID/label/invocation to be derived from the registry;
- generator output to include a typed `docs/src/generated/clients.ts` public
  projection that excludes verification commands and release-only fields;
- every generated compatibility table to contain exactly the registry IDs;
- unsupported/unverified capabilities to use explicit `unverified`, never an
  empty value or optimistic default.

Run the tests against the current duplicate hard-coded state and record the
expected failure.

The existing validator suite builds a minimal valid repository with
`writeSkill()` and `writeManifests()`. Add a `writeClients()` helper and call it
from `beforeEach` so unrelated validator tests remain valid after the registry
becomes required. Missing/malformed-registry tests must remove or replace only
that fixture and assert their own errors.

**Verify**:
`rtk bun test scripts/validate-skills.test.ts scripts/generate-docs.test.ts`
→ nonzero only because the registry and derived surfaces do not yet exist.

### Step 2: Create one typed data contract

Create root `clients.json` with a schema version and ordered client objects.
Use this conceptual shape exactly; field names may differ only if tests and all
consumers change together:

```json
{
  "schema_version": 1,
  "verified_at": "YYYY-MM-DD",
  "clients": [
    {
      "id": "claude",
      "label": "Claude Code",
      "verified_version": "...",
      "invocation": { "kind": "slash", "prefix": "/tailrocks-skills:" },
      "manifest": ".claude-plugin/plugin.json",
      "manual_only": "frontmatter",
      "goal_mode": "native-or-manual",
      "delegation": "per-subagent-model",
      "routes": {
        "frontier-judgment": {
          "selector": "claude-fable-5",
          "availability": "documented",
          "qualification": "verify-by-eval"
        },
        "bounded-executor": {
          "selector": "sonnet",
          "availability": "documented",
          "qualification": "verify-by-eval"
        },
        "fast-mechanical": {
          "selector": "haiku",
          "availability": "documented",
          "qualification": "verify-by-eval"
        },
        "independent-verifier": {
          "selector": "claude-fable-5",
          "availability": "documented",
          "qualification": "verify-by-eval",
          "requires": ["fresh-context", "frontier-judgment"]
        }
      },
      "verify": ["claude --version", "claude --plugin-dir ."]
    }
  ]
}
```

Rules:

- no credential values, home-directory dumps, or machine-specific paths;
- `verified_at` is ISO date and cannot predate the current release evidence;
- selectors describe the public client choice, not an assumed backend model;
- every route separates availability (`documented`, `managed`, `experimental`,
  or `unverified`) from behavioral qualification (`verify-by-eval` or
  `verified`);
- a client with no verified same-session mixed-model route says
  `artifact-handoff`, not `inherit` or `unsupported` by guess;
- all four model-backed roles exist. Semantic `independent-verifier` requires a
  fresh context and a route qualified for `frontier-judgment`.

Do not put external documentation URLs or source-attribution prose in
`clients.json`, `INSTALL.md`, or the published guide. Repository law requires
external work to be distilled into shipped content, with provenance retained in
git/PR history and internal planning artifacts such as this file.

Add parser/validator logic to `scripts/validate-skills.ts`; export it for unit
tests. Reject duplicate IDs, unknown enums, missing roles, future dates, and
unsafe verification commands containing secrets or mutation verbs.

**Verify**: `rtk bun test scripts/validate-skills.test.ts` → registry tests pass.

### Step 3: Record capability-correct current mappings

Re-open every official source and run installed-client version/discovery
commands. Populate the registry conservatively:

| Client | Frontier judgment | Bounded executor | Fast mechanical | Independent semantic verifier | Same-session route |
|---|---|---|---|---|---|
| Claude Code | Fable 5 | Sonnet, only after eval | Haiku, narrow/read-only after eval | fresh Fable/frontier-qualified context | per-subagent model/full model ID |
| Codex CLI | GPT-5.6 Sol | GPT-5.6 Terra after eval | GPT-5.6 Luna for narrow repeatable work after eval | fresh Sol/frontier-qualified context | configurable subagent model/reasoning |
| OpenCode | strongest configured provider/model (Fable or Sol are candidates) | explicitly configured balanced agent after eval | explicitly configured fast agent after eval | fresh strongest configured route | per-agent provider/model |
| Grok Build | selected top-level frontier model | separate session consuming the checked plan | separate narrow session when verified | separate fresh frontier session | `artifact-handoff` until public per-subagent override is proven |
| Kimi Code | strongest configured model | explicit per-subagent override after eval | explicit fast-model override only for proven narrow work | fresh strongest configured route | documented optional per-subagent model override |
| Antigravity | `pro` tier | `flash` only after representative eval, otherwise `pro` | `flash` for proven mechanical tasks | fresh `pro` context | per-subagent tier |
| Amp | `ultra`/`high` capability mode; exact backend is managed | `medium` for bounded work after eval | `low` for small well-defined work after eval | fresh `ultra`/`high` frontier route | managed routing; do not promise one backend |

Do not state that Fable is “best” for all tasks. State the positive predicate:
it is the preferred current Claude mapping for the repository's
`frontier-judgment` role because the vendor explicitly documents staged
planning, delegation, and long-running self-checking. Sol is the direct Codex
alternative for the same role; other hosts use their strongest documented or
locally available route as an eval candidate.

At this step, documentation and client inspection may establish only route
availability. Initialize every behavioral `qualification` as
`verify-by-eval`; only plan 004 may promote it to `verified` after scoped,
representative green runs. An untested frontier mapping is still not qualified
for semantic acceptance.

**Verify**: validator exits 0; every registry claim has a dated observed
version or explicit `unverified` availability, and every route remains
`verify-by-eval` until plan 004 evidence exists.

### Step 4: Derive the website agent selector and install matrix

Do not import root JSON directly into the browser bundle. Extend
`scripts/generate-docs.ts` to project only public static fields—client ID,
label, invocation kind/prefix, route selector/status, goal mode, and delegation
mode—into generated `docs/src/generated/clients.ts` as typed readonly data.
Exclude local verification commands and release-only evidence. Refactor
`docs/src/lib/agents.ts` to import that projection. Keep invocation behavior
local, but remove duplicate IDs, labels, and prefixes. Convert the registry's
`slash`/`prose` data to the existing `invoke` function so callers do not change.

Add `docs/src/components/client-routing-matrix.tsx` to render the public route
table from the same generated projection. The routing page in step 5 imports
this component; it does not copy client rows.

Add bounded markers around the compatibility matrix in `INSTALL.md`; update
`scripts/generate-docs.ts` so `generate()` reads `INSTALL.md`, replaces only the
marked matrix with rows rendered from `clients.json`, and returns the resulting
`INSTALL.md` as a generated output. The same in-memory updated content must feed
the existing generated `docs/content/docs/install.mdx`; do not reread stale
`INSTALL.md`. In normal mode the generator writes both outputs; in `--check`
mode either drift makes the command fail. Do not hand-maintain the same fields
in two places. Extend generator tests to prove:

- registry order controls the matrix and picker order;
- the Codex invocation remains `$tailrocks-*`;
- every displayed skill title follows plan 001's `Tailrocks: ` convention;
- prose clients still say `Use tailrocks-...`.

Regenerate install docs.

Update `docs/AGENTS.md` through `tailrocks-agents-md`: adding a client now means
editing `clients.json` and regenerating, while `docs/src/lib/agents.ts` remains
the invocation-behavior consumer. Remove the now-wrong one-file ownership
claim; do not add duplicate workflow prose.

**Verify**:

```sh
rtk bun test scripts/generate-docs.test.ts
rtk mise run docs
rtk mise run docs:check
```

→ all pass; no hand-maintained client identity list remains in
`docs/src/lib/agents.ts` or the marked install matrix, and the generated public
projection contains no verification command or private release evidence.

### Step 5: Publish the cross-client routing guide

Create `docs/content/docs/delivery/model-routing.mdx` and link it from the
delivery index/sidebar. Use the role names from plan 002. Include:

1. the selection predicate and escalation rules;
2. a generated or registry-backed seven-client mapping table;
3. two supported deployment shapes:
   - same-host delegation when per-task model routing is verified;
   - cross-session artifact handoff when it is not;
4. the required handoff record: role, selector, provider/model/version when
   exposed, plan SHA, eval evidence ID, and degraded state;
5. exact client syntax only when verified against the current official docs and
   installed version;
6. an explicit warning that Amp managed routes and model aliases can change;
7. an explicit warning that Kimi documents an optional per-subagent model
   override but no named primary/secondary tier contract; selectors remain
   configuration-dependent and behaviorally unqualified until eval evidence;
8. an explicit statement that Grok per-subagent heterogeneous routing remains
   unverified, so the safe path is separate sessions consuming the same plan;
9. release re-verification steps and commands, with secrets redacted.

Keep prose concise; the registry is the detailed fact source. Distill the
researched behavior into project-owned guidance. Do not include external source
links or name outside work as provenance in shipped documentation; provenance
stays in this internal plan and git/PR history.

**Verify**:

```sh
rtk rg -n 'claude|codex|opencode|grok|kimi|antigravity|amp' docs/content/docs/delivery/model-routing.mdx
rtk mise run docs:build
```

→ all seven clients are covered and the static docs build exits 0.

### Step 6: Make release drift fail closed

Extend validation so a release cannot ship when:

- registry date/version evidence is absent;
- a supported client is missing from generated docs/picker;
- a route status is unknown;
- a route marked behaviorally `verified` lacks a plan-004 evidence ID and safe
  local verification command;
- `docs/src/lib/agents.ts` introduces a hard-coded eighth ID not in registry;
- shared `skills/*/SKILL.md` files contain client/model names introduced by this
  routing work.

Do not make proprietary live-client runs part of PR CI. Static validation is
deterministic; live discovery is recorded/re-run during release preparation.

**Verify**: add negative unit fixtures for every rule and run
`rtk bun test scripts/validate-skills.test.ts` → all pass.

### Step 7: Run all gates

**Verify**:

```sh
rtk mise run docs
rtk mise run lint
rtk mise run test
rtk mise run fmt
rtk mise run ci
rtk mise run docs:build
rtk git diff --check
```

→ every command exits 0.

## Test plan

- Registry parser tests: valid seven-client fixture; duplicate/missing client;
  missing role; bad enum; absent verification date; unsafe verification
  command; `verified` without plan-004 evidence.
- Generator tests: one source controls picker order, labels, invocation form,
  and install matrix.
- Existing `Invoke` tests continue proving canonical `tailrocks-*` names.
- Docs build proves the generated public TypeScript projection and route-table
  component compile in the Fumadocs/TanStack pipeline without bundling local
  verification commands.
- Manual release evidence runs every available client's version and discovery
  command; unavailable clients remain `unverified`, never silently green.

## Done criteria

- [ ] `clients.json` is the single checked source for all seven client IDs,
      labels, invocation forms, static capabilities, dated mappings, and
      verification evidence.
- [ ] Docs picker and compatibility matrix derive from the registry.
- [ ] All seven clients have a documented same-host or artifact-handoff route.
- [ ] Fable 5 is mapped to frontier judgment for Claude; Sonnet/Haiku are
      bounded/mechanical candidates gated by eval evidence.
- [ ] Sol/Terra/Luna provide the equivalent Codex role ladder.
- [ ] Managed and unverified capabilities are labeled exactly; `experimental`
      is used only when current official documentation establishes it, and no
      optimistic fallback exists.
- [ ] Shared skill bodies contain no provider/client mapping.
- [ ] `rtk mise run lint`, `test`, `fmt`, `ci`, and `docs:build` exit 0.
- [ ] No file outside Scope changed, excluding generated docs/status row.
- [ ] `advisor-plans/README.md` marks plan 003 `DONE`.

## STOP conditions

- Official documentation contradicts a proposed route or does not expose the
  claimed selector. Mark it `unverified` or use artifact handoff; do not infer.
- A live verification command would print credentials, full user config, or
  sensitive paths. Replace it with a safe narrow command.
- `clients.json` begins carrying prose better owned by the guide. Keep the
  registry structured and finite.
- A client cannot consume the generic plan artifact from plan 002. Report the
  exact incompatibility; do not fork the skill tree.
- A provider mapping changes during implementation. Re-verify all entries and
  stamp one coherent date rather than mixing snapshots.
- Any gate fails twice after a reasonable correction.

## Maintenance notes

- Model mappings are release data, not architecture. Roles should remain
  stable when Fable/Sol successors arrive.
- A route marked `verify-by-eval` cannot become `verified` from documentation
  alone; plan 004 must supply representative behavioral evidence.
- Reviewers should check that the generated install matrix does not overstate
  live discovery behavior that static tests cannot prove.
