# AGENTS.md

This package holds five contribution skills for external projects.
Install it as one unit. Do not copy one `SKILL.md` file out of its
skill directory.

## Structure

The package uses this structure:

- `plugin.json` is the portable manifest. It is the source of truth
  for name, version, and description.
- `.claude-plugin/plugin.json` and `.kimi-plugin/plugin.json` are
  host manifests. They repeat the same name, version, and
  description.
- `skills/` holds one directory per skill id. Each directory holds
  its own `SKILL.md` file plus its own references.
- `docs/` holds the package guides. Start at `docs/README.md`.

Shared references (`runtime-trust.md` and `contribution-handoff.md`)
repeat in every skill directory. Per-skill installs need
self-contained directories. Update every copy together.

## Rules for changes

Obey these rules:

- Write all new and changed prose in ASD-STE100 Simplified Technical
  English, Issue 9 rules.
- Never hand-edit `.github/`. Change `.velnor/config.toml`. After the change,
  regenerate. The generator preserves
  `.github/PULL_REQUEST_TEMPLATE.md`. See `docs/maintenance.md`.
- Never add evaluation content: no benchmarks, no model trials, no
  scored comparisons, no pass-rate targets. See `docs/maintenance.md`.
- Keep one fact in one place. Link to `docs/` guides. Do not copy
  skill bodies into guides.

## Checks before a pull request

Run these checks from the repository root:

```sh
alint check
```

See `docs/maintenance.md` for the strict-JSON check, the frontmatter
check, and the full check list with expected results.
