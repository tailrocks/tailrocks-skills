# Plan 002: Prove Codex native `/goal` can obey an external acceptance decision

> **Executor instructions**: This is a feasibility gate, not production runtime.
> Capture evidence; do not make unsupported behavior look supported. Run every
> check and stop on any failed required capability.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- scripts/provider-conformance* research/native-goal-control/ docs/`
> Empty output is expected. Plan 001 touches disjoint paths and may land before,
> after, or in parallel; its changes are not drift for this plan.

## Status

- **Priority**: P1
- **Effort**: M (the live matrix is ~15 interactive TTY scenarios needing a
  human operator mid-run; S was mis-sized)
- **Risk**: HIGH
- **Depends on**: none — run this plan first; it is the existential feasibility
  gate and shares no artifacts with plan 001
- **Category**: direction, tests
- **Planned at**: commit `b629fb9`, 2026-08-10

## Why this matters

The unattended product depends on native `/goal` attempting to stop, a trusted
hook blocking that stop with an exact continuation, and a later PASS allowing
stop. The first draft delayed this proof until its sixth large plan. This plan
tests the load-bearing boundary first against a real installed Codex version.
Failure blocks the TIER 2 (unattended, hook-enforced) runtime plans and forces
an explicit operator decision on whether a TIER 0/1 kernel remains worth
building; it is never permission to add a standalone supervisor or pretend
transcript evaluation is proof.

## Current state

- Local discovery on 2026-08-10: `codex-cli 0.147.0`; `codex features list`
  reports `goals stable true` and `hooks stable true`.
- Official [Codex `/goal` documentation](https://learn.chatgpt.com/use-cases/follow-goals)
  says the goal persists but Codex stops when confident.
- Official [Codex hook documentation](https://learn.chatgpt.com/docs/hooks)
  says a Stop hook may block and provide a continuation prompt.
- No repository script currently proves goal identity, Stop event ordering,
  repeated blocking, PASS release, resume, config drift, sibling-hook precedence,
  or the actual provider sandbox/tool capability set.
- Hook sources may come from user, project, or plugins. Hashing only a Tailrocks
  hook does not prove the effective set.

Required observations for one pinned Codex installation:

```text
start goal -> nominal completion -> Stop event -> controller says CONTINUE
-> same goal continues -> second Stop -> controller says PASS -> goal stops
-> resume retains external attempt budget and rechecks effective hooks
```

## Preconditions

Run:

```sh
rtk codex --version
rtk codex features list
rtk bun test scripts/
```

Expected: a concrete Codex version; both `goals` and `hooks` are stable/enabled;
the currently checked-in script tests pass (whatever plan 001's state is). If
authentication or an interactive TTY is unavailable, mark this plan `BLOCKED`,
not DONE.

Before building any harness code, run a thirty-minute manual spike: hand-write a
throwaway Stop hook that always returns CONTINUE with a fixed prompt, start a
native `/goal` in a scratch repository, and watch one stop attempt. If the hook
is never consulted or the continuation is ignored, record that observation and
skip straight to Step 5's decision write-up — do not build the evidence harness
around a capability that a manual session already refutes.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Discover | `codex --version && codex features list` | version plus enabled goals/hooks |
| Harness tests | `bun test scripts/provider-conformance.test.ts` | exit 0 |
| Prepare | `bun scripts/provider-conformance.ts prepare --provider codex --case stop-contract --root /tmp/tailrocks-codex-goal-smoke` | prints exact TTY instructions and evidence path |
| Validate | `bun scripts/provider-conformance.ts validate --provider codex --case stop-contract --root /tmp/tailrocks-codex-goal-smoke` | exit 0 and all required capabilities true |
| Repository | `bun run scripts/validate-skills.ts && git diff --check` | both exit 0 |

## Scope

**In scope**:

- `scripts/provider-conformance.ts` (new)
- `scripts/provider-conformance.test.ts` (new)
- `scripts/fixtures/provider-conformance/**` (new)
- `research/native-goal-control/README.md` (new)
- `research/native-goal-control/sources.md` (new)
- `research/native-goal-control/evidence/codex-<version>.json` (new, sanitized)

**Out of scope**:

- Production Rust controller, schemas, plugin manifests, or release versions.
- Provider-neutral abstractions before Codex behavior is observed.
- Grok or Claude qualification.
- Capturing tokens, credentials, full user config, unrelated transcript text, or
  absolute home-directory paths.
- Replacing native `/goal` with `codex exec`, `/loop`, or a custom loop.

## Git workflow

- Branch: `test/codex-goal-feasibility`
- Commit only sanitized harness/evidence with subject
  `test(goal): prove Codex stop-hook control` using `git commit -s` and the Codex
  co-author trailer.
- Do not push or open a PR without operator instruction.

## Steps

### Step 1: Build a safe evidence harness

Create `scripts/provider-conformance.ts` with `prepare`, `record`, and `validate`
subcommands. `prepare` creates an explicit temporary Git repository, isolated
project configuration, a mock checkpoint state file, and a test Stop hook. The
hook appends sanitized JSONL events and returns CONTINUE until the state file is
set to PASS. It must never read or copy user credentials/config into evidence.

The fixture task is deterministic: create `proof.txt` containing a known token,
then announce completion. The hook continuation asks for a second deterministic
marker before PASS is enabled. The harness records CLI version, feature list,
goal/session identifier if exposed, event sequence, hook source digests,
checkpoint decisions, and sanitized terminal timestamps.

`validate` rejects missing/duplicate/out-of-order Stop events, unrecognized
fields, absolute home paths, environment values, and any evidence schema not
explicitly versioned. Sanitization is capture-side allowlisting — only
enumerated schema fields are ever written at the source — not scrub-side
detection; do not claim "contains no credentials" beyond what the allowlist
structurally guarantees.

**Verify**: `bun test scripts/provider-conformance.test.ts` → exit 0; golden,
missing-stop, reordered-event, secret-redaction, and malformed-hook cases pass.

### Step 2: Prove CONTINUE then PASS in native `/goal`

Run the Prepare command. Follow its printed TTY instructions exactly, launching
interactive `codex -C /tmp/tailrocks-codex-goal-smoke/repo --strict-config`
with only the generated project hook in the temporary profile. Start native
`/goal`; do not substitute a normal prompt or `codex exec`.

Observe and record:

1. the model attempts nominal completion after the first marker;
2. the Stop hook receives the attempt and returns CONTINUE plus the exact next
   prompt;
3. the same native goal remains active and creates the second marker;
4. after the operator changes only mock state to PASS, the next Stop is allowed;
5. the native goal terminates successfully.

**Verify**: run the Validate command → exit 0 and JSON reports
`native_goal=true`, `continue_same_goal=true`, `pass_allows_stop=true`, and at
least two ordered Stop events.

### Step 3: Prove resume and durable external budgets

Repeat with the harness case `resume-contract`. Block once, exit the client,
resume the same goal through the native resume command, and complete. The mock
controller attempt count lives outside the repo and must continue monotonically;
native session counters are evidence only, never authority.

**Verify**:

```sh
bun scripts/provider-conformance.ts validate --provider codex --case resume-contract --root /tmp/tailrocks-codex-goal-smoke
```

Expected: exit 0; one goal/session continuity record, at least one pre-resume and
one post-resume Stop event, and controller attempt count not reset.

### Step 4: Discover effective hooks and execution capabilities

Add controlled cases for a sibling Stop hook that blocks, allows, times out,
returns malformed output, and changes after resume. Record precedence and
whether Codex exposes enough configuration provenance to enumerate/digest every
effective hook. Strong mode requires fail-closed rejection of conflicts or
unverifiable effective configuration.

Measure two additional load-bearing facts:

1. **Hook time budget.** The maximum wall time Codex tolerates for the
   Tailrocks Stop hook itself, and the exact terminal behavior when it is
   exceeded (hook killed and stop proceeds? stop blocked? call retried?). Real
   checkpoints run clean-clone gates for minutes; if a slow hook becomes an
   uncontrolled stop, the synchronous-checkpoint design is infeasible and the
   plan 003 hook must instead return fast (enqueue verification, reply CONTINUE
   with a "verification pending — run `tailrocks goal status --wait`, then stop
   again" prompt, and release PASS only at a later Stop with a completed current
   verification). Record which of the two designs the measured budget supports.
2. **Hook placement.** Whether any file influencing the effective hook set can
   live inside the executor-writable repository. The required invariant is that
   every effective hook/config byte resolves outside all executor-writable
   roots; a project-level hook source inside the clone is a preflight rejection.
   Add a case proving an in-repo hook edit either cannot occur or cannot alter
   the effective set mid-session — otherwise the executor can delete its own
   checkpoint and the next Stop simply never runs it.

Also test the dependency-provisioning mode plan 006 will rely on: gates in a
clean clone need cargo/bun dependencies; verify Codex tolerates an execution
profile with general egress disabled while a controller-provisioned read-only
dependency store (warmed from lockfiles outside the session) is present.

Using the pinned CLI's least-privilege launch, also record and test the complete
effective execution profile: sandbox mode, writable roots, environment
inheritance policy, web/search, MCP servers, apps, plugins/skills with tools,
additional directories, approvals, and any agent-usable egress. Required local
mode blocks writes outside the disposable repo and disables general network/
external-effect tools; it exposes no secret values through the shell environment.
Record whether same-user read access outside the repo remains possible and label
that limitation—do not call local mode confidential isolation.

**Verify**:

```sh
bun scripts/provider-conformance.ts validate --provider codex --case hook-set-contract --root /tmp/tailrocks-codex-goal-smoke
```

Expected: exit 0 and a deterministic preflight rule can predict terminal
behavior for every fixture and reject external-write/network-tool capability.
If not, STOP: plan 003 cannot claim controlled local execution on this version.

### Step 5: Publish the capability decision, not prototype code

Write `research/native-goal-control/README.md` with the exact installed version,
origin of each behavior, supported/unsupported matrix, reproducible commands,
redacted evidence digest, and architectural consequence. Put official URLs and
retrieval date in `sources.md`. Check in the sanitized evidence JSON; do not
check in generated temporary repo, hook logs with unrelated content, or secrets.

The decision is `SUPPORTED` only when steps 2–4 all pass. Otherwise document
`UNSUPPORTED`/`INCONCLUSIVE`, mark the advisor row BLOCKED, and stop plans 003+
until the native UX requirement changes or Codex capability changes.

**Verify**:

```sh
bun scripts/provider-conformance.ts validate-research research/native-goal-control
```

Expected: exit 0 only for internally consistent sources, evidence digests, and
capability conclusion. `validate-research` must also compare the recorded
evidence's client version against the live `codex --version` and fail with a
`STALE_EVIDENCE` error on mismatch — consumers (plan 003 preconditions, plan 009
release gates) rely on this check to detect that Codex updated between this
plan's run and theirs; a rerun of the affected cases is then required before the
verdict may be consumed.

## Test plan

- Pure harness tests for event ordering, redaction, digesting, exit states, and
  required capability closure.
- Live TTY cases: CONTINUE→PASS, interrupt/resume, sibling precedence, timeout,
  malformed output, hook mutation/disablement, outside write, environment-secret
  injection, web/search, MCP/app/plugin tool, extra writable root, and egress.
- Negative proof: normal prompt or `codex exec` evidence cannot satisfy
  `native_goal=true`.

## Done criteria

- [ ] Exact Codex version/features and official source retrieval date recorded.
- [ ] Native goal receives at least one enforced CONTINUE and later PASS.
- [ ] Resume preserves controller-owned budget and rechecks effective hooks.
- [ ] Effective hooks and execution capabilities are preflighted fail-closed.
- [ ] Hook time budget and on-timeout terminal behavior are measured; the
  supported checkpoint design (synchronous or enqueue-and-poll) is recorded.
- [ ] Hook placement is proven outside executor-writable roots or the version
  is marked unable to satisfy the placement invariant.
- [ ] Local-mode confidentiality limitations are measured and labeled.
- [ ] Sanitized evidence validates and contains no credentials/home paths.
- [ ] Prototype temporary files are absent from `git status`.
- [ ] Repository validator/tests/diff check pass.

## STOP conditions

Stop if native `/goal` cannot be distinguished from an ordinary session, the
Stop hook cannot force continuation, PASS cannot allow normal stop, resume loses
the controller path, conflicting hooks cannot be detected fail-closed, or proof
would require `--dangerously-bypass-hook-trust`, external writes/network tools
cannot be disabled, or secret-bearing environment values reach executor tools.
Do not design around a failed capability inside this plan.

## Maintenance notes

This is versioned evidence, not timeless truth. Plan 009 turns the harness into
a release conformance gate. Any Codex upgrade or hook/config change invalidates
the recorded capability until rerun.
