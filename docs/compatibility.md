# Host compatibility

Tailrocks ships one complete package per catalog entry.
Each host reads the same canonical skill directories.
Use the [installation guide](installation.md) to select a package and scope.

## Native loaders and invocation

In the table, `ID` means the plugin ID and `SKILL` means the skill ID.

| Host | Loader | Explicit selection |
| --- | --- | --- |
| [Claude Code][claude] | Claude marketplace and plugin manifest | `/ID:SKILL` |
| [Codex][codex] | Codex marketplace and portable root manifest | `$ID:SKILL` in the CLI |
| [Grok Build][grok] | Claude-compatible marketplace and plugin | `/SKILL`, or `invocableAs` from `grok inspect --json` on a collision |
| [Muse Code][muse] | Git marketplace snapshot and portable root manifest | Use `/SKILL` or the qualified entry in the picker. |
| [omp][omp] | Claude-compatible marketplace and plugin | `/skill:SKILL`, or `/skill:ID/SKILL` on a collision |
| [OpenCode V2][opencode] | Git package and server skill registrar | `@SKILL` |
| [Amp][amp] | Directory plugin and skill registrar | Ask Amp to load `ID:SKILL`. |
| [Antigravity][agy] | Local plugin installer and native manifest | `/SKILL` |
| [pi][pi] | Git package with a `pi.skills` declaration | `/skill:SKILL` |
| [Kimi Code][kimi] | Additional JSON v2 marketplace and Kimi plugin | `/skill:ID:SKILL` |

OpenCode registers the installed Markdown body and its canonical file path.
Amp registers the installed skill directory. Both registrars preserve explicit
selection requirements. Loading either registrar starts no background task.
A selected workflow can use its own scripts when its instructions require them.

A host controls discovery, permission prompts, model availability, and user
scope. Read the package's model guide for supported routes and effort levels.
A catalog listing grants no account access or additional permissions.

## Explicit-only policy skills

The private agent-policy package requires a user to select a skill. Its
manual-invocation flag and native metadata control discovery. Amp and
OpenCode V2 still allow a caller to load a known ID. In Muse, an explicit
host preference can override the default. Applying the policy requires
user authorization on each host.

On omp 19.0.0, the standard package loader skips skills with the
manual-invocation field. Adding the installed skill directory to
`skills.customDirectories` keeps the same files available for explicit
selection. See the [installation guide](installation.md).

## Evidence and scope

Isolated historical-commit fixtures passed in Claude Code `2.1.328`, Codex
`0.167.0-alpha.4`, Grok Build `1.0.89`, and Muse Code `1.4.24-R9131.1`.
The default branch in each fixture pointed at a newer commit. See the
[source-selection results](standards/distribution.md#native-evidence).

OpenCode `2.3.2` loaded a packed three-skill fixture into its live server.
The registry returned the installed file paths, bodies, and invocation flags.
A second run installed the fixture from a pinned local Git source.
The Amp fixture exercised its registrar with a test double.

All 11 Antigravity manifests passed the [official schema][agy-schema].
A native test used `agy` 1.5.12 and [contribution 0.29.1 at f8a276a4][agy-test].
The CLI validated the package, installed it, and listed all five skills as
part of the enabled plugin. It loaded `.antigravity-plugin/plugin.json` ahead
of the portable manifest. Antigravity loads plugin rules from `rules/`. The
root `AGENTS.md` remains a repository maintenance file.

Package verification records identify the revision, commands, client versions,
and outcomes for individual packages. A registry entry establishes discovery.
Account access, model behavior, and workflow results require separate evidence.
The [verification history](verification.md) records earlier migration checks.

[claude]: https://code.claude.com/docs/en/discover-plugins
[codex]: https://developers.openai.com/plugins/build/plugins
[grok]: https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/09-plugins.md
[muse]: https://meta-models.github.io/muse-code-sdk/1.4/guides/plugins/concepts/compatibility/
[omp]: https://github.com/can1357/oh-my-pi/blob/main/docs/marketplace.md
[opencode]: https://opencode.ai/docs/build/plugins/server/
[amp]: https://ampcode.com/docs/customize/plugins
[agy]: https://antigravity.google/docs/plugins
[pi]: https://docs.pi.dev/latest/packages
[kimi]: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins
[agy-schema]: https://antigravity.google/schemas/v1/plugin.json
[agy-test]: https://github.com/tailrocks/tailrocks-contribution-skills/tree/f8a276a401ca58855e2c687f2bb60c120e25acc4
