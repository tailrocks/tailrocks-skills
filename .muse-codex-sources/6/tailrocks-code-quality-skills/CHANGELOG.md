# Changelog

## 0.28.1 - 2026-10-08

Applied the common active-package structure on branch
`standardize/package-rewrite`:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0
  manifest. It is now the source of truth for name, version,
  and description.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to
  `./skills/` and a four-field interface block.
- Removed the component marketplace file
  `.claude-plugin/marketplace.json`. The central `tailrocks`
  marketplace is now the only catalog.
- Removed the legacy host manifest `.codex-plugin/`. Codex
  uses the portable manifest.
- Removed the dead root file `catalog.json`. Nothing
  referenced it.
- Removed the whole `scripts/` directory with all custom
  programs. Skills now use native file and Git operations.
- Removed the repeated skill definitions under docs/skills/
  and the generated docs/index.json. Each `SKILL.md` file
  is now the single maintained procedure.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the old docs with the six standard guides under
  `docs/`.
- Added `AGENTS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.

Rewrote all skills in ASD-STE100 Simplified Technical
English, Issue 9 rules, with the common body order:

- Renamed `tailrocks-improve` to `tailrocks-improve-audit`.
  Merged `tailrocks-improve-deep` into it as the `--deep`
  coverage option. Depth was the only task difference.
- Renamed `tailrocks-improve-security` to
  `tailrocks-improve-security-audit`.
- Imported `tailrocks-improve-plan`,
  `tailrocks-improve-execution`, and
  `tailrocks-improve-reconcile` from the roadmap package.
  Dropped the fixed attempt limit from execution. Aligned
  status terms across plan, execution, and reconcile.
  Execution pushes only with separate explicit
  authorization.
- Gave the three instruction skills one maintained
  instruction policy. Removed the assumption that every
  agent loader follows symlinks.
- Removed the custom predicate program from the code-health
  skills. Corrected the release-age rule against current
  Renovate guidance. A release-age delay is a documented
  supply-chain control. Security updates bypass it. No
  single value is a universal best practice.
- Removed the mandatory complete redesign from
  `tailrocks-root-cause`. A local fix can close the
  diagnosis when it removes the evidenced class.
- Permitted a failing regression test that reproduces the
  defect in `tailrocks-remediate`.

The package now holds fourteen skills. Thirteen are
user-only. `tailrocks-agents-md` is model-selectable for
policy only.

- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0 - 2026-10-07

Twelve-skill package at commit `e63a82f28b688a7fada418e615aa9ec0eeec4c04`
("ci: adopt velnor-actions 0.1.0 (#2)"). Eleven skills were
user-only. `tailrocks-agents-md` was model-selectable.
