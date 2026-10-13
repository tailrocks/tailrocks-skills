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
- Removed the root scripts runtime and the generated skill-definition
  copies under `docs/`.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the generated docs index with the six standard guides
  under `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Rewrote all 15 `SKILL.md` files with the common body order in
  strict STE prose.
- Corrected the binary-test and workspace-inheritance claims.
  Labeled the `mod.rs` and test-file rules as Tailrocks rules.
- Split advisory duties: cargo-deny owns licenses, bans, and
  sources. Cargo-audit owns advisories.
- Removed the TypeScript crate-version helper. Version resolution
  uses native registry queries.
- Labeled Juniper, TanStack, Buf, and private gRPC use as Tailrocks
  choices.
- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0 - 2026-10-07

Fifteen-skill package at commit `0317f100714dc66285c01c24f7967134375b5ac5`
("adopt velnor-actions 0.1.0"). Five skills are model-selectable.
Ten skills are user-only and need an explicit human command.
