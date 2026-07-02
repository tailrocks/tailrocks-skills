# CLAUDE.md

See [AGENTS.md](AGENTS.md) for shared agent instructions.

This is a Claude Code plugin repository publishing the **tailrocks-skills**
collection. The Claude manifest is `.claude-plugin/plugin.json`; the Codex
manifest is `.codex-plugin/plugin.json`. Skills live under `skills/<name>/` and
are auto-discovered from that directory by both manifests.

Current skills: `tailrocks-rust-best-practices` (Rust code craft) and `tailrocks-rust-project-setup`
(strict workspace, lints, toolchain, mise, and supply-chain setup).

Use `claude --plugin-dir .` from this repository root to test the plugin locally.
