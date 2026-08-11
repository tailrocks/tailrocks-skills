# Plan 012: Un-red the CI topology, fix the stale install pins, close the validator's blind spots, and age-gate the platform facts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- scripts .github INSTALL.md README.md AGENTS.md .claude-plugin .codex-plugin .kimi-plugin plugin.json mise.toml`
> Plans 004-011 touch AGENTS.md and scripts/ — expected. Meaning-level
> mismatch on this plan's specific targets = STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED (CI topology change needs a repo-settings step only the maintainer can do — flagged in step 1)
- **Depends on**: none (independent of the content plans; step 4's date-stamp list grows if 011 added one — re-grep, don't hardcode)
- **Category**: dx
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

Production installs following INSTALL.md's own pinned examples get `v0.11.0` — a tag containing none of the six macOS skills the same page promises, and the failure is silent. The single `validate` CI job includes a live-npm latest-stable gate that has already reddened an unrelated PR (#6) and runs on a daily cron with no notification path. The validator that makes SKILL.md links trustworthy stops at the router boundary (backticked prose paths and template markdown are unscanned — a live broken pointer exists in the rust family), the ~200-line router budget is enforced by memory, the family's only executable templates ship unparsed, and the "verified 2026-08-11" platform facts across six files have no expiry alarm while the TanStack pins next door get a daily live check.

## Current state

Verified at `64df333`.

**(a) Install pins.** `git tag` → only `v0.11.0`; `git ls-tree v0.11.0 skills/` → 14 skills, zero macOS-family entries. `INSTALL.md` contains 8 `v0.11.0` literals (`grep -c "v0.11.0" INSTALL.md` → 8) while `.claude-plugin/plugin.json:4` reads `"version": "0.12.0"` and `INSTALL.md:29-31` promises all six macOS skills in every channel. Release process (`AGENTS.md:342-352`) already says to bump pinned-tag examples — honor-system only.

**(b) CI topology.** `.github/workflows/validate.yml` — one job `validate` (ubuntu-latest, bun 1.3.14), three steps: `bun run scripts/validate-skills.ts`, `bun test scripts/`, `bun skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts --check-template …`. Triggers: push to main, pull_request, cron `17 3 * * *`. The resolver exits 1 on stale pins *or* fetch errors; `advisor-plans/README.md` (fifth pass, "Current branch/PR facts") records PR #6 red from exactly this on unrelated changes.

**(c) Validator blind spots** (`scripts/validate-skills.ts`):
- `:66` `scanLinks` matches only `](...)` markdown links; backticked prose paths are invisible. Live instance: `skills/tailrocks-rust-project-setup/references/workspace-and-layout.md:140` points at `references/readability-style-architecture.md`, which exists only in `tailrocks-rust-best-practices` — validator green.
- Templates are read only for a package-manager-command grep (`:212-223`); the five macOS markdown templates are never link-scanned.
- `:272` catalog loop covers `["README.md", "AGENTS.md", "CLAUDE.md"]` — INSTALL.md omitted (the W7 drift cause), and the check is one-directional (no stale-entry reverse pass).
- `:102` enforces only the 500-line ceiling; the AGENTS.md ~200-line budget (routers: design 228, liquid-glass 182, setup 172 — the three largest are all macOS-family) has no signal.
- No `sh -n`/`swiftc -parse` anywhere; `templates/capture.sh` and `templates/window-id.swift` ship unparsed; CI has no macOS job.
- Keyword lockstep: `.kimi-plugin/plugin.json` keywords lack `swiftui`, `appkit`, `sketch`, `accessibility` present in the Claude/Codex manifests; the manifest checks cover version/name/description only (`:250-271`).

**(d) Unowned expiry of platform facts.** Dated "verified 2026-08-11" stamps: `skills/tailrocks-liquid-glass/references/platform-baseline.md:24`, `skills/tailrocks-swift-project-setup/references/toolchain.md:11`, `skills/tailrocks-swift-project-setup/SKILL.md:19-24` (versions hard-coded in a **router**), `skills/tailrocks-sketch-handoff/references/apple-kit.md:8`, `skills/tailrocks-macos-design/references/design-principles.md:8`, `skills/tailrocks-swift-project-setup/references/agent-integration.md:97` (re-grep at execution: `grep -rn "verified 2026" skills/`). Drift is demonstrated (the hardening ledger corrected ~20 claims on first verification; macOS 27 ships "this fall", invalidating the shipping-lane rows). Sources are machine-checkable for OS versions (`https://gdmf.apple.com/v2/pmv`) but not for every fact; the honest CI heuristic is date-age.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 (until step 3 surfaces the rust break — see step) |
| Script tests | `bun test scripts/` | exit 0 |
| Tag check | `git tag && git ls-tree v0.12.0 skills/ \| wc -l` | after step 2: tag exists, 21 entries |
| Workflow lint (optional) | `gh workflow view validate` | shows split jobs after step 1 |

## Scope

**In scope**:
- `.github/workflows/validate.yml`
- `scripts/validate-skills.ts`, `scripts/validate-skills.test.ts`
- `scripts/check-baseline-age.ts` (new)
- `INSTALL.md`, `README.md` (pinned-tag literals), `AGENTS.md` ("Adding a Skill" checklist + release checklist lines)
- `.kimi-plugin/plugin.json` (keywords)
- `skills/tailrocks-rust-project-setup/references/workspace-and-layout.md:140` (the one live broken pointer step 3 will trip on — minimal fix: correct the path to name the owning skill)
- Tagging `v0.12.0` (maintainer-confirmed step)

**Out of scope**:
- Eval-runner and eval-schema checks (plans 001/004 own them).
- Running evals in CI (needs `claude` CLI + budget policy — deliberately excluded; recorded in maintenance notes).
- Manifest version bumps beyond what tagging requires; skill content beyond the single broken pointer.

## Git workflow

- Branch: `advisor/012-repo-ci-hardening`; `git commit -s`; Conventional Commits (`ci: …`, `build: …`, `docs(install): …`); PR via `gh pr create`. **Tagging happens after merge, on the merge commit, per `AGENTS.md:350`.**

## Steps

### Step 1: Split the live latest-stable gate into its own job

Rewrite `.github/workflows/validate.yml`:

```yaml
jobs:
  validate:            # hermetic: validator + script tests
    runs-on: ubuntu-latest
    steps: [checkout, setup-bun, validator, bun test scripts/, sh -n over skills/**/templates/*.sh]
  latest-stable:       # network-dependent: TanStack pin check (+ step-4 age check)
    runs-on: ubuntu-latest
    continue-on-error: false
    steps: [checkout, setup-bun, resolve-package-versions --check-template …]
  templates-macos:     # parse-only, no GUI: swiftc -parse both Swift templates; capture.sh /tmp refusal
    runs-on: macos-latest
    steps: [checkout, swiftc -parse …/window-id.swift (and ax-drive.swift if plan 007 landed),
            run capture.sh /tmp/Fake.app X out.png and assert exit code 2]
```

Keep the cron trigger on `latest-stable` only, and add an issue-opening step on cron failure (`gh issue create` guarded by `if: failure() && github.event_name == 'schedule'`, with a stable title so repeats update rather than duplicate — use `gh issue list --search` to find an open one first). Add a PR-body/README note (maintainer action, cannot be done from the repo): make only `validate` + `templates-macos` required checks in branch protection; `latest-stable` stays informative.

**Verify**: `gh workflow view validate` (or push to a branch and observe) → three jobs; a deliberate `exit 1` in latest-stable on a scratch branch does not fail the `validate` job.

### Step 2: Fix the install pins and gate them

1. Update all pinned-tag literals in `INSTALL.md` (8) and any in `README.md` (`grep -n "v0.11.0" README.md`) to `v0.12.0`.
2. Add to `scripts/validate-skills.ts`: every `v\d+\.\d+\.\d+` literal in INSTALL.md and README.md must equal `.claude-plugin/plugin.json`'s version (prefixed with `v`) — with a test.
3. Maintainer-confirmed action after merge: `mise run validate` green, then tag `v0.12.0` on the merge commit and push the tag (`AGENTS.md:344-351` sequence). **Do not tag from the feature branch.** If the maintainer wants a different next version, the literals and the check adapt — the invariant is literals == manifest == tag.

**Verify**: `grep -c "v0.11.0" INSTALL.md README.md` → 0; validator test red when a literal is stale (prove by temporary edit, revert); after merge+tag: `git ls-tree v0.12.0 skills/ | wc -l` → 21.

### Step 3: Close the validator's catalog, prose-path, template, and budget gaps

In `scripts/validate-skills.ts` (+ tests for each):

1. Add `"INSTALL.md"` to the catalog array at `:272`; add a reverse pass — any `tailrocks-[a-z-]+` token in the four catalogs without a matching `skills/` directory is an error (allowlist: `tailrocks-skills`, the plugin name).
2. Extend the link scan to backticked prose paths matching `(references|templates|scripts|evals)/[^\s\`]+` in SKILL.md and references (same `outside()` escape check); run `scanLinks` over `templates/*.md` too. **This will trip on the known rust-family break** — fix `skills/tailrocks-rust-project-setup/references/workspace-and-layout.md:140` by pointing it at the sibling skill by name (one-line prose fix; the deep-dive content lives in `tailrocks-rust-best-practices/references/readability-style-architecture.md`). Any *additional* breaks the new scan surfaces: fix if one-line-obvious, otherwise report in the PR and add to the index as findings.
3. Add a non-fatal `notice:` line for routers over 200 lines (keep the 500 hard fail) so PR logs surface budget crossings.
4. Keyword check: `.kimi-plugin` keywords must be a superset-or-equal of the Claude manifest's; fix the Kimi manifest now (add `swiftui`, `appkit`, `sketch`, `accessibility`).
5. Update `AGENTS.md:226-232` "Adding a Skill": add the `license: Apache-2.0` field, the exact guard sentence, the evidence-not-instructions clause (three things all 21 skills already carry), INSTALL.md in the catalogs to update (`:282`), and the fixtures expectation (coordinating with plan 004's step-2 edit if landed — extend, don't duplicate).

**Verify**: `bun test scripts/` → all green incl. new tests; `mise run validate` → exit 0 *after* the rust-pointer fix; temporarily add a bogus backticked path to a reference → validator errors → revert.

### Step 4: Age-gate the dated platform facts

New `scripts/check-baseline-age.ts` (bun): grep `skills/**` for `verified <ISO-date>` stamps (the current stamp phrasing — derive the regex from the live files, e.g. `verified 2026-08-11` and `State as verified`), print each with its age in days, exit 1 when the newest stamp in any *file* exceeds `--max-age-days` (default 90). Wire it into the `latest-stable` job (so it never blocks PRs, and cron failure opens/updates the issue from step 1). Add one line to the release checklist (`AGENTS.md:342-352`): "re-verify the macOS platform baselines (W1/W2 procedure: DocC JSON availability + `gdmf.apple.com/v2/pmv` versions) and refresh the stamps" — pointing at `plans/macos-skills-hardening/README.md` executor rule 8 for the DocC method.

**Verify**: `bun scripts/check-baseline-age.ts --max-age-days 90` → exit 0 today with all stamps listed; `--max-age-days 0` → exit 1 naming every file (proves detection); `bun test scripts/` covers the date-parse edge (missing stamp file list is not empty — the six known files minimum).

## Test plan

- Every validator change lands with a `scripts/validate-skills.test.ts` case (existing style).
- Workflow change proven on a scratch branch push (step 1 verify) — CI runs are the test.
- The age gate's negative test is the `--max-age-days 0` run.

## Done criteria

- [ ] `mise run validate` exits 0; `bun test scripts/` exits 0 with new tests
- [ ] Workflow has 3 jobs; cron only on `latest-stable`; issue-on-cron-failure step present
- [ ] No `v0.11.0` literal in INSTALL.md/README.md; version-literal check active
- [ ] Catalog gate covers INSTALL.md both directions; prose-path + template-md scanning active; rust pointer fixed
- [ ] Router-budget notice prints for the 228-line design router (visible in validator output, non-fatal)
- [ ] Kimi keywords ⊇ Claude keywords; check enforced
- [ ] `check-baseline-age.ts` wired into `latest-stable`; release checklist names the re-verify step
- [ ] Maintainer follow-ups recorded in PR body: branch-protection required-checks change; post-merge `v0.12.0` tag
- [ ] Index row updated

## STOP conditions

- Step 3.2's new scan surfaces >5 broken prose paths — the one-line-fix rule stops scaling; report the list instead of fixing beyond the known rust break.
- The tag/version decision (0.12.0 vs something else) gets no maintainer confirmation — complete everything except the literal bumps, mark step 2 BLOCKED (literals must match a *decided* tag, guessing defeats the check).
- `macos-latest` runner lacks a Swift toolchain able to `-parse` the templates (unlikely) — drop the job to `sh -n` only and report.

## Maintenance notes

- Evals-in-CI remains deliberately out: it needs the `claude` CLI, secrets, and a budget policy — a maintainer decision. The mise task from plan 004 is the local substitute.
- The age gate is a *reminder*, not a verifier — it cannot detect a claim Apple invalidated yesterday. The real re-verification is the W1/W2 procedure it points at. A live version-resolver against `gdmf.apple.com/v2/pmv` (TanStack-style) was considered and recorded in the index as a follow-up option; network-flake design (skip-not-red) required if built.
- Reviewer scrutiny: the reverse catalog pass's token regex will match prose mentions of retired skills in historical docs — scope it to the four catalogs only, not docs/.
