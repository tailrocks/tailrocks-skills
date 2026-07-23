# CLAUDE.md

See [AGENTS.md](AGENTS.md) for shared agent instructions.

This is a Claude Code plugin repository publishing the **tailrocks-skills**
collection. Manifests live at `.claude-plugin/plugin.json` (plus the
self-listing `.claude-plugin/marketplace.json`), `.codex-plugin/plugin.json`,
`.kimi-plugin/plugin.json`, and the root `plugin.json` (Antigravity CLI).
Skills live under `skills/<name>/` and are auto-discovered from that shared
directory. Cross-agent install and compatibility rules: `INSTALL.md`.

Current skills: `tailrocks-rust-best-practices`, `tailrocks-rust-project-setup`,
`tailrocks-axum-best-practices`, `tailrocks-typescript-best-practices`,
`tailrocks-tanstack-project-setup`, `tailrocks-code-health`,
`tailrocks-remediate`, and the delivery pipeline `tailrocks-idea`,
`tailrocks-brainstorm`, `tailrocks-research`, `tailrocks-record-decision`,
`tailrocks-finalize`, `tailrocks-plan`, and `tailrocks-reconcile`.

Use `claude --plugin-dir .` from this repository root to test the plugin locally.
Main is PR-only: feature branch + `git commit -s` + PR; see AGENTS.md.
