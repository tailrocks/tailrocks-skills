# Plan 006: Make native `/goal` the controlled execution surface

> **Executor instructions**: Keep Codex, Grok, and Claude Code native `/goal`
> as the user-facing execution loop. Add the trusted `tailrocks goal` control
> layer and deterministic hooks beneath it; do not replace `/goal` with a
> standalone provider supervisor or new source-mutating skill. Verify every
> client against current official docs, installed help, and a live isolated
> smoke before claiming support.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state and provider fact. If drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — native long-running agent loops, hooks, worktrees, and Git
  authority become one security-sensitive runtime
- **Depends on**: `advisor-plans/005-verifier-owned-state-and-receipts.md`
- **Category**: feature / integration / correctness / security
- **Planned at**: commit `04987c8`, 2026-08-10

## Why this matters

Tailrocks already makes `GOAL.md` the intended handoff, and the user explicitly
wants native `/goal` to remain the executor: Codex first, Grok second, Claude
Code third. The current package lets the same model choose work, edit status,
run its own proof, and persuade the native evaluator that it finished. The
previous advisor draft overcorrected by making a standalone external loop the
primary UX. This plan instead makes native `/goal` the actuator while a
provider-neutral Rust controller owns eligibility, durable budgets, candidate
integrity, clean-room verification, commits, continuation, and terminal state.

## Current state

- `skills/tailrocks-plan/SKILL.md:8-13,122-131` makes generated `GOAL.md` the
  cross-client handoff.
- `skills/tailrocks-plan/references/goal-handoff.md:39-79` currently lets the
  executor choose a Markdown row, edit statuses, self-verify, and commit.
- `skills/tailrocks-plan/references/goal-handoff.md:87-178` uses transcripted
  rows/commands and prompt-local turn estimates as the native goal condition.
- `skills/tailrocks-reconcile/SKILL.md:21-31` correctly says executor claims are
  untrusted, but reconciliation is separately invoked after the loop.
- No trusted hook, runtime state, clean verifier replay, or provider capability
  test exists in this repository.
- No source-mutating `tailrocks-execute` skill exists. Preserve that boundary:
  native `/goal` executes source; Tailrocks skills still own only delivery
  artifacts.

## Research and provider basis

- [Codex `/goal`](https://learn.chatgpt.com/use-cases/follow-goals) is the
  primary path. Official docs describe a durable objective, checkpoints, and a
  confidence-based stop; `/goal` can be enabled through `features.goals`.
- [Codex hooks](https://learn.chatgpt.com/docs/hooks) can continue a Stop event
  with `decision: "block"`, apply feedback to the next turn, and trust
  non-managed hook definitions by exact hash.
- [Claude Code `/goal`](https://code.claude.com/docs/en/goal) is transcript-
  evaluated by a small model; it does not independently read files or run
  commands. Resume restores the condition but resets native turn/time/token
  counters.
- [Claude hooks](https://code.claude.com/docs/en/hooks-guide) provide command
  Stop hooks, but the default consecutive block cap is eight unless explicitly
  raised.
- [Grok Build commands](https://docs.x.ai/build/modes-and-commands) currently
  document `/plan`, `/loop`, sessions, and user-invocable skills as slash
  commands, but do not list a built-in `/goal`. The operator reports a strong
  working Grok `/goal`; capability detection must record whether that command
  is native, plugin-provided, or skill-provided and test its real lifecycle.
- [Plan-compliance research](https://arxiv.org/html/2604.12147v1) found that a
  concise plan reminder every five trajectory steps improved the studied
  agents. Use that cadence as an evaluated default where hooks expose tool
  events, not as an untested universal law.

Provider facts are volatile. Re-read official docs and installed CLI help at
execution time. Current audit snapshot: Claude Code `2.1.226`, Codex CLI
`0.147.0` with stable goals/hooks, Grok Build `1.0.0`.

## Required architecture

```text
operator -> tailrocks goal prepare <slug> --provider codex
         -> isolated executor worktree + trusted run state
         -> native Codex/Grok/Claude /goal with generated GOAL.md
         -> one controller-selected slice per goal turn
         -> Stop/PostTool hooks call tailrocks goal checkpoint
         -> scope/integrity scan -> second clean verifier worktree
         -> PASS slice receipt + controller commit -> CONTINUE(next slice)
         -> automatic final reconcile (plan 007) -> PASS or exact failure
```

`tailrocks goal` is a subcommand family of the one `tailrocks` binary from plan
002. Do not add a second provider loop or a second executable named
`tailrocks-goal`; “Tailrocks Goal” names the subsystem only.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all gates pass |
| Runtime handshake | `tailrocks version --json` | exact build/digest plus compatible control/schema range |
| Capabilities | `tailrocks goal capabilities --provider codex --json` | live-verified native goal, hook, resume, event, permission, and version facts |
| Prepare | `tailrocks goal prepare goal-live-status --provider codex --json` | isolated run/worktree plus exact native `/goal` input; no provider launched |
| Render | `tailrocks goal render goal-live-status --provider codex` | thin provider-correct `/goal` condition and kickoff under client limits |
| Next slice | `tailrocks goal next goal-live-status --json` | one eligible plan or exact terminal state |
| Checkpoint | `tailrocks goal checkpoint goal-live-status --json` | `CONTINUE`, exact failure state, or current `PASS` only |
| Hook smoke | `tailrocks goal hook codex stop --fixture tests/fixtures/stop.json` | schema-valid provider response matching controller state |

## Scope

**In scope**:

- `crates/tailrocks-core/**`, `crates/tailrocks-cli/**` goal runtime, worktree,
  candidate, verifier, Git, and adapter APIs
- `schemas/v1/**` provider-capability, run, checkpoint, claim, hook, and
  integration schemas
- `hooks/**` packaged trusted hook definitions/wrappers proven compatible by
  provider tests
- `adapters/codex/**`, `adapters/grok/**`, `adapters/claude/**` (create) for
  provider-specific generated templates, schemas, and evidence fixtures
- `skills/tailrocks-plan/SKILL.md`, `references/goal-handoff.md`, and evals
- `skills/tailrocks-reconcile/SKILL.md` only to point recovery at controller
  state; plan 007 owns convergence behavior
- `examples/plan-package/**` generated goal contract, GOAL, and mock run
- `docs/pipeline-walkthrough.md` native execution section
- `README.md`, `AGENTS.md`, `CLAUDE.md`, `INSTALL.md`
- `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
  `.kimi-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and
  `plugin.json` as required to package hooks/assets and bump versions in lockstep

**Out of scope**:

- A `tailrocks execute` provider loop, direct model SDK, or source-mutating
  `tailrocks-execute` skill.
- Treating native goal/model confidence as proof.
- Automatically writing personal/managed provider configuration or trusting a
  worktree-supplied binary/hook.
- Semantic convergence axes; plan 007.
- Package retirement; plan 009.
- Push, PR, deploy, issue creation, release, or any undeclared remote effect.

## Git workflow

- Branch: `advisor/006-native-goal-runtime`
- The implementation agent must not commit candidate source. The trusted
  controller creates verified commits using the target repository's declared
  commit policy. Repository-development commits remain Conventional Commits,
  use `git commit -s`, and include
  `Co-authored-by: Codex <codex@openai.com>`.
- Bump every versioned plugin manifest in lockstep when packaged hooks/assets
  change. Do not tag, push, publish, or open a PR without operator instruction.

## Steps

### Step 1: Bootstrap one trusted CLI and hook root

Resolve operator-configured `TAILROCKS_CLI`, then an installed `tailrocks` on
PATH, then the exact locked `cargo run` development command. Run `tailrocks
version --json`; require compatible control/schema ranges and configured binary
digest/provenance. Reject repository shadowing, missing/incompatible binaries,
and silent download/update.

Provider hooks must execute an installed, reviewed adapter/hook definition
outside the executor worktree. Record its digest and source. Codex's exact-hash
trust is useful evidence but not portable proof; Claude/Grok trust behavior gets
its own capability result. Generated installation commands print changes for
operator review and have an uninstall path; they do not mutate user or managed
configuration automatically.

**Verify**: tests cover configured/PATH/development resolution, repo shadowing,
digest/protocol mismatch, modified hook definition, missing trust, supported
installation, no silent update, and portable remediation.

### Step 2: Prepare an isolated native-goal run

`tailrocks goal prepare` validates `goal.contract.json`, current environment,
protected anchors, clean base, and provider capability. It creates:

- one disposable executor worktree/branch from the frozen verified base;
- external run state, logs, budget counters, and receipt directory;
- a non-authoritative run pointer/environment for hooks;
- exact commands to open the chosen native client in that worktree and paste
  the rendered `/goal` input.

Do not launch a provider unless the operator separately passes an explicit
`--launch` convenience flag. Even then the launched program is the native
Codex/Grok/Claude client and native `/goal`, not a Tailrocks conversation loop.
No parallel writer targets the same run by default. The operator worktree and
branch remain untouched until a separate final compare-and-swap integration.

Allow a clearly labeled `local_non_adversarial` mode for an already-open native
session only when the operator accepts that isolation is weaker. It cannot
produce a stronger trust label than its containment proves.

**Verify**: tests cover dirty base, stale contract, unsupported provider,
duplicate writer, worktree/branch isolation, absolute-path safety, cleanup,
explicit launch, and unchanged operator worktree.

### Step 3: Select and expose exactly one slice

`tailrocks goal next` selects programmatically:

1. every dependency has a current VERIFIED receipt;
2. topological order;
3. numeric plan ID as deterministic tie-breaker;
4. no active conflicting lease/effect;
5. all package/provider/environment/budget preconditions still hold.

The native model never chooses from a Markdown table. The returned active-slice
payload contains the immutable plan digest/text pointer, allowed writes/effects,
protected paths, exact stopping rule, and one instruction: implement this slice,
emit a claim, then end the turn; do not start a later slice. GOAL and every new
native turn require `tailrocks goal next` before mutation.

**Verify**: property tests cover DAG order, numeric tie-break, stale dependency,
parallel-safe eligibility, conflict, resume, no work, and byte-identical output
for identical state.

### Step 4: Keep the native goal focused without bloating it

Generate a thin goal condition:

```text
Complete only when `tailrocks goal checkpoint <slug> --json` has run after the
latest repository change and returns a current PASS whose contract and subject
digests match. Assistant claims, Markdown statuses, transcripted tests, or old
receipts are not proof. Continue exactly as instructed on CONTINUE. Stop and
report BLOCKED, STALE, BUDGET_EXHAUSTED, ENVIRONMENT_DRIFT, VERIFIER_ERROR, or
TAMPERED. Never modify protected contracts, oracles, hooks, state, or receipts.
```

At each goal turn inject only the active slice, not the entire lifecycle prose.
Where documented hooks expose complete tool events, count them in durable state
and add an active-slice reminder every five events as an initial tested cadence.
Where event coverage is incomplete, record that limitation and rely on each-turn
reinjection plus the final whole-tree scan. PostTool/PreTool hooks are guardrails,
not the trust boundary.

**Verify**: golden prompts stay within client limits; no plan duplication;
reminder cadence/resume counters are durable; missing event coverage is labeled;
and prompt/model output cannot alter the active slice.

### Step 5: Collect a candidate claim and scan the whole workspace

The agent may locally test and then emit `CLAIMED_DONE`, `CLAIMED_BLOCKED`, or
`CLAIMED_STALE`; it cannot edit control state or commit. On checkpoint, capture
the complete candidate:

- tracked diff and staged/index state;
- every untracked and ignored file plus whether it can influence build/tests;
- Git mode, case/path collisions, symlinks, submodules, and nested repositories;
- contract/oracle/gate/hook/controller/protected-path integrity;
- declared filesystem and non-file effects;
- base/current branch/ref and unexpected agent-created commits.

Reject out-of-scope or protected changes before tests. Undeclared ignored files
never enter proof; influential ones produce `TAMPERED` or a contract-required
clean regeneration. A hook that appeared to block an edit does not waive this
scan.

**Verify**: fixtures cover forged DONE/PASS, weakened test, changed gate wrapper,
protected hook/contract, out-of-scope tracked file, influential untracked or
ignored file, symlink escape, submodule/ref change, unauthorized commit, and
valid implementation-only diff.

### Step 6: Verify in a second clean worktree and let only the controller commit

Export a binary-safe candidate patch plus explicit allowed untracked files.
Create a second clean verifier worktree from the latest verified commit, apply
only that candidate, and run preconditions plus frozen plan/package gates in a
fresh process or pinned container. Do not inherit executor environment changes,
background processes, temporary databases, ignored config, warm mutable caches,
or undeclared generated files. Normalize only fields the contract explicitly
declares non-semantic.

On failure, preserve the executor worktree for repair and return the smallest
structured `CONTINUE` payload: gate/requirement ID, observation, authorized
paths, and protected-oracle reminder. Repeating the same failure consumes the
durable attempt budget; exhaustion terminates exactly.

On pass, the controller creates the commit from the verified clean tree using a
deterministic message template and the target repository's required trailers,
writes the receipt, then synchronizes/recreates the disposable executor
worktree at that verified commit. Any destructive synchronization is permitted
only inside the proven disposable worktree after the candidate is durably
committed and receipted. Integration into the operator branch remains a
separate compare-and-swap command and never pushes.

**Verify**: tests prove dirty-environment-only success fails, clean replay pass,
timeout, background/cache/env/ignored-file isolation, controller-only commit,
required trailers, receipt-before-reset ordering, failed integration CAS, and
no operator/remote mutation.

### Step 7: Implement Codex-first, Grok, and Claude native adapters

All adapters translate one product-neutral checkpoint result:

| Controller state | Native Stop adapter |
|---|---|
| `CONTINUE` | continue native `/goal` with the exact next/repair payload |
| `PASS` | allow native `/goal` to stop |
| named terminal failure | allow stop and surface the exact state |
| `TAMPERED` | stop; never ask the model to repair verifier/control files |

Implement and validate in this order:

1. **Codex** — required primary adapter. Enable/detect `features.goals`; use
   native `/goal`; package a deterministic Stop hook calling checkpoint; verify
   hook trust hash, event ordering, premature model-confidence stop, pause/
   resume, compaction, and terminal behavior. `codex exec` with explicit model,
   sandbox, `--ignore-user-config`, JSON events, and output schema is allowed
   only for automated conformance tests, not presented as the primary workflow.
2. **Grok** — required second adapter when its live `/goal` capability passes.
   Record command origin and version, hook/event coverage, session resume,
   worktree/permission behavior, structured output, and premature-stop handling.
   Do not silently substitute `/loop`, `/plan`, or a Tailrocks external loop. If
   the operator's `/goal` is unavailable on a machine, mark that installation
   unsupported and point to Codex or the exact missing Grok plugin/skill.
3. **Claude Code** — native `/goal` plus command Stop hook. Persist budgets
   outside native counters; configure/test a block cap at least as large as the
   contract's maximum checkpoint count; pin the main and small evaluator model
   IDs where the provider permits; verify resume reset, transcript-only false
   completion, hook cap, and terminal states.

Provider-specific output shapes stay in adapters. Canonical state/receipts and
GOAL semantics remain provider-neutral.

**Verify**: mock contract tests plus one live isolated smoke per supported
provider prove native `/goal` cannot stop before controller PASS. Unsupported or
drifted capability fails before source mutation.

### Step 8: Rewrite GOAL handoff, package adapters, and document recovery

Replace Markdown-row selection/status updates with controller commands. GOAL.md
contains provider-specific paste blocks generated from one goal contract, with
Codex first. Kickoff says:

```text
Run `tailrocks goal next <slug> --json`. Execute exactly its returned plan and
no later plan. Do not mark DONE/VERIFIED/REJECTED/PASS, edit generated status,
or commit. End the turn after your candidate claim so the trusted hook can scan
and clean-room verify it.
```

Resume first calls `tailrocks goal checkpoint`; it never trusts native counters
or a previous transcript. Document installation/trust/uninstall, prepared
worktree launch, local weaker mode, terminal failure recovery, final branch
integration, and exact compatibility evidence in `INSTALL.md`. Package hooks
only after each plugin/client loader is proven; keep SKILL bodies
source-neutral.

Plan 007's automatic final reconcile is a required pending state. Until it
lands, all implementation slices may become VERIFIED but package PASS remains
unreachable.

**Verify**: generated outputs are deterministic and client-bounded; plugin
manifests/versions validate; `mise run verify` passes; walkthrough mock run
reaches `FINAL_RECONCILE_PENDING`, never premature PASS.

## Test plan

- Trust bootstrap: CLI/hook path, digest, protocol, trust, no auto-install.
- Preparation: isolated worktree/branch/state, dirty/stale/unsupported refusal.
- Scheduler: deterministic one-slice selection, leases, resume, budgets.
- Prompt/hooks: Codex/Grok/Claude output shapes, reminder cadence, compaction,
  pause/resume, premature native completion, exact terminal states.
- Candidate integrity: all tracked/untracked/ignored/Git/protected/effect cases.
- Clean replay: environment/process/cache/database/generated-file independence.
- Git: agent commit refusal, controller verified commit, deterministic message,
  receipt ordering, operator-branch CAS, no remote mutation.
- Live compatibility: one isolated native `/goal` smoke per claimed provider;
  capability drift fails closed.

## Done criteria

- [ ] `mise run verify` exits 0 and includes goal runtime/hook/schema fixtures.
- [ ] Native `/goal` is the documented and tested primary execution UX: Codex
      first, Grok second, Claude Code third.
- [ ] No `tailrocks execute` provider loop or source-mutating execute skill was
      added.
- [ ] Controller alone selects slices, persists budgets, verifies, commits, and
      classifies terminal state; the model emits claims only.
- [ ] Every candidate is scanned completely and replayed in a second clean
      verifier worktree before a receipt/commit.
- [ ] A current controller PASS is the only condition that permits native
      `/goal` to stop successfully.
- [ ] Claude resume/cap behavior and Codex hook trust are tested; Grok support
      records the actual working `/goal` origin instead of assuming parity.
- [ ] Unsupported/drifted provider capability fails before source mutation and
      never falls back silently to a different workflow.
- [ ] Hooks/controller/state/oracles/receipts remain outside executor authority
      at the declared trust level.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Codex native `/goal` plus the deterministic hook cannot prevent premature
  successful stop in a live isolated smoke: stop; do not ship a confidence-only
  adapter.
- The operator's Grok `/goal` cannot be identified or reproduced: record the
  exact missing capability and mark Grok unsupported on that installation; do
  not substitute `/loop` or invent syntax.
- A provider hook cannot call the trusted checkpoint or expose enough lifecycle
  state to uphold a required bound: reject that provider/package combination.
- Candidate verification would occur only in the dirty executor environment:
  stop until second-worktree replay works.
- Adapter setup requires silently writing user/managed configuration or trusting
  worktree code: require explicit operator installation/trust instead.
- A declared external effect cannot be prevented, observed, or operator-gated:
  disable autonomous execution for that package.

## Maintenance notes

Native client behavior is versioned evidence. Re-run compatibility and
premature-stop smokes on version drift. Keep GOAL short, active-slice reminders
measured, and provider syntax out of canonical artifacts. The controller is not
another agent framework: it is the authority beneath the user's native `/goal`.
