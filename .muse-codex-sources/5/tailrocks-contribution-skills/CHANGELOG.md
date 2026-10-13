# Changelog

## 0.28.1 - 2026-10-08

Rewrote the package on branch `standardize/package-rewrite` under the
current name:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0 manifest.
  It is now the source of truth for name, version, and description.
  Version is now `0.28.1`.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to `./skills/`
  and a four-field interface block.
- Removed the component marketplace file
  `.claude-plugin/marketplace.json`. The central `tailrocks`
  marketplace is now the only catalog.
- Removed the legacy host manifest directory `.codex-plugin/`. Codex
  uses the portable manifest.
- Removed the dead root file `catalog.json`. Nothing referenced it.
- Removed the root `scripts/` directory and every per-skill
  `scripts/` directory. The skills now use native Git and `gh`
  operations.
- Removed the generated duplicate definitions under "docs/skills/"
  and "docs/index.json". `SKILL.md` is now the single maintained
  procedure.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the generated docs with the six standard guides under
  `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Rewrote all five skills in ASD-STE100 with the common body order.
  Removed per-GET approvals, approval expiry, submission-authorization
  denial, and custom receipt machinery. Kept DCO, CLA, and attribution
  rules.
- Renamed handoff files: `prepare-receipt.json` is now
  `prepare-report.json`, and `pr_description.md` is now
  `pr-description.md`. No compatibility alias remains.
- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0

Package before the rewrite, at commit
`3e51bc5c91949f361ed926d8f760bcb16edef111`. Five user-only skills
with TypeScript helper programs and generated documentation
duplicates.
