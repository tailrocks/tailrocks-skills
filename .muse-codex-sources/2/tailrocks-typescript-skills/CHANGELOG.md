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
- Removed the legacy host manifest directory `.codex-plugin/`. Codex
  uses the portable manifest.
- Removed the dead root file `catalog.json`. Nothing referenced it.
- Removed the generated duplicate skill definitions and the
  generated docs index. Each `SKILL.md` file is now the only
  definition.
- Pruned `scripts/` to the referenced runtime helpers: the three
  support modules and the visual-QA harness. Removed the docs
  generator and the procedures owned by other packages.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the old generated docs with the six standard guides under
  `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Rewrote all twelve `SKILL.md` files in the common body order and in
  strict ASD-STE100 prose. Labeled Bun, TanStack, GraphQL, and Rust
  ownership as Tailrocks architecture choices. Removed fixed finding
  orders and fixed receipt labels. Corrected the TypeScript 6
  side-by-side rule against the official TypeScript 7 announcement.
- Fixed the first-pass review findings. The TanStack version policy
  now names the canonical template as the tool-pin source and drops
  the stale Renovate claim. The web-design, review, and remediate
  skills no longer contradict themselves. Per-skill template
  directories moved under the skill assets name. The usage guide no
  longer sends OpenCode users to a slash picker. Authored prose no
  longer uses semicolons and no longer exceeds the sentence limits.
- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0 - 2026-10-06

Twelve-skill package at commit `0652a50fce67c4a11f01ebb960a50fd5e283e0a9`
("ci: adopt velnor-actions 0.1.0 (#2)"). Two skills are
model-selectable. Ten skills are user-only and need an explicit human
command.
