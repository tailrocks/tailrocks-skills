# Changelog

## 0.28.1 - 2026-10-08

Applied the common active-package structure on branch
`standardize/package-rewrite`:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0 manifest.
  It is now the source of truth for name, version, and description.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to `./skills/`
  and a four-field interface block.
- Removed the component marketplace file
  `.claude-plugin/marketplace.json`. The central `tailrocks`
  marketplace is now the only catalog.
- Removed the legacy host manifest `.codex-plugin/`. Codex uses the
  portable manifest.
- Removed the dead root file `catalog.json`. Nothing referenced it.
- Removed the generated docs/skills/ definitions and docs/index.json.
  Each `SKILL.md` file is now the only maintained procedure.
- Removed unneeded root software under `scripts/`. Only the visual
  harness installer `scripts/macos-visual-qa/` stays.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the old generated docs with the six standard guides
  under `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Rewrote all fifteen `SKILL.md` files in strict ASD-STE100 prose
  with the common body order. Corrected the default actor isolation
  claim, the update-notice recovery, the binding-drift procedure,
  and the platform-effect wording. Removed custom loader tools
  and unsupported statistics.
- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0 - 2026-10-02

Fifteen-skill package at commit `eb0be5522fe0c1c9c74d41ee354446a011b10c74`
("ci: adopt velnor-actions 0.1.0"). Two skills are
model-selectable. Thirteen skills are user-only and need an explicit
human command.
