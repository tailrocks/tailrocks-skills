# CLAUDE.md

See [AGENTS.md](AGENTS.md) for shared agent instructions.

This is a Claude Code plugin repository publishing the **tailrocks-skills**
collection. Manifests live at `.claude-plugin/plugin.json`,
`.codex-plugin/plugin.json`, and `.kimi-plugin/plugin.json`. Skills live under
`skills/<name>/` and are auto-discovered from that shared directory.

Current skills: `tailrocks-rust-best-practices`, `tailrocks-rust-project-setup`,
`tailrocks-axum-best-practices`, `tailrocks-typescript-best-practices`,
`tailrocks-tanstack-project-setup`, `tailrocks-code-health`,
`tailrocks-correctness-first`, `tailrocks-propose`, `tailrocks-research`, and
`tailrocks-blueprint`.

Use `claude --plugin-dir .` from this repository root to test the plugin locally.
