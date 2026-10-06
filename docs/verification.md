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

## Later phases

No evidence yet. This section grows with each phase.
