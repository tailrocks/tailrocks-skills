# Plan 007: Fix the six confirmed stack-skill defects

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-rust-project-setup skills/tailrocks-tanstack-project-setup skills/tailrocks-rust-best-practices/references/errors-testing-docs.md skills/tailrocks-code-health`
> On any change, compare "Current state" excerpts before editing;
> mismatch = STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (guidance/template changes ripple into scaffolded repos;
  each step keeps behavior identical except the named fix)
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

Six defects confirmed in the engineering skills: both version-resolver
scripts lose the whole batch on one bad package; the Rust setup skill
contradicts itself on MSRV; a mise task invokes a nightly toolchain
nothing installs; rust-best-practices blesses code the house lint
baseline hard-denies; three code-health templates are invisible to any
agent; and the TanStack template pins router-devtools three minors behind
the router it instruments.

## Current state

All excerpts verified at `f2c4be5`.

1. **Resolvers** — `skills/tailrocks-rust-project-setup/scripts/resolve-crate-versions.ts:16-35`
   and `skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts:13-30`:
   both do `await Promise.all(names.map(async (name) => { const response =
   await fetch(...); if (!response.ok) throw new Error(...); ... }))` —
   one 404/rate-limit rejects the batch; results for valid packages are
   discarded; process dies with a stack trace. npm variant also computes
   `selected_channel` from `latest` such that a missing `dist-tags.latest`
   yields `latest: null` with channel `"stable"`.
2. **MSRV** — `skills/tailrocks-rust-project-setup/references/workspace-and-layout.md:12-16`:
   "`rust-version` … is the **MSRV floor** — the oldest toolchain you
   promise to build on. Keep it honest with a CI job that builds on
   exactly that version. It is independent of, and usually older than,
   the pinned build channel" and line 66 example `rust-version = "1.90"`.
   Contradicts `references/toolchain-and-mise.md:4-5` ("current stable
   Rust 1.97.0 … Keep `workspace.package.rust-version` equal when only
   latest stable is supported"), `templates/Cargo.toml:10`
   (`rust-version = "1.97.0"`), `templates/rust-toolchain.toml:2`
   (`channel = "1.97.0"`).
3. **careful task** — `skills/tailrocks-rust-project-setup/templates/mise.toml:58-59`:
   `[tasks.careful] run = "cargo +nightly-2026-07-10 careful test
   --workspace --all-features --locked"`. `[tools]` installs
   `"cargo:cargo-careful" = "0.4.10"` but no nightly toolchain;
   `rust-toolchain.toml` pins stable 1.97.0. Task absent from the gate
   table in `references/toolchain-and-mise.md`.
4. **Panic policy** — `skills/tailrocks-rust-best-practices/references/errors-testing-docs.md:44-45`
   ("Internal invariants indicating a programming bug, with a precise
   `expect` message.") and :53-54 ("Use `todo!`, `unimplemented!`, and
   `unreachable!` when they communicate intent…"). House baseline
   `skills/tailrocks-rust-project-setup/templates/Cargo.toml` denies:
   `expect_used` (:80), `panic` (:87), `panic_in_result_fn` (:88), `todo`
   (:90), `unimplemented` (:91); `templates/clippy.toml` grants test-only
   carve-outs (`allow-expect-in-tests` etc.), none for todo/unimplemented.
5. **Orphaned templates** — `skills/tailrocks-code-health/templates/{ratchet.toml,flaky-tests.toml,DEFECT_LEDGER.md}`
   referenced by zero files; only `renovate.json` is linked
   (`references/versions-and-dependencies.md:8`). `SKILL.md` steps 4–5
   describe baselines/ledger/quarantine with no template pointer; the two
   setup skills model the fix (a "Copy-ready baseline" table).
6. **Devtools pin** — `skills/tailrocks-tanstack-project-setup/templates/package.json`:
   `"@tanstack/react-router": "1.170.17"` but
   `"@tanstack/react-router-devtools": "1.167.0"` (query + its devtools
   both `5.101.2`). `references/version-policy.md` tracks router but not
   router-devtools.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |
| Resolver smoke | `bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts react no-such-pkg-zzz` | exit 0, JSON with one ok + one error entry (after step 1) |
| Registry check | `bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts @tanstack/react-router-devtools` | current version JSON |

Network required for resolver checks (crates.io / registry.npmjs.org).

## Scope

**In scope**:
- `skills/tailrocks-rust-project-setup/scripts/resolve-crate-versions.ts`
- `skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts`
- `skills/tailrocks-rust-project-setup/references/workspace-and-layout.md`
- `skills/tailrocks-rust-project-setup/references/toolchain-and-mise.md`
  (gate-table row for `careful` only)
- `skills/tailrocks-rust-project-setup/templates/mise.toml` (careful task)
- `skills/tailrocks-rust-best-practices/references/errors-testing-docs.md`
- `skills/tailrocks-code-health/SKILL.md` (copy-ready table)
- `skills/tailrocks-tanstack-project-setup/templates/package.json`
  (one version string)
- `skills/tailrocks-tanstack-project-setup/references/version-policy.md`
  (add devtools row)

**Out of scope**:
- `vite.config.ts`, `components.json`, `renovate.json`, `bun ci` wording —
  plan 008 verifies those claims first; do not "fix" them on suspicion.
- Template lint tables themselves (the policy is correct; the prose
  adapts to it).

## Git workflow

- Branch: `advisor/007-stack-skill-corrections`.
- Conventional Commits, DCO; one commit per step is fine
  (`git commit -s`). Main is PR-only; do NOT push/PR unless instructed.

## Steps

### Step 1: Per-item failure handling in both resolvers

Switch both scripts from `Promise.all` + throw to per-item settlement:
inside the map callback, wrap fetch/parse in try/catch and return either
the current success shape or `{ ecosystem, name, error: <message> }`.
Keep output envelope unchanged otherwise. Exit code: 0 when the envelope
is emitted; add a trailing `errors: <count>` field. In the npm variant,
when `dist-tags.latest` is absent set `selected_channel:
"prerelease-or-unknown"` (mirroring the crates variant's wording), not
`"stable"`.

**Verify**:
`bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts react no-such-pkg-zzz`
→ exit 0; JSON has a react entry with a version and a no-such-pkg-zzz
entry with an `error` field. Same pattern for
`resolve-crate-versions.ts serde no-such-crate-zzz`.

### Step 2: Align the MSRV prose

Rewrite `workspace-and-layout.md:12-16` to the house default: rust-version
equals the pinned channel; a separate, older MSRV floor plus its CI lane
is a documented opt-in for published libraries only ("If you publish
crates that promise an older MSRV, set it explicitly and add a CI job on
exactly that version — otherwise keep it equal to the pinned channel").
Change the line-66 example to `rust-version = "1.97.0"`.

**Verify**: `grep -n "1.90" skills/tailrocks-rust-project-setup/references/workspace-and-layout.md`
→ no hits; `grep -n "equal" skills/tailrocks-rust-project-setup/references/workspace-and-layout.md`
→ ≥ 1 hit in the MSRV paragraph.

### Step 3: Make the careful task honest

In `templates/mise.toml`, replace the hardcoded date with an explicit
provisioning note and keep the task runnable: add
`"rust" = { version = "nightly-2026-07-10", ... }`? — NO: mise's rust
tool config and rustup channels interact in ways this plan must not
guess. Instead: keep the pinned date but gate the task —

```toml
[tasks.careful]
run = [
    "rustup toolchain install nightly-2026-07-10 --profile minimal",
    "cargo +nightly-2026-07-10 careful test --workspace --all-features --locked",
]
```

— and add a `careful` row to the gate table in
`references/toolchain-and-mise.md` (advisory lane, needs rustup, pinned
nightly refreshed by the freshness gate alongside other pins).

**Verify**: `grep -n "rustup toolchain install" skills/tailrocks-rust-project-setup/templates/mise.toml`
→ 1 hit; `grep -n "careful" skills/tailrocks-rust-project-setup/references/toolchain-and-mise.md`
→ ≥ 1 hit.

### Step 4: Reconcile the panic policy with the lint baseline

In `errors-testing-docs.md` Panic Policy, add after the acceptable-panics
list: "Under the house lint baseline (`workspace.lints` denies
`expect_used`, `panic`, `todo`, `unimplemented`), each such use requires
a narrow `#[expect(clippy::…, reason = \"…\")]` at the site; `todo!` and
`unimplemented!` are denied outright outside tests — leave them only in
code that is not yet wired into the workspace gates." Adjust the
`todo!`/`unimplemented!` sentence (:53-54) to point at that constraint.

**Verify**: `grep -n "house lint baseline" skills/tailrocks-rust-best-practices/references/errors-testing-docs.md`
→ 1 hit.

### Step 5: Surface the code-health templates

Add a copy-ready table to `skills/tailrocks-code-health/SKILL.md`
(modeled on `tailrocks-rust-project-setup/SKILL.md`'s "## Copy-ready
baseline"): `templates/ratchet.toml`, `templates/flaky-tests.toml`,
`templates/DEFECT_LEDGER.md`, `templates/renovate.json`, each with its
destination and the step that consumes it (steps 4, 5, 5, 7
respectively). Read each template before writing its row so the
description matches its actual content.

**Verify**: `grep -n "ratchet.toml" skills/tailrocks-code-health/SKILL.md`
→ ≥ 1 hit; `bun run scripts/validate-skills.ts` → exit 0.

### Step 6: Fix the devtools pin

In `templates/package.json`, resolve the current
`@tanstack/react-router-devtools` (resolver from step 1) and set it to
the release matching router `1.170.17`'s line (expected `1.170.x`; use
the resolver's answer, not this plan's guess). Add a router-devtools row
to `references/version-policy.md`'s table with the same pin.

**Verify**:
`bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts @tanstack/react-router-devtools`
→ note version; `grep -n "react-router-devtools" skills/tailrocks-tanstack-project-setup/templates/package.json skills/tailrocks-tanstack-project-setup/references/version-policy.md`
→ same version in both.

### Step 7: Validate

**Verify**: `bun run scripts/validate-skills.ts` → exit 0.

## Test plan

- Resolver negative/positive smoke runs (step 1 verifies both scripts,
  both directions).
- Grep assertions per step.
- No Rust/TS toolchain runs — templates aren't built by this repo
  (fixtures-only change).

## Done criteria

- [ ] Both resolvers emit per-item errors, exit 0 on partial failure
- [ ] No `1.90` remains in workspace-and-layout.md; MSRV prose matches
      the equal-pin house default
- [ ] `careful` task installs its toolchain first and is documented in
      the gate table
- [ ] Panic-policy section names the lint-baseline constraint
- [ ] code-health SKILL.md links all four templates
- [ ] router-devtools pin matches router's line in template + policy table
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The registry says router-devtools has no release matching router
  1.170.x — pin mismatch may be upstream reality; report versions found.
- Network is unavailable (resolver verifies impossible) — do steps 2–5,
  report 1/6 blocked.
- The mise/rustup interaction in step 3 fails locally (no rustup) — keep
  the template change (it targets scaffolded repos, not this one) but
  say the runtime check was not executable here.

## Maintenance notes

- The pinned nightly date in `careful` now has a documented refresh path
  (freshness gate) — reviewers should reject future hardcoded dates
  without one.
- Plan 008 may amend `tooling-and-quality.md`/`vite.config.ts`/
  `components.json`/`renovate.json` — no file overlap with this plan.
- If plan 013's runner ever builds template fixtures, the devtools pin
  becomes machine-checked; until then version-policy.md is the guard.
