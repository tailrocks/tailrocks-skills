# tailrocks-macos-skills

One portable package with fifteen skills. The skills design native
macOS interfaces, scaffold and audit Swift projects, integrate a
Rust application core, and verify rendering through capture and
comparison. Two skills are model-selectable. Thirteen skills are
user-only and need an explicit human command.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-macos-design`](skills/tailrocks-macos-design/SKILL.md) | Design a native screen and prototype it. |
| [`tailrocks-macos-design-review`](skills/tailrocks-macos-design-review/SKILL.md) | Score a rendered screen. User-only. |
| [`tailrocks-macos-design-systematize`](skills/tailrocks-macos-design-systematize/SKILL.md) | Record approved learning. User-only. |
| [`tailrocks-macos-visual-baseline`](skills/tailrocks-macos-visual-baseline/SKILL.md) | Freeze a visual baseline. User-only. |
| [`tailrocks-macos-visual-qa`](skills/tailrocks-macos-visual-qa/SKILL.md) | Verify the current render. User-only. |
| [`tailrocks-macos-visual-regression`](skills/tailrocks-macos-visual-regression/SKILL.md) | Compare captures. User-only. |
| [`tailrocks-swift-agent-integration`](skills/tailrocks-swift-agent-integration/SKILL.md) | Wire Xcode for agent work. User-only. |
| [`tailrocks-swift-best-practices`](skills/tailrocks-swift-best-practices/SKILL.md) | Write Swift and SwiftUI code. |
| [`tailrocks-swift-project-audit`](skills/tailrocks-swift-project-audit/SKILL.md) | Audit a project baseline. User-only. |
| [`tailrocks-swift-project-remediate`](skills/tailrocks-swift-project-remediate/SKILL.md) | Close baseline gaps. User-only. |
| [`tailrocks-swift-project-setup`](skills/tailrocks-swift-project-setup/SKILL.md) | Start a project baseline. User-only. |
| [`tailrocks-swift-refactor`](skills/tailrocks-swift-refactor/SKILL.md) | Restructure Swift code. User-only. |
| [`tailrocks-swift-review`](skills/tailrocks-swift-review/SKILL.md) | Review Swift code. User-only. |
| [`tailrocks-swift-rust-core-boundary`](skills/tailrocks-swift-rust-core-boundary/SKILL.md) | Plan Swift/Rust boundary. User-only. |
| [`tailrocks-swift-rust-core-setup`](skills/tailrocks-swift-rust-core-setup/SKILL.md) | Wire the Rust core lane. User-only. |

Each skill body lives in its own directory. Read
`skills/tailrocks-swift-review/SKILL.md` for one complete example.

## Install

Install the package from the central `tailrocks` marketplace. Use
the qualified id `tailrocks-macos-skills@tailrocks` wherever the
client accepts it. Each row gives its complete section in
`docs/installation.md`.

| Agent | Method |
| --- | --- |
| Claude Code | [Marketplace install](docs/installation.md#claude-code) |
| Codex | [Marketplace add](docs/installation.md#codex) |
| Amp | [Per-skill add](docs/installation.md#amp) |
| Muse Code | [Marketplace install](docs/installation.md#muse-code) |
| OpenCode | [Skill-directory copy](docs/installation.md#opencode) |
| Antigravity | [Local-path install](docs/installation.md#antigravity) |
| Grok Build | [Marketplace install](docs/installation.md#grok-build) |
| Kimi Code | [In-session manager](docs/installation.md#kimi-code) |

Quick start on Claude Code (shell):

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-macos-skills@tailrocks --scope user
```

Build and test work needs Xcode on macOS. Visual work needs an
interactive graphical session with Screen Recording, Accessibility,
and Automation grants. Keep the complete package checkout for
the visual harness installer and the project setup templates.

## Use

Select the owner for the requested work. To review Swift sources
on Claude Code (session):

```text
/tailrocks-macos-skills:tailrocks-swift-review Sources/
```

The skill returns verified findings with file and line evidence,
the failure mechanism, and a narrow correction. The skill is
read-only. See `docs/usage.md` for every owner, more examples,
and the family boundaries.

## Documentation

- `docs/README.md` indexes the guides.
- `docs/installation.md` installs the package on eight agents.
- `docs/usage.md` shows how to select each skill.
- `docs/compatibility.md` records each route result.
- `docs/maintenance.md` lists checks, policy, and release steps.
- `docs/troubleshooting.md` fixes common failures.

## Update and remove

Refresh the marketplace, then the plugin. Remove the plugin when it
is no longer needed. Commands per agent:

- Claude Code: `claude plugin update
  tailrocks-macos-skills@tailrocks` or `claude plugin
  marketplace update tailrocks`. Remove with `claude plugin
  uninstall tailrocks-macos-skills`.
- Codex: `codex plugin marketplace upgrade tailrocks`. Remove with
  `codex plugin remove tailrocks-macos-skills@tailrocks`.
- Muse: `muse plugins marketplace update tailrocks`, then the
  remove plus install sequence. Remove with `muse plugins remove
  tailrocks-macos-skills@tailrocks`.
- Kimi session: no `update` subcommand. Remove with `/plugins
  remove tailrocks-macos-skills`, then `/reload`.
- Amp, OpenCode, Antigravity, Grok: see
  `docs/installation.md` for the exact steps.

## Contribute

Open an issue or a pull request on GitHub. Write all new and changed
prose in ASD-STE100 Simplified Technical English, Issue 9 rules. Run
`alint check`, the strict-JSON check, and the frontmatter check
before the pull request. See `docs/maintenance.md` for the
list. Never add evaluation content.

## License

Apache License, Version 2.0. See `LICENSE`.
