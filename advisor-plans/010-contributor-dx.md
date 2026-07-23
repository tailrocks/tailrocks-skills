# Plan 010: Fix the contributor workflow docs — PR reality, Bun bootstrap, pinning, release checklist

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- AGENTS.md CLAUDE.md INSTALL.md README.md`
> On any change, compare the excerpts below before editing; mismatch on a
> section this plan edits = STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

Four documented-workflow gaps: AGENTS.md orders agents to "commit and
push every completed repository change" while main is PR-only (a
following agent's push gets rejected); the repo's only gate requires Bun
but no doc says how to get it; four of seven client install flows track
`main` while the docs say "pin in production"; and the four-manifest
version-lockstep release has no checklist, so a missed file is one
validator-run-forgotten away (CI lands in plan 004, but the human
sequence still needs writing down).

## Current state

Verified at `f2c4be5`:

- `AGENTS.md:189-190` (## Commit Messages): "Commit and push every
  completed repository change. Do not leave finished work uncommitted
  unless the user explicitly requests otherwise." Neither AGENTS.md nor
  CLAUDE.md mentions branches or PRs; history is squash-merged PRs
  (`f2c4be5 … (#2)`), remote feature branches exist, and the operator
  confirms main is push-protected with DCO signoff required.
- Bun: `AGENTS.md:175-179` and `README.md:188-192` invoke
  `bun run scripts/validate-skills.ts`; no root mise.toml, no
  package.json, no "install Bun" note anywhere. (House convention
  elsewhere: mise-managed tools — `skills/tailrocks-rust-project-setup/templates/mise.toml`.)
- Pinning: `INSTALL.md` shows unpinned flows for Claude Code (:51-61),
  Codex (:79-82), OpenCode (:109-111 `git clone --depth 1` of default
  branch), Antigravity (:192-195 same); pinned examples exist only for
  Grok (:144 `@v0.11.0`) and Kimi (:168 release URL). `README.md:78-79`
  says "Pin to a release tag (`@vX.Y.Z`, `/tree/vX.Y.Z`, or a tagged
  clone) in production." Tag `v0.11.0` exists.
- Release: `AGENTS.md:168-171` — bump `version` in lockstep across
  `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
  `.kimi-plugin/plugin.json`, and the `.claude-plugin/marketplace.json`
  entry, and tag. No checklist/script/CHANGELOG exists.
- Rot markers: `INSTALL.md:6-7` "verified in July 2026", `:200-201`
  "verified with `agy` 1.1.5", `:237` matrix "verified July 2026" —
  date-stamped authority with no re-check cadence.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |
| mise check | `mise install && mise x bun -- bun --version` (repo root, after step 2) | prints pinned version |

## Scope

**In scope**:
- `AGENTS.md` (Commit Messages section + Validation section)
- `CLAUDE.md` (one workflow line)
- `INSTALL.md` (per-client pin examples + verified-banner cadence note)
- `README.md` (validation section Bun note)
- `mise.toml` (create, repo root)

**Out of scope**:
- `.gitignore` (`target/`/`tmp/` entries judged acceptable — rejected
  finding).
- Release *automation* (script/CHANGELOG) — checklist only; automation
  was not selected.
- GitHub branch-protection settings (not repo files).

## Git workflow

- Branch: `advisor/010-contributor-dx`.
- Conventional Commits, DCO (`git commit -s`). Main is PR-only; do NOT
  push or open a PR unless instructed. (This plan itself documents that
  rule.)

## Steps

### Step 1: Document the real branch workflow

In `AGENTS.md`, rework the "Commit Messages" section opening: replace
"Commit and push every completed repository change." with a short
"## Contributing workflow" block above it:

> Main is protected and PR-only. Work on a feature branch
> (`feat/…`, `fix/…`, or `advisor/…`), commit every completed change with
> DCO signoff (`git commit -s`), and open a PR (`gh pr create`) when the
> change set is complete. Never push to main directly. Do not leave
> finished work uncommitted on the branch.

Add one line to `CLAUDE.md` after the local-testing line: "Main is
PR-only: feature branch + `git commit -s` + PR; see AGENTS.md."

**Verify**: `grep -n "PR-only" AGENTS.md CLAUDE.md` → ≥ 1 hit each.

### Step 2: Bootstrap Bun via root mise.toml

Create `/mise.toml` at repo root:

```toml
[tools]
bun = "1.3.14"

[tasks.validate]
run = "bun run scripts/validate-skills.ts"
```

Pin the version to match `.github/workflows/validate.yml` (plan 004) and
the tanstack template's `packageManager` (`bun@1.3.14` at `f2c4be5`) —
if those moved, use the newer and note it. Update AGENTS.md Validation
and README.md Validation sections: "Requires Bun (pinned in `mise.toml`;
`mise install` provisions it). Run `bun run scripts/validate-skills.ts`
or `mise run validate`."

**Verify**: `mise install && mise x bun -- bun --version` → the pinned
version; `mise run validate` → `Validated 14 skills.`

### Step 3: Pin examples for the four unpinned clients

In INSTALL.md add the pinned form beside each unpinned flow (do not
remove the unpinned one — development installs are legitimate):

- Claude Code / Codex (§1, §2): note that `marketplace add` resolves the
  ref used at add time — "to pin, add the marketplace at a tag:
  `… marketplace add tailrocks/tailrocks-skills@v0.11.0` (or re-add at
  each release)". If the clients' current syntax differs, state the
  verified syntax or mark it "verify against your client version" —
  never invent a flag.
- OpenCode (§3) and Antigravity (§6): change the clone examples to
  `git clone --depth 1 --branch v0.11.0 …` with a "(or the latest
  release tag)" note.

Add to the top-of-file banner: "Verified July 2026 — re-verify the
matrix and these commands at each release (see AGENTS.md release
checklist)."

**Verify**: `grep -c "v0.11.0" INSTALL.md` → ≥ 4 (was 2).

### Step 4: Release checklist

Append to AGENTS.md step 6 (Adding a Skill) or as a new "## Releasing"
section:

> 1. `mise run validate` green.
> 2. Bump `version` in `.claude-plugin/plugin.json`,
>    `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and the
>    `.claude-plugin/marketplace.json` entry — one commit.
> 3. Re-run the validator (it enforces lockstep).
> 4. Update the pinned-tag examples in INSTALL.md and README.md to the
>    new tag.
> 5. Tag `vX.Y.Z` on the merge commit; push the tag.
> 6. Re-verify the INSTALL.md matrix commands against current client
>    versions; refresh the "verified" date.

**Verify**: `grep -n "## Releasing" AGENTS.md` → 1 hit.

### Step 5: Validate

**Verify**: `bun run scripts/validate-skills.ts` → exit 0.

## Test plan

Step 2's `mise install`/`mise run validate` is the executable test. The
rest are doc greps listed per step.

## Done criteria

- [ ] AGENTS.md + CLAUDE.md state the PR-only workflow; direct-push
      instruction gone
- [ ] Root `mise.toml` pins Bun; `mise run validate` works
- [ ] All four previously-unpinned clients show a pinned install form
- [ ] Release checklist exists with the 6 steps
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `mise` is unavailable in the environment — write the files anyway,
  report that the runtime check was not executable.
- The Claude/Codex pinned-marketplace syntax cannot be verified — use the
  "verify against your client" wording; do not invent flags.

## Maintenance notes

- Plan 004's workflow and this mise.toml pin the same Bun — reviewers
  should reject a bump to one without the other.
- The release checklist step 6 is the rot-control for INSTALL.md's
  "verified July 2026" claims (plan 008's four external verdicts join
  that re-check list).
