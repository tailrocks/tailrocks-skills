# CLAUDE.md

See [AGENTS.md](AGENTS.md) for shared agent instructions.

This is a Claude Code plugin repository publishing the **tailrocks-skills**
collection. The Claude manifest is `.claude-plugin/plugin.json`; the Codex
manifest is `.codex-plugin/plugin.json`. Skills live under `skills/<name>/` and
are auto-discovered from that directory by both manifests.

Current skills: `tailrocks-rust-best-practices`, `tailrocks-rust-project-setup`,
`tailrocks-propose`, and `tailrocks-research`.

Use `claude --plugin-dir .` from this repository root to test the plugin locally.
