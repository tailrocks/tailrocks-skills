# Changelog

## 0.1.1 - 2026-10-08

Applied the common active-package structure on branch
`standardize/package-rewrite`:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0 manifest.
  It is now the source of truth for name, version, and description.
  The root manifest no longer carries the Antigravity schema.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to `./skills/`
  and a four-field interface block.
- Removed the legacy host manifests `.codex-plugin/` and
  `.muse-plugin/`. Codex uses the portable manifest. Muse reads the
  Claude manifest through its foreign-adapter import.
- Removed docs/client-invocation.md. It covered six agents only and
  registered the package as its own marketplace. The six standard
  guides under `docs/` replace it.
- Added `.alint.yml`, pinned to the shared active profile.
- Added `.velnor/config.toml` and `.github/PULL_REQUEST_TEMPLATE.md`.
- Restructured `README.md` into the eight required sections.
- Added `AGENTS.md`.
- Repaired the dictionary index. Entry counts now match the actual
  shard files. One status scheme covers all 20 letter shards. The
  authorized Issue 9 copy stays authoritative for words outside the
  bundled coverage.
- Repaired the notices. The corpus statement now agrees with the
  actual bundled contents. The donor URL is correct. Each donor
  carries its verified commit pin.
- Added `skills/asd-ste100/references/source-access.md`. It tells the
  reader how to consult an authorized Issue 9 copy. It replaces the
  dangling reference in the old notices.
- No skill procedure changed. The Practical and Strict profiles keep
  their distinct triggers and duties.

Regenerated CI with Velnor Actions 0.1.4:

- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.1.0 - 2026-10-07

One-skill private package at commit `0572839a13afc145083535b3e29c79b78489af40`
("correct shard link targets in words and recurring-errors"). The
`asd-ste100` skill writes with Practical clarity by default and
applies Strict Issue 9 only on explicit request.
