# Native distribution

## Immutable source selection

Use `catalog.json` as the package inventory.
Keep one package identity, version, repository, and source revision per entry.
Select a reachable commit with its full 40-character SHA.
Read the version from `plugin.json` at that commit.
Publish a new version when a package changes.

Use the same commit in every generated catalog.
A release tag is optional.
Do not require a tag when the native loader accepts a commit.
Do not combine a missing tag with a valid commit.

| Native catalog | Source selector | Consumers |
| --- | --- | --- |
| `.claude-plugin/marketplace.json` | Git URL `sha`, with no `ref` | Claude Code, Grok Build, omp |
| `.agents/plugins/marketplace.json` | Git URL `ref` set to the full commit | Codex, Muse Code |
| `.kimi-plugin/marketplace.json` | GitHub commit URL | Kimi Code |

Keep the version in each Claude-compatible catalog entry.
omp uses that field for batch upgrade discovery.
Keep the manifest version and catalog version equal.

## Update the catalogs

Merge the package change before selecting its source revision.
Update the revision, version, and affected metadata in `catalog.json`.
Run these maintenance commands:

```sh
python3 scripts/generate-catalogs.py
python3 scripts/validate-marketplace.py
alint check
```

With GitHub access, add the remote verification:

```sh
python3 scripts/validate-marketplace.py --verify-github
```

This command examines each commit, manifest identity, version, and repository
privacy setting.
It requires access to the private repositories.
Static validation does not establish remote access or installed behavior.

## Native evidence

The 2026-11-20 investigation used isolated repositories and user stores.
Each fixture had an older package commit and a newer default branch.
The fixtures had no release tag.

| Client | Version | Observed result |
| --- | --- | --- |
| Claude Code | 2.1.328 | A Git URL `sha` selected the intended older package. |
| Codex | 0.167.0-alpha.4 | A Git URL `ref` containing the commit selected the older package. |
| Grok Build | 1.0.89 | A Git URL `sha` selected the intended older package. |
| Muse Code | 1.4.24-R9131.1 | A Git URL `ref` containing the commit selected the older package. |

Muse installed the newer branch when the fixture supplied only `sha`.
The shared Codex and Muse catalog therefore uses `ref` with the full commit.
Grok skipped the Claude-compatible GitHub shorthand source in the fixture.
The shared Claude, Grok, and omp catalog therefore uses a Git URL source.
These results establish the exercised source-selection behavior.
They do not establish every workflow, model route, or account permission.

## Primary references

- [Claude marketplace source fields](https://code.claude.com/docs/en/plugins/marketplace-reference)
- [OpenAI plugin and catalog format](https://developers.openai.com/plugins/build/plugins)
- [Grok plugin guide](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/09-plugins.md)
- [Muse marketplaces](https://meta-models.github.io/muse-code-sdk/1.4/guides/plugins/concepts/marketplaces-and-updates/)
- [omp marketplaces](https://github.com/can1357/oh-my-pi/blob/main/docs/marketplace.md)
