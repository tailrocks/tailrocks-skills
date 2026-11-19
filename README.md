# tailrocks-skills

This marketplace lists 11 independently installable Tailrocks packages.
Each catalog entry identifies the owning repository and its exact Git commit.

## Install

From this checkout, print the native commands for your package and host.

```sh
python3 scripts/install-command.py tailrocks-repository-skills --agent claude
```

Claude Code, Codex, Grok Build, Muse Code, and omp use the shared marketplace.
OpenCode V2, Amp, Antigravity, and pi use native package or directory installs.
Kimi Code also has a native catalog.
See [installation](docs/installation.md) and [host compatibility](docs/compatibility.md).

## Packages

| Repository | Ownership |
|---|---|
| [tailrocks-rust-skills](https://github.com/tailrocks/tailrocks-rust-skills) | Rust, Axum, GraphQL, gRPC, terminal UI |
| [tailrocks-typescript-skills](https://github.com/tailrocks/tailrocks-typescript-skills) | TypeScript, React, Bun, TanStack, web UI |
| [tailrocks-macos-skills](https://github.com/tailrocks/tailrocks-macos-skills) | Swift, SwiftUI, Rust-core boundary, macOS and Liquid Glass, visual QA |
| [tailrocks-repository-skills](https://github.com/tailrocks/tailrocks-repository-skills) | Repository management and pull-request lifecycle |
| [tailrocks-vitalik-mode-skills](https://github.com/tailrocks/tailrocks-vitalik-mode-skills) | Time-to-market priority, strong-model whole-plan analysis, contextual practices, and tracked recovery |
| [tailrocks-roadmap-skills](https://github.com/tailrocks/tailrocks-roadmap-skills) | Roadmap, delivery, verification, reconciliation, decision support |
| [tailrocks-skill-authoring-skills](https://github.com/tailrocks/tailrocks-skill-authoring-skills) | Skill creation, update, audit, refactor |
| [tailrocks-code-quality-skills](https://github.com/tailrocks/tailrocks-code-quality-skills) | Code health, improvement, security, instruction topology, simplification, root cause, remediation |
| [tailrocks-contribution-skills](https://github.com/tailrocks/tailrocks-contribution-skills) | Open-source contribution lifecycle |
| [tailrocks-asd-ste100-skills](https://github.com/tailrocks/tailrocks-asd-ste100-skills) | ASD-STE100 writing profiles (private) |
| [tailrocks-agent-policy-skills](https://github.com/tailrocks/tailrocks-agent-policy-skills) | Agent execution policies: delegation, model routing, commit cadence, secret scan, autonomy, incremental delivery, security review, emergency stop (private) |

## Documentation

- [Documentation index](docs/README.md)
- [Package inventory and exact revisions](catalog.json)
- [Native distribution and catalog maintenance](docs/standards/distribution.md)
- [Package structure](docs/standards/structure.md)
- [ChatGPT workspace import](docs/chatgpt-web.md)

An eligible ChatGPT workspace and its GitHub connector need access to each
selected source. The ASD-STE100 and agent-policy repositories require private
read access.

## License

Apache-2.0
