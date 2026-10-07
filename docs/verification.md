# Verification evidence

This file records verification evidence for the standardization work.
`docs/migration.md` records decisions and the completion checklist.

## Phase A evidence (2026-10-07 UTC)

Method: one inventory workflow with 11 parallel read-only agents plus
one synthesis agent, plus inline `git` and `gh` checks.

- All 11 working trees clean (`git status --porcelain` empty).
- 10 of 11 HEAD revisions match Appendix A exactly.
- `tailrocks-repository-skills` `origin/main` is `7598497`
  (baseline `a2a13ff` is its ancestor; PR #17 merged 2026-10-06).
- Local checkout moved from `feat/repository-recover-skill`
  (`51c910b`) to `main` (`7598497`) after inventory reads finished.
- Open PRs: 0 in all repositories
  (`gh pr list --state open` returns empty, exit 0).
- PR #17 state: MERGED. PR #14 state: MERGED.
- Installable skills: 92 files at `skills/<id>/SKILL.md`.
- Template asset found separately (authoring package).
- CI generation: Velnor Actions 0.1.0 in all repositories
  (release manifest `tailrocks/velnor-new` commit `c57c7004`).

Tool versions on macOS (darwin):

- `gh` 2.102.0, `claude` 2.1.289, `codex` 0.160.0,
  `muse` 1.4.3, `node` v24.20.0, `cargo` 1.99.0, `jq` 1.7.1.
- Absent: `alint`, `velnor`, `amp`, `opencode`, `grok`, `kimi`.

Evidence files (temporary, kept until final cleanup):

- `/tmp/phase-a-synthesis.md` (147 lines)
- `/tmp/<repository>-inventory.json` (11 files)

No skill evaluation ran. No model task ran during checks.

## Phase B evidence (2026-10-07 UTC)

Method: one research workflow (8 agent-install tracks plus alint,
Velnor, name-review, and STE tracks), one design author, one
independent reviewer (REJECT with 15 defects), one reviser, one
fresh re-reviewer (ACCEPT).

- Research: 12 files at `/tmp/phase-b-agent-*.md`,
  `/tmp/phase-b-alint.md`, `/tmp/phase-b-velnor.md`,
  `/tmp/phase-b-names.md`, `/tmp/phase-b-ste.md`.
- Design: `/tmp/phase-b-design.md` (v1, rejected),
  `/tmp/phase-b-design-v2.md` (accepted, 101 lines).
- Reviews: `/tmp/phase-b-design-review.md` (REJECT, 15 defects),
  `/tmp/phase-b-design-review-v2.md` (ACCEPT, all 15 fixed,
  4 minor implementation notes).
- Name availability: both `gh repo view` checks return exit 1
  with the exact GraphQL not-found output on 2026-10-07.
- alint v0.17.0 confirmed as latest release on 2026-10-07.
- All 16 cited rule kinds verified in the v0.17.0 schema.

No skill evaluation ran. No model task ran during checks.

## Phase C part 1 evidence (2026-10-07 UTC)

- Central catalogs: commit `b08398d` (`catalog.json` with 9
  plugins and pinned revs, `scripts/generate-catalogs.py`, 3
  native catalogs). Generator runs are byte-identical.
  Strict JSON parse passes for all 4 files.
- Shared policy: commit `d54adec` (`standards/alint/` active,
  marketplace, and retired profiles, plus `.alint.yml`).
  `alint check` passes with 0 errors and 36 passing rules.
- Velnor vectors: `tailrocks/velnor-new` branch
  `standardize/verify-vectors`, commit `47c7b5b2e` (29 files,
  new `[workflow.verify]` vectors with tests). `cargo test`
  passes for all three generator crates.
- Synthesis: `/tmp/phase-c-part1-synthesis.md` (all PASS).

No skill evaluation ran. No model task ran during checks.

## Phase C part 2 evidence (2026-10-07 UTC)

- Representative package: `tailrocks-repository-skills` branch
  `standardize/common-package`, commits `af60546`, `bdf5f20`,
  `7178bfc` (manifests plus policy, docs, link repair).
- `alint check` passes: 53/53 rules, exit 0 (confirmed by an
  independent verifier and a parent re-run).
- Strict JSON: 4/4 files pass. Frontmatter: 7/7 names match
  directories. markdownlint 0.23.3: 0 issues in new files.
- Trial install lifecycle with Claude Code 2.1.289 in an
  isolated HOME: add, install, list (7 skills), uninstall,
  and remove all pass. `muse validate` returns valid true.
- Velnor PR: `tailrocks/velnor-new` PR #98 opened for the
  verify vectors. Regeneration waits for merge plus release.
- Synthesis: `/tmp/phase-c-part2-synthesis.md` (both PASS).

No skill evaluation ran. No model task ran during checks.

## Phase D batch 1 evidence (2026-10-07 UTC)

- Authoring: `tailrocks-skill-authoring-skills` branch
  `standardize/package-rewrite`, commits `6f779b5`, `25ca59f`,
  `6ad844e`. alint 53/53, 4/4 frontmatter, template moved.
- Repository content: `tailrocks-repository-skills` branch
  `standardize/common-package`, commit `a635822` (7 skills).
  alint 53/53, 7/7 frontmatter, `--method GET` and `--draft`
  fixes present.
- Open-source: `tailrocks-open-source-skills` branch
  `standardize/package-rewrite`, commits `2fa4c72`,
  `f7b1f21`, `1ad116b`. alint 53/53, 5/5 frontmatter.
- asd-ste100: `asd-ste100-skill` branch
  `standardize/package-rewrite`, commits `15fcd7b`, `9d9b400`.
  alint 53/53, body order applied per D16, modes distinct.
  Metadata only in this record.
- Synthesis: `/tmp/phase-d-b1-synthesis.md` (3 PASS, 1 PASS
  with the §10 deviation now in fix-up).
- Push note: SSH signing through the 1Password agent started
  to refuse; pushes use gh HTTPS auth per D18.

No skill evaluation ran. No model task ran during checks.

## Later phases

No evidence yet. This section grows with each phase.

## Phase D batch 2 (2026-10-07)

- rust: PASS. alint 53/53 on `1fd1396`. Strict JSON x3.
  Frontmatter 15/15. Max 182 lines. 16 keys verified.
- roadmap: PASS. alint 53/53. Strict JSON x3. Frontmatter
  12/12. Native probes match the expected state.
- code-quality: PASS with an owner ruling. alint 53/53.
  Strict JSON x4 with 0.28.0 agreement. Frontmatter 14/14.
  markdownlint 0/69. Vendored copies byte-identical. The
  count is 14, not 15, per decision D19.
- typescript: PASS. alint 53/53 re-run by the owner. Strict
  JSON x3. Frontmatter 12/12. Links 0 broken. markdownlint
  0/87. Native probes pass with the expected warning.
- macos: PASS. alint 53/53 re-run by the owner. Strict JSON
  3/3. Frontmatter 15/15. Refs 200/200. markdownlint 0/24.
  Residual STE classes stay open for Phase E.
- Drift: the owner checked all five remote heads through
  the GitHub API. No drift exists.
- Install checks: not run. Compatibility rows stay not-run
  with reasons. No skill evaluations, per the goal.

## Phase E renames (2026-10-07)

- Both target names returned HTTP 404 before the rename.
- After the rename, both new names resolve with the
  expected visibility (contribution public, asd private).
- alint 53/53 passes on both rename commits (`9de71a1`,
  `cb54957`). No skill evaluation ran.

## Phase E first pass and corrections (2026-10-07)

- First pass: 9/9 branches reviewed with named skill
  coverage. No-eval CLEAN in 8 branches; 1 violation in
  macos, now deleted and verified absent.
- Corrections: alint 53/53 re-run by the owner on all 9
  trees before commit. Strict JSON, frontmatter, and
  markdownlint gates pass per writer evidence. Added-line
  eval greps are clean.
- Blocked: asd-F16 (absent CI workflows) and rust-F7
  (absent alint job) wait on supported regeneration,
  now in progress with the verified local binary.
- Install checks: not run, by plan. No skill evaluations.
