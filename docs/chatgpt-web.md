# ChatGPT desktop and web marketplace

## Import

Import this repository through **ChatGPT Admin Console → Plugins → Add → Import marketplace**:

- Source: `https://github.com/tailrocks/tailrocks-skills`
- Path: leave empty
- Branch: `main`

The GitHub account used for the import must be able to read this repository and every source listed in the catalogs. That includes the private `tailrocks/tailrocks-asd-ste100-skills` repository and any required GitHub organization approvals. A ChatGPT workspace admin must perform the import. A personal plan without an eligible workspace does not gain workspace import access from these repository changes.

After import, review each plugin result. Set its workspace installation policy to **Available** or **Installed** for the intended users and enable required apps separately. Repository policy metadata is not applied automatically. Keep daily sync enabled; select **Sync now** after a GitHub change when you need immediate confirmation. Do not delete the marketplace to reconnect GitHub.

Import is a workspace-admin action in Admin Console. After import and workspace
policy allow access, members can find and install eligible plugins from
ChatGPT's Plugins directory on web or desktop. Desktop users do not import a
separate copy of the marketplace. See [OpenAI's GitHub marketplace import
guide](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github)
and [plugin guide](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).

## Source update policy

The ChatGPT-facing Codex catalog uses the `main` branch for every source plugin. OpenAI’s marketplace importer syncs the root marketplace from its selected branch daily; use **Sync now** for an immediate update. Codex therefore follows source branches instead of freezing each plugin commit. Confirm source refresh in the intended workspace after import. The Claude catalog keeps release-tag refs plus commit SHA pins. Claude Code uses the plugin manifest version when one exists, so source branch updates with an unchanged version remain cached. The Kimi catalog remains pinned to immutable GitHub commit URLs.

Review and merge source changes under their normal checks and DCO policy. Claude and Kimi pins advance when the central catalog is deliberately updated; the prior scheduled pin updater was removed when this repository adopted branch-following refs. Run `python3 scripts/generate-catalogs.py` and `python3 scripts/validate-marketplace.py` after catalog edits. Central Alint CI checks marketplace IDs, client-specific refs, generated catalog consistency, and privacy inventory. Each source package CI validates strict JSON, frontmatter/IDs, and bundled links where maintained. `python3 scripts/validate-marketplace.py --verify-github` checks live branch and release refs plus repository visibility when run by a GitHub-authenticated maintainer with access to the private package; CI does not claim credential-free access to the private package.

## ChatGPT desktop and web compatibility

All nine packages have a portable root `plugin.json`, a `skills/` tree, and
skill frontmatter. The audited packages have no `mcp.json` or `.mcp.json` and
no lifecycle hooks, so their manifests do not declare MCP servers or a Desktop
only dependency. Installing these skill-only plugins does not add shell, Git,
`gh`, Bun, Playwright, or Xcode tools. Workflows that need those tools require
a connected app or a suitable execution environment in the ChatGPT surface
being used.

| Plugin | Skills | Tool requirement |
| --- | ---: | --- |
| `tailrocks-skill-authoring-skills` | 4 | Local repository and shell workflows need a connected repository/files tool. |
| `tailrocks-repository-skills` | 7 | Local Git and `gh` operations need connected repository tools; GitHub actions depend on available app access. |
| `tailrocks-typescript-skills` | 12 | Local package management, builds, tests, Playwright, and screenshot baselines need an execution environment. |
| `tailrocks-macos-skills` | 15 | Xcode, macOS application control, and native visual QA are unavailable in ordinary web chats. |
| `tailrocks-roadmap-skills` | 12 | Repository execution and durable project-file access need connected tools. |
| `tailrocks-contribution-skills` | 5 | GitHub operations may be covered by a connected app; local clones and test runs need an execution environment. |
| `tailrocks-code-quality-skills` | 14 | Repository-wide shell, build, and static-analysis procedures need an execution environment. |
| `tailrocks-rust-skills` | 15 | Cargo, Git, local test/build, and native toolchain procedures need an execution environment. |
| `tailrocks-asd-ste100-skill` | 1 | Both writing profiles are packaged; testing bundled private references requires a successful private-repository import. |

The skill counts and structural findings come from the repository audit. They
do not prove that an imported plugin is visible, enabled, invokable, or free of
a **Desktop only** label in a specific workspace. Verify the imported plugins
in ordinary ChatGPT web and desktop chats after import. Do not copy or publish
the private ASD-STE100 reference material as part of that check.
