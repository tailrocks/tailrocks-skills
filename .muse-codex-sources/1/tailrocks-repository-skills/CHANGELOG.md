# Changelog

## 0.4.1 - 2026-10-08

Applied the common active-package structure on branch
`standardize/common-package`:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0 manifest.
  It is now the source of truth for name, version, and description.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to `./skills/`
  and a four-field interface block.
- Removed the component marketplace file
  `.claude-plugin/marketplace.json`. The central `tailrocks`
  marketplace is now the only catalog.
- Removed the legacy host manifests `.codex-plugin/` and
  `.muse-plugin/`. Codex uses the portable manifest. Muse reads the
  Claude manifest through its foreign-adapter import.
- Removed the dead root files `catalog.json` and `index.ts`. Nothing
  referenced them.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the old docs/client-invocation.md install guide with the
  six standard guides under `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Rewrote all seven `skills/*/SKILL.md` files in ASD-STE100
  Simplified Technical English: `tailrocks-create-pr`,
  `tailrocks-refresh-pr`, `tailrocks-review-pr`,
  `tailrocks-merge-pr`, `tailrocks-pr-template`,
  `tailrocks-repository-recover`, `tailrocks-repository-merge`.
  Restated each procedure as numbered imperative steps with one
  result section and one completion-check list. Kept every skill
  task unchanged. Updated the companion reference files to match
  the new prose. Retargeted the install-guide links in
  `skills/tailrocks-repository-merge/SKILL.md`.
- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.4.0 - 2026-10-07

Seven-skill package at commit `759849769249b5a4ada95595914ab8e81daf618b`
("recovery skill plus user-only merge migration"). Five skills are
model-selectable. `tailrocks-repository-recover` and
`tailrocks-repository-merge` are user-only and need an explicit human
command.
