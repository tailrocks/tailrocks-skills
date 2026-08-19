# Plan 003: Publish the seven-client capability registry and model-routing guide

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **Drift check (run first)**: after plan 002 is published onto the shared
> execution branch, run `rtk proxy git rev-parse HEAD` and record that literal
> 40-character SHA as `<execution-base>` in the execution report. Then run
> `rtk git diff --stat 13a5ee5..<execution-base> -- clients.json INSTALL.md docs/AGENTS.md docs/src/lib/agents.ts docs/src/generated/clients.ts docs/src/components/client-routing-matrix.tsx docs/content/docs/delivery/index.mdx docs/content/docs/delivery/meta.json docs/content/docs/delivery/model-routing.mdx scripts/validate-skills.ts scripts/validate-skills.test.ts scripts/generate-docs.ts scripts/generate-docs.test.ts scripts/verify-clients.ts scripts/verify-clients.test.ts docs/content/docs/install.mdx`.
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
- Plan 001 legitimately changed `INSTALL.md`, generated install docs, and the
  generator/validator tests to enforce `Tailrocks: ` UI titles. That dependency
  drift is expected when this plan executes. Preserve its title invariant and
  compare current code rather than restoring the planning-time excerpts.
- The supported clients and locally observed versions at planning time were:
  Claude Code 2.1.233, Codex CLI 0.148.0, OpenCode 1.18.15, Grok Build 1.0.4,
  Kimi Code 0.36.1, Antigravity CLI 1.1.13, and Amp build
  `0.0.1786824065-g013933`. These are evidence to re-check, not pins.
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
| Sanitized client evidence | `rtk bun scripts/verify-clients.ts --all` | one bounded JSON record per client; no paths/config/credentials |
| Targeted tests | `rtk bun test scripts/validate-skills.test.ts scripts/generate-docs.test.ts` | all pass |
| Regenerate docs | `rtk mise run docs` | exit 0 |
| Docs build | `rtk mise run docs:build` | static build exits 0 |
| Repository gates | Run `rtk mise run lint`, `test`, `fmt`, and `ci` separately | all exit 0 |

## Suggested executor toolkit

- Use Context7 for any client CLI syntax if available. If unavailable, use only
  the official sources listed above and say so in release evidence.
- Run live commands only through the bounded verifier defined below. Never put
  raw inspect/list output, credentials, configuration, or absolute paths in a
  report or committed artifact.

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
- `scripts/verify-clients.ts` (create)
- `scripts/verify-clients.test.ts` (create)
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

- Branch: remain on the operator's existing shared execution branch. Do not
  create or push another branch; this program uses one branch and one PR.
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
  manual-only mechanism, duplicate semantics, goal mode, delegation mode, all
  four model-backed route mappings, verified version/date, and safe local
  verification commands;
- every docs-facing agent ID/label/invocation to be derived from the registry;
- generator output to include a typed `docs/src/generated/clients.ts` public
  projection that excludes verification commands and observed installed
  versions;
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
Implement and export the following finite v1 contract from
`scripts/validate-skills.ts`; `clients.json`, its tests, and every consumer use
these exact field names and enum values:

```ts
type ClientId =
  | "claude"
  | "codex"
  | "opencode"
  | "grok"
  | "kimi"
  | "antigravity"
  | "amp";
type InstallChannel =
  | "marketplace-plugin"
  | "skills-copy"
  | "claude-plugin-auto-ingest"
  | "plugin-command";
type InstallSource = {
  channel: InstallChannel;
  manifests: string[];
  targets: string[];
};
type InvocationPattern = {
  template: string;
  condition: "always" | "when-unclaimed";
};
type Invocation =
  | {
      kind: "command";
      primary: InvocationPattern;
      aliases: InvocationPattern[];
      discovery: string[];
    }
  | {
      kind: "prose";
      primary: InvocationPattern;
      aliases: InvocationPattern[];
      discovery: string[];
    };
type ManualOnly =
  | "frontmatter"
  | "openai-policy"
  | "permission-config"
  | "not-enforced"
  | "tolerated-not-enforced"
  | "not-read";
type GoalMode = "native-goal" | "artifact-handoff";
type Delegation =
  | "per-subagent-model"
  | "per-agent-model"
  | "top-level-model"
  | "per-invocation-model"
  | "per-subagent-tier"
  | "managed-routing";
type DuplicateSemantics =
  | "namespaced-plus-copy"
  | "path-dedupe-single-install"
  | "warning-last-write-wins"
  | "priority-name-dedupe"
  | "first-registration-wins"
  | "single-location-undocumented"
  | "first-wins-single-install";
type CapabilityRole =
  | "frontier-judgment"
  | "bounded-executor"
  | "fast-mechanical"
  | "independent-verifier";
type Selector =
  | { kind: "fixed"; values: string[] }
  | {
      kind: "configured-capability";
      capability: "strongest" | "balanced" | "fast";
      values: string[];
    }
  | { kind: "tier"; values: ("pro" | "flash")[] }
  | { kind: "managed-mode"; values: ("low" | "medium" | "high" | "ultra")[] }
  | { kind: "artifact-handoff"; values: [] };
type Availability = "documented" | "managed" | "experimental" | "unverified";
type Qualification = "verify-by-eval" | "verified";
type ReasoningSetting = "low" | "medium" | "high" | null;
type Requirement =
  | "fresh-context"
  | "frontier-judgment"
  | "representative-eval"
  | "separate-session";
type Projection =
  | "semantic-version-token"
  | "grok-tailrocks-name-set"
  | "amp-tailrocks-name-set";

type Observation =
  | { status: "observed"; version: string; observed_at: string }
  | { status: "unavailable"; version: null; observed_at: string };
type RouteEvidence = {
  id: string;
  client_id: ClientId;
  role: CapabilityRole;
  selector: string;
  reasoning_setting: ReasoningSetting;
  client_version: string;
  observed_at: string;
  runs: {
    workflow_id: string;
    fixture_commit: string;
    runs: number;
    passed: number;
  }[];
  reproduce_argv: string[][];
};

type Route = {
  selector: Selector;
  reasoning_setting: ReasoningSetting;
  availability: Availability;
  qualification: Qualification;
  requires: Requirement[];
  evidence_id?: string;
};
type Verification = {
  claim: "installed-version" | "tailrocks-skill-discovery";
  argv: string[];
  projection: Projection;
  timeout_ms: 5_000 | 30_000;
};
type Client = {
  id: ClientId;
  label: string;
  observation: Observation;
  install_sources: InstallSource[];
  invocation: Invocation;
  manual_only: ManualOnly;
  manual_only_setting: string | null;
  goal_mode: GoalMode;
  delegation: Delegation;
  duplicate_semantics: DuplicateSemantics;
  routes: Record<CapabilityRole, Route>;
  verify: Verification[];
};
type Registry = {
  schema_version: 1;
  snapshot_at: string;
  clients: Client[];
  route_evidence: RouteEvidence[];
};
```

Rules:

- no credential values, home-directory dumps, or machine-specific paths;
- `snapshot_at` and every `observation.observed_at` are ISO dates, never future
  dates, and equal for one coherent release snapshot;
- an observed client has a nonempty semantic version; an unavailable client has
  `version: null` and every route `availability: unverified`;
- all arrays are nonempty except `route_evidence`, each install source's
  `manifests`/`targets`, invocation aliases/discovery,
  selector `values` for configured/artifact selectors, and `requires`;
- every primary/alias template contains exactly one literal `<name>`
  placeholder; every primary condition is `always`; an alias uses
  `when-unclaimed` only where the current client documents collision-sensitive
  shorthand. `discovery` may name a bounded picker command such as `/skills`
  but is never treated as direct invocation;
- install targets use only repository-relative paths or portable `~`/`$VAR`
  forms; machine-absolute paths are rejected;
- selectors describe the public client choice, not an assumed backend model;
- `reasoning_setting` is null when the public client route owns/defaults it;
  otherwise it is the exact documented adapter value;
- every route separates availability (`documented`, `managed`, `experimental`,
  or `unverified`) from behavioral qualification (`verify-by-eval` or
  `verified`);
- `fixed` selectors contain exact public selector names; configured selectors
  intentionally permit an empty values list because the local configuration
  owns the candidate; `artifact-handoff` must have `values: []` and require
  `separate-session`;
- a client with no documented same-session mixed-model route uses an
  `artifact-handoff` selector for that role, not `inherit` or `unsupported` by
  guess;
- all four model-backed roles exist. Semantic `independent-verifier` requires a
  `fresh-context` requirement and a frontier-qualified selector; an
  artifact-handoff verifier additionally requires `separate-session`;
- every behaviorally unqualified bounded/fast route requires
  `representative-eval`;
- `evidence_id` is absent for `verify-by-eval` and required for `verified`;
- plan 003 initializes `route_evidence: []`. A future evidence record ID is
  unique and matches `^plan004-[a-z0-9-]+$`; its client, role, selected value,
  observed version/date, and referenced route must agree. Every run uses a
  40-hex fixture commit, positive integer count, and `passed === runs`;
  `reproduce_argv` is nonempty structured argv and accepts only exact
  non-shell `mise run evals -- ...` workflow commands without an
  `--allow-unqualified-route` flag. A `verified` route must reference one such
  record; an unqualified route must not;
- `verify` is data, never a shell string. The validator accepts only the exact
  executable/argv/projection tuples defined in Step 3.

Do not put external documentation URLs or source-attribution prose in
`clients.json`, `INSTALL.md`, or the published guide. Repository law requires
external work to be distilled into shipped content, with provenance retained in
git/PR history and internal planning artifacts such as this file.

Add parser/validator logic to `scripts/validate-skills.ts`; export it for unit
tests. Reject duplicate IDs, unknown enums, missing roles, future dates, and
unsafe verification records: empty argv, unknown executable/flag/projection,
shell metacharacters, environment assignment, mutation/installation flags, an
interactive command, a projection incompatible with its exact argv, or a
command outside the Step-3 tuple allowlist.

**Verify**: `rtk bun test scripts/validate-skills.test.ts` → registry tests pass.

### Step 3: Record capability-correct current mappings

Re-open every official source and run installed-client version/discovery
commands only through the sanitizer below. Populate all seven records exactly
from these static choices; a changed observed fact requires updating this plan
or recording the route as `unverified`, never inventing a new enum.

Use registry snapshot/observation date `2026-08-20` after re-verification. All
seven are currently `status: observed`. Labels and observed versions are
exactly: `claude` → Claude Code / `2.1.233`; `codex` → Codex CLI /
`0.148.0`; `opencode` → OpenCode / `1.18.15`; `grok` → Grok Build / `1.0.4`;
`kimi` → Kimi Code / `0.36.1`; `antigravity` → Antigravity / `1.1.13`; `amp`
→ Amp / `0.0.1786824065-g013933`. If a re-run differs, record the observed value and
re-check that client's official claims before continuing. If an executable is
missing, change only that client to `status: unavailable`, null version, the
snapshot date, and `availability: unverified` on all four routes.

| ID | Install sources (`channel` → `manifests`) | Invocation | Manual-only mechanism; setting | Goal; delegation; duplicates |
|---|---|---|---|---|
| `claude` | `marketplace-plugin` → `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`; no target | command `/tailrocks-skills:<name>` always; alias `/<name>` when unclaimed; no discovery | `frontmatter`; `disable-model-invocation: true` | `native-goal`; `per-subagent-model`; `namespaced-plus-copy` |
| `codex` | `marketplace-plugin` → `.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json`; no target | command `$<name>` always; no alias; discovery `/skills` | `openai-policy`; `agents/openai.yaml policy.allow_implicit_invocation: false` | `native-goal`; `per-agent-model`; `path-dedupe-single-install` |
| `opencode` | `skills-copy` → no manifest; `~/.config/opencode/skills/` | prose `Use <name>.` always; alias `Load <name> with the skill tool.` always | `permission-config`; `permission.skill` | `artifact-handoff`; `per-agent-model`; `warning-last-write-wins` |
| `grok` | `claude-plugin-auto-ingest` → `.claude-plugin/plugin.json`, no target; `plugin-command` → `.claude-plugin/plugin.json` fallback, no target | command `/<name>` always; alias `/tailrocks-skills:<name>` always; discovery `/skills` | `frontmatter`; `disable-model-invocation: true` | `artifact-handoff`; `top-level-model`; `priority-name-dedupe` |
| `kimi` | `plugin-command` → `.kimi-plugin/plugin.json`, no target; `skills-copy` → no manifest, `$KIMI_CODE_HOME/skills/` | command `/skill:<name>` always; alias `/<name>` when unclaimed | `frontmatter`; `disable-model-invocation: true` | `artifact-handoff`; `per-invocation-model`; `first-registration-wins` |
| `antigravity` | `plugin-command` → `plugin.json`, no target; `skills-copy` → no manifest, `~/.gemini/config/skills/` and `.agents/skills/` | command `/<name>` always; no alias/discovery | `not-read`; no setting | `artifact-handoff`; `per-subagent-tier`; `single-location-undocumented` |
| `amp` | `claude-plugin-auto-ingest` → `.claude-plugin/plugin.json`, no target; `skills-copy` → no manifest, `~/.config/agents/skills/` and `.agents/skills/` | prose `Use <name>.` always; alias `Select <name> from the skill palette.` always | `tolerated-not-enforced`; `disable-model-invocation` | `artifact-handoff`; `managed-routing`; `first-wins-single-install` |

The route cells below use
`selector kind:values; availability; requirements`. Every row starts with
`qualification: verify-by-eval` and no `evidence_id`.

Set `reasoning_setting: null` on every route except Codex: use `high` for
`frontier-judgment` and `independent-verifier`, `medium` for
`bounded-executor`, and `low` for `fast-mechanical`. Plan 004 must verify these
exact adapter settings rather than inheriting a mutable CLI default.

| ID | Frontier judgment | Bounded executor | Fast mechanical | Independent verifier |
|---|---|---|---|---|
| `claude` | `fixed:[claude-fable-5]`; `documented`; none | `fixed:[sonnet]`; `documented`; `representative-eval` | `fixed:[haiku]`; `documented`; `representative-eval` | `fixed:[claude-fable-5]`; `documented`; `fresh-context`, `frontier-judgment` |
| `codex` | `fixed:[gpt-5.6-sol]`; `documented`; none | `fixed:[gpt-5.6-terra]`; `documented`; `representative-eval` | `fixed:[gpt-5.6-luna]`; `documented`; `representative-eval` | `fixed:[gpt-5.6-sol]`; `documented`; `fresh-context`, `frontier-judgment` |
| `opencode` | `configured-capability:strongest:[]`; `documented`; none | `configured-capability:balanced:[]`; `documented`; `representative-eval` | `configured-capability:fast:[]`; `documented`; `representative-eval` | `configured-capability:strongest:[]`; `documented`; `fresh-context`, `frontier-judgment` |
| `grok` | `configured-capability:strongest:[]`; `documented`; none | `artifact-handoff:[]`; `unverified`; `representative-eval`, `separate-session` | `artifact-handoff:[]`; `unverified`; `representative-eval`, `separate-session` | `artifact-handoff:[]`; `unverified`; `fresh-context`, `frontier-judgment`, `separate-session` |
| `kimi` | `configured-capability:strongest:[]`; `documented`; none | `configured-capability:balanced:[]`; `documented`; `representative-eval` | `configured-capability:fast:[]`; `documented`; `representative-eval` | `configured-capability:strongest:[]`; `documented`; `fresh-context`, `frontier-judgment` |
| `antigravity` | `tier:[pro]`; `documented`; none | `tier:[flash]`; `documented`; `representative-eval` | `tier:[flash]`; `documented`; `representative-eval` | `tier:[pro]`; `documented`; `fresh-context`, `frontier-judgment` |
| `amp` | `managed-mode:[ultra,high]`; `managed`; none | `managed-mode:[medium]`; `managed`; `representative-eval` | `managed-mode:[low]`; `managed`; `representative-eval` | `managed-mode:[ultra,high]`; `managed`; `fresh-context`, `frontier-judgment` |

Create `scripts/verify-clients.ts` as the only live-command path. Its public CLI
accepts exactly `--all` or `--client <ClientId>`. It reads the structured
verification records, checks each against this exact allowlist, invokes
`Bun.spawn` directly—never a shell—and prints only sanitized JSON. Use these
exact process limits for every tuple:

```ts
const VERIFY_VERSION_TIMEOUT_MS = 5_000;
const VERIFY_DISCOVERY_TIMEOUT_MS = 30_000;
const VERIFY_MAX_BUFFER_BYTES = 262_144; // independently for stdout/stderr
const VERIFY_KILL_SIGNAL = "SIGKILL";

Bun.spawn({
  cmd: argv,
  cwd: repositoryRoot,
  stdin: "ignore",
  stdout: "pipe",
  stderr: "pipe",
});
```

Read stdout and stderr concurrently. If either exceeds 262,144 bytes or the
record's exact 5,000/30,000 ms timer fires, send `SIGKILL`, await process
termination, discard both buffers, and return only a generic `overflow` or
`timeout` failure code. Version tuples use 5,000; discovery tuples use 30,000,
an observed bound above Amp's 13.079-second cold run.
Captured stderr is never parsed or emitted. Do not spread registry data into
spawn options and do not use inherited stdio. The allowed tuples are:

| ID | Allowed argv and projection |
|---|---|
| `claude` | `["claude","--version"]` → `semantic-version-token`, 5,000 ms |
| `codex` | `["codex","--version"]` → `semantic-version-token`, 5,000 ms |
| `opencode` | `["opencode","--version"]` → `semantic-version-token`, 5,000 ms |
| `grok` | `["grok","--version"]` → `semantic-version-token`, 5,000 ms; `["grok","inspect","--json"]` → `grok-tailrocks-name-set`, 30,000 ms |
| `kimi` | `["kimi","--version"]` → `semantic-version-token`, 5,000 ms |
| `antigravity` | `["agy","--version"]` → `semantic-version-token`, 5,000 ms |
| `amp` | `["amp","--version"]` → `semantic-version-token`, 5,000 ms; `["amp","skill","list"]` → `amp-tailrocks-name-set`, 30,000 ms |

Projection grammar is exact:

- `semantic-version-token` decodes capped stdout as UTF-8, requires exactly one
  match of `\b[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?\b`, and emits only
  that token. Zero or multiple matches are `parse-failure`.
- `grok-tailrocks-name-set` parses stdout as JSON, requires a root `skills`
  array of objects with string `name` fields, keeps only names matching
  `^tailrocks-[a-z0-9]+(?:-[a-z0-9]+)*$`, sorts/deduplicates them, and requires
  exact equality with the canonical current `skills/tailrocks-*/` directory
  names. It emits only that name array.
- `amp-tailrocks-name-set` splits capped stdout into lines and ASCII-whitespace
  fields, considers only field 2 when it matches the exact name regex, then
  sorts/deduplicates those skill-record names and requires exact equality with
  the canonical skill directory names. It ignores matches in every other field
  (including source paths/plugin labels) and emits only that name array.

One output record contains only client ID, `available`, observation status,
claim, success, the sanitized version token or sorted canonical name set, and a
numeric exit code/generic failure code. Never echo argv, stdout, stderr, cwd,
environment, config, paths, or parser errors. A missing executable yields
`available: false` plus an `unavailable` observation with null version and the
snapshot date; a timeout, overflow, parse failure, or nonzero exit yields a
generic failed claim. The process still exits nonzero when any available
client's claim fails. Add unit tests with fake process output proving absolute
paths, home paths, config keys, credentials, stderr, shell syntax, interactive
flags, mutating flags, excessive output, ambiguous versions, malformed JSON,
and unknown tuples never reach output or execution. `claude --plugin-dir .` is
forbidden because it is interactive; no verifier tuple loads a plugin or writes
state. Export the sanitized probe function with injected spawn/clock so plan
004 can version-check a requested adapter without parsing CLI text or spawning
an unvalidated command; imports receive the structured sanitized result only.

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

**Verify**:

```sh
rtk bun test scripts/verify-clients.test.ts scripts/validate-skills.test.ts
rtk bun scripts/verify-clients.ts --all
rtk mise run lint
```

→ tests and validation exit 0; the verifier prints one sanitized record per
client, missing clients are `available: false`, available versions match their
registry records, no emitted value contains a path/config/credential, and every
route remains `verify-by-eval` until plan 004 evidence exists.

### Step 4: Derive the website agent selector and install matrix

Do not import root JSON directly into the browser bundle. Extend
`scripts/generate-docs.ts` to project only public static fields—registry date,
client ID, label, invocation templates/discovery, install sources,
manual-only mechanism/setting, duplicate semantics, route selector/status,
goal mode, and delegation mode—into generated
`docs/src/generated/clients.ts` as typed readonly data. Exclude local
verification commands, observed installed versions, and route evidence. Refactor
`docs/src/lib/agents.ts` to import that projection. Keep invocation behavior
local, but remove duplicate IDs, labels, and templates. Substitute `<name>` in
the registry's command/prose primary template inside the existing `invoke`
function so callers do not change.

Add `docs/src/components/client-routing-matrix.tsx` to render the public route
table from the same generated projection. The routing page in step 5 imports
this component; it does not copy client rows.

Add bounded markers around the compatibility matrix and one bounded
`GENERATED CLIENT FACTS: <id>` block inside each of the seven detailed client
sections in `INSTALL.md`. Replace the current hand-written bullets that restate
install sources/manifests/targets, invocation primary/aliases/conditions and
discovery, manual-only mechanism/setting, and duplicate semantics with those
generated blocks. Procedural commands, update instructions, and explanatory
warnings stay hand-written but must not restate a registry-owned field. Thus
Claude/Kimi's `when-unclaimed` alias condition and Kimi/Antigravity's copy
alternatives come from data, not a second prose source.

Update `scripts/generate-docs.ts` so `generate()` reads `INSTALL.md`, replaces
the marked matrix and all seven fact blocks from `clients.json`, rejects a
missing/duplicate/unknown marker, and returns the resulting `INSTALL.md` as a
generated output. The same in-memory updated content must feed the existing
generated `docs/content/docs/install.mdx`; do not reread stale `INSTALL.md`. In
normal mode the generator writes both outputs; in `--check` mode drift in the
matrix or any detailed fact block fails. Do not hand-maintain the same fields
in two places. Extend generator tests to prove:

- registry order controls the matrix and picker order;
- a test named `publishes exactly the seven registry clients` compares every
  generated guide/picker projection with the exact ordered ID array;
- changing one alias condition or install source updates both its detailed fact
  block and matrix projection; stale hand-written facts cannot make check mode
  pass;
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
`docs/src/lib/agents.ts`, the marked install matrix, or the seven detailed fact
blocks, and the generated public projection contains no verification command
or private release evidence.

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
rtk bun test scripts/generate-docs.test.ts -t "publishes exactly the seven registry clients"
rtk mise run docs:build
```

→ the named test compares the ordered guide/component projection against the
exact array `['claude','codex','opencode','grok','kimi','antigravity','amp']`,
rejects a missing or extra ID, and the static docs build exits 0. Do not use an
alternation search: it can pass when only one client exists.

### Step 6: Make release drift fail closed

Extend validation so a release cannot ship when:

- registry snapshot/observation evidence is absent or internally inconsistent
  (`observed` without a version, `unavailable` with one, mismatched dates, or
  an unavailable client with a non-`unverified` route);
- a supported client is missing from generated docs/picker;
- a route status is unknown;
- a route marked behaviorally `verified` lacks a plan-004 evidence ID and safe
  local verification command;
- `docs/src/lib/agents.ts` introduces a hard-coded eighth ID not in registry.

Separately prove this routing work changes no shared skill body; that is a
scope check, not a new global product-name blacklist. Require
`rtk git diff --quiet <literal-execution-base-SHA> -- 'skills/*/SKILL.md'` at verification
and keep Plan 002's scoped source-neutrality regression green. Existing
unrelated client artifact names or setup commands require their own observed
red bar; do not exempt them silently or expand this plan to repair them.

Do not make proprietary live-client runs part of PR CI. Static validation is
deterministic; live discovery is recorded/re-run during release preparation.

**Verify**: add negative unit fixtures for every rule and run
the following before the final commit:

```sh
rtk bun test scripts/validate-skills.test.ts
rtk bun test scripts/plan-source-neutrality.test.ts
rtk proxy git diff --quiet <literal-execution-base-SHA> -- 'skills/*/SKILL.md'
```

→ tests pass and the diff-scope command exits 0, proving this routing work did
not alter shared skill bodies.

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
rtk bun -e 'const allowed=new Set(["INSTALL.md","advisor-plans/README.md","clients.json","docs/AGENTS.md","docs/content/docs/delivery/index.mdx","docs/content/docs/delivery/meta.json","docs/content/docs/delivery/model-routing.mdx","docs/content/docs/install.mdx","docs/src/components/client-routing-matrix.tsx","docs/src/generated/clients.ts","docs/src/lib/agents.ts","scripts/generate-docs.test.ts","scripts/generate-docs.ts","scripts/validate-skills.test.ts","scripts/validate-skills.ts","scripts/verify-clients.test.ts","scripts/verify-clients.ts"]); const p=Bun.spawnSync({cmd:["git","diff","--name-only",process.argv[1]],stdout:"pipe"}); if(p.exitCode!==0) process.exit(p.exitCode); const changed=new TextDecoder().decode(p.stdout).trim().split("\n").filter(Boolean); const extra=changed.filter((x)=>!allowed.has(x)); if(extra.length){console.error(extra.join("\n"));process.exit(1)}' <literal-execution-base-SHA>
```

→ every command exits 0. Replace both execution-base placeholders with the
same literal 40-character SHA captured before Step 1; never use mutable
`HEAD`. The last command prints nothing and proves every changed path is in the
exact scope allowlist.

## Test plan

- Registry parser tests: valid seven-client fixture; duplicate/missing client;
  missing role; every unknown enum/union discriminator; malformed invocation
  template; empty required array; absent/mismatched snapshot or observation;
  nullable-version/status contradictions; unsafe/mismatched structured
  verification tuple; `verified` without plan-004 evidence.
- Client-verifier tests: exact argv allowlist; direct spawn; timeout/output
  bounds; missing executable; sanitized version/name projections; no raw
  stdout/stderr/path/config/credential leakage; shell, mutation, and
  interactive rejection.
- Generator tests: one source controls picker order, labels, invocation form,
  and install matrix.
- Existing `Invoke` tests continue proving canonical `tailrocks-*` names.
- Docs build proves the generated public TypeScript projection and route-table
  component compile in the Fumadocs/TanStack pipeline without bundling local
  verification commands.
- Manual release evidence uses only the sanitized verifier for every client;
  unavailable clients get null version plus `unverified` routes, never a stale
  carried-forward version or silent green.

## Done criteria

- [ ] `clients.json` is the single checked source for all seven client IDs,
      labels, install sources/manifests/targets, invocation forms/conditions,
      compatibility fields, dated route mappings, and verification evidence;
      only procedural install/update prose remains hand-written.
- [ ] Docs picker, compatibility matrix, and seven detailed client-fact blocks
      derive from the registry.
- [ ] All seven clients have a same-host or artifact-handoff selector; any
      unavailable client's routes are explicitly `unverified`.
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
